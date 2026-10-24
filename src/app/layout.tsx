import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ColdForge AI – Direct Gmail Outreach for Job Seekers",
  description:
    "Build your profile using your resume or manual portfolio, link your personal Gmail, and send hyper-tailored cold outreach directly to hiring managers with 1-click delivery.",
  keywords: [
    "cold email",
    "job search",
    "cold outreach",
    "gemini api",
    "gmail integration",
    "resume builder",
    "proof of work",
    "career",
  ],
  openGraph: {
    title: "ColdForge AI – Direct Gmail Outreach for Job Seekers",
    description:
      "Build your profile using your resume or manual portfolio, link your personal Gmail, and send hyper-tailored cold outreach directly to hiring managers with 1-click delivery.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
