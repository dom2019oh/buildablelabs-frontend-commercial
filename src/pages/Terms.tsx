import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FloatingNav from "@/components/FloatingNav";

export default function Terms() {
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
          Terms of Service
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
              1. Agreement to Terms
            </h2>
            <p style={{ marginBottom: "12px" }}>
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Buildable Labs ("Company," "we," "us," or "our") governing your access to and use of the Buildable Labs website, platform, and services (collectively, the "Services").
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access or use our Services.
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
              2. Eligibility
            </h2>
            <p style={{ marginBottom: "12px" }}>To use our Services, you must:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Be at least 18 years of age or the age of legal majority in your jurisdiction</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the Services under applicable laws</li>
              <li>Provide accurate and complete registration information</li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              If you are using the Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
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
              3. Account Registration and Security
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
              3.1 Account Creation
            </h3>
            <p style={{ marginBottom: "16px" }}>
              To access certain features of our Services, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
            </p>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "10px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              3.2 Account Security
            </h3>
            <p style={{ marginBottom: "12px" }}>You are responsible for:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or use</li>
              <li>Ensuring your account information remains accurate and up-to-date</li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably believe may be compromised.
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
              4. Services Description
            </h2>
            <p style={{ marginBottom: "12px" }}>
              Buildable Labs provides an AI-powered web application development platform that enables users to create, customize, and deploy web applications. Our Services include:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>AI-assisted code generation and development tools</li>
              <li>Pre-built templates and component libraries</li>
              <li>Workspace management and project collaboration features</li>
              <li>Deployment and hosting services</li>
              <li>Customer support and documentation</li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time with or without notice.
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
              5. Subscription and Payment
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
              5.1 Subscription Plans
            </h3>
            <p style={{ marginBottom: "16px" }}>
              We offer various subscription plans with different features and pricing. Details of each plan are available on our pricing page. You agree to pay all fees associated with your chosen subscription plan.
            </p>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "10px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              5.2 Billing
            </h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable unless otherwise stated</li>
              <li>We may change our fees upon 30 days' notice</li>
              <li>You are responsible for providing accurate billing information</li>
            </ul>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "10px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              5.3 Cancellation
            </h3>
            <p>
              You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. You will retain access to paid features until then.
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
              6. User Content and Conduct
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
              6.1 Your Content
            </h3>
            <p style={{ marginBottom: "16px" }}>
              You retain ownership of any content, code, or materials you create using our Services ("User Content"). By using our Services, you grant us a limited license to host, store, and display your User Content as necessary to provide the Services.
            </p>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "10px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              6.2 Prohibited Conduct
            </h3>
            <p style={{ marginBottom: "12px" }}>You agree not to:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Use the Services for any unlawful purpose or in violation of any laws</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Upload or distribute malware, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Use the Services to harass, abuse, or harm others</li>
              <li>Create content that is defamatory, obscene, or offensive</li>
              <li>Resell, redistribute, or sublicense the Services without permission</li>
              <li>Use automated tools to scrape or extract data from our Services</li>
              <li>Interfere with or disrupt the integrity or performance of the Services</li>
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
              7. Intellectual Property
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
              7.1 Our Intellectual Property
            </h3>
            <p style={{ marginBottom: "16px" }}>
              The Services, including all software, designs, text, graphics, logos, and other materials, are owned by or licensed to Buildable Labs and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written consent.
            </p>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "10px",
                fontFamily: "'Geist', sans-serif",
              }}
            >
              7.2 Feedback
            </h3>
            <p>
              If you provide feedback, suggestions, or ideas about our Services, you grant us a perpetual, irrevocable, royalty-free license to use, modify, and incorporate such feedback without compensation or attribution.
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
              8. Third-Party Services
            </h2>
            <p>
              Our Services may integrate with or link to third-party services, websites, or content. We are not responsible for the availability, accuracy, or content of these third-party services. Your use of third-party services is subject to their respective terms and privacy policies.
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
              9. Disclaimer of Warranties
            </h2>
            <p style={{ marginBottom: "12px" }}>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>WARRANTIES OF NON-INFRINGEMENT</li>
              <li>WARRANTIES THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE</li>
              <li>WARRANTIES REGARDING THE ACCURACY OR RELIABILITY OF ANY CONTENT</li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              We do not warrant that the AI-generated code will be free of bugs, errors, or security vulnerabilities. You are responsible for testing and reviewing all code before deployment.
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
              10. Limitation of Liability
            </h2>
            <p style={{ marginBottom: "12px" }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUILDABLE LABS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Loss of profits, revenue, or data</li>
              <li>Business interruption</li>
              <li>Cost of substitute services</li>
              <li>Any damages arising from your use of the Services</li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              Our total liability shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
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
              11. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Buildable Labs and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising out of your use of the Services, your User Content, or your violation of these Terms.
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
              12. Termination
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We may terminate or suspend your access to the Services immediately, without prior notice, for any reason, including:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>At our sole discretion for any other reason</li>
            </ul>
            <p style={{ marginTop: "14px" }}>
              Upon termination, your right to use the Services will immediately cease. Provisions that should survive termination will remain in effect.
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
              13. Governing Law and Disputes
            </h2>
            <p style={{ marginBottom: "12px" }}>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these Terms or your use of the Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive relief in court.
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
              14. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of the Services after such changes constitutes acceptance of the modified Terms.
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
              15. Miscellaneous
            </h2>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Entire Agreement:</strong>{" "}
                These Terms constitute the entire agreement between you and Buildable Labs regarding the Services.
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Severability:</strong>{" "}
                If any provision is found unenforceable, the remaining provisions will continue in effect.
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Waiver:</strong>{" "}
                Our failure to enforce any right does not constitute a waiver of that right.
              </li>
              <li>
                <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Assignment:</strong>{" "}
                You may not assign these Terms without our consent. We may assign our rights freely.
              </li>
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
              16. Contact Information
            </h2>
            <p style={{ marginBottom: "16px" }}>For questions about these Terms, please contact us at:</p>
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
            to="/privacy"
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
            Privacy Policy
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
