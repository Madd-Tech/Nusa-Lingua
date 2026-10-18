"use client";

import { AnimatedMascot } from "@/components/landing/animated-mascot";
import type { PersonaMascot } from "@/lib/persona-mascots";

/**
 * Maskot animasi persona AI. `busy=true` → pose mengetik,
 * selain itu pose sapaan (idle).
 */
export function PersonaMascotAnim({ m, busy, size }: { m: PersonaMascot; busy?: boolean; size?: number }) {
  if (m.mascot === "mbah-darmo") {
    return <AnimatedMascot mascot="mbah-darmo" pose={busy ? m.typingPose : m.greetingPose} size={size} />;
  }
  return <AnimatedMascot mascot="teh-euis-ai" pose={busy ? m.typingPose : m.greetingPose} size={size} />;
}
