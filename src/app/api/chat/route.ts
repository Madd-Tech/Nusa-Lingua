import { NextResponse, type NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BILINGUAL_FORMAT_INSTRUCTION } from "@/lib/bilingual";
import { addressInstruction } from "@/lib/user-address";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Alias "latest" mengikuti model Flash terbaru, jadi tidak rusak saat model lama dipensiunkan Google.
// Bisa dikunci ke versi tertentu lewat env GEMINI_MODEL (mis. gemini-3.8-flash).
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
// Dipakai bila model utama sedang penuh (503) — sering terjadi di free tier saat jam sibuk.
const FALLBACK_MODEL = "gemini-flash-lite-latest";
const MAX_HISTORY = 20;        // pasang teks terakhir yang dikirim ke model
const DAILY_LIMIT = 60;        // batas pesan/user/hari (lindungi kuota Gemini)

export async function POST(req: NextRequest) {
  const { supabase, user } = await getCurrentUser(); // client scoped ke user → RLS aktif
  if (!user) return new NextResponse("unauthorized", { status: 401 });

  const { sessionId, message } = (await req.json().catch(() => ({}))) as {
    sessionId?: string;
    message?: string;
  };
  const text = (message ?? "").trim();
  if (!sessionId || !text) return new NextResponse("bad request", { status: 400 });
  if (text.length > 2000) return new NextResponse("too long", { status: 400 });

  // Sesi harus milik user ini (RLS sudah memfilter; null = bukan miliknya).
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id, persona_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return new NextResponse("forbidden", { status: 403 });

  // Batas harian sederhana → 429 yang sudah ditangani UI.
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("role", "user")
    .gte("created_at", since.toISOString());
  if ((count ?? 0) >= DAILY_LIMIT) return new NextResponse("rate limited", { status: 429 });

  // system_prompt hanya terjangkau service role (ai_personas tertutup untuk client).
  // Gender pengguna menentukan panggilan persona (mis. "Lae" / "Ito" di Batak Toba).
  const admin = createAdminClient();
  const [{ data: persona }, { data: profile }] = await Promise.all([
    admin
      .from("ai_personas")
      .select("system_prompt, address_male, address_female")
      .eq("id", session.persona_id)
      .maybeSingle(),
    supabase.from("profiles").select("gender").eq("id", user.id).maybeSingle(),
  ]);
  if (!persona) return new NextResponse("persona not found", { status: 500 });

  // Riwayat sebelumnya (sebelum pesan baru ini).
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at")
    .order("id")
    .limit(200);

  const contents = [
    ...(history ?? []).slice(-MAX_HISTORY).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text }] },
  ];

  // Mulai streaming dari Gemini. Error awal (key salah / kuota habis / model tidak ada) → status rapi.
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  // Balasan dwibahasa: teks daerah + penanda + terjemahan (lihat src/lib/bilingual.ts).
  // Aturan format tetap paling akhir karena ia mengesampingkan aturan terjemahan di atasnya.
  const systemInstruction = [
    persona.system_prompt,
    addressInstruction(profile?.gender ?? null, persona),
    BILINGUAL_FORMAT_INSTRUCTION,
  ].join("\n\n");
  const start = (model: string) =>
    ai.models.generateContentStream({ model, contents, config: { systemInstruction, temperature: 0.7 } });

  let gemini;
  try {
    try {
      gemini = await start(MODEL);
    } catch (err: unknown) {
      if ((err as { status?: number })?.status !== 503 || MODEL === FALLBACK_MODEL) throw err;
      console.warn(`[api/chat] ${MODEL} penuh (503), beralih ke ${FALLBACK_MODEL}`);
      gemini = await start(FALLBACK_MODEL);
    }
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    console.error("[api/chat] gemini init:", err);
    return new NextResponse("assistant error", { status: status === 429 ? 429 : 500 });
  }

  // Pesan user baru disimpan setelah Gemini siap, supaya "Kirim ulang" tidak membuat duplikat.
  await supabase.from("chat_messages").insert({ session_id: sessionId, role: "user", content: text });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        for await (const chunk of gemini) {
          const t = chunk.text; // getter → string | undefined
          if (t) {
            full += t;
            controller.enqueue(encoder.encode(t));
          }
        }
      } catch (err) {
        // Termasuk saat user menekan "Stop" (stream dibatalkan) — balasan parsial tetap disimpan.
        console.error("[api/chat] stream:", err);
      } finally {
        // Simpan SEBELUM close: di serverless, fungsi bisa dibekukan begitu respons selesai.
        if (full.trim()) {
          await supabase
            .from("chat_messages")
            .insert({ session_id: sessionId, role: "assistant", content: full });
        }
        try {
          controller.close();
        } catch {
          // Stream sudah dibatalkan client.
        }
      }
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}