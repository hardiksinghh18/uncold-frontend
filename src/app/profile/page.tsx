import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./ProfileClient";

export const metadata = {
  title: "Candidate Profile & Resume | Uncold",
  description: "AI-powered resume parsing and manual candidate profile configuration",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/profile");
  }

  return <ProfileClient user={user} />;
}
