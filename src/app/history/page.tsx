import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HistoryClient } from "./HistoryClient";

export const metadata: Metadata = {
  title: "Outreach History – Uncold AI",
  description: "Full outreach email history, delivery status, opens, and replies with search and filters.",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server-side authentication check
  if (!user) {
    redirect("/sign-in?redirect=/history");
  }

  return <HistoryClient user={user} />;
}
