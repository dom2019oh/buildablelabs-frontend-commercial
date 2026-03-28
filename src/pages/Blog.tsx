import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FloatingNav from "@/components/FloatingNav";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const posts = [
  {
    category: "Company",
    title: "How We Built a Bot Builder in 3 Months",
    date: "Mar 2026",
    readTime: "5 min read",
  },
  {
    category: "Tutorial",
    title: "5 Discord Bots Every Server Needs",
    date: "Mar 2026",
    readTime: "4 min read",
  },
  {
    category: "Product",
    title: "What's New in Buildable: March 2026",
    date: "Mar 2026",
    readTime: "3 min read",
  },
];

const categoryColors: Record<string, string> = {
  Company: "rgba(139,92,246,0.18)",
  Tutorial: "rgba(45,212,191,0.14)",
  Product: "rgba(249,115,22,0.14)",
};
const categoryTextColors: Record<string, string> = {
  Company: "rgba(196,181,253,0.9)",
  Tutorial: "rgba(94,234,212,0.9)",
  Product: "rgba(253,186,116,0.9)",
};

export default function Blog() {
  const [email, setEmail] = useState("");

  return (
    <div style={{ background: "#080a0c", minHeight: "100vh" }}>
      <FloatingNav />

      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(90,30,200,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, paddingTop: "96px", paddingBottom: "96px" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          {/* Badge */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}
          >
            <span
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "999px",
                padding: "4px 14px",
                fontFamily: "'Geist', sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Blog
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.07 }}
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 800,
              color: "rgba(255,255,255,0.88)",
              textAlign: "center",
              lineHeight: 1.15,
              marginBottom: "64px",
              whiteSpace: "pre-line",
            }}
          >
            {"Ideas, updates &\nbehind the scenes."}
          </motion.h1>

          {/* Post cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginBottom: "80px",
            }}
          >
            {posts.map((post, i) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.09 }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Category badge */}
                <span
                  style={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    background: categoryColors[post.category],
                    border: `1px solid ${categoryTextColors[post.category].replace("0.9", "0.25")}`,
                    borderRadius: "999px",
                    padding: "3px 11px",
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: categoryTextColors[post.category],
                    letterSpacing: "0.03em",
                  }}
                >
                  {post.category}
                </span>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.88)",
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {post.title}
                </h2>

                {/* Meta row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.28)",
                  }}
                >
                  <span>{post.date}</span>
                  <span style={{ width: "2px", height: "2px", borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
                  <span>{post.readTime}</span>
                </div>

                {/* Coming soon pill */}
                <span
                  style={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "999px",
                    padding: "3px 11px",
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.28)",
                    marginTop: "4px",
                  }}
                >
                  Coming soon
                </span>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "64px" }} />

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "17px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "20px",
              }}
            >
              Get notified when we publish.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "999px",
                  padding: "10px 20px",
                  fontFamily: "'Geist', sans-serif",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.85)",
                  outline: "none",
                  width: "240px",
                }}
                onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)"; }}
                onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "999px",
                  color: "rgba(255,255,255,0.85)",
                  padding: "10px 24px",
                  fontFamily: "'Geist', sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
