import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Archive,
  Trash2,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useProject, useProjectPrompts, useProjectBuilds, useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

const statusConfig = {
  building: { icon: Loader2, label: 'Building', className: 'bg-amber-500/10 text-amber-500', animate: true },
  ready: { icon: CheckCircle, label: 'Ready', className: 'bg-emerald-500/10 text-emerald-500', animate: false },
  failed: { icon: AlertCircle, label: 'Failed', className: 'bg-destructive/10 text-destructive', animate: false },
};

const buildStatusConfig = {
  pending: { icon: Clock, label: 'Pending', className: 'text-muted-foreground', animate: false },
  building: { icon: Loader2, label: 'Building', className: 'text-amber-500', animate: true },
  completed: { icon: CheckCircle, label: 'Completed', className: 'text-emerald-500', animate: false },
  failed: { icon: AlertCircle, label: 'Failed', className: 'text-destructive', animate: false },
};

export default function ProjectDetailView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(projectId);
  const { prompts, rerunPrompt } = useProjectPrompts(projectId);
  const { data: builds } = useProjectBuilds(projectId);
  const { updateProject, archiveProject, deleteProject } = useProjects();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [projectName, setProjectName] = useState('');
  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-medium mb-2">Project not found</h2>
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const config = statusConfig[project.status];
  const StatusIcon = config.icon;

  const handleRename = async () => {
    if (!projectName.trim() || projectName === project.name) return;
    await updateProject.mutateAsync({ id: project.id, name: projectName });
  };

  const handleArchive = async () => {
    await archiveProject.mutateAsync(project.id);
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    await deleteProject.mutateAsync(project.id);
    navigate('/dashboard');
  };

  const handleRerunPrompt = async () => {
    if (!selectedPromptId) return;
    await rerunPrompt.mutateAsync(selectedPromptId);
    setRerunDialogOpen(false);
    setSelectedPromptId(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className={cn("gap-1.5", config.className)}>
                <StatusIcon className={cn("w-3 h-3", config.animate && "animate-spin")} />
                {config.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Updated {format(new Date(project.updated_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>

          {project.deployed_url && (
            <Button asChild>
              <a href={project.deployed_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Live App
              </a>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="builds">Builds</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6"
          >
            <div className="glass-card p-6">
              <h3 className="font-medium mb-4">Project Summary</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium mt-1 capitalize">{project.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium mt-1">{format(new Date(project.created_at), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium mt-1">{format(new Date(project.updated_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-medium mb-4">Quick Stats</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Prompts</p>
                  <p className="text-2xl font-bold mt-1">{prompts.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Builds</p>
                  <p className="text-2xl font-bold mt-1">{builds?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Successful Builds</p>
                  <p className="text-2xl font-bold mt-1">
                    {builds?.filter(b => b.status === 'completed').length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {prompts.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <p className="text-muted-foreground">No prompts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{prompt.prompt_text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(prompt.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPromptId(prompt.id);
                          setRerunDialogOpen(true);
                        }}
                      >
                        <RotateCcw className="w-3 h-3 mr-1.5" />
                        Rerun
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Builds Tab */}
        <TabsContent value="builds">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!builds || builds.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <p className="text-muted-foreground">No builds yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {builds.map((build) => {
                  const bConfig = buildStatusConfig[build.status];
                  const BuildIcon = bConfig.icon;
                  return (
                    <div key={build.id} className="glass-card p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <BuildIcon className={cn("w-5 h-5", bConfig.className, bConfig.animate && "animate-spin")} />
                          <div>
                            <p className="text-sm font-medium">{bConfig.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(build.started_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {build.duration_seconds && (
                            <p className="text-sm text-muted-foreground">
                              Duration: {build.duration_seconds}s
                            </p>
                          )}
                        </div>
                      </div>
                      {build.error_message && (
                        <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm text-destructive">{build.error_message}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Rename */}
            <div className="glass-card p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Rename Project
              </h3>
              <div className="flex gap-3">
                <Input
                  value={projectName || project.name}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                  className="max-w-sm"
                />
                <Button
                  onClick={handleRename}
                  disabled={!projectName.trim() || projectName === project.name || updateProject.isPending}
                >
                  {updateProject.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Archive */}
            <div className="glass-card p-6">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Archive Project
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Archiving hides the project from your dashboard. You can restore it later.
              </p>
              <Button variant="outline" onClick={handleArchive} disabled={archiveProject.isPending}>
                {archiveProject.isPending ? 'Archiving...' : 'Archive Project'}
              </Button>
            </div>

            {/* Delete */}
            <div className="glass-card p-6 border-destructive/30">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-destructive">
                <Trash2 className="w-4 h-4" />
                Delete Project
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This action cannot be undone. All project data, prompts, and builds will be permanently deleted.
              </p>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                Delete Project
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Rerun Prompt Dialog */}
      <AlertDialog open={rerunDialogOpen} onOpenChange={setRerunDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rerun Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rerun this prompt? This will trigger a new build.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRerunPrompt}>
              <Play className="w-4 h-4 mr-2" />
              Rerun
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
