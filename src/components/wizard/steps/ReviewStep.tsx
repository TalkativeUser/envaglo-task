"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useWizardStore } from "@/store/wizard-store";
import { SectionTitle } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Building2, List, Lock } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { StatusBadge } from "@/components/wizard/StatusBadge";
function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${
        isLast ? "" : "border-b border-[#E2E4E9]"
      }`}
    >
      <span className="text-sm text-[#74777F]">{label}</span>
      <span className="text-left text-sm font-semibold text-[#191C1D]">{value}</span>
    </div>
  );
}

export function ReviewStep() {
  const { setStep , invoiceStatus } = useWizardStore();
  const { getValues } = useFormContext();
   const canSubmit = usePermission("submit");

  /**
   * دالة العودة للخطوة السابقة
   */
  const handlePreviousStep = () => {
    setStep("approval");
  };

  // الحصول على جميع قيم الفورم
  const formValues = getValues();
  const basicInfo = formValues.basicInfo || {};
  const itemsSection = formValues.itemsSection || {};
  const approvalSection = formValues.approvalSection || {};
  const items = itemsSection.items || [];

  // حساب الإجماليات
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.totalAfterDiscountBeforeTax || 0);
  }, 0);

  const totalVAT = items.reduce((sum: number, item: any) => {
    return sum + (item.totalVAT || 0);
  }, 0);

  const grandTotal = items.reduce((sum: number, item: any) => {
    return sum + (item.totalAfterDiscountWithTax || 0);
  }, 0);

  // دالة تنسيق الأرقام
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 font-tajawal text-[#191C1D]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionTitle className="text-xl font-bold text-[#191C1D]">
            المراجعة والاعتماد
          </SectionTitle>
          <p className="mt-1 text-sm text-[#74777F]">
            يرجى مراجعة كافة التفاصيل قبل تقديم الفاتورة للاعتماد النهائي.
          </p>
        </div>
         <StatusBadge status={invoiceStatus} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <section className="rounded-xl border border-[#E2E4E9] bg-white p-5 shadow-xs">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2B7DE9] text-[11px] font-bold leading-none text-white">
                i
              </span>
              <h3 className="text-sm font-bold text-[#191C1D]">المعلومات الأساسية</h3>
            </div>
            <InfoRow label="رقم الفاتورة" value={basicInfo.invoiceNumber || "-"} />
            <InfoRow label="تاريخ الإصدار" value={basicInfo.issueDate || "-"} />
            <InfoRow label="نوع الفاتورة" value={basicInfo.invoiceType === "cash" ? "نقداً" : "آجل"} />
            <InfoRow label="العملة" value={basicInfo.currency || "-"} />
            <InfoRow label="تاريخ الاستحقاق" value={basicInfo.dueDate || "-"} isLast />
          </section>

          <section className="rounded-xl border border-[#E2E4E9] bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#003D9B]" />
              <h3 className="text-sm font-bold text-[#191C1D]">توجيه التكلفة</h3>
            </div>
            <div className="space-y-3 rounded-lg bg-[#F5F7FA] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#74777F]">مركز التكلفة</span>
                <span className="rounded-md border border-[#E2E4E9] bg-white px-2.5 py-1 font-mono text-xs font-semibold text-[#191C1D]">
                  {approvalSection.costCenterId || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#74777F]">القسم الإداري</span>
                <span className="rounded-md border border-[#E2E4E9] bg-white px-2.5 py-1 font-mono text-xs font-semibold text-[#191C1D]">
                  {approvalSection.departmentId || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#74777F]">المدير المسؤول</span>
                <span className="text-sm font-semibold text-[#191C1D]">
                  {approvalSection.managerId || "-"}
                </span>
              </div>
              {approvalSection.approvalNotes && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm text-[#74777F]">ملاحظات</span>
                  <span className="text-sm font-semibold text-[#191C1D]">
                    {approvalSection.approvalNotes}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-8">
          <section className="rounded-xl border border-[#E2E4E9] bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-[#003D9B]" />
                <h3 className="text-sm font-bold text-[#191C1D]">ملخص العناصر</h3>
              </div>
              <span className="rounded-md bg-[#F0F2F5] px-2.5 py-1 text-xs font-medium text-[#434654]">
                {items.length} عنصر
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E2E4E9] text-[#74777F]">
                    <th className="py-2.5 pe-3 text-right font-medium">#</th>
                    <th className="px-3 py-2.5 text-right font-medium">الوصف</th>
                    <th className="px-3 py-2.5 text-right font-medium">الكمية</th>
                    <th className="px-3 py-2.5 text-right font-medium">سعر الوحدة</th>
                    <th className="py-2.5 ps-3 text-right font-medium">الإجمالي (ر.س)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        لا توجد بنود مضافة
                      </td>
                    </tr>
                  ) : (
                    items.map((item: any, index: number) => (
                      <tr key={item.id || index} className="border-b border-[#F0F2F5]">
                        <td className="py-3 pe-3 text-[#74777F]">{index + 1}</td>
                        <td className="px-3 py-3 font-medium text-[#191C1D]">{item.name || "-"}</td>
                        <td className="px-3 py-3 tabular-nums text-[#191C1D]">{item.quantity || 0}</td>
                        <td className="px-3 py-3 tabular-nums text-[#191C1D]">
                          {formatNumber(item.unitPriceBeforeDiscountBeforeTax || 0)}
                        </td>
                        <td className="py-3 ps-3 tabular-nums font-semibold text-[#191C1D]">
                          {formatNumber(item.totalAfterDiscountWithTax || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="w-full max-w-sm self-start rounded-xl border border-[#E2E4E9] bg-white p-5 shadow-xs">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#74777F]">المجموع الفرعي</span>
                <span className="tabular-nums font-medium text-[#191C1D]">
                  {formatNumber(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#74777F]">ضريبة القيمة المضافة (١٥٪)</span>
                <span className="tabular-nums font-medium text-[#191C1D]">
                  {formatNumber(totalVAT)}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-[#E2E4E9] pt-4">
              <span className="text-base font-bold text-[#003D9B]">الإجمالي النهائي</span>
              <div className="flex items-baseline gap-1 text-[#003D9B]">
                <span className="text-2xl font-extrabold leading-none tabular-nums">
                  {formatNumber(grandTotal)}
                </span>
                <span className="text-sm font-bold">ر.س</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* نفس مبدأ الأزرار في باقي الخطوات: full width فوق بعض على
          الموبايل — وده هنا كمان مهم إضافيًا عشان زر "إصدار الفاتورة"
          يبقى سهل الضغط عليه بالإبهام على الموبايل */}
      <div className="flex flex-col-reverse gap-3 border-t border-[#E2E4E9] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviousStep}
          className="h-10 w-full rounded-lg border border-[#E2E4E9] bg-slate-200/80 px-8 font-tajawal text-sm font-medium text-[#434654] transition-colors hover:bg-slate-300 sm:w-auto"
        >
          السابق
        </Button>

        <Button
          type="submit"
          disabled={!canSubmit}
          title={!canSubmit ? "ليس لديك صلاحية إصدار الفواتير" : undefined}
          className="h-10 w-full rounded-lg bg-[#003D9B] px-8 font-tajawal text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#002D72] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {!canSubmit && <Lock className="ml-1.5 inline h-3.5 w-3.5" />}
          إصدار الفاتورة
        </Button>
      </div>
    </div>
  );
}
