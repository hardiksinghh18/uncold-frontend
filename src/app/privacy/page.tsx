import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – Uncold",
  description: "Privacy Policy and Google API Limited Use disclosure for Uncold.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#07080a] text-zinc-200 px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/uncold_logo.webp"
              alt="Uncold"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-semibold text-base text-white">Uncold</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400">
            Last updated: November 26, 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-300">
          <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
          <p>
            When you sign in to Uncold, we collect your name, email address, and profile
            information you choose to provide (such as resume text, skills, experience,
            and portfolio links) solely to personalize and send your job outreach.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-300">
          <h2 className="text-lg font-semibold text-white">2. How We Use Google &amp; Gmail Data</h2>
          <p>
            Uncold connects to your Google account via OAuth 2.0 only with your explicit
            permission to send cold outreach emails from your Gmail address and check
            for replies on threads initiated through Uncold. We never sell your data,
            never read unrelated personal inbox emails, and encrypt stored OAuth tokens
            at rest using AES-256-GCM.
          </p>
          <p>
            Uncold&apos;s use and transfer of information received from Google APIs adheres
            to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 underline underline-offset-2"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-zinc-300">
          <h2 className="text-lg font-semibold text-white">3. Data Deletion &amp; Contact</h2>
          <p>
            You can revoke Uncold&apos;s access to your Google account at any time from your{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 underline underline-offset-2"
            >
              Google Account Permissions
            </a>{" "}
            page. For data deletion requests or privacy questions, contact the developer
            through the support email listed on our Google OAuth consent screen.
          </p>
        </section>
      </div>
    </main>
  );
}
