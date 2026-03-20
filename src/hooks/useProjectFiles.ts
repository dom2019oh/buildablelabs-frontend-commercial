import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, query, where, orderBy, getDocs,
  doc, setDoc, deleteDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

interface ProjectFile {
  id: string;
  project_id: string;
  user_id: string;
  file_path: string;
  file_content: string;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

/** Deterministic Firestore document ID for a (projectId, filePath) pair */
function fileDocId(projectId: string, filePath: string): string {
  const safePath = filePath.replace(/[^a-zA-Z0-9._-]/g, (c) => '_' + c.charCodeAt(0).toString(16));
  return `${projectId}_${safePath}`;
}

function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return String(ts);
}

export function useProjectFiles(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedFiles, isLoading } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const q = query(
        collection(db, 'projectFiles'),
        where('project_id', '==', projectId),
        orderBy('file_path')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        created_at: tsToString(d.data().created_at),
        updated_at: tsToString(d.data().updated_at),
      })) as ProjectFile[];
    },
    enabled: !!projectId && !!user,
  });

  const saveFile = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      if (!projectId || !user) throw new Error('No project or user');

      const fileType = path.split('.').pop() || 'txt';
      const docId = fileDocId(projectId, path);

      await setDoc(doc(db, 'projectFiles', docId), {
        project_id: projectId,
        user_id: user.uid,
        file_path: path,
        file_content: content,
        file_type: fileType,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }, { merge: true });

      return docId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    },
  });

  const saveFiles = useMutation({
    mutationFn: async (filesToSave: Array<{ path: string; content: string }>) => {
      if (!projectId || !user) throw new Error('No project or user');

      await Promise.all(
        filesToSave.map(({ path, content }) => {
          const fileType = path.split('.').pop() || 'txt';
          return setDoc(
            doc(db, 'projectFiles', fileDocId(projectId, path)),
            {
              project_id: projectId,
              user_id: user.uid,
              file_path: path,
              file_content: content,
              file_type: fileType,
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
            },
            { merge: true }
          );
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (path: string) => {
      if (!projectId) throw new Error('No project');
      await deleteDoc(doc(db, 'projectFiles', fileDocId(projectId, path)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    },
  });

  // Sync an ad-hoc list of files to Firestore
  const syncToDatabase = useCallback(
    async (files: Array<{ path: string; content: string }>) => {
      if (!projectId || !user || files.length === 0) return;
      await saveFiles.mutateAsync(files);
    },
    [projectId, user, saveFiles]
  );

  return {
    savedFiles,
    isLoading,
    saveFile,
    saveFiles,
    deleteFile,
    syncToDatabase,
  };
}
