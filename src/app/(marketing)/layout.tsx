import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { getCurrentUser } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

const FEATURE_LINKS = [
  ["#fitur", "Belajar bertahap"],
  ["#fitur", "Kamus & tingkat tutur"],
  ["#budaya", "Sejarah & budaya"],
  ["#asisten", "Teman ngobrol AI"],
  ["#fitur", "Kontribusi komunitas"],
] as const;

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getCurrentUser();
  let navUser: { name: string | null; avatarUrl: string | null } | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, username, avatar_url").eq("id", user.id).maybeSingle();
    navUser = {
      name: data?.full_name ?? data?.username ?? (user.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: data?.avatar_url ?? null,
    };
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#konten"
        className="sr-only z-[60] rounded-xl bg-card px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Lewati ke konten
      </a>
      <LandingNavbar user={navUser} />
      <main id="konten" className="-mt-16 flex-1">
        {children}
      </main>
      <footer className="border-t-2 bg-card">
        <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-2">
            <Logo />
            <p className="max-w-sm text-sm text-muted-foreground">{SITE.description}</p>
          </div>
          <nav aria-label="Fitur" className="space-y-2 text-sm">
            <p className="font-extrabold">Fitur</p>
            <ul className="space-y-2">
              {FEATURE_LINKS.map(([href, label]) => (
                <li key={label}>
                  <a href={href} className="text-muted-foreground hover:text-foreground hover:underline">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-2 text-sm">
            <p className="font-extrabold">Tentang tim</p>
            <p className="text-muted-foreground">
              Dibuat oleh {SITE.team} untuk {SITE.competition}, sebagai upaya kecil melestarikan bahasa daerah Nusantara.
            </p>
            <ul className="space-y-2 pt-2">
              <li>
                <Link href="/ketentuan" className="text-muted-foreground hover:text-foreground hover:underline">
                  Ketentuan & privasi
                </Link>
              </li>
              <li>
                <Link href="/masuk" className="text-muted-foreground hover:text-foreground hover:underline">
                  Masuk
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t-2">
          <p className="container py-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
