import { motion } from "framer-motion";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg } from "@/lib/glass";
import { Globe, Layers, Zap } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const perks = [
  { icon: Globe, title: "Remote-first", body: "Work from anywhere. We care about output, not where you sit." },
  { icon: Layers, title: "Equity & benefits", body: "Competitive equity package for all full-time team members." },
  { icon: Zap, title: "Ship fast", body: "No endless planning cycles. We build, ship, and iterate in days." },
];

const roles = [
  {
    title: "Full-Stack Engineer",
    dept: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Help us build the AI pipeline that powers thousands of bots.",
  },
  {
    title: "Growth & Community",
    dept: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Grow our Discord community and help creators discover Buildable.",
  },
];

export default function Careers() {
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
              Careers
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
            {"Join the team\nbuilding the future\nof Discord."}
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
              maxWidth: "520px",
              margin: "0 auto 64px",
              lineHeight: 1.7,
            }}
          >
            We're a small team moving fast. If you love Discord, bots, and building cool things
            — you'll fit right in.
          </motion.p>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "64px" }} />

          {/* Perks */}
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
            Perks
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "64px",
            }}
          >
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "9px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      marginBottom: "14px",
                    }}
                  >
                    <Icon style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.65)" }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.88)",
                      marginBottom: "6px",
                    }}
                  >
                    {perk.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {perk.body}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Open Roles */}
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
            Open Roles
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "16px", marginBottom: "56px" }}>
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.42 + i * 0.08 }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "28px 32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "24px",
                  flexWrap: "wrap" as const,
                }}
              >
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h3
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.88)",
                      marginBottom: "6px",
                    }}
                  >
                    {role.title}
                  </h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "10px" }}>
                    {[role.dept, role.location, role.type].map((tag) => (
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
                  <p
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.55)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {role.description}
                  </p>
                </div>
                <a
                  href={`mailto:buildablelabs@gmail.com?subject=Application: ${encodeURIComponent(role.title)}`}
                  style={{ textDecoration: "none" }}
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "999px", color: "rgba(255,255,255,0.85)", fontFamily: "'Geist', sans-serif", fontSize: "13px", fontWeight: 500, padding: "8px 18px", cursor: "pointer", whiteSpace: "nowrap" as const }}
                  >
                    Apply
                  </motion.button>
                </a>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "40px" }} />

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              color: "rgba(255,255,255,0.28)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Don't see your role? Email us at{" "}
            <a
              href="mailto:buildablelabs@gmail.com"
              style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
            >
              buildablelabs@gmail.com
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
