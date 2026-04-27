import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Zap, ChevronDown, ChevronUp, Loader2, TrendingDown,
  Database, Code2, CheckCircle2, FileCode, BarChart2, Layers, Cpu, Coins,
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';

const FONT   = "'Geist', 'DM Sans', sans-serif";
const C_ACTIVE = 'rgba(255,255,255,0.88)';
const C_MUTED  = 'rgba(255,255,255,0.45)';
const C_DIM    = 'rgba(255,255,255,0.22)';
const BORDER   = '1px solid rgba(255,255,255,0.07)';
const CARD_BORDER = '1px solid rgb(39,39,37)';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageBreakdown {
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens?: number;
  cache_read_tokens?: number;
  cost_usd: number;
  files_generated?: number;
}

interface GenerationSession {
  id: string;
  prompt: string;
  status: string;
  created_at: string;
  cost_usd?: number;
  files_generated?: number;
  files_planned?: number;
  cost_breakdown?: {
    architect?: StageBreakdown;
    coder?: StageBreakdown;
    validator?: StageBreakdown;
  };
  tokens_total?: {
    input: number;
    output: number;
    cache_creation: number;
    cache_read: number;
  };
}

type Tab = 'overview' | 'runs' | 'tokens' | 'credits';

const TABS: { id: Tab; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string }[] = [
  { id: 'overview', icon: BarChart2, label: 'Overview'      },
  { id: 'credits',  icon: Coins,     label: 'Credits'       },
  { id: 'runs',     icon: Layers,    label: 'Runs'          },
  { id: 'tokens',   icon: Cpu,       label: 'Token usage'   },
];

// ─── Stage helpers ────────────────────────────────────────────────────────────

const STAGE_META: Record<string, { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; color: string }> = {
  architect: { icon: Database,     label: 'Architect', color: '#818cf8' },
  coder:     { icon: Code2,        label: 'Coder',     color: '#34d399' },
  validator: { icon: CheckCircle2, label: 'Validator', color: '#fbbf24' },
};

function modelShortName(m: string): string {
  if (m.includes('haiku'))  return 'Haiku 4.5';
  if (m.includes('opus'))   return 'Opus 4.6';
  if (m.includes('sonnet')) return 'Sonnet 4.6';
  return m;
}

function fmt(n: number, dp = 4)  { return `$${n.toFixed(dp)}`; }
function fmtK(n: number)         { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

function relativeTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Session row ──────────────────────────────────────────────────────────────

function SessionRow({ session }: { session: GenerationSession }) {
  const [open, setOpen] = useState(false);
  const hasCost = typeof session.cost_usd === 'number';
  const totalCacheRead = session.tokens_total?.cache_read ?? 0;
  const totalInput     = session.tokens_total?.input ?? 0;
  const cacheHitPct    = totalInput > 0 ? Math.round((totalCacheRead / totalInput) * 100) : 0;
  const stages = Object.entries(session.cost_breakdown ?? {}) as [string, StageBreakdown][];

  return (
    <div style={{ borderBottom: BORDER, fontFamily: FONT }}>
      <button
        onClick={() => hasCost && setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ cursor: hasCost ? 'pointer' : 'default' }}
        onMouseEnter={e => { if (hasCost) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
          background: session.status === 'completed' ? '#34d399' : session.status === 'failed' ? '#f87171' : '#fbbf24',
        }} />
        <span className="flex-1 text-[13px] truncate" style={{ color: C_ACTIVE }}>{session.prompt || '—'}</span>
        {session.files_generated != null && (
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: C_MUTED }}>
            <FileCode className="w-3 h-3" />{session.files_generated} files
          </span>
        )}
        <span className="text-[12px] font-mono w-[72px] text-right" style={{ color: hasCost ? C_ACTIVE : C_DIM }}>
          {hasCost ? fmt(session.cost_usd!, 4) : '—'}
        </span>
        <span className="text-[11px] w-[60px] text-right flex-shrink-0" style={{ color: C_DIM }}>{relativeTime(session.created_at)}</span>
        {hasCost && (open
          ? <ChevronUp  className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C_DIM }} />
          : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C_DIM }} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && hasCost && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mx-4 mb-3 rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: BORDER }}>
              <div className="flex flex-wrap gap-4 mb-4">
                <TokenStat label="Input"       value={fmtK(session.tokens_total?.input ?? 0)} />
                <TokenStat label="Output"      value={fmtK(session.tokens_total?.output ?? 0)} />
                <TokenStat label="Cache write" value={fmtK(session.tokens_total?.cache_creation ?? 0)} />
                <TokenStat label="Cache read"  value={fmtK(totalCacheRead)} accent={totalCacheRead > 0} />
                {cacheHitPct > 0 && <TokenStat label="Cache hit %" value={`${cacheHitPct}%`} accent />}
              </div>
              {stages.length > 0 && (
                <table className="w-full text-[12px]" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: BORDER }}>
                      {['Stage','Model','In','Out','Cache read','Cost'].map(h => (
                        <th key={h} className={`py-1.5 font-medium ${['In','Out','Cache read','Cost'].includes(h) ? 'text-right pr-4' : 'text-left pr-4'}`} style={{ color: C_DIM }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stages.map(([name, s]) => {
                      const meta = STAGE_META[name];
                      const Icon = meta?.icon;
                      return (
                        <tr key={name} style={{ borderBottom: BORDER }}>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: meta.color }} />}
                              <span style={{ color: C_MUTED }}>{meta?.label ?? name}</span>
                              {s.files_generated != null && (
                                <span className="text-[10px] px-1 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: C_DIM }}>{s.files_generated} files</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: C_MUTED }}>{modelShortName(s.model)}</span>
                          </td>
                          <td className="py-2 pr-4 text-right font-mono" style={{ color: C_MUTED }}>{fmtK(s.input_tokens)}</td>
                          <td className="py-2 pr-4 text-right font-mono" style={{ color: C_MUTED }}>{fmtK(s.output_tokens)}</td>
                          <td className="py-2 pr-4 text-right font-mono" style={{ color: (s.cache_read_tokens ?? 0) > 0 ? '#34d399' : C_DIM }}>{fmtK(s.cache_read_tokens ?? 0)}</td>
                          <td className="py-2 text-right font-mono" style={{ color: C_ACTIVE }}>{fmt(s.cost_usd, 4)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TokenStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: C_DIM, fontFamily: FONT }}>{label}</p>
      <p className="text-[13px] font-mono" style={{ color: accent ? '#34d399' : C_MUTED, fontFamily: FONT }}>{value}</p>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function CostsView() {
  const { user } = useAuth();
  const { credits, totalCredits, currentPlanType, transactions, transactionsLoading } = useCredits();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'overview';
  const setTab = (id: Tab) => setSearchParams({ tab: id }, { replace: true });

  const [sessions, setSessions] = useState<GenerationSession[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const q = query(
      collection(db, 'generationSessions'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc'),
    );
    const unsub = onSnapshot(q, snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as GenerationSession)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  // ── Aggregates ────────────────────────────────────────────────────────────
  const pricedSessions  = sessions.filter(s => typeof s.cost_usd === 'number' && s.cost_usd > 0);
  const totalSpend      = pricedSessions.reduce((sum, s) => sum + (s.cost_usd ?? 0), 0);
  const avgCost         = pricedSessions.length > 0 ? totalSpend / pricedSessions.length : 0;
  const totalCacheRead  = sessions.reduce((sum, s) => sum + (s.tokens_total?.cache_read ?? 0), 0);
  const totalInput      = sessions.reduce((sum, s) => sum + (s.tokens_total?.input ?? 0), 0);
  const totalOutput     = sessions.reduce((sum, s) => sum + (s.tokens_total?.output ?? 0), 0);
  const totalCacheWrite = sessions.reduce((sum, s) => sum + (s.tokens_total?.cache_creation ?? 0), 0);
  const cacheSavings    = ((1.50 - 0.15) / 1_000_000) * totalCacheRead;
  const cacheHitPct     = totalInput > 0 ? Math.round((totalCacheRead / totalInput) * 100) : 0;

  return (
    <div className="flex" style={{ minHeight: '100vh', fontFamily: FONT }}>

      {/* ── Left panel ───────────────────────────────────────────────────── */}
      <div
        className="w-64 flex-shrink-0 flex flex-col py-6 overflow-y-auto"
        style={{ height: '100vh', position: 'sticky', top: 0 }}
      >
        <div className="px-4 mb-4">
          <p className="text-[18px] font-bold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Cost Analysis</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>API spend & token usage</p>
        </div>

        <div className="mx-4 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />

        <div className="px-2">
          <p className="px-2 pb-1 pt-1 text-[11.5px]" style={{ color: 'rgb(220,218,214)', fontFamily: FONT }}>Analytics</p>
          {TABS.map(({ id, icon: Icon, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
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

        {/* Quick stats */}
        <div className="mx-4 mt-auto">
          <div className="mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <div className="flex flex-col gap-3 pb-4">
            <div>
              <p className="text-[10.5px] uppercase tracking-widest mb-0.5" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>Credits left</p>
              <p className="text-[18px] font-mono font-semibold" style={{ color: totalCredits <= 2 ? '#f87171' : totalCredits <= 5 ? '#fbbf24' : 'rgb(252,251,248)' }}>{totalCredits}</p>
              <p className="text-[11px] capitalize" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>{currentPlanType} plan</p>
            </div>
            {!loading && pricedSessions.length > 0 && (
              <div>
                <p className="text-[10.5px] uppercase tracking-widest mb-0.5" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>API spend</p>
                <p className="text-[14px] font-mono font-semibold" style={{ color: 'rgb(252,251,248)' }}>{fmt(totalSpend, 4)}</p>
                <p className="text-[11px]" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>{pricedSessions.length} run{pricedSessions.length !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right floating card ───────────────────────────────────────────── */}
      <div className="flex-1 p-4 flex flex-col">
        <div
          className="flex-1 overflow-y-auto"
          style={{
            background: '#1c1c1a',
            border: CARD_BORDER,
            borderRadius: '14px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div className="px-10 py-8">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>Overview</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>High-level summary of your API spend and cache efficiency.</p>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: DollarSign,  label: 'Total API spend',    value: fmt(totalSpend, 4),              sub: `${pricedSessions.length} priced run${pricedSessions.length !== 1 ? 's' : ''}`, color: '#a78bfa' },
                    { icon: Zap,         label: 'Avg cost / run',     value: avgCost > 0 ? fmt(avgCost, 4) : '—', sub: 'per completed generation', color: '#34d399' },
                    { icon: TrendingDown,label: 'Cache savings (est.)',value: cacheSavings > 0 ? fmt(cacheSavings, 4) : '—', sub: `${fmtK(totalCacheRead)} cache-read tokens`, color: '#fbbf24' },
                  ].map(card => (
                    <div key={card.label} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: CARD_BORDER }}>
                      <div className="flex items-center gap-2 mb-3">
                        <card.icon className="w-4 h-4" style={{ color: card.color }} />
                        <span className="text-[12px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{card.label}</span>
                      </div>
                      <p className="text-2xl font-mono font-semibold" style={{ color: 'rgb(252,251,248)' }}>{card.value}</p>
                      <p className="text-[11px] mt-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Recent runs preview */}
                <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: CARD_BORDER, background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-[13px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Recent runs</p>
                    <button onClick={() => setTab('runs')} className="text-[12px] transition-colors" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgb(220,218,214)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgb(120,116,110)')}>
                      View all →
                    </button>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: C_DIM }} />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>No generation runs yet</p>
                    </div>
                  ) : (
                    sessions.slice(0, 5).map(s => <SessionRow key={s.id} session={s} />)
                  )}
                </div>

                {pricedSessions.length > 0 && (
                  <p className="text-[11px] mt-4" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>
                    Costs reflect actual Anthropic API usage. Cache savings are estimated using blended pricing.
                  </p>
                )}
              </motion.div>
            )}

            {/* ── CREDITS ── */}
            {activeTab === 'credits' && (
              <motion.div key="credits" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>Credits</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Your credit balance and transaction history.</p>

                {/* Balance cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: CARD_BORDER }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Coins className="w-4 h-4" style={{ color: '#a78bfa' }} />
                      <span className="text-[12px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Credits remaining</span>
                    </div>
                    <p className="text-2xl font-mono font-semibold" style={{ color: totalCredits <= 2 ? '#f87171' : totalCredits <= 5 ? '#fbbf24' : 'rgb(252,251,248)' }}>{totalCredits}</p>
                    <p className="text-[11px] mt-1 capitalize" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{currentPlanType} plan</p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: CARD_BORDER }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4" style={{ color: '#34d399' }} />
                      <span className="text-[12px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Credits used (lifetime)</span>
                    </div>
                    <p className="text-2xl font-mono font-semibold" style={{ color: 'rgb(252,251,248)' }}>
                      {currentPlanType === 'free' ? (credits?.lifetime_builds_used ?? 0) : (transactions?.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0) ?? 0)}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>across all builds</p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: CARD_BORDER }}>
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-4 h-4" style={{ color: '#fbbf24' }} />
                      <span className="text-[12px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Credits purchased</span>
                    </div>
                    <p className="text-2xl font-mono font-semibold" style={{ color: 'rgb(252,251,248)' }}>
                      {transactions?.filter(t => t.transaction_type === 'purchase' || t.transaction_type === 'topup').reduce((s, t) => s + t.amount, 0) ?? 0}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>total bought</p>
                  </div>
                </div>

                {/* Transaction history */}
                <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: CARD_BORDER, background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-[13px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>Transaction history</p>
                  </div>
                  {transactionsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: C_DIM }} />
                    </div>
                  ) : !transactions || transactions.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>No transactions yet</p>
                      <p className="text-[12px] mt-1" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>Credit usage will appear here after your first build</p>
                    </div>
                  ) : (
                    <div>
                      {/* header row */}
                      <div className="flex items-center gap-3 px-5 py-2" style={{ borderBottom: CARD_BORDER, background: 'rgba(255,255,255,0.01)' }}>
                        <span className="flex-1 text-[11px] uppercase tracking-wider" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Description</span>
                        <span className="text-[11px] uppercase tracking-wider w-[80px] text-right" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Amount</span>
                        <span className="text-[11px] uppercase tracking-wider w-[80px] text-right" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Balance</span>
                        <span className="text-[11px] uppercase tracking-wider w-[70px] text-right" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>When</span>
                      </div>
                      {transactions.map(tx => (
                        <div key={tx.id} className="flex items-center gap-3 px-5 py-3 transition-colors"
                          style={{ borderBottom: CARD_BORDER, fontFamily: FONT }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] truncate" style={{ color: 'rgb(220,218,214)' }}>{tx.description || tx.transaction_type}</p>
                            <p className="text-[11px] capitalize mt-0.5" style={{ color: 'rgb(120,116,110)' }}>{tx.action_type?.replace(/_/g, ' ') ?? tx.transaction_type}</p>
                          </div>
                          <span className="text-[13px] font-mono w-[80px] text-right font-semibold"
                            style={{ color: tx.amount > 0 ? '#34d399' : tx.amount < 0 ? '#f87171' : 'rgb(197,193,186)' }}>
                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                          </span>
                          <span className="text-[12px] font-mono w-[80px] text-right" style={{ color: 'rgb(197,193,186)' }}>
                            {tx.balance_after}
                          </span>
                          <span className="text-[11px] w-[70px] text-right" style={{ color: 'rgb(120,116,110)' }}>
                            {relativeTime(tx.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── RUNS ── */}
            {activeTab === 'runs' && (
              <motion.div key="runs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>Runs</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Every generation run with per-stage cost breakdown.</p>

                <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
                  <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: CARD_BORDER, background: 'rgba(255,255,255,0.02)' }}>
                    <span className="flex-1 text-[11px] uppercase tracking-wider" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Prompt</span>
                    <span className="text-[11px] uppercase tracking-wider w-[60px] text-right" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Files</span>
                    <span className="text-[11px] uppercase tracking-wider w-[72px] text-right" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Cost</span>
                    <span className="text-[11px] uppercase tracking-wider w-[60px] text-right" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>When</span>
                    <span className="w-4" />
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: C_DIM }} />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>No generation runs yet</p>
                      <p className="text-[12px] mt-1" style={{ color: 'rgb(100,97,92)', fontFamily: FONT }}>Build your first bot to see cost data here</p>
                    </div>
                  ) : (
                    sessions.map(s => <SessionRow key={s.id} session={s} />)
                  )}
                </div>
              </motion.div>
            )}

            {/* ── TOKENS ── */}
            {activeTab === 'tokens' && (
              <motion.div key="tokens" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-[22px] font-bold mb-1" style={{ color: 'rgb(252,251,248)', fontFamily: "'Geist', sans-serif" }}>Token usage</h2>
                <p className="text-[14px] mb-8" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>Aggregate token consumption across all generation runs.</p>

                {/* Token stat grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Total input tokens',      value: fmtK(totalInput),      sub: 'Prompt + context tokens',         color: '#818cf8' },
                    { label: 'Total output tokens',     value: fmtK(totalOutput),     sub: 'Generated response tokens',       color: '#34d399' },
                    { label: 'Cache writes',            value: fmtK(totalCacheWrite), sub: 'Tokens written to prompt cache',  color: '#fbbf24' },
                    { label: 'Cache reads',             value: fmtK(totalCacheRead),  sub: `${cacheHitPct}% of input tokens`, color: '#34d399', accent: true },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: CARD_BORDER }}>
                      <p className="text-[12px] mb-3" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{item.label}</p>
                      <p className="text-2xl font-mono font-semibold" style={{ color: item.accent ? '#34d399' : 'rgb(252,251,248)' }}>{item.value}</p>
                      <p className="text-[11px] mt-1" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>{item.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Per-stage aggregate table */}
                {sessions.some(s => s.cost_breakdown) && (() => {
                  const stageTotals: Record<string, { input: number; output: number; cacheRead: number; cost: number; runs: number }> = {};
                  sessions.forEach(s => {
                    Object.entries(s.cost_breakdown ?? {}).forEach(([stage, b]) => {
                      const bd = b as StageBreakdown;
                      if (!stageTotals[stage]) stageTotals[stage] = { input: 0, output: 0, cacheRead: 0, cost: 0, runs: 0 };
                      stageTotals[stage].input    += bd.input_tokens;
                      stageTotals[stage].output   += bd.output_tokens;
                      stageTotals[stage].cacheRead += bd.cache_read_tokens ?? 0;
                      stageTotals[stage].cost     += bd.cost_usd;
                      stageTotals[stage].runs     += 1;
                    });
                  });
                  return (
                    <div className="rounded-xl overflow-hidden" style={{ border: CARD_BORDER }}>
                      <div className="px-5 py-3" style={{ borderBottom: CARD_BORDER, background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-[13px] font-semibold" style={{ color: 'rgb(252,251,248)', fontFamily: FONT }}>By stage</p>
                      </div>
                      <table className="w-full text-[12px]" style={{ borderCollapse: 'collapse', fontFamily: FONT }}>
                        <thead>
                          <tr style={{ borderBottom: CARD_BORDER }}>
                            {['Stage','Runs','Input','Output','Cache read','Total cost'].map(h => (
                              <th key={h} className={`px-5 py-2.5 font-medium ${h === 'Stage' || h === 'Runs' ? 'text-left' : 'text-right'}`} style={{ color: 'rgb(120,116,110)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(stageTotals).map(([name, t]) => {
                            const meta = STAGE_META[name];
                            const Icon = meta?.icon;
                            return (
                              <tr key={name} style={{ borderBottom: CARD_BORDER }}>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: meta.color }} />}
                                    <span style={{ color: 'rgb(220,218,214)' }}>{meta?.label ?? name}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-left font-mono" style={{ color: 'rgb(197,193,186)' }}>{t.runs}</td>
                                <td className="px-5 py-3 text-right font-mono" style={{ color: 'rgb(197,193,186)' }}>{fmtK(t.input)}</td>
                                <td className="px-5 py-3 text-right font-mono" style={{ color: 'rgb(197,193,186)' }}>{fmtK(t.output)}</td>
                                <td className="px-5 py-3 text-right font-mono" style={{ color: t.cacheRead > 0 ? '#34d399' : 'rgb(100,97,92)' }}>{fmtK(t.cacheRead)}</td>
                                <td className="px-5 py-3 text-right font-mono" style={{ color: 'rgb(252,251,248)' }}>{fmt(t.cost, 4)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {sessions.length === 0 && !loading && (
                  <div className="py-16 text-center rounded-xl" style={{ border: CARD_BORDER }}>
                    <p className="text-[13px]" style={{ color: 'rgb(120,116,110)', fontFamily: FONT }}>No token data yet</p>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
