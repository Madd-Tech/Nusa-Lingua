import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { IlloArchipelago } from "@/components/illustrations";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r-2 bg-primary/10 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <BatikPattern variant="kawung" size={56} className="text-primary opacity-[0.08]" />
        <Logo className="relative" />
        <div className="relative mx-auto w-full max-w-md">
          <IlloArchipelago />
        </div>
        <p className="relative max-w-sm text-lg font-bold">
          “Bahasa daerah tetap hidup kalau dipakai.” Yuk mulai dari lima menit sehari.
        </p>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </header>
        <main id="konten" className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
