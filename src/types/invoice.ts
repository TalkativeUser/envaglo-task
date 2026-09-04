export type StepId = "basic-info" | "items" | "approval" | "review";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "conflict" | "error";
export type InvoiceStatus = "draft" | "pending_approval" | "approved" | "rejected";

export type InvoiceType = "cash" | "credit";

export interface InvoiceItem {
  id: string;
  name: string;
  sku?: string;
  iconType?: "laptop" | "printer" | "monitor" | "default";
  quantity: number;
  availableStock: number;
  unitPrice: number;
  price?: number;
  discountPercent: number;
  discount?: number;
  isTaxable?: boolean;
  taxRate: number;
  taxAmount?: number;
  total: number;
}

export interface InvoiceAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface InvoiceFormData {
  // الحقول الأساسية
  userName?: string;
  customerId?: string;
  customerName?: string;
  invoiceNumber?: string;
  invoiceType?: InvoiceType;
  issueDate?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;

  // البنود
  items?: InvoiceItem[];

  // مركز التكلفة والموافقة
  costCenter?: string;
  department?: string;
  approvalReason?: string;
  approver?: string;
  attachments?: InvoiceAttachment[];

  // إجماليات
  subtotal?: number;
  taxTotal?: number;
  grandTotal?: number;
}

