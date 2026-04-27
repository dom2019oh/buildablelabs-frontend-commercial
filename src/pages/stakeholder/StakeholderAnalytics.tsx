import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Globe, Users, Eye, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
};

interface PageView {
  id: string;
  sessionId: string;
  visitorId: string;
  path: string;
  country: string;
  countryCode: string;
  referrer: string;
  duration: number | null;
  timestamp: Timestamp;
}

interface DayBucket { label: string; views: number; }

const FLAG_BASE = 'https://flagcdn.com/24x18';

function fmtDuration(secs: number) {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}m ${s}s`;
}

function fmtDate(ts: Timestamp | null) {
  if (!ts) return '—';
  try { return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

export default function StakeholderAnalytics() {
  const [views,       setViews]       = useState<PageView[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [range,       setRange]       = useState<7 | 30 | 90>(30);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - range);
      try {
        const snap = await getDocs(
          query(
            collection(db, 'pageViews'),
            where('timestamp', '>=', Timestamp.fromDate(since)),
            orderBy('timestamp', 'desc'),
          )
        );
        setViews(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch { /* permission or index error — show empty */ }
      setLoading(false);
    };
    load();
  }, [range]);

  // ── Derived stats ──────────────────────────────────────────────
  const totalViews     = views.length;
  const uniqueSessions = new Set(views.map(v => v.sessionId)).size;
  const uniqueVisitors = new Set(views.map(v => v.visitorId)).size;

  const durationsRaw = views.filter(v => v.duration != null && v.duration > 0 && v.duration < 3600);
  const avgDuration  = durationsRaw.length
    ? Math.round(durationsRaw.reduce((a, v) => a + (v.duration ?? 0), 0) / durationsRaw.length)
    : 0;

  // Countries
  const countryCounts: Record<string, { count: number; code: string }> = {};
  for (const v of views) {
    const name = v.country || 'Unknown';
    if (!countryCounts[name]) countryCounts[name] = { count: 0, code: v.countryCode || '' };
    countryCounts[name].count++;
  }
  const countries = Object.entries(countryCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);
  const maxCountryCount = countries[0]?.[1].count || 1;

  // Top pages
  const pageCounts: Record<string, number> = {};
  for (const v of views) { pageCounts[v.path] = (pageCounts[v.path] || 0) + 1; }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Daily chart
  const dayBuckets: DayBucket[] = [];
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayBuckets.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: 0,
    });
  }
  for (const v of views) {
    try {
      const d = v.timestamp.toDate();
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const bucket = dayBuckets.find(b => b.label === label);
      if (bucket) bucket.views++;
    } catch { /* skip */ }
  }
  // Thin out labels for 90d view
  const chartData = range === 90
    ? dayBuckets.filter((_, i) => i % 7 === 0 || i === dayBuckets.length - 1)
    : dayBuckets;

  // Recent visits
  const recent = views.slice(0, 12);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.6)', marginBottom: '4px' }}>
            Stakeholder · Analytics
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em', margin: '0 0 4px' }}>
            Website Analytics
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Visitor traffic, session data, and geography.
          </p>
        </div>
        {/* Range selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {([7, 30, 90] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '7px 14px', borderRadius: '8px', border: 'none',
              fontSize: '12px', fontWeight: 600, fontFamily: "'Geist', sans-serif",
              cursor: 'pointer', transition: 'all 0.15s',
              background: range === r ? 'rgba(217,119,6,0.18)' : 'rgba(255,255,255,0.04)',
              color: range === r ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${range === r ? 'rgba(217,119,6,0.30)' : 'rgba(255,255,255,0.07)'}`,
            }}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Page Views',       value: loading ? '—' : totalViews.toLocaleString(),     sub: `last ${range} days`, icon: Eye,      accent: 'rgba(251,191,36,0.7)' },
          { label: 'Unique Sessions',  value: loading ? '—' : uniqueSessions.toLocaleString(), sub: 'individual visits',  icon: TrendingUp, accent: 'rgba(167,139,250,0.7)' },
          { label: 'Unique Visitors',  value: loading ? '—' : uniqueVisitors.toLocaleString(), sub: 'distinct devices',   icon: Users,    accent: 'rgba(52,211,153,0.7)'  },
          { label: 'Avg. Watch Time',  value: loading ? '—' : (avgDuration ? fmtDuration(avgDuration) : '—'), sub: 'per page visit', icon: Clock, accent: 'rgba(96,165,250,0.7)' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ ...card, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <s.icon style={{ width: '14px', height: '14px', color: s.accent }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>{s.label}</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 800, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.02em', margin: '0 0 3px' }}>
              {s.value}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily chart */}
      <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '20px' }}>
          Daily Page Views
        </p>
        {loading ? (
          <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Loading…</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: "'Geist', sans-serif" }}
                axisLine={false} tickLine={false}
                interval={range === 7 ? 0 : range === 30 ? 4 : 0}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: "'Geist', sans-serif" }}
                axisLine={false} tickLine={false} allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '10px', fontFamily: "'Geist', sans-serif",
                  fontSize: '12px', color: 'rgba(255,255,255,0.8)',
                }}
                itemStyle={{ color: 'rgba(251,191,36,0.9)' }}
                cursor={{ stroke: 'rgba(255,255,255,0.06)' }}
              />
              <Line
                type="monotone" dataKey="views" stroke="#fbbf24" strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Countries + Top pages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Countries */}
        <div style={{ ...card, padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Globe style={{ width: '14px', height: '14px', color: 'rgba(251,191,36,0.6)' }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Top Countries</p>
          </div>
          {loading ? (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Loading…</p>
          ) : countries.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {countries.map(([name, { count, code }]) => (
                <div key={name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {code && (
                        <img
                          src={`${FLAG_BASE}/${code.toLowerCase()}.png`}
                          alt={name}
                          style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                      {count.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      width: `${(count / maxCountryCount) * 100}%`,
                      background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top pages */}
        <div style={{ ...card, padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <ArrowUpRight style={{ width: '14px', height: '14px', color: 'rgba(251,191,36,0.6)' }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Top Pages</p>
          </div>
          {loading ? (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Loading…</p>
          ) : topPages.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topPages.map(([path, count]) => (
                <div key={path} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.025)',
                }}>
                  <span style={{
                    fontSize: '12px', color: 'rgba(255,255,255,0.6)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '75%', fontFamily: "'Geist Mono', 'Geist', monospace",
                  }}>
                    {path || '/'}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600,
                    color: 'rgba(251,191,36,0.75)',
                    background: 'rgba(217,119,6,0.12)', borderRadius: '999px',
                    padding: '2px 8px', flexShrink: 0,
                  }}>
                    {count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent visits */}
      <div style={{ ...card, padding: '22px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>
          Recent Visits
        </p>
        {loading ? (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Loading…</p>
        ) : recent.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>No visits recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Geist', sans-serif", fontSize: '12px' }}>
              <thead>
                <tr>
                  {['Page', 'Country', 'Duration', 'Time'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '0 12px 10px 0',
                      fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.28)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '10px 12px 10px 0', color: 'rgba(255,255,255,0.65)', fontFamily: "'Geist Mono', monospace', maxWidth: '200px" }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '200px' }}>
                        {v.path || '/'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px 10px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {v.countryCode && (
                          <img
                            src={`${FLAG_BASE}/${v.countryCode.toLowerCase()}.png`}
                            alt="" style={{ width: '16px', height: '12px', borderRadius: '2px', objectFit: 'cover' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{v.country || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px 10px 0', color: 'rgba(255,255,255,0.4)' }}>
                      {v.duration ? fmtDuration(v.duration) : '—'}
                    </td>
                    <td style={{ padding: '10px 0', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap' }}>
                      {fmtDate(v.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
