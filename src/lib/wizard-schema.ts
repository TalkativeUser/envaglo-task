// lib/wizard-schema.ts
import * as z from "zod";
import { evaluateRule } from "@/lib/rule-engine";
import { wizardFieldsConfig } from "@/lib/wizard-rules.config";

// helper بسيط لجلب قيمة من object بمسار nested — نفس فكرة اللي في rule-engine
function getValueByPath(data: Record<string, any>, path: string): unknown {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), data as any);
}

export const wizardFormSchema = z
  .object({
    basicInfo: z.object({
      invoiceNumber: z.string().min(1, "رقم الفاتورة مطلوب"),
      customerId: z.string().min(1, "يجب اختيار العميل"),
      invoiceType: z.enum(["cash", "credit"], { required_error: "يجب اختيار نوع الدفع" }),
      currency: z.string().min(1, "يجب اختيار العملة"),
      issueDate: z.string().min(1, "تاريخ الإصدار مطلوب"),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
    }),

    itemsSection: z.object({
      items: z
        .array(
          z.object({
            productId: z.string().min(1, "يجب اختيار المنتج"),
            name: z.string().min(1, "اسم المنتج مطلوب"),
            barcode: z.string().optional(),
            sku: z.string(),
            unitPriceBeforeDiscountBeforeTax: z.number().min(0.01, "سعر الوحدة يجب أن يكون أكبر من صفر"),
            unitPriceBeforeDiscountWithTax: z.number().min(0.01, "سعر الوحدة يجب أن يكون أكبر من صفر"),
            quantity: z.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
            discountPercentage: z.number().min(0).max(100).default(0),
            taxRate: z.number().default(15),
            stockQty: z.number(),
            unitPriceAfterDiscountBeforeTax: z.number().min(0.01, "سعر الوحدة يجب أن يكون أكبر من صفر"),
            unitPriceAfterDiscountWithTax: z.number().min(0.01, "سعر الوحدة يجب أن يكون أكبر من صفر"),
            totalAfterDiscountBeforeTax: z.number().min(0, "الإجمالي يجب أن يكون 0 أو أكثر"),
            totalVAT: z.number().min(0, "الضريبة يجب أن تكون 0 أو أكثر"),
            totalAfterDiscountWithTax: z.number().min(0, "الإجمالي يجب أن يكون 0 أو أكثر"),
          })
        )
        .min(1, "يجب إضافة منتج واحد على الأقل"),
    }),

    // الحقول بقت اختيارية على مستوى الـ base schema — المطلوبية الفعلية بتتحدد ديناميكيًا تحت
    approvalSection: z.object({
      costCenterId: z.string().optional(),
      departmentId: z.string().optional(),
      managerId: z.string().optional(),
      approvalNotes: z.string().optional(),
      attachments: z.array(z.any()).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const total = data.itemsSection.items.reduce(
      (sum, item: any) => sum + (item.totalAfterDiscountWithTax || 0),
      0
    );
    const context = { total, basicInfo: data.basicInfo };

    for (const rule of wizardFieldsConfig) {
      const isRequired = evaluateRule(rule.requiredWhen, context);
      const value = getValueByPath(data, rule.field);

      if (isRequired && (!value || value === "")) {
        ctx.addIssue({
          path: rule.field.split("."),
          code: z.ZodIssueCode.custom,
          message: "هذا الحقل مطلوب",
        });
      }
    }
  });

export type WizardFormValues = z.infer<typeof wizardFormSchema>;