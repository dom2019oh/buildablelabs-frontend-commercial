import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg, G, GCard, onGE, onGL, BH, BT, BTR } from "@/lib/glass";
import {
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: string;
  publishedAt: Timestamp | null;
  slug: string;
}

const categoryColors: Record<string, string> = {
  Company:     "rgba(139,92,246,0.18)",
  Tutorial:    "rgba(45,212,191,0.14)",
  Product:     "rgba(249,115,22,0.14)",
  Update:      "rgba(59,130,246,0.14)",
  Engineering: "rgba(16,185,129,0.14)",
};
const categoryTextColors: Record<string, string> = {
  Company:     "rgba(196,181,253,0.9)",
  Tutorial:    "rgba(94,234,212,0.9)",
  Product:     "rgba(253,186,116,0.9)",
  Update:      "rgba(147,197,253,0.9)",
  Engineering: "rgba(110,231,183,0.9)",
};

const STATIC_POSTS = [
  {
    id: 'static-1',
    title: 'How to Create a Discord Bot Without Coding',
    excerpt: 'A step-by-step guide to building a fully deployed Discord bot using plain English — no Python, no terminal, no setup required.',
    category: 'Tutorial',
    readTime: '6 min read',
    slug: '/blog/how-to-create-a-discord-bot-without-coding',
    date: 'Apr 2026',
  },
  {
    id: 'static-2',
    title: 'AI Discord Bot Generator — Describe It, Get Working Code',
    excerpt: 'How Buildable Labs generates real Python discord.py code from a plain English description — no templates, no drag-and-drop.',
    category: 'Product',
    readTime: '7 min read',
    slug: '/blog/ai-discord-bot-generator',
    date: 'Apr 2026',
  },
  {
    id: 'static-3',
    title: 'Discord Bot for Gaming Servers — Built by AI in Minutes',
    excerpt: 'Custom Discord bots for Roblox RP, GTA RP, and gaming communities — with the exact commands, ranks, and workflows your server needs.',
    category: 'Tutorial',
    readTime: '8 min read',
    slug: '/blog/discord-bot-for-gaming-servers',
    date: 'Apr 2026',
  },
  {
    id: 'static-4',
    title: 'How to Add a Moderation Bot to Discord — No Code Required',
    excerpt: 'Warn, mute, ban, keyword filters, and auto-mod — build and deploy a custom moderation bot tailored to your server rules.',
    category: 'Tutorial',
    readTime: '7 min read',
    slug: '/blog/how-to-add-a-moderation-bot-to-discord',
    date: 'Apr 2026',
  },
];

const fmt = (ts: Timestamp | null) => {
  if (!ts) return "";
  try { return ts.toDate().toLocaleDateString("en-US", { month: "short", year: "numeric" }); }
  catch { return ""; }
};

export default function Blog() {
  const [email, setEmail]   = useState("");
  const [posts, setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [subbing, setSubbing] = useState(false);

  // Track all Firestore slugs (published or not) so we can de-duplicate static posts
  const [firestoreSlugs, setFirestoreSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(
      collection(db, "blogPosts"),
      where("published", "==", true),
      orderBy("publishedAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as BlogPost[];
      setPosts(fetched);
      setFirestoreSlugs(new Set(fetched.map(p => p.slug)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleSubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) { toast.error("Enter a valid email."); return; }
    setSubbing(true);
    try {
      await addDoc(collection(db, "subscribers"), {
        email: trimmed,
        subscribedAt: serverTimestamp(),
      });
      toast.success("You're subscribed!");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubbing(false);
    }
  };

  return (
    <div style={{ background: "#06060b", minHeight: "100vh", position: "relative" }}>      <AmbientBg />
      <FloatingNav />

      <div style={{ position: "relative", zIndex: 1, paddingTop: "96px", paddingBottom: "96px" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          {/* Badge */}
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <span style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "999px", padding: "4px 14px", fontFamily: "'Geist', sans-serif",
              fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.04em", textTransform: "uppercase" as const,
            }}>Blog</span>
          </motion.div>

          {/* H1 */}
          <motion.h1 {...fadeUp} transition={{ duration: 0.5, delay: 0.07 }}
            style={{
              fontFamily: "'Geist', sans-serif", fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 800, color: "rgba(255,255,255,0.88)", textAlign: "center",
              lineHeight: 1.15, marginBottom: "64px", whiteSpace: "pre-line",
            }}>
            {"Ideas, updates &\nbehind the scenes."}
          </motion.h1>

          {/* Loading */}
          {loading && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontFamily: "'Geist', sans-serif", fontSize: "14px", marginBottom: "64px" }}>
              Loading posts…
            </p>
          )}

          {/* Post cards */}
          {!loading && posts.length === 0 && STATIC_POSTS.length === 0 && (
            <div style={{
              textAlign: "center", padding: "64px 24px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px", marginBottom: "64px",
            }}>
              <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.35)", margin: "0 0 8px" }}>
                No posts published yet.
              </p>
              <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
                Subscribe below to be the first to know.
              </p>
            </div>
          )}

          {(posts.length > 0 || STATIC_POSTS.length > 0) && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px", marginBottom: "80px",
            }}>
              {STATIC_POSTS.filter(sp => !firestoreSlugs.has(sp.slug.replace('/blog/', ''))).map((post, i) => {
                const catColor = categoryColors[post.category] ?? "rgba(255,255,255,0.06)";
                const catText  = categoryTextColors[post.category] ?? "rgba(255,255,255,0.55)";
                return (
                  <Link key={post.id} to={post.slug} style={{ textDecoration: "none" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
                      style={{
                        background: "linear-gradient(170deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.028) 100%)",
                        backdropFilter: "blur(32px) saturate(180%)", WebkitBackdropFilter: "blur(32px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.08)",
                        borderRadius: "16px", padding: "28px", display: "flex",
                        flexDirection: "column" as const, gap: "14px",
                        cursor: "pointer", height: "100%",
                      }}
                      whileHover={{ y: -3, scale: 1.008 }}
                    >
                      <span style={{
                        display: "inline-block", alignSelf: "flex-start",
                        background: catColor, border: `1px solid ${catText.replace("0.9", "0.25")}`,
                        borderRadius: "999px", padding: "3px 11px",
                        fontFamily: "'Geist', sans-serif", fontSize: "11px",
                        fontWeight: 500, color: catText, letterSpacing: "0.03em",
                      }}>
                        {post.category}
                      </span>

                      <h2 style={{
                        fontFamily: "'Geist', sans-serif", fontSize: "16px", fontWeight: 600,
                        color: "rgba(255,255,255,0.88)", lineHeight: 1.45, margin: 0,
                      }}>
                        {post.title}
                      </h2>

                      <p style={{
                        fontFamily: "'Geist', sans-serif", fontSize: "13px",
                        color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0,
                      }}>
                        {post.excerpt}
                      </p>

                      <div style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        fontFamily: "'Geist', sans-serif", fontSize: "12px",
                        color: "rgba(255,255,255,0.28)", marginTop: "auto",
                      }}>
                        <span>{post.date}</span>
                        <span style={{ width: "2px", height: "2px", borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
                        <span>{post.readTime}</span>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
              {posts.map((post, i) => {
                const catColor = categoryColors[post.category] ?? "rgba(255,255,255,0.06)";
                const catText  = categoryTextColors[post.category] ?? "rgba(255,255,255,0.55)";
                return (
                  <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 + (STATIC_POSTS.length + i) * 0.08 }}
                    whileHover={{ y: -3, scale: 1.008 }}
                    style={{
                      background: "linear-gradient(170deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.028) 100%)",
                      backdropFilter: "blur(32px) saturate(180%)", WebkitBackdropFilter: "blur(32px) saturate(180%)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.08)",
                      borderRadius: "16px", padding: "28px", display: "flex",
                      flexDirection: "column" as const, gap: "14px",
                      cursor: "pointer", height: "100%",
                    }}
                  >
                    <span style={{
                      display: "inline-block", alignSelf: "flex-start",
                      background: catColor, border: `1px solid ${catText.replace("0.9", "0.25")}`,
                      borderRadius: "999px", padding: "3px 11px",
                      fontFamily: "'Geist', sans-serif", fontSize: "11px",
                      fontWeight: 500, color: catText, letterSpacing: "0.03em",
                    }}>
                      {post.category}
                    </span>

                    <h2 style={{
                      fontFamily: "'Geist', sans-serif", fontSize: "16px", fontWeight: 600,
                      color: "rgba(255,255,255,0.88)", lineHeight: 1.45, margin: 0,
                    }}>
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p style={{
                        fontFamily: "'Geist', sans-serif", fontSize: "13px",
                        color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: 0,
                      }}>
                        {post.excerpt}
                      </p>
                    )}

                    <div style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      fontFamily: "'Geist', sans-serif", fontSize: "12px",
                      color: "rgba(255,255,255,0.28)",
                    }}>
                      {fmt(post.publishedAt) && <span>{fmt(post.publishedAt)}</span>}
                      {fmt(post.publishedAt) && <span style={{ width: "2px", height: "2px", borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />}
                      <span>{post.readTime}</span>
                    </div>
                  </motion.div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "64px" }} />

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ textAlign: "center" }}
          >
            <p style={{
              fontFamily: "'Geist', sans-serif", fontSize: "17px", fontWeight: 500,
              color: "rgba(255,255,255,0.88)", marginBottom: "20px",
            }}>
              Get notified when we publish.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "999px", padding: "10px 20px",
                  fontFamily: "'Geist', sans-serif", fontSize: "14px",
                  color: "rgba(255,255,255,0.85)", outline: "none", width: "240px",
                }}
                onFocus={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)"; }}
                onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; }}
              />
              <motion.button
                whileHover={BH}
                whileTap={BT}
                transition={BTR}
                onClick={handleSubscribe}
                disabled={subbing}
                style={{ ...G, borderRadius: "999px", padding: "10px 24px", fontSize: "14px", opacity: subbing ? 0.55 : 1, cursor: subbing ? "default" : "pointer" }}
                onMouseEnter={onGE}
                onMouseLeave={onGL}
              >
                {subbing ? "Subscribing…" : "Subscribe"}
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
