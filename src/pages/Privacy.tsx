import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";
import { AmbientBg } from "@/lib/glass";

const sectionStyle: React.CSSProperties = {
  marginBottom: "48px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.88)",
  fontFamily: "'Geist', sans-serif",
  marginBottom: "12px",
};

const bodyStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.55)",
  fontFamily: "'Geist', sans-serif",
  lineHeight: 1.75,
};

export default function Privacy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060b",
        fontFamily: "'Geist', sans-serif",
        position: "relative",
      }}
    >      <AmbientBg />

      <FloatingNav />

      <div style={{ position: "relative", zIndex: 1, paddingTop: "112px", paddingBottom: "96px", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              fontFamily: "'Geist', sans-serif",
              marginBottom: "40px",
            }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            Back to home
          </Link>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "rgba(255,255,255,0.88)",
              fontFamily: "'Geist', sans-serif",
              marginBottom: "8px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", fontFamily: "'Geist', sans-serif", marginBottom: "56px" }}>
            Last updated: March 2026
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Information We Collect</h2>
            <p style={bodyStyle}>
              We collect information you provide directly to us, such as when you create an account, build a bot, or contact us for support. This includes your name, email address, and usage data related to the bots you create. We also collect technical information automatically, such as your IP address, browser type, and pages visited.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. How We Use Your Information</h2>
            <p style={bodyStyle}>
              We use the information we collect to provide, maintain, and improve our services; to process transactions; to send you technical notices and support messages; and to respond to your comments and questions. We do not sell your personal information to third parties.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Data Retention</h2>
            <p style={bodyStyle}>
              We retain your account information and bot data for as long as your account is active. You may request deletion of your data at any time by contacting us. Upon deletion, your bots will be taken offline and all associated data will be permanently removed within 30 days.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Cookies</h2>
            <p style={bodyStyle}>
              We use cookies and similar tracking technologies to maintain your session, remember your preferences, and understand how you use Buildable. You can disable cookies in your browser settings, though some features may not function properly as a result.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Third-Party Services</h2>
            <p style={bodyStyle}>
              Buildable integrates with third-party services including Discord, Firebase, and Railway for authentication, data storage, and bot hosting. These services have their own privacy policies. By using Buildable, you agree to the relevant terms of these services.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Security</h2>
            <p style={bodyStyle}>
              We implement industry-standard security measures to protect your data. All data is transmitted over HTTPS, and access to production systems is restricted to authorised personnel. However, no method of transmission over the Internet is 100% secure.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. Contact Us</h2>
            <p style={bodyStyle}>
              If you have questions about this Privacy Policy or how we handle your data, please reach out at{" "}
              <a href="/contact" style={{ color: "rgba(140,100,255,0.8)", textDecoration: "none" }}>
                our contact page
              </a>
              .
            </p>
          </div>

          <div
            style={{
              marginTop: "64px",
              paddingTop: "32px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <Link
              to="/terms"
              style={{
                fontSize: "13px",
                color: "rgba(140,100,255,0.8)",
                textDecoration: "none",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              Terms of Service
            </Link>
            <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "13px" }}>|</span>
            <Link
              to="/"
              style={{
                fontSize: "13px",
                color: "rgba(140,100,255,0.8)",
                textDecoration: "none",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
