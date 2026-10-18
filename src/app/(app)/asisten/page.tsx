import type { Metadata } from "next";
import { History, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { IlloChat } from "@/components/illustrations";
import { PageHeader } from "@/components/layout/page-header";
import { PersonaAvatar } from "@/components/chat/persona-avatar";
import { NewChatButton } from "@/components/chat/new-chat-button";
import { MockBanner } from "@/components/chat/mock-banner";
import { SessionList } from "@/components/chat/session-list";
import { getCurrentUser } from "@/lib/supabase/server";
import { getPublicPersonas } from "@/lib/queries/personas";
import { getChatSessions } from "@/lib/queries/chat";
import { getActiveLanguages } from "@/lib/queries/content";

export const metadata: Metadata = { title: "Asisten AI" };

export default async function AsistenPage() {
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;

  // Persona dibaca di server dengan service role; hanya kolom publik (tanpa system_prompt) yang dikirim.
  const [personas, sessions, languages] = await Promise.all([
    getPublicPersonas(),
    getChatSessions(supabase, userId),
    getActiveLanguages(supabase),
  ]);
  const langName = new Map(languages.map((l) => [l.id, l.name]));
  const personaById = new Map(personas.map((p) => [p.id, p]));

  return (
    <>
      <PageHeader
        icon={MessagesSquare}
        category="asisten"
        pattern="parang"
        title="Asisten AI"
        description="Latihan ngobrol dengan persona penutur asli. Mereka sabar, ramah, dan siap mengoreksi."
      />
      <div className="mb-6">
        <MockBanner />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="persona-heading">
          <h2 id="persona-heading" className="mb-3 text-xl">
            Pilih teman ngobrol
          </h2>
          {personas.length === 0 ? (
            <EmptyState illustration={<IlloChat />} title="Persona belum tersedia" description="Tim kami sedang menyiapkan teman ngobrol AI." />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {personas.map((p) => (
                <li key={p.id} className="relative flex flex-col overflow-hidden rounded-3xl border-2 bg-card p-5 shadow-soft">
                  <BatikPattern variant="parang" color="rgb(var(--c-asisten))" opacity={0.05} />
                  <div className="relative flex items-center gap-3">
                    <PersonaAvatar name={p.name} src={p.avatar_url} className="size-14" />
                    <div className="min-w-0">
                      <h3 className="truncate text-lg">{p.name}</h3>
                      {p.language_id && langName.get(p.language_id) ? (
                        <Badge variant="asisten">{langName.get(p.language_id)}</Badge>
                      ) : null}
                    </div>
                  </div>
                  {p.description ? <p className="relative mt-3 flex-1 text-sm text-muted-foreground">{p.description}</p> : <div className="flex-1" />}
                  <div className="relative mt-4">
                    <NewChatButton userId={userId} personaId={p.id} personaName={p.name} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="riwayat-heading">
          <h2 id="riwayat-heading" className="mb-3 flex items-center gap-2 text-xl">
            <History aria-hidden="true" className="size-5 text-asisten" /> Riwayat obrolan
          </h2>
          <SessionList
            sessions={sessions.map((s) => {
              const p = personaById.get(s.persona_id);
              return { ...s, persona: p ? { name: p.name, avatar_url: p.avatar_url } : null };
            })}
          />
        </section>
      </div>
    </>
  );
}
