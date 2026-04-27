import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Heart, Eye } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg } from "@/lib/glass";

const showcaseProjects = [
  {
    id: "1",
    name: "Moderation Bot",
    author: "discord_dev",
    likes: 312,
    views: 1480,
    tag: "Moderation",
  },
  {
    id: "2",
    name: "Music Bot",
    author: "bot_creator",
    likes: 278,
    views: 1120,
    tag: "Music",
  },
  {
    id: "3",
    name: "Welcome Bot",
    author: "server_tools",
    likes: 194,
    views: 870,
    tag: "Utility",
  },
  {
    id: "4",
    name: "Ticket Bot",
    author: "support_sys",
    likes: 163,
    views: 745,
    tag: "Support",
  },
  {
    id: "5",
    name: "Giveaway Bot",
    author: "giveaway_king",
    likes: 141,
    views: 612,
    tag: "Fun",
  },
  {
    id: "6",
    name: "AI Chat Bot",
    author: "ai_builders",
    likes: 129,
    views: 508,
    tag: "AI",
  },
];

const filters = ["All", "Moderation", "Music", "Utility", "Support", "Fun", "AI"];

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
};

const glassInput: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  padding: "0 14px",
  gap: "10px",
};

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = showcaseProjects.filter((p) => {
    const matchesFilter = activeFilter === "All" || p.tag === activeFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060b",
        fontFamily: "'Geist', sans-serif",
        position: "relative",
      }}
    >
      <AmbientBg />

      <FloatingNav />

      <div
        style={{
          paddingTop: "112px",
          paddingBottom: "64px",
          paddingLeft: "24px",
          paddingRight: "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: "48px" }}
          >
            <h1
              style={{
                fontSize: "clamp(32px, 6vw, 52px)",
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "12px",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              Community{" "}
              <span
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontWeight: 800,
                  color: "rgba(140,100,255,0.9)",
                }}
              >
                Bot Gallery
              </span>
            </h1>
            <p
              style={{
                fontSize: "17px",
                color: "rgba(255,255,255,0.5)",
                maxWidth: "480px",
                margin: "0 auto",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              See what others have built with Buildable.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            {/* Search */}
            <div style={glassInput}>
              <Search style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bots..."
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "'Geist', sans-serif",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.88)",
                }}
              />
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontFamily: "'Geist', sans-serif",
                    cursor: "pointer",
                    border:
                      activeFilter === f
                        ? "1px solid rgba(140,100,255,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                    background:
                      activeFilter === f
                        ? "rgba(140,100,255,0.12)"
                        : "rgba(255,255,255,0.04)",
                    color:
                      activeFilter === f
                        ? "rgba(140,100,255,0.9)"
                        : "rgba(255,255,255,0.45)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Bot Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {filtered.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                style={glassCard}
              >
                {/* Bot icon placeholder */}
                <div
                  style={{
                    height: "120px",
                    borderRadius: "16px 16px 0 0",
                    background: "rgba(140,100,255,0.06)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "40px",
                      opacity: 0.4,
                      fontFamily: "'Geist', sans-serif",
                      color: "rgba(255,255,255,0.6)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {project.name.charAt(0)}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: "16px 20px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.88)",
                        fontFamily: "'Geist', sans-serif",
                      }}
                    >
                      {project.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "rgba(140,100,255,0.1)",
                        border: "1px solid rgba(140,100,255,0.2)",
                        color: "rgba(140,100,255,0.8)",
                        fontFamily: "'Geist', sans-serif",
                      }}
                    >
                      {project.tag}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.28)",
                      marginBottom: "14px",
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    by {project.author}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.28)",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Heart style={{ width: "13px", height: "13px" }} />
                      {project.likes}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Eye style={{ width: "13px", height: "13px" }} />
                      {project.views}
                    </span>
                    <Link
                      to={`/bot-${project.id}`}
                      style={{
                        marginLeft: "auto",
                        fontSize: "12px",
                        color: "rgba(140,100,255,0.7)",
                        textDecoration: "none",
                        fontFamily: "'Geist', sans-serif",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "rgba(140,100,255,1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "rgba(140,100,255,0.7)";
                      }}
                    >
                      View Bot →
                    </Link>
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
