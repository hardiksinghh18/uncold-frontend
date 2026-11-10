import { Metadata } from "next";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";

export const metadata: Metadata = {
  title: "Sign In - Uncold AI Outreach",
  description: "Sign in to your Uncold account to access your AI cold outreach campaigns.",
};

export default function SignInPage() {
  return <AuthSplitLayout mode="signin" />;
}
