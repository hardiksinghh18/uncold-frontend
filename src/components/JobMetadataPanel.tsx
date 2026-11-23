"use client";

import React from "react";
import {
  MapPin,
  Laptop,
  DollarSign,
  Briefcase,
  Clock,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export interface JobMetadata {
  companyName?: string;
  jobTitle?: string;
  location?: string;
  workMode?: string;
  isRemoteAllowed?: boolean | null;
  compensation?: string;
  experienceRequired?: string;
  employmentType?: string;
  requiredSkills?: string[];
  matchedSkills?: string[];
  applicationUrl?: string;
}

interface JobMetadataPanelProps {
  metadata?: JobMetadata | null;
  companyName?: string | null;
  jobTitle?: string | null;
}

export function hasAnyJobMetadata(
  metadata?: JobMetadata | null,
  companyName?: string | null,
  jobTitle?: string | null
): boolean {
  if (!metadata && !companyName && !jobTitle) return false;
  return Boolean(
    companyName ||
      jobTitle ||
      metadata?.companyName ||
      metadata?.jobTitle ||
      metadata?.location ||
      metadata?.workMode ||
      metadata?.isRemoteAllowed !== null && metadata?.isRemoteAllowed !== undefined ||
      metadata?.compensation ||
      metadata?.experienceRequired ||
      metadata?.employmentType ||
      metadata?.applicationUrl ||
      (metadata?.requiredSkills && metadata.requiredSkills.length > 0) ||
      (metadata?.matchedSkills && metadata.matchedSkills.length > 0)
  );
}

export function JobMetadataPanel({ metadata, companyName, jobTitle }: JobMetadataPanelProps) {
  if (!hasAnyJobMetadata(metadata, companyName, jobTitle)) {
    return null;
  }

  const resolvedCompany = metadata?.companyName || companyName || "";
  const resolvedRole = metadata?.jobTitle || jobTitle || "";
  const requiredSkills = metadata?.requiredSkills || [];
  const matchedSkills = metadata?.matchedSkills || [];
  const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));

  const remoteLabel =
    metadata?.workMode ||
    (metadata?.isRemoteAllowed === true
      ? "Remote Allowed"
      : metadata?.isRemoteAllowed === false
      ? "On-site Only"
      : "");

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-400" />
          <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
            Extracted Job Details
          </span>
        </div>
        {metadata?.isRemoteAllowed !== null && metadata?.isRemoteAllowed !== undefined && (
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
              metadata.isRemoteAllowed
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                : "bg-amber-500/10 text-amber-300 border-amber-500/25"
            }`}
          >
            {metadata.isRemoteAllowed ? "Remote Allowed" : "On-site Required"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {resolvedCompany && (
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Company</span>
            <span className="text-zinc-200 font-medium">{resolvedCompany}</span>
          </div>
        )}

        {resolvedRole && (
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Role</span>
            <span className="text-zinc-200 font-medium">{resolvedRole}</span>
          </div>
        )}

        {metadata?.location && (
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={10} /> Location
            </span>
            <span className="text-zinc-200 font-medium">{metadata.location}</span>
          </div>
        )}

        {remoteLabel && (
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Laptop size={10} /> Work Mode
            </span>
            <span className="text-zinc-200 font-medium">{remoteLabel}</span>
          </div>
        )}

        {metadata?.compensation && (
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <DollarSign size={10} /> Package / Compensation
            </span>
            <span className="text-emerald-300 font-medium">{metadata.compensation}</span>
          </div>
        )}

        {(metadata?.experienceRequired || metadata?.employmentType) && (
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              {metadata?.experienceRequired ? <Clock size={10} /> : <Briefcase size={10} />} Experience & Type
            </span>
            <span className="text-zinc-200 font-medium">
              {[metadata?.experienceRequired, metadata?.employmentType].filter(Boolean).join(" • ")}
            </span>
          </div>
        )}
      </div>

      {matchedSkills.length > 0 && (
        <div>
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-1 font-semibold mb-1.5">
            <CheckCircle2 size={11} /> Your Matched Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((sk, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>
      )}

      {requiredSkills.length > 0 && (
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1.5">
            Required Skills in JD
          </span>
          <div className="flex flex-wrap gap-1.5">
            {requiredSkills.map((sk, idx) => {
              const isMatched = matchedSet.has(sk.toLowerCase());
              return (
                <span
                  key={idx}
                  className={`text-[11px] px-2 py-0.5 rounded-md border ${
                    isMatched
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                      : "bg-white/[0.04] border-white/10 text-zinc-300"
                  }`}
                >
                  {sk}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {metadata?.applicationUrl && (
        <div className="pt-1">
          <a
            href={metadata.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all"
          >
            <ExternalLink size={11} />
            <span>{metadata.applicationUrl}</span>
          </a>
        </div>
      )}
    </div>
  );
}
