import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Copy, 
  Trash2,
  Folder,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  id: string;
  name: string;
  status: 'building' | 'ready' | 'failed';
  updatedAt: string;
  onDuplicate: () => void;
  onDelete: () => void;
  isDuplicating?: boolean;
  isDeleting?: boolean;
}

const statusConfig = {
  building: {
    icon: Loader2,
    label: 'Building',
    className: 'text-amber-500 bg-amber-500/10',
    animate: true,
  },
  ready: {
    icon: CheckCircle,
    label: 'Ready',
    className: 'text-emerald-500 bg-emerald-500/10',
    animate: false,
  },
  failed: {
    icon: AlertCircle,
    label: 'Failed',
    className: 'text-destructive bg-destructive/10',
    animate: false,
  },
};

export default function ProjectCard({
  id,
  name,
  status,
  updatedAt,
  onDuplicate,
  onDelete,
  isDuplicating,
  isDeleting,
}: ProjectCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="group glass-card overflow-hidden hover:border-primary/30 transition-all">
        {/* Preview Area */}
        <Link 
          to={`/dashboard/project/${id}`}
          className="block h-32 bg-muted/30 flex items-center justify-center"
        >
          <Folder className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
        </Link>

        {/* Info */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link 
                to={`/dashboard/project/${id}`}
                className="font-medium text-sm truncate block hover:text-primary transition-colors"
              >
                {name}
              </Link>
              
              {/* Status Badge */}
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs mt-2",
                config.className
              )}>
                <StatusIcon className={cn("w-3 h-3", config.animate && "animate-spin")} />
                {config.label}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/project/${id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate} disabled={isDuplicating}>
                  <Copy className="w-4 h-4 mr-2" />
                  {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Updated At */}
          <p className="text-xs text-muted-foreground mt-2">
            Updated {format(new Date(updatedAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be undone.
              All project data, prompts, and builds will be permanently removed.
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
    </>
  );
}
