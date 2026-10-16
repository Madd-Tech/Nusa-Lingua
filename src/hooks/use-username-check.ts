"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usernameSchema } from "@/lib/validation";

export type UsernameStatus = "idle" | "invalid" | "checking" | "available" | "taken" | "error";

/**
 * Cek ketersediaan username secara real-time (debounce 400 ms).
 * Catatan: bergantung pada policy select `profiles`. Constraint UNIQUE tetap jadi penjaga terakhir saat simpan.
 */
export function useUsernameCheck(raw: string, userId: string, current?: string | null) {
  const [status, setStatus] = useState<UsernameStatus>("idle");

  useEffect(() => {
    const value = raw.trim().toLowerCase();
    if (!value || (current && value === current)) {
      setStatus("idle");
      return;
    }
    if (!usernameSchema.safeParse(value).success) {
      setStatus("invalid");
      return;
    }
    setStatus("checking");
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data, error } = await createClient()
        .from("profiles")
        .select("id")
        .eq("username", value)
        .neq("id", userId)
        .limit(1);
      if (cancelled) return;
      if (error) setStatus("error");
      else setStatus(data.length ? "taken" : "available");
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [raw, userId, current]);

  return status;
}
