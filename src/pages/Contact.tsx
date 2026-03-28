import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Bug, HelpCircle, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import FloatingNav from "@/components/FloatingNav";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  type: z.enum(["support", "bug"], { required_error: "Please select a topic" }),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 0",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  outline: "none",
  fontFamily: "'Geist', sans-serif",
  fontSize: "14px",
  color: "rgba(255,255,255,0.88)",
  borderRadius: 0,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  color: "rgba(255,255,255,0.28)",
  marginBottom: "6px",
  fontFamily: "'Geist', sans-serif",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const errorStyle: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "12px",
  color: "#f87171",
  fontFamily: "'Geist', sans-serif",
};

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    type: "support",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTypeChange = (type: "support" | "bug") => {
    setFormData((prev) => ({ ...prev, type }));
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactForm] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const mailtoSubject = encodeURIComponent(
      `[${formData.type === "bug" ? "Bug Report" : "Support"}] ${formData.subject}`
    );
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nType: ${
        formData.type === "bug" ? "Bug Report" : "Support Request"
      }\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:buildablelabs@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    toast({
      title: "Opening email client",
      description: "Your default email client should open with your message pre-filled.",
    });

    setIsSubmitting(false);
  };

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
          paddingTop: "112px",
          paddingBottom: "80px",
          paddingLeft: "24px",
          paddingRight: "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

          {/* Back link */}
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              marginBottom: "48px",
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

          {/* Two-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr",
              gap: "64px",
              alignItems: "flex-start",
            }}
          >
            {/* LEFT: Heading + contact info */}
            <div>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 48px)",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.88)",
                  marginBottom: "8px",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                Get in{" "}
                <span
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontWeight: 800,
                  }}
                >
                  Touch
                </span>
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "40px",
                  lineHeight: 1.6,
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                Have a question, need support, or found a bug? We&apos;d love to hear from you.
              </p>

              {/* Contact info cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "9px",
                      background: "rgba(140,100,255,0.12)",
                      border: "1px solid rgba(140,100,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Mail style={{ width: "16px", height: "16px", color: "rgba(140,100,255,0.8)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)", fontFamily: "'Geist', sans-serif", marginBottom: "2px" }}>
                      Email
                    </div>
                    <a
                      href="mailto:buildablelabs@gmail.com"
                      style={{
                        fontSize: "14px",
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
                      buildablelabs@gmail.com
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "9px",
                      background: "rgba(140,100,255,0.12)",
                      border: "1px solid rgba(140,100,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare style={{ width: "16px", height: "16px", color: "rgba(140,100,255,0.8)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)", fontFamily: "'Geist', sans-serif", marginBottom: "2px" }}>
                      Response time
                    </div>
                    <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontFamily: "'Geist', sans-serif" }}>
                      Usually within 24 hours
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Form */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px",
                padding: "36px",
              }}
            >
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                {/* Topic selection */}
                <div>
                  <label style={{ ...labelStyle, marginBottom: "12px" }}>What can we help you with?</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => handleTypeChange("support")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "14px",
                        borderRadius: "12px",
                        border:
                          formData.type === "support"
                            ? "1px solid rgba(140,100,255,0.5)"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          formData.type === "support"
                            ? "rgba(140,100,255,0.10)"
                            : "rgba(255,255,255,0.03)",
                        color:
                          formData.type === "support"
                            ? "rgba(255,255,255,0.88)"
                            : "rgba(255,255,255,0.45)",
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <HelpCircle style={{ width: "16px", height: "16px" }} />
                      Support
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange("bug")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "14px",
                        borderRadius: "12px",
                        border:
                          formData.type === "bug"
                            ? "1px solid rgba(140,100,255,0.5)"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          formData.type === "bug"
                            ? "rgba(140,100,255,0.10)"
                            : "rgba(255,255,255,0.03)",
                        color:
                          formData.type === "bug"
                            ? "rgba(255,255,255,0.88)"
                            : "rgba(255,255,255,0.45)",
                        fontFamily: "'Geist', sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Bug style={{ width: "16px", height: "16px" }} />
                      Bug Report
                    </button>
                  </div>
                  {errors.type && <p style={errorStyle}>{errors.type}</p>}
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" style={labelStyle}>Your Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    style={fieldStyle}
                  />
                  {errors.name && <p style={errorStyle}>{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" style={labelStyle}>Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    style={fieldStyle}
                  />
                  {errors.email && <p style={errorStyle}>{errors.email}</p>}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" style={labelStyle}>Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={
                      formData.type === "bug"
                        ? "Brief description of the bug"
                        : "What do you need help with?"
                    }
                    style={fieldStyle}
                  />
                  {errors.subject && <p style={errorStyle}>{errors.subject}</p>}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" style={labelStyle}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      formData.type === "bug"
                        ? "Please describe the bug in detail. Include steps to reproduce, expected behavior, and what actually happened."
                        : "Please describe your question or issue in detail."
                    }
                    rows={5}
                    style={{
                      ...fieldStyle,
                      resize: "none",
                      lineHeight: 1.6,
                    }}
                  />
                  {errors.message && <p style={errorStyle}>{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "999px",
                    background: isSubmitting ? "rgba(255,255,255,0.6)" : "#ffffff",
                    border: "none",
                    color: "#080a0c",
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "opacity 0.2s ease",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {isSubmitting ? (
                    "Opening email client..."
                  ) : (
                    <>
                      <Send style={{ width: "14px", height: "14px" }} />
                      Send Message
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
