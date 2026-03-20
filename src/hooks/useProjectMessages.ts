import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, query, where, orderBy, getDocs, addDoc, deleteDoc,
  onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { API_BASE } from '@/lib/urls';

export interface ProjectMessage {
  id: string;
  project_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface AIResponse {
  response: string;
  metadata: {
    taskType: string;
    modelUsed: string;
    remaining: number | null;
  };
}

function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return String(ts);
}

export function useProjectMessages(projectId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initial fetch
  const messagesQuery = useQuery({
    queryKey: ['project-messages', projectId],
    queryFn: async () => {
      if (!projectId || !user?.uid) return [];

      const q = query(
        collection(db, 'projectMessages'),
        where('project_id', '==', projectId),
        orderBy('created_at', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        created_at: tsToString(d.data().created_at),
      })) as ProjectMessage[];
    },
    enabled: !!projectId && !!user?.uid,
  });

  // Realtime listener — updates React Query cache on Firestore changes
  useEffect(() => {
    if (!projectId || !user?.uid) return;

    const q = query(
      collection(db, 'projectMessages'),
      where('project_id', '==', projectId),
      orderBy('created_at', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        created_at: tsToString(d.data().created_at),
      })) as ProjectMessage[];
      queryClient.setQueryData(['project-messages', projectId], msgs);
    });

    return unsub;
  }, [projectId, user?.uid, queryClient]);

  // Save a single message to Firestore
  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      role = 'user',
      metadata = {},
    }: {
      content: string;
      role?: 'user' | 'assistant';
      metadata?: Record<string, unknown>;
    }) => {
      if (!projectId || !user?.uid) throw new Error('Missing project or user');

      const ref = await addDoc(collection(db, 'projectMessages'), {
        project_id: projectId,
        user_id: user.uid,
        role,
        content,
        metadata,
        created_at: serverTimestamp(),
      });

      return {
        id: ref.id,
        project_id: projectId,
        user_id: user.uid,
        role,
        content,
        metadata,
        created_at: new Date().toISOString(),
      } as ProjectMessage;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<ProjectMessage[]>(
        ['project-messages', projectId],
        (old) => {
          if (!old) return [newMessage];
          const exists = old.some((m) => m.id === newMessage.id);
          return exists ? old : [...old, newMessage];
        }
      );
    },
    onError: (error) => {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    },
  });

  // Call backend AI chat endpoint — API keys stay server-side
  const callAI = async (
    message: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<AIResponse> => {
    if (!user) throw new Error('Not authenticated');

    const token = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ projectId, message, conversationHistory }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'AI request failed');
    }

    return res.json() as Promise<AIResponse>;
  };

  // Send user message then get AI response
  const sendWithAIResponse = async (content: string) => {
    const currentMessages = messagesQuery.data || [];
    await sendMessage.mutateAsync({ content, role: 'user' });

    try {
      const aiResponse = await callAI(content, currentMessages);
      await sendMessage.mutateAsync({
        content: aiResponse.response,
        role: 'assistant',
        metadata: aiResponse.metadata as Record<string, unknown>,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';

      if (errorMessage.includes('Rate limit') || errorMessage.includes('request limit')) {
        toast({ title: 'Rate Limit Reached', description: errorMessage, variant: 'destructive' });
      } else {
        toast({ title: 'AI Error', description: errorMessage, variant: 'destructive' });
      }

      await sendMessage.mutateAsync({
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
        role: 'assistant',
        metadata: { error: true },
      });
    }
  };

  // Clear all messages for a project
  const clearMessages = useMutation({
    mutationFn: async () => {
      if (!projectId || !user?.uid) throw new Error('Missing project or user');

      const q = query(
        collection(db, 'projectMessages'),
        where('project_id', '==', projectId)
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    },
    onSuccess: () => {
      queryClient.setQueryData(['project-messages', projectId], []);
      toast({ title: 'Chat cleared' });
    },
    onError: (error) => {
      toast({ title: 'Error clearing chat', description: error.message, variant: 'destructive' });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage,
    sendWithAIResponse,
    clearMessages,
    isSending: sendMessage.isPending,
  };
}
