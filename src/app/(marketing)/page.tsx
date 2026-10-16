import Link from "next/link";
import {
  ArrowRight,
  BookA,
  Flame,
  GraduationCap,
  HandHeart,
  Landmark,
  Languages,
  MapPin,
  MessagesSquare,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { FeatureLink } from "@/components/layout/feature-link";
import { CATEGORY_STYLES, type FeatureCategory } from "@/components/layout/nav-items";
import { ArticleCard } from "@/components/culture/article-card";
import { HeroMockup } from "@/components/landing/hero-mockup";
import { LanguageMap } from "@/components/landing/language-map";
import { TryQuestion } from "@/components/landing/try-question";
import { AiTeaser } from "@/components/landing/ai-teaser";
import { Faq } from "@/components/landing/faq";
import { getCurrentUser } from "@/lib/supabase/server";
import { getLandingStats, getRegionsWithLanguages } from "@/lib/queries/content";
import { getArticles } from "@/lib/queries/culture";
import { cn, formatNumber } from "@/lib/utils";

const FEATURES: {
  category: FeatureCategory;
  icon: typeof GraduationCap;
  title: string;
  description: string;
  path: string;
}[] = [
  {
    category: "belajar",
    icon: GraduationCap,
    title: "Belajar Bertahap",
    description: "Unit dan lesson tersusun dari pemula sampai mahir, dengan 6 tipe soal: pilihan ganda, terjemahan, menyimak, pasangkan, susun kalimat, dan bicara.",
    path: "/belajar",
  },
  {
    category: "progres",
    icon: BookA,
    title: "Kamus & Tingkat Tutur",
    description: "Setiap kata dilengkapi audio, contoh kalimat, dan tingkat tutur seperti ngoko atau krama — supaya tahu kapan memakainya.",
    path: "/kamus",
  },
  {
    category: "budaya",
    icon: Landmark,
    title: "Sejarah & Budaya",
    description: "Artikel per daerah tentang sejarah, cerita rakyat, tarian, kuliner, pakaian adat, hingga aksara.",
    path: "/budaya",
  },
  {
    category: "asisten",
    icon: MessagesSquare,
    title: "Teman Ngobrol AI",
    description: "Latihan bercakap dengan persona penutur asli yang sabar dan siap mengoreksi.",
    path: "/asisten",
  },
  {
    category: "komunitas",
    icon: HandHeart,
    title: "Kontribusi Komunitas",
    description: "Usulkan kosakata beserta rekaman suaramu. Setiap usulan ditinjau moderator.",
    path: "/kontribusi",
  },
];

const STEPS = [
  { icon: Languages, title: "Pilih bahasa", body: "Mulai dari bahasa daerah asalmu, atau jelajahi bahasa dari pulau lain." },
  { icon: Timer, title: "Belajar 5 menit/hari", body: "Lesson singkat dengan soal beragam. Kata yang hampir lupa muncul lagi di Ulasan." },
  { icon: Flame, title: "Kumpulkan XP & jaga streak", body: "Raih bintang, lencana, dan naik di papan peringkat mingguan." },
];

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export default async function LandingPage() {
  const { supabase, user } = await getCurrentUser();
  const isLoggedIn = !!user;

  const [stats, regions, articles] = await Promise.all([
    safe(() => getLandingStats(supabase)),
    safe(() => getRegionsWithLanguages(supabase)),
    safe(() => getArticles(supabase, { limit: 3 })),
  ]);

  // Angka statistik dihitung dari database (count). Jika gagal dimuat, strip disembunyikan.
  const statItems =
    stats && Object.values(stats).some((v) => v > 0)
    ? [
        { label: "Bahasa aktif", value: stats.languages, icon: Languages },
        { label: "Kosakata", value: stats.vocabularies, icon: BookA },
        { label: "Artikel budaya", value: stats.articles, icon: Landmark },
        { label: "Daerah", value: stats.regions, icon: MapPin },
      ]
    : [];

  return (
    <>
      {/* b. HERO */}
      <section className="relative overflow-hidden border-b-2 bg-gradient-to-b from-secondary/15 via-background to-background pt-16">
        <BatikPattern variant="kawung" size={56} color="rgb(var(--primary))" opacity={0.06} />
        <div className="container relative grid items-center gap-8 py-12 md:py-16 lg:grid-cols-2 lg:py-20">
          <div className="space-y-6">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              <Sparkles aria-hidden="true" /> Bahasa daerah · Budaya · AI
            </Badge>
            <h1 className="text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Kenali Indonesia lewat{" "}
              <span className="relative whitespace-nowrap text-primary">
                bahasanya
                <svg aria-hidden="true" viewBox="0 0 300 16" className="absolute -bottom-2 left-0 h-3 w-full text-secondary" preserveAspectRatio="none">
                  <path d="M2 12C60 3 160 1 298 9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
              .
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Belajar bahasa daerah cukup 5 menit sehari — lengkap dengan cerita sejarah & budaya, serta teman ngobrol AI yang fasih
              berbahasa daerah.
            </p>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {isLoggedIn ? (
                <Button asChild size="lg">
                  <Link href="/beranda">
                    Lanjut Belajar <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/daftar">
                      Mulai Belajar Gratis <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <Link href="/masuk" className="font-bold text-primary-700 underline-offset-4 hover:underline dark:text-primary">
                    Saya sudah punya akun
                  </Link>
                </>
              )}
            </div>
          </div>
          <HeroMockup />
        </div>
      </section>

      {/* c. STATISTIK */}
      {statItems.length > 0 ? (
        <section aria-labelledby="statistik" className="border-b-2 bg-card">
          <h2 id="statistik" className="sr-only">
            Isi Nusa Lingua saat ini
          </h2>
          <dl className="container grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
            {statItems.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12">
                  <Icon aria-hidden="true" className="size-6 text-primary" />
                </span>
                <div className="flex flex-col-reverse">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-2xl font-extrabold">{formatNumber(value)}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* d. FITUR */}
      <section id="fitur" className="container scroll-mt-20 py-16 lg:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl">Semua yang kamu butuhkan untuk fasih</h2>
          <p className="mt-3 text-muted-foreground">Lima pilar belajar yang saling melengkapi.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((f, i) => {
            const style = CATEGORY_STYLES[f.category];
            const Icon = f.icon;
            return (
              <li
                key={f.title}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-3xl border-2 bg-card p-6 shadow-soft lg:col-span-2",
                  i === 3 && "lg:col-start-2",
                )}
              >
                <BatikPattern variant={i % 2 ? "parang" : "kawung"} className={cn("opacity-[0.05]", style.text)} />
                <span className={cn("relative mb-4 flex size-14 items-center justify-center rounded-2xl", style.bg)}>
                  <Icon aria-hidden="true" className={cn("size-7", style.text)} strokeWidth={2.25} />
                </span>
                <h3 className="relative text-xl">{f.title}</h3>
                <p className="relative mt-2 flex-1 text-muted-foreground">{f.description}</p>
                <FeatureLink
                  path={f.path}
                  isLoggedIn={isLoggedIn}
                  className="relative mt-5 inline-flex items-center gap-1.5 self-start rounded-lg font-extrabold underline-offset-4 hover:underline"
                  aria-label={`Coba ${f.title}`}
                >
                  Coba <ArrowRight aria-hidden="true" className={cn("size-4", style.text)} />
                </FeatureLink>
              </li>
            );
          })}
        </ul>
      </section>

      {/* e. PETA BAHASA */}
      <section id="bahasa" className="relative scroll-mt-20 overflow-hidden border-y-2 bg-card py-16 lg:py-20">
        <BatikPattern variant="parang" color="rgb(var(--primary))" opacity={0.04} />
        <div className="container relative">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl">Peta Bahasa Nusantara</h2>
            <p className="mt-2 text-muted-foreground">
              Ketuk penanda di peta untuk melihat bahasa dari setiap daerah, lalu mulai pelajari.
            </p>
          </div>
          <LanguageMap regions={regions ?? []} isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* f. COBA SATU SOAL */}
      <section aria-labelledby="coba-heading" className="container py-16 lg:py-20">
        <div className="mb-8 max-w-2xl">
          <h2 id="coba-heading" className="text-3xl sm:text-4xl">
            Coba satu soal, sekarang juga
          </h2>
          <p className="mt-2 text-muted-foreground">Tanpa daftar. Begini rasanya belajar di Nusa Lingua.</p>
        </div>
        <TryQuestion isLoggedIn={isLoggedIn} />
      </section>

      {/* g. CARA KERJA */}
      <section id="cara-kerja" className="scroll-mt-20 border-y-2 bg-card py-16 lg:py-20">
        <div className="container">
          <h2 className="mb-10 text-center text-3xl sm:text-4xl">Cara kerjanya</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex flex-col items-start gap-4 rounded-3xl border-2 bg-background p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl border-b-4 border-secondary-700 bg-secondary-600 text-xl font-extrabold text-ink">
                    {i + 1}
                  </span>
                  <s.icon aria-hidden="true" className="size-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg">{s.title}</h3>
                  <p className="mt-1 text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* h. TEASER BUDAYA */}
      <section id="budaya" className="container scroll-mt-20 py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl">Cerita dari Nusantara</h2>
            <p className="mt-2 text-muted-foreground">Bahasa hidup bersama budayanya. Baca artikel terbaru kami.</p>
          </div>
          <Button asChild variant="budaya">
            <FeatureLink path="/budaya" isLoggedIn={isLoggedIn}>
              Jelajahi budaya
            </FeatureLink>
          </Button>
        </div>
        {articles && articles.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-3">
            {articles.map((a) => (
              <li key={a.id}>
                <ArticleCard article={a} featureLink={{ isLoggedIn }} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border-2 border-dashed p-6 text-center text-muted-foreground">
            Artikel budaya pertama sedang ditulis. Nantikan, ya!
          </p>
        )}
      </section>

      {/* i. TEASER ASISTEN AI */}
      <section id="asisten" className="scroll-mt-20 border-y-2 bg-card py-16 lg:py-20">
        <div className="container">
          <AiTeaser isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* j. FAQ */}
      <section id="faq" className="container scroll-mt-20 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl sm:text-4xl">Pertanyaan yang sering diajukan</h2>
          <Faq />
        </div>
      </section>

      {/* k. CTA PENUTUP */}
      <section className="relative overflow-hidden bg-primary-600 py-16 text-white lg:py-20">
        <BatikPattern variant="kawung" size={64} color="#ffffff" opacity={0.1} />
        <div className="container relative mx-auto max-w-2xl space-y-5 text-center">
          <Trophy aria-hidden="true" className="mx-auto size-12 text-secondary" />
          <h2 className="text-3xl sm:text-4xl">Bahasa daerah tetap hidup kalau dipakai.</h2>
          <p className="text-white/90">Mulai lesson pertamamu hari ini — cukup lima menit.</p>
          <Button asChild size="lg" variant="secondary">
            <Link href={isLoggedIn ? "/beranda" : "/daftar"}>
              {isLoggedIn ? "Lanjut Belajar" : "Mulai Belajar Gratis"} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
