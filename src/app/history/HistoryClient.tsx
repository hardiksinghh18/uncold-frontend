"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { CustomSelect } from "@/components/CustomSelect";
import { JobMetadata, JobMetadataPanel } from "@/components/JobMetadataPanel";
import {
  useGetEmailStatsQuery,
  useSyncEmailRepliesMutation,
} from "@/redux/api/uncoldApi";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  MessageSquareReply,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  X,
  Inbox,
  Clock,
  Calendar,
  Send,
  Zap,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Building2,
  Users,
  MessageSquare,
  FileText,
  List,
} from "lucide-react";

interface HistoryClientProps {
  user: SupabaseUser;
}

interface TrackedEmail {
  id: string;
  sender_email?: string;
  recipient_email: string;
  subject: string;
  body?: string;
  channel?: "email" | "dm" | "wellfound" | string;
  company_name?: string | null;
  recipient_name?: string | null;
  job_title?: string | null;
  job_metadata?: JobMetadata | null;
  sent_at: string;
  opened_at: string | null;
  open_count: number;
  reply_detected_at: string | null;
}

export function HistoryClient({ user }: HistoryClientProps) {
  const { signOut } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState<TrackedEmail | null>(null);

  // Search, Filter & Grouping State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "replied" | "opened" | "unread">("all");
  const [channelFilter, setChannelFilter] = useState<"all" | "email" | "dm" | "wellfound">("all");
  const [viewMode, setViewMode] = useState<"list" | "company" | "recruiter">("list");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const itemsPerPage = 10;

  const userMetadata = user.user_metadata || {};
  const fullName = userMetadata.full_name || userMetadata.name || user.email?.split("@")[0] || "User";
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null;

  const {
    data: emailStatsData,
    isLoading: isLoadingEmails,
    fulfilledTimeStamp,
    refetch: refetchEmailStats,
  } = useGetEmailStatsQuery(user.email || undefined, {
    pollingInterval: 15000,
  });
  const [syncEmailReplies] = useSyncEmailRepliesMutation();

  const emails = (emailStatsData?.emails ?? []) as TrackedEmail[];
  const hasLoadedInitial = !isLoadingEmails;
  const lastRefreshed = fulfilledTimeStamp ? new Date(fulfilledTimeStamp) : null;

  // Fetch real-time email stats and sync replies via RTK Query
  const fetchEmails = useCallback(
    async (_isSilent = false) => {
      try {
        if (user.email) {
          syncEmailReplies({ email: user.email }).catch(() => {});
        }
        await refetchEmailStats();
      } catch (e) {
        console.warn("Could not fetch email stats:", e);
      }
    },
    [refetchEmailStats, syncEmailReplies, user.email]
  );

  useEffect(() => {
    if (user.email) {
      syncEmailReplies({ email: user.email }).catch(() => {});
    }
  }, [syncEmailReplies, user.email]);

  // Telemetry computations
  const totalSent = emails.length;
  const totalOpened = emails.filter((e) => e.opened_at).length;
  const totalReplied = emails.filter((e) => e.reply_detected_at).length;
  const openRatePercent = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0.0";
  const replyRatePercent = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : "0.0";

  // Helpers to derive Company and Recruiter names cleanly
  const resolveCompanyLabel = (e: TrackedEmail): string => {
    if (e.company_name && e.company_name.trim()) return e.company_name.trim();
    if (e.recipient_email && e.recipient_email.includes("@")) {
      const domain = e.recipient_email.split("@")[1]?.toLowerCase() || "";
      if (domain && !/^(gmail|yahoo|outlook|hotmail|icloud|protonmail)\./i.test(domain)) {
        const base = domain.split(".")[0] || "";
        if (base) return base.charAt(0).toUpperCase() + base.slice(1);
      }
    }
    return "Unspecified Company";
  };

  const resolveRecruiterLabel = (e: TrackedEmail): string => {
    if (e.recipient_name && e.recipient_name.trim()) {
      return e.recipient_email && e.recipient_email.includes("@")
        ? `${e.recipient_name.trim()} (${e.recipient_email})`
        : e.recipient_name.trim();
    }
    if (e.recipient_email) return e.recipient_email;
    return "Unspecified Contact";
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Filtered and searched outreach collection
  const filteredEmails = useMemo(() => {
    let result = [...emails];

    // Channel filter
    if (channelFilter !== "all") {
      result = result.filter((e) => (e.channel || "email") === channelFilter);
    }

    // Status filter
    if (statusFilter === "replied") {
      result = result.filter((e) => Boolean(e.reply_detected_at));
    } else if (statusFilter === "opened") {
      result = result.filter((e) => Boolean(e.opened_at));
    } else if (statusFilter === "unread") {
      result = result.filter((e) => !e.opened_at && (e.channel || "email") === "email");
    }

    // Text search query (across subject, recipient, company, body, id)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.subject?.toLowerCase().includes(q) ||
          e.recipient_email?.toLowerCase().includes(q) ||
          e.company_name?.toLowerCase().includes(q) ||
          e.recipient_name?.toLowerCase().includes(q) ||
          e.job_title?.toLowerCase().includes(q) ||
          e.body?.toLowerCase().includes(q) ||
          e.id?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.sent_at).getTime();
      const timeB = new Date(b.sent_at).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [emails, channelFilter, statusFilter, searchQuery, sortOrder]);

  // Group records by Company or Recruiter
  const groupedRecords = useMemo(() => {
    if (viewMode === "list") return [];
    const groupsMap = new Map<string, { label: string; items: TrackedEmail[] }>();

    for (const item of filteredEmails) {
      const label = viewMode === "company" ? resolveCompanyLabel(item) : resolveRecruiterLabel(item);
      const key = label.toLowerCase();
      if (!groupsMap.has(key)) {
        groupsMap.set(key, { label, items: [] });
      }
      groupsMap.get(key)!.items.push(item);
    }

    return Array.from(groupsMap.values());
  }, [filteredEmails, viewMode]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / itemsPerPage));
  const paginatedEmails = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmails.slice(start, start + itemsPerPage);
  }, [filteredEmails, currentPage, itemsPerPage]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, channelFilter, sortOrder, viewMode]);

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* Universal Application Navigation Header */}
      <AppHeader user={user} />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header Title Section & Live Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Full Outreach Dispatch History
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              All your sent emails, open times, replies, and full message history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchEmails(false)}
              className="text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw size={13} className={isLoadingEmails ? "animate-spin" : ""} />
              <span>Refresh Status</span>
            </button>
            <Link
              href="/mailbox"
              className="py-1.5 px-3.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Mail size={13} />
              <span>Draft New Outreach</span>
            </Link>
          </div>
        </div>

        {/* Quick Telemetry Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08]">
            <span className="text-[11px] text-zinc-400 font-medium block">Total Dispatched</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-white">{totalSent}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Gmail API</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08]">
            <span className="text-[11px] text-zinc-400 font-medium block">Opened & Read</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-sky-400">{totalOpened}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{openRatePercent}% open rate</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08]">
            <span className="text-[11px] text-zinc-400 font-medium block">Replies Detected</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-emerald-400">{totalReplied}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{replyRatePercent}% reply rate</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08]">
            <span className="text-[11px] text-zinc-400 font-medium block">Active Filter Matches</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-zinc-200">{filteredEmails.length}</span>
              <span className="text-[10px] text-zinc-500 font-mono">records shown</span>
            </div>
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="p-4 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-3 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, recruiter, subject, or keywords..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Grouping & Channel Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* View / Grouping Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "list"
                      ? "bg-white text-black shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <List size={13} />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("company")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "company"
                      ? "bg-white text-black shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Building2 size={13} />
                  <span>By Company</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("recruiter")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "recruiter"
                      ? "bg-white text-black shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Users size={13} />
                  <span>By Recruiter</span>
                </button>
              </div>

              {/* Channel Filter */}
              <CustomSelect
                ariaLabel="Filter by channel"
                icon={<Filter size={12} />}
                value={channelFilter}
                onChange={(val) => setChannelFilter(val as "all" | "email" | "dm" | "wellfound")}
                options={[
                  { value: "all", label: "All Channels", description: "Email, DM & Wellfound" },
                  { value: "email", label: "Cold Email", description: "Sent via Gmail" },
                  { value: "dm", label: "LinkedIn / Twitter DM", description: "Copied DMs" },
                  { value: "wellfound", label: "Wellfound Note", description: "Startup notes" },
                ]}
              />

              {/* Sort Toggle */}
              <CustomSelect
                ariaLabel="Sort outreach history"
                icon={<Clock size={12} />}
                align="right"
                value={sortOrder}
                onChange={(val) => setSortOrder(val as "newest" | "oldest")}
                options={[
                  { value: "newest", label: "Sort: Newest First" },
                  { value: "oldest", label: "Sort: Oldest First" },
                ]}
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] flex-wrap gap-2">
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({emails.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("replied")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === "replied"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <MessageSquareReply size={12} className={statusFilter === "replied" ? "text-emerald-600" : "text-emerald-400"} />
                <span>Replied ({totalReplied})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("opened")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === "opened"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Eye size={12} className={statusFilter === "opened" ? "text-sky-600" : "text-sky-400"} />
                <span>Opened ({totalOpened})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("unread")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === "unread"
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <EyeOff size={12} className={statusFilter === "unread" ? "text-zinc-600" : "text-zinc-400"} />
                <span>Unread Emails</span>
              </button>
            </div>

            {viewMode !== "list" && (
              <span className="text-[11px] text-zinc-400 font-mono">
                {groupedRecords.length} {viewMode === "company" ? "companies" : "contacts"} found
              </span>
            )}
          </div>
        </div>

        {/* Grouped View (By Company or By Recruiter) */}
        {viewMode !== "list" ? (
          <div className="space-y-4">
            {!hasLoadedInitial && isLoadingEmails ? (
              <div className="p-8 rounded-2xl bg-[#0c0d12] border border-white/[0.08] text-center text-xs text-zinc-400">
                Loading grouped outreach records...
              </div>
            ) : groupedRecords.length > 0 ? (
              groupedRecords.map((group) => {
                const isCollapsed = Boolean(collapsedGroups[group.label]);
                const emailCount = group.items.filter((i) => (i.channel || "email") === "email").length;
                const dmCount = group.items.filter((i) => i.channel === "dm").length;
                const wellfoundCount = group.items.filter((i) => i.channel === "wellfound").length;
                const repliedCount = group.items.filter((i) => Boolean(i.reply_detected_at)).length;

                return (
                  <div
                    key={group.label}
                    className="rounded-2xl bg-[#0c0d12] border border-white/[0.08] overflow-hidden shadow-lg"
                  >
                    {/* Group Card Header */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      className="w-full p-4 sm:px-5 flex items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                          {viewMode === "company" ? <Building2 size={16} className="text-sky-400" /> : <Users size={16} className="text-emerald-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-white truncate">{group.label}</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300">
                              {group.items.length} {group.items.length === 1 ? "touch" : "touches"}
                            </span>
                            {repliedCount > 0 && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                                {repliedCount} Replied
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                            {emailCount > 0 && <span>{emailCount} Email</span>}
                            {dmCount > 0 && <span>• {dmCount} DM</span>}
                            {wellfoundCount > 0 && <span>• {wellfoundCount} Wellfound</span>}
                          </div>
                        </div>
                      </div>

                      <ChevronDown
                        size={16}
                        className={`text-zinc-400 transition-transform shrink-0 ${isCollapsed ? "-rotate-90" : ""}`}
                      />
                    </button>

                    {/* Group Items List */}
                    {!isCollapsed && (
                      <div className="divide-y divide-white/[0.04] border-t border-white/[0.06]">
                        {group.items.map((item) => {
                          const ch = item.channel || "email";
                          return (
                            <div
                              key={item.id}
                              className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors text-xs"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {ch === "dm" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-semibold">
                                      <MessageSquare size={10} />
                                      <span>LinkedIn / Twitter DM</span>
                                    </span>
                                  ) : ch === "wellfound" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold">
                                      <FileText size={10} />
                                      <span>Wellfound Note</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                                      <Mail size={10} />
                                      <span>Cold Email</span>
                                    </span>
                                  )}
                                  <span className="font-medium text-white truncate max-w-md">{item.subject}</span>
                                </div>
                                <div className="text-[11px] text-zinc-400 flex items-center gap-2 flex-wrap">
                                  <span>{viewMode === "company" ? resolveRecruiterLabel(item) : resolveCompanyLabel(item)}</span>
                                  <span>•</span>
                                  <span className="font-mono">{new Date(item.sent_at).toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                {ch === "email" ? (
                                  item.reply_detected_at ? (
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                      Reply Received
                                    </span>
                                  ) : item.opened_at ? (
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                      Viewed ({item.open_count}x)
                                    </span>
                                  ) : (
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/80">
                                      Unread
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-white/[0.05] text-zinc-300 border border-white/10">
                                    Copied & Logged
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedEmail(item)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                                >
                                  <Eye size={12} className="text-zinc-400" />
                                  <span>View</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-16 rounded-2xl bg-[#0c0d12] border border-white/[0.08] text-center text-zinc-500 text-xs">
                <Inbox size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium text-zinc-400 text-sm">No grouped records matched your filters</p>
              </div>
            )}
          </div>
        ) : (
        /* Full Interactive History Table (List View) */
        <div className="rounded-2xl bg-[#0c0d12] border border-white/[0.08] overflow-hidden flex flex-col shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-400 font-medium uppercase tracking-wider text-[11px] bg-white/[0.01]">
                  <th className="py-3.5 px-5">Subject / Outreach</th>
                  <th className="py-3.5 px-5">Company & Contact</th>
                  <th className="py-3.5 px-5">Channel</th>
                  <th className="py-3.5 px-5">Open & Reply Status</th>
                  <th className="py-3.5 px-5">Reply Status</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {!hasLoadedInitial && isLoadingEmails ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="py-3.5 px-5">
                        <div className="h-3.5 bg-white/10 rounded w-48 mb-1" />
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
                        <div className="h-3 bg-white/10 rounded w-24" />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="h-6 bg-white/10 rounded w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedEmails.length > 0 ? (
                  paginatedEmails.map((e) => {
                    const ch = e.channel || "email";
                    return (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Subject */}
                      <td className="py-3.5 px-5 font-medium text-zinc-200">
                        <div className="font-semibold text-zinc-100 max-w-[260px] truncate" title={e.subject}>
                          {e.subject}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          ID: {e.id.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Company & Contact */}
                      <td className="py-3.5 px-5">
                        <div className="text-zinc-200 font-medium text-xs">{resolveCompanyLabel(e)}</div>
                        <div className="text-zinc-400 font-mono text-[10px] truncate max-w-[180px]" title={resolveRecruiterLabel(e)}>
                          {resolveRecruiterLabel(e)}
                        </div>
                      </td>

                      {/* Channel Badge */}
                      <td className="py-3.5 px-5">
                        {ch === "dm" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            <MessageSquare size={11} />
                            <span>LinkedIn DM</span>
                          </span>
                        ) : ch === "wellfound" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <FileText size={11} />
                            <span>Wellfound</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Mail size={11} />
                            <span>Cold Email</span>
                          </span>
                        )}
                      </td>

                      {/* Readability / Open Status */}
                      <td className="py-3.5 px-5">
                        {ch !== "email" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.04] text-zinc-300 border border-white/10">
                            <Check size={12} className="text-emerald-400" />
                            <span>Copied & Logged</span>
                          </span>
                        ) : e.opened_at ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 w-fit">
                              <Eye size={12} className="text-sky-400" />
                              <span>Viewed {e.open_count > 1 ? `(${e.open_count}x)` : ""}</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono pl-1">
                              {new Date(e.opened_at).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                              {new Date(e.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                        {ch !== "email" ? (
                          <span className="text-zinc-500 text-[11px] font-mono">Manual / External</span>
                        ) : e.reply_detected_at ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
                              <MessageSquareReply size={12} className="text-emerald-400" />
                              <span>Reply Received</span>
                            </span>
                            <span className="text-[10px] text-emerald-400/80 font-mono pl-1">
                              {new Date(e.reply_detected_at).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                              {new Date(e.reply_detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                          ? `${new Date(e.sent_at).toLocaleDateString([], { month: "short", day: "numeric" })} at ${new Date(e.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : "Recently"}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmail(e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                        >
                          <Eye size={12} className="text-zinc-400" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-zinc-500 text-xs">
                      <Inbox size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-medium text-zinc-400 text-sm">No outreach records matched your search</p>
                      <p className="text-zinc-500 mt-1 max-w-sm mx-auto">
                        {searchQuery
                          ? `No emails found matching "${searchQuery}". Try clearing search or switching status filters.`
                          : "No outreach emails have been dispatched under this category."}
                      </p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                        >
                          Clear Search & Filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-2">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredEmails.length)} of {filteredEmails.length} emails
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      currentPage === idx + 1
                        ? "bg-white text-black font-semibold"
                        : "bg-white/[0.04] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
        )}
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
                  <p className="text-[11px] text-zinc-400 font-mono">Tracking ID: {selectedEmail.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">To (Recipient)</span>
                  <span className="text-zinc-200 font-mono font-medium">{selectedEmail.recipient_email}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">From (Sender)</span>
                  <span className="text-zinc-200 font-mono font-medium">{selectedEmail.sender_email || user.email}</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-medium">Status:</span>
                  {selectedEmail.opened_at ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-medium">
                      <Eye size={12} />
                      <span>Opened ({selectedEmail.open_count}x)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 text-[11px]">
                      <EyeOff size={12} />
                      <span>Unread</span>
                    </span>
                  )}
                  {selectedEmail.reply_detected_at && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                      <MessageSquareReply size={12} />
                      <span>Reply Detected</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  Sent: {new Date(selectedEmail.sent_at).toLocaleString()}
                </span>
              </div>

              {/* Extracted Job Details */}
              <JobMetadataPanel
                metadata={selectedEmail.job_metadata}
                companyName={selectedEmail.company_name}
                jobTitle={selectedEmail.job_title}
              />

              {/* Subject */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">Subject</label>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-medium">
                  {selectedEmail.subject}
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">Message Content</label>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed text-xs">
                  {selectedEmail.body || "(Body content preview not available for this legacy record)"}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/[0.08] flex items-center justify-end bg-white/[0.01]">
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors"
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
