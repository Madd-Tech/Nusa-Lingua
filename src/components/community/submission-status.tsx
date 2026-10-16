import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SUBMISSION_STATUS_LABEL } from "@/lib/constants";
import type { Enums } from "@/types/database";

/** Badge status dengan ikon + teks (tidak hanya warna). */
export function SubmissionStatus({ status }: { status: Enums<"submission_status"> }) {
  if (status === "approved")
    return (
      <Badge variant="success">
        <CheckCircle2 aria-hidden="true" /> {SUBMISSION_STATUS_LABEL.approved}
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge variant="danger">
        <XCircle aria-hidden="true" /> {SUBMISSION_STATUS_LABEL.rejected}
      </Badge>
    );
  return (
    <Badge variant="secondary">
      <Clock aria-hidden="true" /> {SUBMISSION_STATUS_LABEL.pending}
    </Badge>
  );
}
