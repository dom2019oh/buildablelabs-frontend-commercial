import { useState, useRef, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, Loader2, Cloud, BarChart2, Shield, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useProjectMessages } from '@/hooks/useProjectMessages';
import { useAuth } from '@/hooks/useAuth';
import { useBuildableAI } from '@/hooks/useBuildableAI';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useFileVersions } from '@/hooks/useFileVersions';
import {
  useProjectFilesStore,
  generatePreviewHtml,
  compileComponentToHtml,
  compileWorkspaceEntryToHtml,
  compileRouteToHtml,
  stripCodeBlocksFromResponse,
} from '@/stores/projectFilesStore';
import WorkspaceTopBarV2, { type InterfaceMode } from './WorkspaceTopBarV2';
import ChatPanelV2 from './ChatPanelV2';
import LivePreview from './LivePreview';
import WebContainerPreview from './WebContainerPreview';
import FileExplorer from './FileExplorer';
import CodeViewer from './CodeViewer';
import VersionHistoryPanel from './VersionHistoryPanel';
import VersionHistoryView from './VersionHistoryView';
import ThinkingIndicatorV2 from './ThinkingIndicatorV2';
import PipelineProgressBar from './PipelineProgressBar';
import GitHubExportDialog from './GitHubExportDialog';
import BorderGlow from './BorderGlow';
import CardSwap, { Card } from './CardSwap';

import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase';
import {
  collection, query, where, orderBy, limit, getDocs, doc, updateDoc, addDoc, serverTimestamp,
} from 'firebase/firestore';

const BG = '#0e0d12';
const BORDER = 'rgba(255,255,255,0.07)';

export default function ProjectWorkspaceV3() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  // Project data
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);

  // Workspace hook - manages backend workspace and files
  const {
    workspace,
    workspaceId,
    isLoadingWorkspace,
    error: workspaceError,
    files: workspaceFiles,
    isLoadingFiles,
    refetchFiles,
    refresh: refreshWorkspace,
    isGenerating: wsIsGenerating,
    generationStatus,
    liveSession,
    sessions,
  } = useWorkspace(projectId);

  // Messages
  const {
    messages,
    isLoading: isMessagesLoading,
    sendMessage,
  } = useProjectMessages(projectId);

  // Buildable AI - streaming generation with file persistence
  const {
    isGenerating,
    streamingContent,
    phase,
    generatedFiles,
    metadata: aiMetadata,
    generate,
    cancel,
    error: aiError,
    filesDelivered,
  } = useBuildableAI(projectId);

  // Version history
  const {
    versions,
    latestVersion,
    createVersion,
    getVersionByNumber
  } = useFileVersions(projectId);

  // Update project mutation
  const updateProject = useUpdateProject();

  // Project files store (in-memory for UI)
  const {
    fileTree,
    selectedFile,
    setSelectedFile,
    getFile,
    addFile,
    setPreviewHtml,
    previewHtml,
    files,
    clearFiles,
  } = useProjectFilesStore();

  // UI State
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState<InterfaceMode>('preview');
  const [previewMode, setPreviewMode] = useState<'static' | 'sandbox'>('static');
  const [webContainerSupported, setWebContainerSupported] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('/');
  const [previewKey, setPreviewKey] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);
  const [sandboxStatus, setSandboxStatus] = useState<string>('idle');
  const [deviceSize, setDeviceSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const [showHistoryInPreview, setShowHistoryInPreview] = useState(false);
  const [isGitHubExportOpen2, setIsGitHubExportOpen2] = useState(false);
  // Track the placeholder message ID so we can update it on completion
  const [pendingAssistantMsgId, setPendingAssistantMsgId] = useState<string | null>(null);

  // Prevent double-triggering the initial prompt
  const autoStartTriggeredRef = useRef(false);
  // Prevent double-sending the welcome message
  const welcomeSentRef = useRef(false);
  // Stable ref so the auto-start effect can call the handler without it being
  // in the dependency array (handleSendMessage is defined further down).
  const handleSendMessageRef = useRef<((content: string, mode?: 'plan' | 'architect' | 'build') => Promise<void>) | null>(null);

  // =========================================================================
  // CRITICAL: Clear files when switching projects to prevent state leakage
  // =========================================================================
  useEffect(() => {
    clearFiles();
    setPreviewHtml('');
    setCurrentRoute('/');
    setPreviewKey(prev => prev + 1);
    setCurrentVersionNumber(0);
    setActiveMode('preview');
    setPendingAssistantMsgId(null);
    autoStartTriggeredRef.current = false;
    welcomeSentRef.current = false;
  }, [projectId, clearFiles, setPreviewHtml]);

  // =========================================================================
  // AUTO-START: When a new project is opened with an initialPrompt and no
  // AI response yet, automatically trigger generation.
  // Uses a ref so handleSendMessage doesn't need to be in the dep array
  // (it's declared further down in the component).
  // =========================================================================
  useEffect(() => {
    if (autoStartTriggeredRef.current) return;
    if (isProjectLoading || isLoadingWorkspace || isMessagesLoading) return;
    if (!workspaceId) return;
    // Need either an initialPrompt on the project OR an existing user message with no reply
    const prompt = project?.initialPrompt
      || messages.find(m => m.role === 'user')?.content;
    if (!prompt) return;
    const hasAssistantMessage = messages.some(m => m.role === 'assistant' && !m.metadata?.isWelcome);
    if (hasAssistantMessage) return;

    autoStartTriggeredRef.current = true;
    handleSendMessageRef.current?.(prompt);
  }, [isProjectLoading, isLoadingWorkspace, isMessagesLoading, workspaceId, project, messages]);

  // =========================================================================
  // WELCOME MESSAGE: Send a personalized greeting when a fresh workspace
  // opens with no messages (e.g. the user just created a new project).
  // Uses metadata.isWelcome so the auto-start above doesn't mistake it for
  // a real assistant reply and skip the initial generation.
  // =========================================================================
  useEffect(() => {
    if (welcomeSentRef.current) return;
    if (isProjectLoading || isLoadingWorkspace || isMessagesLoading) return;
    if (!workspaceId || !projectId) return;
    if (messages.length > 0) return;

    welcomeSentRef.current = true;
    const name = user?.displayName?.split(' ')[0] || 'there';
    sendMessage.mutate({
      role: 'assistant',
      content: `Hey ${name}! I'm Buildable, your AI Discord bot builder.\n\nDescribe the bot you have in mind and I'll write the Python code, set up the project files, and get everything ready to deploy. You can ask for anything — moderation, music, games, custom commands, or whatever you can imagine.\n\nWhat are we building today?`,
      metadata: { isWelcome: true },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectLoading, isLoadingWorkspace, isMessagesLoading, workspaceId, projectId, messages.length]);

  // =========================================================================
  // SESSION RECOVERY: On mount, check for recent completed sessions whose
  // assistant messages may have been lost (e.g. user refreshed mid-generation)
  // =========================================================================
  useEffect(() => {
    if (!workspaceId || !projectId) return;

    const recoverSession = async () => {
      try {
        // Find any "generating" placeholder messages that never got updated
        const msgsQ = query(
          collection(db, 'projectMessages'),
          where('project_id', '==', projectId),
          where('role', '==', 'assistant'),
          orderBy('created_at', 'desc'),
          limit(5)
        );
        const msgsSnap = await getDocs(msgsQ);
        if (msgsSnap.empty) return;

        for (const msgDoc of msgsSnap.docs) {
          const meta = msgDoc.data().metadata as Record<string, unknown> | null;
          if (meta?.status === 'generating' && meta?.sessionId) {
            // Check if this session actually completed in Firestore
            const sessionsQ = query(
              collection(db, 'generationSessions'),
              where('__name__', '==', meta.sessionId as string),
              limit(1)
            );
            const sessionsSnap = await getDocs(sessionsQ);

            if (!sessionsSnap.empty) {
              const session = sessionsSnap.docs[0].data();
              if (session.status === 'completed' || session.status === 'failed') {
                const content = session.status === 'completed'
                  ? `✅ Generated ${session.files_generated || 0} file(s) successfully.`
                  : `❌ Generation failed. Please try again.`;

                await updateDoc(doc(db, 'projectMessages', msgDoc.id), {
                  content,
                  metadata: {
                    ...meta,
                    status: session.status,
                    filesGenerated: session.files_generated,
                    recovered: true,
                  },
                });
              }
            }
          }
        }
      } catch (e) {
        console.error('[Recovery] Session recovery failed:', e);
      }
    };

    recoverSession();
  }, [workspaceId, projectId]);

  // Pick the best file to compile into a static preview.
  const pickPreviewEntryFile = useCallback(
    (candidateFiles: Array<{ file_path?: string; path?: string; content: string }>) => {
      const normalized = candidateFiles
        .map((f) => ({
          path: f.file_path ?? f.path ?? '',
          content: f.content,
        }))
        .filter((f) => !!f.path);

      const score = (p: string) => {
        const lower = p.toLowerCase();
        if (lower.endsWith('src/pages/index.tsx') || lower.endsWith('src/pages/home.tsx')) return 100;
        if (lower.endsWith('src/pages/dashboard.tsx')) return 90;
        if (lower.includes('/src/pages/')) return 80;
        if (lower.endsWith('app.tsx') || lower.endsWith('index.tsx') || lower.endsWith('page.tsx')) return 70;
        return 10;
      };

      return normalized.sort((a, b) => score(b.path) - score(a.path))[0] ?? null;
    },
    [],
  );

  // Compute available routes from page files dynamically
  const availableRoutes = useMemo(() => {
    const routes = new Set<string>(['/']);

    if (workspaceFiles && workspaceFiles.length > 0) {
      workspaceFiles.forEach(file => {
        const path = file.file_path;
        if (path.includes('/pages/') || path.includes('/routes/')) {
          const match = path.match(/(?:pages|routes)\/([^.]+)/);
          if (match) {
            const routeName = match[1].toLowerCase();
            if (routeName !== 'index' && routeName !== '_app' && routeName !== '_document') {
              routes.add(`/${routeName}`);
            }
          }
        }
      });
    }

    files.forEach((_, filePath) => {
      if (filePath.includes('/pages/') || filePath.includes('/routes/')) {
        const match = filePath.match(/(?:pages|routes)\/([^.]+)/);
        if (match) {
          const routeName = match[1].toLowerCase();
          if (routeName !== 'index' && routeName !== '_app' && routeName !== '_document') {
            routes.add(`/${routeName}`);
          }
        }
      }
    });

    return Array.from(routes).sort();
  }, [workspaceFiles, files]);

  // Prepare workspace files for export
  const exportableFiles = useMemo(() => {
    return Array.from(files.values()).map(f => ({
      path: f.path,
      content: f.content,
    }));
  }, [files]);

  // Sync workspace files to local store
  useEffect(() => {
    if (workspaceFiles && workspaceFiles.length > 0) {
      workspaceFiles.forEach(f => {
        addFile(f.file_path, f.content);
      });

      const entry = pickPreviewEntryFile(workspaceFiles.map(f => ({ file_path: f.file_path, content: f.content })));
      // Only compile web files — skip Python/bot files (they can't be rendered as React)
      if (entry && /\.(tsx?|jsx?|html)$/i.test(entry.path)) {
        const html = compileWorkspaceEntryToHtml(entry.path, workspaceFiles);
        const fullHtml = generatePreviewHtml(html);
        setPreviewHtml(fullHtml);
        setPreviewKey((prev) => prev + 1);
      }
    }
  }, [workspaceFiles, addFile, setPreviewHtml, pickPreviewEntryFile]);

  // Update current version when versions change
  useEffect(() => {
    if (latestVersion > 0) {
      setCurrentVersionNumber(latestVersion);
    }
  }, [latestVersion]);

  // Recompile preview when Zustand store files change during SSE delivery
  const storeFileCount = files.size;
  useEffect(() => {
    if (storeFileCount === 0 || !isGenerating) return;

    const allFiles = Array.from(files.entries()).map(([path, f]) => ({
      file_path: path,
      content: f.content,
    }));

    if (allFiles.length > 0) {
      const entry = pickPreviewEntryFile(allFiles);
      if (entry && /\.(tsx?|jsx?|html)$/i.test(entry.path)) {
        const html = compileWorkspaceEntryToHtml(entry.path, allFiles);
        const fullHtml = generatePreviewHtml(html);
        setPreviewHtml(fullHtml);
        setPreviewKey(prev => prev + 1);
      }
    }
  }, [storeFileCount, isGenerating, files, pickPreviewEntryFile, setPreviewHtml]);

  // Recompile preview when route changes
  useEffect(() => {
    if (!workspaceFiles || workspaceFiles.length === 0) return;

    const html = compileRouteToHtml(
      currentRoute,
      workspaceFiles.map(f => ({ file_path: f.file_path, content: f.content }))
    );
    const fullHtml = generatePreviewHtml(html);
    setPreviewHtml(fullHtml);
    setPreviewKey((prev) => prev + 1);
  }, [currentRoute, workspaceFiles, setPreviewHtml]);

  const handleRefreshPreview = useCallback(() => {
    setPreviewKey((prev) => prev + 1);
  }, []);

  // Main send message handler - uses buildable-generate
  const handleSendMessage = useCallback(async (content: string, mode: 'plan' | 'architect' | 'build' = 'build') => {
    if (!workspaceId) {
      if (isLoadingWorkspace) {
        toast({
          title: 'Loading workspace...',
          description: 'Please wait a moment and try again.',
        });
      } else {
        toast({
          title: 'Workspace not ready',
          description: 'Could not initialize workspace. Try refreshing the page.',
          variant: 'destructive',
        });
      }
      return;
    }

    // 1) Save user message immediately
    await sendMessage.mutateAsync({ content, role: 'user' });

    // Get conversation history
    const history = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Get existing files from workspace
    const existingFiles = workspaceFiles?.map(f => ({
      path: f.file_path,
      content: f.content,
    })) || [];

    // Generate with streaming
    await generate(
      content,
      workspaceId,
      history,
      existingFiles,
      // On chunk
      (chunk, fullContent) => {},
      // On complete
      async (files, metadata) => {
        // Refetch workspace files to get the saved versions
        await refetchFiles();

        // Create version snapshot
        if (files.length > 0) {
          try {
            await createVersion.mutateAsync({
              files,
              previewHtml: previewHtml || undefined,
              label: `AI: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
            });
          } catch (e) {
            console.error('Version creation failed:', e);
          }

          if (projectId && previewHtml) {
            updateProject.mutate({
              id: projectId,
              preview_html: previewHtml,
            });
          }
        }

        // ChatGPT-style: First save the AI's human text response, then the file summary
        const fileNames = files.map(f => f.path);

        // 1) Save AI personalized message FIRST (the human response)
        if (metadata?.aiMessage) {
          await sendMessage.mutateAsync({
            content: metadata.aiMessage as string,
            role: 'assistant',
            metadata: { type: 'ai_response', sessionId: metadata?.sessionId },
          });
        }

        // 2) Then save the file summary below it
        const displayContent = `✅ Created ${files.length} file(s):\n${fileNames.map(f => `• ${f}`).join('\n')}`;
        await sendMessage.mutateAsync({
          content: displayContent,
          role: 'assistant',
          metadata: {
            type: 'file_summary',
            filesCreated: fileNames,
            sessionId: metadata?.sessionId,
            status: 'success',
          },
        });

        // Switch to preview mode
        if (files.length > 0) {
          setActiveMode('preview');
          setSelectedFile(files[0].path);
        }
      },
      // On error
      async (error) => {
        const errorContent = `❌ Error: ${error.message}`;
        await sendMessage.mutateAsync({
          content: errorContent,
          role: 'assistant',
          metadata: { status: 'error', error: error.message },
        });
      },
      mode,
    );
  }, [workspaceId, messages, workspaceFiles, generate, sendMessage, refetchFiles, createVersion, previewHtml, projectId, updateProject, setSelectedFile, toast]);

  // Keep the ref in sync so the auto-start effect (declared above) can call this
  // without a temporal-dead-zone / stale-closure problem.
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleFileSelect = useCallback((file: { path: string }) => {
    setSelectedFile(file.path);
    setActiveMode('code');
  }, [setSelectedFile]);

  const handleFileSave = useCallback(async (newCode: string) => {
    if (!selectedFile) return;

    // 1. Update in-memory Zustand store immediately
    const { updateFile, setPreviewHtml: storeSetPreviewHtml } = useProjectFilesStore.getState();
    updateFile(selectedFile, newCode);

    if (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx')) {
      const compiledHtml = compileComponentToHtml(newCode);
      const previewDoc = generatePreviewHtml(compiledHtml);
      storeSetPreviewHtml(previewDoc);
      handleRefreshPreview();
    }

    // 2. Persist to Firestore workspaceFiles so edits survive page refresh
    if (workspaceId) {
      try {
        const q = query(
          collection(db, 'workspaceFiles'),
          where('workspace_id', '==', workspaceId),
          where('file_path', '==', selectedFile),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, 'workspaceFiles', snap.docs[0].id), {
            content: newCode,
            updated_at: serverTimestamp(),
          });
        } else {
          // File doesn't exist in Firestore yet — create it
          await addDoc(collection(db, 'workspaceFiles'), {
            workspace_id: workspaceId,
            file_path: selectedFile,
            content: newCode,
            file_type: selectedFile.split('.').pop() ?? null,
            is_generated: false,
            updated_at: serverTimestamp(),
          });
        }
      } catch (e) {
        console.error('[FileSave] Failed to persist edit:', e);
      }
    }

    toast({
      title: 'File Saved',
      description: `${selectedFile} has been updated`,
    });
  }, [selectedFile, workspaceId, handleRefreshPreview, toast]);

  const handleUndo = useCallback(() => {
    if (currentVersionNumber > 1) {
      const prevVersion = getVersionByNumber(currentVersionNumber - 1);
      if (prevVersion) handleRestoreVersion(prevVersion);
    }
  }, [currentVersionNumber, getVersionByNumber]);

  const handleRedo = useCallback(() => {
    const nextVersion = getVersionByNumber(currentVersionNumber + 1);
    if (nextVersion) handleRestoreVersion(nextVersion);
  }, [currentVersionNumber, getVersionByNumber]);

  const handleRestoreVersion = useCallback(async (version: {
    version_number: number;
    files: Array<{ path: string; content: string }>;
    preview_html: string | null;
  }) => {
    setIsRestoring(true);
    try {
      clearFiles();
      version.files.forEach(file => addFile(file.path, file.content));

      if (version.preview_html) {
        setPreviewHtml(version.preview_html);
        if (projectId) {
          await updateProject.mutateAsync({
            id: projectId,
            preview_html: version.preview_html,
          });
        }
      }

      setCurrentVersionNumber(version.version_number);
      handleRefreshPreview();
      setIsHistoryOpen(false);

      toast({
        title: '✅ Version Restored',
        description: `Restored to version ${version.version_number}`,
      });
    } catch (error) {
      toast({
        title: 'Restore Failed',
        description: 'Could not restore the selected version',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  }, [clearFiles, addFile, setPreviewHtml, projectId, updateProject, handleRefreshPreview, toast]);

  // Prepare files for WebContainer
  const sandboxFiles = useMemo(() =>
    Array.from(files.values()).map(f => ({
      path: f.path,
      content: f.content,
    })),
  [files]);

  const selectedFileData = selectedFile ? getFile(selectedFile) : null;

  // Combine messages with streaming — filter out the placeholder if we're actively streaming
  const displayMessages = useMemo(() => {
    let allMessages = [...messages];

    // If we're generating and have a placeholder, replace its content with live streaming content
    if (isGenerating && pendingAssistantMsgId) {
      allMessages = allMessages.map(m => {
        if (m.id === pendingAssistantMsgId) {
          return {
            ...m,
            content: streamingContent
              ? stripCodeBlocksFromResponse(streamingContent)
              : `🔄 ${phase.message}`,
          };
        }
        return m;
      });
    } else if (streamingContent && !pendingAssistantMsgId) {
      // Fallback: append streaming as ephemeral message
      allMessages.push({
        id: 'streaming',
        project_id: projectId!,
        user_id: '',
        role: 'assistant' as const,
        content: stripCodeBlocksFromResponse(streamingContent) || `🔄 ${phase.message}`,
        metadata: aiMetadata ? { ...aiMetadata } : {},
        created_at: new Date().toISOString(),
      });
    }
    return allMessages;
  }, [messages, streamingContent, phase.message, projectId, aiMetadata, isGenerating, pendingAssistantMsgId]);

  if (isProjectLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="h-11 border-b px-4 flex items-center gap-4" style={{ borderColor: BORDER }}>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 flex-1 max-w-md" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex-1 flex">
          <div className="w-[400px] border-r p-4" style={{ borderColor: BORDER }}>
            <Skeleton className="h-full" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0e0d12' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>Project not found</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>This project doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: BG }}>
      {/* Top Bar */}
      <WorkspaceTopBarV2
        projectName={project.name}
        projectId={projectId!}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onRefreshPreview={handleRefreshPreview}
        onOpenInNewTab={() => {
          if (project.deployed_url) {
            window.open(project.deployed_url, '_blank');
          } else if (previewHtml) {
            const blob = new Blob([previewHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          } else {
            toast({
              title: 'No preview available',
              description: 'Generate some content first to preview.',
            });
          }
        }}
        onToggleHistory={() => setShowHistoryInPreview(!showHistoryInPreview)}
        onCollapseChat={() => setIsChatCollapsed(!isChatCollapsed)}
        isChatCollapsed={isChatCollapsed}
        previewHtml={previewHtml || ''}
        workspaceFiles={exportableFiles}
      />

      {/* Version History Panel */}
      <VersionHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        versions={versions.map(v => ({
          id: v.id,
          version_number: v.version_number,
          label: v.label,
          files: v.files as Array<{ path: string; content: string }>,
          preview_html: v.preview_html,
          created_at: v.created_at,
        }))}
        currentVersion={currentVersionNumber}
        onPreviewVersion={(version) => {
          if (version.preview_html) {
            setPreviewHtml(version.preview_html);
            setActiveMode('preview');
            handleRefreshPreview();
          }
        }}
        onRestoreVersion={handleRestoreVersion}
        isRestoring={isRestoring}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <AnimatePresence initial={false}>
          {!isChatCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full overflow-hidden flex-shrink-0"
              style={{ borderRight: `1px solid ${BORDER}` }}
            >
              <ChatPanelV2
                messages={displayMessages}
                isLoading={isMessagesLoading}
                isSending={isGenerating}
                isStreaming={isGenerating}
                streamingMetadata={aiMetadata ? {
                  modelUsed: aiMetadata.model,
                  taskType: 'generation'
                } : undefined}
                onSendMessage={handleSendMessage}
                projectName={project.name}
                projectId={projectId!}
                lastError={aiError}
                currentActions={currentActions}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenGitHub={() => setIsGitHubExportOpen2(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Open Chat Button */}
        <AnimatePresence>
          {isChatCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-4 top-20 z-40"
            >
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.72)',
                  fontFamily: "'Geist', 'DM Sans', sans-serif",
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
                onClick={() => setIsChatCollapsed(false)}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <PanelLeft className="h-4 w-4" />
                Open Chat
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Panel */}
        <div className="flex-1 h-full flex" style={{ background: BG }}>
          {activeMode === 'code' ? (
            <>
              {/* File Explorer */}
              <div className="w-60" style={{ borderRight: `1px solid ${BORDER}`, background: BG }}>
                <div className="h-10 flex items-center px-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
                    Explorer
                  </span>
                </div>
                <FileExplorer
                  files={fileTree}
                  selectedFile={selectedFile || undefined}
                  onFileSelect={handleFileSelect}
                  className="h-[calc(100%-40px)]"
                />
              </div>

              {/* Code Viewer */}
              <div className="flex-1 h-full">
                {selectedFileData ? (
                  <CodeViewer
                    code={selectedFileData.content}
                    language={selectedFileData.language}
                    filename={selectedFileData.path}
                    className="h-full"
                    onSave={handleFileSave}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>Select a file to view its contents</p>
                  </div>
                )}
              </div>
            </>
          ) : activeMode === 'cloud' ? (
            <BotCloudPanel workspaceId={workspaceId} projectId={projectId} workspaceFiles={workspaceFiles} projectName={project.name} />
          ) : activeMode === 'analytics' ? (
            <BotAnalyticsPanel sessions={sessions} files={workspaceFiles} />
          ) : activeMode === 'security' ? (
            <BotSecurityPanel workspaceFiles={workspaceFiles} />
          ) : activeMode === 'hosting' ? (
            <BotHostingPanel workspaceId={workspaceId} workspaceStatus={workspace?.status} />
          ) : showHistoryInPreview ? (
            <VersionHistoryView
              versions={versions.map(v => ({
                id: v.id,
                version_number: v.version_number,
                label: v.label,
                files: v.files as Array<{ path: string; content: string }>,
                preview_html: v.preview_html,
                created_at: v.created_at,
              }))}
              currentVersion={currentVersionNumber}
              onPreviewVersion={(version) => {
                if (version.preview_html) {
                  setPreviewHtml(version.preview_html);
                  handleRefreshPreview();
                }
              }}
              onRestoreVersion={handleRestoreVersion}
              isRestoring={isRestoring}
              onClose={() => setShowHistoryInPreview(false)}
            />
          ) : (
            /* Preview Panel */
            <div className="flex-1 h-full flex flex-col" style={{ background: BG }}>
              <div className="h-10 flex items-center justify-between px-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.03.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  <span className="text-sm font-medium">Live Discord Simulator</span>
                </div>
              </div>

              {/* Pipeline Progress Bar */}
              {isGenerating && (
                <div className="px-3 py-2" style={{ borderBottom: `1px solid ${BORDER}`, background: 'rgba(26,26,26,0.95)' }}>
                  <PipelineProgressBar
                    phase={phase}
                    isVisible={true}
                    filesDelivered={filesDelivered}
                  />
                </div>
              )}

              {/* Preview Content */}
              <div className="flex-1 overflow-hidden relative">
                {/* Error banner — sits above content, doesn't replace it */}
                {workspaceError && !isLoadingWorkspace && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', backdropFilter: 'blur(8px)' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,100,100,0.9)', fontFamily: "'Geist','DM Sans',sans-serif" }}>
                      Backend unavailable — server may be starting up
                    </span>
                    <button
                      onClick={() => refreshWorkspace()}
                      style={{ fontSize: '11px', color: 'rgba(255,150,150,0.8)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: "'Geist','DM Sans',sans-serif" }}
                    >
                      Retry
                    </button>
                  </div>
                )}
                {isLoadingWorkspace ? (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: BG }}>
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <p className="text-[13px]" style={{ fontFamily: "'Geist','DM Sans',sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                        Initialising workspace…
                      </p>
                    </div>
                  </div>
                ) : previewHtml ? (
                  <iframe
                    key={previewKey}
                    srcDoc={previewHtml}
                    title="Project Preview"
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts"
                    style={{
                      maxWidth: deviceSize === 'mobile' ? '390px' : deviceSize === 'tablet' ? '768px' : '100%',
                      margin: deviceSize !== 'desktop' ? '0 auto' : undefined,
                    }}
                  />
                ) : isGenerating ? (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: BG }}>
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                      <p className="text-[14px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Generating your bot…</p>
                      <p className="text-[12px] mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>{phase?.message ?? 'This will only take a moment'}</p>
                      <button
                        onClick={() => cancel()}
                        style={{ padding: '6px 18px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Geist','DM Sans',sans-serif" }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <DiscordBotEmptyState workspaceReady={!!workspaceId} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <GitHubExportDialog
        isOpen={isGitHubExportOpen2}
        onClose={() => setIsGitHubExportOpen2(false)}
        projectId={projectId!}
        projectName={project.name}
        files={exportableFiles}
      />
    </div>
  );
}

// ─── Panel card style helper ────────────────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '10px',
  padding: '16px',
};

const PANEL_FONT = "'Geist','DM Sans',sans-serif";

// ─── BotCloudPanel ───────────────────────────────────────────────────────────
function BotCloudPanel({ workspaceId, projectId, workspaceFiles, projectName }: {
  workspaceId?: string | null;
  projectId?: string;
  workspaceFiles?: WorkspaceFile[];
  projectName?: string;
}) {
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [clientId, setClientId] = useState('');
  const [permissions, setPermissions] = useState<Record<number, boolean>>({
    1024: true, 2048: true, 16384: true, 32768: true, 65536: true, 64: true, 8192: false,
  });

  const PERM_LABELS: Record<number, string> = {
    1024: 'Read Messages', 2048: 'Send Messages', 16384: 'Embed Links',
    32768: 'Attach Files', 65536: 'Read History', 64: 'Add Reactions', 8192: 'Manage Messages',
  };

  const permBitmask = Object.entries(permissions)
    .filter(([, v]) => v)
    .reduce((acc, [k]) => acc | Number(k), 0);

  const inviteUrl = clientId.trim()
    ? `https://discord.com/api/oauth2/authorize?client_id=${clientId.trim()}&permissions=${permBitmask}&scope=bot%20applications.commands`
    : '';

  // Extract commands from Python files
  const commands = useMemo(() => {
    const found: string[] = [];
    for (const f of workspaceFiles ?? []) {
      if (!f.file_path.endsWith('.py')) continue;
      const matches1 = [...f.content.matchAll(/@(?:bot|client)\.command\([^)]*\)\s*\nasync def (\w+)/g)];
      for (const m of matches1) if (m[1]) found.push('!' + m[1]);
      const matches2 = [...f.content.matchAll(/name=["'](\w+)["']/g)];
      for (const m of matches2) if (m[1]) found.push('/' + m[1]);
    }
    return [...new Set(found)];
  }, [workspaceFiles]);

  // Load env vars from Firestore projectEnvVars/{projectId}
  useEffect(() => {
    if (!projectId) return;
    getDoc(doc(db, 'projectEnvVars', projectId)).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as Record<string, string>;
        setEnvVars(
          Object.entries(data)
            .filter(([k]) => k !== 'updated_at')
            .map(([key, value]) => ({ key, value: String(value) }))
        );
      }
    }).catch(() => {});
  }, [projectId]);

  return (
    <div className="flex-1 h-full overflow-y-auto" style={{ background: BG, fontFamily: PANEL_FONT }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cloud style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>Cloud Configuration</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Bot settings and environment</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Commands */}
          <div style={CARD_STYLE}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>Commands</p>
            {commands.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {commands.slice(0, 12).map(cmd => (
                  <span key={cmd} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>
                    {cmd}
                  </span>
                ))}
                {commands.length > 12 && (
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>+{commands.length - 12} more</span>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                Generate your bot to see commands here.
              </p>
            )}
          </div>

          {/* Bot Token */}
          <div style={CARD_STYLE}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>Bot Token</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: workspaceId ? '#22c55e' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: workspaceId ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>
                {workspaceId ? 'Token Secured' : 'Not configured'}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
              Your bot token is stored securely on our servers. Never share it publicly.
            </p>
          </div>

          {/* Env Vars */}
          <div style={{ ...CARD_STYLE, gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>Environment Variables</p>
            {envVars.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {envVars.map(v => (
                  <code key={v.key} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {v.key}=<span style={{ color: 'rgba(255,255,255,0.2)' }}>{'•'.repeat(Math.min(v.value.length, 8))}</span>
                  </code>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>No env vars configured. Add them in Bot Settings.</p>
            )}
          </div>

          {/* Discord Invite */}
          <div style={{ ...CARD_STYLE, gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Discord Invite URL</p>
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>Application Client ID</p>
              <input
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                placeholder="Paste your Discord App Client ID"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontFamily: PANEL_FONT, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '6px', marginBottom: '12px' }}>
              {Object.entries(PERM_LABELS).map(([bit, label]) => (
                <label key={bit} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
                  <input
                    type="checkbox"
                    checked={permissions[Number(bit)] ?? false}
                    onChange={e => setPermissions(p => ({ ...p, [Number(bit)]: e.target.checked }))}
                    style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                  {label}
                </label>
              ))}
            </div>
            {inviteUrl ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <code style={{ flex: 1, fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: '4px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inviteUrl}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(inviteUrl)}
                  style={{ padding: '5px 12px', borderRadius: '6px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontSize: '11px', cursor: 'pointer', flexShrink: 0, fontFamily: PANEL_FONT }}
                >
                  Copy
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Enter your Client ID to generate the invite URL.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BotAnalyticsPanel ───────────────────────────────────────────────────────
function BotAnalyticsPanel({ sessions, files }: { sessions?: GenerationSession[]; files?: WorkspaceFile[] }) {
  const totalSessions = sessions?.length ?? 0;
  const completedSessions = sessions?.filter(s => s.status === 'completed').length ?? 0;
  const totalFiles = files?.length ?? 0;
  const successRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : null;
  const lastRun = sessions?.[0]?.created_at
    ? new Date(sessions[0].created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const metrics = [
    { label: 'Generations Run', value: totalSessions > 0 ? String(totalSessions) : '—' },
    { label: 'Files Generated', value: totalFiles > 0 ? String(totalFiles) : '—' },
    { label: 'Success Rate', value: successRate !== null ? `${successRate}%` : '—' },
    { label: 'Last Run', value: lastRun ?? '—' },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto" style={{ background: BG, fontFamily: PANEL_FONT }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="flex items-center gap-3 mb-6">
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>Analytics</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Bot usage and performance stats</p>
          </div>
        </div>

        {totalSessions === 0 && (
          <div style={{ ...CARD_STYLE, textAlign: 'center', padding: '28px 24px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Generate your bot to see analytics here.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {metrics.map(m => (
            <div key={m.label} style={CARD_STYLE}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', letterSpacing: '0.05em' }}>{m.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 600, color: m.value === '—' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)', margin: 0, fontFamily: "'Geist', monospace" }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BotSecurityPanel ────────────────────────────────────────────────────────
function BotSecurityPanel({ workspaceFiles }: { workspaceFiles?: WorkspaceFile[] }) {
  const [scanned, setScanned] = useState(false);

  const pyFiles = (workspaceFiles ?? []).filter(f => f.file_path.endsWith('.py'));

  const issues = useMemo(() => {
    if (!scanned) return [];
    const found: { file: string; issue: string; severity: 'high' | 'medium' | 'low' }[] = [];
    for (const f of pyFiles) {
      if (/\beval\s*\(/.test(f.content)) found.push({ file: f.file_path, issue: 'eval() usage — can execute arbitrary code', severity: 'high' });
      if (/\bexec\s*\(/.test(f.content)) found.push({ file: f.file_path, issue: 'exec() usage detected', severity: 'high' });
      if (/os\.system\s*\(/.test(f.content)) found.push({ file: f.file_path, issue: 'os.system() can run shell commands', severity: 'high' });
      if (/subprocess\./.test(f.content)) found.push({ file: f.file_path, issue: 'subprocess module usage', severity: 'medium' });
      if (/[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}/.test(f.content)) found.push({ file: f.file_path, issue: 'Possible hardcoded Discord token', severity: 'high' });
      if (/\binput\s*\(/.test(f.content)) found.push({ file: f.file_path, issue: 'input() may block the event loop', severity: 'low' });
    }
    return found;
  }, [scanned, pyFiles]);

  const SEV_COLOR = { high: '#f87171', medium: '#fbbf24', low: '#60a5fa' };

  return (
    <div className="flex-1 h-full overflow-y-auto" style={{ background: BG, fontFamily: PANEL_FONT }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="flex items-center gap-3 mb-6">
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>Security</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Static analysis of your bot code</p>
          </div>
        </div>

        <div style={{ ...CARD_STYLE, marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: scanned ? '12px' : 0 }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Security Scan</p>
              {scanned && (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                  Scanned {pyFiles.length} Python file{pyFiles.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {pyFiles.length === 0 ? (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>No Python files yet</span>
            ) : (
              <button
                onClick={() => setScanned(true)}
                style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(37,99,235,0.5)', background: 'transparent', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontFamily: PANEL_FONT }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {scanned ? 'Re-run Scan' : 'Run Scan'}
              </button>
            )}
          </div>

          {scanned && (
            issues.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <Shield style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                <span style={{ fontSize: '13px', color: '#4ade80' }}>All clear — no issues found.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                {issues.map((issue, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: `${SEV_COLOR[issue.severity]}20`, color: SEV_COLOR[issue.severity], fontWeight: 600, flexShrink: 0, marginTop: '1px' }}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <div>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{issue.issue}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily: 'monospace' }}>{issue.file}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div style={{ ...CARD_STYLE, background: 'rgba(37,99,235,0.05)', borderColor: 'rgba(37,99,235,0.15)' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
            Your bot token, API keys, and sensitive config are stored server-side and never exposed to the frontend.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── BotHostingPanel ─────────────────────────────────────────────────────────
function BotHostingPanel({ workspaceId, workspaceStatus }: { workspaceId?: string | null; workspaceStatus?: string | null }) {
  const callbackUrl = workspaceId
    ? `https://api.buildablelabs.dev/bots/${workspaceId}/callback`
    : 'https://api.buildablelabs.dev/bots/{id}/callback';

  const statusDot = workspaceStatus === 'generating' ? '#f59e0b'
    : workspaceStatus === 'ready' ? '#22c55e'
    : workspaceStatus === 'error' ? '#ef4444'
    : 'rgba(255,255,255,0.2)';

  const statusText = workspaceStatus === 'generating' ? 'Generating files…'
    : workspaceStatus === 'ready' ? 'Ready to deploy'
    : workspaceStatus === 'error' ? 'Error — check generation logs'
    : 'Not yet deployed';

  return (
    <div className="flex-1 h-full overflow-y-auto" style={{ background: BG, fontFamily: PANEL_FONT }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="flex items-center gap-3 mb-6">
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>Hosting & Live Info</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Deployment status and endpoints</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={CARD_STYLE}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Bot Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusDot, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{statusText}</span>
            </div>
          </div>

          <div style={CARD_STYLE}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>Webhook / Callback URL</p>
            <code style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '4px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {callbackUrl}
            </code>
          </div>

          <div style={CARD_STYLE}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, margin: 0 }}>
              Once your bot is generated, deploy it to Railway or any Python hosting platform. Use the Railway CLI or connect your GitHub repo for automatic deployments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bot template data for empty state cards ─────────────────────────────────
const BOT_TEMPLATES = [
  {
    emoji: '🎵', name: 'Music Bot',
    description: 'Stream Spotify, YouTube & SoundCloud in voice channels with queue management and voting.',
    tags: ['!play', '!skip', '!queue', '!volume'],
    prompt: 'Build me a music bot with Spotify and queue support',
    color: '#1db954',
  },
  {
    emoji: '🛡️', name: 'Auto-Moderation Bot',
    description: 'Automatically delete spam, filter bad links, issue warnings and timed bans.',
    tags: ['!warn', '!ban', '!mute', 'Auto-filter'],
    prompt: 'Build a moderation bot that auto-bans spammers',
    color: '#ef4444',
  },
  {
    emoji: '👋', name: 'Welcome & Roles Bot',
    description: 'Greet new members, assign self-roles via reactions and track server milestones.',
    tags: ['Auto-DM', 'Role picker', '!roles', 'Milestones'],
    prompt: 'Build a welcome bot with self-role assignment',
    color: '#5865f2',
  },
  {
    emoji: '⚡', name: 'Slash Commands Bot',
    description: 'Modern slash commands with autocomplete, typed arguments and interactive buttons.',
    tags: ['/play', '/ban', '/poll', '/remind'],
    prompt: 'Build a slash commands bot with autocomplete',
    color: '#a78bfa',
  },
  {
    emoji: '🤖', name: 'AI Conversations Bot',
    description: 'Let your server chat with GPT-4 powered AI, with per-user memory and custom personas.',
    tags: ['@mention', '!ask', 'Memory', 'Personas'],
    prompt: 'Build an AI chatbot with GPT-4 and memory',
    color: '#10b981',
  },
  {
    emoji: '🎫', name: 'Support Ticket Bot',
    description: 'Create private ticket channels, ping staff automatically and log full transcripts on close.',
    tags: ['!ticket', '!close', 'Transcripts', 'Staff ping'],
    prompt: 'Build a support ticket bot with transcripts',
    color: '#fbbf24',
  },
  {
    emoji: '🎉', name: 'Giveaway Bot',
    description: 'Run timed giveaways with reaction entry, automatic winner selection and reroll support.',
    tags: ['!gstart', '!gend', '!greroll', 'Timer'],
    prompt: 'Build a giveaway bot with auto-reroll',
    color: '#f59e0b',
  },
  {
    emoji: '✨', name: 'Multi-purpose Bot',
    description: 'All-in-one: moderation, music, leveling, polls, reminders and fully custom commands.',
    tags: ['!level', '!poll', '!remind', '+more'],
    prompt: 'Build a multi-purpose bot for my community',
    color: '#6366f1',
  },
] as const;

// Per-template BorderGlow config
const TEMPLATE_GLOW: Record<string, { hsl: string; colors: string[] }> = {
  '#1db954': { hsl: '142 60 62', colors: ['#1db954', '#34d399', '#38bdf8'] },
  '#ef4444': { hsl: '0 80 62',   colors: ['#ef4444', '#f87171', '#fbbf24'] },
  '#5865f2': { hsl: '235 80 68', colors: ['#5865f2', '#818cf8', '#c084fc'] },
  '#a78bfa': { hsl: '261 85 72', colors: ['#a78bfa', '#c084fc', '#f472b6'] },
  '#10b981': { hsl: '160 72 55', colors: ['#10b981', '#34d399', '#38bdf8'] },
  '#fbbf24': { hsl: '43 90 58',  colors: ['#fbbf24', '#f59e0b', '#f472b6'] },
  '#f59e0b': { hsl: '38 88 54',  colors: ['#f59e0b', '#fbbf24', '#f97316'] },
  '#6366f1': { hsl: '239 80 65', colors: ['#6366f1', '#818cf8', '#a78bfa'] },
};

// ─── Discord helpers (module-level so they're available to all card renders) ──

const _F = "'Geist','DM Sans',sans-serif";
const _MO = 'monospace';
const _D = { bg: '#313338', head: '#2b2d31', text: '#dbdee1', muted: '#80848e', time: '#4e5058', blurple: '#5865f2' };

const _ava = (ch: string, col: string) => (
  <div style={{ width: 26, height: 26, borderRadius: '50%', background: col, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: _F }}>{ch}</div>
);

const _msg = (user: string, isBot: boolean, col: string, content: ReactNode, time = '3:42 PM') => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
    {_ava(user[0].toUpperCase(), isBot ? col : _D.blurple)}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: isBot ? col : '#c9cdfb', fontFamily: _F }}>{user}</span>
        {isBot && <span style={{ fontSize: 7, padding: '1px 4px', background: _D.blurple, borderRadius: 3, color: '#fff', fontWeight: 700, letterSpacing: '0.4px' }}>APP</span>}
        <span style={{ fontSize: 9, color: _D.time, fontFamily: _MO }}>{time}</span>
      </div>
      <div style={{ fontSize: 11, color: _D.text, lineHeight: 1.4, fontFamily: _F }}>{content}</div>
    </div>
  </div>
);

const _emb = (col: string, content: ReactNode) => (
  <div style={{ borderLeft: `3px solid ${col}`, background: 'rgba(0,0,0,0.22)', borderRadius: '0 5px 5px 0', padding: '6px 9px', marginTop: 3 }}>
    {content}
  </div>
);

const _win = (channel: string, content: ReactNode) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: _D.bg }}>
    <div style={{ height: 32, flexShrink: 0, background: _D.head, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>
      <span style={{ color: _D.muted, fontSize: 14, lineHeight: 1 }}>#</span>
      <span style={{ color: '#e0e1e5', fontSize: 12, fontWeight: 600, fontFamily: _F }}>{channel}</span>
    </div>
    <div style={{ flex: 1, overflow: 'hidden', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {content}
    </div>
  </div>
);

const _getVisual = (tpl: typeof BOT_TEMPLATES[number]): ReactNode => {
  const c = tpl.color;
  switch (tpl.emoji) {
    case '🎵': return _win('music-queue', <>
      {_msg('james', false, '', '!play Blinding Lights — The Weeknd', '3:41 PM')}
      {_msg('MusicBot', true, c, _emb(c, <>
        <div style={{ fontSize: 10, fontWeight: 700, color: _D.text, marginBottom: 2, fontFamily: _F }}>▶ Now Playing</div>
        <div style={{ fontSize: 10, color: c, fontWeight: 600, fontFamily: _F }}>Blinding Lights</div>
        <div style={{ fontSize: 9, color: _D.muted, marginBottom: 5, fontFamily: _F }}>The Weeknd · 1:27 / 3:20</div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
          <div style={{ width: '40%', height: '100%', background: c, borderRadius: 2 }} />
        </div>
      </>))}
    </>);

    case '🛡️': return _win('mod-log', <>
      {_msg('AutoMod', true, c, <>
        {[
          { u: 'spammer99', r: 'Spam link detected', a: 'Timed out 1h', ac: '#ef4444' },
          { u: 'bad_user', r: 'Excessive mentions', a: 'Warned (1/3)', ac: '#f59e0b' },
        ].map(({ u, r, a, ac }) => (
          <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: ac, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 600, color: _D.text, fontSize: 10, fontFamily: _F }}>{u} </span>
              <span style={{ color: _D.muted, fontSize: 10, fontFamily: _F }}>— {r}</span>
            </div>
            <span style={{ fontSize: 9, padding: '1px 5px', background: `${ac}22`, color: ac, borderRadius: 3, fontWeight: 600, fontFamily: _F, whiteSpace: 'nowrap' as const }}>{a}</span>
          </div>
        ))}
      </>)}
    </>);

    case '👋': return _win('welcome', <>
      {_msg('WelcomeBot', true, c, _emb(c, <>
        <div style={{ fontSize: 11, fontWeight: 700, color: _D.text, marginBottom: 2, fontFamily: _F }}>👋 Welcome, alex_new!</div>
        <div style={{ fontSize: 9, color: _D.muted, marginBottom: 6, fontFamily: _F }}>You're member #847 · pick your roles</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
          {['🎮 Gaming', '🎵 Music', '💻 Dev'].map(r => (
            <span key={r} style={{ padding: '2px 7px', background: `${c}20`, border: `1px solid ${c}35`, borderRadius: 4, fontSize: 9, color: _D.text, fontFamily: _F }}>{r}</span>
          ))}
        </div>
      </>))}
    </>);

    case '⚡': return _win('commands', <>
      {_msg('james', false, '', <><span style={{ color: _D.blurple, fontWeight: 600 }}>/play</span>{' song: Blinding Lights'}</>)}
      {_msg('SlashBot', true, c, _emb(c, <>
        {([['/ play', 'Play a song in voice'], ['/ skip', 'Skip current track'], ['/ queue', 'View the queue']] as [string, string][]).map(([cmd, desc], i) => (
          <div key={cmd} style={{ display: 'flex', gap: 8, padding: '2px 0', background: i === 0 ? `${c}10` : 'transparent', borderRadius: 3 }}>
            <span style={{ fontSize: 10, color: c, fontWeight: 700, minWidth: 44, fontFamily: _MO }}>{cmd}</span>
            <span style={{ fontSize: 9, color: _D.muted, fontFamily: _F }}>{desc}</span>
          </div>
        ))}
      </>))}
    </>);

    case '🤖': return _win('general', <>
      {_msg('james', false, '', <><span style={{ color: '#949cf7' }}>@BuildableBot</span>{' what\'s Tokyo\'s population?'}</>)}
      {_msg('BuildableBot', true, c, <>
        {'Tokyo is home to '}<strong style={{ color: c }}>37M+ people</strong>{' — world\'s largest metro 🌏'}
      </>)}
    </>);

    case '🎫': return _win('support', <>
      {_msg('sarah_m', false, '', 'I need help accessing my account')}
      {_msg('TicketBot', true, c, _emb(c, <>
        <div style={{ fontSize: 10, fontWeight: 700, color: _D.text, marginBottom: 3, fontFamily: _F }}>🎫 Ticket #0042 opened</div>
        {[['Category', 'Account Access'], ['Channel', '#ticket-0042'], ['ETA', '~2 min']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', gap: 7, marginBottom: 2 }}>
            <span style={{ fontSize: 9, color: _D.muted, minWidth: 48, fontFamily: _F }}>{l}</span>
            <span style={{ fontSize: 9, color: _D.text, fontFamily: _F }}>{v}</span>
          </div>
        ))}
      </>))}
    </>);

    case '🎉': return _win('giveaways', <>
      {_msg('GiveBot', true, c, _emb(c, <>
        <div style={{ fontSize: 11, color: c, fontWeight: 800, textAlign: 'center' as const, marginBottom: 2, fontFamily: _F }}>🎉 GIVEAWAY 🎉</div>
        <div style={{ fontSize: 10, color: _D.text, fontWeight: 600, textAlign: 'center' as const, marginBottom: 6, fontFamily: _F }}>Discord Nitro · 1 Year</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[['23h 59m', 'Ends in'], ['142 🎉', 'Entries'], ['1', 'Winners']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' as const }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: _D.text, fontFamily: _F }}>{v}</div>
              <div style={{ fontSize: 8, color: _D.muted, fontFamily: _F }}>{l}</div>
            </div>
          ))}
        </div>
      </>))}
    </>);

    default: return _win('general', <>
      {_msg('james', false, '', '!level')}
      {_msg('MultiBot', true, c, _emb(c, <>
        <div style={{ fontSize: 11, fontWeight: 700, color: _D.text, marginBottom: 4, fontFamily: _F }}>⭐ james · Level 12</div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 3 }}>
          <div style={{ width: '83%', height: '100%', background: c, borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, color: _D.muted, fontFamily: _F }}>1,240 / 1,500 XP</span>
          <span style={{ fontSize: 9, color: c, fontWeight: 600, fontFamily: _F }}>Rank #3 🏆</span>
        </div>
      </>))}
    </>);
  }
};

// Use first 7 templates for the card swap
const CARD_TEMPLATES = BOT_TEMPLATES.slice(0, 7);

// Card dimensions
const CARD_W = 440;
const CARD_H = 360;

function DiscordBotEmptyState({ workspaceReady }: { workspaceReady: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: BG,
      overflow: 'hidden',
    }}>
      {/* Status pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 32, color: 'rgba(255,255,255,0.32)', fontSize: 12, fontFamily: _F }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: workspaceReady ? '#22c55e' : '#3b82f6',
          boxShadow: `0 0 8px ${workspaceReady ? '#22c55e55' : '#3b82f655'}`,
        }} />
        {workspaceReady ? 'Describe your bot below to get started' : 'Connecting to workspace…'}
      </div>

      {/* CardSwap — centered via flex, position:relative on the wrapper */}
      <div style={{ position: 'relative', width: CARD_W, height: CARD_H, flexShrink: 0 }}>
        <CardSwap
          width={CARD_W}
          height={CARD_H}
          cardDistance={38}
          verticalDistance={22}
          delay={4200}
          pauseOnHover
          skewAmount={3}
          easing="elastic"
        >
          {CARD_TEMPLATES.map(tpl => {
            const c = tpl.color;
            return (
              <Card
                key={tpl.name}
                style={{
                  background: '#181924',
                  border: `1px solid rgba(255,255,255,0.10)`,
                  boxShadow: `0 0 0 1px rgba(0,0,0,0.55), 0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${c}12`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 16,
                }}
              >
                {/* Banner */}
                <div style={{
                  flexShrink: 0, height: 56, padding: '0 14px',
                  display: 'flex', alignItems: 'center', gap: 11,
                  background: `radial-gradient(ellipse at 20% 50%, ${c}28 0%, transparent 55%), linear-gradient(135deg, ${c}0e 0%, rgba(255,255,255,0.02) 100%)`,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.92)', fontFamily: _F, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl.name}</div>
                    <div style={{ fontSize: 9, color: c, fontWeight: 500, fontFamily: _F, opacity: 0.85 }}>Discord Bot</div>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 0.5, 0.25].map((o, i) => (
                      <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: c, opacity: o }} />
                    ))}
                  </div>
                </div>

                {/* Discord window */}
                <div style={{
                  flexShrink: 0, height: 166,
                  margin: '8px 8px 0',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                }}>
                  {_getVisual(tpl)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.72)', fontFamily: _F, lineHeight: 1.5 }}>{tpl.description}</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 7 }}>
                    {tpl.tags.map(tag => (
                      <span key={tag} style={{ padding: '2px 7px', borderRadius: 4, background: `${c}12`, border: `1px solid ${c}25`, fontSize: 10, color: 'rgba(255,255,255,0.65)', fontFamily: _MO }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </CardSwap>
      </div>
    </div>
  );
}
