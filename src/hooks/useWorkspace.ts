// =============================================================================
// useWorkspace - Hook for workspace management with direct Supabase queries
// =============================================================================
// Uses direct Supabase queries for CRUD operations (reliable, no edge function needed).
// Only uses edge functions for AI generation which requires server-side API calls.

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { RealtimeChannel } from "@supabase/supabase-js";

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

// =============================================================================
// HOOK
// =============================================================================

export function useWorkspace(projectId: string | undefined) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  // Real-time state
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [liveSession, setLiveSession] = useState<GenerationSession | null>(null);
  const [liveFilesCount, setLiveFilesCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const userId = session?.user?.id;
  const isAuthed = !!session;

  // =========================================================================
  // GET OR CREATE WORKSPACE (direct Supabase query)
  // =========================================================================

  const {
    data: workspaceData,
    isLoading: isLoadingWorkspace,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useQuery({
    queryKey: ["workspace", projectId],
    queryFn: async () => {
      if (!userId || !projectId) return null;

      // Use the database RPC function to get or create workspace
      const { data: workspaceId, error: rpcError } = await supabase.rpc(
        "get_or_create_workspace",
        { p_project_id: projectId, p_user_id: userId }
      );

      if (rpcError) {
        console.error("[Workspace] RPC error:", rpcError);
        throw new Error(rpcError.message);
      }

      if (!workspaceId) {
        throw new Error("Failed to get or create workspace");
      }

      // Fetch the full workspace record
      const { data: workspace, error: fetchError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (fetchError) {
        console.error("[Workspace] Fetch error:", fetchError);
        throw new Error(fetchError.message);
      }

      return workspace as Workspace;
    },
    enabled: isAuthed && !!projectId && !!userId,
    staleTime: 30000,
    retry: 2,
  });

  const workspace = workspaceData;
  const workspaceId = workspace?.id;

  // =========================================================================
  // REALTIME SUBSCRIPTIONS - Live updates during generation
  // =========================================================================

  useEffect(() => {
    if (!workspaceId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`workspace-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generation_sessions',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('[Realtime] Generation session update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const session = payload.new as GenerationSession;
            setLiveSession(session);
            setGenerationStatus(session.status);
            if (session.status === 'completed' || session.status === 'failed') {
              queryClient.invalidateQueries({ queryKey: ["workspace-files", workspaceId] });
              queryClient.invalidateQueries({ queryKey: ["workspace-sessions", workspaceId] });
              queryClient.invalidateQueries({ queryKey: ["workspace", projectId] });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workspace_files',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('[Realtime] New file created:', payload.new);
          setLiveFilesCount((prev) => prev + 1);
          queryClient.invalidateQueries({ queryKey: ["workspace-files", workspaceId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workspace_files',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('[Realtime] File updated:', payload.new);
          queryClient.invalidateQueries({ queryKey: ["workspace-files", workspaceId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'file_operations',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('[Realtime] File operation:', payload.new);
          queryClient.invalidateQueries({ queryKey: ["workspace-operations", workspaceId] });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [workspaceId, projectId, queryClient]);

  // =========================================================================
  // GET FILES (direct Supabase query)
  // =========================================================================

  const {
    data: filesData,
    isLoading: isLoadingFiles,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ["workspace-files", workspaceId],
    queryFn: async () => {
      if (!workspaceId || !userId) return [];

      const { data, error } = await supabase
        .from("workspace_files")
        .select("id, file_path, content, file_type, is_generated, updated_at")
        .eq("workspace_id", workspaceId)
        .order("file_path");

      if (error) {
        console.error("[Workspace] Files fetch error:", error);
        return [];
      }

      return (data || []) as WorkspaceFile[];
    },
    enabled: isAuthed && !!workspaceId,
    staleTime: 10000,
  });

  const files = filesData || [];

  // =========================================================================
  // GET SINGLE FILE
  // =========================================================================

  const getFile = useCallback(
    async (filePath: string): Promise<WorkspaceFile | null> => {
      if (!workspaceId) return null;

      const { data, error } = await supabase
        .from("workspace_files")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("file_path", filePath)
        .maybeSingle();

      if (error) {
        console.error("[Workspace] Get file error:", error);
        return null;
      }

      return data as WorkspaceFile | null;
    },
    [workspaceId]
  );

  // =========================================================================
  // GET GENERATION SESSIONS (direct Supabase query)
  // =========================================================================

  const {
    data: sessionsData,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["workspace-sessions", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from("generation_sessions")
        .select("id, prompt, status, files_generated, created_at, completed_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("[Workspace] Sessions fetch error:", error);
        return [];
      }

      return (data || []) as GenerationSession[];
    },
    enabled: isAuthed && !!workspaceId,
    staleTime: 5000,
  });

  const sessions = sessionsData || [];

  // =========================================================================
  // GET OPERATION HISTORY (direct Supabase query)
  // =========================================================================

  const {
    data: operationsData,
    refetch: refetchOperations,
  } = useQuery({
    queryKey: ["workspace-operations", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from("file_operations")
        .select("id, operation, file_path, ai_model, applied, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("[Workspace] Operations fetch error:", error);
        return [];
      }

      return (data || []) as FileOperation[];
    },
    enabled: isAuthed && !!workspaceId,
    staleTime: 5000,
  });

  const operations = operationsData || [];

  // =========================================================================
  // GENERATE (SEND PROMPT TO BACKEND AI) - uses edge function
  // =========================================================================

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<Error | null>(null);

  const generate = useCallback(
    async (prompt: string) => {
      if (!workspaceId || !session?.access_token) {
        throw new Error("Not authenticated or no workspace");
      }

      setIsGenerating(true);
      setGenerationError(null);
      setGenerationStatus("starting");
      setLiveFilesCount(0);

      try {
        // Use edge function only for AI generation (needs server-side API keys)
        const { data, error } = await supabase.functions.invoke("workspace-api", {
          body: {
            action: "generate",
            workspaceId,
            data: { prompt },
          },
        });

        if (error) throw error;

        setGenerationStatus("complete");
        
        // Refresh all data after generation
        await Promise.all([
          refetchFiles(),
          refetchSessions(),
          refetchOperations(),
          refetchWorkspace(),
        ]);

        return {
          success: data?.success,
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
    [workspaceId, session?.access_token, refetchFiles, refetchSessions, refetchOperations, refetchWorkspace]
  );

  // =========================================================================
  // ESTIMATE CREDITS
  // =========================================================================

  const estimateCredits = useCallback(
    async (_prompt: string) => {
      // Credit estimation not available via direct queries
      return null;
    },
    []
  );

  // =========================================================================
  // GET SESSION STATUS
  // =========================================================================

  const getSessionStatus = useCallback(
    async (sessionId: string) => {
      const { data, error } = await supabase
        .from("generation_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();

      if (error) return null;
      return data as GenerationSession | null;
    },
    []
  );

  // =========================================================================
  // CANCEL GENERATION
  // =========================================================================

  const cancelGeneration = useCallback(
    async (_sessionId: string) => {
      setIsGenerating(false);
      setGenerationStatus(null);
    },
    []
  );

  // =========================================================================
  // REFRESH ALL DATA
  // =========================================================================

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
    // Workspace state
    workspace,
    workspaceId,
    isLoading: isLoadingWorkspace,
    isLoadingWorkspace,
    error: workspaceError,

    // Files (read-only)
    files,
    isLoadingFiles,
    getFile,
    refetchFiles,

    // Generation with realtime
    generate,
    isGenerating: isGenerating || workspace?.status === "generating",
    generationStatus,
    generationError,
    liveSession,
    liveFilesCount,
    
    // Extended generation features
    estimateCredits,
    getSessionStatus,
    cancelGeneration,

    // History
    sessions,
    operations,

    // Actions
    refresh,
  };
}
