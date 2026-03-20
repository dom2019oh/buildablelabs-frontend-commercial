import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, deleteDoc, doc, getDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';

export interface Project {
  id: string;
  name: string;
  status: 'building' | 'ready' | 'failed';
  updated_at: string;
  template?: string;
  language?: string;
}

export interface CreateProjectOptions {
  template?: string;
  language?: string;
  commandStyle?: string;
  prompt?: string;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createPending, setCreatePending] = useState(false);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => {
        const data = d.data();
        const ts   = data.updatedAt as Timestamp | null;
        return {
          id:         d.id,
          name:       data.name ?? 'Untitled',
          status:     data.status ?? 'ready',
          updated_at: ts?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          template:   data.template,
          language:   data.language,
        };
      }));
      setIsLoading(false);
    });

    return unsub;
  }, [user]);

  const createProject = async (name: string, options: CreateProjectOptions = {}) => {
    if (!user) throw new Error('Not authenticated');
    setCreatePending(true);
    try {
      const ref = await addDoc(collection(db, 'projects'), {
        userId:       user.uid,
        name,
        status:       'building',
        template:     options.template ?? 'custom',
        language:     options.language ?? 'python',
        commandStyle: options.commandStyle ?? 'prefix',
        initialPrompt: options.prompt ?? '',
        createdAt:    serverTimestamp(),
        updatedAt:    serverTimestamp(),
      });
      return { id: ref.id };
    } finally {
      setCreatePending(false);
    }
  };

  const duplicateProject = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    const snap = await getDoc(doc(db, 'projects', id));
    if (!snap.exists()) throw new Error('Project not found');
    const data = snap.data();
    await addDoc(collection(db, 'projects'), {
      userId:       user.uid,
      name:         `${data.name} (Copy)`,
      status:       'building',
      template:     data.template,
      language:     data.language,
      commandStyle: data.commandStyle,
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    });
  };

  const deleteProject = async (id: string) => {
    await deleteDoc(doc(db, 'projects', id));
  };

  return { projects, isLoading, createPending, createProject, duplicateProject, deleteProject };
}

export function useProject(projectId: string | undefined) {
  const { user } = useAuth();
  const [data, setData]         = useState<Project | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) { setLoading(false); return; }
    getDoc(doc(db, 'projects', projectId)).then((snap) => {
      if (snap.exists()) {
        const d  = snap.data();
        const ts = d.updatedAt as Timestamp | null;
        setData({
          id:         snap.id,
          name:       d.name ?? 'Untitled',
          status:     d.status ?? 'ready',
          updated_at: ts?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          template:   d.template,
          language:   d.language,
        });
      }
      setLoading(false);
    });
  }, [user, projectId]);

  return { data, isLoading };
}

export function useUpdateProject() {
  return { mutateAsync: async (_arg?: any) => {}, mutate: (_arg?: any) => {}, isPending: false };
}

export function useProjectPrompts(_projectId: string | undefined) {
  return { prompts: [], isLoading: false, rerunPrompt: { mutateAsync: async () => {} } };
}

export function useProjectBuilds(_projectId: string | undefined) {
  return { data: [], isLoading: false };
}

export function useUsageStats() {
  return { data: null, isLoading: false };
}
