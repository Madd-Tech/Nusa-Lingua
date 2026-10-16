/** Cookie berisi kode bahasa aktif yang dipilih user di top bar. */
export const ACTIVE_LANGUAGE_COOKIE = "nl_active_lang";

export function setActiveLanguageCookie(code: string) {
  document.cookie = `${ACTIVE_LANGUAGE_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/** Pilih bahasa aktif: dari cookie jika masih diikuti, selain itu bahasa terbaru. */
export function resolveActiveLanguage<T extends { language: { code: string } }>(list: T[], cookieCode: string | undefined) {
  return list.find((l) => l.language.code === cookieCode) ?? list[0] ?? null;
}
