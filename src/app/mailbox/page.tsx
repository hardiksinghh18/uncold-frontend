import { requirePageUser } from "@/lib/supabase/server";
import { MailboxClient } from "./MailboxClient";

export const metadata = {
  title: "Mailbox Dispatcher | Uncold",
  description: "OAuth Gmail mailbox connection and cold outreach dispatcher",
};

export default async function MailboxPage() {
  const user = await requirePageUser("/mailbox");
  return <MailboxClient user={user} />;
}
