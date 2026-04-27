import { useState } from "react";
import { motion } from "framer-motion";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg } from "@/lib/glass";
import { Bot, Shield, Code, Users, Music, Sparkles, Search } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface TutorialItem {
  title: string;
  difficulty: Difficulty;
  IconEl: React.ElementType<{ style?: React.CSSProperties }>;
}

const difficultyStyle: Record<Difficulty, { bg: string; text: string; border: string }> = {
  Beginner: {
    bg: "rgba(34,197,94,0.12)",
    text: "rgba(134,239,172,0.9)",
    border: "rgba(134,239,172,0.2)",
  },
  Intermediate: {
    bg: "rgba(245,158,11,0.12)",
    text: "rgba(253,211,77,0.9)",
    border: "rgba(253,211,77,0.2)",
  },
  Advanced: {
    bg: "rgba(139,92,246,0.14)",
    text: "rgba(196,181,253,0.9)",
    border: "rgba(196,181,253,0.2)",
  },
};

const tutorials: TutorialItem[] = [
  { title: "Your First Bot in 60 Seconds", difficulty: "Beginner", IconEl: Bot },
  { title: "Building a Moderation Bot", difficulty: "Beginner", IconEl: Shield },
  { title: "Adding Custom Commands", difficulty: "Intermediate", IconEl: Code },
  { title: "Setting Up Auto-Roles", difficulty: "Intermediate", IconEl: Users },
  { title: "Creating a Music Bot", difficulty: "Intermediate", IconEl: Music },
  { title: "Advanced: AI-Powered Responses", difficulty: "Advanced", IconEl: Sparkles },
];

export default function Tutorials() {
  const [query, setQuery] = useState("");

  return (
    <div style={{ background: "#06060b", minHeight: "100vh", position: "relative" }}>
      <AmbientBg />
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
              Tutorials
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
            {"Learn to build\nanything."}
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
              maxWidth: "480px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Step-by-step guides for every type of Discord bot.
          </motion.p>

          {/* Search bar */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: "56px" }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "15px",
                  height: "15px",
                  color: "rgba(255,255,255,0.28)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "999px",
                  padding: "11px 20px 11px 42px",
                  fontFamily: "'Geist', sans-serif",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.85)",
                  outline: "none",
                  boxSizing: "border-box" as const,
                }}
                onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)"; }}
                onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; }}
              />
            </div>
          </motion.div>

          {/* Tutorial cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {tutorials.map((tutorial, i) => {
              const Icon = tutorial.IconEl;
              const d = difficultyStyle[tutorial.difficulty];
              return (
                <motion.div
                  key={tutorial.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: "14px",
                  }}
                >
                  {/* Icon */}
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
                    }}
                  >
                    <Icon style={{ width: "17px", height: "17px", color: "rgba(255,255,255,0.65)" }} />
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.88)",
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {tutorial.title}
                  </h3>

                  {/* Badges row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
                    <span
                      style={{
                        background: d.bg,
                        border: `1px solid ${d.border}`,
                        borderRadius: "999px",
                        padding: "3px 10px",
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: d.text,
                      }}
                    >
                      {tutorial.difficulty}
                    </span>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "999px",
                        padding: "3px 10px",
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.28)",
                      }}
                    >
                      Coming soon
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
