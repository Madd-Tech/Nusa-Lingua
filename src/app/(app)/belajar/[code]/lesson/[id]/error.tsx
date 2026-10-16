"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/error-state";

export default function LessonError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <ErrorState
        title="Lesson gagal dimuat"
        description="Periksa koneksimu lalu coba lagi."
        retrying={pending}
        onRetry={() =>
          startTransition(() => {
            router.refresh();
            reset();
          })
        }
      />
    </div>
  );
}
