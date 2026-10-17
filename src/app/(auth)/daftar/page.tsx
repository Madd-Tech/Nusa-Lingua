import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { sanitizeNext } from "@/lib/routes";
import { getOAuthProviders } from "@/lib/supabase/auth-settings";

export const metadata: Metadata = { title: "Daftar" };

export default async function DaftarPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = sanitizeNext(searchParams.next);
  const providers = await getOAuthProviders();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl">
          Buat akun, mulai <span className="landing-highlight">menjaga bahasa daerah</span>
        </h1>
        <p className="text-muted-foreground">Mulai belajar bahasa daerah dalam hitungan menit.</p>
      </div>
      <RegisterForm next={next} googleEnabled={providers.google} />
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href={searchParams.next ? `/masuk?next=${encodeURIComponent(next)}` : "/masuk"}
          className="font-bold text-primary-700 hover:underline dark:text-primary"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
