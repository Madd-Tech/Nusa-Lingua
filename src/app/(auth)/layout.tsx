import { Flame, Star, Zap } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AnimatedMascot } from "@/components/landing/animated-mascot";

/**
 * Layout auth (masuk/daftar/lupa & reset password) dengan nuansa landing page:
 * panel kiri = hero gradient hijau + maskot + badge melayang + kutipan dalam kartu landing,
 * panel kanan = form dalam kartu "auth-card" (rounded-3xl, border-b-4, shadow-lg).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell grid min-h-dvh lg:grid-cols-2">
      {/* Panel kiri — nuansa hero landing (desktop) */}
      <aside className="auth-hero relative hidden overflow-hidden border-r-2 lg:flex lg:flex-col lg:justify-between lg:p-10">
        {/* Dekorasi radial gradient, sama seperti hero landing */}
        <div className="landing-hero-deco" aria-hidden="true" />

        <Logo className="relative" />

        {/* Maskot sapa + badge melayang */}
        <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
          <div className="landing-mascot-hero">
            <AnimatedMascot mascot="eyang-nusa" pose="melambai-jawa" size={300} />
          </div>
          <span className="landing-float-badge landing-float-badge-1">
            <Flame aria-hidden="true" className="size-5 fill-accent text-accent" /> 7 hari berturut
          </span>
          <span className="landing-float-badge landing-float-badge-2">
            <Zap aria-hidden="true" className="size-5 fill-secondary text-secondary" /> +10 XP
          </span>
          <span className="landing-float-badge landing-float-badge-3">
            {[0, 1, 2].map((i) => (
              <Star key={i} aria-hidden="true" className="size-5 fill-secondary text-secondary" />
            ))}
          </span>
        </div>

        {/* Kutipan dalam kartu gaya landing */}
        <div className="relative max-w-sm rounded-3xl border-2 border-b-4 bg-white p-5 shadow-lg dark:bg-card">
          <p className="text-lg font-extrabold">
            “Bahasa daerah tetap hidup kalau <span className="text-primary">dipakai</span>.”
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Yuk mulai dari lima menit sehari.</p>
        </div>
      </aside>

      {/* Panel kanan — form */}
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </header>
        <main id="konten" className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:px-6">
          <div className="w-full max-w-md">
            <div className="auth-card">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
