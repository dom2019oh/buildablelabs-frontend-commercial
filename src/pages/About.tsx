import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Users, Shield } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const values = [
  {
    icon: Zap,
    title: "Instant",
    body: "Describe your bot in plain English. It's live in seconds, not days.",
  },
  {
    icon: Users,
    title: "Community-first",
    body: "Built around Discord communities. Every feature designed for real servers.",
  },
  {
    icon: Shield,
    title: "Reliable",
    body: "Your bots run on our infrastructure, 24/7, with zero DevOps from you.",
  },
];

export default function About() {
  return (
    <div style={{ background: "#080a0c", minHeight: "100vh" }}>
      <FloatingNav />

      {/* Top purple bloom */}
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "96px",
          paddingBottom: "96px",
        }}
      >
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
              Our Story
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
              marginBottom: "24px",
              whiteSpace: "pre-line",
            }}
          >
            {"Built for builders,\nnot developers."}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.14 }}
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "17px",
              color: "rgba(255,255,255,0.55)",
              textAlign: "center",
              maxWidth: "560px",
              margin: "0 auto 64px",
              lineHeight: 1.7,
            }}
          >
            We got tired of waiting for someone to make Discord bot creation feel as easy as
            typing a message. So we built it ourselves.
          </motion.p>

          {/* Divider */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "64px",
            }}
          />

          {/* Value cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              marginBottom: "80px",
            }}
          >
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.25 + i * 0.08 }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "28px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      marginBottom: "16px",
                    }}
                  >
                    <Icon style={{ width: "18px", height: "18px", color: "rgba(255,255,255,0.65)" }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.88)",
                      marginBottom: "8px",
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {v.body}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "64px" }} />

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.28)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              Ready to build?
            </p>
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 800,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "28px",
              }}
            >
              Your bot is one sentence away.
            </h2>
            <Link to="/sign-up" style={{ textDecoration: "none" }}>
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
                  letterSpacing: "-0.01em",
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
                Start Building →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
