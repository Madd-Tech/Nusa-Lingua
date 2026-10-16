import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SubmissionForm } from "@/components/community/submission-form";
import { SubmissionStatus } from "@/components/community/submission-status";
import { AudioButton } from "@/components/learning/audio-button";
import { getCurrentUser } from "@/lib/supabase/server";
import { getActiveLanguages } from "@/lib/queries/content";
import { getMySubmissions } from "@/lib/queries/community";
import { getProfile, getUserLanguages } from "@/lib/queries/progress";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Kontribusi" };

export default async function KontribusiPage() {
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;
  const [languages, mine, submissions, profile] = await Promise.all([
    getActiveLanguages(supabase),
    getUserLanguages(supabase, userId),
    getMySubmissions(supabase, userId),
    getProfile(supabase, userId),
  ]);
  const isModerator = profile?.role === "moderator" || profile?.role === "admin";
  const counts = {
    approved: submissions.filter((s) => s.status === "approved").length,
    pending: submissions.filter((s) => s.status === "pending").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  return (
    <>
      <PageHeader
        icon={HandHeart}
        category="komunitas"
        title="Kontribusi komunitas"
        description="Usulkan kosakata beserta rekaman pelafalanmu. Setiap usulan ditinjau moderator sebelum masuk kamus."
        actions={
          isModerator ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/kontribusi/moderasi">
                <ShieldCheck aria-hidden="true" /> Moderasi
              </Link>
            </Button>
          ) : null
        }
      />

      <section aria-labelledby="form-heading" className="mb-10 rounded-3xl border-2 bg-card p-5 sm:p-6">
        <h2 id="form-heading" className="mb-4 text-xl">
          Usulkan kosakata
        </h2>
        {languages.length ? (
          <SubmissionForm
            userId={userId}
            languages={languages.map((l) => ({ id: l.id, name: l.name }))}
            defaultLanguageId={mine[0]?.language_id}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada bahasa aktif untuk menerima kontribusi.</p>
        )}
      </section>

      <section aria-labelledby="mine-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="mine-heading" className="text-xl">
            Usulan saya
          </h2>
          <p className="text-sm text-muted-foreground">
            {counts.pending} menunggu · {counts.approved} disetujui · {counts.rejected} ditolak
          </p>
        </div>
        {submissions.length === 0 ? (
          <EmptyState
            title="Belum ada usulan"
            description="Mulai dari kata sehari-hari di daerahmu — sapaan, nama makanan, atau ungkapan khas."
          />
        ) : (
          <>
            {/* Tabel (tablet/desktop) */}
            <div className="hidden overflow-hidden rounded-2xl border-2 bg-card md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Daftar usulan kosakata saya</caption>
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3">Kata</th>
                    <th scope="col" className="px-4 py-3">Arti</th>
                    <th scope="col" className="px-4 py-3">Bahasa</th>
                    <th scope="col" className="px-4 py-3">Audio</th>
                    <th scope="col" className="px-4 py-3">Tanggal</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2">
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-extrabold">{s.word}</td>
                      <td className="px-4 py-3">{s.meaning_id}</td>
                      <td className="px-4 py-3">{s.language?.name ?? "—"}</td>
                      <td className="px-4 py-2">
                        {s.audio_url ? <AudioButton src={s.audio_url} label={`Putar rekaman ${s.word}`} size="sm" /> : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                      <td className="px-4 py-3">
                        <SubmissionStatus status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Kartu (mobile) */}
            <ul className="space-y-2 md:hidden">
              {submissions.map((s) => (
                <li key={s.id} className="flex items-start gap-3 rounded-2xl border-2 bg-card p-3">
                  {s.audio_url ? <AudioButton src={s.audio_url} label={`Putar rekaman ${s.word}`} size="sm" /> : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{s.word}</p>
                    <p className="truncate text-sm text-muted-foreground">{s.meaning_id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.language?.name} · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <SubmissionStatus status={s.status} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
