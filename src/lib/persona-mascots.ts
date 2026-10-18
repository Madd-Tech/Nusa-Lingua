/**
 * Pemetaan persona asisten AI → aset maskotnya.
 * Dipakai PersonaAvatar (fallback avatar statis) dan ChatWindow (maskot animasi).
 * Sumber aset: /public/media/maskot/ (statis) & /public/media/animasi-maskot/ (animasi).
 */

import type { PoseOf } from "@/components/landing/animated-mascot";

export type PersonaMascot = { avatar: string } & (
  | { mascot: "mbah-darmo"; greetingPose: PoseOf<"mbah-darmo">; typingPose: PoseOf<"mbah-darmo"> }
  | { mascot: "teh-euis-ai"; greetingPose: PoseOf<"teh-euis-ai">; typingPose: PoseOf<"teh-euis-ai"> }
);

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
];

/** Cari maskot persona berdasarkan nama (null jika persona tidak dikenal). */
export function getPersonaMascot(name?: string | null): PersonaMascot | null {
  if (!name) return null;
  return RULES.find((r) => r.match.test(name))?.mascot ?? null;
}
