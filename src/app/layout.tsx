import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ReduxProvider } from "@/redux/ReduxProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uncold – Direct Gmail Outreach for Job Seekers",
  description:
    "Build your profile using your resume or manual portfolio, link your personal Gmail, and send hyper-tailored outreach directly to hiring managers with 1-click delivery.",
  keywords: [
    "uncold",
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
    title: "Uncold – Direct Gmail Outreach for Job Seekers",
    description:
      "Build your profile using your resume or manual portfolio, link your personal Gmail, and send hyper-tailored outreach directly to hiring managers with 1-click delivery.",
    type: "website",
  },
  icons: {
    icon: "/uncold_favicon.webp",
    shortcut: "/uncold_favicon.webp",
    apple: "/uncold_favicon.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <AuthProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-left"
              closeButton
              toastOptions={{
                className: "uncold-glass-toast",
                style: {
                  background: "rgba(14, 16, 23, 0.65)",
                  backdropFilter: "blur(22px) saturate(180%)",
                  WebkitBackdropFilter: "blur(22px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#f4f4f5",
                  fontSize: "12px",
                  borderRadius: "16px",
                  boxShadow:
                    "inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 20px 48px -12px rgba(0, 0, 0, 0.85)",
                },
              }}
            />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
