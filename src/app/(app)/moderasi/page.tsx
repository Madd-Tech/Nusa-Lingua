import { redirect } from "next/navigation";

/** Dashboard menyusul (Fase B); sementara langsung ke antrean. */
export default function ModerasiPage() {
  redirect("/moderasi/antrean");
}
