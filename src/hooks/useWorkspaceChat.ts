// =============================================================================
// useWorkspaceChat - Chat interface for the workspace
// =============================================================================
// Handles message history, sending prompts, and receiving AI responses.
// This is a read-only interface - all AI work happens on the backend.

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "./useWorkspace";

// =============================================================================
// TYPES
// =============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    filesGenerated?: number;
    sessionId?: string;
    status?: string;
  };
  created_at: string;
}

// =============================================================================
// HOOK
// =============================================================================

export function useWorkspaceChat(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { workspaceId, generate, isGenerating, generationStatus } = useWorkspace(projectId);
  
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // =========================================================================
  // LOAD MESSAGE HISTORY
  // =========================================================================

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["project-messages", projectId],
    queryFn: async () => {
      if (!projectId || !user) return [];

      const { data, error } = await supabase
        .from("project_messages")
        .select("id, role, content, metadata, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as ChatMessage[];
    },
    enabled: !!projectId && !!user,
  });

  const messages = messagesData || [];

  // =========================================================================
  // SEND MESSAGE (USER → BACKEND)
  // =========================================================================

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!projectId || !user || !workspaceId) {
        throw new Error("Not ready to send messages");
      }

      // Save user message to database
      const { error: saveError } = await supabase
        .from("project_messages")
        .insert({
          project_id: projectId,
          user_id: user.id,
          role: "user",
          content,
        });

      if (saveError) throw saveError;

      setPendingMessage(content);

      // Trigger backend generation
      const result = await generate(content);

      // Save assistant response
      await supabase
        .from("project_messages")
        .insert({
          project_id: projectId,
          user_id: user.id,
          role: "assistant",
          content: `Generated ${result.filesGenerated} files successfully.`,
          metadata: {
            filesGenerated: result.filesGenerated,
            sessionId: result.sessionId,
            status: "success",
          },
        });

      return result;
    },
    onSuccess: () => {
      setPendingMessage(null);
      queryClient.invalidateQueries({ queryKey: ["project-messages", projectId] });
    },
    onError: async (error) => {
      // Save error message
      if (projectId && user) {
        await supabase
          .from("project_messages")
          .insert({
            project_id: projectId,
            user_id: user.id,
            role: "assistant",
            content: `Error: ${error instanceof Error ? error.message : "Generation failed"}`,
            metadata: { status: "error" },
          });
      }
      setPendingMessage(null);
      queryClient.invalidateQueries({ queryKey: ["project-messages", projectId] });
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      return sendMessageMutation.mutateAsync(content);
    },
    [sendMessageMutation]
  );

  // =========================================================================
  // CLEAR MESSAGES
  // =========================================================================

  const clearMessages = useCallback(async () => {
    if (!projectId || !user) return;

    await supabase
      .from("project_messages")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);

    queryClient.invalidateQueries({ queryKey: ["project-messages", projectId] });
  }, [projectId, user, queryClient]);

  // =========================================================================
  // RETURN
  // =========================================================================

  return {
    messages,
    isLoadingMessages,
    sendMessage,
    isSending: sendMessageMutation.isPending,
    isGenerating,
    generationStatus,
    pendingMessage,
    clearMessages,
    refetchMessages,
    error: sendMessageMutation.error,
  };
}
