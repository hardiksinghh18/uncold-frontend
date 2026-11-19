import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard – Uncold AI Outreach",
  description: "Manage your profile, verified contacts, and outreach campaigns.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server-side authentication check
  if (!user) {
    redirect("/sign-in?redirect=/dashboard");
  }

  return <DashboardClient user={user} />;
}
