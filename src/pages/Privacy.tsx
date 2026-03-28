import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";

export default function Privacy() {
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

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          paddingTop: "112px",
          paddingBottom: "80px",
          paddingLeft: "24px",
          paddingRight: "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            marginBottom: "40px",
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
          <ArrowLeft style={{ width: "14px", height: "14px" }} />
          Back to Home
        </Link>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.88)",
            marginBottom: "12px",
            letterSpacing: "-0.02em",
            fontFamily: "'Geist', sans-serif",
          }}
        >
          Privacy Policy
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "48px",
            fontFamily: "'Geist', sans-serif",
          }}
        >
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "40px",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "'Geist', sans-serif",
            fontSize: "15px",
            lineHeight: 1.75,
          }}
        >
          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              1. Introduction
            </h2>
            <p style={{ marginBottom: "12px" }}>
              Welcome to Buildable Labs ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              2. Information We Collect
            </h2>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "10px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              2.1 Personal Information
            </h3>
            <p style={{ marginBottom: "12px" }}>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <li>Register for an account</li>
              <li>Subscribe to our services</li>
              <li>Fill out a form or survey</li>
              <li>Contact us for support</li>
              <li>Participate in promotions or contests</li>
            </ul>
            <p style={{ marginBottom: "12px" }}>This information may include:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Name and email address</li>
              <li>Billing address and payment information</li>
              <li>Phone number</li>
              <li>Username and password</li>
              <li>Profile information and preferences</li>
            </ul>

            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "10px",
                marginTop: "24px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              2.2 Automatically Collected Information
            </h3>
            <p style={{ marginBottom: "12px" }}>When you access our services, we automatically collect certain information, including:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Device information (browser type, operating system, device type)</li>
              <li>IP address and location data</li>
              <li>Usage data (pages visited, time spent, click patterns)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Referring URLs and search terms</li>
            </ul>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              3. How We Use Your Information
            </h2>
            <p style={{ marginBottom: "12px" }}>We use the information we collect for various purposes, including:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Providing, maintaining, and improving our services</li>
              <li>Processing transactions and sending related information</li>
              <li>Sending promotional communications (with your consent)</li>
              <li>Responding to your comments, questions, and requests</li>
              <li>Analyzing usage patterns to enhance user experience</li>
              <li>Detecting, preventing, and addressing technical issues</li>
              <li>Protecting against fraudulent or unauthorized activity</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              4. Cookies and Tracking Technologies
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We use cookies and similar tracking technologies to collect and store information about your preferences and activity on our site. Types of cookies we use include:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Essential Cookies:</strong>{" "}
                Required for basic site functionality
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Analytics Cookies:</strong>{" "}
                Help us understand how visitors interact with our site
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Preference Cookies:</strong>{" "}
                Remember your settings and preferences
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Marketing Cookies:</strong>{" "}
                Used to deliver relevant advertisements
              </li>
            </ul>
            <p>
              You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our services.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              5. Information Sharing and Disclosure
            </h2>
            <p style={{ marginBottom: "12px" }}>We may share your information in the following circumstances:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Service Providers:</strong>{" "}
                Third-party vendors who assist in providing our services
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Business Transfers:</strong>{" "}
                In connection with a merger, acquisition, or sale of assets
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Legal Requirements:</strong>{" "}
                When required by law or to protect our rights
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>With Your Consent:</strong>{" "}
                When you have given us permission to share
              </li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              We do not sell your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              6. Data Security
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection</li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              7. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              8. Your Rights and Choices
            </h2>
            <p style={{ marginBottom: "12px" }}>Depending on your location, you may have the following rights:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Access:</strong>{" "}
                Request a copy of your personal information
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Correction:</strong>{" "}
                Request correction of inaccurate information
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Deletion:</strong>{" "}
                Request deletion of your personal information
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Portability:</strong>{" "}
                Request transfer of your data to another service
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Opt-out:</strong>{" "}
                Unsubscribe from marketing communications
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Restrict Processing:</strong>{" "}
                Limit how we use your information
              </li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              9. Children's Privacy
            </h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              10. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We take appropriate safeguards to ensure your information remains protected in accordance with this privacy policy.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              11. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                marginBottom: "14px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              12. Contact Us
            </h2>
            <p style={{ marginBottom: "16px" }}>
              If you have questions or concerns about this privacy policy or our data practices, please contact us at:
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "12px",
                padding: "18px 20px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500, marginBottom: "4px" }}>Buildable Labs</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:buildablelabs@gmail.com"
                  style={{
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
                  buildablelabs@gmail.com
                </a>
              </p>
            </div>
          </section>
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
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(140,100,255,1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(140,100,255,0.8)";
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
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(140,100,255,1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(140,100,255,0.8)";
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
