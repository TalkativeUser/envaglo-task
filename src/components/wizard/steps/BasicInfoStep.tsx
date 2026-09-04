"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useWizardStore } from "@/store/wizard-store";
import { SectionTitle } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const CUSTOMERS = [
  { id: "cust-1", name: "شركة النور للتجارة والتوريدات" },
  { id: "cust-2", name: "مؤسسة الرياض للحلول الرقمية" },
  { id: "cust-3", name: "شركة الأفق للاستشارات الهندسية" },
  { id: "cust-4", name: "مجموعة الخليج القابضة" },
];

const CURRENCIES = [
  { code: "SAR", label: "ريال سعودي (SAR)" },
  { code: "USD", label: "دولار أمريكي (USD)" },
  { code: "AED", label: "درهم إماراتي (AED)" },
  { code: "EUR", label: "يورو (EUR)" },
];

const inputClassName =
  "flex h-11 w-full rounded-md border border-[#E2E4E9] bg-white px-3.5 py-2 font-tajawal text-sm text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20";

const selectClassName =
  "flex h-11 w-full appearance-none rounded-md border border-[#E2E4E9] bg-white px-3.5 py-2 pl-10 font-tajawal text-sm text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20";

export function BasicInfoStep() {
  // تفعيل الـ register و trigger من الـ Context الكبير
  const { register, trigger, formState: { errors }, watch } = useFormContext();
  const { setStep } = useWizardStore();

  // مراقبة نوع الدفع للتحكم في حقل تاريخ الاستحقاق
  const invoiceType = watch("basicInfo.invoiceType");

  /**
   * دالة الانتقال للخطوة التالية مع التحقق من صحة الحقول
   */
  const handleNextStep = async () => {
    // التحقق من حقول الخطوة الحالية
    const isValid = await trigger([
      "basicInfo.invoiceNumber",
      "basicInfo.customerId",
      "basicInfo.invoiceType",
      "basicInfo.currency",
      "basicInfo.issueDate",
      "basicInfo.dueDate", 
    ]);

    if (isValid) {
      setStep("items");
    } else {
      // عرض رسالة خطأ توضيحية
      const firstErrorField = Object.keys(errors)[0];
      const errorMessage = (errors as any)[firstErrorField]?.message || "يرجى تصحيح الأخطاء قبل المتابعة";
      toast.error(errorMessage as string, {
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="border-b border-[#E2E4E9] pb-4">
        <SectionTitle className="text-xl font-bold text-[#191C1D]">
          معلومات الفاتورة
        </SectionTitle>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        {/* رقم الفاتورة */}
        <div className="space-y-2">
          <label htmlFor="invoiceNumber" className="block font-tajawal text-sm font-medium text-[#434654]">
            رقم الفاتورة
          </label>
          <input
            id="invoiceNumber"
            type="text"
            readOnly
            {...register("basicInfo.invoiceNumber")} // ربط بـ register
            className="flex h-11 w-full rounded-md border border-[#E2E4E9] bg-[#F8F9FB] px-3.5 py-2 text-left font-mono text-sm text-[#191C1D] focus:outline-none"
          />
        </div>

        {/* العميل */}
        <div className="space-y-2">
          <label htmlFor="customerId" className="block font-tajawal text-sm font-medium text-[#434654]">
            العميل<span className="mr-0.5 text-red-500">*</span>
          </label>
          <div className="relative">
            <select 
              id="customerId" 
              {...register("basicInfo.customerId")} 
              className={`${selectClassName} ${(errors as any).basicInfo?.customerId ? 'border-red-500' : ''}`}
            >
              <option value="">اختر العميل...</option>
              {CUSTOMERS.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777F]" />
          </div>
          {(errors as any).basicInfo?.customerId && (
            <p className="text-xs text-red-500">{(errors as any).basicInfo.customerId.message}</p>
          )}
        </div>

        {/* نوع الدفع (Radio Buttons) */}
        <div className="space-y-2">
          <p className="block font-tajawal text-sm font-medium text-[#434654]">
            نوع الدفع
          </p>
          <div className="flex h-11 items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                value="credit"
                {...register("basicInfo.invoiceType")} // ربط الـ radio بنفس الـ field name
                className="peer sr-only"
              />
              <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-[#E2E4E9] after:hidden after:h-2 after:w-2 after:rounded-full after:bg-[#003D9B] after:content-[''] peer-checked:border-[#003D9B] peer-checked:after:block" />
              <span className="font-tajawal text-sm text-[#434654] peer-checked:font-bold peer-checked:text-[#191C1D]">
                آجل (Credit)
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                value="cash"
                {...register("basicInfo.invoiceType")}
                className="peer sr-only"
              />
              <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-[#E2E4E9] after:hidden after:h-2 after:w-2 after:rounded-full after:bg-[#003D9B] after:content-[''] peer-checked:border-[#003D9B] peer-checked:after:block" />
              <span className="font-tajawal text-sm text-[#434654] peer-checked:font-bold peer-checked:text-[#191C1D]">
                نقدي (Cash)
              </span>
            </label>
          </div>
        </div>

        {/* العملة */}
        <div className="space-y-2">
          <label htmlFor="currency" className="block font-tajawal text-sm font-medium text-[#434654]">
            العملة
          </label>
          <div className="relative">
            <select id="currency" {...register("basicInfo.currency")} className={selectClassName}>
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777F]" />
          </div>
        </div>

        {/* تاريخ الإصدار */}
        <div className="space-y-2">
          <label htmlFor="issueDate" className="block font-tajawal text-sm font-medium text-[#434654]">
            تاريخ الإصدار<span className="mr-0.5 text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="issueDate"
              type="date"
              {...register("basicInfo.issueDate")}
              className={`${inputClassName} pl-10 ${(errors as any).basicInfo?.issueDate ? 'border-red-500' : ''}`}
            />
            <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777F]" />
          </div>
          {(errors as any).basicInfo?.issueDate && (
            <p className="text-xs text-red-500">{(errors as any).basicInfo.issueDate.message}</p>
          )}
        </div>

     {invoiceType === "credit" && (
        <div className="space-y-2">
          <label htmlFor="dueDate" className="block font-tajawal text-sm font-medium text-[#434654]">
            تاريخ الاستحقاق<span className="mr-0.5 text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="dueDate"
              type="date"
              {...register("basicInfo.dueDate")}
              className={`${inputClassName} pl-10 ${(errors as any).basicInfo?.dueDate ? 'border-red-500' : ''}`}
            />
            <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777F]" />
          </div>
          {(errors as any).basicInfo?.dueDate && (
            <p className="text-xs text-red-500">تاريخ الاستحقاق مطلوب لأن نوع الدفع آجل</p>
          )}
        </div>
      )}



      </div>

      {/* ملاحظات الفاتورة */}
      <div className="space-y-2 pt-2">
        <label htmlFor="notes" className="block font-tajawal text-sm font-medium text-[#434654]">
          ملاحظات الفاتورة (تظهر للعميل)
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="أدخل أي شروط أو ملاحظات إضافية هنا..."
          {...register("basicInfo.notes")}
          className="flex min-h-[100px] w-full rounded-md border border-[#E2E4E9] bg-white p-3.5 font-tajawal text-sm text-[#191C1D] placeholder:text-[#74777F] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
        />
      </div>

      {/* الأزرار (ملاحظة: زر "الخطوة التالية" يمكن ربطه بدالة تغيير الخطوة لاحقاً) */}
      <div className="flex items-center justify-end gap-3 border-t border-[#E2E4E9] pt-6">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg border border-[#E2E4E9] bg-white px-7 font-tajawal text-sm font-medium text-[#434654] transition-colors hover:bg-slate-100"
        >
          إلغاء
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          className="h-10 rounded-lg bg-[#003D9B] px-7 font-tajawal text-sm font-semibold text-white transition-colors hover:bg-[#002D72]"
        >
          الخطوة التالية
        </Button>
      </div>
    </div>
  );
}