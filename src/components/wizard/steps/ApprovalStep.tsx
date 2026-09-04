"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useWizardStore } from "@/store/wizard-store";
import { SectionTitle } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { ChevronDown, CloudUpload, FileText, X } from "lucide-react";
import { toast } from "sonner";

const COST_CENTERS = [
  { value: "CC-101", label: "CC-101 (الإدارة العامة)" },
  { value: "CC-102", label: "CC-102 (المبيعات والتسويق)" },
  { value: "CC-103", label: "CC-103 (تقنية المعلومات)" },
];

const DEPARTMENTS = [
  { value: "sales", label: "قسم المبيعات (Sales)" },
  { value: "finance", label: "المالية والحسابات (Finance)" },
  { value: "operations", label: "العمليات والتشغيل (Operations)" },
];

const APPROVERS = [
  { value: "m-khaled", label: "م. خالد السعيد (المدير المالي)" },
  { value: "dr-ahmed", label: "د. أحمد العمري (المدير التنفيذي)" },
];

const selectClassName =
  "flex h-11 w-full appearance-none rounded-lg border border-[#E2E4E9] bg-white px-3.5 py-2 pl-10 font-tajawal text-sm text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#003D9B]/20";

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-tajawal text-sm font-medium text-[#191C1D]"
    >
      {children}
      {required ? <span className="text-red-500">*</span> : null}
    </label>
  );
}

export function ApprovalStep() {

  

const { register, trigger, setValue, watch, formState: { errors } } = useFormContext();
const { setStep, currentStepId } = useWizardStore();

const attachments: File[] = watch("approvalSection.attachments") || [];

const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newFiles = Array.from(e.target.files || []);
  if (newFiles.length === 0) return;
  setValue("approvalSection.attachments", [...attachments, ...newFiles], {
    shouldValidate: true,
  });
  e.target.value = "";
};

const handleRemoveFile = (index: number) => {
  const updated = attachments.filter((_, i) => i !== index);
  setValue("approvalSection.attachments", updated, { shouldValidate: true });
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
};








  /**
   * دالة الانتقال للخطوة التالية مع التحقق من صحة الحقول
   */
  const handleNextStep = async () => {
    // التحقق من حقول الخطوة الحالية
    const isValid = await trigger([
      "approvalSection.costCenterId",
      "approvalSection.departmentId",
      "approvalSection.managerId",
    ]);

    if (isValid) {
      setStep("review");
    } else {
      // عرض رسالة خطأ توضيحية
      const firstErrorField = Object.keys(errors)[0];
      const errorMessage = (errors as any)[firstErrorField]?.message || "يرجى تصحيح الأخطاء قبل المتابعة";
      toast.error(errorMessage as string, {
        duration: 3000,
      });
    }
  };

  /**
   * دالة العودة للخطوة السابقة
   */
  const handlePreviousStep = () => {
    setStep("items");
  };

  return (
    <div className="space-y-6 font-tajawal text-[#191C1D] select-none">
      <div className="flex items-start gap-3 rounded-xl border border-[#B8D4F5] bg-[#E8F2FC] px-4 py-3.5">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2B7DE9] text-[11px] font-bold leading-none text-white"
          aria-hidden
        >
          i
        </span>
        <div className="min-w-0 space-y-1 text-right">
          <p className="text-sm font-bold text-[#003D9B]">توجيه التكلفة الديناميكي</p>
          <p className="text-xs leading-relaxed text-[#434654]">
            تظهر الحقول أدناه بناءً على نوع الفاتورة والقيمة الإجمالية. نظراً لتجاوز قيمة
            الفاتورة الحد المسموح، يتطلب الأمر تحديد مركز تكلفة وقسم لغرض الاعتماد الإداري.
          </p>
        </div>
      </div>

      <div className="text-right">
        <SectionTitle className="text-xl font-bold text-[#191C1D]">
          تفاصيل التكلفة والاعتماد
        </SectionTitle>
        <p className="mt-1 text-sm text-[#74777F]">
          يرجى استكمال البيانات المطلوبة لتوجيه المعاملة إلى سلسلة الاعتمادات الصحيحة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:gap-x-8 md:grid-cols-2">
        {/* مركز التكلفة */}
        <div className="space-y-2">
          <FieldLabel htmlFor="costCenterId" required>
            مركز التكلفة
          </FieldLabel>
          <div className="relative">
            <select
              id="costCenterId"
              {...register("approvalSection.costCenterId")}
              className={`${selectClassName} ${(errors as any).approvalSection?.costCenterId ? 'border-red-500' : ''}`}
            >
              <option value="" disabled>
                اختر مركز التكلفة...
              </option>
              {COST_CENTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777F]" />
          </div>
          {(errors as any).approvalSection?.costCenterId && (
            <p className="text-xs text-red-500">{(errors as any).approvalSection.costCenterId.message}</p>
          )}
        </div>

        {/* القسم الإداري */}
        <div className="space-y-2">
          <FieldLabel htmlFor="departmentId" required>
            القسم الإداري
          </FieldLabel>
          <div className="relative">
            <select
              id="departmentId"
              {...register("approvalSection.departmentId")}
              className={`${selectClassName} ${(errors as any).approvalSection?.departmentId ? 'border-red-500' : ''}`}
            >
              <option value="" disabled>
                اختر القسم الإداري...
              </option>
              {DEPARTMENTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777F]" />
          </div>
          {(errors as any).approvalSection?.departmentId && (
            <p className="text-xs text-red-500">{(errors as any).approvalSection.departmentId.message}</p>
          )}
        </div>

        {/* المدير المسؤول */}
        <div className="space-y-2">
          <FieldLabel htmlFor="managerId" required>
            المدير المسؤول
          </FieldLabel>
          <div className="relative">
            <select
              id="managerId"
              {...register("approvalSection.managerId")}
              className={`${selectClassName} ${(errors as any).approvalSection?.managerId ? 'border-red-500' : ''}`}
            >
              <option value="" disabled>
                اختر المدير المسؤول...
              </option>
              {APPROVERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777F]" />
          </div>
          {(errors as any).approvalSection?.managerId && (
            <p className="text-xs text-red-500">{(errors as any).approvalSection.managerId.message}</p>
          )}
        </div>

        <div className="hidden md:block" aria-hidden />

        {/* سبب / ملاحظات الاعتماد */}
        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="approvalNotes"
            className="block font-tajawal text-sm font-medium text-[#434654]"
          >
            سبب / ملاحظات الاعتماد
          </label>
          <textarea
            id="approvalNotes"
            rows={4}
            placeholder="أدخل مبرر المصروف هنا..."
            {...register("approvalSection.approvalNotes")}
            className="min-h-[120px] w-full resize-none rounded-lg border border-[#E2E4E9] bg-white p-3.5 font-tajawal text-sm text-[#191C1D] placeholder:text-[#74777F] focus:outline-none focus:ring-2 focus:ring-[#003D9B]/20"
          />
        </div>
      </div>

      {/* المرفقات الداعمة */}
      <div className="space-y-3 border-t border-[#E2E4E9] pt-6">
        <p className="text-sm font-medium text-[#191C1D]">المرفقات الداعمة (اختياري)</p>
        {/* بادينج كان كبير بشكل ثابت (px-6 py-10) على كل الشاشات، فعلى
            الموبايل كان بياخد مساحة كبيرة أوي من غير داعي */}
        <label
          htmlFor="attachments"
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D5D8DE] bg-white px-4 py-8 text-center hover:border-[#003D9B]/50 hover:bg-[#F8F9FB] sm:px-6 sm:py-10"
        >
          <input
            id="attachments"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
          <CloudUpload className="mb-3 h-10 w-10 text-[#003D9B]" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#191C1D]">
            اسحب وأفلت الملفات هنا أو{" "}
            <span className="text-[#003D9B] underline underline-offset-4">استعرض جهازك</span>
          </p>
          <p className="mt-1.5 text-xs text-[#74777F]">
            يدعم PDF, JPG, PNG بحجم أقصى 10MB
          </p>
        </label>




{attachments.length > 0 && (
  <ul className="space-y-2">
    {attachments.map((file, index) => (
      <li
        key={`${file.name}-${index}`}
        className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E4E9] bg-[#F8F9FB] px-3.5 py-2.5"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <FileText className="h-4 w-4 shrink-0 text-[#003D9B]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#191C1D]">{file.name}</p>
            <p className="text-[11px] text-[#74777F]">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleRemoveFile(index)}
          className="shrink-0 rounded-md p-1 text-[#74777F] hover:bg-red-50 hover:text-red-500"
          aria-label="إزالة الملف"
        >
          <X className="h-4 w-4" />
        </button>
      </li>
    ))}
  </ul>
)}







      </div>

      {/* نفس مبدأ ترتيب الأزرار: full width فوق بعض على الموبايل، صف واحد
          justify-between من sm فوق */}
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
          type="button"
          onClick={handleNextStep}
          className="h-10 w-full rounded-lg bg-[#003D9B] px-8 font-tajawal text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#002D72] sm:w-auto"
        >
          الخطوة التالية
        </Button>
      </div>
    </div>
  );
}