import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, FolderOpen, FileText, Mail, TrendingUp, ArrowRight } from 'lucide-react';
import {
  collection, getCountFromServer, getDocs,
  query, orderBy, limit, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RecentUser {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Timestamp | null;
}

interface StatCard {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  accent: string;
  loading: boolean;
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
};

export default function StakeholderOverview() {
  const [userCount,    setUserCount]    = useState<number | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [blogCount,    setBlogCount]    = useState<number | null>(null);
  const [subCount,     setSubCount]     = useState<number | null>(null);
  const [recentUsers,  setRecentUsers]  = useState<RecentUser[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersSnap, projectsSnap, blogSnap, subSnap] = await Promise.allSettled([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'projects')),
          getCountFromServer(collection(db, 'blogPosts')),
          getCountFromServer(collection(db, 'subscribers')),
        ]);

        if (usersSnap.status === 'fulfilled')    setUserCount(usersSnap.value.data().count);
        if (projectsSnap.status === 'fulfilled') setProjectCount(projectsSnap.value.data().count);
        if (blogSnap.status === 'fulfilled')     setBlogCount(blogSnap.value.data().count);
        if (subSnap.status === 'fulfilled')      setSubCount(subSnap.value.data().count);

        // Recent signups
        try {
          const recent = await getDocs(
            query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(8))
          );
          setRecentUsers(recent.docs.map(d => ({ uid: d.id, ...(d.data() as any) })));
        } catch { /* rules may block list query */ }
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  const stats: StatCard[] = [
    { label: 'Total Users',    value: userCount    ?? '—', sub: 'signed up',        icon: Users,      accent: '#60a5fa', loading: loadingStats },
    { label: 'Total Projects', value: projectCount ?? '—', sub: 'bots created',     icon: FolderOpen, accent: '#34d399', loading: loadingStats },
    { label: 'Blog Posts',     value: blogCount    ?? '—', sub: 'published / draft', icon: FileText,   accent: '#fbbf24', loading: loadingStats },
    { label: 'Subscribers',    value: subCount     ?? '—', sub: 'newsletter',        icon: Mail,       accent: '#f472b6', loading: loadingStats },
  ];

  const fmt = (ts: Timestamp | null) => {
    if (!ts) return '—';
    try {
      return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '—'; }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.6)', marginBottom: '6px' }}>
          Stakeholder · Overview
        </p>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em', marginBottom: '4px' }}>
          Good morning, Dr. Stark.
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          Here's how Buildable Labs is doing right now.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            style={card}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0 }}>{s.label}</p>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: s.accent + '18', border: `1px solid ${s.accent}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon style={{ width: '14px', height: '14px', color: s.accent }} />
              </div>
            </div>
            <p style={{ fontSize: '30px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', margin: '0 0 3px' }}>
              {s.loading ? <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.2)' }}>Loading…</span> : s.value}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Two-column: recent users + quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>

        {/* Recent signups */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          style={{ ...card }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp style={{ width: '15px', height: '15px', color: 'rgba(251,191,36,0.6)' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: 0 }}>Recent Signups</p>
            </div>
            <Link to="/stakeholder/credits" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
            >
              View all →
            </Link>
          </div>

          {recentUsers.length === 0 && !loadingStats && (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '24px 0' }}>
              No users yet — or list access needs a Firestore rule update.
            </p>
          )}

          {loadingStats && (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', padding: '12px 0' }}>Loading…</p>
          )}

          {recentUsers.map((u, i) => (
            <div key={u.uid} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0',
              borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: `hsl(${(u.uid.charCodeAt(0) * 37) % 360}, 35%, 30%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              }}>
                {(u.displayName || u.email || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.displayName || '—'}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.email}
                </p>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', flexShrink: 0 }}>
                {fmt(u.createdAt)}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.34 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '4px' }}>
            Quick Actions
          </p>
          {[
            { to: '/stakeholder/blog',    label: 'Write a new post', sub: 'Blog CMS' },
            { to: '/stakeholder/notify',  label: 'Send an email',    sub: 'Notify users' },
            { to: '/stakeholder/credits', label: 'Manage credits',   sub: 'User credits' },
          ].map(({ to, label, sub }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.14)')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>{sub}</p>
                </div>
                <ArrowRight style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.25)' }} />
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
