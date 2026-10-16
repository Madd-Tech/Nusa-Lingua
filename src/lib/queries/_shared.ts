import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Client Supabase bertipe — berlaku untuk client browser maupun server. */
export type DB = SupabaseClient<Database>;

export class QueryError extends Error {
  constructor(
    public readonly context: string,
    public readonly cause: PostgrestError,
  ) {
    super(`${context}: ${cause.message}`);
    this.name = "QueryError";
  }
}

/**
 * Lempar error agar ditangkap error.tsx (yang punya tombol "Coba lagi").
 * Query list tanpa error selalu mengembalikan array, jadi `X[] | null` dipersempit ke `X[]`;
 * query `.maybeSingle()` tetap `X | null`.
 */
export function must<T>(
  context: string,
  res: { data: T; error: PostgrestError | null },
): [T] extends [(infer U)[] | null] ? U[] : T {
  if (res.error) throw new QueryError(context, res.error);
  return res.data as [T] extends [(infer U)[] | null] ? U[] : T;
}

/** Bersihkan kata kunci agar aman dipakai di filter `.or()` PostgREST. */
export function sanitizeSearch(q: string | null | undefined) {
  return (q ?? "").replace(/[%,()*\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 64);
}
