"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import {
  useGetProfileQuery,
  useParseResumeMutation,
  useSaveProfileMutation,
} from "@/redux/api/uncoldApi";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  UploadCloud,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  LogOut,
  Save,
  Globe,
  RefreshCw,
  Wand2,
  Sliders,
  Check,
  X,
  Edit3,
  ExternalLink,
  Calendar,
  Building2,
  CheckCircle,
  MapPin
} from "lucide-react";

interface ProfileClientProps {
  user: SupabaseUser;
}

interface WorkExperience {
  company_name: string;
  designation: string;
  role_type?: string;
  from?: string;
  to?: string;
  is_currently_working?: boolean;
  responsibilities_projects?: string;
  skills?: string[];
}

interface EducationDetail {
  university_text: string;
  degree_or_major_title: string;
  education_level_text?: string;
  graduation_month_year?: string;
}

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  introduction: string;
  skills: string[];
  projects_and_past_experience: WorkExperience[];
  education_details: EducationDetail[];
  portfolio_links: {
    github: string;
    linkedin: string;
    portfolio: string;
    resume_url?: string;
    other?: string;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View vs Edit Mode State
  const [isEditing, setIsEditing] = useState(false);

  // Tab mode in edit mode: 'ai-parser' vs 'manual'
  const [activeMode, setActiveMode] = useState<"ai-parser" | "manual">("ai-parser");

  // Profile Form State
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
    email: user.email || "",
    phone: "",
    location: "",
    headline: "",
    introduction: "",
    skills: [],
    projects_and_past_experience: [
      {
        company_name: "",
        designation: "",
        role_type: "Full-time",
        from: "",
        to: "",
        is_currently_working: true,
        responsibilities_projects: "",
        skills: [],
      },
    ],
    education_details: [
      {
        university_text: "",
        degree_or_major_title: "",
        education_level_text: "Bachelor's Degree",
        graduation_month_year: "",
      },
    ],
    portfolio_links: {
      github: "",
      linkedin: "",
      portfolio: "",
      resume_url: "",
    },
  });

  const [skillInput, setSkillInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasAiParsed, setHasAiParsed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data: profileRes, isLoading: isLoadingProfile } = useGetProfileQuery(
    user.email || "",
    { skip: !user.email }
  );
  const [parseResume, { isLoading: isParsing }] = useParseResumeMutation();
  const [saveProfile, { isLoading: isSaving }] = useSaveProfileMutation();

  const userMetadata = user.user_metadata || {};
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null;
  const displayName = formData.full_name || userMetadata.full_name || userMetadata.name || user.email?.split("@")[0] || "User";

  // Populate form state from cached RTK Query profile response
  useEffect(() => {
    const p = profileRes?.profile;
    if (!p) return;

    setFormData({
      full_name: p.full_name || user.user_metadata?.full_name || "",
      email: p.email || user.email || "",
      phone: p.phone || "",
      location: p.location || "",
      headline: p.headline || "",
      introduction: p.introduction || "",
      skills: Array.isArray(p.skills) ? p.skills : [],
      projects_and_past_experience:
        Array.isArray(p.projects_and_past_experience) && p.projects_and_past_experience.length > 0
          ? p.projects_and_past_experience
          : [
              {
                company_name: "",
                designation: "",
                role_type: "Full-time",
                from: "",
                to: "",
                is_currently_working: true,
                responsibilities_projects: "",
                skills: [],
              },
            ],
      education_details:
        Array.isArray(p.education_details) && p.education_details.length > 0
          ? p.education_details
          : [
              {
                university_text: "",
                degree_or_major_title: "",
                education_level_text: "Bachelor's Degree",
                graduation_month_year: "",
              },
            ],
      portfolio_links: {
        github: p.portfolio_links?.github || "",
        linkedin: p.portfolio_links?.linkedin || "",
        portfolio: p.portfolio_links?.portfolio || "",
        resume_url: p.portfolio_links?.resume_url || p.resume_url || "",
      },
    });
  }, [profileRes, user.email, user.user_metadata]);

  // Handle Drag & Drop / File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a valid PDF file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  // AI Resume Parse Function
  const handleParseResume = async () => {
    if (!selectedFile) {
      toast.error("Please select a resume PDF file to analyze.");
      return;
    }

    const parseToastId = toast.loading("Reading your resume...");

    const bodyFormData = new FormData();
    bodyFormData.append("resume", selectedFile);

    try {
      const json = await parseResume(bodyFormData).unwrap();
      const extracted = json.data;

      // Update Form Data with AI Extracted Information (without saving yet!)
      setFormData((prev) => ({
        ...prev,
        full_name: extracted.full_name || prev.full_name,
        email: extracted.email || prev.email,
        phone: extracted.phone || prev.phone,
        location: extracted.location || prev.location,
        headline: extracted.headline || prev.headline,
        introduction: extracted.introduction || prev.introduction,
        skills: Array.isArray(extracted.skills) && extracted.skills.length > 0 ? extracted.skills : prev.skills,
        projects_and_past_experience:
          Array.isArray(extracted.projects_and_past_experience) &&
          extracted.projects_and_past_experience.length > 0
            ? extracted.projects_and_past_experience
            : prev.projects_and_past_experience,
        education_details:
          Array.isArray(extracted.education_details) && extracted.education_details.length > 0
            ? extracted.education_details
            : prev.education_details,
        portfolio_links: {
          github: extracted.portfolio_links?.github || prev.portfolio_links.github,
          linkedin: extracted.portfolio_links?.linkedin || prev.portfolio_links.linkedin,
          portfolio: extracted.portfolio_links?.portfolio || prev.portfolio_links.portfolio,
        },
      }));

      setHasAiParsed(true);
      setActiveMode("manual"); // Switch to review form so user sees extracted fields immediately
      toast.success("Resume parsed! Review the fields below and click Save Profile.", {
        id: parseToastId,
      });
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to analyze resume via AI.", {
        id: parseToastId,
      });
    }
  };

  // Skill Tags Helpers
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!formData.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput("");
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Work Experience Helpers
  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      projects_and_past_experience: [
        ...prev.projects_and_past_experience,
        {
          company_name: "",
          designation: "",
          role_type: "Full-time",
          from: "",
          to: "",
          is_currently_working: false,
          responsibilities_projects: "",
          skills: [],
        },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      projects_and_past_experience: prev.projects_and_past_experience.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index: number, field: keyof WorkExperience, val: any) => {
    setFormData((prev) => {
      const list = [...prev.projects_and_past_experience];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, projects_and_past_experience: list };
    });
  };

  // Education Helpers
  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education_details: [
        ...prev.education_details,
        {
          university_text: "",
          degree_or_major_title: "",
          education_level_text: "Bachelor's Degree",
          graduation_month_year: "",
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education_details: prev.education_details.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: keyof EducationDetail, val: string) => {
    setFormData((prev) => {
      const list = [...prev.education_details];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, education_details: list };
    });
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.full_name.trim()) errors.full_name = "Full Name is required.";
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.email = "A valid email address is required.";
    }
    if (!formData.headline.trim()) errors.headline = "Headline / Title is required.";

    const isValidUrl = (url: string) => {
      if (!url.trim()) return true;
      try {
        new URL(url.startsWith("http") ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    };

    if (formData.portfolio_links.github && !isValidUrl(formData.portfolio_links.github)) {
      errors.github = "Please enter a valid GitHub URL.";
    }
    if (formData.portfolio_links.linkedin && !isValidUrl(formData.portfolio_links.linkedin)) {
      errors.linkedin = "Please enter a valid LinkedIn URL.";
    }
    if (formData.portfolio_links.portfolio && !isValidUrl(formData.portfolio_links.portfolio)) {
      errors.portfolio = "Please enter a valid Website URL.";
    }
    if (formData.portfolio_links.resume_url && !isValidUrl(formData.portfolio_links.resume_url)) {
      errors.resume_url = "Please enter a valid Resume URL (e.g. Google Drive, Dropbox, ReadCV).";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Profile to Backend
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the highlighted validation errors before saving.");
      return;
    }

    const saveToastId = toast.loading("Saving profile to database...");

    try {
      await saveProfile({
        ...formData,
        email: user.email,
      }).unwrap();

      toast.success("Candidate profile saved successfully!", {
        id: saveToastId,
      });
      setHasAiParsed(false);
      setIsEditing(false); // Switch smoothly back to profile view mode
    } catch (err: any) {
      toast.error(err?.data?.error || err?.message || "Failed to persist profile.", {
        id: saveToastId,
      });
    }
  };

  const hasConfiguredProfile = Boolean(
    formData.headline.trim() ||
    formData.skills.length > 0 ||
    formData.projects_and_past_experience.some((e) => e.company_name.trim())
  );

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* Universal Application Navigation Header */}
      <AppHeader user={user} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {isLoadingProfile && !isEditing ? (
          <div className="space-y-6 animate-pulse">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.06] shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-5 w-48 rounded-lg bg-white/[0.08]" />
                  <div className="h-4 w-72 rounded-lg bg-white/[0.05]" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-6 w-28 rounded-lg bg-white/[0.05]" />
                    <div className="h-6 w-20 rounded-lg bg-white/[0.05]" />
                    <div className="h-6 w-24 rounded-lg bg-white/[0.05]" />
                  </div>
                </div>
              </div>
              <div className="h-16 rounded-xl bg-white/[0.03]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-44 rounded-2xl bg-[#0c0d12] border border-white/[0.08]" />
              <div className="h-44 rounded-2xl bg-[#0c0d12] border border-white/[0.08]" />
            </div>
            <div className="h-52 rounded-2xl bg-[#0c0d12] border border-white/[0.08]" />
          </div>
        ) : !isEditing ? (
          <div className="space-y-6">
            {/* Top Candidate Hero Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0d12] border border-white/[0.08] relative shadow-xl overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/15 object-cover shrink-0 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0 shadow-md">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {displayName}
                      </h1>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Active Candidate
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-sky-400 font-medium">
                      {formData.headline || "No headline configured yet"}
                    </p>

                    {/* Contact Pills */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-zinc-500" />
                        <span>{formData.email || user.email}</span>
                      </div>
                      {formData.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-zinc-500" />
                          <span>{formData.phone}</span>
                        </div>
                      )}
                      {formData.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-zinc-500" />
                          <span>{formData.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Proof of Work & Links Pills */}
                    {(formData.portfolio_links.github ||
                      formData.portfolio_links.linkedin ||
                      formData.portfolio_links.portfolio ||
                      formData.portfolio_links.resume_url) && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {formData.portfolio_links.resume_url && (
                          <a
                            href={
                              formData.portfolio_links.resume_url.startsWith("http")
                                ? formData.portfolio_links.resume_url
                                : `https://${formData.portfolio_links.resume_url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs text-amber-300 hover:text-white transition-colors font-medium shadow-sm"
                            title="Open Resume / CV Document"
                          >
                            <FileText size={12} className="text-amber-400" />
                            <span>Resume Link (Drive / Cloud)</span>
                            <ExternalLink size={10} className="text-amber-400" />
                          </a>
                        )}
                        {formData.portfolio_links.github && (
                          <a
                            href={
                              formData.portfolio_links.github.startsWith("http")
                                ? formData.portfolio_links.github
                                : `https://${formData.portfolio_links.github}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
                          >
                            <Globe size={12} className="text-zinc-400" />
                            <span>GitHub</span>
                            <ExternalLink size={10} className="text-zinc-500" />
                          </a>
                        )}
                        {formData.portfolio_links.linkedin && (
                          <a
                            href={
                              formData.portfolio_links.linkedin.startsWith("http")
                                ? formData.portfolio_links.linkedin
                                : `https://${formData.portfolio_links.linkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-xs text-sky-300 hover:text-white transition-colors"
                          >
                            <Globe size={12} className="text-sky-400" />
                            <span>LinkedIn</span>
                            <ExternalLink size={10} className="text-sky-400" />
                          </a>
                        )}
                        {formData.portfolio_links.portfolio && (
                          <a
                            href={
                              formData.portfolio_links.portfolio.startsWith("http")
                                ? formData.portfolio_links.portfolio
                                : `https://${formData.portfolio_links.portfolio}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs text-emerald-300 hover:text-white transition-colors"
                          >
                            <Globe size={12} className="text-emerald-400" />
                            <span>Portfolio</span>
                            <ExternalLink size={10} className="text-emerald-400" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Edit Profile & Sign Out CTAs */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs transition-all cursor-pointer shadow-md"
                  >
                    <Edit3 size={14} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 hover:text-red-200 font-semibold text-xs transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* If profile has no headline or info, show prompt banner */}
            {!hasConfiguredProfile && (
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-3">
                <Sparkles size={24} className="text-amber-400 mx-auto" />
                <h3 className="text-sm font-semibold text-white">Your profile is not yet configured</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Upload your resume or enter your details manually. Our AI engine uses your skills and experience to craft hyper-personalized cold outreach emails.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  <Wand2 size={13} />
                  <span>Configure Profile & Resume</span>
                </button>
              </div>
            )}

            {/* Introduction / About */}
            {formData.introduction && (
              <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-2.5">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  About & Background
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {formData.introduction}
                </p>
              </div>
            )}

            {/* Technical Skills & Stack */}
            <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Technical Skills & Core Stack</h3>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {formData.skills.length} skills listed
                </span>
              </div>

              {formData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-zinc-200 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No skills added yet.</p>
              )}
            </div>

            {/* Work Experience */}
            <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Briefcase size={15} className="text-sky-400" />
                  <h3 className="text-sm font-semibold text-white">Work Experience & Roles</h3>
                </div>
              </div>

              {formData.projects_and_past_experience.filter((e) => e.company_name.trim() || e.designation.trim()).length > 0 ? (
                <div className="space-y-4">
                  {formData.projects_and_past_experience
                    .filter((e) => e.company_name.trim() || e.designation.trim())
                    .map((exp, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <span className="text-xs font-semibold text-white">{exp.designation || "Role"}</span>
                            <span className="text-xs text-zinc-400"> at </span>
                            <span className="text-xs font-medium text-sky-400">{exp.company_name || "Company"}</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {exp.from || ""} {exp.from && exp.to ? "–" : ""} {exp.to || (exp.from ? "Present" : "")}
                          </span>
                        </div>

                        {exp.responsibilities_projects && (
                          <ul className="space-y-1.5 pt-1">
                            {exp.responsibilities_projects
                              .split(/\r?\n+/)
                              .map((line) => line.replace(/^[•\-*\s]+/, "").trim())
                              .filter(Boolean)
                              .map((point, pIdx) => (
                                <li
                                  key={pIdx}
                                  className="text-xs text-zinc-300 leading-relaxed flex items-start gap-2"
                                >
                                  <span className="text-sky-400 mt-0.5 shrink-0">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No work experience listed yet.</p>
              )}
            </div>

            {/* Education Details */}
            <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <GraduationCap size={15} className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Education</h3>
                </div>
              </div>

              {formData.education_details.filter((e) => e.university_text.trim() || e.degree_or_major_title.trim()).length > 0 ? (
                <div className="space-y-3">
                  {formData.education_details
                    .filter((e) => e.university_text.trim() || e.degree_or_major_title.trim())
                    .map((edu, index) => (
                      <div
                        key={index}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <div>
                          <span className="text-xs font-semibold text-white">{edu.degree_or_major_title}</span>
                          <span className="text-xs text-zinc-400"> from </span>
                          <span className="text-xs font-medium text-emerald-400">{edu.university_text}</span>
                        </div>
                        {edu.graduation_month_year && (
                          <span className="text-[11px] font-mono text-zinc-500">
                            Graduated: {edu.graduation_month_year}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No education details listed yet.</p>
              )}
            </div>
          </div>
        ) : (
          /* =========================================================================
              MODE 2: EDIT PROFILE MODE (AI Parser & Manual Form Edit)
             ========================================================================= */
          <div className="space-y-6">
            {/* Edit Mode Header & Options Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c0d12] border border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Cancel / View Profile</span>
                  </button>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                    Zero File Storage (In-Memory)
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Edit Profile & Resume Data
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Choose between AI resume parsing or manual form editing. Parsed data is presented for your review before saving.
                </p>
              </div>

              {/* Mode Switcher Buttons */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveMode("ai-parser")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeMode === "ai-parser"
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Wand2 size={13} />
                  <span>AI Resume Parser</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode("manual")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeMode === "manual"
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Sliders size={13} />
                  <span>Manual Form Edit</span>
                </button>
              </div>
            </div>

            {/* AI Resume Upload Section */}
            {activeMode === "ai-parser" && (
              <div className="p-8 rounded-2xl bg-[#0c0d12] border border-white/[0.08] text-center shadow-xl">
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto mb-4">
                    <UploadCloud size={28} />
                  </div>

                  <h3 className="text-base font-semibold text-white">Upload Resume for AI Parsing</h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-6">
                    PDF files up to 10MB. We parse the text directly in memory — no document is uploaded or saved to disk.
                  </p>

                  {/* Drag/Drop Click Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-xl border-2 border-dashed border-white/15 hover:border-sky-400/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer mb-5"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,application/pdf"
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-medium">
                        <FileText size={16} />
                        <span>{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-medium text-zinc-300 block">
                          Click to choose PDF or drag & drop here
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-0.5 block">
                          Fast automatic resume parsing
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleParseResume}
                    disabled={!selectedFile || isParsing}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isParsing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Extracting Profile Details...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Extract with AI & Review Fields</span>
                      </>
                    )}
                  </button>

                  {/* Or Attach Direct Resume Link */}
                  <div className="mt-6 pt-5 border-t border-white/[0.08] text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText size={14} className="text-amber-400" />
                      <span className="text-xs font-semibold text-white">
                        Have your resume stored on Google Drive or Cloud?
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-2.5">
                      Paste the shareable link (Google Drive, Dropbox, Notion, portfolio). It will be attached to your candidate profile and referenced in your outreach.
                    </p>
                    <input
                      type="url"
                      value={formData.portfolio_links.resume_url || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio_links: { ...formData.portfolio_links, resume_url: e.target.value },
                        })
                      }
                      placeholder="https://drive.google.com/file/d/... or your hosted PDF URL"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Profile Review & Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {hasAiParsed && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-amber-400 shrink-0" />
                    <span>
                      <strong>AI Extracted Data Ready:</strong> Review the pre-populated values below, make any tweaks, and click Save Profile.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded">
                    Unsaved Review
                  </span>
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-sky-400" />
                    <h3 className="text-sm font-semibold text-white">1. Basic Information</h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Personal & Contact</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Hardik Singh"
                      className={`w-full px-3 py-2 rounded-xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none ${
                        validationErrors.full_name ? "border-red-500/80" : "border-white/10 focus:border-white/30"
                      }`}
                    />
                    {validationErrors.full_name && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.full_name}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. hardik@example.com"
                      className={`w-full px-3 py-2 rounded-xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none ${
                        validationErrors.email ? "border-red-500/80" : "border-white/10 focus:border-white/30"
                      }`}
                    />
                    {validationErrors.email && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Bengaluru, India or San Francisco, CA"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Headline / Professional Role <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="e.g. Associate Frontend Engineer | React & Next.js"
                      className={`w-full px-3 py-2 rounded-xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none ${
                        validationErrors.headline ? "border-red-500/80" : "border-white/10 focus:border-white/30"
                      }`}
                    />
                    {validationErrors.headline && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.headline}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Executive Summary / Intro</label>
                  <textarea
                    rows={3}
                    value={formData.introduction}
                    onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                    placeholder="Brief summary of experience, strengths, and engineering focus..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Section 2: Portfolio & Verification Links */}
              <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">2. Proof of Work & Links</h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Used in Email Sign-offs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <FileText size={13} className="text-amber-400" />
                      <span>Resume / CV Link</span>
                    </label>
                    <input
                      type="text"
                      value={formData.portfolio_links.resume_url || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio_links: { ...formData.portfolio_links, resume_url: e.target.value },
                        })
                      }
                      placeholder="https://drive.google.com/... or readcv.com/..."
                      className={`w-full px-3 py-2 rounded-xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none font-mono ${
                        validationErrors.resume_url ? "border-red-500/80" : "border-white/10 focus:border-white/30"
                      }`}
                    />
                    {validationErrors.resume_url && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.resume_url}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <Globe size={13} className="text-zinc-400" />
                      <span>GitHub Profile</span>
                    </label>
                    <input
                      type="text"
                      value={formData.portfolio_links.github}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio_links: { ...formData.portfolio_links, github: e.target.value },
                        })
                      }
                      placeholder="https://github.com/username"
                      className={`w-full px-3 py-2 rounded-xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none font-mono ${
                        validationErrors.github ? "border-red-500/80" : "border-white/10 focus:border-white/30"
                      }`}
                    />
                    {validationErrors.github && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.github}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <Globe size={13} className="text-sky-400" />
                      <span>LinkedIn Profile</span>
                    </label>
                    <input
                      type="text"
                      value={formData.portfolio_links.linkedin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio_links: { ...formData.portfolio_links, linkedin: e.target.value },
                        })
                      }
                      placeholder="https://linkedin.com/in/username"
                      className={`w-full px-3 py-2 rounded-xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none font-mono ${
                        validationErrors.linkedin ? "border-red-500/80" : "border-white/10 focus:border-white/30"
                      }`}
                    />
                    {validationErrors.linkedin && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.linkedin}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <Globe size={13} className="text-emerald-400" />
                      <span>Portfolio / Website</span>
                    </label>
                    <input
                      type="text"
                      value={formData.portfolio_links.portfolio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio_links: { ...formData.portfolio_links, portfolio: e.target.value },
                        })
                      }
                      placeholder="https://yourportfolio.dev"
                      className={`w-full px-3 py-2 rounded-xl bg-white/[0.03] border text-xs text-white placeholder-zinc-500 focus:outline-none font-mono ${
                        validationErrors.portfolio ? "border-red-500/80" : "border-white/10 focus:border-white/30"
                      }`}
                    />
                    {validationErrors.portfolio && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.portfolio}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Technical Skills */}
              <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">3. Technical Skills & Core Stack</h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{formData.skills.length} skills listed</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                    placeholder="Type a skill and press Enter (e.g. React, Next.js, TypeScript)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(skillInput)}
                    className="py-2 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-zinc-200"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="hover:text-red-400 text-zinc-400 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-xs text-zinc-500 italic">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Section 4: Experience & Projects */}
              <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-sky-400" />
                    <h3 className="text-sm font-semibold text-white">4. Work Experience & Notable Roles</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.projects_and_past_experience.map((exp, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">Experience #{index + 1}</span>
                        {formData.projects_and_past_experience.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer p-1"
                            title="Remove entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">Company Name</label>
                          <input
                            type="text"
                            value={exp.company_name}
                            onChange={(e) => updateExperience(index, "company_name", e.target.value)}
                            placeholder="e.g. Acme Labs"
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">Designation / Role</label>
                          <input
                            type="text"
                            value={exp.designation}
                            onChange={(e) => updateExperience(index, "designation", e.target.value)}
                            placeholder="e.g. Frontend Engineer"
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">Duration From (MM/YYYY)</label>
                          <input
                            type="text"
                            value={exp.from || ""}
                            onChange={(e) => updateExperience(index, "from", e.target.value)}
                            placeholder="01/2023"
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">Duration To (MM/YYYY)</label>
                          <input
                            type="text"
                            value={exp.to || ""}
                            onChange={(e) => updateExperience(index, "to", e.target.value)}
                            placeholder="Present"
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                          Key Responsibilities & Achievements
                        </label>
                        <textarea
                          rows={3}
                          value={exp.responsibilities_projects || ""}
                          onChange={(e) => updateExperience(index, "responsibilities_projects", e.target.value)}
                          placeholder="Built interactive web interfaces in React and Next.js, improved performance by 35%..."
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Education */}
              <div className="p-6 rounded-2xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">5. Education Details</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Education</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.education_details.map((edu, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 relative"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">University / College</label>
                        <input
                          type="text"
                          value={edu.university_text}
                          onChange={(e) => updateEducation(index, "university_text", e.target.value)}
                          placeholder="e.g. Delhi Technological University"
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">Degree & Major</label>
                        <input
                          type="text"
                          value={edu.degree_or_major_title}
                          onChange={(e) => updateEducation(index, "degree_or_major_title", e.target.value)}
                          placeholder="B.Tech Computer Science"
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Action Footer */}
              <div className="p-4 rounded-2xl bg-[#0c0d12] border border-white/[0.08] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
