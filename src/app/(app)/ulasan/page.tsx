import type { Metadata } from "next";
import Link from "next/link";
import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloCheck } from "@/components/illustrations";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewSession } from "@/components/learning/review-session";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDueReviews, getMasteryCounts, getNextReviewAt } from "@/lib/queries/progress";
import { formatNumber, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Ulasan kosakata" };

export default async function UlasanPage() {
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;

  const [due, counts, nextAt] = await Promise.all([
    getDueReviews(supabase, userId, 15),
    getMasteryCounts(supabase, userId),
    getNextReviewAt(supabase, userId),
  ]);

  return (
    <>
      <PageHeader
        icon={Repeat}
        category="belajar"
        pattern="parang"
        title="Ulasan kosakata"
        description="Ulangi kata pada waktu yang tepat agar tersimpan di ingatan jangka panjang."
      >
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">Kata dipelajari:</dt>
            <dd className="font-extrabold">{formatNumber(counts.learned)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">Sudah hafal:</dt>
            <dd className="font-extrabold">{formatNumber(counts.mastered)}</dd>
          </div>
        </dl>
      </PageHeader>

      {due.length ? (
        <ReviewSession userId={userId} items={due} />
      ) : (
        <EmptyState
          illustration={<IlloCheck />}
          title={counts.learned ? "Semua kosakata sudah kamu kuasai hari ini" : "Belum ada kata untuk diulas"}
          description={
            counts.learned
              ? nextAt
                ? `Ulasan berikutnya ${formatRelative(nextAt)}. Sambil menunggu, lanjutkan lesson baru.`
                : "Lanjutkan lesson baru untuk menambah kosakata."
              : "Kata-kata dari lesson yang kamu selesaikan akan muncul di sini untuk diulas."
          }
          action={
            <Button asChild>
              <Link href="/belajar">Mulai lesson</Link>
            </Button>
          }
        />
      )}
    </>
  );
}
