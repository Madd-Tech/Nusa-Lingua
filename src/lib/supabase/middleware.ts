import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import { DEFAULT_AFTER_LOGIN, GUEST_ONLY_ROUTES, isAppRoute, matchesPrefix } from "@/lib/routes";

/**
 * - Refresh session di setiap request.
 * - Tamu membuka route (app)           → /masuk?next=<path-asal>
 * - User login membuka /masuk, /daftar → /beranda
 * - User login, profiles.username null → /onboarding?next=<path-asal>
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        cacheHeaders = headers ?? {};
        Object.entries(cacheHeaders).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // PENTING: jangan sisipkan logika lain antara createServerClient dan getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    const [path, query] = target.split("?");
    url.pathname = path;
    url.search = query ? `?${query}` : "";
    const redirect = NextResponse.redirect(url);
    // Bawa cookie session yang mungkin baru saja di-refresh.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    Object.entries(cacheHeaders).forEach(([k, v]) => redirect.headers.set(k, v));
    return redirect;
  };

  // Jika `redirectTo` tidak ada di daftar Redirect URLs Supabase, Supabase kembali ke Site URL
  // (mis. "/?code=…"). Teruskan ke /auth/callback agar code tetap ditukar menjadi sesi.
  if (pathname === "/" && (request.nextUrl.searchParams.has("code") || request.nextUrl.searchParams.has("error_description"))) {
    return redirectTo(`/auth/callback${search}`);
  }

  const appRoute = isAppRoute(pathname);

  if (!user && appRoute) {
    return redirectTo(`/masuk?next=${encodeURIComponent(pathname + search)}`);
  }

  if (user && matchesPrefix(pathname, GUEST_ONLY_ROUTES)) {
    return redirectTo(DEFAULT_AFTER_LOGIN);
  }

  if (user && appRoute && !matchesPrefix(pathname, ["/onboarding"])) {
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
    if (!profile?.username) {
      return redirectTo(`/onboarding?next=${encodeURIComponent(pathname + search)}`);
    }
  }

  return response;
}
