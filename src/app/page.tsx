"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  Mail,
  Send,
  CheckCircle2,
  Upload,
  User,
  Zap,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Sliders,
  CheckCheck
} from "lucide-react";

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"profile" | "gmail" | "forge" | "tracker">("profile");
  const [isCopied, setIsCopied] = useState(false);
  const [dummyChannel, setDummyChannel] = useState<"email" | "linkedin">("email");
  const [dummyTone, setDummyTone] = useState<"confident" | "direct" | "value">("confident");
  const [dummySubject, setDummySubject] = useState("Scaling Next.js App Router performance + Jane Doe");
  const [dummyDispatched, setDummyDispatched] = useState(false);

  /* Waitlist handlers (commented out)
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail.trim() && waitlistEmail.includes("@")) {
      setWaitlistSubmitted(true);
    }
  };
  */

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#000000" }}>
      {/* Subtle Ambient Grid Background (Rightfit style) */}
      <div className="ambient-grid" />

      {/* Top Header / Navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0.85rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000000",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              C
            </div>
            <span style={{ fontWeight: 550, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>
              ColdForge AI
            </span>
            <span className="rf-badge" style={{ marginLeft: "0.25rem", fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
              v1.0 Preview
            </span>
          </div>

          {/* Navigation Anchors */}
          <nav style={{ display: "none", alignItems: "center", gap: "1.75rem" }} className="desktop-nav">
            <a href="#features" style={{ color: "#8e8e93", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#8e8e93")}>
              Upcoming Features
            </a>
            <a href="#workflow" style={{ color: "#8e8e93", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#8e8e93")}>
              How It Works
            </a>
            <a href="#security" style={{ color: "#8e8e93", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#8e8e93")}>
              Security
            </a>
            <a href="#faq" style={{ color: "#8e8e93", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#8e8e93")}>
              FAQ
            </a>
          </nav>

          {/* Header Action */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="rf-badge rf-badge-accent" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", gap: "0.4rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#30d158", display: "inline-block" }} />
              <span>Coming Soon</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "5rem 1.5rem 3.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Release Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: "1.5rem" }}
        >
          <div className="rf-badge rf-badge-accent" style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem", gap: "0.5rem" }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#30d158" }} />
            <span>Introducing ColdForge AI • Direct Gmail Outreach</span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: "clamp(1.85rem, 4vw, 2.85rem)",
            fontWeight: 510,
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
            maxWidth: "760px",
            color: "#ffffff",
          }}
        >
          Build your profile. Link your Gmail.
          <br />
          Send cold emails that land jobs.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: "clamp(0.9rem, 1.5vw, 1.025rem)",
            color: "#8e8e93",
            maxWidth: "600px",
            marginTop: "1rem",
            lineHeight: 1.6,
          }}
        >
          ColdForge AI extracts your real achievements from your resume or custom profile, links directly to your personal Gmail via OAuth, and delivers hyper-personalized cold outreach with 1-click execution.
        </motion.p>

        {/* Waitlist / Early Access Form (Commented Out) */}
        <motion.div
          id="early-access"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
        >
          {/*
          {!waitlistSubmitted ? (
            <form onSubmit={handleWaitlistSubmit} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                required
                placeholder="Enter your work or personal email..."
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                className="rf-input"
                style={{ flex: 1, padding: "0.75rem 1rem" }}
              />
              <button type="submit" className="rf-button-primary" style={{ whiteSpace: "nowrap" }}>
                <span>Join Waitlist</span>
                <ArrowRight size={15} />
              </button>
            </form>
          ) : (
            <div
              style={{
                padding: "0.85rem 1.25rem",
                borderRadius: "14px",
                backgroundColor: "rgba(48, 209, 88, 0.08)",
                border: "1px solid rgba(48, 209, 88, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                color: "#30d158",
                fontSize: "0.9rem",
              }}
            >
              <CheckCircle2 size={18} />
              <span>You&apos;re on the priority access list! We will notify you at launch.</span>
            </div>
          )}
          <p style={{ fontSize: "0.75rem", color: "#545458", marginTop: "0.6rem" }}>
            Free early access • Zero spam • Direct 1-to-1 inbox delivery
          </p>
          */}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.65rem 1.5rem",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "0.95rem",
              fontWeight: 520,
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.05)",
            }}
          >
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#30d158", boxShadow: "0 0 8px #30d158" }} />
            <span>Coming Soon</span>
          </div>

          <p style={{ fontSize: "0.775rem", color: "#71717a" }}>
            Direct Gmail cold outreach engine is currently in development.
          </p>
        </motion.div>

        {/* Live Metrics Row (Rightfit style) */}
        <div
          style={{
            marginTop: "3.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1.25rem",
            width: "100%",
            maxWidth: "860px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            paddingTop: "2rem",
          }}
        >
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 550, color: "#ffffff", letterSpacing: "-0.03em" }}>
              1-Click
            </div>
            <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.2rem" }}>
              Direct Gmail dispatch
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 550, color: "#ffffff", letterSpacing: "-0.03em" }}>
              100%
            </div>
            <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.2rem" }}>
              Native inbox deliverability
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 550, color: "#ffffff", letterSpacing: "-0.03em" }}>
              Dual
            </div>
            <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.2rem" }}>
              PDF or manual builder
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 550, color: "#ffffff", letterSpacing: "-0.03em" }}>
              3.8x
            </div>
            <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.2rem" }}>
              Higher recruiter reply rate
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo Showcase (Rightfit Tabbed Preview) */}
      <section
        id="features"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem 5rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#08080a",
            overflow: "hidden",
            boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.8)",
          }}
        >
          {/* Top App Tab Bar */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {/* Window Dots */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", paddingLeft: "0.5rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
            </div>

            {/* Interactive Feature Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", overflowX: "auto" }}>
              <button
                className={`rf-tab ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <User size={14} /> 1. Profile Builder
              </button>
              <button
                className={`rf-tab ${activeTab === "gmail" ? "active" : ""}`}
                onClick={() => setActiveTab("gmail")}
              >
                <Mail size={14} /> 2. Linked Gmail
              </button>
              <button
                className={`rf-tab ${activeTab === "forge" ? "active" : ""}`}
                onClick={() => setActiveTab("forge")}
              >
                <Zap size={14} /> 3. JD → Outreach Studio
              </button>
              <button
                className={`rf-tab ${activeTab === "tracker" ? "active" : ""}`}
                onClick={() => setActiveTab("tracker")}
              >
                <TrendingUp size={14} /> 4. Reply Pipeline
              </button>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#545458", paddingRight: "0.5rem" }}>
              Interactive Feature Preview
            </div>
          </div>

          {/* Interactive Screen View */}
          <div style={{ padding: "2.5rem 2rem", minHeight: "440px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatePresence mode="wait">
              {/* Tab 1: Profile Builder */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: "100%", maxWidth: "900px" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    {/* Method A: Resume Upload */}
                    <div
                      style={{
                        padding: "1.75rem",
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backgroundColor: "#0d0d10",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <FileText size={18} color="#ffffff" />
                          <span style={{ fontWeight: 510, fontSize: "0.95rem" }}>Resume Automated Parser</span>
                        </div>
                        <span className="rf-badge">PDF Supported</span>
                      </div>
                      <p style={{ fontSize: "0.825rem", color: "#8e8e93" }}>
                        Upload your existing PDF resume. ColdForge extracts core skills, tech stacks, and quantifiable career wins into your structured candidate profile.
                      </p>

                      <div
                        style={{
                          border: "1px dashed rgba(255, 255, 255, 0.15)",
                          borderRadius: "12px",
                          padding: "1.5rem 1rem",
                          textAlign: "center",
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Upload size={22} color="#8e8e93" />
                        <span style={{ fontSize: "0.8rem", color: "#d4d4d8" }}>Jane_Doe_Staff_Engineer_Resume.pdf</span>
                        <span style={{ fontSize: "0.7rem", color: "#30d158", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <CheckCircle2 size={12} /> 18 Skills & 4 Roles extracted
                        </span>
                      </div>
                    </div>

                    {/* Method B: Manual Profile Builder */}
                    <div
                      style={{
                        padding: "1.75rem",
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backgroundColor: "#0d0d10",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Sliders size={18} color="#ffffff" />
                          <span style={{ fontWeight: 510, fontSize: "0.95rem" }}>Manual Portfolio Builder</span>
                        </div>
                        <span className="rf-badge">Custom Fields</span>
                      </div>
                      <p style={{ fontSize: "0.825rem", color: "#8e8e93" }}>
                        Don&apos;t rely solely on paper. Highlight personal GitHub projects, design portfolios, production metrics, and the exact roles you are targeting.
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ padding: "0.6rem 0.85rem", backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                          <span style={{ color: "#d4d4d8" }}>🚀 Scaled Next.js SaaS to 2M monthly queries</span>
                          <span style={{ fontSize: "0.7rem", color: "#8e8e93" }}>Project</span>
                        </div>
                        <div style={{ padding: "0.6rem 0.85rem", backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                          <span style={{ color: "#d4d4d8" }}>⚡ Reduced API p99 latency by 45%</span>
                          <span style={{ fontSize: "0.7rem", color: "#8e8e93" }}>Metric</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Linked Gmail */}
              {activeTab === "gmail" && (
                <motion.div
                  key="gmail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: "100%", maxWidth: "800px" }}
                >
                  <div
                    style={{
                      padding: "2rem",
                      borderRadius: "18px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      backgroundColor: "#0d0d10",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(234, 67, 53, 0.12)",
                            border: "1px solid rgba(234, 67, 53, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ea4335",
                          }}
                        >
                          <Mail size={22} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 520, fontSize: "1rem", color: "#ffffff" }}>
                            Linked Gmail Account
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#8e8e93", marginTop: "0.15rem" }}>
                            jane.doe@gmail.com • Authenticated via Google OAuth
                          </div>
                        </div>
                      </div>
                      <div className="rf-badge" style={{ backgroundColor: "rgba(48, 209, 88, 0.1)", borderColor: "rgba(48, 209, 88, 0.25)", color: "#30d158" }}>
                        <CheckCheck size={14} /> Connected & Verified
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "1.25rem",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deliverability</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 550, color: "#ffffff", marginTop: "0.25rem" }}>Primary Inbox</div>
                        <div style={{ fontSize: "0.75rem", color: "#8e8e93", marginTop: "0.15rem" }}>No &apos;via third-party&apos; spam badges</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Security Model</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 550, color: "#ffffff", marginTop: "0.25rem" }}>Encrypted OAuth</div>
                        <div style={{ fontSize: "0.75rem", color: "#8e8e93", marginTop: "0.15rem" }}>Never stores your password</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Quota</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 550, color: "#ffffff", marginTop: "0.25rem" }}>100 Outreaches / Day</div>
                        <div style={{ fontSize: "0.75rem", color: "#8e8e93", marginTop: "0.15rem" }}>Optimal for high response rate</div>
                      </div>
                    </div>

                    <p style={{ fontSize: "0.825rem", color: "#71717a", margin: 0 }}>
                      By authenticating directly with Google, your outreach originates genuinely from your personal mailbox. Recruiters see your real name and verified email, dramatically boosting response rates.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Split-Screen Studio (Pasted JD on Left | Generated Email on Right) */}
              {activeTab === "forge" && (
                <motion.div
                  key="forge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: "100%", maxWidth: "1080px" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                      gap: "1.25rem",
                      alignItems: "stretch",
                    }}
                  >
                    {/* LEFT PANEL: Pasted Target Job Description */}
                    <div
                      style={{
                        padding: "1.5rem",
                        borderRadius: "18px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backgroundColor: "#0d0d10",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <FileText size={16} color="#ffffff" />
                          <span style={{ fontWeight: 520, fontSize: "0.95rem", color: "#ffffff" }}>
                            Target Job Description
                          </span>
                        </div>
                        <span className="rf-badge" style={{ fontSize: "0.7rem" }}>
                          Input Source: LinkedIn
                        </span>
                      </div>

                      {/* Role & Company Header */}
                      <div
                        style={{
                          padding: "0.75rem 1rem",
                          borderRadius: "10px",
                          backgroundColor: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.85rem",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 550, color: "#ffffff" }}>Senior Full Stack Engineer (AI Workflows)</div>
                          <div style={{ fontSize: "0.75rem", color: "#8e8e93", marginTop: "0.15rem" }}>
                            Linear • Recipient: Alex Vance (VP of Eng)
                          </div>
                        </div>
                        <div
                          className="rf-badge"
                          style={{
                            backgroundColor: "rgba(48, 209, 88, 0.1)",
                            borderColor: "rgba(48, 209, 88, 0.25)",
                            color: "#30d158",
                            fontSize: "0.75rem",
                          }}
                        >
                          96% Fit
                        </div>
                      </div>

                      {/* Pasted Raw JD Content */}
                      <div
                        style={{
                          padding: "1rem",
                          borderRadius: "10px",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          fontSize: "0.8rem",
                          color: "#a1a1aa",
                          lineHeight: 1.6,
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.6rem",
                        }}
                      >
                        <div style={{ fontSize: "0.7rem", color: "#545458", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                          Pasted Job Requirements
                        </div>
                        <p style={{ margin: 0, color: "#d4d4d8" }}>
                          &ldquo;We are hiring a high-velocity engineer to scale our next-gen customer intelligence platform. You will build reactive LLM workflows with Gemini and Next.js App Router, optimize edge caching for low-latency responses, and maintain 99.9% uptime.&rdquo;
                        </p>
                        
                        {/* Extracted Core Requirements */}
                        <div style={{ marginTop: "0.5rem" }}>
                          <div style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.35rem" }}>
                            Extracted JD Requirements:
                          </div>
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            <span className="rf-badge" style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#ffffff" }}>
                              Next.js App Router
                            </span>
                            <span className="rf-badge" style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#ffffff" }}>
                              Gemini API / LLMs
                            </span>
                            <span className="rf-badge" style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#ffffff" }}>
                              Edge Caching
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tone Controls */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#71717a" }}>Selected Tone:</span>
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          {(["confident", "direct", "value"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setDummyTone(t)}
                              style={{
                                padding: "0.25rem 0.6rem",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                border: "1px solid",
                                borderColor: dummyTone === t ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.08)",
                                backgroundColor: dummyTone === t ? "rgba(255, 255, 255, 0.1)" : "transparent",
                                color: dummyTone === t ? "#ffffff" : "#8e8e93",
                                cursor: "pointer",
                                textTransform: "capitalize",
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: AI Generated Email & 1-Click Send */}
                    <div
                      style={{
                        padding: "1.5rem",
                        borderRadius: "18px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backgroundColor: "#0d0d10",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Zap size={16} color="#30d158" />
                          <span style={{ fontWeight: 520, fontSize: "0.95rem", color: "#ffffff" }}>
                            AI Forged Outreach
                          </span>
                        </div>

                        {/* Format Switcher */}
                        <div style={{ display: "flex", gap: "0.25rem", backgroundColor: "rgba(255, 255, 255, 0.04)", padding: "0.2rem", borderRadius: "8px" }}>
                          <button
                            type="button"
                            onClick={() => setDummyChannel("email")}
                            style={{
                              padding: "0.2rem 0.6rem",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              border: "none",
                              backgroundColor: dummyChannel === "email" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                              color: dummyChannel === "email" ? "#ffffff" : "#71717a",
                              cursor: "pointer",
                            }}
                          >
                            Email (Gmail)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDummyChannel("linkedin")}
                            style={{
                              padding: "0.2rem 0.6rem",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              border: "none",
                              backgroundColor: dummyChannel === "linkedin" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                              color: dummyChannel === "linkedin" ? "#ffffff" : "#71717a",
                              cursor: "pointer",
                            }}
                          >
                            LinkedIn DM
                          </button>
                        </div>
                      </div>

                      {dummyChannel === "email" ? (
                        <>
                          {/* Subject Line Pill */}
                          <div
                            style={{
                              padding: "0.75rem 1rem",
                              borderRadius: "10px",
                              backgroundColor: "rgba(255, 255, 255, 0.03)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                          >
                            <div style={{ fontSize: "0.7rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject Line</div>
                            <div style={{ fontWeight: 550, color: "#ffffff", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                              {dummySubject}
                            </div>
                          </div>

                          {/* Email Body */}
                          <div
                            style={{
                              padding: "1rem",
                              borderRadius: "10px",
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              border: "1px solid rgba(255, 255, 255, 0.05)",
                              fontSize: "0.825rem",
                              color: "#d4d4d8",
                              lineHeight: 1.6,
                              flex: 1,
                            }}
                          >
                            Hi Alex,
                            <br /><br />
                            Noticed your team is hiring a Senior Full-Stack Engineer to scale AI workflows on Next.js. At CloudScale, I spearheaded our Gemini-powered search pipeline, cutting response latency by 45% across 2M monthly queries.
                            <br /><br />
                            Given your focus on Core Web Vitals and zero-downtime server deployments, I’d love to share how we solved edge caching for high-throughput routes.
                            <br /><br />
                            Do you have 10 minutes this Thursday?
                            <br /><br />
                            Best,
                            <br />
                            Jane Doe
                          </div>
                        </>
                      ) : (
                        /* LinkedIn DM Mode */
                        <div
                          style={{
                            padding: "1rem",
                            borderRadius: "10px",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            fontSize: "0.825rem",
                            color: "#d4d4d8",
                            lineHeight: 1.6,
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#0a66c2", marginBottom: "0.5rem", fontWeight: 600 }}>
                              LinkedIn InMail Preview (234 / 300 chars)
                            </div>
                            Hi Alex — saw you&apos;re hiring a Senior Full-Stack Engineer for Gemini & Next.js at Linear. At CloudScale, I scaled our Gemini pipeline to 2M monthly queries and cut p99 latency by 45%. Would love to share how we handled edge caching. Got 5 mins?
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#30d158", marginTop: "1rem" }}>
                            ✓ Optimized for 3x higher LinkedIn response rate
                          </div>
                        </div>
                      )}

                      {/* Matched Highlights Bar */}
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", fontSize: "0.7rem" }}>
                        <span style={{ color: "#30d158", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <CheckCircle2 size={12} /> Gemini API matched
                        </span>
                        <span style={{ color: "#30d158", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginLeft: "0.5rem" }}>
                          <CheckCircle2 size={12} /> Edge caching aligned
                        </span>
                      </div>

                      {/* 1-Click Send CTA Bar */}
                      <div
                        style={{
                          paddingTop: "0.75rem",
                          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ fontSize: "0.75rem", color: "#8e8e93" }}>
                          Via: <span style={{ color: "#ffffff" }}>jane.doe@gmail.com</span> (Verified)
                        </div>
                        <button
                          className="rf-button-primary"
                          style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem", borderRadius: "10px" }}
                          onClick={() => {
                            setDummyDispatched(true);
                            setTimeout(() => setDummyDispatched(false), 2200);
                          }}
                        >
                          <Send size={13} />
                          <span>{dummyDispatched ? "Dispatched to Recruiter!" : "1-Click Send via Gmail"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Pipeline & Reply Tracker */}
              {activeTab === "tracker" && (
                <motion.div
                  key="tracker"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: "100%", maxWidth: "800px" }}
                >
                  <div
                    style={{
                      padding: "2rem",
                      borderRadius: "18px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      backgroundColor: "#0d0d10",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 520, fontSize: "1.05rem" }}>Outreach & Reply Tracking</div>
                        <div style={{ fontSize: "0.8rem", color: "#8e8e93", marginTop: "0.15rem" }}>
                          Automatic detection of recruiter replies in your linked Gmail
                        </div>
                      </div>
                      <span className="rf-badge" style={{ backgroundColor: "rgba(48, 209, 88, 0.1)", color: "#30d158" }}>
                        4 Interviews Lined Up
                      </span>
                    </div>

                    {/* Pipeline Mock Rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {[
                        { company: "Vercel", role: "Senior Full Stack", status: "Interview Scheduled", statusColor: "#30d158", time: "Replied 2h ago" },
                        { company: "Stripe", role: "Staff Platform Engineer", status: "Positive Reply", statusColor: "#38bdf8", time: "Replied yesterday" },
                        { company: "Linear", role: "Product Engineer", status: "Dispatched", statusColor: "#8e8e93", time: "Sent 2 days ago" },
                        { company: "Supabase", role: "AI Integrations Lead", status: "Under Review", statusColor: "#fbbf24", time: "Sent 3 days ago" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "0.75rem 1rem",
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 550, color: "#ffffff" }}>{item.company}</span>
                            <span style={{ color: "#71717a", marginLeft: "0.5rem" }}>— {item.role}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "#71717a" }}>{item.time}</span>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.2rem 0.55rem",
                                borderRadius: "6px",
                                backgroundColor: "rgba(255, 255, 255, 0.04)",
                                color: item.statusColor,
                                border: "1px solid rgba(255, 255, 255, 0.06)",
                              }}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Upcoming Features Section (Bento Grid) */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "4rem 1.5rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <div className="rf-badge" style={{ marginBottom: "0.75rem" }}>
            <span>Core Architecture</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", color: "#ffffff" }}>
            Everything you need to bypass applicant tracking black holes.
          </h2>
          <p style={{ maxWidth: "600px", margin: "0.75rem auto 0", fontSize: "0.95rem" }}>
            Engineered for high-performing candidates who want to reach decision-makers directly and authentically.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Card 1: Dual Profile Construction */}
          <div className="rf-card">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                marginBottom: "1.25rem",
              }}
            >
              <FileText size={18} />
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Dual Profile Builder</h3>
            <p style={{ fontSize: "0.875rem", color: "#8e8e93" }}>
              Upload your resume for instant AI parsing, or build a verified portfolio manually with GitHub repos, live production links, and quantifiable achievements.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="rf-badge">PDF Extraction</span>
              <span className="rf-badge">Manual Editor</span>
              <span className="rf-badge">Proof of Work</span>
            </div>
          </div>

          {/* Card 2: Native Gmail OAuth */}
          <div className="rf-card">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(234, 67, 53, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ea4335",
                marginBottom: "1.25rem",
              }}
            >
              <Mail size={18} />
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Direct Gmail Linking</h3>
            <p style={{ fontSize: "0.875rem", color: "#8e8e93" }}>
              Securely connect your Google account. Cold emails are sent directly through your personal Gmail inbox, landing straight in the recipient’s Primary tab.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="rf-badge">Google OAuth 2.0</span>
              <span className="rf-badge">Zero Third-Party Proxies</span>
              <span className="rf-badge">Primary Tab Inbox</span>
            </div>
          </div>

          {/* Card 3: Deep JD Alignment */}
          <div className="rf-card">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                marginBottom: "1.25rem",
              }}
            >
              <Cpu size={18} />
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Gemini Intelligence Engine</h3>
            <p style={{ fontSize: "0.875rem", color: "#8e8e93" }}>
              Pasting a JD triggers deep semantic analysis. ColdForge finds the exact intersections between the company&apos;s challenges and your proven skill set.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="rf-badge">Gemini 1.5 Flash</span>
              <span className="rf-badge">Context Mapping</span>
              <span className="rf-badge">Anti-Generic</span>
            </div>
          </div>

          {/* Card 4: 1-Click Send CTA */}
          <div className="rf-card">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                marginBottom: "1.25rem",
              }}
            >
              <Send size={18} />
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>1-Click Native Send</h3>
            <p style={{ fontSize: "0.875rem", color: "#8e8e93" }}>
              Eliminate manual copy-pasting. Review your generated outreach, tweak any line if needed, and send instantly without opening another browser tab.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="rf-badge">1-Click Dispatch</span>
              <span className="rf-badge">Subject Swap</span>
              <span className="rf-badge">Instant History</span>
            </div>
          </div>

          {/* Card 5: LinkedIn InMail & DM Mode */}
          <div className="rf-card">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(10, 102, 194, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0a66c2",
                marginBottom: "1.25rem",
              }}
            >
              <LinkedInIcon size={18} />
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>LinkedIn InMail & DM Format</h3>
            <p style={{ fontSize: "0.875rem", color: "#8e8e93" }}>
              Toggles between formal email and compact, punchy direct messages tailored for reaching founders and recruiters on LinkedIn within character limits.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="rf-badge">&lt; 300 Characters</span>
              <span className="rf-badge">High Open Rate</span>
              <span className="rf-badge">Casual & Punchy</span>
            </div>
          </div>

          {/* Card 6: Reply & Thread Pipeline */}
          <div className="rf-card">
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "rgba(48, 209, 88, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#30d158",
                marginBottom: "1.25rem",
              }}
            >
              <TrendingUp size={18} />
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Automated Reply Tracker</h3>
            <p style={{ fontSize: "0.875rem", color: "#8e8e93" }}>
              Follow every sent outreach from dispatch to interview invitation. ColdForge monitors response threads in your Gmail so no opportunity slips away.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="rf-badge">Auto Thread Detection</span>
              <span className="rf-badge">Follow-Up Reminders</span>
              <span className="rf-badge">Offer Pipeline</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Step-by-Step Walkthrough) */}
      <section
        id="workflow"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "4rem 1.5rem 6rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <div className="rf-badge" style={{ marginBottom: "0.75rem" }}>
            <span>Simple 4-Step Process</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", color: "#ffffff" }}>
            From target job listing to sent outreach in under 60 seconds.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              step: "01",
              title: "Create Your Profile",
              desc: "Upload your resume PDF or fill in your core accomplishments and projects manually.",
            },
            {
              step: "02",
              title: "Connect Your Gmail",
              desc: "Link your personal Google account with one click using secure OAuth permissions.",
            },
            {
              step: "03",
              title: "Drop Target JD",
              desc: "Paste the job description from any board. Select your tone: Confident, Direct, or Value-First.",
            },
            {
              step: "04",
              title: "1-Click Direct Send",
              desc: "Review the tailored pitch and hit Send. It lands in the recruiter's primary inbox immediately.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "1.75rem",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                backgroundColor: "#08080a",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#71717a", letterSpacing: "0.05em" }}>
                STEP {item.step}
              </div>
              <h3 style={{ fontSize: "1.1rem", color: "#ffffff" }}>{item.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#8e8e93", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Privacy Banner */}
      <section
        id="security"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem 5rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "2.5rem 2rem",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#0d0d10",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div>
            <div className="rf-badge" style={{ marginBottom: "0.75rem", borderColor: "rgba(48, 209, 88, 0.3)", color: "#30d158" }}>
              <ShieldCheck size={14} /> Security First
            </div>
            <h2 style={{ fontSize: "1.75rem", color: "#ffffff", lineHeight: 1.25 }}>
              Your email credentials never touch our servers.
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#8e8e93", marginTop: "0.75rem" }}>
              ColdForge uses Google OAuth tokenized authentication with restricted compose scopes. We never read your private inbox messages or store email passwords.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "#d4d4d8" }}>
              <CheckCircle2 size={16} color="#30d158" />
              <span>Official Google Cloud OAuth Verified Integration</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "#d4d4d8" }}>
              <CheckCircle2 size={16} color="#30d158" />
              <span>Revoke access anytime with 1 click from your Google Security dashboard</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "#30d158" }}>
              <CheckCircle2 size={16} color="#30d158" />
              <span>Zero mass-blasting — 100% intentional, human-reviewed outreach</span>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section
        id="faq"
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "2rem 1.5rem 6rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="rf-badge" style={{ marginBottom: "0.75rem" }}>
            <span>Got Questions?</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)", color: "#ffffff" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              q: "How does ColdForge AI connect to my Gmail?",
              a: "We integrate directly using Google OAuth with the send mail scope. This lets you dispatch tailored emails from your genuine address without needing to copy and paste or launch external mail clients.",
            },
            {
              q: "Can I build my profile manually without a resume?",
              a: "Yes! While you can upload a PDF resume for automated parsing, ColdForge includes a full manual builder where you can list specific GitHub repositories, technical achievements, metrics, and dream roles.",
            },
            {
              q: "Why do cold emails sent through ColdForge have higher reply rates?",
              a: "Because they originate from your authenticated personal Gmail account rather than marketing relays (like Mailgun or SendGrid), they bypass spam filters and land in the Primary inbox. Furthermore, Gemini tailors each pitch specifically to the JD’s pain points.",
            },
            {
              q: "Can I edit the generated email before sending?",
              a: "Always. Every email generated by ColdForge can be reviewed, edited, or adjusted in tone before you click Send.",
            },
            {
              q: "When is ColdForge AI launching?",
              a: "We are currently onboarding early adopters in batches. Enter your email on this page to secure your spot on the priority access list.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                padding: "1.5rem",
                borderRadius: "14px",
                backgroundColor: "#0a0a0c",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <h4 style={{ fontSize: "0.95rem", color: "#ffffff", marginBottom: "0.5rem" }}>
                {faq.q}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#8e8e93", lineHeight: 1.6, margin: 0 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          backgroundColor: "#050507",
          padding: "5rem 1.5rem",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: "#ffffff", letterSpacing: "-0.03em" }}>
            Ready to reclaim your job search?
          </h2>
          <p style={{ fontSize: "1rem", color: "#8e8e93", marginTop: "0.75rem", lineHeight: 1.6 }}>
            Join the waitlist to be among the first engineers, designers, and tech professionals sending high-converting cold outreach directly through their Gmail.
          </p>

          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            {/*
            {!waitlistSubmitted ? (
              <form onSubmit={handleWaitlistSubmit} style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="rf-input"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="rf-button-primary">
                  <span>Join Waitlist</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <div
                style={{
                  padding: "0.85rem 1.25rem",
                  borderRadius: "14px",
                  backgroundColor: "rgba(48, 209, 88, 0.08)",
                  border: "1px solid rgba(48, 209, 88, 0.25)",
                  color: "#30d158",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <CheckCircle2 size={18} />
                <span>You&apos;re in! We will reach out as soon as your invite is ready.</span>
              </div>
            )}
            */}

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.65rem 1.5rem",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 520,
              }}
            >
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#30d158", boxShadow: "0 0 8px #30d158" }} />
              <span>Coming Soon</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#71717a" }}>
              Public launch updates will be posted here.
            </p>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "2rem 1.5rem",
          backgroundColor: "#000000",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.8rem",
            color: "#545458",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#ffffff", fontWeight: 550 }}>ColdForge AI</span>
            <span>• © {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ color: "#71717a" }}>Built with Next.js & Gemini API</span>
            <span style={{ color: "#8e8e93" }}>Coming Soon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
