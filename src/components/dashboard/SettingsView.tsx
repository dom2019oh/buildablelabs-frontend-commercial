import { useState, useEffect, useRef } from 'react';

// ── Stack mark per plan ────────────────────────────────────────────────────────
const PLAN_COLORS: Record<string, { from: string; to: string }> = {
  free: { from: '#3b3352', to: '#108961' },
  pro:  { from: '#6366f1', to: '#a78bfa' },
  max:  { from: '#f97316', to: '#fbbf24' },
};
function StackMark({ planKey, size = 26 }: { planKey: string; size?: number }) {
  const { from, to } = PLAN_COLORS[planKey] ?? PLAN_COLORS.free;
  const uid = `sms-${planKey}`;
  return (
    <svg viewBox="0 0 36 29" fill="none" style={{ width: size, height: Math.round(size * 29 / 36), flexShrink: 0 }}>
      <defs>
        <linearGradient id={uid} x1="18" y1="0" x2="18" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0"  width="36" height="7" rx="3.5" fill={`url(#${uid})`} />
      <rect x="0" y="11" width="26" height="7" rx="3.5" fill={`url(#${uid})`} />
      <rect x="0" y="22" width="16" height="7" rx="3.5" fill={`url(#${uid})`} />
    </svg>
  );
}
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, LogOut, Mail, Key, Github, Bot, Users, FlaskConical, BookOpen, Plug, CreditCard, BarChart2, ShieldCheck, UserCircle, Puzzle, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCredits, formatCountdown, msUntilUTCMidnight } from '@/hooks/useCredits';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '@/lib/firebase';

const FONT = "'Geist', 'DM Sans', sans-serif";
const BORDER = '1px solid rgb(39,39,37)';
const ROW_DIVIDER = { borderBottom: '1px solid rgb(39,39,37)' };

const SECTIONS = [
  {
    group: 'Workspace',
    items: [
      { id: 'workspace', label: 'Workspace',          icon: Users },
      { id: 'members',   label: 'Members',            icon: Users },
      { id: 'billing',   label: 'Plans & credits',    icon: CreditCard },
      { id: 'usage',     label: 'Credits & usage',    icon: BarChart2 },
      { id: 'security',  label: 'Privacy & security', icon: ShieldCheck },
    ],
  },
  {
    group: 'Account',
    items: [
      { id: 'account', label: '__USERNAME__', icon: UserCircle },
      { id: 'labs',    label: 'Labs',         icon: FlaskConical },
    ],
  },
  {
    group: 'Knowledge',
    items: [
      { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    ],
  },
  {
    group: 'Connectors',
    items: [
      { id: 'connectors', label: 'Connectors', icon: Puzzle },
      { id: 'github',     label: 'GitHub',     icon: Github },
      { id: 'discord',    label: 'Discord',    icon: Bot },
    ],
  },
];

export default function SettingsView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const activeSection = searchParams.get('tab') || 'account';
  const setActiveSection = (id: string) => setSearchParams({ tab: id }, { replace: true });

  const { credits, subscription, totalCredits, currentPlanType, canClaimDailyBonus, claimDailyBonus, isClaimingBonus } = useCredits();
  const { getTiersForPlan } = useSubscriptionPlans();
  const { startCheckout, openBillingPortal, isLoading: checkoutLoading } = useStripeCheckout();

  const proTiers = getTiersForPlan('pro');
  const maxTiers = getTiersForPlan('max');
  const [proTierIdx, setProTierIdx] = useState(0);
  const [maxTierIdx, setMaxTierIdx] = useState(0);

  const planLabel = currentPlanType === 'free' ? 'Free' : currentPlanType === 'pro' ? 'Pro' : currentPlanType === 'max' ? 'Max' : currentPlanType === 'lite' ? 'Lite' : 'Free';

  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [knowledge, setKnowledge] = useState('');
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const isEmailProvider = user?.providerData?.some(p => p.providerId === 'password');

  const handlePasswordChange = async () => {
    setPwError('');
    if (!newPw || newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    if (!user?.email || !currentPw) { setPwError('Current password is required.'); return; }
    setIsChangingPw(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      toast({ title: 'Password updated' });
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect.'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.'
        : err.message;
      setPwError(msg);
    } finally {
      setIsChangingPw(false);
    }
  };

  useEffect(() => {
    if (profile) setDisplayName(profile.displayName || '');
    if (profile?.avatarUrl) setLocalAvatarUrl(profile.avatarUrl);
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.workspaceName) setWorkspaceName(data.workspaceName);
        if (data.knowledge) setKnowledge(data.knowledge);
      }
    }).catch(() => {});
  }, [user]);

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.charAt(0).toUpperCase() || 'U');

  const avatarUrl = localAvatarUrl || profile?.avatarUrl || user?.photoURL;

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const trimmed = displayName.trim();
      await setDoc(doc(db, 'users', user.uid), {
        displayName: trimmed || null,
        avatarUrl: avatarUrl || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmed || undefined });
      }
      toast({ title: 'Profile updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileRef = storageRef(storage, `avatars/${user.uid}/avatar.${ext}`);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(fileRef);
      setLocalAvatarUrl(url);
      await setDoc(doc(db, 'users', user.uid), {
        avatarUrl: url,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
      toast({ title: 'Avatar updated' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveWorkspace = async () => {
    if (!user) return;
    setIsSavingWorkspace(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        workspaceName: workspaceName.trim() || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: 'Workspace saved' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  const handleSaveKnowledge = async () => {
    if (!user) return;
    setIsSavingKnowledge(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        knowledge: knowledge.trim() || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: 'Knowledge saved' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* ── Left panel — full-height sticky sidebar ── */}
      <div
        className="w-64 flex-shrink-0 flex flex-col py-6 overflow-y-auto"
        style={{
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Go back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-1.5 mb-4 text-[12.5px] transition-all"
          style={{ color: 'rgb(155,152,147)', fontFamily: FONT }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgb(220,218,214)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgb(155,152,147)')}
        >
          ← Go back
        </button>

        {SECTIONS.map(({ group, items }, groupIndex) => (
          <div key={group}>
            {groupIndex > 0 && (
              <div className="mx-4 my-2" style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            )}
            <div className="mb-1">
              <p
                className="px-4 pb-1 pt-2 text-[11.5px]"
                style={{ color: 'rgb(220,218,214)', fontFamily: FONT }}
              >
                {group}
              </p>

              {group === 'Workspace' && (
                <button
                  onClick={() => setActiveSection('workspace')}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-all"
                  style={{
                    fontFamily: FONT,
                    background: activeSection === 'workspace' ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: activeSection === 'workspace' ? 'rgb(252,251,248)' : 'rgb(197,193,186)',
                    margin: '1px 4px',
                    width: 'calc(100% - 8px)',
                  }}
                  onMouseEnter={e => { if (activeSection !== 'workspace') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgb(252,251,248)'; }}}
                  onMouseLeave={e => { if (activeSection !== 'workspace') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgb(197,193,186)'; }}}
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                    style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)', color: '#fff' }}
                  >
                    {(displayName || user?.email?.split('@')[0] || 'B').slice(0,1).toUpperCase()}
                  </span>
                  <span className="truncate">{displayName ? `${displayName}'s Workspace` : 'My Workspace'}</span>
                </button>
              )}

              {items.filter(i => i.id !== 'workspace').map(item => {
                const Icon = item.icon;
                const label = item.label === '__USERNAME__' ? (displayName || user?.email?.split('@')[0] || 'Account') : item.label;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-all"
                    style={{
                      fontFamily: FONT,
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: active ? 'rgb(252,251,248)' : 'rgb(197,193,186)',
                      margin: '1px 4px',
                      width: 'calc(100% - 8px)',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgb(252,251,248)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgb(197,193,186)'; }}}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? 'rgb(252,251,248)' : 'rgb(220,218,214)', opacity: 1 }} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <div className="mt-auto px-3 pt-3" style={{ borderTop: BORDER }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] transition-all"
            style={{ color: 'rgba(239,68,68,0.7)', fontFamily: FONT }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgb(252,129,129)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Right content — ONE floating card ── */}
      <div className="flex-1 p-4 flex flex-col">
        <div
          className="flex-1 overflow-y-auto"
          style={{
            background: '#1c1c1a',
            border: '1px solid rgb(39,39,37)',
            borderRadius: '14px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div className="px-10 py-8">

          {/* ACCOUNT */}
          {activeSection === 'account' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Account settings</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Personalize how others see and interact with you on Buildable.</p>

              {/* Hidden file input for avatar */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Bot builder level */}
              <div className="pb-7 mb-7" style={ROW_DIVIDER}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Bot builder level</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)', fontFamily: FONT }}>Beta</span>
                </div>
                <p className="text-[13px] mb-4" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Showcase your bot building momentum and progress.</p>
                <div className="h-1.5 rounded-full w-full mb-2" style={{ background: 'rgb(39,39,37)' }}>
                  <div className="h-1.5 rounded-full w-[8%]" style={{ background: 'linear-gradient(90deg, #a78bfa, #6366f1)' }} />
                </div>
                <p className="text-[13px] font-medium" style={{ color: 'rgb(197,193,186)', fontFamily: FONT }}>L1: Builder</p>
              </div>

              {/* Profile */}
              <div className="pb-7 mb-7" style={ROW_DIVIDER}>
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Profile</p>
                <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Change name, avatar and banner on your profile.</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20" style={{ flexShrink: 0 }}>
                      <AvatarImage src={avatarUrl || undefined} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      <AvatarFallback className="text-xl font-bold" style={{ background: 'rgba(167,139,250,0.2)', color: '#c4b5fd' }}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isUploading && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgb(252,251,248)' }} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{displayName || 'No name set'}</p>
                    <p className="text-[12.5px] mb-2" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{user?.email}</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-[12px] px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.07)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: FONT }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                    >
                      {isUploading ? 'Uploading...' : 'Upload photo'}
                    </button>
                  </div>
                </div>

                {/* Display name row */}
                <div className="flex items-center justify-between py-4" style={{ borderTop: BORDER }}>
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Display name</p>
                    <p className="text-[13px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Your public name on Buildable.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-40 text-[13px] h-9"
                      style={{ background: 'rgb(28,28,26)', border: BORDER, color: 'rgb(252,251,248)', fontFamily: FONT }}
                    />
                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="h-9 text-[13px] px-4" style={{ background: 'rgba(255,255,255,0.07)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: FONT }}>
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                </div>

                {/* Email row */}
                <div className="flex items-center justify-between py-4" style={{ borderTop: BORDER }}>
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Email</p>
                    <p className="text-[13px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Your email address associated with your account.</p>
                  </div>
                  <span className="text-[13px] px-3 py-2 rounded-lg" style={{ background: 'rgb(28,28,26)', border: BORDER, color: 'rgb(155,152,147)', fontFamily: FONT }}>{user?.email}</span>
                </div>
              </div>

              {/* Chat suggestions */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Chat suggestions</p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Show helpful suggestions in the chat interface.</p>
                </div>
                <ChatToggle />
              </div>
            </motion.div>
          )}

          {/* WORKSPACE */}
          {activeSection === 'workspace' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Workspace</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Manage your workspace settings.</p>

              <div className="flex items-center justify-between py-5" style={ROW_DIVIDER}>
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Workspace name</p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>The display name for your workspace.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={workspaceName || (displayName ? `${displayName}'s Workspace` : 'My Workspace')}
                    onChange={e => setWorkspaceName(e.target.value)}
                    placeholder="My Workspace"
                    className="w-48 text-[13px] h-9"
                    style={{ background: 'rgb(28,28,26)', border: BORDER, color: 'rgb(252,251,248)', fontFamily: FONT }}
                  />
                  <Button onClick={handleSaveWorkspace} disabled={isSavingWorkspace} size="sm" className="h-9 text-[13px] px-4" style={{ background: 'rgba(255,255,255,0.07)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: FONT }}>
                    {isSavingWorkspace ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* MEMBERS */}
          {activeSection === 'members' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Members</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Invite people to collaborate on your bots.</p>

              <div className="flex items-center gap-3 py-5" style={ROW_DIVIDER}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-[11px] font-bold" style={{ background: 'rgba(167,139,250,0.2)', color: '#c4b5fd' }}>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{displayName || user?.email?.split('@')[0]}</p>
                  <p className="text-[12px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{user?.email}</p>
                </div>
                <span className="text-[12px] px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)', fontFamily: FONT }}>Owner</span>
              </div>

              <div className="flex items-center gap-2 py-5" style={{ color: 'rgb(120,116,110)' }}>
                <Users className="w-4 h-4" />
                <span className="text-[14px]" style={{ fontFamily: FONT }}>Team collaboration coming soon</span>
              </div>
            </motion.div>
          )}

          {/* BILLING */}
          {activeSection === 'billing' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Plans &amp; credits</h2>
              <p className="text-[14px] mb-6" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Manage your subscription plan and credit balance.</p>

              {/* Top row — 3-col grid: current plan (1) + credits (2) */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Current plan — col-span-1 */}
                <div className="col-span-1 flex flex-col justify-between gap-5 p-5 rounded-xl" style={{ background: '#272725', border: BORDER }}>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <img src="/logo-stack-white.svg" alt="Buildable" className="w-9 h-9 object-contain flex-shrink-0" />
                      <div>
                        <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>You're on {planLabel} plan</p>
                        <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
                          {currentPlanType === 'free' ? 'Upgrade anytime' : 'Manage your subscription'}
                        </p>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {(currentPlanType === 'free'
                        ? ['3 credits/day (resets at midnight)', '2 bots max', 'Simplified pipeline']
                        : currentPlanType === 'pro'
                        ? [`${subscription?.selected_credits ?? 30} credits/month`, '10 bots max', '1 month rollover']
                        : [`${subscription?.selected_credits ?? 100} credits/month`, 'Unlimited bots', '2 month rollover']
                      ).map(f => (
                        <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: 'rgb(197,193,186)', fontFamily: FONT }}>
                          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(155,152,147)' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={openBillingPortal}
                    disabled={checkoutLoading}
                    className="text-[13px] px-4 py-2 rounded-lg transition-all w-fit"
                    style={{ background: 'rgba(255,255,255,0.07)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: FONT }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                  >
                    {checkoutLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Manage'}
                  </button>
                </div>

                {/* Credits remaining — col-span-2 */}
                <div className="col-span-2 flex flex-col justify-between gap-5 p-5 rounded-xl" style={{ background: '#272725', border: BORDER, outline: '1px solid hsl(var(--border))', outlineOffset: '-1px' }}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-baseline justify-between">
                      <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>Credits remaining</p>
                      <span className="text-[32px] font-bold leading-none" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>{totalCredits}</span>
                    </div>
                    <div className="h-2 rounded-full w-full" style={{ background: 'rgb(39,39,37)' }}>
                      <div className="h-2 rounded-full transition-all" style={{
                        background: 'linear-gradient(90deg,#6366f1,#a78bfa)',
                        width: currentPlanType === 'free'
                          ? `${Math.min(100, (totalCredits / 5) * 100)}%`
                          : `${Math.min(100, (totalCredits / (subscription?.selected_credits ?? 30)) * 100)}%`,
                      }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-semibold" style={{ color: 'rgb(197,193,186)', fontFamily: "'Geist', sans-serif" }}>
                          {currentPlanType === 'free' ? 'Daily credits' : 'Monthly credits'}
                        </p>
                        <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
                          {currentPlanType === 'free' ? 'Resets daily at midnight UTC' : 'Resets on billing cycle'}
                        </p>
                      </div>
                      <span className="text-[22px] font-bold" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>
                        {currentPlanType === 'free' ? '5' : subscription?.selected_credits ?? 30}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    key: 'free',
                    name: 'Free',
                    tagline: 'Build your first Discord bot',
                    price: '$0',
                    perMonth: true,
                    features: ['3 credits/day (resets at midnight)','2 bots max','Simplified pipeline (Claude Haiku)','Buildable Labs watermark on bots','Community support'],
                    featuresLabel: "What's included",
                    isPro: false,
                  },
                  {
                    key: 'pro',
                    name: 'Pro',
                    tagline: 'For serious bot builders',
                    price: `$${proTiers[proTierIdx] ? (proTiers[proTierIdx].price_cents / 100).toFixed(0) : '18'}`,
                    perMonth: true,
                    features: ['30–300 credits/month','10 bots max','Full 8-stage pipeline (Haiku + Sonnet)','No Buildable watermark','No /buildable command','1 month credit rollover','Email support'],
                    featuresLabel: 'Everything in Free, plus',
                    isPro: true,
                  },
                  {
                    key: 'max',
                    name: 'Max',
                    tagline: 'For power users and agencies',
                    price: `$${maxTiers[maxTierIdx] ? (maxTiers[maxTierIdx].price_cents / 100).toFixed(0) : '59'}`,
                    perMonth: true,
                    features: ['100–1,000 credits/month','Unlimited bots','Priority queue','2 month credit rollover','REST API access (headless)','Custom embed domain','Early access to new features','Priority support'],
                    featuresLabel: 'Everything in Pro, plus',
                    isPro: false,
                  },
                ].map(plan => {
                  const isCurrent = currentPlanType === plan.key;
                  const isProCard = plan.key === 'pro';
                  const border = isCurrent ? '1px solid rgba(255,255,255,0.14)' : BORDER;
                  const bg = isCurrent ? '#272725' : '#0c0c0c';

                  return (
                    <div key={plan.key} className="p-5 rounded-xl flex flex-col gap-4" style={{ background: bg, border }}>
                      {/* Name + tagline */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-0.5">
                          <StackMark planKey={plan.key} size={24} />
                          <p className="text-[20px] font-bold" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>{plan.name}</p>
                        </div>
                        <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{plan.tagline}</p>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[36px] font-bold leading-none" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>{plan.price}</span>
                        <span className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>per month</span>
                      </div>

                      {/* CTA button */}
                      {plan.key === 'free' ? (
                        <button disabled className="w-full py-2.5 rounded-lg text-[14px] font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: BORDER, color: 'rgba(255,255,255,0.3)', fontFamily: "'Geist', sans-serif", cursor: 'default' }}>
                          {isCurrent ? 'Current plan' : 'Get started free'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => startCheckout(plan.key === 'pro' ? (proTiers[proTierIdx]?.id ?? '') : (maxTiers[maxTierIdx]?.id ?? ''))}
                            disabled={checkoutLoading || isCurrent}
                            className="w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all"
                            style={{
                              background: isCurrent ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.09)',
                              border: isCurrent ? BORDER : '1px solid rgba(255,255,255,0.14)',
                              color: isCurrent ? 'rgba(255,255,255,0.3)' : '#fff',
                              fontFamily: "'Geist', sans-serif",
                              cursor: isCurrent ? 'default' : 'pointer',
                            }}
                            onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.opacity = '0.88'; }}
                            onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.opacity = '1'; }}
                          >
                            {checkoutLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : isCurrent ? 'Current plan' : `Upgrade to ${plan.name}`}
                          </button>

                          {/* Tier selector — below button */}
                          <div className="relative">
                            <select
                              value={plan.key === 'pro' ? proTierIdx : maxTierIdx}
                              onChange={e => plan.key === 'pro' ? setProTierIdx(Number(e.target.value)) : setMaxTierIdx(Number(e.target.value))}
                              className="w-full appearance-none rounded-lg px-3 py-2.5 text-[13px] pr-8 outline-none"
                              style={{ background: 'rgba(255,255,255,0.05)', border: BORDER, color: 'rgb(197,193,186)', fontFamily: FONT, cursor: 'pointer' }}
                            >
                              {(plan.key === 'pro' ? proTiers : maxTiers).map((t, i) => (
                                <option key={t.id} value={i} style={{ background: '#272725' }}>{t.credits} credits / month</option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(120,116,110)' }} />
                          </div>
                        </>
                      )}

                      {/* Features */}
                      <div>
                        <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{plan.featuresLabel}</p>
                        <ul className="flex flex-col gap-2">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-2">
                              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgb(120,116,110)' }} />
                              <span className="text-[13px]" style={{ color: 'rgb(197,193,186)', fontFamily: FONT }}>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* USAGE */}
          {activeSection === 'usage' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Credits &amp; Usage</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Track and claim your daily credits.</p>

              {/* Daily credits claim card (free plan) */}
              {currentPlanType === 'free' && (
                <div className="p-5 rounded-xl mb-6" style={{ background: '#272725', border: BORDER }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>Daily Credits</p>
                      <p className="text-[13px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
                        3 free credits per day · resets at midnight UTC
                      </p>
                    </div>
                    <span className="text-[32px] font-bold" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>
                      {totalCredits}<span className="text-[18px] font-normal text-[rgb(120,116,110)]">/3</span>
                    </span>
                  </div>

                  <div className="h-2 rounded-full w-full mb-4" style={{ background: 'rgb(39,39,37)' }}>
                    <div className="h-2 rounded-full transition-all" style={{
                      background: 'linear-gradient(90deg,#6366f1,#a78bfa)',
                      width: `${Math.min(100, (totalCredits / 3) * 100)}%`,
                    }} />
                  </div>

                  {canClaimDailyBonus() ? (
                    <button
                      onClick={() => claimDailyBonus()}
                      disabled={isClaimingBonus}
                      className="w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontFamily: "'Geist', sans-serif" }}
                      onMouseEnter={e => { if (!isClaimingBonus) e.currentTarget.style.opacity = '0.88'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      {isClaimingBonus
                        ? <Loader2 className="w-4 h-4 animate-spin inline" />
                        : 'Claim 5 daily credits'}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-lg text-[14px] text-center" style={{ background: 'rgba(255,255,255,0.04)', border: BORDER, color: 'rgb(120,116,110)', fontFamily: FONT }}>
                      Credits claimed · resets in {formatCountdown(msUntilUTCMidnight())}
                    </div>
                  )}
                </div>
              )}

              {/* Paid plan credit balance */}
              {currentPlanType !== 'free' && (
                <div className="py-5" style={ROW_DIVIDER}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Credits remaining</p>
                    <span className="text-[14px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{totalCredits}</span>
                  </div>
                  <div className="h-1.5 rounded-full w-full" style={{ background: 'rgb(39,39,37)' }}>
                    <div className="h-1.5 rounded-full" style={{
                      background: 'linear-gradient(90deg, #a78bfa, #6366f1)',
                      width: `${Math.min(100, (totalCredits / (subscription?.selected_credits ?? 30)) * 100)}%`,
                    }} />
                  </div>
                  <p className="text-[13px] mt-2" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Resets on billing cycle</p>
                </div>
              )}

              <div className="py-5">
                <p className="text-[14px] font-medium mb-2" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Usage history</p>
                <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Detailed usage analytics coming soon.</p>
              </div>
            </motion.div>
          )}

          {/* SECURITY */}
          {activeSection === 'security' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Privacy &amp; Security</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Manage your security settings.</p>

              <div className="flex items-start gap-3 py-5" style={ROW_DIVIDER}>
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'rgb(120,116,110)' }} />
                <div>
                  <p className="text-[13px] mb-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Email</p>
                  <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-5" style={ROW_DIVIDER}>
                <Key className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'rgb(120,116,110)' }} />
                <div>
                  <p className="text-[13px] mb-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>User ID</p>
                  <p className="text-[13px] font-mono" style={{ color: 'rgb(155,152,147)' }}>{user?.uid}</p>
                </div>
              </div>

              {isEmailProvider ? (
                <div className="py-5">
                  <p className="text-[14px] font-medium mb-4" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Change password</p>
                  <div className="flex flex-col gap-3" style={{ maxWidth: 360 }}>
                    <Input
                      type="password"
                      placeholder="Current password"
                      value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      className="text-sm"
                      style={{ background: 'rgb(28,28,26)', border: BORDER, color: 'rgb(252,251,248)', fontFamily: FONT }}
                    />
                    <Input
                      type="password"
                      placeholder="New password (min. 6 characters)"
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      className="text-sm"
                      style={{ background: 'rgb(28,28,26)', border: BORDER, color: 'rgb(252,251,248)', fontFamily: FONT }}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      className="text-sm"
                      style={{ background: 'rgb(28,28,26)', border: BORDER, color: 'rgb(252,251,248)', fontFamily: FONT }}
                    />
                    {pwError && <p className="text-[13px]" style={{ color: '#f87171', fontFamily: FONT }}>{pwError}</p>}
                    <button
                      onClick={handlePasswordChange}
                      disabled={isChangingPw}
                      className="w-fit text-[13px] px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                      style={{ background: 'rgba(255,255,255,0.09)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: FONT }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                    >
                      {isChangingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Update password
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-5">
                  <p className="text-[14px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
                    You signed in with a social provider. Password management is handled by your sign-in provider.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* LABS */}
          {activeSection === 'labs' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Labs</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Early access features and experiments.</p>

              {[
                { label: 'Multi-bot deployments', desc: 'Deploy multiple bots from a single project.' },
                { label: 'Voice command support', desc: 'Control bots via Discord voice channels.' },
                { label: 'AI code review', desc: 'Automated review and suggestions for your bot code.' },
              ].map(feat => (
                <div key={feat.label} className="flex items-center justify-between py-5" style={ROW_DIVIDER}>
                  <div className="flex items-center gap-3">
                    <FlaskConical className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{feat.label}</p>
                      <p className="text-[13px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{feat.desc}</p>
                    </div>
                  </div>
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgb(28,28,26)', color: 'rgb(120,116,110)', border: BORDER, fontFamily: FONT }}>Soon</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* KNOWLEDGE */}
          {activeSection === 'knowledge' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Knowledge</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Set shared rules and preferences that apply to every bot in this workspace.</p>

              <div className="flex items-start gap-2 mb-6 p-4 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#818cf8' }} />
                <div>
                  <p className="text-[14px] font-medium" style={{ color: '#818cf8', fontFamily: FONT }}>Workspace knowledge</p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Custom instructions apply across all bots in your workspace.</p>
                </div>
              </div>

              <p className="text-[13px] mb-2" style={{ color: 'rgb(155,152,147)', fontFamily: FONT }}>You can:</p>
              <ul className="space-y-1.5 mb-6">
                {['Define coding style and naming conventions.', 'Set preferred libraries, frameworks, or patterns.', 'Add behavioral rules like tone, language, or formatting.'].map(t => (
                  <li key={t} className="flex items-start gap-2 text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
                    <span style={{ color: '#a78bfa' }}>•</span> {t}
                  </li>
                ))}
              </ul>

              <textarea
                value={knowledge}
                onChange={e => setKnowledge(e.target.value)}
                placeholder="Set coding style, conventions, and preferences for all your bots..."
                className="w-full h-36 resize-none rounded-lg p-4 text-[14px] outline-none mb-4"
                style={{ background: 'rgb(28,28,26)', border: BORDER, color: 'rgb(197,193,186)', fontFamily: FONT }}
              />
              <Button
                onClick={handleSaveKnowledge}
                disabled={isSavingKnowledge}
                className="text-[14px] h-10 px-5"
                style={{ background: 'rgb(255,255,255)', color: '#0c0c0c', fontFamily: FONT }}
              >
                {isSavingKnowledge ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save knowledge'}
              </Button>
            </motion.div>
          )}

          {/* CONNECTORS */}
          {activeSection === 'connectors' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Connectors</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Connect external services to your workspace.</p>

              {[
                { icon: Github, label: 'GitHub',   desc: 'Export bot code directly to a GitHub repository.', action: 'Connect',     disabled: false },
                { icon: Bot,    label: 'Discord',  desc: 'Link your Discord account to manage bot tokens.',  action: 'Connect',     disabled: false },
                { icon: Plug,   label: 'Webhooks', desc: 'Send events to external endpoints.',               action: 'Coming soon', disabled: true  },
              ].map(c => (
                <div key={c.label} className="flex items-center justify-between py-5" style={ROW_DIVIDER}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(28,28,26)', border: BORDER }}>
                      <c.icon className="w-4 h-4" style={{ color: 'rgb(197,193,186)' }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{c.label}</p>
                      <p className="text-[13px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{c.desc}</p>
                    </div>
                  </div>
                  <button
                    disabled={c.disabled}
                    className="text-[13px] px-4 py-2 rounded-lg transition-all flex-shrink-0"
                    style={{
                      background: c.disabled ? 'transparent' : 'rgba(255,255,255,0.07)',
                      border: BORDER,
                      color: c.disabled ? 'rgb(80,78,76)' : 'rgb(220,218,214)',
                      fontFamily: FONT,
                      cursor: c.disabled ? 'default' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!c.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={e => { if (!c.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                  >
                    {c.action}
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* GITHUB */}
          {activeSection === 'github' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>GitHub</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Connect your GitHub account to export bot projects.</p>

              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5" style={{ color: 'rgb(197,193,186)' }} />
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>GitHub</p>
                    <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Not connected</p>
                  </div>
                </div>
                <button
                  className="text-[13px] px-4 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: FONT }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  Connect
                </button>
              </div>
            </motion.div>
          )}

          {/* DISCORD */}
          {activeSection === 'discord' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Discord</h2>
              <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Link your Discord account to manage bot tokens and servers.</p>

              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5" style={{ color: 'rgb(197,193,186)' }} />
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Discord</p>
                    <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Not connected</p>
                  </div>
                </div>
                <button
                  className="text-[13px] px-4 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: FONT }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  Connect
                </button>
              </div>
            </motion.div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}

function ChatToggle() {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn(v => !v)}
      className="relative w-10 h-6 rounded-full flex-shrink-0 transition-all"
      style={{ background: on ? '#6366f1' : 'rgb(39,39,37)' }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full transition-all"
        style={{ background: 'rgb(252,251,248)', left: on ? '20px' : '4px' }}
      />
    </button>
  );
}
