import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AmbientBg } from "@/lib/glass";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Geist', sans-serif",
      }}
    >
      <AmbientBg />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{ textAlign: "center", position: "relative", zIndex: 1 }}
      >
        <h1
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "clamp(96px, 18vw, 160px)",
            fontWeight: 800,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1,
            marginBottom: "24px",
            letterSpacing: "-0.02em",
          }}
        >
          404
        </h1>
        <p
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "40px",
          }}
        >
          This page doesn&apos;t exist.
        </p>
        <Link
          to="/"
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "14px",
            color: "rgba(140,100,255,0.8)",
            textDecoration: "none",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(140,100,255,1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(140,100,255,0.8)";
          }}
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
