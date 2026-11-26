import { Metadata } from "next";
import { requirePageUser } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard – Uncold AI Outreach",
  description: "Manage your profile, verified contacts, and outreach campaigns.",
};

export default async function DashboardPage() {
  const user = await requirePageUser("/dashboard");
  return <DashboardClient user={user} />;
}
