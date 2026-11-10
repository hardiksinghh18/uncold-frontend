"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMessage(error);
        } else {
          onClose();
        }
      } else {
        const { error, needsEmailConfirmation } = await signUpWithEmail(email, password);
        if (error) {
          setErrorMessage(error);
        } else if (needsEmailConfirmation) {
          setSuccessMessage(
            "Account created! Please check your email to verify your address before signing in."
          );
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || "Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#0d0d10",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "18px",
              padding: "2rem 1.75rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              zIndex: 10,
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "transparent",
                border: "none",
                color: "#8e8e93",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8e8e93")}
            >
              <X size={18} />
            </button>

            {/* Header / Logo */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <img
                src="/uncold_logo.webp"
                alt="Uncold"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  display: "inline-block",
                  marginBottom: "0.75rem",
                }}
              />
              <h2 style={{ fontSize: "1.35rem", fontWeight: 600, color: "#ffffff", letterSpacing: "-0.02em" }}>
                {mode === "signin" ? "Welcome back to Uncold" : "Create your Uncold account"}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#8e8e93", marginTop: "0.35rem" }}>
                {mode === "signin"
                  ? "Sign in to manage and dispatch your cold outreach"
                  : "Start converting job descriptions into tailored outreach"}
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                padding: "3px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                marginBottom: "1.25rem",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: mode === "signin" ? "#1c1c22" : "transparent",
                  color: mode === "signin" ? "#ffffff" : "#8e8e93",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: mode === "signup" ? "#1c1c22" : "transparent",
                  color: mode === "signup" ? "#ffffff" : "#8e8e93",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isGoogleLoading || isSubmitting}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "0.7rem 1rem",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontSize: "0.875rem",
                fontWeight: 550,
                border: "none",
                cursor: isGoogleLoading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {isGoogleLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                margin: "1.25rem 0",
              }}
            >
              <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.08)" }} />
              <span style={{ fontSize: "0.75rem", color: "#545458", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                or with email
              </span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.08)" }} />
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 69, 58, 0.1)",
                  border: "1px solid rgba(255, 69, 58, 0.25)",
                  color: "#ff453a",
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  backgroundColor: "rgba(48, 209, 88, 0.1)",
                  border: "1px solid rgba(48, 209, 88, 0.25)",
                  color: "#30d158",
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                  Email Address
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "9px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Mail size={15} color="#71717a" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                  Password
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "9px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Lock size={15} color="#71717a" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.7rem",
                  borderRadius: "9px",
                  backgroundColor: "rgba(255, 255, 255, 0.09)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 550,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.color = "#000000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.09)";
                  e.currentTarget.style.color = "#ffffff";
                }}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Footer switcher */}
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#71717a", marginTop: "1.25rem" }}>
              {mode === "signin" ? "Don't have an account yet? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
