import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { sanitizeNext } from "@/lib/routes";
import { getOAuthProviders } from "@/lib/supabase/auth-settings";

export const metadata: Metadata = { title: "Masuk" };


const CALLBACK_ERRORS: Record<string, string> = {
  callback: "Tautan masuk tidak valid. Silakan coba lagi.",
  oauth: "Gagal masuk dengan Google. Silakan coba lagi.",
  oauth_cancelled: "Masuk dengan Google dibatalkan. Kamu bisa mencoba lagi kapan saja.",
  link_expired: "Tautan sudah kedaluwarsa atau pernah dipakai. Silakan minta tautan baru.",
  other_browser:
    "Proses masuk harus diselesaikan di browser yang sama tempat kamu memulainya. Silakan ulangi dari browser ini.",
};

export default async function MasukPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const next = sanitizeNext(searchParams.next);
  const errorMessage = searchParams.error ? CALLBACK_ERRORS[searchParams.error] ?? CALLBACK_ERRORS.callback : null;
  const providers = await getOAuthProviders();

  return (
    <div className="space-y-6">
      {searchParams.next && !errorMessage ? (
        <p role="status" className="flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold">
          <LockKeyhole aria-hidden="true" className="size-5 shrink-0 text-primary" />
          Silakan masuk untuk melanjutkan.
        </p>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-3xl">
          Masuk & <span className="landing-highlight">lanjut belajar</span>
        </h1>
        <p className="text-muted-foreground">Lanjutkan perjalanan belajarmu hari ini.</p>
      </div>
      {errorMessage ? (
        <p role="alert" className="rounded-2xl border-2 border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger-700 dark:text-danger">
          {errorMessage}
        </p>
      ) : null}
      <LoginForm next={next} googleEnabled={providers.google} />
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href={searchParams.next ? `/daftar?next=${encodeURIComponent(next)}` : "/daftar"}
          className="font-bold text-primary-700 hover:underline dark:text-primary"
        >
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
