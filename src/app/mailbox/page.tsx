import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MailboxClient } from "./MailboxClient";

export const metadata = {
  title: "Mailbox Dispatcher | Uncold",
  description: "OAuth Gmail mailbox connection and cold outreach dispatcher",
};

export default async function MailboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/mailbox");
  }

  return <MailboxClient user={user} />;
}
