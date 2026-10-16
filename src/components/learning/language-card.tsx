import Link from "next/link";
import { CheckCircle2, MapPin, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { LanguageIcon } from "@/components/learning/language-icon";
import { StartLanguageButton } from "@/components/learning/start-language-button";
import type { LanguageWithRegion } from "@/lib/queries/content";
import { formatNumber } from "@/lib/utils";

export function LanguageCard({
  language,
  learningXp,
  userId,
}: {
  language: LanguageWithRegion;
  /** null = belum dipelajari. */
  learningXp: number | null;
  userId: string;
}) {
  const learning = learningXp !== null;
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-card p-5 shadow-soft">
      <BatikPattern variant="kawung" color="rgb(var(--primary))" opacity={0.04} />
      <div className="relative flex items-start gap-3">
        <LanguageIcon name={language.name} iconUrl={language.icon_url} className="size-14" />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-tight">{language.name}</h3>
          {language.region ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5" />
              {[language.region.name, language.region.province].filter(Boolean).join(", ")}
            </p>
          ) : null}
        </div>
      </div>
      {learning ? (
        <div className="relative mt-3 flex flex-wrap gap-2">
          <Badge variant="success">
            <CheckCircle2 aria-hidden="true" /> Sedang dipelajari
          </Badge>
          <Badge variant="secondary">
            <Zap aria-hidden="true" /> {formatNumber(learningXp)} XP
          </Badge>
        </div>
      ) : null}
      {language.description ? (
        <p className="relative mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{language.description}</p>
      ) : (
        <div className="flex-1" />
      )}
      <div className="relative mt-4 flex flex-wrap gap-2">
        {learning ? (
          <Button asChild>
            <Link href={`/belajar/${language.code}`}>Lanjutkan</Link>
          </Button>
        ) : (
          <StartLanguageButton userId={userId} languageId={language.id} code={language.code} languageName={language.name} />
        )}
        <Button asChild variant="outline">
          <Link href={`/kamus/${language.code}`}>Kamus</Link>
        </Button>
      </div>
    </article>
  );
}
