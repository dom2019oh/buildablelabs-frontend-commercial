import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Server, ScrollText, KeyRound, Webhook,
  AlertTriangle, GitBranch, Copy, Eye, EyeOff, Plus,
  Trash2, RefreshCw, RotateCcw, Play, Pause, Globe,
  CheckCircle2, XCircle, Clock, ChevronRight, Terminal,
  Loader2, Bell, BellOff, Filter, Download, UploadCloud,
  Radio, Hammer, WifiOff, Shield, Save, LayoutDashboard,
  Pencil, MessageSquare, Zap, Coins, Calendar, User,
  Hash, ToggleLeft, Copy as CopyIcon, Trash2 as DeleteIcon,
} from 'lucide-react';
import { useProject, useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'hosting' | 'logs' | 'env' | 'callbacks' | 'errors' | 'deployments';

interface EnvVar { key: string; value: string; revealed: boolean }

interface LogEntry {
  id: string; ts: string; level: 'INFO' | 'WARN' | 'ERROR'; source: 'internal' | 'external'; msg: string;
}

interface Deployment {
  id: string; version: string; ts: string;
  status: 'active' | 'rolled-back' | 'failed';
  trigger: string; sha: string;
}

interface ErrorEntry {
  id: string; ts: string; type: string; msg: string; trace: string; count: number; resolved: boolean;
}

// ── Firestore env var helpers ──────────────────────────────────────────────────
async function loadEnvVars(projectId: string): Promise<Omit<EnvVar, 'revealed'>[]> {
  const snap = await getDoc(doc(db, 'projectEnvVars', projectId));
  if (!snap.exists()) return [];
  return (snap.data().vars ?? []) as Omit<EnvVar, 'revealed'>[];
}

async function saveEnvVars(projectId: string, vars: EnvVar[]) {
  await setDoc(doc(db, 'projectEnvVars', projectId), {
    vars: vars.map(({ key, value }) => ({ key, value })),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ── Placeholder data ───────────────────────────────────────────────────────────

const MOCK_LOGS: LogEntry[] = [
  { id: '1', ts: new Date(Date.now() - 12000).toISOString(),   level: 'INFO',  source: 'internal', msg: 'Bot connected to Discord gateway (shard 0/1)' },
  { id: '2', ts: new Date(Date.now() - 35000).toISOString(),   level: 'INFO',  source: 'internal', msg: '!play invoked by user sarah_m in #music-bot-test' },
  { id: '3', ts: new Date(Date.now() - 60000).toISOString(),   level: 'WARN',  source: 'internal', msg: 'Spotify API rate limit approaching (88%)' },
  { id: '4', ts: new Date(Date.now() - 90000).toISOString(),   level: 'ERROR', source: 'internal', msg: 'YTDLError: Unable to extract video info' },
  { id: '5', ts: new Date(Date.now() - 120000).toISOString(),  level: 'INFO',  source: 'external', msg: 'INTERACTION_CREATE: /help (guild 8821…)' },
  { id: '6', ts: new Date(Date.now() - 200000).toISOString(),  level: 'INFO',  source: 'external', msg: 'GUILD_MEMBER_ADD: user joined server' },
  { id: '7', ts: new Date(Date.now() - 400000).toISOString(),  level: 'WARN',  source: 'external', msg: 'RESUMED: gateway reconnect after network blip' },
];

const MOCK_DEPLOYMENTS: Deployment[] = [
  { id: 'd1', version: 'v0.4.2', ts: new Date(Date.now() - 3600000).toISOString(),    status: 'active',      trigger: 'AI Build',    sha: 'a1b2c3d' },
  { id: 'd2', version: 'v0.4.1', ts: new Date(Date.now() - 86400000).toISOString(),   status: 'rolled-back', trigger: 'AI Build',    sha: 'e4f5a6b' },
  { id: 'd3', version: 'v0.4.0', ts: new Date(Date.now() - 172800000).toISOString(),  status: 'rolled-back', trigger: 'AI Build',    sha: 'c7d8e9f' },
  { id: 'd4', version: 'v0.3.1', ts: new Date(Date.now() - 259200000).toISOString(),  status: 'rolled-back', trigger: 'Manual push', sha: '0a1b2c3' },
];

const MOCK_ERRORS: ErrorEntry[] = [
  {
    id: 'e1', ts: new Date(Date.now() - 90000).toISOString(), count: 3, resolved: false,
    type: 'YTDLError',
    msg: 'Unable to extract video info from provided URL',
    trace: `Traceback (most recent call last):\n  File "bot.py", line 142, in play_cmd\n    info = await loop.run_in_executor(None, ytdl.extract_info, url)\n  File "/usr/lib/python3.11/concurrent/futures/thread.py", line 58, in run\n    result = self.fn(*self.args, **self.kwargs)\nytdl.utils.DownloadError: ERROR: Unable to extract info`,
  },
  {
    id: 'e2', ts: new Date(Date.now() - 3600000).toISOString(), count: 1, resolved: true,
    type: 'CommandInvokeError',
    msg: 'Missing required argument: query',
    trace: `discord.ext.commands.errors.MissingRequiredArgument: query is a required argument that is missing.\n  In command "play"`,
  },
];

// ── Constants ──────────────────────────────────────────────────────────────────

const FONT = "'Geist', 'DM Sans', sans-serif";
const BORDER = '1px solid rgb(39,39,37)';
const ROW_DIVIDER = { borderBottom: '1px solid rgb(39,39,37)' };

const TABS: { id: Tab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'overview',    icon: LayoutDashboard, label: 'Overview'      },
  { id: 'hosting',     icon: Server,          label: 'Hosting'       },
  { id: 'logs',        icon: ScrollText,      label: 'Logs'          },
  { id: 'env',         icon: KeyRound,        label: 'Environment'   },
  { id: 'callbacks',   icon: Webhook,         label: 'Callbacks'     },
  { id: 'errors',      icon: AlertTriangle,   label: 'Error Handlers'},
  { id: 'deployments', icon: GitBranch,       label: 'Deployments'   },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function BotSettingsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: project, isLoading } = useProject(projectId);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const activeTab = (searchParams.get('tab') as Tab) || 'overview';
  const setActiveTab = (id: Tab) => setSearchParams({ tab: id }, { replace: true });

  // Overview state
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [buildCount, setBuildCount] = useState<number | null>(null);
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [localProjectName, setLocalProjectName] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ENV state
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [envLoading, setEnvLoading] = useState(false);
  const [envSaving, setEnvSaving] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setEnvLoading(true);
    loadEnvVars(projectId)
      .then(vars => setEnvVars(vars.map(v => ({ ...v, revealed: false }))))
      .catch(() => {})
      .finally(() => setEnvLoading(false));
  }, [projectId]);

  // Fetch overview data with real-time listeners (survives restarts/refreshes)
  useEffect(() => {
    if (!projectId) return;

    // One-time fetch for project metadata
    getDoc(doc(db, 'projects', projectId)).then(snap => {
      if (!snap.exists()) return;
      const d = snap.data() as any;
      if (d.createdAt?.toDate) setCreatedAt(d.createdAt.toDate());
      if (d.isPublic !== undefined) setIsPublic(d.isPublic);
    }).catch(() => {});

    // Real-time message count + credits sum (from file_summary messages)
    const msgsUnsub = onSnapshot(
      query(collection(db, 'projectMessages'), where('project_id', '==', projectId)),
      (snap) => {
        setMessageCount(snap.size);
        let credits = 0;
        snap.forEach(d => {
          const meta = d.data().metadata;
          if (meta?.type === 'file_summary' && typeof meta?.creditsUsed === 'number') {
            credits += meta.creditsUsed;
          }
        });
        setCreditsUsed(credits);
      },
      () => { setMessageCount(0); setCreditsUsed(0); }
    );

    // Real-time build count
    const buildsUnsub = onSnapshot(
      query(collection(db, 'generationSessions'), where('project_id', '==', projectId)),
      (snap) => setBuildCount(snap.size),
      () => setBuildCount(0)
    );

    return () => { msgsUnsub(); buildsUnsub(); };
  }, [projectId]);

  // Sync name input with project name
  useEffect(() => {
    if (project?.name) setNameInput(project.name);
  }, [project?.name]);

  const handleSaveName = async () => {
    if (!projectId || !nameInput.trim()) return;
    setIsSavingName(true);
    try {
      await setDoc(doc(db, 'projects', projectId), { name: nameInput.trim(), updatedAt: serverTimestamp() }, { merge: true });
      setLocalProjectName(nameInput.trim());
    } catch { /* ignore */ }
    setIsSavingName(false);
    setEditingName(false);
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    setIsDeletingProject(true);
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      navigate('/dashboard');
    } catch { setIsDeletingProject(false); }
  };

  const handleToggleVisibility = async () => {
    if (!projectId) return;
    const next = !isPublic;
    setIsPublic(next);
    await setDoc(doc(db, 'projects', projectId), { isPublic: next, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
  };

  const handleSaveEnv = async () => {
    if (!projectId) return;
    setEnvSaving(true);
    await saveEnvVars(projectId, envVars).catch(() => {});
    setEnvSaving(false);
  };

  const handleAddEnvVar = async () => {
    if (!newKey.trim()) return;
    const updated = [...envVars, { key: newKey.trim(), value: newVal, revealed: false }];
    setEnvVars(updated);
    setNewKey(''); setNewVal('');
    if (projectId) await saveEnvVars(projectId, updated).catch(() => {});
  };

  const handleDeleteEnvVar = async (i: number) => {
    const updated = envVars.filter((_, j) => j !== i);
    setEnvVars(updated);
    if (projectId) await saveEnvVars(projectId, updated).catch(() => {});
  };

  // Logs state
  const [logFilter, setLogFilter] = useState<'all' | 'INFO' | 'WARN' | 'ERROR'>('all');
  const [logSource, setLogSource] = useState<'all' | 'internal' | 'external'>('all');
  const filteredLogs = MOCK_LOGS.filter(l =>
    (logFilter === 'all' || l.level === logFilter) &&
    (logSource === 'all' || l.source === logSource)
  );

  // Errors state
  const [expandedError, setExpandedError] = useState<string | null>(null);

  // Hosting
  const [botRunning, setBotRunning] = useState(true);

  // Callbacks
  const [callbacks, setCallbacks] = useState([
    { id: 'cb1', event: 'on_message',    url: 'https://hooks.example.com/msg',  active: true  },
    { id: 'cb2', event: 'on_guild_join', url: 'https://hooks.example.com/join', active: false },
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
      </div>
    );
  }

  const projectName = localProjectName ?? project?.name ?? 'Bot Project';
  const projectStatus = project?.status ?? 'ready';
  const statusCfg = {
    ready:    { icon: Radio,   color: '#22c55e', label: 'Online'   },
    building: { icon: Hammer,  color: '#f59e0b', label: 'Building' },
    failed:   { icon: WifiOff, color: '#6b7280', label: 'Offline'  },
  }[projectStatus] ?? { icon: WifiOff, color: '#6b7280', label: 'Offline' };
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex" style={{ minHeight: '100vh', fontFamily: FONT }}>

      {/* ── Left panel ───────────────────────────────────────────────────── */}
      <div
        className="w-64 flex-shrink-0 flex flex-col py-6 overflow-y-auto"
        style={{ height: '100vh', position: 'sticky', top: 0 }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(`/dashboard/project/${projectId}`)}
          className="flex items-center gap-2 px-4 py-1.5 mb-4 text-[12.5px] transition-all"
          style={{ color: 'rgb(155,152,147)', fontFamily: FONT }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgb(220,218,214)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgb(155,152,147)')}
        >
          ← Workspace
        </button>

        {/* Bot name + status */}
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'rgb(220,218,214)', fontFamily: FONT }}>
              {projectName}
            </p>
            <StatusIcon className="w-3 h-3 flex-shrink-0" style={{ color: statusCfg.color }} />
          </div>
          <p className="text-[11.5px] mt-0.5" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>Bot Settings</p>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />

        {/* Nav items */}
        <div className="px-2">
          <p
            className="px-2 pb-1 pt-1 text-[11.5px]"
            style={{ color: 'rgb(220,218,214)', fontFamily: FONT }}
          >
            Configuration
          </p>
          {TABS.map(({ id, icon: Icon, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
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
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right content — floating card ────────────────────────────────── */}
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

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Bot settings</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Manage your bot's details, visibility and preferences.</p>

                {/* ── Overview card ── */}
                <div className="rounded-2xl p-6 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: BORDER }}>
                  <p className="text-[13px] font-semibold mb-5" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Overview</p>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                    {/* Bot name */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Bot name</p>
                      {editingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                            className="text-[15px] font-semibold px-2 py-0.5 rounded-lg outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', border: BORDER, color: 'rgb(252,251,248)', fontFamily: FONT, width: 180 }}
                          />
                          <button onClick={handleSaveName} disabled={isSavingName}
                            className="text-xs px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgb(220,218,214)', border: BORDER, fontFamily: FONT }}>
                            {isSavingName ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                          </button>
                          <button onClick={() => setEditingName(false)} className="text-xs px-2 py-1 rounded-lg"
                            style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingName(true)} className="flex items-center gap-2 group">
                          <span className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>{projectName}</span>
                          <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'rgb(120,116,110)' }} />
                        </button>
                      )}
                    </div>

                    {/* Bot ID */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Bot ID</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: 'monospace' }}>{projectId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(projectId ?? '');
                            toast({ title: 'Copied to clipboard', description: 'Bot ID copied.' });
                          }}
                          className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" style={{ color: 'rgb(120,116,110)' }} />
                        </button>
                      </div>
                    </div>

                    {/* Owner */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Owner</p>
                      <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT, textDecoration: 'underline', textDecorationColor: 'rgb(80,78,74)', textUnderlineOffset: 3 }}>
                        {profile?.displayName || user?.email?.split('@')[0] || 'You'}
                      </p>
                    </div>

                    {/* Created at */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Created at</p>
                      <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>
                        {createdAt ? format(createdAt, 'yyyy-MM-dd HH:mm') : '—'}
                      </p>
                    </div>

                    {/* Messages */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Messages</p>
                      <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>
                        {messageCount !== null ? messageCount.toLocaleString() : <span className="opacity-40">—</span>}
                      </p>
                    </div>

                    {/* Build count */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>AI builds</p>
                      <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>
                        {buildCount !== null ? buildCount.toLocaleString() : <span className="opacity-40">—</span>}
                      </p>
                    </div>

                    {/* Credits used */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Credits used</p>
                      <p className="text-[15px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>
                        {creditsUsed !== null ? creditsUsed.toLocaleString() : <span className="opacity-40">—</span>}
                      </p>
                    </div>

                    {/* Language */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Language</p>
                      <p className="text-[15px] font-semibold capitalize" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>
                        {project?.language ?? 'Python'}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-[11.5px] mb-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Status</p>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-3 h-3" style={{ color: statusCfg.color }} />
                        <p className="text-[15px] font-semibold" style={{ color: statusCfg.color, fontFamily: FONT }}>{statusCfg.label}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Settings rows ── */}
                <div className="rounded-2xl overflow-hidden mb-5" style={{ border: BORDER }}>
                  {/* Visibility */}
                  <SettingsRow
                    label="Bot visibility"
                    desc={isPublic ? 'Your bot is publicly discoverable in Explore.' : 'Your bot is private — only you can see it.'}
                    action={
                      <Toggle active={isPublic} onToggle={handleToggleVisibility} />
                    }
                  />
                  {/* Rename */}
                  <SettingsRow
                    label="Rename bot"
                    desc="Update your bot's display name."
                    action={
                      <RowBtn label="Rename" onClick={() => { setEditingName(true); setActiveTab('overview'); }} />
                    }
                  />
                  {/* Duplicate */}
                  <SettingsRow
                    label="Duplicate bot"
                    desc="Create a copy of this bot as a new project."
                    action={<RowBtn label="Duplicate" onClick={() => {}} />}
                    last
                  />
                </div>

                {/* ── Danger zone ── */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="flex items-start justify-between px-6 py-5 gap-4">
                    <div>
                      <p className="text-[14px] font-semibold mb-0.5" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Delete bot</p>
                      <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Permanently delete this bot and all its files. This cannot be undone.</p>
                    </div>
                    {confirmDelete ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Are you sure?</span>
                        <button onClick={handleDeleteProject} disabled={isDeletingProject}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: '#ef4444', color: '#fff', fontFamily: FONT }}>
                          {isDeletingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yes, delete'}
                        </button>
                        <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 rounded-lg text-xs"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgb(197,193,186)', border: BORDER, fontFamily: FONT }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(true)}
                        className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ background: '#ef4444', color: '#fff', fontFamily: FONT }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── HOSTING ── */}
            {activeTab === 'hosting' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Hosting</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Manage deployment region, runtime status and resource usage.</p>

                {/* Status */}
                <div className="pb-7 mb-7" style={ROW_DIVIDER}>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Runtime status</p>
                  <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Start, stop or restart your bot process on the hosting server.</p>
                  <div className="flex items-center justify-between mb-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: BORDER }}>
                    <div className="flex items-center gap-3">
                      {botRunning
                        ? <span className="relative flex w-2 h-2"><span className="animate-ping absolute w-full h-full rounded-full opacity-60 bg-green-500" /><span className="relative w-2 h-2 rounded-full bg-green-500" /></span>
                        : <span className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
                      }
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: botRunning ? '#22c55e' : 'rgb(120,116,110)', fontFamily: FONT }}>{botRunning ? 'Running' : 'Stopped'}</p>
                        <p className="text-[11.5px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>EU West (Railway) · Python 3.11 · Uptime 4d 12h 33m</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <SettingsBtn icon={botRunning ? Pause : Play} label={botRunning ? 'Stop' : 'Start'} onClick={() => setBotRunning(v => !v)} danger={botRunning} />
                      <SettingsBtn icon={RefreshCw} label="Restart" onClick={() => {}} />
                      <SettingsBtn icon={UploadCloud} label="Redeploy" onClick={() => {}} />
                    </div>
                  </div>
                </div>

                {/* Resource usage */}
                <div className="pb-7 mb-7" style={ROW_DIVIDER}>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Resource usage</p>
                  <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Live utilisation metrics for your bot container.</p>
                  <div className="grid grid-cols-2 gap-x-10 gap-y-4 max-w-lg">
                    <ResourceBar label="CPU"       pct={18} color="#60a5fa" />
                    <ResourceBar label="Memory"    pct={42} color="#a78bfa" />
                    <ResourceBar label="Disk"      pct={11} color="#34d399" />
                    <ResourceBar label="Bandwidth" pct={6}  color="#fbbf24" />
                  </div>
                </div>

                {/* Network */}
                <div>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Network</p>
                  <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Connection endpoints and outbound IPs for firewall rules.</p>
                  <div className="space-y-0 max-w-lg rounded-xl overflow-hidden" style={{ border: BORDER }}>
                    <NetRow label="Internal endpoint" value="bot-svc-internal:8000" />
                    <NetRow label="Discord gateway"   value="gateway.discord.gg (WSS)" />
                    <NetRow label="Outbound IPs"      value="104.21.0.0/16" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── LOGS ── */}
            {activeTab === 'logs' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Logs</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Real-time stdout/stderr and Discord gateway events from your bot.</p>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <div className="flex rounded-lg overflow-hidden" style={{ border: BORDER }}>
                    {(['all','INFO','WARN','ERROR'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setLogFilter(f)}
                        className="px-3 py-1.5 text-xs transition-colors"
                        style={{
                          background: logFilter === f ? 'rgba(255,255,255,0.07)' : 'transparent',
                          color: logFilter === f
                            ? f === 'ERROR' ? '#f87171' : f === 'WARN' ? '#fbbf24' : 'rgb(220,218,214)'
                            : 'rgb(120,116,110)',
                          borderRight: '1px solid rgb(39,39,37)',
                          fontFamily: FONT,
                        }}
                      >{f === 'all' ? 'All' : f}</button>
                    ))}
                  </div>
                  <div className="flex rounded-lg overflow-hidden" style={{ border: BORDER }}>
                    {(['all','internal','external'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setLogSource(s)}
                        className="px-3 py-1.5 text-xs capitalize transition-colors"
                        style={{
                          background: logSource === s ? 'rgba(255,255,255,0.07)' : 'transparent',
                          color: logSource === s ? 'rgb(220,218,214)' : 'rgb(120,116,110)',
                          borderRight: '1px solid rgb(39,39,37)',
                          fontFamily: FONT,
                        }}
                      >{s === 'all' ? 'All sources' : s}</button>
                    ))}
                  </div>
                  <button className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>

                {/* Log terminal */}
                <div className="rounded-xl overflow-hidden font-mono text-xs" style={{ background: 'rgba(0,0,0,0.35)', border: BORDER }}>
                  <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid rgb(39,39,37)', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>
                      <Terminal className="w-3 h-3 inline mr-1.5" />
                      {filteredLogs.length} entries
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#22c55e', fontFamily: FONT }}>
                      <span className="relative flex w-1.5 h-1.5"><span className="animate-ping absolute w-full h-full rounded-full opacity-60 bg-green-500" /><span className="relative w-1.5 h-1.5 rounded-full bg-green-500" /></span>
                      Live
                    </span>
                  </div>
                  {filteredLogs.length === 0 ? (
                    <p className="px-4 py-8 text-center" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>No matching log entries.</p>
                  ) : filteredLogs.map(l => (
                    <div key={l.id} className="flex gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span className="flex-shrink-0 w-[130px] tabular-nums" style={{ color: 'rgb(120,116,110)' }}>{format(new Date(l.ts), 'HH:mm:ss.SSS')}</span>
                      <span className="flex-shrink-0 w-12 font-bold" style={{ color: l.level === 'ERROR' ? '#f87171' : l.level === 'WARN' ? '#fbbf24' : '#60a5fa' }}>{l.level}</span>
                      <span className="flex-shrink-0 w-16" style={{ color: 'rgb(100,97,92)' }}>[{l.source}]</span>
                      <span className="flex-1 break-all" style={{ color: 'rgb(197,193,186)' }}>{l.msg}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── ENVIRONMENT ── */}
            {activeTab === 'env' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Environment Variables</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Securely stored secrets accessible to your bot at runtime. Encrypted at rest.</p>

                {/* Security notice */}
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6 text-[12.5px]"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)', color: '#fbbf24', fontFamily: FONT }}>
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  Variables are only accessible to you and encrypted in storage. Never share your tokens.
                </div>

                {/* Existing vars */}
                {envLoading ? (
                  <div className="flex items-center gap-2 py-4" style={{ color: 'rgb(120,116,110)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </div>
                ) : (
                  <div className="pb-7 mb-7" style={ROW_DIVIDER}>
                    <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Variables</p>
                    <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{envVars.length} variable{envVars.length !== 1 ? 's' : ''} configured.</p>
                    <div className="space-y-2 max-w-2xl">
                      {envVars.map((v, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-mono w-44 truncate"
                            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgb(197,193,186)', border: BORDER }}>{v.key}</div>
                          <div className="flex-1 flex items-center rounded-lg px-3 py-2 text-xs font-mono"
                            style={{ background: 'rgba(255,255,255,0.04)', border: BORDER, color: 'rgb(120,116,110)' }}>
                            <span className="flex-1 truncate">{v.revealed ? v.value : '•'.repeat(Math.min(v.value.length, 20))}</span>
                          </div>
                          <IconBtn icon={v.revealed ? EyeOff : Eye} onClick={() => setEnvVars(vars => vars.map((x, j) => j === i ? { ...x, revealed: !x.revealed } : x))} title={v.revealed ? 'Hide' : 'Reveal'} />
                          <IconBtn icon={Copy} onClick={() => navigator.clipboard.writeText(v.value)} title="Copy value" />
                          <IconBtn icon={Trash2} onClick={() => handleDeleteEnvVar(i)} title="Delete" danger />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add new */}
                <div>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Add variable</p>
                  <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>New variables are available to your bot on next deploy.</p>
                  <div className="flex items-center gap-2 max-w-2xl">
                    <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="VARIABLE_NAME"
                      className="flex-shrink-0 w-44 px-3 py-2 rounded-lg text-xs font-mono outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: 'monospace' }} />
                    <input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="value" type="password"
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: BORDER, color: 'rgb(220,218,214)', fontFamily: 'monospace' }} />
                    <button onClick={handleAddEnvVar} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgb(220,218,214)', border: BORDER, fontFamily: FONT }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                    <button onClick={handleSaveEnv} disabled={envSaving} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors ml-auto"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgb(120,116,110)', border: BORDER, fontFamily: FONT }}>
                      {envSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── CALLBACKS ── */}
            {activeTab === 'callbacks' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Callbacks & Webhooks</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Outgoing HTTP calls triggered when Discord events fire on your bot.</p>

                <div className="pb-7 mb-7" style={ROW_DIVIDER}>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Active endpoints</p>
                  <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{callbacks.length} endpoint{callbacks.length !== 1 ? 's' : ''} configured.</p>
                  <div className="space-y-2 max-w-2xl">
                    {callbacks.map(cb => (
                      <div key={cb.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: BORDER }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono font-semibold" style={{ color: '#60a5fa' }}>{cb.event}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgb(120,116,110)' }}>{cb.url}</p>
                        </div>
                        <button onClick={() => setCallbacks(cbs => cbs.map(c => c.id === cb.id ? { ...c, active: !c.active } : c))}
                          className="flex-shrink-0 text-xs px-2.5 py-1 rounded-md transition-colors"
                          style={{
                            background: cb.active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                            color: cb.active ? '#22c55e' : 'rgb(120,116,110)',
                            border: `1px solid ${cb.active ? 'rgba(34,197,94,0.25)' : 'rgb(39,39,37)'}`,
                            fontFamily: FONT,
                          }}>
                          {cb.active ? 'Active' : 'Disabled'}
                        </button>
                        <IconBtn icon={Trash2} onClick={() => setCallbacks(cbs => cbs.filter(c => c.id !== cb.id))} title="Remove" danger />
                      </div>
                    ))}
                    <button className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl transition-colors w-full max-w-2xl"
                      style={{ color: 'rgb(120,116,110)', border: '1px dashed rgb(39,39,37)', fontFamily: FONT }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'rgb(220,218,214)'; e.currentTarget.style.borderColor = 'rgb(80,78,74)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgb(120,116,110)'; e.currentTarget.style.borderColor = 'rgb(39,39,37)'; }}>
                      <Plus className="w-3.5 h-3.5" /> Add webhook endpoint
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Available Discord events</p>
                  <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>These events can trigger your webhook endpoints.</p>
                  <div className="flex flex-wrap gap-2">
                    {['on_message','on_reaction_add','on_guild_join','on_member_join','on_voice_state_update','on_command_error','on_ready'].map(ev => (
                      <span key={ev} className="px-2.5 py-1 rounded-full text-xs font-mono"
                        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgb(120,116,110)', border: BORDER }}>{ev}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ERRORS ── */}
            {activeTab === 'errors' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Error Handlers</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Runtime exceptions captured from your bot process. Resolve them here.</p>

                <div className="pb-7 mb-7" style={ROW_DIVIDER}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[15px] font-semibold mb-0.5" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Email notifications</p>
                      <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Get alerted when new errors are captured.</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', fontFamily: FONT }}>
                      <Bell className="w-3.5 h-3.5" /> Enabled
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Captured errors</p>
                  <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{MOCK_ERRORS.filter(e => !e.resolved).length} unresolved error{MOCK_ERRORS.filter(e => !e.resolved).length !== 1 ? 's' : ''}.</p>
                  <div className="space-y-3 max-w-2xl">
                    {MOCK_ERRORS.map(err => (
                      <div key={err.id} className="rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${err.resolved ? 'rgb(39,39,37)' : 'rgba(248,113,113,0.25)'}`, background: err.resolved ? 'rgba(255,255,255,0.02)' : 'rgba(239,68,68,0.04)' }}>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-left"
                          onClick={() => setExpandedError(expandedError === err.id ? null : err.id)}>
                          <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: err.resolved ? 'rgb(100,97,92)' : '#f87171' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold font-mono" style={{ color: err.resolved ? 'rgb(120,116,110)' : '#f87171' }}>{err.type}</p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgb(120,116,110)' }}>{err.msg}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {err.count > 1 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>×{err.count}</span>}
                            {err.resolved && <span className="text-xs" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>Resolved</span>}
                            <span className="text-xs" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>{formatDistanceToNow(new Date(err.ts), { addSuffix: true })}</span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform" style={{ color: 'rgb(100,97,92)', transform: expandedError === err.id ? 'rotate(90deg)' : 'none' }} />
                          </div>
                        </button>
                        {expandedError === err.id && (
                          <div className="px-4 pb-4" style={{ borderTop: '1px solid rgb(39,39,37)' }}>
                            <pre className="mt-3 p-3 rounded-lg text-xs overflow-x-auto"
                              style={{ background: 'rgba(0,0,0,0.3)', color: '#f87171', fontFamily: 'monospace', lineHeight: '1.6' }}>{err.trace}</pre>
                            {!err.resolved && (
                              <button className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                                style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', fontFamily: FONT }}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark as resolved
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── DEPLOYMENTS ── */}
            {activeTab === 'deployments' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: "'Geist', sans-serif", color: 'rgb(252,251,248)' }}>Deployment History</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Every build deployed for this bot. Roll back to any previous version.</p>

                <div>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Versions</p>
                  <p className="text-[13px] mb-5" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{MOCK_DEPLOYMENTS.length} deployments · 1 active.</p>

                  <div className="relative max-w-2xl">
                    <div className="absolute left-[19px] top-4 bottom-4 w-px" style={{ background: 'rgb(39,39,37)' }} />
                    <div className="space-y-3">
                      {MOCK_DEPLOYMENTS.map(dep => (
                        <div key={dep.id} className="flex gap-4">
                          <div className="flex-shrink-0 flex items-start pt-3">
                            <div className="w-[10px] h-[10px] rounded-full border-2 flex-shrink-0 relative z-10" style={{
                              background: dep.status === 'active' ? '#22c55e' : dep.status === 'failed' ? '#f87171' : 'rgb(39,39,37)',
                              borderColor: dep.status === 'active' ? '#22c55e' : dep.status === 'failed' ? '#f87171' : 'rgb(80,78,74)',
                            }} />
                          </div>
                          <div className="flex-1 p-4 rounded-xl" style={{
                            background: dep.status === 'active' ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${dep.status === 'active' ? 'rgba(34,197,94,0.18)' : 'rgb(39,39,37)'}`,
                          }}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold font-mono" style={{ color: dep.status === 'active' ? '#22c55e' : 'rgb(197,193,186)' }}>{dep.version}</span>
                                {dep.status === 'active' && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontFamily: FONT }}>Active</span>}
                                {dep.status === 'failed' && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', fontFamily: FONT }}>Failed</span>}
                              </div>
                              {dep.status !== 'active' && (
                                <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgb(120,116,110)', border: BORDER, fontFamily: FONT }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                                  <RotateCcw className="w-3 h-3" /> Rollback
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{format(new Date(dep.ts), 'MMM d, yyyy HH:mm')}</span>
                              <span className="text-xs font-mono" style={{ color: 'rgb(100,97,92)' }}>{dep.sha}</span>
                              <span className="text-xs" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>{dep.trigger}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SettingsRow({ label, desc, action, last }: {
  label: string; desc: string; action: React.ReactNode; last?: boolean;
}) {
  const F = "'Geist', 'DM Sans', sans-serif";
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-4"
      style={{ borderBottom: last ? 'none' : '1px solid rgb(39,39,37)' }}>
      <div>
        <p className="text-[14px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: F }}>{label}</p>
        <p className="text-[12.5px] mt-0.5" style={{ color: 'rgb(120,116,110)', fontFamily: F }}>{desc}</p>
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 12, padding: 2,
        background: active ? '#3b82f6' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', transition: 'background 0.2s ease',
        display: 'flex', alignItems: 'center',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', flexShrink: 0,
          marginLeft: active ? 'auto' : 0 }}
      />
    </button>
  );
}

function RowBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  const F = "'Geist', 'DM Sans', sans-serif";
  return (
    <button onClick={onClick}
      className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
      style={{
        background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
        color: danger ? '#f87171' : 'rgb(220,218,214)',
        border: danger ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgb(39,39,37)',
        fontFamily: F,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)')}>
      {label}
    </button>
  );
}

function ResourceBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[12.5px]" style={{ color: 'rgb(120,116,110)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>{label}</span>
        <span className="text-[12.5px] font-medium" style={{ color: 'rgb(197,193,186)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(39,39,37)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function NetRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgb(39,39,37)' }}>
      <span className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>{label}</span>
      <span className="text-[12.5px] font-mono" style={{ color: 'rgb(197,193,186)' }}>{value}</span>
    </div>
  );
}

function SettingsBtn({ icon: Icon, label, onClick, danger }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
      style={{
        background: danger ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.05)',
        color: danger ? '#f87171' : 'rgb(197,193,186)',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgb(39,39,37)'}`,
        fontFamily: "'Geist', 'DM Sans', sans-serif",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.09)')}
      onMouseLeave={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.05)')}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function IconBtn({ icon: Icon, onClick, title, danger }: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void; title?: string; danger?: boolean;
}) {
  return (
    <button onClick={onClick} title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
      style={{ background: 'transparent', color: danger ? 'rgba(248,113,113,0.4)' : 'rgb(120,116,110)' }}
      onMouseEnter={e => (e.currentTarget.style.color = danger ? '#f87171' : 'rgb(220,218,214)')}
      onMouseLeave={e => (e.currentTarget.style.color = danger ? 'rgba(248,113,113,0.4)' : 'rgb(120,116,110)')}>
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
