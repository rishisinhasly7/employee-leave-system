import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "@/lib/types";

const map = {
  PENDING: { variant: "pending", label: "Pending" },
  APPROVED: { variant: "approved", label: "Approved" },
  REJECTED: { variant: "rejected", label: "Rejected" },
} as const;

export function StatusBadge({ status }: { status: LeaveStatus }) {
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
