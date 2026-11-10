"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthSplitLayoutProps {
  mode: "signin" | "signup";
}

export function AuthSplitLayout({ mode: initialMode }: AuthSplitLayoutProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  // If user is already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

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
          router.push("/dashboard");
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
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
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
      setErrorMessage(err?.message || "Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const toggleMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex bg-black text-white">
      {/* 
        LEFT SIDE: Product Value & Descriptive Showcase 
        - Hidden on mobile/tablet (hidden lg:flex) so mobile users get 100% focused form
        - 50% split on desktop with glowing gradients and social proof
      */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#08090d] border-r border-white/10 p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        {/* Ambient background accents */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Brand header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img
              src="/uncold_logo.webp"
              alt="Uncold"
              className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-white">
                Uncold
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 border border-white/10 font-medium">
                AI Outreach
              </span>
            </div>
          </Link>
        </div>

        {/* Descriptive Body & Social Proof */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          {/* Avatar stack social proof */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="flex items-center -space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-[#08090d] flex items-center justify-center text-xs font-semibold text-sky-400">
                JD
              </div>
              <div className="w-9 h-9 rounded-full bg-zinc-700 border-2 border-[#08090d] flex items-center justify-center text-xs font-semibold text-purple-400">
                SK
              </div>
              <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-[#08090d] flex items-center justify-center text-xs font-semibold text-emerald-400">
                AL
              </div>
              <div className="w-9 h-9 rounded-full bg-zinc-700 border-2 border-[#08090d] flex items-center justify-center text-xs font-semibold text-amber-400">
                MR
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className="text-white font-semibold">4.9 / 5 rating</span>
                <span className="text-amber-400">★★★★★</span>
              </div>
              <p className="text-xs text-zinc-400">from 2,500+ job seekers & founders</p>
            </div>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
            <span className="text-sky-400">10x your replies</span> with hyper-tailored cold outreach
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed mb-8">
            Turn hours of manual company research, resume tailoring, and drafting into instant, verified high-conversion outreach emails.
          </p>

          {/* Feature Highlights Grid */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">
                  Deep Profile & Resume Synergy
                </h4>
                <p className="text-xs text-zinc-400 leading-normal">
                  Matches your real experience with company mission & hiring details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <TrendingUp size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">
                  Verified Recipient Discovery
                </h4>
                <p className="text-xs text-zinc-400 leading-normal">
                  Find and verify primary decision makers at Google, Meta, YC startups, and scale-ups.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Zap size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">
                  Direct 1-Click Send via Gmail
                </h4>
                <p className="text-xs text-zinc-400 leading-normal">
                  Direct Gmail connection lets you review and send personalized emails without leaving.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Trust Badges */}
        <div className="relative z-10 pt-6 border-t border-white/[0.08]">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            Securing interviews & offers at leading companies
          </p>
          <div className="flex items-center gap-6 flex-wrap opacity-60">
            <span className="text-sm font-semibold tracking-tight text-zinc-300">Google</span>
            <span className="text-sm font-semibold tracking-tight text-zinc-300">Microsoft</span>
            <span className="text-sm font-semibold tracking-tight text-zinc-300">Stripe</span>
            <span className="text-sm font-semibold tracking-tight text-zinc-300">Linear</span>
            <span className="text-sm font-semibold tracking-tight text-zinc-300">OpenAI</span>
          </div>
        </div>
      </div>

      {/* 
        RIGHT SIDE: Form Pane 
        - 100% width on mobile/tablet (w-full lg:w-1/2)
        - Pure Tailwind layout with centered card
      */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-black">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between w-full mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors py-1"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <span className="text-zinc-500">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
            </span>
            <Link
              href={mode === "signin" ? "/sign-up" : "/sign-in"}
              className="text-white font-medium hover:underline underline-offset-4 cursor-pointer py-1"
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </Link>
          </div>
        </div>

        {/* Center Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4 sm:py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              {mode === "signin" ? "Welcome back" : "Get started with Uncold"}
            </h1>
            <p className="text-sm text-zinc-400">
              {mode === "signin"
                ? "Enter your credentials to access your campaigns & AI generators."
                : "Create your free account and launch high-impact cold emails today."}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm mb-6"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm mb-6"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4" suppressHydrationWarning>
            {/* Email Field */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none flex items-center">
                  <Mail size={16} />
                </span>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  suppressHydrationWarning
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900/60 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all box-border"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="text-xs font-medium text-zinc-300"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      alert("Password reset instructions will be sent to your registered email if configured.");
                    }}
                    suppressHydrationWarning
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-zinc-500 pointer-events-none flex items-center">
                  <Lock size={16} />
                </span>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  required
                  suppressHydrationWarning
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900/60 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all box-border"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              suppressHydrationWarning
              className="w-full mt-2 py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  {mode === "signin" ? "Continue with email" : "Create your account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">
              Or
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isGoogleLoading || isSubmitting}
            suppressHydrationWarning
            className="w-full py-3 px-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 border border-white/10 hover:border-white/20 text-white font-medium text-sm flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Connecting with Google...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
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
                Continue with Google
              </>
            )}
          </button>
        </div>

        {/* Legal Terms Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 leading-relaxed">
            By continuing you are agreeing to Uncold&apos;s{" "}
            <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-2">
              Terms of Use
            </a>{" "}
            &amp;{" "}
            <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-2">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
