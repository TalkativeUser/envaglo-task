"use client";

import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/types/invoice";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: "secondary" | "warning" | "success" | "destructive" }> = {
  draft: { label: "مسودة", variant: "secondary" },
  pending_approval: { label: "قيد الاعتماد", variant: "warning" },
  approved: { label: "معتمدة", variant: "success" },
  rejected: { label: "مرفوضة", variant: "destructive" },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}