"use client";

import { useState } from "react";
import Link from "next/link";
import { History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SessionList, type SessionListItem } from "@/components/chat/session-list";

/** Tombol riwayat (mobile/tablet) → Sheet daftar sesi. */
export function HistorySheet({ sessions, activeId }: { sessions: SessionListItem[]; activeId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="Buka riwayat obrolan">
          <History />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Riwayat obrolan</SheetTitle>
          <SheetDescription>Pilih sesi untuk melanjutkan percakapan.</SheetDescription>
        </SheetHeader>
        <Button asChild variant="asisten" size="sm" onClick={() => setOpen(false)}>
          <Link href="/asisten">
            <Plus aria-hidden="true" /> Obrolan baru
          </Link>
        </Button>
        <SessionList sessions={sessions} activeId={activeId} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
