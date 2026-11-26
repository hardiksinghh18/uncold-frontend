import { Metadata } from "next";
import { requirePageUser } from "@/lib/supabase/server";
import { HistoryClient } from "./HistoryClient";

export const metadata: Metadata = {
  title: "Outreach History – Uncold AI",
  description: "Full outreach email history, delivery status, opens, and replies with search and filters.",
};

export default async function HistoryPage() {
  const user = await requirePageUser("/history");
  return <HistoryClient user={user} />;
}
