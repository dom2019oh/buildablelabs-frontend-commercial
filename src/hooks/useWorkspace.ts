// =============================================================================
// useWorkspace — Workspace management via backend API + Firestore realtime
// =============================================================================
// Mutations/generation → backend API (AI keys stay server-side)
// Reads/realtime      → Firestore direct (backend writes here)

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection, query, where, orderBy, limit, getDocs,
  onSnapshot, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE } from "@/lib/urls";

// =============================================================================
// TYPES
// =============================================================================

export interface Workspace {
  id: string;
  project_id: string;
  status: "initializing" | "ready" | "generating" | "error" | "archived";
  preview_url: string | null;
  preview_status: string | null;
  config: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceFile {
  id: string;
  file_path: string;
  content: string;
  file_type: string | null;
  is_generated: boolean;
  updated_at: string;
}

export interface GenerationSession {
  id: string;
  prompt: string;
  status: "pending" | "planning" | "scaffolding" | "generating" | "validating" | "completed" | "failed";
  files_planned: number;
  files_generated: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface FileOperation {
  id: string;
  operation: "create" | "update" | "delete" | "rename" | "move";
  file_path: string;
  ai_model: string | null;
  ai_reasoning: string | null;
  applied: boolean;
  created_at: string;
}

function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return String(ts);
}

// =============================================================================
// HOOK
// =============================================================================

export function useWorkspace(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [liveSession, setLiveSession]           = useState<GenerationSession | null>(null);
  const [liveFilesCount, setLiveFilesCount]     = useState(0);
  const unsubRef = useRef<(() => void)[]>([]);

  const userId   = user?.uid;
  const isAuthed = !!user;

  // =========================================================================
  // GET OR CREATE WORKSPACE — via backend API (authenticated)
  // =========================================================================

  const {
    data: workspaceData,
    isLoading: isLoadingWorkspace,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useQuery({
    queryKey: ["workspace", projectId],
    queryFn: async () => {
      if (!userId || !projectId || !user) return null;

      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/workspace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get/create workspace");
      }

      const data = await res.json();
      return data.workspace as Workspace;
    },
    enabled: isAuthed && !!projectId && !!userId,
    staleTime: 30000,
    retry: 4,
    retryDelay: (attempt: number) => Math.min(2000 * 2 ** attempt, 20000),
  });

  const workspace   = workspaceData;
  const workspaceId = workspace?.id;

  // =========================================================================
  // REALTIME — Firestore onSnapshot (backend writes to these collections)
  // =========================================================================

  useEffect(() => {
    if (!workspaceId) return;

    // Clean up previous listeners
    unsubRef.current.forEach((u) => u());
    unsubRef.current = [];

    // Listen to generation sessions
    const sessionsQ = query(
      collection(db, "generationSessions"),
      where("workspace_id", "==", workspaceId),
      orderBy("created_at", "desc"),
      limit(1)
    );
    const unsubSessions = onSnapshot(sessionsQ, (snap) => {
      if (snap.empty) return;
      const latest = { id: snap.docs[0].id, ...snap.docs[0].data() } as GenerationSession;
      setLiveSession(latest);
      setGenerationStatus(latest.status);

      if (latest.status === "completed" || latest.status === "failed") {
        queryClient.invalidateQueries({ queryKey: ["workspace-files", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["workspace-sessions", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] });
      }
    });

    // Listen to workspace files (count new files during generation)
    const filesQ = query(
      collection(db, "workspaceFiles"),
      where("workspace_id", "==", workspaceId)
    );
    const unsubFiles = onSnapshot(filesQ, (snap) => {
      setLiveFilesCount(snap.size);
      queryClient.invalidateQueries({ queryKey: ["workspace-files", workspaceId] });
    });

    // Listen to file operations
    const opsQ = query(
      collection(db, "fileOperations"),
      where("workspace_id", "==", workspaceId)
    );
    const unsubOps = onSnapshot(opsQ, () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-operations", workspaceId] });
    });

    unsubRef.current = [unsubSessions, unsubFiles, unsubOps];

    return () => {
      unsubRef.current.forEach((u) => u());
      unsubRef.current = [];
    };
  }, [workspaceId, projectId, queryClient]);

  // =========================================================================
  // FILES — Firestore direct read
  // =========================================================================

  const {
    data: filesData,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ["workspace-files", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const q = query(
        collection(db, "workspaceFiles"),
        where("workspace_id", "==", workspaceId),
        orderBy("file_path")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        file_path: d.data().file_path,
        content: d.data().content,
        file_type: d.data().file_type ?? null,
        is_generated: d.data().is_generated ?? false,
        updated_at: tsToString(d.data().updated_at),
      })) as WorkspaceFile[];
    },
    enabled: isAuthed && !!workspaceId,
    staleTime: 10000,
  });

  const files = filesData || [];

  const getFile = useCallback(
    async (filePath: string): Promise<WorkspaceFile | null> => {
      if (!workspaceId) return null;

      const q = query(
        collection(db, "workspaceFiles"),
        where("workspace_id", "==", workspaceId),
        where("file_path", "==", filePath),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return {
        id: d.id,
        file_path: d.data().file_path,
        content: d.data().content,
        file_type: d.data().file_type ?? null,
        is_generated: d.data().is_generated ?? false,
        updated_at: tsToString(d.data().updated_at),
      };
    },
    [workspaceId]
  );

  // =========================================================================
  // GENERATION SESSIONS — Firestore direct read
  // =========================================================================

  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ["workspace-sessions", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const q = query(
        collection(db, "generationSessions"),
        where("workspace_id", "==", workspaceId),
        orderBy("created_at", "desc"),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        created_at: tsToString(d.data().created_at),
        completed_at: d.data().completed_at ? tsToString(d.data().completed_at) : null,
      })) as GenerationSession[];
    },
    enabled: isAuthed && !!workspaceId,
    staleTime: 5000,
  });

  const sessions = sessionsData || [];

  // =========================================================================
  // FILE OPERATIONS — Firestore direct read
  // =========================================================================

  const { data: operationsData, refetch: refetchOperations } = useQuery({
    queryKey: ["workspace-operations", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const q = query(
        collection(db, "fileOperations"),
        where("workspace_id", "==", workspaceId),
        orderBy("created_at", "desc"),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        created_at: tsToString(d.data().created_at),
      })) as FileOperation[];
    },
    enabled: isAuthed && !!workspaceId,
    staleTime: 5000,
  });

  const operations = operationsData || [];

  // =========================================================================
  // GENERATE — backend API (AI keys stay server-side)
  // =========================================================================

  const [isGenerating, setIsGenerating]         = useState(false);
  const [generationError, setGenerationError]   = useState<Error | null>(null);

  const generate = useCallback(
    async (prompt: string, mode: 'plan' | 'architect' | 'build' = 'build') => {
      if (!workspaceId || !user) throw new Error("Not authenticated or no workspace");

      setIsGenerating(true);
      setGenerationError(null);
      setGenerationStatus("starting");
      setLiveFilesCount(0);

      try {
        const token = await user.getIdToken();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        let res: Response;
        try {
          res = await fetch(`${API_BASE}/api/generate/${workspaceId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt, mode }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const msg = res.status === 402
            ? err.error || 'Insufficient credits'
            : res.status === 429
            ? 'Too many requests. Please wait a moment.'
            : err.error || "Generation failed";
          throw new Error(msg);
        }

        const data = await res.json();
        setGenerationStatus("complete");

        await Promise.all([
          refetchFiles(),
          refetchSessions(),
          refetchOperations(),
          refetchWorkspace(),
        ]);

        return {
          success: data?.success ?? true,
          sessionId: data?.sessionId,
          filesGenerated: data?.filesGenerated || 0,
        };
      } catch (error) {
        setGenerationError(error as Error);
        setGenerationStatus("error");
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [workspaceId, user, refetchFiles, refetchSessions, refetchOperations, refetchWorkspace]
  );

  // =========================================================================
  // HELPERS
  // =========================================================================

  const estimateCredits = useCallback(async (_prompt: string) => null, []);

  const getSessionStatus = useCallback(async (sessionId: string): Promise<GenerationSession | null> => {
    const q = query(
      collection(db, "generationSessions"),
      where("__name__", "==", sessionId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as GenerationSession;
  }, []);

  const cancelGeneration = useCallback(async (_sessionId: string) => {
    setIsGenerating(false);
    setGenerationStatus(null);
  }, []);

  const refresh = useCallback(() => {
    refetchFiles();
    refetchSessions();
    refetchOperations();
    refetchWorkspace();
  }, [refetchFiles, refetchSessions, refetchOperations, refetchWorkspace]);

  // =========================================================================
  // RETURN
  // =========================================================================

  return {
    workspace,
    workspaceId,
    isLoading: isLoadingWorkspace,
    isLoadingWorkspace,
    error: workspaceError,

    files,
    isLoadingFiles,
    getFile,
    refetchFiles,

    generate,
    isGenerating: isGenerating || workspace?.status === "generating",
    generationStatus,
    generationError,
    liveSession,
    liveFilesCount,

    estimateCredits,
    getSessionStatus,
    cancelGeneration,

    sessions,
    operations,

    refresh,
  };
}
