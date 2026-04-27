import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Coins, Plus, Minus, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE } from '@/lib/urls';

interface UserRow {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Timestamp | null;
  credits: number | null;
  dailyCredits: number | null;
  lastClaim: string | null;
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
};

export default function StakeholderCredits() {
  const { user } = useAuth();
  const [rows,     setRows]     = useState<UserRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [delta,    setDelta]    = useState<Record<string, string>>({});
  const [search,   setSearch]   = useState('');
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      const creditsSnap = await getDocs(collection(db, 'userCredits'));

      const creditsMap: Record<string, { credits: number; dailyCredits: number; lastClaim: string }> = {};
      creditsSnap.docs.forEach(d => {
        const data = d.data() as any;
        creditsMap[d.id] = {
          credits: data.credits_remaining ?? data.credits ?? 0,
          dailyCredits: data.daily_credits ?? 0,
          lastClaim: data.last_claim_date ?? null,
        };
      });

      setRows(usersSnap.docs.map(d => {
        const data = d.data() as any;
        const credit = creditsMap[d.id];
        return {
          uid: d.id,
          displayName: data.displayName ?? '—',
          email: data.email ?? '—',
          createdAt: data.createdAt ?? null,
          credits: credit?.credits ?? null,
          dailyCredits: credit?.dailyCredits ?? null,
          lastClaim: credit?.lastClaim ?? null,
        };
      }));
    } catch (e: any) {
      setError(e.message ?? 'Failed to load. Check Firestore rules allow authenticated reads on users/userCredits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdjust = async (uid: string, amount: number) => {
    if (!user) return;
    setAdjusting(uid);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/admin/credits/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, delta: amount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFeedback(f => ({ ...f, [uid]: err.message || 'Backend endpoint not configured yet.' }));
      } else {
        setFeedback(f => ({ ...f, [uid]: `✓ ${amount > 0 ? '+' : ''}${amount} credits applied` }));
        setTimeout(() => setFeedback(f => { const c = { ...f }; delete c[uid]; return c; }), 3000);
        await load();
      }
    } catch {
      setFeedback(f => ({ ...f, [uid]: 'POST /api/admin/credits/adjust not yet implemented on backend.' }));
    } finally {
      setAdjusting(null);
    }
  };

  const fmt = (ts: Timestamp | null) => {
    if (!ts) return '—';
    try { return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '—'; }
  };

  const filtered = rows.filter(r =>
    r.displayName.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(251,191,36,0.6)', marginBottom: '4px' }}>
            Stakeholder · Credits
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em', margin: '0 0 4px' }}>
            Credit Management
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            {rows.length} users · adjust credits per account
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '9px', padding: '9px 14px', cursor: 'pointer',
            fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)',
          }}
        >
          <RefreshCw style={{ width: '13px', height: '13px' }} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Backend note */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px',
        background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
        borderRadius: '10px', marginBottom: '20px',
      }}>
        <AlertCircle style={{ width: '14px', height: '14px', color: 'rgba(251,191,36,0.7)', flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '12px', color: 'rgba(251,191,36,0.65)', margin: 0, lineHeight: 1.5 }}>
          Credit adjustments require <code style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', padding: '1px 5px' }}>POST /api/admin/credits/adjust</code> on the backend. Build that endpoint to enable live adjustments.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(239,68,68,0.8)', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Search */}
      <input
        type="text" placeholder="Search users…"
        value={search} onChange={e => setSearch(e.target.value)}
        style={{
          width: '280px', padding: '10px 14px', boxSizing: 'border-box' as const,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '9px', fontFamily: "'Geist', sans-serif",
          fontSize: '13px', color: 'rgba(255,255,255,0.85)', outline: 'none', marginBottom: '16px',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
      />

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '32px 0', justifyContent: 'center' }}>
          <Loader2 style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.2)' }} className="animate-spin" />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>Loading users…</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px 140px',
            gap: '16px', padding: '8px 16px',
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.28)',
          }}>
            <span>User</span>
            <span>Email</span>
            <span>Credits</span>
            <span>Joined</span>
            <span>Adjust</span>
          </div>

          {filtered.map(row => (
            <motion.div
              key={row.uid}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{
                ...card, padding: '14px 16px',
                display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px 140px',
                gap: '16px', alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: `hsl(${(row.uid.charCodeAt(0) * 37) % 360}, 35%, 28%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)',
                }}>
                  {(row.displayName || '?')[0].toUpperCase()}
                </div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.displayName}
                </p>
              </div>

              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.email}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Coins style={{ width: '12px', height: '12px', color: 'rgba(251,191,36,0.5)' }} />
                <p style={{ fontSize: '14px', fontWeight: 700, color: row.credits !== null ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.25)', margin: 0 }}>
                  {row.credits ?? '—'}
                </p>
              </div>

              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>
                {fmt(row.createdAt)}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  value={delta[row.uid] ?? ''}
                  onChange={e => setDelta(d => ({ ...d, [row.uid]: e.target.value }))}
                  placeholder="0"
                  style={{
                    width: '52px', padding: '6px 8px', boxSizing: 'border-box' as const,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '7px', fontFamily: "'Geist', sans-serif",
                    fontSize: '12px', color: 'rgba(255,255,255,0.8)', outline: 'none', textAlign: 'center' as const,
                  }}
                />
                <button
                  title="Add credits"
                  disabled={adjusting === row.uid}
                  onClick={() => handleAdjust(row.uid, Math.abs(Number(delta[row.uid] || 0)))}
                  style={{
                    width: '26px', height: '26px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                    background: 'rgba(52,211,153,0.12)', color: '#34d399',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Plus style={{ width: '12px', height: '12px' }} />
                </button>
                <button
                  title="Remove credits"
                  disabled={adjusting === row.uid}
                  onClick={() => handleAdjust(row.uid, -Math.abs(Number(delta[row.uid] || 0)))}
                  style={{
                    width: '26px', height: '26px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                    background: 'rgba(239,68,68,0.10)', color: 'rgba(239,68,68,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {adjusting === row.uid
                    ? <Loader2 style={{ width: '11px', height: '11px' }} className="animate-spin" />
                    : <Minus style={{ width: '12px', height: '12px' }} />
                  }
                </button>
              </div>

              {feedback[row.uid] && (
                <p style={{ gridColumn: '1 / -1', fontSize: '11px', color: feedback[row.uid].startsWith('✓') ? '#34d399' : 'rgba(251,191,36,0.7)', margin: '-4px 0 0', paddingLeft: '2px' }}>
                  {feedback[row.uid]}
                </p>
              )}
            </motion.div>
          ))}

          {filtered.length === 0 && !loading && (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)', padding: '32px', textAlign: 'center' }}>
              No users found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
