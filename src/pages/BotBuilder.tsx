import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg } from "@/lib/glass";
import BorderGlow from "@/components/workspace/BorderGlow";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

function GradientStack({ from, to, uid, size = 28 }: { from: string; to: string; uid: string; size?: number }) {
  return (
    <svg viewBox="0 0 36 29" fill="none" style={{ width: size, height: Math.round(size * 29 / 36), display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="36" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0"  width="36" height="7" rx="3.5" fill={`url(#${uid})`} />
      <rect x="0" y="11" width="26" height="7" rx="3.5" fill={`url(#${uid})`} />
      <rect x="0" y="22" width="16" height="7" rx="3.5" fill={`url(#${uid})`} />
    </svg>
  );
}

const steps = [
  {
    num: "01",
    gradFrom: "#a78bfa", gradTo: "#6366f1", uid: "s0",
    title: "Describe your bot",
    body: "Type one sentence. Or ten. Tell Buildable what your bot should do, how it should behave, and what your server needs. Plain English — no syntax required.",
    example: '"Create a welcome bot that greets new members with a custom message and assigns a role"',
  },
  {
    num: "02",
    gradFrom: "#fbbf24", gradTo: "#f97316", uid: "s1",
    title: "AI writes the code",
    body: "Claude reads your prompt, plans the architecture, and generates production-quality Python using discord.py — full command handlers, event listeners, permissions. Real code, not wrappers.",
    example: "Claude Sonnet 4.6 · Architect + Coder pipeline · ~15–30 seconds",
  },
  {
    num: "03",
    gradFrom: "#34d399", gradTo: "#0891b2", uid: "s2",
    title: "Live in seconds",
    body: "No servers to configure. No pip installs. No SSH sessions at 2am. Your bot is deployed on Buildable infrastructure and online immediately — 24/7, zero DevOps from you.",
    example: "MusicBot is online · Railway · Uptime 99.9%",
  },
];

const features = [
  { gradFrom: "#a78bfa", gradTo: "#6366f1", uid: "f0", title: "Natural language prompts", body: "Describe your bot in plain English. Buildable understands context, intent, and even edge cases." },
  { gradFrom: "#34d399", gradTo: "#0891b2", uid: "f1", title: "Full discord.py output", body: "Real Python code using the discord.py library — not simplified wrappers. Export it anytime, it's yours." },
  { gradFrom: "#fbbf24", gradTo: "#f97316", uid: "f2", title: "Instant deployment", body: "Click once and your bot is live on our infrastructure. No Docker, no Railway config, no environment setup." },
  { gradFrom: "#fb7185", gradTo: "#fb923c", uid: "f3", title: "Iterate with words", body: "Change your bot's behaviour by describing the change. The same way you built it — no rebuilding from scratch." },
  { gradFrom: "#818cf8", gradTo: "#f472b6", uid: "f4", title: "Multi-command bots", body: "Slash commands, prefix commands, event handlers, cron tasks — Buildable builds complex, multi-file bots, not just single scripts." },
  { gradFrom: "#22d3ee", gradTo: "#2dd4bf", uid: "f5", title: "Always online", body: "Your bots run on Buildable's hosted infrastructure. No VPS to babysit. No surprise downtime from a laptop closing." },
];

const SUGGESTIONS = [
  "A moderation bot that auto-bans spam accounts",
  "A music bot with YouTube queue support",
  "A welcome bot that assigns roles on join",
  "A daily trivia bot for #general",
];

export default function BotBuilder() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  return (
    <div style={{ background: "#06060b", minHeight: "100vh", position: "relative" }}>
      {/* Grainient */}      <AmbientBg />

      <FloatingNav />

      <div style={{ position: "relative", zIndex: 1, paddingTop: "96px", paddingBottom: "120px" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10">

          {/* ── Hero ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: "80px" }}>

            {/* Badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
              <img src="/buildable-ai-icon.png" alt="" style={{ width: 18, height: 18, objectFit: "contain" }} />
              <span style={{
                fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "999px", padding: "4px 14px",
                fontFamily: "'Geist', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                Bot Builder
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "clamp(40px, 7vw, 68px)",
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              marginBottom: "22px",
            }}>
              <span style={{ color: "rgba(255,255,255,0.92)" }}>Describe it.</span>
              <br />
              <span style={{
                background: "linear-gradient(90deg, #a78bfa, #f472b6, #fb923c)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                We build it.
              </span>
            </h1>

            <p style={{
              fontFamily: "'Geist', sans-serif", fontSize: "17px",
              color: "rgba(255,255,255,0.45)", maxWidth: "560px",
              margin: "0 auto 44px", lineHeight: 1.7,
            }}>
              Type what you want your Discord bot to do. Buildable AI writes real Python code, deploys it, and keeps it running — in under 30 seconds.
            </p>

            {/* Mock prompt input */}
            <div style={{ maxWidth: "620px", margin: "0 auto 20px" }}>
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px", padding: "4px 4px 4px 20px",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <input
                  type="text"
                  placeholder="Describe your bot in plain English…"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && prompt.trim()) navigate("/sign-up"); }}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    fontFamily: "'Geist', sans-serif", fontSize: "14px",
                    color: "rgba(255,255,255,0.85)", padding: "10px 0",
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/sign-up")}
                  style={{ background: "#6d28d9", border: "1px solid #7c3aed", borderRadius: "12px", color: "#fff", fontFamily: "'Geist', sans-serif", fontSize: "13px", fontWeight: 600, padding: "8px 18px", cursor: "pointer", flexShrink: 0 }}
                >
                  Build →
                </motion.button>
              </div>
            </div>

            {/* Suggestion pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "620px", margin: "0 auto" }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "999px", padding: "5px 14px",
                    fontFamily: "'Geist', sans-serif", fontSize: "12px",
                    color: "rgba(255,255,255,0.4)", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── How it works ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: "96px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
                The process
              </p>
              <h2 style={{
                fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800,
                fontFamily: "'Geist', sans-serif", letterSpacing: "-0.02em",
                background: "linear-gradient(90deg, #a78bfa, #fbbf24, #34d399)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Three steps. One sentence.
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                >
                  <BorderGlow
                    backgroundColor="#0a0c10"
                    borderRadius={20}
                    colors={[step.gradFrom, step.gradTo, "#ffffff"]}
                    glowColor={i === 0 ? "263 89 66" : i === 1 ? "38 92 60" : "160 71 45"}
                    glowIntensity={0.75}
                    style={{ width: "100%" }}
                  >
                    <div style={{ padding: "32px 36px", display: "flex", gap: "28px", alignItems: "flex-start" }}>
                      {/* Step number + icon */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        <div style={{
                          fontSize: "11px", fontWeight: 700,
                          fontFamily: "'Geist', sans-serif", letterSpacing: "0.08em",
                          background: `linear-gradient(90deg, ${step.gradFrom}, ${step.gradTo})`,
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                          {step.num}
                        </div>
                        <GradientStack from={step.gradFrom} to={step.gradTo} uid={step.uid} size={26} />
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontFamily: "'Geist', sans-serif", fontSize: "18px", fontWeight: 700,
                          marginBottom: "10px",
                          background: `linear-gradient(90deg, ${step.gradFrom}, ${step.gradTo})`,
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                          {step.title}
                        </h3>
                        <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "14.5px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 16px" }}>
                          {step.body}
                        </p>
                        <div style={{
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "8px", padding: "10px 14px",
                          fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
                          fontSize: "12px", color: "rgba(255,255,255,0.3)",
                        }}>
                          {step.example}
                        </div>
                      </div>
                    </div>
                  </BorderGlow>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Features grid ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: "96px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
                Everything included
              </p>
              <h2 style={{
                fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800,
                fontFamily: "'Geist', sans-serif", letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.88)",
              }}>
                Built for real Discord servers
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              {features.map((f, i) => (
                <motion.div
                  key={f.uid}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.06 }}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px",
                    padding: "26px 22px",
                  }}
                >
                  <div style={{ marginBottom: "14px" }}>
                    <GradientStack from={f.gradFrom} to={f.gradTo} uid={f.uid} size={26} />
                  </div>
                  <h3 style={{
                    fontFamily: "'Geist', sans-serif", fontSize: "14.5px", fontWeight: 600,
                    marginBottom: "8px",
                    background: `linear-gradient(90deg, ${f.gradFrom}, ${f.gradTo})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    {f.title}
                  </h3>
                  <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.42)", lineHeight: 1.7, margin: 0 }}>
                    {f.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Powered by AI ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }} style={{ marginBottom: "96px" }}>
            <BorderGlow
              backgroundColor="#0a0c10"
              borderRadius={20}
              colors={["#d97706", "#a78bfa", "#06b6d4"]}
              glowColor="263 89 66"
              glowIntensity={0.7}
              style={{ width: "100%" }}
            >
              <div style={{ padding: "48px", display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap" }}>
                {/* AI icon */}
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <img
                    src="/buildable-ai-icon.png"
                    alt="Buildable AI"
                    style={{ width: 72, height: 72, objectFit: "contain" }}
                  />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Buildable AI
                  </span>
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
                    Powered by Anthropic
                  </p>
                  <h2 style={{
                    fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 800,
                    fontFamily: "'Geist', sans-serif", letterSpacing: "-0.02em",
                    marginBottom: "12px",
                    background: "linear-gradient(90deg, #fbbf24, #a78bfa)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    Claude at the core. Not a toy.
                  </h2>
                  <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "24px" }}>
                    Every bot is generated by Claude Sonnet 4.6 — Anthropic's frontier model. The pipeline uses a two-phase approach: Architect (planning structure and commands) then Coder (writing every file). Complex bots escalate to Claude Opus 4.6. Background validation runs on Haiku 4.5.
                  </p>
                  {/* Model pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {[
                      { label: "Claude Sonnet 4.6", color: "#d97706", from: "#fbbf24", to: "#d97706", uid: "mp0" },
                      { label: "Claude Opus 4.6", color: "#8b5cf6", from: "#a78bfa", to: "#6366f1", uid: "mp1" },
                      { label: "Claude Haiku 4.5", color: "#06b6d4", from: "#22d3ee", to: "#2dd4bf", uid: "mp2" },
                    ].map(m => (
                      <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "999px", padding: "5px 12px" }}>
                        <GradientStack from={m.from} to={m.to} uid={m.uid} size={14} />
                        <span style={{ fontSize: "11px", fontWeight: 600, fontFamily: "'Geist', sans-serif", color: "rgba(255,255,255,0.6)" }}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </BorderGlow>
          </motion.div>

          {/* ── CTA ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <BorderGlow
              backgroundColor="#0a0c10"
              borderRadius={24}
              colors={["#a78bfa", "#f472b6", "#34d399"]}
              glowColor="300 70 70"
              glowIntensity={0.8}
              style={{ width: "100%" }}
            >
              <div style={{ padding: "64px 48px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                  <img src="/buildable-ai-icon.png" alt="" style={{ width: 48, height: 48, objectFit: "contain" }} />
                </div>
                <h2 style={{
                  fontFamily: "'Geist', sans-serif",
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: "14px",
                  background: "linear-gradient(90deg, #a78bfa, #f472b6)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  Build your first bot free.
                </h2>
                <p style={{ fontFamily: "'Geist', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.4)", marginBottom: "36px", lineHeight: 1.65 }}>
                  No credit card. No server setup. Describe your bot and it's live in seconds.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link to="/sign-up" style={{ textDecoration: "none" }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ background: "#6d28d9", border: "1px solid #7c3aed", borderRadius: "999px", color: "#fff", fontFamily: "'Geist', sans-serif", fontSize: "14px", fontWeight: 600, padding: "12px 28px", cursor: "pointer" }}
                    >
                      Start Building Free →
                    </motion.button>
                  </Link>
                  <Link to="/pricing" style={{ textDecoration: "none" }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", color: "rgba(255,255,255,0.65)", fontFamily: "'Geist', sans-serif", fontSize: "14px", fontWeight: 500, padding: "12px 28px", cursor: "pointer" }}
                    >
                      View Pricing
                    </motion.button>
                  </Link>
                </div>
              </div>
            </BorderGlow>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
