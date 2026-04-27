import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE } from '@/lib/urls';
import { Send, Users, AlertCircle, CheckCircle, Loader2, Bell } from 'lucide-react';

type Audience = 'all' | 'pro' | 'free';

const AUDIENCE_OPTS: { value: Audience; label: string; desc: string }[] = [
  { value: 'all',  label: 'Everyone',    desc: 'All registered users' },
  { value: 'pro',  label: 'Pro users',   desc: 'Active Pro / Max subscribers' },
  { value: 'free', label: 'Free users',  desc: 'Users on the free plan' },
];

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
};

const input: React.CSSProperties = {
  width: '100%', padding: '11px 14px', boxSizing: 'border-box' as const,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '9px', fontFamily: "'Geist', sans-serif",
  fontSize: '13px', color: 'rgba(255,255,255,0.85)', outline: 'none',
};

export default function StakeholderNotify() {
  const { user } = useAuth();
  const [audience,  setAudience]  = useState<Audience>('all');
  const [subject,   setSubject]   = useState('');
  const [body,      setBody]      = useState('');
  const [sending,   setSending]   = useState(false);
  const [status,    setStatus]    = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [subCount,  setSubCount]  = useState<number | null>(null);
  const [history,   setHistory]   = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'subscribers'))
      .then(s => setSubCount(s.size))
      .catch(() => {});

    getDocs(collection(db, 'notificationHistory'))
      .then(s => setHistory(s.docs.map(d => ({ id: d.id, ...d.data() })).reverse()))
      .catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setStatus(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`${API_BASE}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim(), audience }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus({ type: 'error', msg: err.message || 'Backend endpoint POST /api/admin/notify not yet implemented.' });
      } else {
        // Log to Firestore notification history
        await addDoc(collection(db, 'notificationHistory'), {
          subject: subject.trim(),
          body: body.trim(),
          audience,
          sentAt: serverTimestamp(),
          sentBy: user?.email ?? 'unknown',
        }).catch(() => {});

        setStatus({ type: 'success', msg: `Email queued for ${audience} users.` });
        setSubject('');
        setBody('');
      }
    } catch {
      setStatus({ type: 'error', msg: 'POST /api/admin/notify not yet implemented on backend. Build that endpoint to send real emails.' });
    } finally {
      setSending(false);
    }
  };

  const fmt = (ts: any) => {
    try { return ts?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return '—'; }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'flex-start' }}>

      {/* Compose */}
      <div>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(251,191,36,0.6)', marginBottom: '4px' }}>
            Stakeholder · Notify
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em', margin: '0 0 4px' }}>
            Email Notifications
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Compose and send emails to your users.
          </p>
        </div>

        {/* Backend note */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px',
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
          borderRadius: '10px', marginBottom: '24px',
        }}>
          <AlertCircle style={{ width: '14px', height: '14px', color: 'rgba(251,191,36,0.7)', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '12px', color: 'rgba(251,191,36,0.65)', margin: 0, lineHeight: 1.5 }}>
            Email delivery requires <code style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', padding: '1px 5px' }}>POST /api/admin/notify</code> on the backend with an email provider (Resend, SendGrid, etc.). This UI is ready — connect when you're ready to send.
          </p>
        </div>

        {/* Audience */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>
            Send to
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {AUDIENCE_OPTS.map(o => (
              <button
                key={o.value}
                onClick={() => setAudience(o.value)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  background: audience === o.value ? 'rgba(217,119,6,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${audience === o.value ? 'rgba(217,119,6,0.30)' : 'rgba(255,255,255,0.07)'}`,
                  textAlign: 'left' as const, fontFamily: "'Geist', sans-serif",
                  transition: 'all 0.15s',
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: 600, color: audience === o.value ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.65)', margin: '0 0 2px' }}>
                  {o.label}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>{o.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '7px' }}>
            Subject line
          </label>
          <input
            style={input} value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Buildable Labs is now live 🚀"
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '7px' }}>
            Message body
          </label>
          <textarea
            style={{ ...input, height: '240px', resize: 'vertical' as const, lineHeight: 1.65 }}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={`Hi [Name],\n\nWe have exciting news to share with you...\n\n— Dr. Stark\nBuildable Labs`}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
          />
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', marginTop: '5px' }}>
            {body.length} characters · Use [Name] as a placeholder for the recipient's name.
          </p>
        </div>

        {/* Status */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
              background: status.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${status.type === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {status.type === 'success'
              ? <CheckCircle style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0, marginTop: 1 }} />
              : <AlertCircle style={{ width: 14, height: 14, color: 'rgba(239,68,68,0.8)', flexShrink: 0, marginTop: 1 }} />
            }
            <p style={{
              fontSize: '12px', margin: 0, lineHeight: 1.5,
              color: status.type === 'success' ? '#34d399' : 'rgba(239,68,68,0.8)',
            }}>{status.msg}</p>
          </motion.div>
        )}

        {/* Send button */}
        <motion.button
          whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.98 }}
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '13px 0', borderRadius: '11px', border: 'none',
            background: sending || !subject.trim() || !body.trim()
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, #d97706, #fbbf24)',
            color: sending || !subject.trim() || !body.trim() ? 'rgba(255,255,255,0.25)' : '#0a0612',
            fontFamily: "'Geist', sans-serif", fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.06em', cursor: sending ? 'default' : 'pointer',
          }}
        >
          {sending
            ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
            : <><Send style={{ width: 14, height: 14 }} /> Send Email</>
          }
        </motion.button>
      </div>

      {/* Right: stats + history */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Subscriber stat */}
        <div style={{ ...card, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Users style={{ width: '14px', height: '14px', color: 'rgba(251,191,36,0.6)' }} />
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0 }}>Newsletter Subscribers</p>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 800, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.02em', margin: '0 0 3px' }}>
            {subCount ?? '—'}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>signed up from blog page</p>
        </div>

        {/* Send history */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bell style={{ width: '14px', height: '14px', color: 'rgba(251,191,36,0.6)' }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Send History</p>
          </div>

          {history.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>No emails sent yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.slice(0, 8).map((h: any) => (
                <div key={h.id} style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.subject}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>{h.audience}</span>
                    <span style={{ width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)' }}>{fmt(h.sentAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
