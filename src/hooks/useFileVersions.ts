import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, query, where, orderBy, getDocs,
  doc, getDoc, addDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

interface FileVersionFile {
  path: string;
  content: string;
}

interface FileVersion {
  id: string;
  project_id: string;
  user_id: string;
  version_number: number;
  label: string | null;
  files: FileVersionFile[];
  preview_html: string | null;
  created_at: string;
  message_id: string | null;
}

function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  return String(ts);
}

export function useFileVersions(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: versions, isLoading } = useQuery({
    queryKey: ['file-versions', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const q = query(
        collection(db, 'fileVersions'),
        where('project_id', '==', projectId),
        orderBy('version_number', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        files: (d.data().files as FileVersionFile[]) || [],
        created_at: tsToString(d.data().created_at),
      })) as FileVersion[];
    },
    enabled: !!projectId && !!user,
  });

  const latestVersion = versions?.[0]?.version_number ?? 0;

  const createVersion = useMutation({
    mutationFn: async ({
      files,
      previewHtml,
      label,
      messageId,
    }: {
      files: Array<{ path: string; content: string }>;
      previewHtml?: string;
      label?: string;
      messageId?: string;
    }) => {
      if (!projectId || !user) throw new Error('No project or user');

      const newVersionNumber = latestVersion + 1;

      const ref = await addDoc(collection(db, 'fileVersions'), {
        project_id: projectId,
        user_id: user.uid,
        version_number: newVersionNumber,
        label: label || `Version ${newVersionNumber}`,
        files,
        preview_html: previewHtml ?? null,
        message_id: messageId ?? null,
        created_at: serverTimestamp(),
      });

      return {
        id: ref.id,
        project_id: projectId,
        user_id: user.uid,
        version_number: newVersionNumber,
        label: label || `Version ${newVersionNumber}`,
        files,
        preview_html: previewHtml ?? null,
        message_id: messageId ?? null,
        created_at: new Date().toISOString(),
      } as FileVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-versions', projectId] });
    },
  });

  const getVersion = async (versionId: string): Promise<FileVersion | null> => {
    const snap = await getDoc(doc(db, 'fileVersions', versionId));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      id: snap.id,
      ...d,
      files: (d.files as FileVersionFile[]) || [],
      created_at: tsToString(d.created_at),
    } as FileVersion;
  };

  const getVersionByNumber = (versionNumber: number): FileVersion | undefined =>
    versions?.find((v) => v.version_number === versionNumber);

  return {
    versions: versions ?? [],
    latestVersion,
    isLoading,
    createVersion,
    getVersion,
    getVersionByNumber,
  };
}
