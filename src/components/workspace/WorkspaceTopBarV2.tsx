import { useState } from 'react';
import {
  Code2,
  Cloud,
  BarChart2,
  Shield,
  Server,
  History,
  PanelRightClose,
  Link as LinkIcon,
  Upload,
} from 'lucide-react';

// Official Discord logo (Simple Icons SVG)
function DiscordIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={style}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.03.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProjectDropdown from './ProjectDropdown';
import PublishDropdown from './PublishDropdown';
import GitHubExportDialog from './GitHubExportDialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Interface mode types
export type InterfaceMode = 'preview' | 'code' | 'cloud' | 'analytics' | 'security' | 'hosting';

interface WorkspaceTopBarV2Props {
  projectName: string;
  projectId: string;
  activeMode: InterfaceMode;
  onModeChange: (mode: InterfaceMode) => void;
  onRefreshPreview?: () => void;
  onOpenInNewTab?: () => void;
  onToggleHistory?: () => void;
  onCollapseChat?: () => void;
  isChatCollapsed?: boolean;
  previewHtml?: string;
  workspaceFiles?: Array<{ path: string; content: string }>;
}

// Mode configuration
const MODES: { id: InterfaceMode; icon: typeof Code2; label: string }[] = [
  { id: 'preview', icon: DiscordIcon as unknown as typeof Code2, label: 'Preview' },
  { id: 'code', icon: Code2, label: 'Code' },
  { id: 'cloud', icon: Cloud, label: 'Cloud' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'hosting', icon: Server, label: 'Hosting' },
];

export default function WorkspaceTopBarV2({
  projectName,
  projectId,
  activeMode,
  onModeChange,
  onToggleHistory,
  onCollapseChat,
  isChatCollapsed = false,
  previewHtml = '',
  workspaceFiles = [],
}: WorkspaceTopBarV2Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isGitHubExportOpen, setIsGitHubExportOpen] = useState(false);

  return (
    <div
      className="h-11 flex items-center px-3 gap-2 sticky top-0 z-50 flex-shrink-0"
      style={{
        background: '#1A1A1A',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Left Zone */}
      <div className="flex items-center gap-1.5">
        {/* Project dropdown */}
        <ProjectDropdown projectName={projectName} projectId={projectId} />

        {/* Separator */}
        <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.10)' }} />

        {/* History toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="h-7 w-7 flex items-center justify-center rounded-md transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onClick={onToggleHistory}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <History className="h-[15px] w-[15px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Version History</p>
          </TooltipContent>
        </Tooltip>

        {/* Collapse chat toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="h-7 w-7 flex items-center justify-center rounded-md transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onClick={onCollapseChat}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <PanelRightClose
                className={cn('h-[15px] w-[15px] transition-transform', isChatCollapsed && 'rotate-180')}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isChatCollapsed ? 'Show Chat' : 'Hide Chat'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Center Zone — Tab Pills */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-0.5">
          {MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className="flex items-center transition-all duration-150"
                style={{
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.38)',
                  borderRadius: '7px',
                  padding: isActive ? '4px 11px' : '5px 7px',
                  gap: isActive ? '5px' : undefined,
                  fontSize: '12px',
                  fontWeight: isActive ? 500 : 400,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Geist', 'DM Sans', sans-serif",
                  boxShadow: isActive ? '0 1px 6px rgba(37,99,235,0.45)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }
                }}
                onMouseLeave={e => {
                  if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }
                }}
              >
                <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                {isActive && <span>{mode.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Zone */}
      <div className="flex items-center gap-1.5">
        {/* User Avatar */}
        <Avatar className="h-6 w-6" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
          <AvatarImage src={user?.photoURL ?? undefined} />
          <AvatarFallback style={{ background: 'rgba(255,255,255,0.08)', fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Share Button */}
        <button
          className="flex items-center gap-1.5 transition-colors"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '12px',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontFamily: "'Geist', 'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
              .then(() => toast({ title: 'Link copied', description: 'Workspace link copied to clipboard.' }))
              .catch(() => toast({ title: 'Copy failed', variant: 'destructive' }));
          }}
        >
          <LinkIcon style={{ width: '13px', height: '13px' }} />
          <span>Share</span>
        </button>

        {/* GitHub Export */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-7 w-7 flex items-center justify-center rounded-md transition-colors"
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '15px', height: '15px', fill: 'currentColor' }} aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => setIsGitHubExportOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Export to GitHub
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Deploy Bot Button */}
        <PublishDropdown
          projectId={projectId}
          projectName={projectName}
          previewHtml={previewHtml}
          isOpen={isPublishOpen}
          onOpenChange={setIsPublishOpen}
        />
      </div>

      {/* GitHub Export Dialog */}
      <GitHubExportDialog
        isOpen={isGitHubExportOpen}
        onClose={() => setIsGitHubExportOpen(false)}
        projectId={projectId}
        projectName={projectName}
        files={workspaceFiles}
      />
    </div>
  );
}
