import { Metadata } from "next";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";

export const metadata: Metadata = {
  title: "Sign Up - Uncold AI Outreach",
  description: "Create an account on Uncold to start generating hyper-tailored outreach that lands job interviews.",
};

export default function SignUpPage() {
  return <AuthSplitLayout mode="signup" />;
}
