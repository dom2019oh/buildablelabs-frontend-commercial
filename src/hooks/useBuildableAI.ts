// =============================================================================
// useBuildableAI - SSE-first AI hook with direct Zustand store dispatch
// =============================================================================
// This hook connects to the buildable-generate edge function which:
// 1. Streams SSE events for progressive file delivery
// 2. Dispatches file commands directly to the Zustand store (single source of truth)
// 3. Falls back to JSON parsing for backwards compatibility
// 4. Automatically saves generated files to workspace_files via the backend

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useProjectFilesStore } from '@/stores/projectFilesStore';
import { API_BASE } from '@/lib/urls';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  parseSSEEvent,
  buildContextSummary,
  type SyncEvent,
  type FileEvent,
  type CompleteEvent,
  type StageEvent,
  type ErrorEvent
} from '@/lib/syncEngine';

// =============================================================================
// TYPES
// =============================================================================

export interface GenerationMetadata {
  sessionId: string | null;
  workspaceId: string;
  status: string;
  model: string;
  filesGenerated?: number;
  filePaths?: string[];
  aiMessage?: string;
  routes?: string[];
  suggestions?: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GenerationPhase {
  phase: 'idle' | 'starting' | 'context' | 'intent' | 'planning' | 'generating' | 'validating' | 'repairing' | 'complete' | 'error';
  message: string;
  progress?: number;
}

interface UseBuildableAIState {
  isGenerating: boolean;
  streamingContent: string;
  metadata: GenerationMetadata | null;
  phase: GenerationPhase;
  error: string | null;
  aiMessage: string;
  routes: string[];
  suggestions: string[];
  filesDelivered: number;
}

// Map SSE stage names to phase labels
const STAGE_LABELS: Record<string, { phase: GenerationPhase['phase']; label: string; progress: number }> = {
  context: { phase: 'context', label: 'Analyzing project...', progress: 5 },
  intent: { phase: 'intent', label: 'Understanding your request...', progress: 15 },
  plan: { phase: 'planning', label: 'Planning architecture...', progress: 30 },
  generate: { phase: 'generating', label: 'Generating code...', progress: 50 },
  validate: { phase: 'validating', label: 'Validating code...', progress: 80 },
  repair: { phase: 'repairing', label: 'Fixing issues...', progress: 90 },
};

// =============================================================================
// HOOK
// =============================================================================

export function useBuildableAI(projectId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionUnsubRef = useRef<(() => void) | null>(null);

  const [state, setState] = useState<UseBuildableAIState>({
    isGenerating: false,
    streamingContent: '',
    metadata: null,
    phase: { phase: 'idle', message: '' },
    error: null,
    aiMessage: '',
    routes: ['/'],
    suggestions: [],
    filesDelivered: 0,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (sessionUnsubRef.current) sessionUnsubRef.current();
    };
  }, []);

  // Main generation function
  const generate = useCallback(async (
    prompt: string,
    workspaceId: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    existingFiles: Array<{ path: string; content: string }> = [],
    onChunk?: (chunk: string, fullContent: string) => void,
    onComplete?: (files: GeneratedFile[], metadata: GenerationMetadata | null) => void,
    onError?: (error: Error) => void,
    mode: 'plan' | 'architect' | 'build' = 'build',
  ) => {
    if (!user || !projectId) {
      const error = new Error('Not authenticated');
      onError?.(error);
      return;
    }

    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Get Firebase ID token
    const token = await user.getIdToken();

    // Get store actions for direct dispatch
    const store = useProjectFilesStore.getState();

    // Build context summary from current files for AI context injection
    const contextSummary = buildContextSummary(store.files);

    // Inject context summary into conversation history
    const enhancedHistory = [
      ...conversationHistory,
      { role: 'system', content: `[FILE_CONTEXT]\n${contextSummary}` },
    ];

    // Reset state
    setState({
      isGenerating: true,
      streamingContent: '',
      metadata: null,
      phase: { phase: 'starting', message: 'Starting generation...' },
      error: null,
      aiMessage: '',
      routes: ['/'],
      suggestions: [],
      filesDelivered: 0,
    });

    try {
      const response = await fetch(
        `${API_BASE}/api/generate/${workspaceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            projectId,
            prompt,
            conversationHistory: enhancedHistory,
            existingFiles,
            mode,
          }),
          signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Generation failed' }));
        throw new Error(errorData.error || 'Generation failed');
      }

      const contentType = response.headers.get('content-type') || '';

      // =====================================================================
      // JSON FALLBACK (Railway backend — fire-and-forget pipeline)
      // =====================================================================
      if (contentType.includes('application/json')) {
        const payload = await response.json().catch(() => null) as null | {
          success?: boolean;
          sessionId?: string | null;
          filesGenerated?: number;
          filePaths?: string[];
          modelsUsed?: string[];
          errors?: string[];
          aiMessage?: string;
          message?: string;
        };

        if (!payload?.success) {
          const errMsg = payload?.errors?.join('\n') || 'Generation failed';
          setState(prev => ({
            ...prev,
            isGenerating: false,
            error: errMsg,
            phase: { phase: 'error', message: errMsg },
          }));
          onError?.(new Error(errMsg));
          return;
        }

        const sessionId = payload.sessionId;

        // ── Fire-and-forget: backend started the pipeline, watch Firestore ──
        // If the HTTP response has no filesGenerated, generation is async.
        // Subscribe to the generationSessions document for real completion.
        if (sessionId && (payload.filesGenerated == null || payload.filesGenerated === 0)) {
          setState(prev => ({
            ...prev,
            phase: { phase: 'planning', message: 'Planning architecture...', progress: 20 },
          }));

          if (sessionUnsubRef.current) sessionUnsubRef.current();

          sessionUnsubRef.current = onSnapshot(
            doc(db, 'generationSessions', sessionId),
            (snap) => {
              if (!snap.exists()) return;
              const session = snap.data();
              const status = session.status as string;

              // Update progress phase
              const phaseMap: Record<string, GenerationPhase> = {
                planning:    { phase: 'planning',    message: 'Planning architecture...', progress: 30 },
                scaffolding: { phase: 'planning',    message: 'Setting up structure...',  progress: 45 },
                generating:  { phase: 'generating',  message: 'Writing code...',          progress: 65 },
                validating:  { phase: 'validating',  message: 'Validating code...',       progress: 85 },
              };
              if (phaseMap[status]) {
                setState(prev => ({
                  ...prev,
                  filesDelivered: session.files_generated ?? 0,
                  phase: phaseMap[status],
                }));
              }

              if (status === 'completed' || status === 'failed') {
                if (sessionUnsubRef.current) { sessionUnsubRef.current(); sessionUnsubRef.current = null; }

                const fileCount  = session.files_generated ?? 0;
                const filePaths2 = session.file_paths ?? [];

                const meta: GenerationMetadata = {
                  sessionId,
                  workspaceId,
                  status,
                  model: 'buildable-ai',
                  filesGenerated: fileCount,
                  filePaths: filePaths2,
                  aiMessage: session.ai_message ?? undefined,
                };

                if (status === 'completed') {
                  setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    metadata: meta,
                    filesDelivered: fileCount,
                    streamingContent: session.ai_message ?? '',
                    phase: { phase: 'complete', message: `Generated ${fileCount} file(s)`, progress: 100 },
                    error: null,
                  }));
                  if (fileCount > 0) {
                    toast({ title: '✅ Bot Generated', description: `Created ${fileCount} file(s)` });
                  }
                  onComplete?.(filePaths2.map((p: string) => ({ path: p, content: '' })), meta);
                } else {
                  const errMsg = session.error_message ?? 'Generation failed';
                  setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    error: errMsg,
                    phase: { phase: 'error', message: errMsg },
                  }));
                  toast({ title: 'Generation Failed', description: errMsg, variant: 'destructive' });
                  onError?.(new Error(errMsg));
                }
              }
            },
            (err) => {
              console.error('[useBuildableAI] Firestore session watch error:', err);
              setState(prev => ({ ...prev, isGenerating: false, error: err.message, phase: { phase: 'error', message: err.message } }));
              onError?.(err);
            }
          );

          return; // Stay in isGenerating = true until Firestore resolves
        }

        // ── Synchronous response (backend returned files in the HTTP response) ──
        const filesGenerated = payload.filesGenerated ?? 0;
        const filePaths = payload.filePaths ?? [];
        const metadata: GenerationMetadata = {
          sessionId: sessionId ?? null,
          workspaceId,
          status: 'completed',
          model: 'buildable-ai',
          filesGenerated,
          filePaths,
          aiMessage: payload.aiMessage,
        };
        setState(prev => ({
          ...prev,
          isGenerating: false,
          metadata,
          streamingContent: payload.aiMessage ?? '',
          phase: { phase: 'complete', message: `Generated ${filesGenerated} file(s)`, progress: 100 },
          error: null,
        }));
        if (filesGenerated > 0) {
          toast({ title: '✅ Bot Generated', description: `Created ${filesGenerated} file(s)` });
        }
        onComplete?.(filePaths.map(p => ({ path: p, content: '' })), metadata);
        return;
      }

      // =====================================================================
      // SSE STREAMING (Primary path)
      // =====================================================================
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let deliveredFiles: GeneratedFile[] = [];
      let fileCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process line by line
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;

          const event = parseSSEEvent(line);
          if (!event) continue;

          switch (event.type) {
            case 'stage': {
              const stageEvent = event as StageEvent;
              const stageInfo = STAGE_LABELS[stageEvent.stage];
              if (stageInfo && stageEvent.status === 'start') {
                setState(prev => ({
                  ...prev,
                  phase: {
                    phase: stageInfo.phase,
                    message: stageEvent.message || stageInfo.label,
                    progress: stageInfo.progress,
                  },
                }));
              }
              break;
            }

            case 'file': {
              const fileEvent = event as FileEvent;
              if (fileEvent.path && fileEvent.content) {
                // DIRECT DISPATCH TO ZUSTAND STORE (Single Source of Truth)
                const currentStore = useProjectFilesStore.getState();
                
                if (fileEvent.command === 'DELETE_FILE') {
                  currentStore.removeFile(fileEvent.path);
                } else if (fileEvent.command === 'PATCH_FILE' && fileEvent.patches) {
                  currentStore.patchFile(fileEvent.path, fileEvent.patches);
                } else {
                  // CREATE_FILE or UPDATE_FILE
                  currentStore.addFile(fileEvent.path, fileEvent.content);
                }

                fileCount++;
                deliveredFiles.push({ path: fileEvent.path, content: fileEvent.content });

                setState(prev => ({
                  ...prev,
                  filesDelivered: fileCount,
                  phase: {
                    ...prev.phase,
                    message: `Generated ${fileCount} file(s)...`,
                    progress: Math.min(95, 50 + fileCount * 5),
                  },
                }));
              }
              break;
            }

            case 'complete': {
              const completeEvent = event as CompleteEvent;
              const metadata: GenerationMetadata = {
                sessionId: (completeEvent as any).sessionId ?? null,
                workspaceId,
                status: 'completed',
                model: completeEvent.modelsUsed?.join(' → ') || 'unknown',
                filesGenerated: completeEvent.filesGenerated,
                filePaths: completeEvent.filePaths,
                aiMessage: completeEvent.aiMessage,
                routes: completeEvent.routes,
                suggestions: completeEvent.suggestions,
              };

              setState(prev => ({
                ...prev,
                isGenerating: false,
                metadata,
                aiMessage: completeEvent.aiMessage || '',
                routes: completeEvent.routes || ['/'],
                suggestions: completeEvent.suggestions || [],
                streamingContent: completeEvent.aiMessage || '',
                phase: {
                  phase: 'complete',
                  message: `Generated ${completeEvent.filesGenerated} file(s)`,
                  progress: 100,
                },
              }));

              if (completeEvent.filesGenerated > 0) {
                toast({
                  title: '✅ Generation Complete',
                  description: `Created ${completeEvent.filesGenerated} file(s)`,
                });
              }

              onComplete?.(deliveredFiles, metadata);
              break;
            }

            case 'error': {
              const errorEvent = event as ErrorEvent;
              setState(prev => ({
                ...prev,
                isGenerating: false,
                error: errorEvent.message,
                phase: { phase: 'error', message: errorEvent.message },
              }));

              toast({
                title: 'Generation Failed',
                description: errorEvent.message,
                variant: 'destructive',
              });

              onError?.(new Error(errorEvent.message));
              break;
            }
          }
        }
      }

      // If we didn't get a complete event, finalize
      setState(prev => {
        if (prev.phase.phase !== 'complete' && prev.phase.phase !== 'error') {
          return {
            ...prev,
            isGenerating: false,
            phase: { phase: 'complete', message: `Generated ${fileCount} file(s)`, progress: 100 },
          };
        }
        return prev;
      });

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setState(prev => ({ ...prev, isGenerating: false, phase: { phase: 'idle', message: '' } }));
        return;
      }

      console.error('Buildable AI Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
        phase: { phase: 'error', message: errorMessage },
      }));

      if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
        toast({
          title: 'Rate Limit Reached',
          description: 'Please wait a moment before trying again.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('credits') || errorMessage.includes('402')) {
        toast({
          title: 'Insufficient Credits',
          description: 'Please add credits to continue.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [user, projectId, toast]);

  // Cancel generation
  const cancel = useCallback(() => {
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    if (sessionUnsubRef.current) { sessionUnsubRef.current(); sessionUnsubRef.current = null; }
    setState(prev => ({
      ...prev,
      isGenerating: false,
      phase: { phase: 'idle', message: '' },
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      streamingContent: '',
      metadata: null,
      phase: { phase: 'idle', message: '' },
      error: null,
      aiMessage: '',
      routes: ['/'],
      suggestions: [],
      filesDelivered: 0,
    });
  }, []);

  return {
    ...state,
    generate,
    cancel,
    reset,
    // Backwards compat - files are now in Zustand store directly
    generatedFiles: [] as GeneratedFile[],
  };
}
