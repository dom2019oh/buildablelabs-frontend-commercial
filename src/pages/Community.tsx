import { motion } from "framer-motion";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg } from "@/lib/glass";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const stats = [
  { value: "2,400+", label: "Members" },
  { value: "1,800+", label: "Bots Built" },
  { value: "50+", label: "Countries" },
];

const featuredBots = [
  {
    name: "ModShield",
    author: "@modshield_dev",
    tags: ["Moderation", "Auto-ban"],
    description: "Advanced auto-moderation with smart ban patterns and audit logs.",
  },
  {
    name: "TicketMaster Pro",
    author: "@tmasterdev",
    tags: ["Support", "Tickets"],
    description: "Full-featured ticket system with categories, transcripts, and staff tools.",
  },
  {
    name: "WelcomeWizard",
    author: "@welcomebot",
    tags: ["Onboarding", "Roles"],
    description: "Greet new members with custom messages and assign roles automatically.",
  },
  {
    name: "GiveawayBot",
    author: "@giveaway_io",
    tags: ["Engagement", "Events"],
    description: "Run giveaways with reaction entries, timers, and winner announcements.",
  },
];

export default function Community() {
  return (
    <div style={{ background: "#07080d", minHeight: "100vh", position: "relative" }}>
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
              Community
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
            {"Build together,\ngrow together."}
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
              maxWidth: "500px",
              margin: "0 auto 56px",
              lineHeight: 1.7,
            }}
          >
            Join thousands of Discord server owners and bot builders in our community.
          </motion.p>

          {/* Discord CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: "rgba(88,101,242,0.10)",
              border: "1px solid rgba(88,101,242,0.25)",
              borderRadius: "20px",
              padding: "40px 48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap" as const,
              marginBottom: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "rgba(88,101,242,0.22)",
                  border: "1px solid rgba(88,101,242,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* Discord icon inline SVG */}
                <svg width="26" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60.1 4.9A58.6 58.6 0 0 0 45.6.4a.2.2 0 0 0-.2.1c-.6 1.1-1.3 2.6-1.8 3.7a54.1 54.1 0 0 0-16.2 0C26.9 3.1 26.2 1.6 25.6.5a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 11 4.9a.2.2 0 0 0-.1.1C1.6 18.8-1 32.3.3 45.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1c1.4-1.9 2.6-3.8 3.6-5.9a.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.2 24 5.2 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36 36 0 0 1-5.5 2.6.2.2 0 0 0-.1.3c1.1 2 2.3 4 3.6 5.9a.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.7-8.9.2.2 0 0 0 .1-.2c1.5-15.5-2.5-29-10.6-41a.2.2 0 0 0-.1 0zM23.7 37.8c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1z" fill="rgba(170,180,255,0.9)" />
                </svg>
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.88)",
                    marginBottom: "4px",
                  }}
                >
                  Join our Discord
                </h2>
                <p
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "14px",
                    color: "rgba(170,180,255,0.7)",
                    margin: 0,
                  }}
                >
                  2,400+ members · Share bots, get help, and build together.
                </p>
              </div>
            </div>
            <a href="#" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ background: "rgba(88,101,242,0.25)", border: "1px solid rgba(88,101,242,0.45)", borderRadius: "999px", color: "#fff", fontFamily: "'Geist', sans-serif", fontSize: "14px", fontWeight: 600, padding: "10px 22px", cursor: "pointer", whiteSpace: "nowrap" as const }}
              >
                Join Now →
              </motion.button>
            </a>
          </motion.div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "64px",
            }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.88)",
                    marginBottom: "4px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.38)",
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "48px" }} />

          {/* Featured Bots label */}
          <p
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Featured Bots
          </p>

          {/* Bot cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
              marginBottom: "64px",
            }}
          >
            {featuredBots.map((bot, i) => (
              <motion.div
                key={bot.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.07 }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: "10px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.88)",
                    margin: 0,
                  }}
                >
                  {bot.name}
                </h3>
                <p
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.28)",
                    margin: 0,
                  }}
                >
                  {bot.author}
                </p>
                <p
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {bot.description}
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" as const, marginTop: "4px" }}>
                  {bot.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "999px",
                        padding: "2px 10px",
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "48px" }} />

          {/* Share your bot CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "clamp(24px, 3.5vw, 34px)",
                fontWeight: 800,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "12px",
              }}
            >
              Share your bot with the community.
            </h2>
            <p
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "15px",
                color: "rgba(255,255,255,0.45)",
                marginBottom: "28px",
                lineHeight: 1.6,
              }}
            >
              Built something great? Showcase it to 2,400+ Discord server owners.
            </p>
            <a href="#" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "999px", color: "rgba(255,255,255,0.85)", fontFamily: "'Geist', sans-serif", fontSize: "14px", fontWeight: 500, padding: "10px 22px", cursor: "pointer" }}
              >
                Submit your bot →
              </motion.button>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
