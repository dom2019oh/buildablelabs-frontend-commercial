import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

// Type for database row (files is JSONB)
interface FileVersionRow {
  id: string;
  project_id: string;
  user_id: string;
  version_number: number;
  label: string | null;
  files: unknown; // JSONB from database
  preview_html: string | null;
  created_at: string;
  message_id: string | null;
}

export function useFileVersions(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all versions for a project
  const { data: versions, isLoading } = useQuery({
    queryKey: ['file-versions', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('file_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      
      // Transform JSONB files to typed array
      return (data as FileVersionRow[]).map(row => ({
        ...row,
        files: (row.files as FileVersionFile[]) || [],
      })) as FileVersion[];
    },
    enabled: !!projectId && !!user,
  });

  // Get the latest version number
  const latestVersion = versions?.[0]?.version_number ?? 0;

  // Create a new version snapshot
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

      const { data, error } = await supabase
        .from('file_versions')
        .insert({
          project_id: projectId,
          user_id: user.id,
          version_number: newVersionNumber,
          label: label || `Version ${newVersionNumber}`,
          files: files,
          preview_html: previewHtml,
          message_id: messageId,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform back to FileVersion type
      return {
        ...data,
        files: (data.files as unknown as FileVersionFile[]) || [],
      } as FileVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-versions', projectId] });
    },
  });

  // Get a specific version
  const getVersion = async (versionId: string): Promise<FileVersion | null> => {
    const { data, error } = await supabase
      .from('file_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) return null;
    
    return {
      ...data,
      files: (data.files as unknown as FileVersionFile[]) || [],
    } as FileVersion;
  };

  // Get version by number
  const getVersionByNumber = (versionNumber: number): FileVersion | undefined => {
    return versions?.find(v => v.version_number === versionNumber);
  };

  return {
    versions: versions ?? [],
    latestVersion,
    isLoading,
    createVersion,
    getVersion,
    getVersionByNumber,
  };
}
