import { Archive, CheckCircle2, Clock, PencilLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ARTICLE_STATUS_LABEL } from "@/lib/constants";
import type { Enums } from "@/types/database";

/** Badge status artikel dengan ikon + teks (tidak hanya warna). */
export function ArticleStatusBadge({ status }: { status: Enums<"article_status"> }) {
  const label = ARTICLE_STATUS_LABEL[status];
  if (status === "published")
    return (
      <Badge variant="success">
        <CheckCircle2 aria-hidden="true" /> {label}
      </Badge>
    );
  if (status === "review")
    return (
      <Badge variant="secondary">
        <Clock aria-hidden="true" /> {label}
      </Badge>
    );
  if (status === "archived")
    return (
      <Badge variant="muted">
        <Archive aria-hidden="true" /> {label}
      </Badge>
    );
  return (
    <Badge variant="outline">
      <PencilLine aria-hidden="true" /> {label}
    </Badge>
  );
}
