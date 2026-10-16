"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/error-state";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      className="my-8"
      onRetry={() =>
        startTransition(() => {
          router.refresh();
          reset();
        })
      }
      retrying={pending}
    />
  );
}
