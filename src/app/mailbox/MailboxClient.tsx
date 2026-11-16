"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { JobMetadata, JobMetadataPanel } from "@/components/JobMetadataPanel";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  Mail,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  RefreshCw,
  LogOut,
  Building2,
  Briefcase,
  UserCheck,
  Code2,
  Wand2,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  MessageSquare
} from "lucide-react";

interface MailboxClientProps {
  user: SupabaseUser;
}

interface ParsedJdData {
  extractedInfo?: {
    recipientEmail?: string;
    recipientName?: string;
    companyName?: string;
    jobTitle?: string;
    requiredSkills?: string[];
    keyResponsibilities?: string[];
  };
  coldEmail?: {
    subject?: string;
    body?: string;
    hook?: string;
    callToAction?: string;
  };
  subject?: string;
  body?: string;
  keyMatches?: string[];
  alternateSubjects?: string[];
  linkedInMessage?: string;
}

export function MailboxClient({ user }: MailboxClientProps) {
  const { signOut } = useAuth();

  // JD & AI Generation State
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTone, setSelectedTone] = useState("confident");
  const [outreachType, setOutreachType] = useState<"email" | "dm" | "wellfound">("email");
  const [isGenerating, setIsGenerating] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedJdData | null>(null);
  const [jobMetadata, setJobMetadata] = useState<JobMetadata | null>(null);

  // Cached profile from DB (Optimization Step 2: bypass DB roundtrip on generation)
  const [cachedProfile, setCachedProfile] = useState<any>(null);

  // Email Composer State (editable by user)
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasLoggedCopy, setHasLoggedCopy] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<{
    loaded: boolean;
    connected: boolean;
    connectedGmail: string | null;
  }>({ loaded: false, connected: false, connectedGmail: null });

  const userMetadata = user.user_metadata || {};
  const fullName = userMetadata.full_name || userMetadata.name || user.email?.split("@")[0] || "User";
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Live word and character counts
  const bodyWords = body.trim() ? body.trim().split(/\s+/).length : 0;
  const bodyChars = body.length;

  // Copy to clipboard helper with visual confirmation & automatic history logging for DM/Wellfound
  const handleCopy = async () => {
    if (!body) return;
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      if (outreachType !== "email" && !hasLoggedCopy && user.email) {
        setHasLoggedCopy(true);
        authFetch(`${backendUrl}/api/outreach/log-copy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            channel: outreachType,
            companyName: companyName.trim() || undefined,
            recipientName: recipientName.trim() || undefined,
            jobTitle: jobTitle.trim() || undefined,
            jobMetadata: jobMetadata || undefined,
            body,
          }),
        })
          .then((r) => {
            if (r.ok) {
              toast.success(
                `Copied ${outreachType === "dm" ? "DM" : "Wellfound Note"} & logged to History!`
              );
            } else {
              toast.success("Copied message to clipboard!");
            }
          })
          .catch(() => {
            toast.success("Copied message to clipboard!");
          });
      } else {
        toast.success("Copied message to clipboard!");
      }
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
      toast.error("Failed to copy message to clipboard.");
    }
  };

  // Helper to remove any leftover bracketed placeholders
  const cleanBracketedPlaceholders = (text: string, profile?: any): string => {
    if (!text) return "";
    const pLinks = profile?.portfolio_links || {};
    const portfolio = (pLinks.portfolio || profile?.portfolio || "").trim();
    const github = (pLinks.github || profile?.github || "").trim();
    const linkedin = (pLinks.linkedin || profile?.linkedin || "").trim();
    const resume = (pLinks.resume_url || profile?.resume_url || "").trim();

    let cleaned = text.replace(
      /\[\s*(?:Portfolio\s*\/?\s*GitHub(?:\s*Link)?|Portfolio(?:\s*Link)?|GitHub(?:\s*Link)?|LinkedIn(?:\s*Link)?|Resume(?:\s*Link)?|Link|URL|Insert\s*Link|Link to Portfolio|Link to GitHub|Link to Resume)\s*\]/gi,
      (match) => {
        const lower = match.toLowerCase();
        if (lower.includes("github") && github) return github;
        if (lower.includes("portfolio") && portfolio) return portfolio;
        if (lower.includes("resume") && resume) return resume;
        if (lower.includes("linkedin") && linkedin) return linkedin;
        if (portfolio) return portfolio;
        if (github) return github;
        if (resume) return resume;
        return "";
      }
    );

    cleaned = cleaned.replace(/\[(?:Link|URL|Portfolio|GitHub|Resume)\]/gi, "");
    cleaned = cleaned.replace(/(?:Portfolio\s*&\s*Resume|Portfolio|GitHub|LinkedIn|Resume|Links?)\s*:\s*(?:\r?\n|$)/gi, "");
    cleaned = cleaned.replace(/^[ \t]*[\*\-][ \t]+/gm, "• ").replace(/\*\*(.*?)\*\*/g, "$1");
    return cleaned.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  };

  // Pre-load candidate profile & Gmail connection status once on mount
  useEffect(() => {
    if (!user.email) return;
    authFetch(`${backendUrl}/api/profile?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.profile) setCachedProfile(d.profile);
      })
      .catch((err) => console.warn("Could not pre-cache profile:", err));

    authFetch(`${backendUrl}/api/gmail/status?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((d) => {
        setGmailStatus({
          loaded: true,
          connected: Boolean(d.connected),
          connectedGmail: d.connectedGmail || null,
        });
      })
      .catch(() => setGmailStatus((prev) => ({ ...prev, loaded: true })));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("gmail_connected") === "1") {
        const linked = params.get("gmail");
        toast.success(
          linked ? `Gmail connected (${linked})! Ready to send.` : "Gmail connected successfully!"
        );
        window.history.replaceState({}, "", window.location.pathname);
      } else if (params.get("gmail_error")) {
        toast.error(decodeURIComponent(params.get("gmail_error") || "Failed to connect Gmail."));
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [backendUrl, user.email]);

  const handleConnectGmail = async () => {
    if (!user.email) return;
    try {
      const res = await authFetch(`${backendUrl}/api/gmail/connect?returnTo=/mailbox&format=json`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error || "Failed to start Gmail connection.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Failed to start Gmail connection.");
    }
  };

  // AI Parse JD and Generate Cold Email with Live Real-Time Token Streaming
  const handleGenerateOutreach = async () => {
    if (!jobDescription || jobDescription.trim().length < 15) {
      toast.error("Please paste a complete job description (at least 15 characters).");
      return;
    }

    setIsGenerating(true);
    setHasLoggedCopy(false);
    setBody(""); // Clear composer so user sees typewriter stream
    const toastId = toast.loading("Connecting to live AI stream...");

    try {
      // Step 1 & 2: Call real-time streaming endpoint passing cached profile directly
      const res = await authFetch(`${backendUrl}/api/generate-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          tone: selectedTone,
          profile: cachedProfile,
          email: user.email,
          outreachType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Streaming failed with status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Streaming not supported by browser reader.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedBody = "";
      let foundEmail = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventStr of events) {
          const trimmed = eventStr.trim();
          if (!trimmed.startsWith("data:")) continue;

          try {
            const data = JSON.parse(trimmed.slice(5).trim());

            if (data.type === "meta") {
              if (data.recipientEmail) {
                foundEmail = data.recipientEmail;
                setRecipientEmail(data.recipientEmail);
              }
              if (data.subject) {
                setSubject(data.subject);
              }
              if (data.companyName) {
                setCompanyName(data.companyName);
              }
              if (data.jobTitle) {
                setJobTitle(data.jobTitle);
              }
              if (data.recipientName) {
                setRecipientName(data.recipientName);
              }
              if (data.jobMetadata) {
                setJobMetadata(data.jobMetadata);
              }
              toast.loading("Writing your message...", { id: toastId });
            } else if (data.type === "chunk" && data.text) {
              accumulatedBody += data.text;
              setBody(accumulatedBody);
            } else if (data.type === "done") {
              const cleaned = cleanBracketedPlaceholders(accumulatedBody, cachedProfile);
              setBody(cleaned);
              toast.success(
                foundEmail
                  ? `Message ready! Recruiter email (${foundEmail}) found.`
                  : "Message ready! Review and send or copy.",
                { id: toastId }
              );
            } else if (data.type === "error") {
              throw new Error(data.error || "Streaming error encountered.");
            }
          } catch (jsonErr) {
            console.warn("Stream chunk parse notice:", jsonErr);
          }
        }
      }
    } catch (err: any) {
      console.warn("Streaming attempt encountered error, falling back to unary:", err);
      // Seamless Fallback to standard unary generation if streaming is blocked
      try {
        const fallbackRes = await authFetch(`${backendUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDescription,
            tone: selectedTone,
            profile: cachedProfile,
            email: user.email,
            outreachType,
          }),
        });
        const json = await fallbackRes.json();
        if (!fallbackRes.ok) throw new Error(json.error || "Fallback generation failed.");

        const data: ParsedJdData = json.data;
        setParsedData(data);
        if (data.extractedInfo) {
          setJobMetadata({
            companyName: data.extractedInfo.companyName,
            jobTitle: data.extractedInfo.jobTitle,
            requiredSkills: data.extractedInfo.requiredSkills,
          });
        }
        const emailFound = data.extractedInfo?.recipientEmail?.trim() || "";
        setRecipientEmail(emailFound);
        if (data.extractedInfo?.companyName) setCompanyName(data.extractedInfo.companyName);
        if (data.extractedInfo?.recipientName) setRecipientName(data.extractedInfo.recipientName);
        if (data.extractedInfo?.jobTitle) setJobTitle(data.extractedInfo.jobTitle);
        setSubject(data.coldEmail?.subject || data.subject || "Regarding opportunity at your company");
        const rawBody = data.coldEmail?.body || data.body || "";
        setBody(cleanBracketedPlaceholders(rawBody, cachedProfile));
        toast.success("Message ready!", { id: toastId });
      } catch (fallbackErr: any) {
        toast.error(fallbackErr.message || "Failed to generate outreach.", { id: toastId });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Dispatch Email via Gmail OAuth
  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (gmailStatus.loaded && !gmailStatus.connected) {
      toast.error("Please connect your Gmail account first to send emails.");
      return;
    }
    if (!recipientEmail || !recipientEmail.includes("@")) {
      toast.error("Please provide a valid recipient email address.");
      return;
    }

    setIsSending(true);
    const sendToastId = toast.loading("Dispatching email via Gmail API...");

    try {
      const res = await authFetch(`${backendUrl}/api/gmail/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          to: recipientEmail,
          subject,
          body,
          senderName: fullName,
          companyName: companyName.trim() || undefined,
          recipientName: recipientName.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
          jobMetadata: jobMetadata || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email.");

      toast.success(`Outreach dispatched from your Gmail!`, { id: sendToastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch email.", { id: sendToastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* Universal Application Navigation Header */}
      <AppHeader user={user} />

      {/* Main Dual-Column Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* Banner Section with Outreach Format Selector */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c0d12] border border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                AI Assistant
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                {outreachType === "email" ? "Open & Reply Tracking" : "One-Click Copy"}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {outreachType === "email"
                ? "JD Parser & Tailored Cold Email Generator"
                : outreachType === "dm"
                ? "LinkedIn & Twitter DM Outreach Generator"
                : "Wellfound & AngelList Short Note Generator"}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {outreachType === "email"
                ? "Paste any job description. AI extracts required skills, recipient emails, and role specs, then crafts an authentic cold email."
                : outreachType === "dm"
                ? "Generates an ultra-short (<70 words) casual, high-converting outreach message ready to copy & paste into InMail or Twitter DMs."
                : "Writes a short, clear application note (<95 words) highlighting your skills and past work for startup applications."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* 3-Way Outreach Channel Selector */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setOutreachType("email")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  outreachType === "email"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Mail size={13} />
                <span>Cold Email</span>
              </button>
              <button
                type="button"
                onClick={() => setOutreachType("dm")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  outreachType === "dm"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <MessageSquare size={13} />
                <span>LinkedIn / Twitter DM</span>
              </button>
              <button
                type="button"
                onClick={() => setOutreachType("wellfound")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  outreachType === "wellfound"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText size={13} />
                <span>Wellfound Note</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Job Description Input & Extracted Insights (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-[#0c0d12] border border-white/[0.08] flex flex-col shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <FileText size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Target Job Description</h3>
                    <span className="text-[10px] text-zinc-500">Paste raw JD, recruiter post, or careers text</span>
                  </div>
                </div>

                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="bg-white/[0.04] border border-white/10 text-zinc-300 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-white/30 cursor-pointer"
                >
                  <option value="confident" className="bg-[#0c0d12]">Tone: Confident</option>
                  <option value="direct & punchy" className="bg-[#0c0d12]">Tone: Direct & Punchy</option>
                  <option value="value-first" className="bg-[#0c0d12]">Tone: Value-First</option>
                  <option value="enthusiastic" className="bg-[#0c0d12]">Tone: Enthusiastic</option>
                </select>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={11}
                placeholder={`Paste JD content here... Example:
We are hiring a Senior Frontend Engineer at Acme Inc. (careers@acme.com / alex@acme.com).
Requirements:
- 3+ years experience with React, Next.js, TypeScript
- Experience building scalable web applications and state management
- Strong knowledge of REST APIs and UI performance optimization`}
                className="w-full px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/50 resize-none font-sans leading-relaxed"
              />

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  {jobDescription.length} characters entered
                </span>

                <button
                  type="button"
                  onClick={handleGenerateOutreach}
                  disabled={isGenerating || jobDescription.trim().length < 15}
                  className="py-2 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Writing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={13} />
                      <span>
                        {outreachType === "email"
                          ? "Parse JD & Generate Email"
                          : outreachType === "dm"
                          ? "Generate LinkedIn / Twitter DM"
                          : "Generate Wellfound Short Note"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Extracted JD Metadata Card */}
            {(jobMetadata || parsedData?.extractedInfo) && (
              <div className="p-5 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-3.5 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Extracted Email</span>
                    <span className="text-zinc-200 font-mono text-[11px]">
                      {recipientEmail || parsedData?.extractedInfo?.recipientEmail || "None found in text"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Contact / Lead</span>
                    <span className="text-zinc-200 font-medium">
                      {recipientName || parsedData?.extractedInfo?.recipientName || "Hiring Team"}
                    </span>
                  </div>
                </div>

                <JobMetadataPanel
                  metadata={
                    jobMetadata || {
                      companyName: parsedData?.extractedInfo?.companyName,
                      jobTitle: parsedData?.extractedInfo?.jobTitle,
                      requiredSkills: parsedData?.extractedInfo?.requiredSkills,
                    }
                  }
                  companyName={companyName}
                  jobTitle={jobTitle}
                />
              </div>
            )}
          </div>

          {/* Right Column: Editable Cold Email Composer & Dispatcher (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] shadow-lg flex flex-col">
              <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    outreachType === "email"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                  }`}>
                    {outreachType === "email" ? (
                      <Edit3 size={15} />
                    ) : outreachType === "dm" ? (
                      <MessageSquare size={15} />
                    ) : (
                      <FileText size={15} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {outreachType === "email"
                        ? "Review & Edit Cold Email"
                        : outreachType === "dm"
                        ? "Review & Copy Direct Message"
                        : "Review & Copy Wellfound Note"}
                    </h3>
                    <span className="text-[10px] text-zinc-500">
                      {outreachType === "email"
                        ? "Edit any detail before sending from your Gmail"
                        : "Ready to copy and paste directly into chat or application"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Live Word & Character Counter */}
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-zinc-400 font-mono">
                    {bodyWords} words · {bodyChars} chars
                  </span>

                  {/* Quick Copy Button in Header */}
                  {body && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                        copied
                          ? "bg-emerald-500 text-white"
                          : "bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/10"
                      }`}
                      title="Copy to clipboard"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSend} className="space-y-4 flex flex-col">
                <div className="space-y-4">
                  {/* Gmail Connection Nudge inside Email Composer */}
                  {outreachType === "email" && gmailStatus.loaded && !gmailStatus.connected && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-xs text-amber-200">
                        <AlertCircle size={15} className="text-amber-400 shrink-0" />
                        <span>
                          Connect your Gmail account to dispatch emails directly from your inbox.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleConnectGmail}
                        className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Mail size={12} className="text-red-500" />
                        <span>Connect Gmail</span>
                      </button>
                    </div>
                  )}

                  {/* For Cold Email: Show Recipient and Subject Line */}
                  {outreachType === "email" ? (
                    <>
                      {/* Recipient To */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-zinc-300">
                            Recipient Email Address: <span className="text-red-400">*</span>
                          </label>
                          {!recipientEmail && (
                            <span className="text-[10px] text-amber-400/80 font-mono">
                              (No email found in JD — enter manually)
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          required
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="e.g. recruiter@company.com or hiring.manager@company.com"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                        />
                      </div>

                      {/* Subject Line */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Subject Line: <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Subject will be generated by AI..."
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                        />

                        {parsedData?.alternateSubjects && parsedData.alternateSubjects.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-zinc-500 font-mono">AI Suggestions:</span>
                            {parsedData.alternateSubjects.map((alt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSubject(alt)}
                                className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                              >
                                {alt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* For DM / Wellfound: Recipient Email & Subject are not needed */
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {outreachType === "dm" ? (
                            <MessageSquare size={14} className="text-sky-400 shrink-0" />
                          ) : (
                            <FileText size={14} className="text-sky-400 shrink-0" />
                          )}
                          <span>
                            {outreachType === "dm"
                              ? "Direct Message Mode: Copying automatically logs this outreach to History."
                              : "Wellfound Note Mode: Copying automatically logs this application to History."}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 shrink-0">
                          {outreachType === "dm" ? "Target <70 words" : "Target <95 words"}
                        </span>
                      </div>

                      {/* Optional Target Company & Contact Tagging for History Grouping */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                            Target Company (for History tracking)
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Linear, Vercel, Acme..."
                            className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                            Recruiter / Contact Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="e.g. Alex Rivera, Hiring Team..."
                            className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-zinc-300">
                        {outreachType === "email"
                          ? "Cold Email Message:"
                          : outreachType === "dm"
                          ? "Direct Message Text (LinkedIn / Twitter):"
                          : "Application Cover Note (Wellfound / AngelList):"} <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[10px] text-zinc-500">
                        {outreachType === "email"
                          ? "Includes resume hooks & candidate links"
                          : outreachType === "dm"
                          ? "Casual & punchy with proof point"
                          : "Mission hook + 2 proof points"}
                      </span>
                    </div>
                    <textarea
                      rows={outreachType === "email" ? 14 : 12}
                      required
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={
                        outreachType === "email"
                          ? "Click 'Parse JD & Generate Email' on the left to write a tailored cold email..."
                          : outreachType === "dm"
                          ? "Click 'Generate LinkedIn / Twitter DM' on the left to write a short direct message..."
                          : "Click 'Generate Wellfound Short Note' on the left to write a short startup application note..."
                      }
                      className="w-full px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none font-sans leading-relaxed min-h-[260px]"
                    />
                  </div>
                </div>

                {/* Form Footer & Action Buttons */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3 mt-4">
                  <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        outreachType === "email" && gmailStatus.loaded && !gmailStatus.connected
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                    />
                    <span>
                      {outreachType === "email"
                        ? gmailStatus.loaded && !gmailStatus.connected
                          ? "Connect your Gmail account above to enable direct sending"
                          : `Sends directly from ${gmailStatus.connectedGmail || user.email} via your connected Gmail`
                        : "One-click copy directly to your clipboard for quick outreach"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* In DM / Wellfound Mode: Primary action is Copy Message */}
                    {outreachType !== "email" ? (
                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!body}
                        className={`py-2.5 px-6 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
                          copied
                            ? "bg-emerald-500 text-white"
                            : "bg-white text-black hover:bg-zinc-200"
                        }`}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? "Copied to Clipboard!" : "Copy Message to Clipboard"}</span>
                      </button>
                    ) : (
                      /* In Email Mode: Secondary Copy Button + Primary Dispatch Button */
                      <>
                        <button
                          type="button"
                          onClick={handleCopy}
                          disabled={!body}
                          className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                            copied
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-300 hover:text-white"
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {copied ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copied ? "Copied!" : "Copy Text"}</span>
                        </button>

                        <button
                          type="submit"
                          disabled={!gmailStatus.connected || isSending || !body || !subject}
                          title={
                            !gmailStatus.connected
                              ? "Connect your Gmail account first to send cold outreach"
                              : "Send cold email via Gmail"
                          }
                          className="py-2.5 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Send size={13} />
                          <span>
                            {!gmailStatus.connected
                              ? "Connect Gmail to Send"
                              : isSending
                              ? "Dispatching..."
                              : "Send Cold Outreach"}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
