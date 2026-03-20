import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Loader2, LogOut, Mail, Key, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── Section groups (Lovable-style left-panel layout) ──────────────────────────

const SECTIONS = [
  {
    group: 'Account',
    items: [
      { id: 'profile',  label: 'Profile' },
      { id: 'account',  label: 'Account info' },
      { id: 'security', label: 'Privacy & security' },
    ],
  },
  {
    group: 'Billing',
    items: [
      { id: 'billing',  label: 'Plans & credits', href: '/dashboard/billing' },
    ],
  },
];

export default function SettingsView() {
  const navigate      = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast }     = useToast();

  const [activeSection, setActiveSection] = useState('profile');
  const [displayName,   setDisplayName]   = useState('');
  const [isSaving,      setIsSaving]      = useState(false);

  useEffect(() => {
    if (profile) setDisplayName(profile.displayName || '');
  }, [profile]);

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.charAt(0).toUpperCase() || 'U');

  const avatarUrl = profile?.avatarUrl || user?.photoURL;

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName });
      toast({ title: 'Profile updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <div className="flex min-h-full">
      {/* ── Left panel ── */}
      <div
        className="w-56 flex-shrink-0 flex flex-col py-4"
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 mb-3 text-sm text-white/40 hover:text-white/70 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go back
        </button>

        {SECTIONS.map(({ group, items }) => (
          <div key={group} className="mb-4">
            <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">
              {group}
            </p>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => item.href ? navigate(item.href) : setActiveSection(item.id)}
                className="w-full flex items-center px-4 py-2 text-sm text-left transition-colors rounded-lg mx-1 w-[calc(100%-8px)]"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: activeSection === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeSection === item.id ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.45)',
                }}
                onMouseEnter={e => { if (activeSection !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (activeSection !== item.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}

        {/* Sign out */}
        <div className="mt-auto px-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Right content ── */}
      <div className="flex-1 px-8 py-6 max-w-2xl">
        {activeSection === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.88)' }}>
              Profile
            </h2>
            <p className="text-sm mb-6" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
              Manage your personal details
            </p>

            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Avatar className="h-14 w-14">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-base font-bold" style={{ background: 'rgba(109,40,217,0.45)', color: '#e9d5ff' }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{displayName || 'No name set'}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</p>
              </div>
            </div>

            {/* Display name */}
            <div className="space-y-1.5 mb-5">
              <Label htmlFor="displayName" className="text-sm text-white/55">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="max-w-sm"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                }}
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </motion.div>
        )}

        {activeSection === 'account' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.88)' }}>
              Account Information
            </h2>
            <p className="text-sm mb-6" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
              Your account details
            </p>

            <div className="space-y-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Email</p>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <Key className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>User ID</p>
                  <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.55)' }}>{user?.uid}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'security' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.88)' }}>
              Privacy &amp; Security
            </h2>
            <p className="text-sm mb-6" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
              Manage your security settings
            </p>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Password changes and two-factor authentication coming soon.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
