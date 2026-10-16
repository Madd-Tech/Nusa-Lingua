import { SITE_URL } from "@/lib/env";

/**
 * Origin untuk redirect OAuth & email.
 * Di browser SELALU memakai origin halaman saat ini: cookie PKCE (code verifier) disimpan
 * di origin ini, jadi callback harus kembali ke origin yang sama agar exchange code berhasil.
 * NEXT_PUBLIC_SITE_URL hanya dipakai bila tidak ada `window` (mis. di server).
 */
export function siteOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return SITE_URL.replace(/\/$/, "");
}
