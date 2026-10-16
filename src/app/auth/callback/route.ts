import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNext } from "@/lib/routes";

/**
 * Callback autentikasi.
 *  - OAuth Google & tautan email (PKCE): ?code=…
 *  - Template email berbasis token:      ?token_hash=…&type=signup|recovery|magiclink|invite|email_change|email
 *  - Error dari provider / Supabase:     ?error=…&error_code=…&error_description=…
 * Setelah sukses → redirect ke `next` (hanya path internal), default /beranda.
 * User baru tanpa username otomatis dialihkan middleware ke /onboarding.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = publicOrigin(request);
  const next = sanitizeNext(searchParams.get("next"));
  const toLogin = (error: string) =>
    NextResponse.redirect(new URL(`/masuk?error=${error}&next=${encodeURIComponent(next)}`, origin));

  // Error dari Google/Supabase (mis. user menekan "Batal" di layar izin Google).
  const providerError = searchParams.get("error");
  if (providerError) {
    const code = searchParams.get("error_code") ?? "";
    console.warn("[auth/callback] provider error:", providerError, code, searchParams.get("error_description"));
    if (providerError === "access_denied") return toLogin("oauth_cancelled");
    if (code === "otp_expired") return toLogin("link_expired");
    return toLogin("oauth");
  }

  const supabase = createClient();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    console.warn("[auth/callback] exchangeCodeForSession:", error.message);
    // Code verifier PKCE hilang: tautan dibuka di browser/perangkat lain dari tempat proses dimulai.
    if (/code verifier|both auth code and code verifier/i.test(error.message)) return toLogin("other_browser");
    return toLogin("oauth");
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/reset-password" : next, origin));
    console.warn("[auth/callback] verifyOtp:", error.message);
    return toLogin("link_expired");
  }

  return toLogin("callback");
}

/** Origin publik — menghormati x-forwarded-host di balik proxy/load balancer (produksi). */
function publicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    const proto = (request.headers.get("x-forwarded-proto") ?? "https").split(",")[0].trim();
    return `${proto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}
