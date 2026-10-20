"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleButton } from "@/components/auth/google-button";
import { createClient } from "@/lib/supabase/client";
import { GOOGLE_CLIENT_ID } from "@/lib/env";
import { sanitizeNext } from "@/lib/routes";
import { authErrorMessage } from "@/lib/validation";

const GSI_SRC = "https://accounts.google.com/gsi/client";
const LOAD_TIMEOUT_MS = 8000;

let gsiPromise: Promise<void> | null = null;

/** Muat skrip Google Identity Services sekali per halaman. */
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  gsiPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gsiPromise = null;
      script.remove();
      reject(new Error("Gagal memuat Google Identity Services"));
    };
    document.head.appendChild(script);
  });
  return gsiPromise;
}

/** Nonce acak + hash SHA-256 (hash dikirim ke Google, nilai asli ke Supabase). */
async function createNonce() {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hashed };
}

/**
 * Tombol resmi "Login dengan Google" (Google Identity Services, mode popup).
 *
 * Berbeda dengan alur redirect OAuth, login terjadi langsung di domain website ini, sehingga
 * layar pilih akun Google menampilkan domain Nusa Lingua — bukan `<ref>.supabase.co`.
 * ID token dari Google ditukar menjadi sesi dengan `supabase.auth.signInWithIdToken`.
 *
 * Fallback otomatis ke tombol redirect OAuth bila: NEXT_PUBLIC_GOOGLE_CLIENT_ID kosong,
 * skrip Google gagal dimuat (diblokir/offline), atau halaman tidak di secure context.
 */
export function GoogleSignIn({
  next,
  mode,
  enabled = null,
}: {
  next: string;
  mode: "signin" | "signup";
  /** Status provider Google di Supabase (false = belum diaktifkan). */
  enabled?: boolean | null;
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef(next);
  nextRef.current = next;
  const [status, setStatus] = useState<"loading" | "ready" | "fallback" | "signing-in">(
    GOOGLE_CLIENT_ID ? "loading" : "fallback",
  );

  const label = mode === "signup" ? "Daftar dengan Google" : "Masuk dengan Google";

  const handleCredential = useCallback(
    async (credential: string, rawNonce: string) => {
      setStatus("signing-in");
      const { error } = await createClient().auth.signInWithIdToken({
        provider: "google",
        token: credential,
        nonce: rawNonce,
      });
      if (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "[GoogleSignIn] signInWithIdToken gagal:",
            error.message,
            "\nCek: Client ID ini ada di Supabase → Auth → Providers → Google → Client IDs, dan 'Skip nonce checks' tidak perlu dinyalakan.",
          );
        }
        toast.error(authErrorMessage(error.message));
        setStatus("ready");
        return;
      }
      toast.success(mode === "signup" ? "Akun Google tersambung. Selamat datang!" : "Selamat datang kembali!");
      // User baru tanpa username dialihkan middleware ke /onboarding.
      router.replace(sanitizeNext(nextRef.current));
      router.refresh();
    },
    [mode, router],
  );

  useEffect(() => {
    if (enabled === false || !GOOGLE_CLIENT_ID) return;
    if (!window.isSecureContext || !crypto?.subtle) {
      // Google Identity Services & crypto.subtle butuh HTTPS atau localhost.
      setStatus("fallback");
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => !cancelled && setStatus((s) => (s === "loading" ? "fallback" : s)), LOAD_TIMEOUT_MS);

    const render = async () => {
      try {
        await loadGsi();
        const { raw, hashed } = await createNonce();
        if (cancelled || !buttonRef.current || !wrapperRef.current || !window.google) return;
        const gis = window.google.accounts.id;
        gis.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => void handleCredential(res.credential, raw),
          nonce: hashed,
          context: mode === "signup" ? "signup" : "signin",
          ux_mode: "popup",
          itp_support: true,
          use_fedcm_for_button: true,
        });
        buttonRef.current.innerHTML = "";
        gis.renderButton(buttonRef.current, {
          type: "standard",
          theme: resolvedTheme === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: mode === "signup" ? "signup_with" : "signin_with",
          logo_alignment: "center",
          locale: "id",
          width: Math.max(200, Math.min(400, Math.floor(wrapperRef.current.clientWidth))),
        });
        window.clearTimeout(timeout);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("fallback");
      }
    };
    void render();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [enabled, handleCredential, mode, resolvedTheme]);

  // Belum diaktifkan di Supabase, atau GIS tidak tersedia → tombol redirect OAuth.
  if (enabled === false || status === "fallback") {
    return <GoogleButton next={next} label={label} enabled={enabled} />;
  }

  return (
    <div ref={wrapperRef} className="relative flex min-h-11 w-full flex-col items-center justify-center" aria-busy={status !== "ready"}>
      {status === "loading" ? (
        <Skeleton className="absolute inset-0 h-11 rounded-full" />
      ) : null}
      {status === "signing-in" ? (
        <p role="status" className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-card/90 text-sm font-bold">
          Menghubungkan akun Google…
        </p>
      ) : null}
      {/* Tombol dirender oleh Google ke dalam elemen ini (iframe, sudah aksesibel & berlabel). */}
      <div ref={buttonRef} className="flex w-full justify-center [color-scheme:normal]" />
    </div>
  );
}
