import { motion } from "framer-motion";
import FloatingNav from "@/components/FloatingNav";
import { Link } from "react-router-dom";
import { Zap, Globe, RefreshCw } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const features = [
  {
    icon: Zap,
    title: "Describe it. Build it.",
    body: "Type a single sentence. Our AI understands your intent and generates production-ready discord.py code.",
  },
  {
    icon: Globe,
    title: "Instant deployment.",
    body: "No servers. No DevOps. Your bot is live on our infrastructure with a click.",
  },
  {
    icon: RefreshCw,
    title: "Iterate instantly.",
    body: "Not quite right? Just tell it what to change. Edit your bot the same way you built it — with words.",
  },
];

export default function BotBuilder() {
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
                textTransform: "uppercase" as const,
              }}
            >
              Bot Builder
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
              marginBottom: "16px",
              whiteSpace: "pre-line",
            }}
          >
            {"Your bot. Your vision.\nNo code needed."}
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
              maxWidth: "600px",
              margin: "0 auto 72px",
              lineHeight: 1.7,
            }}
          >
            Describe what you want your Discord bot to do. Buildable AI writes the code, deploys
            it, and keeps it running — in seconds.
          </motion.p>

          {/* Feature cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              gap: "20px",
              marginBottom: "64px",
            }}
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.1 }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "32px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: "20px", height: "20px", color: "rgba(255,255,255,0.65)" }} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "17px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.88)",
                        marginBottom: "8px",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "15px",
                        color: "rgba(255,255,255,0.55)",
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {feature.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "64px" }} />

          {/* Bottom CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "clamp(26px, 4vw, 38px)",
                fontWeight: 800,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                lineHeight: 1.2,
              }}
            >
              Start building your bot — free.
            </h2>
            <p
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "15px",
                color: "rgba(255,255,255,0.45)",
                marginBottom: "32px",
                lineHeight: 1.6,
              }}
            >
              No credit card. No setup. Just describe your bot and we'll handle the rest.
            </p>
            <Link to="/sign-up" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "999px",
                  color: "rgba(255,255,255,0.85)",
                  padding: "12px 32px",
                  fontFamily: "'Geist', sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
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
                Build for free →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
