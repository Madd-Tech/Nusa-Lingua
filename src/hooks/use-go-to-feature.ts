"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { featureHref } from "@/lib/routes";

/**
 * `goToFeature(path)`: tamu → /masuk?next=path, user login → langsung ke path.
 * Status login dicek ulang di browser saat diklik (session bisa saja berubah sejak halaman dirender).
 */
export function useGoToFeature() {
  const router = useRouter();

  const goToFeature = useCallback(
    async (path: string) => {
      let loggedIn = false;
      try {
        const {
          data: { session },
        } = await createClient().auth.getSession();
        loggedIn = !!session;
      } catch {
        loggedIn = false;
      }
      router.push(featureHref(path, loggedIn));
    },
    [router],
  );

  return goToFeature;
}
