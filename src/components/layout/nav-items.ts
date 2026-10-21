import {
  GraduationCap,
  Home,
  Landmark,
  MessagesSquare,
  HandHeart,
  Repeat,
  ShieldCheck,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type FeatureCategory = "belajar" | "budaya" | "asisten" | "komunitas" | "progres";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  category: FeatureCategory;
  /** Route lain yang juga menandai item ini aktif (mis. /kamus untuk Belajar). */
  match?: string[];
  roles?: ("moderator" | "admin")[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/beranda", label: "Beranda", icon: Home, category: "belajar" },
  { href: "/belajar", label: "Belajar", icon: GraduationCap, category: "belajar", match: ["/kamus"] },
  { href: "/ulasan", label: "Ulasan", icon: Repeat, category: "belajar" },
  { href: "/budaya", label: "Budaya", icon: Landmark, category: "budaya" },
  { href: "/asisten", label: "Asisten AI", icon: MessagesSquare, category: "asisten" },
  { href: "/kontribusi", label: "Kontribusi", icon: HandHeart, category: "komunitas" },
  { href: "/moderasi", label: "Moderasi", icon: ShieldCheck, category: "komunitas", roles: ["moderator", "admin"] },
  { href: "/peringkat", label: "Peringkat", icon: Trophy, category: "progres" },
  { href: "/profil", label: "Profil", icon: UserRound, category: "progres" },
];

/** Bottom nav mobile (5 item). Menu lain tersedia di halaman Profil. */
export const MOBILE_NAV = ["/beranda", "/belajar", "/budaya", "/asisten", "/profil"];

export const CATEGORY_STYLES: Record<FeatureCategory, { text: string; bg: string; activeBg: string; border: string }> = {
  belajar: { text: "text-belajar", bg: "bg-belajar/12", activeBg: "bg-belajar/12", border: "border-belajar/40" },
  budaya: { text: "text-budaya", bg: "bg-budaya/12", activeBg: "bg-budaya/12", border: "border-budaya/40" },
  asisten: { text: "text-asisten", bg: "bg-asisten/12", activeBg: "bg-asisten/12", border: "border-asisten/40" },
  komunitas: { text: "text-komunitas", bg: "bg-komunitas/10", activeBg: "bg-komunitas/10", border: "border-komunitas/40" },
  progres: { text: "text-progres", bg: "bg-progres/15", activeBg: "bg-progres/15", border: "border-progres/40" },
};

export function isNavActive(pathname: string, item: NavItem, all: NavItem[] = NAV_ITEMS) {
  const hit = (p: string) => pathname === p || pathname.startsWith(`${p}/`);
  if (!hit(item.href) && !(item.match ?? []).some(hit)) return false;
  // Jangan tandai item induk aktif bila ada item lain yang lebih spesifik untuk path ini.
  const moreSpecific = all.some((o) => o !== item && o.href.startsWith(`${item.href}/`) && hit(o.href));
  return !moreSpecific;
}
