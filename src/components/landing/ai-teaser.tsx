import { ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { FeatureLink } from "@/components/layout/feature-link";

const SAMPLE = [
  { role: "user", text: "Mbah, bagaimana bilang “selamat pagi” dalam bahasa Jawa?" },
  { role: "assistant", text: "Gampang, Nak! Ucapkan “Sugeng enjing”. Coba tulis atau ucapkan, nanti Mbah koreksi." },
  { role: "user", text: "Sugeng enjing, Mbah!" },
  { role: "assistant", text: "Pinter! Sudah pas. Mau lanjut belajar cara menanyakan kabar?" },
] as const;

export function AiTeaser({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="space-y-5">
        <Badge variant="asisten" className="px-3 py-1 text-sm">
          <Bot aria-hidden="true" /> Asisten AI
        </Badge>
        <h2 className="text-3xl sm:text-4xl">Teman ngobrol yang fasih berbahasa daerah</h2>
        <p className="text-lg text-muted-foreground">
          Pilih persona penutur asli, lalu latihan bercakap tanpa malu salah. Asisten membalas dalam bahasa daerah lengkap dengan
          terjemahan dan koreksi yang ramah.
        </p>
        <Button asChild size="lg" variant="asisten">
          <FeatureLink path="/asisten" isLoggedIn={isLoggedIn}>
            Ngobrol sekarang <ArrowRight aria-hidden="true" />
          </FeatureLink>
        </Button>
      </div>

      <figure className="relative overflow-hidden rounded-3xl border-2 bg-card p-5 shadow-soft">
        <BatikPattern variant="parang" color="rgb(var(--c-asisten))" opacity={0.05} />
        <figcaption className="relative mb-4 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-extrabold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-asisten-solid text-white">
              <Bot aria-hidden="true" className="size-5" />
            </span>
            Mbah Darmo · Bahasa Jawa
          </span>
          <Badge variant="muted">Contoh percakapan</Badge>
        </figcaption>
        <ol className="relative space-y-3">
          {SAMPLE.map((m, i) => (
            <li key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-3xl rounded-br-lg bg-primary-600 px-4 py-2.5 text-white"
                    : "max-w-[85%] rounded-3xl rounded-bl-lg bg-asisten/12 px-4 py-2.5"
                }
              >
                <span className="sr-only">{m.role === "user" ? "Pengguna: " : "Asisten: "}</span>
                {m.text}
              </p>
            </li>
          ))}
        </ol>
      </figure>
    </div>
  );
}
