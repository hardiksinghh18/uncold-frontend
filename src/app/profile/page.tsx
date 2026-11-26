import { requirePageUser } from "@/lib/supabase/server";
import { ProfileClient } from "./ProfileClient";

export const metadata = {
  title: "Candidate Profile & Resume | Uncold",
  description: "AI-powered resume parsing and manual candidate profile configuration",
};

export default async function ProfilePage() {
  const user = await requirePageUser("/profile");
  return <ProfileClient user={user} />;
}
