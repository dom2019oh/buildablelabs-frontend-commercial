import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg } from "@/lib/glass";
import BorderGlow from "@/components/workspace/BorderGlow";

// Stack logo with gradient — mirrors LogoPreview's GradientStack
function GradientStack({ from, to, uid, size = 32 }: { from: string; to: string; uid: string; size?: number }) {
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

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

const values = [
  { gradFrom: "#fbbf24", gradTo: "#f97316", uid: "vg0",
    title: "Speed over complexity",
    body: "Most platforms make you set up a server, install dependencies, write boilerplate. We believe your idea should be live before you finish your coffee." },
  { gradFrom: "#34d399", gradTo: "#0891b2", uid: "vg1",
    title: "Built for communities",
    body: "Every feature is designed around real Discord servers — not generic chatbot use cases. Moderation, music, welcome flows, games. Whatever your server needs." },
  { gradFrom: "#60a5fa", gradTo: "#06b6d4", uid: "vg2",
    title: "Zero infrastructure",
    body: "Hosting, uptime, scaling — handled. You describe what you want. We handle everything else. Your bot stays online even when you're not." },
  { gradFrom: "#818cf8", gradTo: "#f472b6", uid: "vg3",
    title: "Real code, not toys",
    body: "Buildable generates production-quality Python bots using discord.py — not simplified wrappers. If you want to export the code, it's yours." },
  { gradFrom: "#fb7185", gradTo: "#fb923c", uid: "vg4",
    title: "Ship fast, iterate faster",
    body: "Change your bot's behaviour by describing the change. No redeploys. No config files. The feedback loop is seconds, not hours." },
  { gradFrom: "#a78bfa", gradTo: "#6366f1", uid: "vg5",
    title: "Accessible to everyone",
    body: "A 14-year-old running a Minecraft server and a developer building a community tool should have access to the same powerful bots. That's the point." },
];

export default function About() {
  return (
    <div style={{ background: "#06060b", minHeight: "100vh", position: "relative" }}>      <AmbientBg />

      <FloatingNav />

      <div style={{ position: "relative", zIndex: 1, paddingTop: "96px", paddingBottom: "120px" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10">

          {/* ── Hero ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: "96px" }}>
            <span
              style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "999px",
                padding: "4px 14px",
                fontFamily: "'Geist', sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "28px",
              }}
            >
              About Buildable
            </span>
            <h1
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "clamp(38px, 6vw, 58px)",
                fontWeight: 800,
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                marginBottom: "22px",
              }}
            >
              One person. One mission.<br />
              <span style={{ background: "linear-gradient(90deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Make bot building for everyone.</span>
            </h1>
            <p
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "17px",
                color: "rgba(255,255,255,0.45)",
                maxWidth: "560px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Buildable started because Discord communities deserve better tools — and building those tools shouldn't require a computer science degree.
            </p>
          </motion.div>

          {/* ── Founder Card ── */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ marginBottom: "96px" }}
          >
            <BorderGlow
              backgroundColor="#0a0c10"
              borderRadius={24}
              colors={["#a78bfa", "#6366f1", "#f472b6"]}
              glowColor="262 93 76"
              glowIntensity={0.85}
              style={{ width: "100%" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) minmax(0,1.8fr)",
                  gap: "0",
                }}
                className="md:grid-cols-[1fr_1.8fr] grid-cols-1"
              >
                {/* Photo column */}
                <div
                  style={{
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px 32px",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "160px",
                      height: "160px",
                      flexShrink: 0,
                    }}
                  >
                    {/* Glow ring */}
                    <div
                      style={{
                        position: "absolute",
                        inset: "-4px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6d28d9, #a78bfa)",
                        zIndex: 0,
                      }}
                    />
                    <img
                      src="/founder.png"
                      alt="Dom — Founder of Buildable"
                      style={{
                        position: "relative",
                        zIndex: 1,
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        objectPosition: "center top",
                        border: "3px solid #07080d",
                      }}
                    />
                    {/* Solo founder badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "4px",
                        right: "4px",
                        zIndex: 2,
                        background: "#2563eb",
                        borderRadius: "999px",
                        padding: "3px 9px",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: "'Geist', sans-serif",
                        letterSpacing: "0.04em",
                        border: "2px solid #07080d",
                      }}
                    >
                      SOLO
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        fontFamily: "'Geist', sans-serif",
                        marginBottom: "3px",
                        background: "linear-gradient(90deg, #a78bfa, #f472b6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Dr. Stark
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.35)",
                        fontFamily: "'Geist', sans-serif",
                        fontWeight: 500,
                        marginBottom: "6px",
                      }}
                    >
                      Dominic S.
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(140,100,255,0.7)",
                        fontFamily: "'Geist', sans-serif",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                      }}
                    >
                      Founder & Builder
                    </div>
                  </div>

                  {/* Stat pills */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    {[
                      { label: "Team size", value: "1" },
                      { label: "Founded", value: "2026" },
                      { label: "Status", value: "Building" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "'Geist', sans-serif" }}>{label}</span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.75)", fontFamily: "'Geist', sans-serif" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Story column */}
                <div style={{ padding: "48px 44px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "rgba(140,100,255,0.7)",
                      fontFamily: "'Geist', sans-serif",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "16px",
                    }}
                  >
                    Why I built this
                  </div>

                  <h2
                    style={{
                      fontSize: "clamp(22px, 3vw, 30px)",
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.9)",
                      fontFamily: "'Geist', sans-serif",
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                      marginBottom: "28px",
                    }}
                  >
                    I was tired of watching good ideas die at the terminal.
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {[
                      "I ran Discord servers. I had ideas for bots — moderation flows, music commands, auto-welcome messages, game integrations. But every time I tried to build one, I'd hit the same wall: Python environments, API tokens, VPS setup, 3am debugging sessions. The idea was fun. The process wasn't.",
                      "I looked around for tools that could close that gap. Nothing did. Everything either locked you into a dumbed-down GUI with no real power, or threw you into a code editor with zero help. There was no middle ground — no tool that gave you real, deployable Discord bots without the friction.",
                      "So I built Buildable myself. Just me, no team, no investors. The goal was simple: if you can describe your bot in plain English, it should exist. In minutes. Running on real infrastructure. Without you ever opening a terminal.",
                      "I'm still building it. Every feature, every improvement, every bug fix — that's me. I ship fast because I have to. And I stay close to what users actually need because I was one of them.",
                    ].map((para, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: "14.5px",
                          color: i === 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.45)",
                          fontFamily: "'Geist', sans-serif",
                          lineHeight: 1.75,
                          margin: 0,
                          ...(i === 0 ? { fontWeight: 500 } : {}),
                        }}
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "36px",
                      paddingTop: "28px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <img
                      src="/buildable-ai-icon.png"
                      alt=""
                      style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0, opacity: 0.8 }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.35)",
                        fontFamily: "'Geist', sans-serif",
                        fontStyle: "italic",
                      }}
                    >
                      "Build the tools you wish existed."
                    </span>
                  </div>
                </div>
              </div>
            </BorderGlow>
          </motion.div>

          {/* ── Why we charge ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.15 }} style={{ marginBottom: "96px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "24px",
                padding: "52px 48px",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "48px", alignItems: "start" }}
                className="md:grid-cols-[1fr_2fr] grid-cols-1">
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                    Pricing philosophy
                  </p>
                  <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, fontFamily: "'Geist', sans-serif", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "16px", background: "linear-gradient(90deg, #fbbf24, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Why I charge for this
                  </h2>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", lineHeight: 1.65 }}>
                    Honest answer, no fluff.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    {
                      title: "Every generation costs real money",
                      body: "Each time you describe a bot and Buildable builds it, I'm calling frontier AI models — GPT-4o, Claude Sonnet. These aren't cheap APIs. A single generation can cost multiple cents. At scale, that adds up fast. If I didn't charge, Buildable would be gone in a month.",
                    },
                    {
                      title: "Infrastructure isn't free either",
                      body: "Your bots run on real servers — Railway, Firebase, Cloudflare. That hosting, that uptime, that reliability? It has a bill attached. A 'free forever' model here is just a lie — it either cuts corners on quality or burns through VC money that eventually runs out.",
                    },
                    {
                      title: "Sustainable beats free",
                      body: "I'd rather charge a fair, transparent price and be around in two years than give everything away, burn out, and shut it down. The free tier gives you enough to build real bots. Pro is for the people who depend on Buildable for their communities — and those people deserve a product that's still running next year.",
                    },
                  ].map(({ title, body }) => (
                    <div key={title} style={{ display: "flex", gap: "16px" }}>
                      <div style={{ width: "4px", borderRadius: "4px", background: "linear-gradient(180deg, #7c3aed, rgba(124,58,237,0.15))", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "'Geist', sans-serif", marginBottom: "6px" }}>{title}</h3>
                        <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.42)", fontFamily: "'Geist', sans-serif", lineHeight: 1.7, margin: 0 }}>{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── AI Models ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.18 }} style={{ marginBottom: "96px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "24px",
                padding: "52px 48px",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "44px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                  Under the hood
                </p>
                <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, fontFamily: "'Geist', sans-serif", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "16px", background: "linear-gradient(90deg, #d97706, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  The AI powering your bots
                </h2>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", fontFamily: "'Geist', sans-serif", lineHeight: 1.65, maxWidth: "540px", margin: "0 auto" }}>
                  Claude across the board — different models for different jobs in the pipeline.
                </p>
              </div>

              {/* Anthropic-only note */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "32px" }}>
                <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.06)" }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontFamily: "'Geist', sans-serif", whiteSpace: "nowrap" }}>
                  Powered exclusively by Anthropic
                </span>
                <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.06)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginBottom: "36px" }}>
                {[
                  {
                    name: "Claude Sonnet 4.6",
                    role: "Architect + Coder — primary pipeline",
                    color: "#d97706",
                    gradFrom: "#fbbf24", gradTo: "#d97706", glowHSL: "38 92 60", stackUid: "ai0",
                    description: "The main workhorse. Sonnet 4.6 runs both the planning phase (reading your prompt, deciding structure) and the code generation phase (writing the actual Python files). It's the default for all generations — fast enough to stream results in real time, smart enough to produce production-quality discord.py code.",
                    status: "Live · Default",
                  },
                  {
                    name: "Claude Opus 4.6",
                    role: "Complex bots & deep reasoning",
                    color: "#8b5cf6",
                    gradFrom: "#a78bfa", gradTo: "#6366f1", glowHSL: "263 89 66", stackUid: "ai1",
                    description: "Opus is reserved for bots that need more than Sonnet can confidently handle — deep multi-command systems, intricate permission hierarchies, bots with stateful logic across multiple files. It takes longer, costs more credits, but it thinks harder before it writes.",
                    status: "Pro tier",
                  },
                  {
                    name: "Claude Haiku 4.5",
                    role: "Validation & quick iterations",
                    color: "#06b6d4",
                    gradFrom: "#22d3ee", gradTo: "#2dd4bf", glowHSL: "189 94 43", stackUid: "ai2",
                    description: "Haiku handles the lightweight end of the pipeline — syntax checking, quick re-generations when you change a small detail, and the validation pass after the main code is written. Too fast and cheap to waste Sonnet on.",
                    status: "Background tasks",
                  },
                ].map(({ name, role, color, description, status, gradFrom, gradTo, glowHSL, stackUid }) => (
                  <BorderGlow
                    key={name}
                    backgroundColor="#0a0c10"
                    borderRadius={16}
                    colors={[gradFrom, gradTo, color]}
                    glowColor={glowHSL}
                    glowIntensity={0.8}
                    style={{ width: "100%" }}
                  >
                    <div style={{ padding: "26px 22px", position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <GradientStack from={gradFrom} to={gradTo} uid={stackUid} size={22} />
                          <span style={{ fontSize: "13.5px", fontWeight: 700, fontFamily: "'Geist', sans-serif", background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{name}</span>
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: color, background: `${color}18`, border: `1px solid ${color}33`, borderRadius: "999px", padding: "2px 8px", fontFamily: "'Geist', sans-serif", whiteSpace: "nowrap" }}>{status}</span>
                      </div>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", fontFamily: "'Geist', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>{role}</p>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)", fontFamily: "'Geist', sans-serif", lineHeight: 1.7, margin: 0 }}>{description}</p>
                    </div>
                  </BorderGlow>
                ))}
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(167,139,250,0.7)", marginTop: "5px", flexShrink: 0 }} />
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontFamily: "'Geist', sans-serif", lineHeight: 1.65, margin: 0 }}>
                  All AI calls are server-side only. Your prompts are never stored beyond the session, and no API keys are exposed to the browser. The pipeline runs entirely on the backend — you describe the bot, the server handles the rest.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Competitors ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.2 }} style={{ marginBottom: "96px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "24px",
                padding: "52px 48px",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "44px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                  Honest comparison
                </p>
                <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, fontFamily: "'Geist', sans-serif", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "16px", background: "linear-gradient(90deg, #f87171, #e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Why I didn't stick with Bot Ghost
                </h2>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", fontFamily: "'Geist', sans-serif", lineHeight: 1.65, maxWidth: "560px", margin: "0 auto" }}>
                  I tried the alternatives. Here's my honest take.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {[
                  {
                    name: "Bot Ghost",
                    verdict: "Limited ceiling",
                    verdictColor: "#ef4444",
                    points: [
                      "Pre-built templates only — you pick from a list, you don't build from scratch",
                      "No real AI generation — it's configuration panels with a chatbot UI layered on top",
                      "The bots you get are the bots they decided to build, not the bots your community needs",
                      "Feels polished. Runs out of steam the moment you want something custom.",
                    ],
                  },
                  {
                    name: "Buildable",
                    verdict: "Built different",
                    verdictColor: "#22c55e",
                    points: [
                      "Plain English → real Python code, every time — not template selection",
                      "Every bot is unique to your prompt, your server, your use case",
                      "You can iterate — change the behaviour by describing the change, no rebuilding from scratch",
                      "Built by someone who was frustrated with the alternatives. That frustration is a feature.",
                    ],
                  },
                ].map(({ name, verdict, verdictColor, points }) => (
                  name === "Buildable" ? (
                    <BorderGlow
                      key={name}
                      backgroundColor="#0a0c10"
                      borderRadius={16}
                      colors={["#34d399", "#22c55e", "#a78bfa"]}
                      glowColor="142 71 45"
                      glowIntensity={0.8}
                      style={{ width: "100%" }}
                    >
                      <div style={{ padding: "28px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <GradientStack from="#34d399" to="#22c55e" uid="comp1" size={20} />
                            <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: "'Geist', sans-serif", background: "linear-gradient(90deg, #34d399, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{name}</span>
                          </div>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: verdictColor, background: `${verdictColor}15`, border: `1px solid ${verdictColor}30`, borderRadius: "999px", padding: "3px 10px", fontFamily: "'Geist', sans-serif" }}>{verdict}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {points.map((point, i) => (
                            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                                <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                              </div>
                              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontFamily: "'Geist', sans-serif", lineHeight: 1.65, margin: 0 }}>{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </BorderGlow>
                  ) : (
                    <div
                      key={name}
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px 24px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "'Geist', sans-serif" }}>{name}</span>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: verdictColor, background: `${verdictColor}15`, border: `1px solid ${verdictColor}30`, borderRadius: "999px", padding: "3px 10px", fontFamily: "'Geist', sans-serif" }}>{verdict}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {points.map((point, i) => (
                          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                              <svg width="7" height="7" viewBox="0 0 7 7"><path d="M1.5 1.5l4 4M5.5 1.5l-4 4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                            </div>
                            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontFamily: "'Geist', sans-serif", lineHeight: 1.65, margin: 0 }}>{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div
                style={{
                  background: "rgba(109,40,217,0.08)",
                  border: "1px solid rgba(109,40,217,0.2)",
                  borderRadius: "12px",
                  padding: "18px 22px",
                }}
              >
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontFamily: "'Geist', sans-serif", lineHeight: 1.65, margin: 0 }}>
                  <span style={{ color: "rgba(167,139,250,0.9)", fontWeight: 600 }}>The honest truth:</span> Bot Ghost isn't bad at what it does. It's just doing a different thing. If you want to pick from a menu, it's fine. If you want to actually describe a bot and have it exist — that's Buildable.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Values ── */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: "96px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'Geist', sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                What we stand for
              </p>
              <h2
                style={{
                  fontSize: "clamp(26px, 4vw, 36px)",
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.88)",
                  fontFamily: "'Geist', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                The principles behind the product
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.06 }}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px",
                    padding: "28px 24px",
                  }}
                >
                  <div style={{ marginBottom: "16px" }}>
                    <GradientStack from={v.gradFrom} to={v.gradTo} uid={v.uid} size={30} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "8px",
                      background: `linear-gradient(90deg, ${v.gradFrom}, ${v.gradTo})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "13.5px",
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {v.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── CTA ── */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "24px",
              padding: "64px 40px",
            }}
          >
            <p
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "16px",
              }}
            >
              Ready to build?
            </p>
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "clamp(26px, 4vw, 38px)",
                fontWeight: 800,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}
            >
              Your bot is one sentence away.
            </h2>
            <p
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "15px",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "36px",
              }}
            >
              Join thousands of Discord communities already running bots built on Buildable.
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
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", color: "rgba(255,255,255,0.7)", fontFamily: "'Geist', sans-serif", fontSize: "14px", fontWeight: 500, padding: "12px 28px", cursor: "pointer" }}
                >
                  View Pricing
                </motion.button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
