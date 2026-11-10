import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";

  // Security Hardening: Prevent Open Redirect & Protocol-Relative URL attacks
  // Must start with a single '/' and cannot start with '//' or contain '://'
  const isSafeRelativePath =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("://");
  const next = isSafeRelativePath ? rawNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If user signed in with Google, capture provider_token and provider_refresh_token
      if (data?.session?.provider_token) {
        // Securely pass provider token to database or sync endpoint
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
          await fetch(`${backendUrl}/api/auth/sync-google-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({
              userId: data.session.user.id,
              email: data.session.user.email,
              providerToken: data.session.provider_token,
              providerRefreshToken: data.session.provider_refresh_token || null,
            }),
          });
        } catch (syncErr) {
          console.error("Token sync error (non-fatal):", syncErr);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to home with error parameter if code exchange fails
  return NextResponse.redirect(`${origin}/?auth_error=oauth_failed`);
}
