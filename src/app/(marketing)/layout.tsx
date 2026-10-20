import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/layout/logo";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { getCurrentUser } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

const NAV_SECTIONS = [
  {
    title: "Fitur Utama",
    links: [
      ["#fitur", "Belajar Bertahap"],
      ["/kamus", "Kamus & Tingkat Tutur"],
      ["#bahasa", "Peta Bahasa"],
      ["/asisten", "Teman Ngobrol AI"],
    ],
  },
  {
    title: "Komunitas",
    links: [
      ["/kontribusi", "Kontribusi"],
      ["#budaya", "Sejarah & Budaya"],
      ["#faq", "FAQ"],
    ],
  },
  {
    title: "Tentang",
    links: [
      ["/ketentuan", "Ketentuan & Privasi"],
      ["/masuk", "Masuk"],
      ["/daftar", "Daftar"],
    ],
  },
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

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          {/* Brand */}
          <div className="landing-footer-brand">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Dibuat oleh {SITE.team} untuk {SITE.competition}
            </p>
          </div>

          {/* Nav Sections */}
          {NAV_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title} className="landing-footer-nav space-y-2">
              <p>{section.title}</p>
              <ul className="space-y-2">
                {section.links.map(([href, label]) => (
                  <li key={label}>
                    {href.startsWith("#") ? (
                      <a href={href}>{label}</a>
                    ) : (
                      <Link href={href}>{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="landing-footer-bar">
          <p className="container py-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. Hak cipta dilindungi.
            <span className="mt-1 block">
              Materi belajar Bahasa Jawa &amp; Sunda diadaptasi dari{" "}
              <a
                href="https://github.com/IndoNLP/nusax"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                NusaX
              </a>{" "}
              (EACL 2023) berlisensi{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                CC BY-SA 4.0
              </a>
              ; disesuaikan untuk Nusa Lingua.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
