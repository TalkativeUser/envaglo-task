"use client";

import { StatusBadge } from "@/components/wizard/StatusBadge";
import { useWizardStore } from "@/store/wizard-store";

export function InvoiceStatusBadge() {
  const invoiceStatus = useWizardStore((s) => s.invoiceStatus);
  return <StatusBadge status={invoiceStatus} />;
}