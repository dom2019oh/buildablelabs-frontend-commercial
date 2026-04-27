import { motion } from "framer-motion";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg } from "@/lib/glass";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const entries = [
  {
    version: "v0.4.0",
    date: "March 20, 2026",
    title: "Dashboard Redesign",
    bullets: [
      "New Bot Fleet view with status chips",
      "Improved sidebar with Geist font",
      "Glassmorphism nav dropdowns",
    ],
  },
  {
    version: "v0.3.0",
    date: "March 10, 2026",
    title: "Pricing System",
    bullets: [
      "Free / Pro / Max tiers",
      "Credit-based pipeline system",
      "Annual billing with 2 months free",
    ],
  },
  {
    version: "v0.2.0",
    date: "February 28, 2026",
    title: "Firebase Migration",
    bullets: [
      "Supabase fully removed",
      "Firestore realtime sync",
      "Firebase Auth & Storage",
    ],
  },
  {
    version: "v0.1.0",
    date: "February 10, 2026",
    title: "Initial Launch",
    bullets: [
      "Bot Builder core",
      "AI code generation",
      "Discord.py support",
    ],
  },
];

export default function Changelog() {
  return (
    <div style={{ background: "#06060b", minHeight: "100vh", position: "relative" }}>      <AmbientBg />
      <FloatingNav />


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
              Changelog
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
            {"What's new\nin Buildable."}
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
              maxWidth: "460px",
              margin: "0 auto 72px",
              lineHeight: 1.7,
            }}
          >
            Every update, improvement, and fix — documented.
          </motion.p>

          {/* Timeline */}
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            {entries.map((entry, i) => (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 + i * 0.1 }}
                style={{
                  display: "flex",
                  gap: "32px",
                  marginBottom: i < entries.length - 1 ? "0" : "0",
                }}
              >
                {/* Left timeline line + dot */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    alignItems: "center",
                    flexShrink: 0,
                    width: "16px",
                  }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "rgba(139,92,246,0.6)",
                      border: "2px solid rgba(139,92,246,0.35)",
                      flexShrink: 0,
                      marginTop: "4px",
                      zIndex: 1,
                      position: "relative" as const,
                    }}
                  />
                  {/* Line (not on last item) */}
                  {i < entries.length - 1 && (
                    <div
                      style={{
                        width: "1px",
                        flex: 1,
                        minHeight: "40px",
                        background: "rgba(255,255,255,0.06)",
                        marginTop: "6px",
                        marginBottom: "0",
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    paddingBottom: i < entries.length - 1 ? "40px" : "0",
                  }}
                >
                  {/* Version + date row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                      flexWrap: "wrap" as const,
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(139,92,246,0.15)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: "999px",
                        padding: "3px 12px",
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "rgba(196,181,253,0.9)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {entry.version}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.28)",
                      }}
                    >
                      {entry.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.88)",
                      marginBottom: "14px",
                    }}
                  >
                    {entry.title}
                  </h3>

                  {/* Glass card with bullets */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "14px",
                      padding: "20px 24px",
                    }}
                  >
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "8px" }}>
                      {entry.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            fontFamily: "'Geist', sans-serif",
                            fontSize: "14px",
                            color: "rgba(255,255,255,0.6)",
                            lineHeight: 1.55,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              background: "rgba(139,92,246,0.6)",
                              flexShrink: 0,
                              marginTop: "7px",
                            }}
                          />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
