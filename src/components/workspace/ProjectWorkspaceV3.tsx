import { useState, useRef, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Cloud, BarChart2, Shield, Server, Music, UserPlus, Zap, Bot, Ticket, Gift, LayoutGrid, Code2, MessageSquare, History, Github, ChevronDown, ChevronRight, Globe, FileText, MoreHorizontal, Monitor, ExternalLink, RefreshCw, PanelLeft, KeyRound, Square, Terminal, RotateCw, Copy, LayoutDashboard, Settings, Trash2, Check, Lock, ScrollText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useProjectMessages } from '@/hooks/useProjectMessages';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useBuildableAI } from '@/hooks/useBuildableAI';
import { useWorkspace, type WorkspaceFile, type GenerationSession } from '@/hooks/useWorkspace';
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
import GitHubExportDialog from './GitHubExportDialog';
import BorderGlow from './BorderGlow';
import CodeEditorTab from './CodeEditorTab';

import { Skeleton } from '@/components/ui/skeleton';
import { db, auth } from '@/lib/firebase';
import { API_BASE } from '@/lib/urls';
import {
  collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc, addDoc, serverTimestamp,
} from 'firebase/firestore';

const BG = '#0e0d12';
const BORDER = 'rgba(255,255,255,0.07)';

export default function ProjectWorkspaceV3() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentPlanType } = useCredits();
  const isFree = currentPlanType === 'free';

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

  // Tab ID ↔ URL view name mapping
  const TAB_VIEW_MAP: Record<string, string> = {
    preview: 'simulator', code: 'codeEditor', files: 'files',
    cloud: 'cloud', analytics: 'analytics', hosting: 'hosting', security: 'security',
  };
  const VIEW_TAB_MAP: Record<string, InterfaceMode | 'files'> = Object.fromEntries(
    Object.entries(TAB_VIEW_MAP).map(([k, v]) => [v, k as InterfaceMode | 'files'])
  );

  // UI State
  const [prefillPrompt, setPrefillPrompt] = useState<string | undefined>();
  const initialView = searchParams.get('view');
  const initialMode = (initialView && VIEW_TAB_MAP[initialView]) ?? 'preview';
  const TAB_IDS = ['preview', 'code', 'files', 'cloud', 'analytics', 'hosting', 'security'];
  const [activeMode, setActiveModeState] = useState<InterfaceMode | 'files'>(initialMode as InterfaceMode | 'files');
  const slideDirRef = useRef<1 | -1>(1); // 1 = slide left→right (new tab is to the right), -1 = right→left

  const setActiveMode = useCallback((mode: InterfaceMode | 'files') => {
    setActiveModeState(prev => {
      const prevIdx = TAB_IDS.indexOf(prev);
      const nextIdx = TAB_IDS.indexOf(mode);
      slideDirRef.current = nextIdx >= prevIdx ? 1 : -1;
      return mode;
    });
    const viewName = TAB_VIEW_MAP[mode] ?? mode;
    setSearchParams(prev => { const next = new URLSearchParams(prev); next.set('view', viewName); return next; }, { replace: true });
  }, [setSearchParams]);
  // Resizable chat sidebar
  const [chatWidth, setChatWidth] = useState(380);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(380);
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
  const [isChatting, setIsChatting] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'running' | 'stopped' | 'error'>('idle');
  const deployPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track the placeholder message ID so we can update it on completion
  const [pendingAssistantMsgId, setPendingAssistantMsgId] = useState<string | null>(null);
  // Project name dropdown
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  // Cloud enable modal
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [cloudEnabledOverride, setCloudEnabledOverride] = useState(false);

  // Prevent double-sending the welcome message
  const welcomeSentRef = useRef(false);

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
    welcomeSentRef.current = false;
  }, [projectId, clearFiles, setPreviewHtml]);

  // Global drag listeners for resizable chat sidebar
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = e.clientX - dragStartXRef.current;
      const next = Math.min(Math.max(dragStartWidthRef.current + delta, 260), 680);
      setChatWidth(next);
    };
    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // AUTO-START REMOVED — nothing fires without explicit user input.
  // initialPrompt is pre-filled into the prompt bar instead (see prefillPrompt below).

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
    // If there's an initialPrompt, auto-start will fire and Buildable greets through the chat layer
    if (project?.initialPrompt) return;

    welcomeSentRef.current = true;
    const name = user?.displayName?.split(' ')[0] || 'there';
    sendMessage.mutate({
      role: 'assistant',
      content: `Hey ${name}! I'm Buildable, your AI Discord bot builder.\n\nDescribe the bot you have in mind and I'll write the Python code, set up the project files, and get everything ready to deploy. You can ask for anything — moderation, music, games, custom commands, or whatever you can imagine.\n\nWhat are we building today?`,
      metadata: { isWelcome: true },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectLoading, isLoadingWorkspace, isMessagesLoading, workspaceId, projectId, project?.initialPrompt, messages.length]);

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
            const sessionSnap = await getDoc(doc(db, 'generationSessions', meta.sessionId as string));

            if (sessionSnap.exists()) {
              const session = sessionSnap.data();
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

  // Main send message handler
  const handleSendMessage = useCallback(async (content: string, mode: 'plan' | 'architect' | 'build' = 'build') => {
    if (!workspaceId) {
      if (isLoadingWorkspace) {
        toast({ title: 'Loading workspace...', description: 'Please wait a moment and try again.' });
      } else {
        toast({ title: 'Workspace not ready', description: 'Could not initialize workspace. Try refreshing the page.', variant: 'destructive' });
      }
      return;
    }

    // 1) Save user message immediately
    await sendMessage.mutateAsync({ content, role: 'user' });

    const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    const existingFiles = workspaceFiles?.map(f => ({ path: f.file_path, content: f.content })) || [];

    // Helper: run the code generation pipeline
    const runGenerate = async (buildPrompt: string) => {
      // Switch to Code tab immediately so files appear live as they stream in
      setActiveMode('code');

      const tGenStart = Date.now();
      await generate(
        buildPrompt,
        workspaceId,
        history,
        existingFiles,
        (_chunk, _full) => {},
        async (files, metadata) => {
          const durationMs = Date.now() - tGenStart;
          await refetchFiles();
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
              updateProject.mutate({ id: projectId, preview_html: previewHtml });
            }
          }
          const fileNames = files.map(f => f.path);
          if (metadata?.aiMessage) {
            await sendMessage.mutateAsync({
              content: metadata.aiMessage as string,
              role: 'assistant',
              metadata: { type: 'ai_response', sessionId: metadata?.sessionId },
            });
          }
          await sendMessage.mutateAsync({
            content: `${files.length} files generated`,
            role: 'assistant',
            metadata: { type: 'file_summary', filesCreated: fileNames, sessionId: metadata?.sessionId, status: 'success', durationMs, creditsUsed: 2 },
          });
          // Open the main entry point (main.py / bot.py / index.js) in the editor
          if (files.length > 0) {
            const entryFile = files.find(f =>
              f.path === 'main.py' || f.path === 'bot.py' ||
              f.path === 'src/index.js' || f.path === 'src/index.ts'
            ) ?? files[0];
            setActiveMode('code');
            setSelectedFile(entryFile.path);
          }
        },
        async (error) => {
          await sendMessage.mutateAsync({
            content: error.message,
            role: 'assistant',
            metadata: { status: 'error', error: error.message },
          });
        },
        mode,
      );
    };

    // For plan/architect modes, skip the chat layer — go straight to generation
    if (mode === 'plan' || mode === 'architect') {
      await runGenerate(content);
      return;
    }

    // 2) Call Buildable's chat layer — it decides intent before anything is built
    try {
      setIsChatting(true);
      const tChatStart = Date.now();
      const token = await auth.currentUser?.getIdToken();
      const chatRes = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId,
          message: content,
          conversationHistory: history,
        }),
      });

      if (!chatRes.ok) throw new Error(`Chat API error: ${chatRes.status}`);
      const chatData = await chatRes.json() as { message: string; intent: string; buildPrompt?: string };
      const chatDurationMs = Date.now() - tChatStart;

      setIsChatting(false);
      // 3) Save Buildable's conversational response
      await sendMessage.mutateAsync({
        content: chatData.message,
        role: 'assistant',
        metadata: { type: 'chat_response', intent: chatData.intent, durationMs: chatDurationMs, creditsUsed: 0 },
      });

      // 4) If Buildable decided it has enough info — check credentials, then build
      if (chatData.intent === 'ready_to_build' && chatData.buildPrompt) {
        if (projectId && !cloudEnabledOverride) {
          try {
            const envSnap = await getDoc(doc(db, 'projectEnvVars', projectId));
            const hasToken = envSnap.exists() && !!(envSnap.data() as Record<string, string>).DISCORD_TOKEN;
            if (!hasToken) {
              await sendMessage.mutateAsync({
                content: `I'm ready to build! Before I start, I'll need your Discord Application credentials so I can deploy the bot when the code is done.\n\nHead to the **Cloud** tab and click **Enable Cloud** to add your Bot Token and Guild ID — it only takes a moment. Come back here once you're done.`,
                role: 'assistant',
                metadata: { type: 'system', source: 'cloud_gate' },
              });
              setActiveMode('cloud');
              return;
            }
          } catch { /* Firestore unreachable — let through */ }
        }
        await runGenerate(chatData.buildPrompt);
      }
    } catch (error) {
      setIsChatting(false);
      console.error('Chat error:', error);
      // Fallback: go straight to generation if chat layer fails
      await runGenerate(content);
    }
  }, [workspaceId, isLoadingWorkspace, messages, workspaceFiles, generate, sendMessage, refetchFiles, createVersion, previewHtml, projectId, updateProject, setSelectedFile, toast]);


  // =========================================================================
  // AUTO-START: When a project arrives from the Dashboard with an initialPrompt
  // and no messages yet, fire it as if the user pressed Send.
  // =========================================================================
  const autoStartFiredRef = useRef(false);
  useEffect(() => {
    if (autoStartFiredRef.current) return;
    if (isProjectLoading || isLoadingWorkspace || isMessagesLoading) return;
    if (!workspaceId || !projectId) return;
    if (!project?.initialPrompt) return;
    if (messages.length > 0) return;

    autoStartFiredRef.current = true;
    handleSendMessage(project.initialPrompt, project.initialMode ?? 'build');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectLoading, isLoadingWorkspace, isMessagesLoading, workspaceId, projectId, project?.initialPrompt, messages.length]);

  // =========================================================================
  // LIVE CODE VIEWER: As files arrive from Firestore during generation,
  // auto-select the entry point so the user sees code appear in real time.
  // =========================================================================
  const liveFileShownRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isGenerating || !workspaceFiles || workspaceFiles.length === 0) return;
    const entryFile = workspaceFiles.find(f =>
      f.file_path === 'main.py' || f.file_path === 'bot.py' ||
      f.file_path === 'src/index.js' || f.file_path === 'src/index.ts'
    ) ?? workspaceFiles[0];
    if (liveFileShownRef.current === entryFile.file_path) return;
    liveFileShownRef.current = entryFile.file_path;
    setSelectedFile(entryFile.file_path);
  }, [isGenerating, workspaceFiles, setSelectedFile]);

  const handleDeploy = useCallback(async () => {
    if (!workspaceId) return;
    if (deployStatus === 'deploying') return;

    // Token gate — only enforced at deploy time, not during chat/generation
    if (projectId && !cloudEnabledOverride) {
      try {
        const envSnap = await getDoc(doc(db, 'projectEnvVars', projectId));
        const hasToken = envSnap.exists() && !!(envSnap.data() as Record<string, string>).DISCORD_TOKEN;
        if (!hasToken) {
          toast({ title: 'Cloud not enabled', description: 'Add your Bot Token in the Cloud tab before deploying.', variant: 'destructive' });
          setActiveMode('cloud');
          return;
        }
      } catch { /* unreachable — let deploy attempt fail naturally */ }
    }

    setDeployStatus('deploying');
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_BASE}/api/deploy/${workspaceId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Poll status until running or error
      if (deployPollRef.current) clearInterval(deployPollRef.current);
      deployPollRef.current = setInterval(async () => {
        try {
          const token2 = await auth.currentUser?.getIdToken();
          const res = await fetch(`${API_BASE}/api/deploy/${workspaceId}/status`, {
            headers: { Authorization: `Bearer ${token2}` },
          });
          const data = await res.json() as { status: string };
          if (data.status === 'running' || data.status === 'error' || data.status === 'stopped') {
            setDeployStatus(data.status as typeof deployStatus);
            if (deployPollRef.current) clearInterval(deployPollRef.current);
            if (data.status === 'running') {
              toast({ title: 'Bot is live', description: 'Your Discord bot is now running.' });
              setActiveMode('hosting');
            } else if (data.status === 'error') {
              toast({ title: 'Deploy failed', description: 'Check the Hosting tab for details.', variant: 'destructive' });
              setActiveMode('hosting');
            }
          }
        } catch { /* ignore poll errors */ }
      }, 3000);
    } catch (err) {
      setDeployStatus('error');
      toast({ title: 'Deploy failed', description: 'Could not reach deploy service.', variant: 'destructive' });
    }
  }, [workspaceId, deployStatus, toast, setActiveMode]);

  // Close project dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStop = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_BASE}/api/deploy/${workspaceId}/stop`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      setDeployStatus('stopped');
    } catch {
      toast({ title: 'Stop failed', variant: 'destructive' });
    }
  }, [workspaceId, toast]);

  const handleRestart = useCallback(async () => {
    if (!workspaceId) return;
    setDeployStatus('deploying');
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${API_BASE}/api/deploy/${workspaceId}/restart`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      if (deployPollRef.current) clearInterval(deployPollRef.current);
      deployPollRef.current = setInterval(async () => {
        try {
          const t2 = await auth.currentUser?.getIdToken();
          const res = await fetch(`${API_BASE}/api/deploy/${workspaceId}/status`, { headers: { Authorization: `Bearer ${t2}` } });
          const data = await res.json() as { status: string };
          if (data.status === 'running' || data.status === 'error' || data.status === 'stopped') {
            setDeployStatus(data.status as typeof deployStatus);
            if (deployPollRef.current) clearInterval(deployPollRef.current);
          }
        } catch { /* ignore */ }
      }, 3000);
    } catch {
      setDeployStatus('error');
      toast({ title: 'Restart failed', variant: 'destructive' });
    }
  }, [workspaceId, deployStatus, toast]);

  const handleCloudEnabled = useCallback(async () => {
    setShowCloudModal(false);
    setCloudEnabledOverride(true);
    if (!projectId || !user?.uid) return;
    await addDoc(collection(db, 'projectMessages'), {
      project_id: projectId,
      user_id: user.uid,
      role: 'assistant',
      content: `Buildable Cloud is now enabled! Your bot is ready to deploy.\n\nYou now have access to:\n\n**Bot Hosting** — Runs 24/7 on dedicated Oracle Cloud infrastructure. Zero downtime.\n**Auto-restart & crash recovery** — Crashes are detected and fixed automatically. Your bot stays online.\n**Secure credential storage** — Your bot token is encrypted at rest and never exposed to the public.\n\nHead to the **Hosting** tab to go live.`,
      metadata: { type: 'system', source: 'cloud_enabled' },
      created_at: serverTimestamp(),
    });
  }, [projectId, user]);

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
      <div style={{ display: 'flex', height: '100vh', background: BG, overflow: 'hidden' }}>
        <div style={{ width: 256, flexShrink: 0, height: '100vh', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton className="h-6 w-16 mb-4" />
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <Skeleton className="h-full w-full rounded-[14px]" />
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

  const F = "'Geist', 'DM Sans', sans-serif";
  const userInitial = (user?.displayName || user?.email || 'U')[0].toUpperCase();

  const DiscordTabIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.03.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  );

  const TABS: { id: InterfaceMode | 'files'; label: string; Icon: React.ElementType }[] = [
    { id: 'preview',   label: 'Simulator', Icon: DiscordTabIcon },
    { id: 'code',      label: 'Code',      Icon: Code2 },
    { id: 'files',     label: 'Files',     Icon: FileText },
    { id: 'cloud',     label: 'Cloud',     Icon: Cloud },
    { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
    { id: 'hosting',   label: 'Hosting',   Icon: Server },
    { id: 'security',  label: 'Security',  Icon: Shield },
  ];

  const IBtn = ({ icon: Icon, title, onClick }: { icon: React.ElementType; title?: string; onClick?: () => void }) => (
    <button onClick={onClick} title={title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
    >
      <Icon style={{ width: 15, height: 15 }} />
    </button>
  );

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0c0c0c', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Bar ── */}
      <div style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 4, flexShrink: 0, position: 'relative' }}>

        {/* Left: Logo + Project name dropdown */}
        <div ref={projectDropdownRef} style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8, minWidth: 0, position: 'relative' }}>
          <img src="/logo-stack-white.svg" style={{ width: 26, height: 26, flexShrink: 0 }} alt="Buildable" />
          <button
            onClick={() => setShowProjectDropdown(v => !v)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 5, minWidth: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontFamily: F, whiteSpace: 'nowrap' }}>
              {project.name}
              <ChevronDown style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.35)', flexShrink: 0, transform: showProjectDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.28)', fontFamily: F }}>Previewing last saved version</div>
          </button>
          {/* Dropdown menu */}
          {showProjectDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, minWidth: 180, zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
              {[
                { icon: LayoutDashboard, label: 'Go to Dashboard', action: () => { navigate('/dashboard'); setShowProjectDropdown(false); } },
                { icon: Settings, label: 'Bot Settings', action: () => { navigate(`/dashboard/project/${projectId}/settings`); setShowProjectDropdown(false); } },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: F, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                  {label}
                </button>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '2px 0' }} />
              <button onClick={() => { setShowProjectDropdown(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'transparent', border: 'none', color: '#f87171', fontSize: 12, fontFamily: F, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Trash2 style={{ width: 13, height: 13, flexShrink: 0 }} />
                Delete Bot
              </button>
            </div>
          )}
        </div>

        {/* Centre: tabs — absolutely centred */}
        <div style={{ position: 'absolute', left: '46%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 1 }}>
          {TABS.map((tab) => {
            const isActive = activeMode === tab.id;
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id)}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 11px',
                  borderRadius: 6,
                  background: 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.38)',
                  fontSize: 13, fontWeight: isActive ? 500 : 400,
                  border: '1px solid transparent',
                  cursor: 'pointer', fontFamily: F, flexShrink: 0,
                  transition: 'color 0.15s',
                  zIndex: 0,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
              >
                {/* Sliding active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.8 }}
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: 6,
                      background: '#2563eb',
                      border: '1px solid rgba(255,255,255,0.22)',
                      zIndex: -1,
                    }}
                  />
                )}
                <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0, width: isActive ? 'auto' : 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block' }}
                >
                  {tab.label}
                </motion.span>
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {/* Share */}
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: F }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.11)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{userInitial}</div>
            Share
          </button>

          {/* Upgrade */}
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 6, background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', fontFamily: F }}
            onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
          >
            <Zap style={{ width: 13, height: 13 }} />
            Upgrade
          </button>

          {/* Launch / status */}
          <button
            onClick={handleDeploy}
            disabled={deployStatus === 'deploying'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 13px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.18)', cursor: deployStatus === 'deploying' ? 'default' : 'pointer', fontFamily: F,
              background: deployStatus === 'running' ? '#16a34a' : deployStatus === 'error' ? '#dc2626' : deployStatus === 'deploying' ? '#1d4ed8' : '#2563eb',
              color: '#fff', opacity: deployStatus === 'deploying' ? 0.75 : 1,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (deployStatus !== 'deploying') e.currentTarget.style.background = deployStatus === 'running' ? '#15803d' : deployStatus === 'error' ? '#b91c1c' : '#1d4ed8'; }}
            onMouseLeave={e => { if (deployStatus !== 'deploying') e.currentTarget.style.background = deployStatus === 'running' ? '#16a34a' : deployStatus === 'error' ? '#dc2626' : '#2563eb'; }}
          >
            {deployStatus === 'deploying' && <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />}
            {deployStatus === 'running' ? 'Live' : deployStatus === 'error' ? 'Failed' : deployStatus === 'deploying' ? 'Deploying…' : 'Launch'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left — chat panel */}
        <div style={{ width: 460, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ChatPanelV2
            messages={messages}
            isLoading={isMessagesLoading}
            isSending={isGenerating}
            isChatting={isChatting}
            isStreaming={isGenerating}
            onSendMessage={handleSendMessage}
            projectName={project?.name ?? ''}
            projectId={projectId ?? ''}
            lastError={aiError}
            currentActions={currentActions}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenGitHub={() => setIsGitHubExportOpen2(true)}
            prefillPrompt={messages.length === 0 ? (project?.initialPrompt ?? prefillPrompt) : prefillPrompt}
            phase={phase}
            filesDelivered={filesDelivered}
            filePaths={generatedFiles.map(f => f.path)}
            onCancel={cancel}
          />
        </div>
        {/* Right — floating card */}
        <div style={{ flex: 1, padding: '0 12px 12px 0', overflow: 'hidden' }}>
          <div style={{
            width: '100%', height: '100%',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <AnimatePresence mode="wait" custom={slideDirRef.current}>
              <motion.div
                key={activeMode}
                custom={slideDirRef.current}
                initial={{ x: slideDirRef.current * 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slideDirRef.current * -24, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                {activeMode === 'code' && (
                  <CodeEditorTab
                    workspaceFiles={workspaceFiles?.map(f => ({ file_path: f.file_path, content: f.content })) ?? []}
                    isFree={isFree}
                  />
                )}
                {activeMode === 'cloud' && (
                  <BotCloudPanel
                    workspaceId={workspaceId}
                    projectId={projectId}
                    workspaceFiles={workspaceFiles}
                    projectName={project?.name}
                    onRequestEnableCloud={() => setShowCloudModal(true)}
                    cloudEnabledOverride={cloudEnabledOverride}
                  />
                )}
                {activeMode === 'analytics' && (
                  <BotAnalyticsPanel sessions={sessions} files={workspaceFiles} />
                )}
                {activeMode === 'security' && (
                  <BotSecurityPanel workspaceFiles={workspaceFiles} />
                )}
                {activeMode === 'hosting' && (
                  <BotHostingPanel
                    workspaceId={workspaceId}
                    deployStatus={deployStatus}
                    onDeploy={handleDeploy}
                    onStop={handleStop}
                    onRestart={handleRestart}
                  />
                )}
                {activeMode === 'files' && (
                  <PlaceholderPanel icon={FileText} label="Files" description="File manager coming soon." />
                )}
                {activeMode === 'preview' && (
                  <PlaceholderPanel icon={DiscordTabIcon} label="Discord Simulator" description="Live Discord simulator coming soon." />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {showCloudModal && (
        <CloudEnableModal
          projectId={projectId}
          onClose={() => setShowCloudModal(false)}
          onEnabled={handleCloudEnabled}
        />
      )}
    </div>
  );
}

// ─── PlaceholderPanel ────────────────────────────────────────────────────────
function PlaceholderPanel({ icon: Icon, label, description }: { icon: React.ElementType; label: string; description: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 }}>
      <Icon style={{ width: 28, height: 28, color: 'rgba(255,255,255,0.18)' }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.55)', fontFamily: "'Geist','DM Sans',sans-serif" }}>{label}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: "'Geist','DM Sans',sans-serif", textAlign: 'center', maxWidth: 260 }}>{description}</span>
    </div>
  );
}

// ─── CloudEnableModal ─────────────────────────────────────────────────────────
function CloudEnableModal({ projectId, onClose, onEnabled }: {
  projectId?: string;
  onClose: () => void;
  onEnabled: () => void;
}) {
  const { user } = useAuth();
  const [botToken, setBotToken] = useState('');
  const [clientId, setClientId] = useState('');
  const [guildId, setGuildId] = useState('');
  const [tokenVisible, setTokenVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAllow = async () => {
    if (!projectId || !botToken.trim()) return;
    setSaving(true);
    try {
      const ref = doc(db, 'projectEnvVars', projectId);
      const payload: Record<string, string> = { DISCORD_TOKEN: botToken, CLIENT_ID: clientId, updated_at: new Date().toISOString() };
      if (guildId.trim()) payload.GUILD_ID = guildId.trim();
      await setDoc(ref, payload, { merge: true });
    } catch (e) {
      console.error('Failed to save credentials:', e);
    }
    setSaving(false);
    onEnabled();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: '100%', maxWidth: '460px', margin: '0 16px', background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden', fontFamily: "'Geist','DM Sans',sans-serif" }}>
        {/* Title bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo-stack-white.svg" style={{ width: 20, height: 20, opacity: 0.9 }} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Enable Cloud</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 20px 20px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '18px', lineHeight: 1.6 }}>
            Connect your Discord Application. Buildable handles hosting, restarts, and deployment automatically.
          </p>

          {/* Features */}
          {[
            { icon: '▣', title: 'Always-on bot hosting', desc: '24/7 uptime on dedicated Oracle Cloud infrastructure. No cold starts.' },
            { icon: '↻', title: 'Auto-restart & crash recovery', desc: 'Crashes detected and fixed automatically. Your bot stays online.' },
            { icon: '⚡', title: 'One-click deploy', desc: 'Push changes live from the Hosting tab. Zero DevOps.' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                {f.icon}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: '0 0 2px' }}>{f.title}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}

          {/* Credentials */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px', marginTop: '4px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>Discord Application Credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px' }}>Bot Token <span style={{ color: '#ef4444' }}>*</span></p>
                <div style={{ display: 'flex', gap: 5 }}>
                  <input
                    type={tokenVisible ? 'text' : 'password'}
                    value={botToken}
                    onChange={e => setBotToken(e.target.value)}
                    placeholder="Paste your bot token"
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
                  />
                  <button onClick={() => setTokenVisible(v => !v)} style={{ padding: '6px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', fontFamily: "'Geist','DM Sans',sans-serif" }}>
                    {tokenVisible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px' }}>Application (Client) ID</p>
                <input
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  placeholder="e.g. 1234567890123456789"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px' }}>
                  Guild (Server) ID <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>— recommended for instant slash command sync</span>
                </p>
                <input
                  value={guildId}
                  onChange={e => setGuildId(e.target.value)}
                  placeholder="e.g. 1234567890123456789"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', marginBottom: '16px' }}>
              Find Token + Client ID in the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Discord Developer Portal</a>. Get your Guild ID by right-clicking your server in Discord → Copy Server ID.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 7, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: "'Geist','DM Sans',sans-serif" }}>
              Skip
            </button>
            <button
              onClick={handleAllow}
              disabled={saving || !botToken.trim()}
              style={{ padding: '8px 22px', borderRadius: 7, background: !botToken.trim() ? 'rgba(37,99,235,0.45)' : '#2563eb', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: !botToken.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Geist','DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}>
              {saving ? <><RotateCw style={{ width: 12, height: 12 }} className="animate-spin" /> Connecting…</> : 'Allow'}
            </button>
          </div>
        </div>
      </div>
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
type CloudSubTab = 'overview' | 'token' | 'env' | 'commands' | 'permissions' | 'logs';

function BotCloudPanel({ workspaceId, projectId, workspaceFiles, projectName, onRequestEnableCloud, cloudEnabledOverride }: {
  workspaceId?: string | null;
  projectId?: string;
  workspaceFiles?: WorkspaceFile[];
  projectName?: string;
  onRequestEnableCloud?: () => void;
  cloudEnabledOverride?: boolean;
}) {
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [clientId, setClientId] = useState('');
  const [botToken, setBotToken] = useState('');
  const [guildId, setGuildId] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [tokenVisible, setTokenVisible] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subTab, setSubTab] = useState<CloudSubTab>('overview');
  const [permissions, setPermissions] = useState<Record<number, boolean>>({
    1024: true, 2048: true, 16384: true, 32768: true, 65536: true, 64: true, 8192: false,
  });

  const PERM_LABELS: Record<number, string> = {
    1024: 'Read Messages', 2048: 'Send Messages', 16384: 'Embed Links',
    32768: 'Attach Files', 65536: 'Read History', 64: 'Add Reactions', 8192: 'Manage Messages',
  };

  const permBitmask = Object.entries(permissions).filter(([, v]) => v).reduce((acc, [k]) => acc | Number(k), 0);
  const inviteUrl = clientId.trim()
    ? `https://discord.com/api/oauth2/authorize?client_id=${clientId.trim()}&permissions=${permBitmask}&scope=bot%20applications.commands`
    : '';

  const commands = useMemo(() => {
    const found: string[] = [];
    for (const f of workspaceFiles ?? []) {
      if (!f.file_path.endsWith('.py')) continue;
      const m1 = [...f.content.matchAll(/@(?:bot|client)\.command\([^)]*\)\s*\nasync def (\w+)/g)];
      for (const m of m1) if (m[1]) found.push('!' + m[1]);
      const m2 = [...f.content.matchAll(/name=["'](\w+)["']/g)];
      for (const m of m2) if (m[1]) found.push('/' + m[1]);
    }
    return [...new Set(found)];
  }, [workspaceFiles]);

  useEffect(() => {
    if (!projectId) return;
    getDoc(doc(db, 'projectEnvVars', projectId)).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as Record<string, string>;
        if (data.DISCORD_TOKEN) { setBotToken(data.DISCORD_TOKEN); setCloudEnabled(true); }
        if (data.CLIENT_ID) setClientId(data.CLIENT_ID);
        if (data.GUILD_ID) setGuildId(data.GUILD_ID);
        setEnvVars(
          Object.entries(data)
            .filter(([k]) => k !== 'updated_at' && k !== 'DISCORD_TOKEN' && k !== 'CLIENT_ID' && k !== 'GUILD_ID')
            .map(([key, value]) => ({ key, value: String(value) }))
        );
      }
    }).catch(() => {});
  }, [projectId]);

  const saveToken = async () => {
    if (!projectId || !botToken.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = { DISCORD_TOKEN: botToken, CLIENT_ID: clientId, updated_at: new Date().toISOString() };
      if (guildId.trim()) payload.GUILD_ID = guildId.trim();
      await setDoc(doc(db, 'projectEnvVars', projectId), payload, { merge: true });
      setTokenSaved(true);
      setCloudEnabled(true);
      setTimeout(() => setTokenSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  // ── Enable Cloud gate ─────────────────────────────────────────────────────
  if (!cloudEnabled && !cloudEnabledOverride) {
    return (
      <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: BG, fontFamily: PANEL_FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '460px', margin: '0 20px' }}>
          <div style={{ background: '#161618', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '28px 28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo-stack-white.svg" style={{ width: 20, height: 20, opacity: 0.9 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Buildable Cloud</span>
              </div>
              <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'underline' }}>Get credentials</a>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 20 }}>
              Connect your Discord Application. Buildable handles hosting, restarts, and deployment automatically.
            </p>
            {[
              { Icon: Monitor, title: 'Always-on hosting', desc: '24/7 uptime on dedicated Oracle Cloud. No cold starts.' },
              { Icon: RotateCw, title: 'Auto-restart & crash recovery', desc: 'Crashes detected and fixed automatically.' },
              { Icon: Lock, title: 'Secure credential storage', desc: 'Bot tokens encrypted at rest. Never exposed.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(255,255,255,0.45)' }}>
                  <Icon style={{ width: 14, height: 14 }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: '0 0 2px' }}>{title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
            <button onClick={() => onRequestEnableCloud?.()} style={{ width: '100%', padding: 11, borderRadius: 8, background: '#2563eb', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: PANEL_FONT, marginTop: 8 }}>
              Enable Cloud
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Full cloud panel: sidebar + content ───────────────────────────────────
  const NAV: { id: CloudSubTab; label: string; Icon: React.ElementType; stat?: string }[] = [
    { id: 'overview',     label: 'Overview',     Icon: LayoutDashboard },
    { id: 'token',        label: 'Bot Token',    Icon: KeyRound },
    { id: 'env',          label: 'Env Variables', Icon: Lock,     stat: envVars.length > 0 ? `${envVars.length}` : undefined },
    { id: 'commands',     label: 'Commands',     Icon: Terminal,  stat: commands.length > 0 ? `${commands.length}` : undefined },
    { id: 'permissions',  label: 'Permissions',  Icon: Shield },
    { id: 'logs',         label: 'Logs',         Icon: ScrollText },
  ];

  const OVERVIEW_ROWS: { id: CloudSubTab; label: string; desc: string; stat?: string }[] = [
    { id: 'token',       label: 'Bot Token',       desc: 'Manage your Discord bot credentials',         stat: botToken ? 'Connected' : 'Not set' },
    { id: 'env',         label: 'Env Variables',   desc: 'Configure runtime environment variables',     stat: envVars.length > 0 ? `${envVars.length} Variables` : '0 Variables' },
    { id: 'commands',    label: 'Commands',        desc: 'Slash commands and prefix commands detected', stat: commands.length > 0 ? `${commands.length} Commands` : '0 Commands' },
    { id: 'permissions', label: 'Permissions',     desc: 'Configure bot permissions and invite URL' },
    { id: 'logs',        label: 'Logs',            desc: 'View deployment and runtime logs' },
  ];

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', background: BG, fontFamily: PANEL_FONT }}>
      {/* Left sidebar */}
      <div style={{ width: 188, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '16px 0', overflowY: 'auto' }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
          <img src="/logo-stack-white.svg" style={{ width: 16, height: 16, opacity: 0.8 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Buildable Cloud</span>
        </div>
        {NAV.map(({ id, label, Icon, stat }) => (
          <button key={id} onClick={() => setSubTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 14px', margin: '1px 6px', borderRadius: 7, background: subTab === id ? 'rgba(255,255,255,0.07)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: subTab === id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)', transition: 'all 0.12s' }}
            onMouseEnter={e => { if (subTab !== id) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { if (subTab !== id) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}>
            <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span style={{ fontSize: 13, flex: 1 }}>{label}</span>
            {stat && <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px', color: 'rgba(255,255,255,0.4)' }}>{stat}</span>}
          </button>
        ))}
      </div>

      {/* Right content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {/* ── Overview ── */}
        {subTab === 'overview' && (
          <div>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>Overview</h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>Bot cloud configuration</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.5)' }} />
                <span style={{ fontSize: 11, color: '#4ade80' }}>Connected</span>
              </div>
            </div>
            <div>
              {OVERVIEW_ROWS.map((row, i) => (
                <button key={row.id} onClick={() => setSubTab(row.id)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'transparent', border: 'none', borderBottomWidth: i < OVERVIEW_ROWS.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)', borderBottomStyle: 'solid', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{row.label}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '3px 0 0' }}>{row.desc}</p>
                  </div>
                  {row.stat && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginRight: 10 }}>{row.stat}</span>}
                  <ChevronRight style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Bot Token ── */}
        {subTab === 'token' && (
          <div style={{ padding: '20px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: '0 0 4px' }}>Bot Token</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '0 0 24px' }}>Manage your Discord application credentials. Stored encrypted — never exposed.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Discord Bot Token <span style={{ color: '#ef4444' }}>*</span></p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type={tokenVisible ? 'text' : 'password'} value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="Paste your bot token" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'monospace', outline: 'none' }} />
                  <button onClick={() => setTokenVisible(v => !v)} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', fontSize: 12, cursor: 'pointer', fontFamily: PANEL_FONT }}>{tokenVisible ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Application (Client) ID</p>
                <input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="e.g. 1234567890123456789" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                  Guild (Server) ID
                  <span style={{ marginLeft: 6, fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 4, padding: '1px 5px' }}>instant slash command sync</span>
                </p>
                <input value={guildId} onChange={e => setGuildId(e.target.value)} placeholder="Right-click your server → Copy Server ID" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 5 }}>Without a Guild ID, slash commands use global sync and can take up to 1 hour to appear.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>Find these at <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>discord.com/developers</a></p>
                <button onClick={saveToken} disabled={saving || !botToken.trim()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 8, background: tokenSaved ? 'rgba(34,197,94,0.15)' : '#2563eb', border: tokenSaved ? '1px solid rgba(34,197,94,0.3)' : 'none', color: tokenSaved ? '#4ade80' : '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: PANEL_FONT, transition: 'all 0.2s' }}>
                  {saving ? <RotateCw style={{ width: 12, height: 12 }} className="animate-spin" /> : tokenSaved ? <><Check style={{ width: 12, height: 12 }} /> Saved</> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Env Variables ── */}
        {subTab === 'env' && (
          <div style={{ padding: '20px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: '0 0 4px' }}>Env Variables</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '0 0 20px' }}>Runtime environment variables available to your bot. Set sensitive values here, not in code.</p>
            {envVars.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 520 }}>
                {envVars.map(v => (
                  <div key={v.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <code style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', flex: 1 }}>{v.key}</code>
                    <code style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{'•'.repeat(Math.min(v.value.length, 10))}</code>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                <Lock style={{ width: 28, height: 28, margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No environment variables configured.</p>
                <p style={{ fontSize: 11, margin: '6px 0 0', opacity: 0.7 }}>Variables saved via Firestore will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Commands ── */}
        {subTab === 'commands' && (
          <div style={{ padding: '20px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: '0 0 4px' }}>Commands</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '0 0 20px' }}>Commands detected in your bot's Python files. Generate your bot first to see them here.</p>
            {commands.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 520 }}>
                {commands.map(cmd => (
                  <span key={cmd} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>{cmd}</span>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                <Terminal style={{ width: 28, height: 28, margin: '0 auto 10px', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No commands detected yet.</p>
                <p style={{ fontSize: 11, margin: '6px 0 0', opacity: 0.7 }}>Generate your bot to populate this list.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Permissions ── */}
        {subTab === 'permissions' && (
          <div style={{ padding: '20px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: '0 0 4px' }}>Permissions & Invite</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '0 0 20px' }}>Select what your bot needs access to, then copy the invite URL to add it to your server.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 20, maxWidth: 520 }}>
              {Object.entries(PERM_LABELS).map(([bit, label]) => (
                <label key={bit} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.6)', padding: '6px 10px', borderRadius: 7, background: permissions[Number(bit)] ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${permissions[Number(bit)] ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.07)'}`, transition: 'all 0.15s' }}>
                  <input type="checkbox" checked={permissions[Number(bit)] ?? false} onChange={e => setPermissions(p => ({ ...p, [Number(bit)]: e.target.checked }))} style={{ accentColor: '#3b82f6', cursor: 'pointer' }} />
                  {label}
                </label>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Invite URL (generated from your Client ID)</p>
            {inviteUrl ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', maxWidth: 520 }}>
                <code style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: 7, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.08)' }}>{inviteUrl}</code>
                <button onClick={() => navigator.clipboard.writeText(inviteUrl)} style={{ padding: '7px 14px', borderRadius: 7, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#60a5fa', fontSize: 12, cursor: 'pointer', flexShrink: 0, fontFamily: PANEL_FONT }}>Copy</button>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Add your Client ID in Bot Token to generate the URL.</p>
            )}
          </div>
        )}

        {/* ── Logs ── */}
        {subTab === 'logs' && (
          <div style={{ padding: '20px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: '0 0 4px' }}>Logs</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: '0 0 20px' }}>Deployment and runtime logs for your bot. Deploy your bot from the Hosting tab to see logs.</p>
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
              <ScrollText style={{ width: 28, height: 28, margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>No logs yet.</p>
              <p style={{ fontSize: 11, margin: '6px 0 0', opacity: 0.7 }}>Logs appear once your bot is deployed.</p>
            </div>
          </div>
        )}
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
function BotHostingPanel({
  workspaceId,
  deployStatus,
  onDeploy,
  onStop,
  onRestart,
}: {
  workspaceId?: string | null;
  deployStatus: 'idle' | 'deploying' | 'running' | 'stopped' | 'error';
  onDeploy: () => void;
  onStop: () => void;
  onRestart: () => void;
}) {
  const [logs, setLogs] = useState<string>('');
  const [logsCopied, setLogsCopied] = useState(false);
  const logsRef = useRef<HTMLPreElement>(null);
  const logPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch logs when running
  useEffect(() => {
    if (deployStatus !== 'running' || !workspaceId) {
      if (logPollRef.current) clearInterval(logPollRef.current);
      return;
    }
    const fetchLogs = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${API_BASE}/api/deploy/${workspaceId}/logs?lines=80`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json() as { logs: string };
        setLogs(data.logs ?? '');
        // Auto-scroll to bottom
        if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
      } catch { /* ignore */ }
    };
    fetchLogs();
    logPollRef.current = setInterval(fetchLogs, 3000);
    return () => { if (logPollRef.current) clearInterval(logPollRef.current); };
  }, [deployStatus, workspaceId]);

  const statusDot = deployStatus === 'running' ? '#22c55e'
    : deployStatus === 'deploying' ? '#f59e0b'
    : deployStatus === 'error' ? '#ef4444'
    : deployStatus === 'stopped' ? 'rgba(255,255,255,0.3)'
    : 'rgba(255,255,255,0.15)';

  const statusText = deployStatus === 'running' ? 'Running'
    : deployStatus === 'deploying' ? 'Deploying…'
    : deployStatus === 'error' ? 'Deploy failed'
    : deployStatus === 'stopped' ? 'Stopped'
    : 'Not deployed';

  const copyLogs = () => {
    navigator.clipboard.writeText(logs);
    setLogsCopied(true);
    setTimeout(() => setLogsCopied(false), 1500);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto" style={{ background: BG, fontFamily: PANEL_FONT }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>Hosting</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Live deployment status and logs</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Status + Actions */}
          <div style={{ ...CARD_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', background: statusDot, flexShrink: 0,
                boxShadow: deployStatus === 'running' ? '0 0 6px #22c55e' : 'none',
                animation: deployStatus === 'deploying' ? 'pulse 1.2s ease-in-out infinite' : 'none',
              }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{statusText}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  {deployStatus === 'running' ? 'Your bot is live and responding to Discord' : deployStatus === 'idle' ? 'Deploy your bot to go live' : ''}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(deployStatus === 'idle' || deployStatus === 'stopped' || deployStatus === 'error') && (
                <button onClick={onDeploy} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 6, background: '#2563eb', border: 'none', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: PANEL_FONT }}>
                  <Server style={{ width: 12, height: 12 }} />
                  Deploy
                </button>
              )}
              {deployStatus === 'deploying' && (
                <button disabled style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 6, background: '#1d4ed8', border: 'none', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'default', opacity: 0.7, fontFamily: PANEL_FONT }}>
                  <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
                  Deploying…
                </button>
              )}
              {deployStatus === 'running' && (
                <>
                  <button onClick={onRestart} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: PANEL_FONT }}>
                    <RotateCw style={{ width: 12, height: 12 }} />
                    Restart
                  </button>
                  <button onClick={onStop} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: PANEL_FONT }}>
                    <Square style={{ width: 12, height: 12 }} />
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Live Logs */}
          <div style={CARD_STYLE}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.4)' }} />
                <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Live Logs</p>
                {deployStatus === 'running' && (
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>live</span>
                )}
              </div>
              {logs && (
                <button onClick={copyLogs} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', fontFamily: PANEL_FONT }}>
                  {logsCopied ? <><Check style={{ width: 10, height: 10 }} /> Copied</> : <><Copy style={{ width: 10, height: 10 }} /> Copy</>}
                </button>
              )}
            </div>
            <pre
              ref={logsRef}
              style={{
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px',
                padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6, minHeight: '180px', maxHeight: '340px', overflowY: 'auto',
                margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}
            >
              {logs || (deployStatus === 'running' ? 'Fetching logs…' : 'No logs yet. Deploy your bot to see output here.')}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bot template data for empty state cards ─────────────────────────────────
const BOT_TEMPLATES = [
  {
    id: 'music', icon: Music, name: 'Music Bot',
    description: 'Stream Spotify, YouTube & SoundCloud in voice channels with queue management and voting.',
    tags: ['!play', '!skip', '!queue'],
    prompt: 'Build me a music bot with Spotify and queue support',
    color: '#1db954',
  },
  {
    id: 'moderation', icon: Shield, name: 'Auto-Moderation Bot',
    description: 'Automatically delete spam, filter bad links, issue warnings and timed bans.',
    tags: ['!warn', '!ban', '!mute'],
    prompt: 'Build a moderation bot that auto-bans spammers',
    color: '#ef4444',
  },
  {
    id: 'welcome', icon: UserPlus, name: 'Welcome & Roles Bot',
    description: 'Greet new members, assign self-roles via reactions and track server milestones.',
    tags: ['Auto-DM', 'Role picker', '!roles'],
    prompt: 'Build a welcome bot with self-role assignment',
    color: '#5865f2',
  },
  {
    id: 'slash', icon: Zap, name: 'Slash Commands Bot',
    description: 'Modern slash commands with autocomplete, typed arguments and interactive buttons.',
    tags: ['/play', '/ban', '/poll'],
    prompt: 'Build a slash commands bot with autocomplete',
    color: '#a78bfa',
  },
  {
    id: 'ai', icon: Bot, name: 'AI Conversations Bot',
    description: 'Let your server chat with GPT-4 powered AI, with per-user memory and custom personas.',
    tags: ['@mention', '!ask', 'Memory'],
    prompt: 'Build an AI chatbot with GPT-4 and memory',
    color: '#10b981',
  },
  {
    id: 'ticket', icon: Ticket, name: 'Support Ticket Bot',
    description: 'Create private ticket channels, ping staff automatically and log full transcripts on close.',
    tags: ['!ticket', '!close', 'Transcripts'],
    prompt: 'Build a support ticket bot with transcripts',
    color: '#fbbf24',
  },
  {
    id: 'giveaway', icon: Gift, name: 'Giveaway Bot',
    description: 'Run timed giveaways with reaction entry, automatic winner selection and reroll support.',
    tags: ['!gstart', '!gend', '!greroll'],
    prompt: 'Build a giveaway bot with auto-reroll',
    color: '#f59e0b',
  },
  {
    id: 'multipurpose', icon: LayoutGrid, name: 'Multi-purpose Bot',
    description: 'All-in-one: moderation, music, leveling, polls, reminders and fully custom commands.',
    tags: ['!level', '!poll', '!remind'],
    prompt: 'Build a multi-purpose bot for my community',
    color: '#6366f1',
  },
];

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
  switch (tpl.id) {
    case 'music': return _win('music-queue', <>
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

    case 'moderation': return _win('mod-log', <>
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

    case 'welcome': return _win('welcome', <>
      {_msg('WelcomeBot', true, c, _emb(c, <>
        <div style={{ fontSize: 11, fontWeight: 700, color: _D.text, marginBottom: 2, fontFamily: _F }}>Welcome, alex_new!</div>
        <div style={{ fontSize: 9, color: _D.muted, marginBottom: 6, fontFamily: _F }}>You're member #847 · pick your roles</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
          {['Gaming', 'Music', 'Dev'].map(r => (
            <span key={r} style={{ padding: '2px 7px', background: `${c}20`, border: `1px solid ${c}35`, borderRadius: 4, fontSize: 9, color: _D.text, fontFamily: _F }}>{r}</span>
          ))}
        </div>
      </>))}
    </>);

    case 'slash': return _win('commands', <>
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

    case 'ai': return _win('general', <>
      {_msg('james', false, '', <><span style={{ color: '#949cf7' }}>@BuildableBot</span>{' what\'s Tokyo\'s population?'}</>)}
      {_msg('BuildableBot', true, c, <>
        {'Tokyo is home to '}<strong style={{ color: c }}>37M+ people</strong>{' — world\'s largest metro area.'}
      </>)}
    </>);

    case 'ticket': return _win('support', <>
      {_msg('sarah_m', false, '', 'I need help accessing my account')}
      {_msg('TicketBot', true, c, _emb(c, <>
        <div style={{ fontSize: 10, fontWeight: 700, color: _D.text, marginBottom: 3, fontFamily: _F }}>Ticket #0042 opened</div>
        {[['Category', 'Account Access'], ['Channel', '#ticket-0042'], ['ETA', '~2 min']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', gap: 7, marginBottom: 2 }}>
            <span style={{ fontSize: 9, color: _D.muted, minWidth: 48, fontFamily: _F }}>{l}</span>
            <span style={{ fontSize: 9, color: _D.text, fontFamily: _F }}>{v}</span>
          </div>
        ))}
      </>))}
    </>);

    case 'giveaway': return _win('giveaways', <>
      {_msg('GiveBot', true, c, _emb(c, <>
        <div style={{ fontSize: 11, color: c, fontWeight: 800, textAlign: 'center' as const, marginBottom: 2, fontFamily: _F }}>GIVEAWAY</div>
        <div style={{ fontSize: 10, color: _D.text, fontWeight: 600, textAlign: 'center' as const, marginBottom: 6, fontFamily: _F }}>Discord Nitro · 1 Year</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[['23h 59m', 'Ends in'], ['142', 'Entries'], ['1', 'Winners']].map(([v, l]) => (
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
        <div style={{ fontSize: 11, fontWeight: 700, color: _D.text, marginBottom: 4, fontFamily: _F }}>james · Level 12</div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 3 }}>
          <div style={{ width: '83%', height: '100%', background: c, borderRadius: 2 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, color: _D.muted, fontFamily: _F }}>1,240 / 1,500 XP</span>
          <span style={{ fontSize: 9, color: c, fontWeight: 600, fontFamily: _F }}>Rank #3</span>
        </div>
      </>))}
    </>);
  }
};

function DiscordBotEmptyState({ workspaceReady, onSelectTemplate }: { workspaceReady: boolean; onSelectTemplate: (prompt: string) => void }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: '#0c0c0c',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '28px 24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: workspaceReady ? '#22c55e' : '#3b82f6',
          }} />
          <span style={{ fontSize: 12, color: 'rgb(155,152,147)', fontFamily: _F }}>
            {workspaceReady ? 'Ready' : 'Connecting…'}
          </span>
        </div>
        <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: 'rgb(255,255,255)', fontFamily: _F }}>
          Start from a template
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'rgb(155,152,147)', fontFamily: _F }}>
          Click any template to pre-fill your prompt, or describe your own below.
        </p>
      </div>

      {/* Divider */}
      <div style={{ margin: '16px 24px 0', borderTop: '1px solid rgb(39,39,37)' }} />

      {/* Template grid */}
      <div style={{
        flex: 1,
        padding: '16px 24px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        alignContent: 'start',
      }}>
        {BOT_TEMPLATES.map(tpl => (
          <TemplateCard key={tpl.name} tpl={tpl} onSelect={onSelectTemplate} />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  tpl,
  onSelect,
}: {
  tpl: typeof BOT_TEMPLATES[number];
  onSelect: (prompt: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const prompt = `Build me a ${tpl.name}: ${tpl.description} Commands: ${tpl.tags.join(', ')}.`;

  return (
    <button
      onClick={() => onSelect(prompt)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: hovered ? '#1a1a1a' : '#141414',
        border: '1px solid rgb(39,39,37)',
        borderRadius: 8,
        padding: '12px 14px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.12s',
      }}
    >
      {/* Icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: `${tpl.color}18`, border: `1px solid ${tpl.color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <tpl.icon style={{ width: 13, height: 13, color: tpl.color }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgb(220,218,214)', fontFamily: _F }}>
          {tpl.name}
        </span>
      </div>

      {/* Description */}
      <p style={{
        margin: '0 0 9px',
        fontSize: 11.5,
        color: 'rgb(155,152,147)',
        fontFamily: _F,
        lineHeight: 1.5,
      }}>
        {tpl.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
        {tpl.tags.slice(0, 3).map(tag => (
          <span key={tag} style={{
            padding: '2px 7px',
            borderRadius: 4,
            background: '#232323',
            border: '1px solid rgb(49,49,47)',
            fontSize: 10,
            color: 'rgb(155,152,147)',
            fontFamily: _MO,
          }}>
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
