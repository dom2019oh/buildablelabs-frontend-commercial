// =============================================================================
// useWorkspace - Hook for interacting with the workspace backend
// =============================================================================
// This is the primary interface between the read-only frontend and the backend.
// All AI operations, file reading, and workspace state are managed through this hook.

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

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
  files_generated: number;
  created_at: string;
  completed_at: string | null;
}

export interface FileOperation {
  id: string;
  operation: "create" | "update" | "delete" | "rename" | "move";
  file_path: string;
  ai_model: string | null;
  applied: boolean;
  created_at: string;
}

// =============================================================================
// API HELPER
// =============================================================================

async function workspaceAPI(
  action: string,
  accessToken: string,
  data?: Record<string, unknown>
) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/workspace-api`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action, ...data }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

// =============================================================================
// HOOK
// =============================================================================

export function useWorkspace(projectId: string | undefined) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);

  const accessToken = session?.access_token;

  // =========================================================================
  // GET OR CREATE WORKSPACE
  // =========================================================================

  const {
    data: workspaceData,
    isLoading: isLoadingWorkspace,
    error: workspaceError,
  } = useQuery({
    queryKey: ["workspace", projectId],
    queryFn: async () => {
      if (!accessToken || !projectId) return null;
      const result = await workspaceAPI("getOrCreateWorkspace", accessToken, { projectId });
      return result.workspace as Workspace;
    },
    enabled: !!accessToken && !!projectId,
    staleTime: 30000, // Cache for 30 seconds
  });

  const workspace = workspaceData;
  const workspaceId = workspace?.id;

  // =========================================================================
  // GET FILES (READ-ONLY)
  // =========================================================================

  const {
    data: filesData,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ["workspace-files", workspaceId],
    queryFn: async () => {
      if (!accessToken || !workspaceId) return [];
      const result = await workspaceAPI("getFiles", accessToken, { workspaceId });
      return result.files as WorkspaceFile[];
    },
    enabled: !!accessToken && !!workspaceId,
    staleTime: 10000,
  });

  const files = filesData || [];

  // =========================================================================
  // GET SINGLE FILE
  // =========================================================================

  const getFile = useCallback(
    async (filePath: string): Promise<WorkspaceFile | null> => {
      if (!accessToken || !workspaceId) return null;
      const result = await workspaceAPI("getFile", accessToken, {
        workspaceId,
        data: { filePath },
      });
      return result.file;
    },
    [accessToken, workspaceId]
  );

  // =========================================================================
  // GET GENERATION SESSIONS
  // =========================================================================

  const {
    data: sessionsData,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["workspace-sessions", workspaceId],
    queryFn: async () => {
      if (!accessToken || !workspaceId) return [];
      const result = await workspaceAPI("getSessions", accessToken, { workspaceId });
      return result.sessions as GenerationSession[];
    },
    enabled: !!accessToken && !!workspaceId,
    staleTime: 5000,
  });

  const sessions = sessionsData || [];

  // =========================================================================
  // GET OPERATION HISTORY
  // =========================================================================

  const {
    data: operationsData,
    refetch: refetchOperations,
  } = useQuery({
    queryKey: ["workspace-operations", workspaceId],
    queryFn: async () => {
      if (!accessToken || !workspaceId) return [];
      const result = await workspaceAPI("getOperationHistory", accessToken, { workspaceId });
      return result.operations as FileOperation[];
    },
    enabled: !!accessToken && !!workspaceId,
    staleTime: 5000,
  });

  const operations = operationsData || [];

  // =========================================================================
  // GENERATE (SEND PROMPT TO BACKEND AI)
  // =========================================================================

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      if (!accessToken || !workspaceId) {
        throw new Error("Not authenticated or no workspace");
      }

      setGenerationStatus("starting");

      const result = await workspaceAPI("generate", accessToken, {
        workspaceId,
        data: { prompt },
      });

      return result;
    },
    onSuccess: () => {
      setGenerationStatus("complete");
      // Refresh files and sessions after generation
      queryClient.invalidateQueries({ queryKey: ["workspace-files", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-sessions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-operations", workspaceId] });
    },
    onError: (error) => {
      setGenerationStatus("error");
      console.error("Generation failed:", error);
    },
  });

  const generate = useCallback(
    async (prompt: string) => {
      return generateMutation.mutateAsync(prompt);
    },
    [generateMutation]
  );

  // =========================================================================
  // REFRESH ALL DATA
  // =========================================================================

  const refresh = useCallback(() => {
    refetchFiles();
    refetchSessions();
    refetchOperations();
  }, [refetchFiles, refetchSessions, refetchOperations]);

  // =========================================================================
  // POLL FOR STATUS UPDATES DURING GENERATION
  // =========================================================================

  useEffect(() => {
    if (workspace?.status === "generating") {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [workspace?.status, projectId, queryClient]);

  // =========================================================================
  // RETURN
  // =========================================================================

  return {
    // Workspace state
    workspace,
    workspaceId,
    isLoading: isLoadingWorkspace,
    error: workspaceError,

    // Files (read-only)
    files,
    isLoadingFiles,
    getFile,
    refetchFiles,

    // Generation
    generate,
    isGenerating: generateMutation.isPending || workspace?.status === "generating",
    generationStatus,
    generationError: generateMutation.error,

    // History
    sessions,
    operations,

    // Actions
    refresh,
  };
}
