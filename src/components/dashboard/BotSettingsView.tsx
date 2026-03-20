import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft, Server, ScrollText, KeyRound, Webhook,
  AlertTriangle, GitBranch, Copy, Eye, EyeOff, Plus,
  Trash2, RefreshCw, RotateCcw, Play, Pause, Globe,
  CheckCircle2, XCircle, Clock, ChevronRight, Terminal,
  Loader2, Bell, BellOff, Filter, Download, UploadCloud,
  Radio, Hammer, WifiOff, Shield,
} from 'lucide-react';
import { useProject } from '@/hooks/useProjects';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'hosting' | 'logs' | 'env' | 'callbacks' | 'errors' | 'deployments';

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

// ── Placeholder data ───────────────────────────────────────────────────────────

const MOCK_LOGS: LogEntry[] = [
  { id: '1', ts: new Date(Date.now() - 12000).toISOString(), level: 'INFO',  source: 'internal', msg: 'Bot connected to Discord gateway (shard 0/1)' },
  { id: '2', ts: new Date(Date.now() - 35000).toISOString(), level: 'INFO',  source: 'internal', msg: '!play invoked by user sarah_m in #music-bot-test' },
  { id: '3', ts: new Date(Date.now() - 60000).toISOString(), level: 'WARN',  source: 'internal', msg: 'Spotify API rate limit approaching (88%)' },
  { id: '4', ts: new Date(Date.now() - 90000).toISOString(), level: 'ERROR', source: 'internal', msg: 'YTDLError: Unable to extract video info' },
  { id: '5', ts: new Date(Date.now() - 120000).toISOString(),level: 'INFO',  source: 'external', msg: 'INTERACTION_CREATE: /help (guild 8821…)' },
  { id: '6', ts: new Date(Date.now() - 200000).toISOString(),level: 'INFO',  source: 'external', msg: 'GUILD_MEMBER_ADD: user joined server' },
  { id: '7', ts: new Date(Date.now() - 400000).toISOString(),level: 'WARN',  source: 'external', msg: 'RESUMED: gateway reconnect after network blip' },
];

const MOCK_DEPLOYMENTS: Deployment[] = [
  { id: 'd1', version: 'v0.4.2', ts: new Date(Date.now() - 3600000).toISOString(),   status: 'active',       trigger: 'AI Build',     sha: 'a1b2c3d' },
  { id: 'd2', version: 'v0.4.1', ts: new Date(Date.now() - 86400000).toISOString(),  status: 'rolled-back',  trigger: 'AI Build',     sha: 'e4f5a6b' },
  { id: 'd3', version: 'v0.4.0', ts: new Date(Date.now() - 172800000).toISOString(), status: 'rolled-back',  trigger: 'AI Build',     sha: 'c7d8e9f' },
  { id: 'd4', version: 'v0.3.1', ts: new Date(Date.now() - 259200000).toISOString(), status: 'rolled-back',  trigger: 'Manual push',  sha: '0a1b2c3' },
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

// ── Component ──────────────────────────────────────────────────────────────────

export default function BotSettingsView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(projectId);

  const [activeTab, setActiveTab] = useState<Tab>('hosting');

  // ENV state
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: 'DISCORD_TOKEN',   value: 'MTMy...redacted', revealed: false },
    { key: 'SPOTIFY_CLIENT',  value: 'abc123secretkey',  revealed: false },
    { key: 'SPOTIFY_SECRET',  value: '9f2d...redacted',  revealed: false },
    { key: 'BOT_PREFIX',      value: '!',                revealed: true  },
  ]);
  const [newKey, setNewKey]     = useState('');
  const [newVal, setNewVal]     = useState('');

  // Logs state
  const [logFilter, setLogFilter]   = useState<'all' | 'INFO' | 'WARN' | 'ERROR'>('all');
  const [logSource, setLogSource]   = useState<'all' | 'internal' | 'external'>('all');

  // Errors state
  const [expandedError, setExpandedError] = useState<string | null>(null);

  // Hosting
  const [botRunning, setBotRunning] = useState(true);

  // Callbacks
  const [callbacks, setCallbacks] = useState([
    { id: 'cb1', event: 'on_message',     url: 'https://hooks.example.com/msg',  active: true  },
    { id: 'cb2', event: 'on_guild_join',  url: 'https://hooks.example.com/join', active: false },
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
      </div>
    );
  }

  const projectName = project?.name ?? 'Bot Project';
  const projectStatus = project?.status ?? 'ready';

  const statusCfg = {
    ready:    { icon: Radio,   color: '#22c55e', label: 'Online'   },
    building: { icon: Hammer,  color: '#f59e0b', label: 'Building' },
    failed:   { icon: WifiOff, color: '#6b7280', label: 'Offline'  },
  }[projectStatus] ?? { icon: WifiOff, color: '#6b7280', label: 'Offline' };
  const StatusIcon = statusCfg.icon;

  const filteredLogs = MOCK_LOGS.filter(l =>
    (logFilter === 'all' || l.level === logFilter) &&
    (logSource === 'all' || l.source === logSource)
  );

  const TABS: { id: Tab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { id: 'hosting',     icon: Server,       label: 'Hosting'      },
    { id: 'logs',        icon: ScrollText,   label: 'Logs'         },
    { id: 'env',         icon: KeyRound,     label: 'Environment'  },
    { id: 'callbacks',   icon: Webhook,      label: 'Callbacks'    },
    { id: 'errors',      icon: AlertTriangle,label: 'Error Handlers'},
    { id: 'deployments', icon: GitBranch,    label: 'Deployments'  },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => navigate(`/dashboard/project/${projectId}`)}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.38)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Workspace
        </button>
        <span style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
        <span className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{projectName}</span>
        <span style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>Settings</span>

        <div className="flex items-center gap-1.5 ml-3">
          <StatusIcon className="w-3 h-3" style={{ color: statusCfg.color }} />
          <span className="text-xs" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left nav */}
        <div
          className="w-48 flex-shrink-0 flex flex-col gap-0.5 p-3"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] uppercase tracking-widest px-3 mb-2 mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Configuration
          </p>
          {TABS.map(({ id, icon: Icon, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] text-left transition-all w-full"
                style={{
                  color: active ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.38)',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  boxShadow: active ? 'inset 2px 0 0 rgba(255,255,255,0.4)' : 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── HOSTING ── */}
          {activeTab === 'hosting' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader title="Hosting" sub="Manage deployment region and bot runtime." />

              {/* Status card */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <Label>Runtime status</Label>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: botRunning ? '#22c55e' : '#6b7280' }}>
                    {botRunning
                      ? <><span className="relative flex w-1.5 h-1.5"><span className="animate-ping absolute w-full h-full rounded-full opacity-60 bg-green-500" /><span className="relative w-1.5 h-1.5 rounded-full bg-green-500" /></span> Running</>
                      : <><span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> Stopped</>
                    }
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Stat label="Region"  value="EU West (Railway)" />
                  <Stat label="Uptime"  value="4d 12h 33m" />
                  <Stat label="Runtime" value="Python 3.11" />
                </div>
                <div className="flex gap-2">
                  <ActionBtn
                    icon={botRunning ? Pause : Play}
                    label={botRunning ? 'Stop bot' : 'Start bot'}
                    onClick={() => setBotRunning(v => !v)}
                    danger={botRunning}
                  />
                  <ActionBtn icon={RefreshCw} label="Restart" onClick={() => {}} />
                  <ActionBtn icon={UploadCloud} label="Redeploy" onClick={() => {}} />
                </div>
              </Card>

              {/* Resource usage */}
              <Card>
                <Label className="mb-3">Resource usage</Label>
                <div className="grid grid-cols-2 gap-4">
                  <ResourceBar label="CPU" pct={18} color="#60a5fa" />
                  <ResourceBar label="Memory" pct={42} color="#a78bfa" />
                  <ResourceBar label="Disk" pct={11} color="#34d399" />
                  <ResourceBar label="Bandwidth" pct={6} color="#fbbf24" />
                </div>
              </Card>

              {/* Network */}
              <Card>
                <Label className="mb-3">Network</Label>
                <div className="space-y-2">
                  <NetRow label="Internal endpoint" value="bot-svc-internal:8000" />
                  <NetRow label="Discord gateway" value="gateway.discord.gg (WSS)" />
                  <NetRow label="Outbound IPs" value="104.21.0.0/16" />
                </div>
              </Card>
            </div>
          )}

          {/* ── LOGS ── */}
          {activeTab === 'logs' && (
            <div className="max-w-3xl space-y-4">
              <SectionHeader title="Logs" sub="Real-time stdout/stderr and Discord gateway events." />

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  {(['all','INFO','WARN','ERROR'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f)}
                      className="px-3 py-1.5 text-xs transition-colors"
                      style={{
                        background: logFilter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: logFilter === f
                          ? f === 'ERROR' ? '#f87171' : f === 'WARN' ? '#fbbf24' : 'rgba(255,255,255,0.8)'
                          : 'rgba(255,255,255,0.3)',
                        borderRight: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >{f === 'all' ? 'All' : f}</button>
                  ))}
                </div>
                <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  {(['all','internal','external'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setLogSource(s)}
                      className="px-3 py-1.5 text-xs capitalize transition-colors"
                      style={{
                        background: logSource === s ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: logSource === s ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                        borderRight: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >{s === 'all' ? 'All sources' : s}</button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <Download className="w-3.5 h-3.5" /> Export
                </div>
              </div>

              {/* Log entries */}
              <div
                className="rounded-xl overflow-hidden font-mono text-xs"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Terminal className="w-3 h-3 inline mr-1.5" />
                    {filteredLogs.length} entries
                  </span>
                  <span className="flex items-center gap-1" style={{ color: '#22c55e' }}>
                    <span className="relative flex w-1.5 h-1.5"><span className="animate-ping absolute w-full h-full rounded-full opacity-60 bg-green-500" /><span className="relative w-1.5 h-1.5 rounded-full bg-green-500" /></span>
                    Live
                  </span>
                </div>
                <div className="divide-y" style={{ divideColor: 'rgba(255,255,255,0.04)' }}>
                  {filteredLogs.length === 0 ? (
                    <p className="px-4 py-6 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>No matching log entries.</p>
                  ) : filteredLogs.map(l => (
                    <div key={l.id} className="flex gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                      <span className="flex-shrink-0 w-[130px] tabular-nums" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {format(new Date(l.ts), 'HH:mm:ss.SSS')}
                      </span>
                      <span
                        className="flex-shrink-0 w-12 font-bold"
                        style={{ color: l.level === 'ERROR' ? '#f87171' : l.level === 'WARN' ? '#fbbf24' : '#60a5fa' }}
                      >{l.level}</span>
                      <span className="flex-shrink-0 w-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        [{l.source}]
                      </span>
                      <span className="flex-1 break-all" style={{ color: 'rgba(255,255,255,0.65)' }}>{l.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ENVIRONMENT ── */}
          {activeTab === 'env' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader
                title="Environment Variables"
                sub="Securely stored. Values are encrypted at rest and only visible to you."
              />
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)', color: '#fbbf24' }}
              >
                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                Variables in this section are only accessible to you and encrypted in storage. Never share your tokens.
              </div>

              <Card>
                <div className="space-y-2">
                  {envVars.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {/* Key */}
                      <div
                        className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-mono w-44 truncate"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >{v.key}</div>

                      {/* Value */}
                      <div
                        className="flex-1 flex items-center rounded-lg px-3 py-2 text-xs font-mono"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        <span className="flex-1 truncate">
                          {v.revealed ? v.value : '•'.repeat(Math.min(v.value.length, 20))}
                        </span>
                      </div>

                      {/* Toggle reveal */}
                      <IconBtn
                        icon={v.revealed ? EyeOff : Eye}
                        onClick={() => setEnvVars(vars => vars.map((x, j) => j === i ? { ...x, revealed: !x.revealed } : x))}
                        title={v.revealed ? 'Hide' : 'Reveal'}
                      />

                      {/* Copy */}
                      <IconBtn icon={Copy} onClick={() => navigator.clipboard.writeText(v.value)} title="Copy value" />

                      {/* Delete */}
                      <IconBtn
                        icon={Trash2}
                        onClick={() => setEnvVars(vars => vars.filter((_, j) => j !== i))}
                        title="Delete"
                        danger
                      />
                    </div>
                  ))}
                </div>

                {/* Add new */}
                <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <input
                    value={newKey}
                    onChange={e => setNewKey(e.target.value)}
                    placeholder="VARIABLE_NAME"
                    className="flex-shrink-0 w-44 px-3 py-2 rounded-lg text-xs font-mono outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                  />
                  <input
                    value={newVal}
                    onChange={e => setNewVal(e.target.value)}
                    placeholder="value"
                    type="password"
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                  />
                  <button
                    onClick={() => {
                      if (!newKey.trim()) return;
                      setEnvVars(v => [...v, { key: newKey.trim(), value: newVal, revealed: false }]);
                      setNewKey(''); setNewVal('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* ── CALLBACKS ── */}
          {activeTab === 'callbacks' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader title="Callbacks & Webhooks" sub="Outgoing HTTP calls triggered by Discord events." />

              <Card>
                <div className="space-y-3">
                  {callbacks.map((cb) => (
                    <div
                      key={cb.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-semibold" style={{ color: '#60a5fa' }}>{cb.event}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{cb.url}</p>
                      </div>
                      <button
                        onClick={() => setCallbacks(cbs => cbs.map(c => c.id === cb.id ? { ...c, active: !c.active } : c))}
                        className="flex-shrink-0 text-xs px-2.5 py-1 rounded-md transition-colors"
                        style={{
                          background: cb.active ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                          color: cb.active ? '#22c55e' : 'rgba(255,255,255,0.25)',
                          border: `1px solid ${cb.active ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        }}
                      >
                        {cb.active ? 'Active' : 'Disabled'}
                      </button>
                      <IconBtn icon={Trash2} onClick={() => setCallbacks(cbs => cbs.filter(c => c.id !== cb.id))} title="Remove" danger />
                    </div>
                  ))}
                </div>

                <button
                  className="mt-4 flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors w-full"
                  style={{ color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add webhook endpoint
                </button>
              </Card>

              {/* Available events */}
              <Card>
                <Label className="mb-3">Available Discord events</Label>
                <div className="flex flex-wrap gap-2">
                  {['on_message','on_reaction_add','on_guild_join','on_member_join','on_voice_state_update','on_command_error','on_ready'].map(ev => (
                    <span
                      key={ev}
                      className="px-2.5 py-1 rounded-full text-xs font-mono"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >{ev}</span>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── ERROR HANDLERS ── */}
          {activeTab === 'errors' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader title="Error Handlers" sub="Runtime exceptions captured from your bot process." />

              {/* Notification toggle */}
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>Email notifications</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Get alerted when new errors are captured</p>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <Bell className="w-3.5 h-3.5" /> Enabled
                  </button>
                </div>
              </Card>

              <div className="space-y-3">
                {MOCK_ERRORS.map(err => (
                  <div
                    key={err.id}
                    className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${err.resolved ? 'rgba(255,255,255,0.07)' : 'rgba(248,113,113,0.2)'}`, background: err.resolved ? 'rgba(255,255,255,0.02)' : 'rgba(239,68,68,0.04)' }}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      onClick={() => setExpandedError(expandedError === err.id ? null : err.id)}
                    >
                      <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: err.resolved ? 'rgba(255,255,255,0.2)' : '#f87171' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold font-mono" style={{ color: err.resolved ? 'rgba(255,255,255,0.4)' : '#f87171' }}>{err.type}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{err.msg}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {err.count > 1 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>×{err.count}</span>
                        )}
                        {err.resolved && (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Resolved</span>
                        )}
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          {formatDistanceToNow(new Date(err.ts), { addSuffix: true })}
                        </span>
                        <ChevronRight
                          className="w-3.5 h-3.5 transition-transform"
                          style={{ color: 'rgba(255,255,255,0.2)', transform: expandedError === err.id ? 'rotate(90deg)' : 'none' }}
                        />
                      </div>
                    </button>

                    {expandedError === err.id && (
                      <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <pre
                          className="mt-3 p-3 rounded-lg text-xs overflow-x-auto"
                          style={{ background: 'rgba(0,0,0,0.4)', color: '#f87171', fontFamily: 'monospace', lineHeight: '1.6' }}
                        >{err.trace}</pre>
                        {!err.resolved && (
                          <button className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark as resolved
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DEPLOYMENTS ── */}
          {activeTab === 'deployments' && (
            <div className="max-w-2xl space-y-5">
              <SectionHeader title="Deployment History" sub="Every build deployed for this bot. Rollback to any version." />

              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-[19px] top-4 bottom-4 w-px"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />

                <div className="space-y-3">
                  {MOCK_DEPLOYMENTS.map((dep, i) => (
                    <div key={dep.id} className="flex gap-4">
                      {/* Dot */}
                      <div className="flex-shrink-0 flex items-start pt-3">
                        <div
                          className="w-[10px] h-[10px] rounded-full border-2 flex-shrink-0 relative z-10"
                          style={{
                            background: dep.status === 'active' ? '#22c55e' : dep.status === 'failed' ? '#f87171' : 'rgba(255,255,255,0.1)',
                            borderColor: dep.status === 'active' ? '#22c55e' : dep.status === 'failed' ? '#f87171' : 'rgba(255,255,255,0.2)',
                          }}
                        />
                      </div>

                      {/* Card */}
                      <div
                        className="flex-1 p-4 rounded-xl mb-0"
                        style={{
                          background: dep.status === 'active' ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${dep.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold font-mono" style={{ color: dep.status === 'active' ? '#22c55e' : 'rgba(255,255,255,0.65)' }}>
                              {dep.version}
                            </span>
                            {dep.status === 'active' && (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>Active</span>
                            )}
                            {dep.status === 'failed' && (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>Failed</span>
                            )}
                          </div>
                          {dep.status !== 'active' && (
                            <button
                              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.09)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                            >
                              <RotateCcw className="w-3 h-3" /> Rollback
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {format(new Date(dep.ts), 'MMM d, yyyy HH:mm')}
                          </span>
                          <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>{dep.sha}</span>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{dep.trigger}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>{title}</h2>
      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {children}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] uppercase tracking-widest ${className ?? ''}`} style={{ color: 'rgba(255,255,255,0.22)' }}>
      {children}
    </p>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{label}</p>
      <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</p>
    </div>
  );
}

function ResourceBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function NetRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{value}</span>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, danger }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
      style={{
        background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
        color: danger ? '#f87171' : 'rgba(255,255,255,0.6)',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.09)'}`,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)')}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function IconBtn({ icon: Icon, onClick, title, danger }: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void; title?: string; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg transition-colors flex-shrink-0"
      style={{ color: danger ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.25)' }}
      onMouseEnter={e => (e.currentTarget.style.color = danger ? '#f87171' : 'rgba(255,255,255,0.7)')}
      onMouseLeave={e => (e.currentTarget.style.color = danger ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.25)')}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
