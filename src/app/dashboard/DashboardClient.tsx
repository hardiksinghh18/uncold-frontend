"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { JobMetadata, JobMetadataPanel } from "@/components/JobMetadataPanel";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  Sparkles,
  Mail,
  Send,
  Zap,
  TrendingUp,
  LogOut,
  FileText,
  Sliders,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Layers,
  Inbox,
  Users,
  Settings,
  MoreVertical,
  Activity,
  BarChart3,
  RefreshCw,
  Eye,
  EyeOff,
  X,
  Calendar,
  MessageSquareReply
} from "lucide-react";

interface DashboardClientProps {
  user: SupabaseUser;
}

interface TrackedEmail {
  id: string;
  sender_email?: string;
  recipient_email: string;
  subject: string;
  body?: string;
  company_name?: string | null;
  recipient_name?: string | null;
  job_title?: string | null;
  job_metadata?: JobMetadata | null;
  sent_at: string;
  opened_at: string | null;
  open_count: number;
  reply_detected_at: string | null;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "contacts" | "activity">("overview");
  const [emails, setEmails] = useState<TrackedEmail[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<TrackedEmail | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [gmailStatus, setGmailStatus] = useState<{
    loaded: boolean;
    connected: boolean;
    connectedGmail: string | null;
  }>({ loaded: false, connected: false, connectedGmail: null });

  const userMetadata = user.user_metadata || {};
  const fullName = userMetadata.full_name || userMetadata.name || user.email?.split("@")[0] || "User";
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null;
  const provider = user.app_metadata?.provider || "email";

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Fetch real-time email telemetry and sync replies
  const fetchEmails = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoadingEmails(true);

      // Trigger automatic reply check in background
      if (user.email) {
        authFetch(`${backendUrl}/api/emails/sync-replies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        }).catch(() => {});
      }

      const url = user.email
        ? `${backendUrl}/api/emails/stats?email=${encodeURIComponent(user.email)}`
        : `${backendUrl}/api/emails/stats`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.emails) {
          setEmails(data.emails);
          setLastRefreshed(new Date());
        }
      }
    } catch (e) {
      console.warn("Could not fetch email stats:", e);
    } finally {
      setIsLoadingEmails(false);
      setHasLoadedInitial(true);
    }
  }, [backendUrl, user.email]);

  useEffect(() => {
    fetchEmails(false);
    // Auto-refresh telemetry every 10 seconds silently to catch opens in real-time
    const interval = setInterval(() => fetchEmails(true), 10000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  // Check Gmail connection status and handle OAuth callback query params
  useEffect(() => {
    if (!user.email) return;

    authFetch(`${backendUrl}/api/gmail/status?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((d) => {
        setGmailStatus({
          loaded: true,
          connected: Boolean(d.connected),
          connectedGmail: d.connectedGmail || null,
        });
      })
      .catch(() => {
        setGmailStatus((prev) => ({ ...prev, loaded: true }));
      });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("gmail_connected") === "1") {
        const linked = params.get("gmail");
        toast.success(
          linked ? `Gmail connected (${linked})! You can now send emails directly.` : "Gmail connected successfully!"
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
      const res = await authFetch(`${backendUrl}/api/gmail/connect?returnTo=/dashboard&format=json`);
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

  // Compute live open rates from real data
  const totalSent = emails.length;
  const totalOpened = emails.filter((e) => e.opened_at).length;
  const openRatePercent = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0.0";

  // Production-grade mock records
  const recentCampaigns = [
    {
      id: "cmp_01",
      target: "Senior Product Designer at Stripe",
      recipient: "Alex Rivera (Design Lead)",
      status: "Delivered",
      opened: true,
      replied: true,
      sentAt: "Today, 14:22",
      tone: "Direct & Value-First",
    },
    {
      id: "cmp_02",
      target: "Frontend Systems Engineer at Linear",
      recipient: "Karri Saarinen (Co-Founder)",
      status: "Delivered",
      opened: true,
      replied: false,
      sentAt: "Yesterday, 18:40",
      tone: "Technical Proof-of-Work",
    },
    {
      id: "cmp_03",
      target: "Fullstack AI Engineer at Vercel",
      recipient: "Guillermo Rauch (CEO Office)",
      status: "Queued",
      opened: false,
      replied: false,
      sentAt: "Scheduled (Tomorrow, 09:00)",
      tone: "High Synergy",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* Universal Application Navigation Header */}
      <AppHeader user={user} />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Workspace Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Workspace Overview
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Live email opens, replies, and recent outreach activity.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            >
              <Clock size={13} className="text-sky-400" />
              <span>View Full History</span>
            </Link>
          </div>
        </div>

        {/* Gmail Connection Nudge Banner (shown on Dashboard for all users) */}
        {gmailStatus.loaded && !gmailStatus.connected ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-white">
                    Connect Your Gmail to Send Cold Outreach
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                  Authorize Gmail access so Uncold can dispatch cold emails directly from your inbox and automatically track opens & replies.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConnectGmail}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs transition-all cursor-pointer shadow-md shrink-0"
            >
              <Mail size={14} className="text-red-500" />
              <span>Connect Gmail Account</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        ) : gmailStatus.loaded && gmailStatus.connected ? (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 flex items-center justify-between gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Gmail Sending Active:{" "}
                <strong className="font-mono text-white">{gmailStatus.connectedGmail || user.email}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleConnectGmail}
              className="text-[11px] text-zinc-400 hover:text-white transition-colors underline underline-offset-2 cursor-pointer"
            >
              Reconnect / Switch Gmail
            </button>
          </div>
        ) : null}

        {/* Metrics Grid: Accurate, Dense, Production Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium">Total Emails Dispatched</span>
              <Send size={15} className="text-zinc-500" />
            </div>
            <div className="my-3">
              <span className="text-2xl font-semibold text-white tracking-tight">{totalSent}</span>
              <span className="text-xs text-zinc-500 ml-2">sent via Gmail API</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <TrendingUp size={12} />
              <span>Live open & reply tracking</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium">Open & Read Ratio</span>
              <Activity size={15} className="text-zinc-500" />
            </div>
            <div className="my-3">
              <span className="text-2xl font-semibold text-white tracking-tight">{openRatePercent}%</span>
              <span className="text-xs text-zinc-500 ml-2">{totalOpened} opened</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <TrendingUp size={12} />
              <span>{totalOpened > 0 ? `${totalOpened} verified reads` : "Tracking pixel active"}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium">Verified Recipients</span>
              <Users size={15} className="text-zinc-500" />
            </div>
            <div className="my-3">
              <span className="text-2xl font-semibold text-white tracking-tight">
                {new Set(emails.map((e) => e.recipient_email)).size}
              </span>
              <span className="text-xs text-zinc-500 ml-2">contacts reached</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              <span>Direct outreach pipeline</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-medium">Direct Responses</span>
              <Zap size={15} className="text-amber-400" />
            </div>
            <div className="my-3">
              <span className="text-2xl font-semibold text-white tracking-tight">
                {emails.filter((e) => e.reply_detected_at).length}
              </span>
              <span className="text-xs text-zinc-500 ml-2">replies detected</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              <span>Automatic reply synchronization</span>
            </div>
          </div>
        </div>

        {/* Full-Width Outreach Pipeline Table */}
        <div className="rounded-2xl bg-[#0c0d12] border border-white/[0.08] overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-white tracking-tight">
                Recent Outreach Log
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-zinc-400 font-mono">
                Showing {Math.min(emails.length, 5)} of {emails.length}
              </span>
              {isLoadingEmails && (
                <span className="text-xs text-zinc-500 animate-spin">⟳</span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/history"
                className="text-xs text-white bg-white/[0.08] hover:bg-white/[0.15] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 font-medium shadow-sm"
              >
                <Clock size={13} className="text-sky-400" />
                <span>View Full History ({emails.length})</span>
                <ArrowUpRight size={13} className="text-zinc-400" />
              </Link>
              <Link
                href="/mailbox"
                className="text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10"
              >
                <Mail size={13} className="text-red-400" />
                <span>Open Mailbox Dispatcher</span>
              </Link>
              <button
                type="button"
                onClick={() => fetchEmails(false)}
                className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 cursor-pointer"
                title="Refresh open and reply status"
              >
                <RefreshCw size={12} className={isLoadingEmails ? "animate-spin" : ""} />
                <span>Refresh Status</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-400 font-medium uppercase tracking-wider text-[11px] bg-white/[0.01]">
                  <th className="py-3 px-5">Subject Line</th>
                  <th className="py-3 px-5">Recipient</th>
                  <th className="py-3 px-5">Delivery Status</th>
                  <th className="py-3 px-5">Read / View Status</th>
                  <th className="py-3 px-5">Reply Received</th>
                  <th className="py-3 px-5">Dispatched At</th>
                  <th className="py-3 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {!hasLoadedInitial && isLoadingEmails ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="py-3.5 px-5">
                        <div className="h-3.5 bg-white/10 rounded w-44 mb-1" />
                        <div className="h-2.5 bg-white/5 rounded w-24" />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-3 bg-white/10 rounded w-36" />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-5 bg-white/10 rounded-md w-24" />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-5 bg-white/10 rounded-md w-28" />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-5 bg-white/10 rounded-md w-28" />
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-3 bg-white/10 rounded w-20" />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="h-6 bg-white/10 rounded w-14 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : emails.length > 0 ? (
                  emails.slice(0, 5).map((e) => (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Subject */}
                      <td className="py-3.5 px-5 font-medium text-zinc-200">
                        <div className="font-semibold text-zinc-100 max-w-[240px] truncate" title={e.subject}>
                          {e.subject}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          ID: {e.id.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-5 text-zinc-300 font-mono text-[11px]">
                        {e.recipient_email}
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span>Sent & Delivered</span>
                        </span>
                      </td>

                      {/* Readability / Open Status */}
                      <td className="py-3.5 px-5">
                        {e.opened_at ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 w-fit">
                              <Eye size={12} className="text-sky-400" />
                              <span>Viewed {e.open_count > 1 ? `(${e.open_count}x)` : ""}</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono pl-1">
                              {new Date(e.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/80">
                            <EyeOff size={12} className="text-zinc-500" />
                            <span>Unread</span>
                          </span>
                        )}
                      </td>

                      {/* Reply Received Status & Timestamp */}
                      <td className="py-3.5 px-5">
                        {e.reply_detected_at ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
                              <MessageSquareReply size={12} className="text-emerald-400" />
                              <span>Reply Received</span>
                            </span>
                            <span className="text-[10px] text-emerald-400/80 font-mono pl-1">
                              {new Date(e.reply_detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px] font-mono">
                            Awaiting response
                          </span>
                        )}
                      </td>

                      {/* Sent Time */}
                      <td className="py-3.5 px-5 text-zinc-400 text-[11px] whitespace-nowrap">
                        {e.sent_at
                          ? new Date(e.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Just now"}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmail(e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                        >
                          <Eye size={12} className="text-zinc-400" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs">
                      <Inbox size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="font-medium text-zinc-400">No outreach emails dispatched yet</p>
                      <p className="text-zinc-500 mt-1">Open the Mailbox Dispatcher to send your first tracked email.</p>
                      <Link
                        href="/mailbox"
                        className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                      >
                        <Mail size={13} className="text-red-400" />
                        <span>Open Mailbox Dispatcher</span>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {emails.length > 5 && (
            <div className="p-3.5 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-zinc-400">
              <span>
                Showing 5 of {emails.length} dispatched emails
              </span>
              <Link
                href="/history"
                className="inline-flex items-center gap-1.5 text-xs text-white hover:text-sky-300 font-medium transition-colors"
              >
                <span>View All History with Search & Filters ({emails.length})</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* View Email Details Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[#0e1017] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Email Dispatch Details</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">ID: {selectedEmail.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-0.5">
                    Recipient
                  </span>
                  <span className="text-zinc-200 font-mono text-[11px]">{selectedEmail.recipient_email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-0.5">
                    Sender
                  </span>
                  <span className="text-zinc-200 font-mono text-[11px]">{selectedEmail.sender_email || user.email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-0.5">
                    Sent Timestamp
                  </span>
                  <span className="text-zinc-300">
                    {selectedEmail.sent_at ? new Date(selectedEmail.sent_at).toLocaleString() : "Just now"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-0.5">
                    Readability & Reply Status
                  </span>
                  {selectedEmail.reply_detected_at ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <MessageSquareReply size={13} className="text-emerald-400" />
                      Recipient Replied ({new Date(selectedEmail.reply_detected_at).toLocaleString()})
                    </span>
                  ) : selectedEmail.opened_at ? (
                    <span className="inline-flex items-center gap-1.5 text-sky-400 font-medium">
                      <Eye size={13} />
                      Opened {selectedEmail.open_count}x (First: {new Date(selectedEmail.opened_at).toLocaleTimeString()})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-zinc-400">
                      <EyeOff size={13} className="text-zinc-500" />
                      Delivered (Unread)
                    </span>
                  )}
                </div>
              </div>

              {/* Extracted Job Details */}
              <JobMetadataPanel
                metadata={selectedEmail.job_metadata}
                companyName={selectedEmail.company_name}
                jobTitle={selectedEmail.job_title}
              />

              {/* Subject */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                  Subject Line
                </label>
                <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-100 font-medium">
                  {selectedEmail.subject}
                </div>
              </div>

              {/* Email Body */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                  Message Body
                </label>
                <div className="p-3.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-200 whitespace-pre-wrap leading-relaxed min-h-[120px] font-sans">
                  {selectedEmail.body || "(Content preview not stored in legacy records)"}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <span className="text-[11px] text-zinc-500">
                Automatic open & reply tracking enabled
              </span>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
