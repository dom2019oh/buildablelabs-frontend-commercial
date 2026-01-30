import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectPrompt = Database['public']['Tables']['project_prompts']['Row'];
type ProjectBuild = Database['public']['Tables']['project_builds']['Row'];

export function useProjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user?.id,
  });

  const createProject = useMutation({
    mutationFn: async (project: Omit<ProjectInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project created', description: 'Your new project is ready!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const duplicateProject = useMutation({
    mutationFn: async (projectId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get original project
      const { data: original, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;
      if (!original) throw new Error('Project not found');

      // Create duplicate
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: `${original.name} (Copy)`,
          description: original.description,
          status: 'ready' as const,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project duplicated', description: 'A copy has been created.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const archiveProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .update({ is_archived: true })
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project archived' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject,
    updateProject,
    duplicateProject,
    deleteProject,
    archiveProject,
  };
}

export function useProject(projectId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId || !user?.id) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!projectId && !!user?.id,
  });
}

// Standalone hook for updating a project (used outside of useProjects context)
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useProjectPrompts(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const promptsQuery = useQuery({
    queryKey: ['project-prompts', projectId],
    queryFn: async () => {
      if (!projectId || !user?.id) return [];
      const { data, error } = await supabase
        .from('project_prompts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectPrompt[];
    },
    enabled: !!projectId && !!user?.id,
  });

  const rerunPrompt = useMutation({
    mutationFn: async (promptId: string) => {
      // Simulate rerunning - in real app this would trigger AI generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return promptId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-prompts', projectId] });
      toast({ title: 'Prompt rerun initiated' });
    },
  });

  return {
    prompts: promptsQuery.data ?? [],
    isLoading: promptsQuery.isLoading,
    rerunPrompt,
  };
}

export function useProjectBuilds(projectId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-builds', projectId],
    queryFn: async () => {
      if (!projectId || !user?.id) return [];
      const { data, error } = await supabase
        .from('project_builds')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectBuild[];
    },
    enabled: !!projectId && !!user?.id,
  });
}

export function useUsageStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['usage-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [projectsRes, buildsRes, promptsRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('project_builds').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('project_prompts').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      return {
        totalProjects: projectsRes.count ?? 0,
        totalBuilds: buildsRes.count ?? 0,
        totalPrompts: promptsRes.count ?? 0,
      };
    },
    enabled: !!user?.id,
  });
}
