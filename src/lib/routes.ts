/** Prefix route di grup (app) — semuanya wajib login. */
export const APP_ROUTE_PREFIXES = [
  "/onboarding",
  "/beranda",
  "/belajar",
  "/ulasan",
  "/kamus",
  "/budaya",
  "/asisten",
  "/kontribusi",
  "/peringkat",
  "/profil",
] as const;

/** Route yang hanya untuk tamu. User login diarahkan ke /beranda. */
export const GUEST_ONLY_ROUTES = ["/masuk", "/daftar"] as const;

export const DEFAULT_AFTER_LOGIN = "/beranda";

export function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isAppRoute(pathname: string) {
  return matchesPrefix(pathname, APP_ROUTE_PREFIXES);
}

/**
 * Validasi parameter `next`: hanya path internal yang diawali "/".
 * Menolak "//evil.com", "/\evil.com", URL absolut, dan karakter kontrol.
 */
export function sanitizeNext(next: string | null | undefined, fallback: string = DEFAULT_AFTER_LOGIN) {
  if (!next || typeof next !== "string") return fallback;
  const value = next.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\\]/.test(value)) return fallback;
  try {
    const base = "http://internal.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/** Href untuk fitur: tamu → /masuk?next=path, user login → path. */
export function featureHref(path: string, isLoggedIn: boolean) {
  const safe = sanitizeNext(path);
  return isLoggedIn ? safe : `/masuk?next=${encodeURIComponent(safe)}`;
}
