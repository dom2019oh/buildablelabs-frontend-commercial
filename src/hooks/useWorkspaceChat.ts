// =============================================================================
// useWorkspaceChat - Chat interface for the workspace
// =============================================================================
// Handles message history, sending prompts, and receiving AI responses.
// All AI generation happens on the backend — this is a read/write interface only.

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection, query, where, orderBy, getDocs, addDoc, deleteDoc,
  serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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

function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return String(ts);
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
  // LOAD MESSAGE HISTORY (Firestore)
  // =========================================================================

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["project-messages", projectId],
    queryFn: async () => {
      if (!projectId || !user) return [];

      const q = query(
        collection(db, "projectMessages"),
        where("project_id", "==", projectId),
        orderBy("created_at", "asc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        created_at: tsToString(d.data().created_at),
      })) as ChatMessage[];
    },
    enabled: !!projectId && !!user,
  });

  const messages = messagesData || [];

  // =========================================================================
  // SEND MESSAGE (USER → BACKEND)
  // =========================================================================

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, mode }: { content: string; mode?: 'plan' | 'architect' | 'build' }) => {
      if (!projectId || !user || !workspaceId) {
        throw new Error("Not ready to send messages");
      }

      // Save user message to Firestore
      await addDoc(collection(db, "projectMessages"), {
        project_id: projectId,
        user_id: user.uid,
        role: "user",
        content,
        created_at: serverTimestamp(),
      });

      setPendingMessage(content);

      // Trigger backend generation — API keys stay server-side
      const result = await generate(content, mode ?? 'build');

      // Save assistant response
      await addDoc(collection(db, "projectMessages"), {
        project_id: projectId,
        user_id: user.uid,
        role: "assistant",
        content: `Generated ${result.filesGenerated} files successfully.`,
        metadata: {
          filesGenerated: result.filesGenerated,
          sessionId: result.sessionId,
          status: "success",
        },
        created_at: serverTimestamp(),
      });

      return result;
    },
    onSuccess: () => {
      setPendingMessage(null);
      queryClient.invalidateQueries({ queryKey: ["project-messages", projectId] });
    },
    onError: async (error) => {
      if (projectId && user) {
        await addDoc(collection(db, "projectMessages"), {
          project_id: projectId,
          user_id: user.uid,
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Generation failed"}`,
          metadata: { status: "error" },
          created_at: serverTimestamp(),
        });
      }
      setPendingMessage(null);
      queryClient.invalidateQueries({ queryKey: ["project-messages", projectId] });
    },
  });

  const sendMessage = useCallback(
    async (content: string, mode?: 'plan' | 'architect' | 'build') => {
      return sendMessageMutation.mutateAsync({ content, mode });
    },
    [sendMessageMutation]
  );

  // =========================================================================
  // CLEAR MESSAGES
  // =========================================================================

  const clearMessages = useCallback(async () => {
    if (!projectId || !user) return;

    const q = query(
      collection(db, "projectMessages"),
      where("project_id", "==", projectId),
      where("user_id", "==", user.uid)
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
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
