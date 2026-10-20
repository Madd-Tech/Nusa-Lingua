/**
 * Pemetaan persona asisten AI → aset maskotnya.
 * Dipakai PersonaAvatar (fallback avatar statis) dan ChatWindow (maskot animasi).
 * Sumber aset: /public/media/maskot/ (statis) & /public/media/animasi-maskot/ (animasi).
 */

import type { MascotId, PoseOf } from "@/lib/mascot-poses";

type MascotVariant = {
  [M in MascotId]: {
    mascot: M;
    greetingPose: PoseOf<M>;
    typingPose: PoseOf<M>;
  };
}[MascotId];

export type PersonaMascot = { avatar: string } & MascotVariant;

const RULES: Array<{ match: RegExp; mascot: PersonaMascot }> = [
  {
    match: /darmo/i,
    mascot: {
      avatar: "/media/maskot/avatar-default.svg",
      mascot: "mbah-darmo",
      greetingPose: "menyapa",
      typingPose: "mengetik",
    },
  },
  {
    match: /euis/i,
    mascot: {
      avatar: "/media/maskot/euis-avatar-default.svg",
      mascot: "teh-euis-ai",
      greetingPose: "menyapa-sunda",
      typingPose: "mengetik",
    },
  },
  {
    match: /sitti/i,
    mascot: {
      avatar: "/media/maskot/kak-sitti/avatar-default.svg",
      mascot: "kak-sitti",
      greetingPose: "menyapa",
      typingPose: "mengetik",
    },
  },
  {
    match: /aminah/i,
    mascot: {
      avatar: "/media/maskot/nenek-aminah/avatar-default.svg",
      mascot: "nenek-aminah",
      greetingPose: "menyapa",
      typingPose: "mengetik",
    },
  },
  {
    match: /rizal/i,
    mascot: {
      avatar: "/media/maskot/uda-rizal/avatar-default.svg",
      mascot: "uda-rizal",
      greetingPose: "menyapa",
      typingPose: "mengetik",
    },
  },
];

/** Cari maskot persona berdasarkan nama (null jika persona tidak dikenal). */
export function getPersonaMascot(name?: string | null): PersonaMascot | null {
  if (!name) return null;
  return RULES.find((r) => r.match.test(name))?.mascot ?? null;
}
