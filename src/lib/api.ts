import { createClient } from "@/lib/supabase/client";

export async function getAuthHeaders(
  extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      return {
        ...extraHeaders,
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  } catch {
    // Fallback in test/non-browser environments
  }
  return { ...extraHeaders };
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const existingHeaders =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init.headers)
      ? Object.fromEntries(init.headers)
      : (init.headers as Record<string, string>) || {};

  const headers = await getAuthHeaders(existingHeaders);
  return fetch(input, { ...init, headers });
}
