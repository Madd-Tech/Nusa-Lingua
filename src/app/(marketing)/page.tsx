import Link from "next/link";
import Image from "next/image";
import { AnimatedMascot } from "@/components/landing/animated-mascot";
import {
  ArrowRight,
  BookA,
  BookOpen,
  Calendar,
  CheckCircle2,
  Flame,
  GraduationCap,
  Landmark,
  Languages,
  MapPin,
  MessageCircle,
  Mic,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureLink } from "@/components/layout/feature-link";
import { LanguageMap } from "@/components/landing/language-map";
import { TryQuestion } from "@/components/landing/try-question";
import { Faq } from "@/components/landing/faq";
import { getCurrentUser } from "@/lib/supabase/server";
import { getLandingStats, getRegionsWithLanguages } from "@/lib/queries/content";
import { cn, formatNumber } from "@/lib/utils";



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

  const [stats, regions] = await Promise.all([
    safe(() => getLandingStats(supabase)),
    safe(() => getRegionsWithLanguages(supabase)),
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
      {/* ═══ HERO ═══ */}
      <section className="landing-hero relative overflow-hidden pt-20 lg:pt-24">
        {/* Subtle leaf/botanical deco */}
        <div className="landing-hero-deco" aria-hidden="true" />
        <div className="container relative grid items-center gap-8 pb-12 md:pb-16 lg:grid-cols-2 lg:pb-20">
          <div className="space-y-6">
            <h1 className="text-4xl leading-[1.1] sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
              Jaga tutur kata leluhur{" "}
              <span className="landing-highlight">
                tetap hidup
              </span>{" "}
              di era digital.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Platform edukasi bahasa daerah Indonesia 5 menit sehari — lengkap dengan cerita sejarah & budaya, serta teman ngobrol AI yang fasih berbahasa daerah.
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {isLoggedIn ? (
                <Button asChild size="lg" className="landing-btn-primary">
                  <Link href="/beranda">
                    Lanjut Belajar <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="landing-btn-primary">
                    <Link href="/daftar">
                      Mulai Belajar Gratis <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="landing-btn-outline">
                    <Link href="/masuk">
                      Saya sudah punya akun
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          {/* Mascot Hero */}
          <div className="relative mx-auto flex w-full max-w-md items-center justify-center lg:max-w-none">
            <div className="landing-mascot-hero">
              <AnimatedMascot mascot="eyang-nusa" pose="melambai-jawa" size={360} />
            </div>
            {/* Floating badges */}
            <span className="landing-float-badge landing-float-badge-1">
              <Flame className="size-5 fill-accent text-accent" /> 7 hari berturut
            </span>
            <span className="landing-float-badge landing-float-badge-2">
              <Zap className="size-5 fill-secondary text-secondary" /> +10 XP
            </span>
            <span className="landing-float-badge landing-float-badge-3">
              {[0, 1, 2].map((i) => (
                <Star key={i} className="size-5 fill-secondary text-secondary" />
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* ═══ STATISTIK ═══ */}
      {statItems.length > 0 ? (
        <section aria-labelledby="statistik" className="landing-stats-bar">
          <h2 id="statistik" className="sr-only">
            Isi Nusa Lingua saat ini
          </h2>
          <dl className="container grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
            {statItems.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <Icon aria-hidden="true" className="size-6 text-white" />
                </span>
                <div className="flex flex-col-reverse">
                  <dt className="text-sm text-white/80">{label}</dt>
                  <dd className="text-2xl font-extrabold text-white">{formatNumber(value)}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* ═══ PETA BAHASA ═══ */}
      <section id="bahasa" className="landing-section scroll-mt-20">
        <div className="container">
          <div className="landing-section-header text-center">
            <Badge variant="secondary" className="landing-badge">
              <MapPin aria-hidden="true" className="size-4" /> Jelajahi Peta
            </Badge>
            <h2 className="text-3xl sm:text-4xl">
              Jelajahi Peta Bahasa Ibu di Seluruh Penjuru{" "}
              <span className="landing-highlight">Nusantara</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Ketuk penanda di peta untuk melihat bahasa dari setiap daerah, lalu mulai pelajari.
            </p>
          </div>
          <LanguageMap regions={regions ?? []} isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* ═══ FITUR UTAMA — gratis, menyenangkan, efektif ═══ */}
      <section id="fitur" className="landing-section-alt scroll-mt-20">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative flex items-center justify-center">
              <div className="landing-feature-card-mascot">
                <AnimatedMascot mascot="teh-euis" pose="mengangguk" size={300} />
              </div>
            </div>
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl">
                <span className="text-primary">gratis.</span>{" "}
                <span className="text-secondary-700 dark:text-secondary">menyenangkan.</span>{" "}
                <span className="text-accent">efektif.</span>
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Pembelajaran bahasa daerah tidak harus membosankan. Dengan metode interaktif ala game, lesson singkat 5 menit, dan AI yang menemani latihan — belajar jadi kebiasaan yang kamu nantikan setiap hari.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: GraduationCap, text: "Lesson interaktif" },
                  { icon: BookOpen, text: "6 tipe soal" },
                  { icon: MessageCircle, text: "Teman ngobrol AI" },
                  { icon: Trophy, text: "XP & papan peringkat" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 rounded-xl bg-white/80 p-3 dark:bg-card">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="size-5 text-primary" />
                    </span>
                    <span className="font-bold">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ETIKA BERTUTUR ═══ */}
      <section className="landing-section scroll-mt-20">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl">
                etika bertutur{" "}
                <span className="landing-highlight">warisan leluhur.</span>
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Setiap bahasa daerah memiliki tingkat tutur: ngoko, krama, bahasa halus. Nusa Lingua membantu kamu memahami konteks pemakaiannya — bukan sekadar menghafal kata, tapi merasakan sopan santun berbahasa.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="landing-feature-mini-card">
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/10">
                      <Flame className="size-6 text-accent" />
                    </span>
                    <div>
                      <p className="text-2xl font-extrabold">14 Hari</p>
                      <p className="text-sm text-muted-foreground">Target streak awal</p>
                    </div>
                  </div>
                </div>
                <div className="landing-feature-mini-card">
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                      <BookA className="size-6 text-primary" />
                    </span>
                    <div>
                      <p className="text-2xl font-extrabold">Krama</p>
                      <p className="text-sm text-muted-foreground">Tingkat tutur halus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="landing-etika-mascot">
                <AnimatedMascot mascot="eyang-nusa" pose="bercerita" size={320} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ KEBIASAAN BAIK ═══ */}
      <section className="landing-section-alt scroll-mt-20">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative flex items-center justify-center order-2 lg:order-1">
              {/* Calendar/Habit Card */}
              <div className="landing-habit-card">
                <div className="mb-4 flex items-center gap-3">
                  <Calendar className="size-6 text-primary" />
                  <span className="font-extrabold text-lg">Streak Mingguan</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, i) => (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{day}</span>
                      <span className={cn(
                        "flex size-10 items-center justify-center rounded-xl text-sm font-bold",
                        i < 5 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {i < 5 ? <CheckCircle2 className="size-5 text-primary" /> : (i + 1)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 p-3">
                  <Flame className="size-5 text-primary" />
                  <span className="text-sm font-bold text-primary">5 hari berturut! Terus semangat! 🔥</span>
                </div>
              </div>
            </div>
            <div className="space-y-5 order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl">
                bangun kebiasaan baik{" "}
                <span className="landing-highlight">setiap hari.</span>
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Sistem streak dan pengingat harian membantu kamu konsisten belajar. Cukup 5 menit sehari — kumpulkan XP, jaga streak, dan naik di papan peringkat mingguan bersama pengguna lain.
              </p>
              <ul className="space-y-3">
                {[
                  "Pengingat harian yang bisa diatur",
                  "XP & lencana untuk setiap pencapaian",
                  "Papan peringkat mingguan antar pengguna",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BICARA LANCAR ═══ */}
      <section className="landing-section scroll-mt-20">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl">
                bicara lancar tanpa{" "}
                <span className="landing-highlight">khawatir salah.</span>
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Pilih persona penutur asli, lalu latihan bercakap tanpa malu salah. Asisten AI membalas dalam bahasa daerah lengkap dengan terjemahan dan koreksi yang ramah.
              </p>
              <Button asChild size="lg" className="landing-btn-primary">
                <FeatureLink path="/asisten" isLoggedIn={isLoggedIn}>
                  Mulai Percakapan <ArrowRight aria-hidden="true" />
                </FeatureLink>
              </Button>
            </div>
            <div className="relative flex items-center justify-center">
              {/* Chat Preview Card */}
              <div className="landing-chat-preview">
                <div className="mb-4 flex items-center gap-3">
                  <Image
                    src="/media/maskot/ai-menyapa.png"
                    alt="Mbah Darmo AI"
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                  <div>
                    <p className="font-extrabold">Mbah Darmo</p>
                    <p className="text-xs text-muted-foreground">Bahasa Jawa</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <p className="max-w-[85%] rounded-2xl rounded-bl-lg bg-primary/10 px-4 py-2.5 text-sm">
                      Sugeng enjing, Nak! Piye kabare dina iki? 😊
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-lg bg-primary px-4 py-2.5 text-sm text-white">
                      Sugeng enjing, Mbah! Kabar apik.
                    </p>
                  </div>
                  <div className="flex justify-start">
                    <p className="max-w-[85%] rounded-2xl rounded-bl-lg bg-primary/10 px-4 py-2.5 text-sm">
                      Pinter! Wis bener, Nak. Arep sinau apa dina iki? 🌟
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 p-3">
                  <Mic className="size-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Ketik atau rekam suaramu...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COBA SATU SOAL ═══ */}
      <section id="coba" aria-labelledby="coba-heading" className="landing-section-alt scroll-mt-20">
        <div className="container">
          <div className="landing-section-header text-center">
            <Badge variant="secondary" className="landing-badge">
              <Sparkles aria-hidden="true" className="size-4" /> Coba Langsung
            </Badge>
            <h2 id="coba-heading" className="text-3xl sm:text-4xl">
              Uji kemampuan kosakata nusantara dalam{" "}
              <span className="landing-highlight">satu soal mudah.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Tanpa daftar. Begini rasanya belajar di Nusa Lingua.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <TryQuestion isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="landing-section scroll-mt-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="landing-section-header text-center">
              <h2 className="text-3xl sm:text-4xl">Pertanyaan yang sering diajukan</h2>
            </div>
            <div className="landing-faq-wrapper">
              <Faq />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA PENUTUP ═══ */}
      <section className="landing-cta-section">
        <div className="container relative mx-auto max-w-4xl">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-5 text-center lg:text-left">
              <h2 className="text-3xl text-white sm:text-4xl">
                rawat bahasa ibu bersama{" "}
                <span className="text-secondary">nusa lingua.</span>
              </h2>
              <p className="text-white/85">
                Gabung bersama ribuan penjaga bahasa daerah. Mulai lesson pertamamu hari ini — cukup lima menit.
              </p>
              <Button asChild size="lg" variant="secondary" className="landing-btn-cta">
                <Link href={isLoggedIn ? "/beranda" : "/daftar"}>
                  {isLoggedIn ? "Lanjut Belajar" : "Mulai Belajar Gratis"} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <AnimatedMascot mascot="teh-euis" pose="merayakan" size={280} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
