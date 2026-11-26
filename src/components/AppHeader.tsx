"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Mail,
  Clock,
} from "lucide-react";

interface AppHeaderProps {
  user: SupabaseUser;
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  const activePath = pendingPath ?? pathname;

  const userMetadata = user.user_metadata || {};
  const fullName = userMetadata.full_name || userMetadata.name || user.email?.split("@")[0] || "User";
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null;

  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: activePath === "/dashboard",
    },
    {
      name: "Mailbox Engine",
      href: "/mailbox",
      icon: Mail,
      active: activePath === "/mailbox",
    },
    {
      name: "Outreach History",
      href: "/history",
      icon: Clock,
      active: activePath === "/history",
    },
  ];

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-white/[0.08] bg-[#07080a]/90 backdrop-blur-xl">
      <div className="max-w-[1440px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand Logo & Status */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="/uncold_logo.webp"
              alt="Uncold"
              className="w-7 h-7 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-semibold text-sm tracking-tight text-white">
              UnCold
            </span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden md:block" />

          {/* Central Main Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  prefetch={true}
                  onClick={() => {
                    if (tab.href !== pathname) setPendingPath(tab.href);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab.active
                      ? "bg-white/[0.1] text-white font-semibold border border-white/15 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    size={14}
                    className={
                      tab.active
                        ? "text-white"
                        : "text-zinc-400 group-hover:text-white"
                    }
                  />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Mobile Links, Profile Pill & Signout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Navigation Icons */}
          <div className="flex md:hidden items-center gap-1 mr-1">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  prefetch={true}
                  onClick={() => {
                    if (tab.href !== pathname) setPendingPath(tab.href);
                  }}
                  title={tab.name}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    tab.active
                      ? "bg-white/[0.12] text-white border border-white/15"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                </Link>
              );
            })}
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Clickable Profile Badge */}
          <Link
            href="/profile"
            prefetch={true}
            onClick={() => {
              if (pathname !== "/profile") setPendingPath("/profile");
            }}
            title="View & Edit Candidate Profile"
            className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all group cursor-pointer border ${
              activePath === "/profile"
                ? "bg-white/[0.08] border-white/20 text-white"
                : "border-transparent hover:border-white/10 hover:bg-white/[0.05]"
            }`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-7 h-7 rounded-full border border-white/15 object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-semibold text-zinc-300 group-hover:border-sky-400/50 transition-colors">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-zinc-200 leading-none group-hover:text-white transition-colors">
                {fullName}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 max-w-[130px] truncate">
                {user.email}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
