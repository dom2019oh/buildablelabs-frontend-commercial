import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardTopBarProps {
  onNewBot?: () => void;
}

export default function DashboardTopBar({ onNewBot }: DashboardTopBarProps) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const userName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-6 sticky top-0 z-40 flex-shrink-0"
      style={{
        background: 'hsl(240 10% 4% / 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid hsl(240 6% 12%)',
      }}
    >
      {/* Left — page context, can be overridden */}
      <div />

      {/* Right */}
      <div className="flex items-center gap-3">
        {onNewBot && (
          <button
            onClick={onNewBot}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.95)', color: '#0a0612' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.95)')}
          >
            <Plus className="w-3.5 h-3.5" />
            New Bot
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatarUrl || user?.photoURL || undefined} />
                <AvatarFallback
                  className="text-xs font-semibold"
                  style={{ background: 'hsl(240 6% 18%)', color: 'rgba(255,255,255,0.7)' }}
                >
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-2">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/billing')}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
