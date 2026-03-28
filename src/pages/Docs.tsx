import { motion } from "framer-motion";
import { Book, Code, Zap, Layers, Palette, Server, ChevronRight } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";

const docSections = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Learn the basics of Buildable and create your first Discord bot.",
    articles: ["Quick Start Guide", "Your First Bot", "Understanding Credits"],
  },
  {
    icon: Code,
    title: "Prompting Guide",
    description: "Master the art of writing effective prompts to describe your Discord bot.",
    articles: ["Writing Good Prompts", "Iterating on Bot Behaviour", "Advanced Techniques"],
  },
  {
    icon: Layers,
    title: "Features",
    description: "Explore all the features Buildable offers for Discord bot development.",
    articles: ["AI Code Generation", "Bot Hosting", "Custom Commands", "Collaboration"],
  },
  {
    icon: Palette,
    title: "Customization",
    description: "Customize your Discord bot to match your server's personality.",
    articles: ["Bot Personas", "Custom Responses", "Embed Design"],
  },
  {
    icon: Server,
    title: "Backend & Data",
    description: "Add persistent data, APIs, and integrations to your Discord bot.",
    articles: ["Database Setup", "API Integration", "Webhooks", "Bot Permissions"],
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: "transparent",
  border: "none",
  outline: "none",
  fontFamily: "'Geist', sans-serif",
  fontSize: "14px",
  color: "rgba(255,255,255,0.88)",
};

export default function Docs() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080a0c",
        fontFamily: "'Geist', sans-serif",
        position: "relative",
      }}
    >
      {/* Top purple bloom */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "50vh",
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(90,30,200,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <FloatingNav />

      <div style={{ paddingTop: "112px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: "64px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "999px",
                padding: "6px 14px",
                marginBottom: "24px",
              }}
            >
              <Book style={{ width: "14px", height: "14px", color: "rgba(140,100,255,0.8)" }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: "'Geist', sans-serif" }}>
                Documentation
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(36px, 6vw, 52px)",
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "8px",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              Learn{" "}
              <span
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontWeight: 800,
                  color: "rgba(140,100,255,0.9)",
                }}
              >
                Buildable
              </span>
            </h1>
            <p
              style={{
                fontSize: "17px",
                color: "rgba(255,255,255,0.5)",
                maxWidth: "520px",
                margin: "12px auto 0",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              Everything you need to build and deploy Discord bots with AI.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: "48px" }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search documentation..."
                style={inputStyle}
              />
            </div>
          </motion.div>

          {/* Doc Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {docSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: "rgba(140,100,255,0.12)",
                        border: "1px solid rgba(140,100,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: "20px", height: "20px", color: "rgba(140,100,255,0.8)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "17px",
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.88)",
                          marginBottom: "6px",
                          fontFamily: "'Geist', sans-serif",
                        }}
                      >
                        {section.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "rgba(255,255,255,0.5)",
                          marginBottom: "16px",
                          fontFamily: "'Geist', sans-serif",
                        }}
                      >
                        {section.description}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {section.articles.map((article) => (
                          <button
                            key={article}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "13px",
                              color: "rgba(255,255,255,0.45)",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "2px 0",
                              textAlign: "left",
                              fontFamily: "'Geist', sans-serif",
                              transition: "color 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                            }}
                          >
                            <ChevronRight style={{ width: "14px", height: "14px", color: "rgba(140,100,255,0.6)", flexShrink: 0 }} />
                            {article}
                          </button>
                        ))}
                      </div>
                    </div>
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
