import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Loader2, Globe, FileText } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  readTime: string;
  author: string;
  createdAt: Timestamp | null;
  publishedAt: Timestamp | null;
}

const CATEGORIES = ['Company', 'Product', 'Tutorial', 'Update', 'Engineering'];

// The 4 hardcoded blog post pages — seed these to Firestore once so the CMS manages them
const SEED_POSTS = [
  {
    title: 'How to Create a Discord Bot Without Coding',
    slug: 'how-to-create-a-discord-bot-without-coding',
    excerpt: 'A step-by-step guide to building a fully deployed Discord bot using plain English — no Python, no terminal, no setup required.',
    category: 'Tutorial', readTime: '6 min read', author: 'Dr. Stark', published: true, content: '',
  },
  {
    title: 'AI Discord Bot Generator — Describe It, Get Working Code',
    slug: 'ai-discord-bot-generator',
    excerpt: 'How Buildable Labs generates real Python discord.py code from a plain English description — no templates, no drag-and-drop.',
    category: 'Product', readTime: '7 min read', author: 'Dr. Stark', published: true, content: '',
  },
  {
    title: 'Discord Bot for Gaming Servers — Built by AI in Minutes',
    slug: 'discord-bot-for-gaming-servers',
    excerpt: 'Custom Discord bots for Roblox RP, GTA RP, and gaming communities — with the exact commands, ranks, and workflows your server needs.',
    category: 'Tutorial', readTime: '8 min read', author: 'Dr. Stark', published: true, content: '',
  },
  {
    title: 'How to Add a Moderation Bot to Discord — No Code Required',
    slug: 'how-to-add-a-moderation-bot-to-discord',
    excerpt: 'Warn, mute, ban, keyword filters, and auto-mod — build and deploy a custom moderation bot tailored to your server rules.',
    category: 'Tutorial', readTime: '7 min read', author: 'Dr. Stark', published: true, content: '',
  },
];

const blank = (): Omit<BlogPost, 'id' | 'createdAt' | 'publishedAt'> => ({
  title: '', slug: '', excerpt: '', content: '',
  category: 'Company', published: false,
  readTime: '3 min read', author: 'Dr. Stark',
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
};

const input: React.CSSProperties = {
  width: '100%', padding: '10px 14px', boxSizing: 'border-box' as const,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '9px', fontFamily: "'Geist', sans-serif",
  fontSize: '13px', color: 'rgba(255,255,255,0.85)', outline: 'none',
};

export default function StakeholderBlog() {
  const [posts,        setPosts]        = useState<BlogPost[]>([]);
  const [editing,      setEditing]      = useState<BlogPost | null>(null);
  const [isNew,        setIsNew]        = useState(false);
  const [form,         setForm]         = useState(blank());
  const [saving,       setSaving]       = useState(false);
  const [delId,        setDelId]        = useState<string | null>(null);
  const [search,       setSearch]       = useState('');
  const [seedingPosts, setSeedingPosts] = useState(false);
  const [seedMsg,      setSeedMsg]      = useState('');

  useEffect(() => {
    const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    }, () => setPosts([]));
  }, []);

  const openNew = () => {
    setForm(blank());
    setEditing(null);
    setIsNew(true);
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt,
      content: post.content, category: post.category,
      published: post.published, readTime: post.readTime, author: post.author,
    });
    setEditing(post);
    setIsNew(false);
  };

  const closePanel = () => { setEditing(null); setIsNew(false); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.title);
      const data = {
        ...form,
        slug,
        updatedAt: serverTimestamp(),
        publishedAt: form.published ? (editing?.publishedAt ?? serverTimestamp()) : null,
      };
      if (isNew) {
        await addDoc(collection(db, 'blogPosts'), { ...data, createdAt: serverTimestamp() });
      } else if (editing) {
        await updateDoc(doc(db, 'blogPosts', editing.id), data);
      }
      closePanel();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDelId(id);
    await deleteDoc(doc(db, 'blogPosts', id));
    setDelId(null);
  };

  const handleTogglePublish = async (post: BlogPost) => {
    await updateDoc(doc(db, 'blogPosts', post.id), {
      published: !post.published,
      publishedAt: !post.published ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  };

  const handleSeedPosts = async () => {
    setSeedingPosts(true);
    setSeedMsg('');
    try {
      const existingSlugs = new Set(posts.map(p => p.slug));
      let added = 0;
      for (const post of SEED_POSTS) {
        if (!existingSlugs.has(post.slug)) {
          await addDoc(collection(db, 'blogPosts'), {
            ...post,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            publishedAt: post.published ? serverTimestamp() : null,
          });
          added++;
        }
      }
      setSeedMsg(added > 0 ? `${added} post${added !== 1 ? 's' : ''} synced.` : 'All posts already in CMS.');
    } finally {
      setSeedingPosts(false);
    }
  };

  const fmt = (ts: Timestamp | null) => {
    if (!ts) return '—';
    try { return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '—'; }
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const panelOpen = isNew || !!editing;

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* Left: post list */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(251,191,36,0.6)', marginBottom: '4px' }}>
              Stakeholder · Blog
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.01em', margin: 0 }}>
              Blog CMS
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {seedMsg && (
              <span style={{ fontSize: '11px', color: 'rgba(52,211,153,0.8)', fontFamily: "'Geist', sans-serif" }}>
                {seedMsg}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSeedPosts}
              disabled={seedingPosts}
              title="Seed the 4 built-in blog post pages into Firestore so they appear here"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '10px', padding: '9px 14px',
                fontFamily: "'Geist', sans-serif", fontSize: '12px', fontWeight: 600,
                color: 'rgba(255,255,255,0.5)', cursor: seedingPosts ? 'default' : 'pointer',
                opacity: seedingPosts ? 0.55 : 1,
              }}
            >
              {seedingPosts
                ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" />
                : <Globe style={{ width: '13px', height: '13px' }} />}
              Sync Built-in Posts
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={openNew}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: 'linear-gradient(135deg, #d97706, #fbbf24)',
                border: 'none', borderRadius: '10px', padding: '10px 18px',
                fontFamily: "'Geist', sans-serif", fontSize: '13px', fontWeight: 700,
                color: '#0a0612', cursor: 'pointer',
              }}
            >
              <Plus style={{ width: '15px', height: '15px' }} />
              New Post
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search posts…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...input, marginBottom: '16px', width: '280px' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
        />

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { label: `${posts.filter(p => p.published).length} Published`, color: '#34d399' },
            { label: `${posts.filter(p => !p.published).length} Drafts`,   color: '#fbbf24' },
            { label: `${posts.length} Total`,                               color: 'rgba(255,255,255,0.3)' },
          ].map(({ label, color }) => (
            <span key={label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '999px', padding: '3px 12px',
              fontSize: '11px', color, fontFamily: "'Geist', sans-serif",
            }}>
              {label}
            </span>
          ))}
        </div>

        {/* Post list */}
        {filtered.length === 0 && (
          <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
            <FileText style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>No posts yet. Create your first one.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                ...card, padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
                borderColor: editing?.id === post.id ? 'rgba(217,119,6,0.3)' : 'rgba(255,255,255,0.07)',
              }}
            >
              {/* Status dot */}
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                background: post.published ? '#34d399' : '#fbbf24',
                boxShadow: post.published ? '0 0 6px #34d399' : 'none',
              }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.82)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.title || 'Untitled'}
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10px', padding: '1px 8px', borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.38)',
                  }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{fmt(post.createdAt)}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{post.readTime}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  title={post.published ? 'Unpublish' : 'Publish'}
                  onClick={() => handleTogglePublish(post)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: post.published ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                    color: post.published ? '#34d399' : 'rgba(255,255,255,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {post.published ? <Globe style={{ width: '13px', height: '13px' }} /> : <EyeOff style={{ width: '13px', height: '13px' }} />}
                </button>
                <button
                  title="Edit"
                  onClick={() => openEdit(post)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Pencil style={{ width: '13px', height: '13px' }} />
                </button>
                <button
                  title="Delete"
                  onClick={() => handleDelete(post.id)}
                  disabled={delId === post.id}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {delId === post.id
                    ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" />
                    : <Trash2 style={{ width: '13px', height: '13px' }} />
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: editor panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '380px', flexShrink: 0,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(217,119,6,0.2)',
              borderRadius: '16px', padding: '24px',
              position: 'sticky', top: '36px',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}
          >
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(251,191,36,0.8)', margin: 0 }}>
                {isNew ? '✦ New Post' : '✦ Edit Post'}
              </p>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '6px' }}>Title *</label>
              <input
                style={input} value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                placeholder="Post title…"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
            </div>

            {/* Slug */}
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '6px' }}>Slug</label>
              <input
                style={input} value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="auto-generated"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
            </div>

            {/* Category + read time row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '6px' }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ ...input, cursor: 'pointer' }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#12131a' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '6px' }}>Read time</label>
                <input
                  style={input} value={form.readTime}
                  onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                  placeholder="3 min read"
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '6px' }}>Excerpt</label>
              <textarea
                style={{ ...input, height: '64px', resize: 'none' as const }}
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Short description shown in the blog list…"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
            </div>

            {/* Content */}
            <div>
              <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '6px' }}>Content (markdown)</label>
              <textarea
                style={{ ...input, height: '160px', resize: 'vertical' as const, fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6 }}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your post in markdown…"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
            </div>

            {/* Published toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', margin: '0 0 2px' }}>Publish</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>
                  {form.published ? 'Visible on public blog' : 'Draft — not visible'}
                </p>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                style={{
                  width: '40px', height: '22px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  background: form.published ? '#34d399' : 'rgba(255,255,255,0.1)',
                  position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: form.published ? '21px' : '3px',
                  width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            {/* Save */}
            <motion.button
              whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              style={{
                width: '100%', padding: '12px 0', borderRadius: '10px', border: 'none',
                background: saving || !form.title.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d97706, #fbbf24)',
                color: saving || !form.title.trim() ? 'rgba(255,255,255,0.25)' : '#0a0612',
                fontFamily: "'Geist', sans-serif", fontSize: '13px', fontWeight: 700,
                cursor: saving || !form.title.trim() ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : (isNew ? 'Create Post' : 'Save Changes')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
