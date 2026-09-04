// components/wizard/WizardContainer.tsx
"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useWizardStore } from "@/store/wizard-store";
import { StepId } from "@/types/invoice";
import { toast } from "sonner";

import { WizardStepper } from "./WizardStepper";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ItemsStep } from "./steps/ItemsStep";
import { ApprovalStep } from "./steps/ApprovalStep";
import { ReviewStep } from "./steps/ReviewStep";
import { useAutoSave } from "@/hooks/use-autosave";
// الـ Schema بقى مستورد من ملف منفصل (lib/wizard-schema.ts) بدل ما يتعرّف هنا
import { wizardFormSchema, WizardFormValues } from "@/lib/wizard-schema";

// ملفات الـ Rule Engine: بيتحكموا في ظهور الخطوات ومطلوبية الحقول ديناميكيًا
// بدل ما يكونوا مكتوبين hardcoded جوه الكومبوننتات
import { wizardStepsConfig, wizardFieldsConfig } from "@/lib/wizard-rules.config";
import { evaluateRule } from "@/lib/rule-engine";

// طبقة الـ Mock API: بتحاكي التعامل مع Backend حقيقي بأكواد حالة مختلفة
// (200/409/422/500...) عشان نقدر نتعامل مع كل حالة بشكل صحيح
import { submitInvoice, getUserFriendlyErrorMessage, MockScenario } from "@/lib/api-client";
import { ApiError } from "@/types/api";

export function WizardContainer() {

  
  const {
  currentStepId,
  setStep,
  setInvoiceStatus,
  wizardFormValues,
  setWizardFormValues,
  completedSteps,
  setCompletedSteps,
} = useWizardStore();


  const searchParams = useSearchParams();
  const mockScenario = (searchParams.get("mockScenario") as MockScenario) || undefined;


  const [isSubmitting, setIsSubmitting] = React.useState(false);

 // القيم الافتراضية الأصلية (فاتورة جديدة فاضية)
const baseDefaultValues: WizardFormValues = {
  basicInfo: {
    invoiceNumber: "INV-2024-00142",
    customerId: "",
    invoiceType: "cash",
    currency: "SAR",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  },
  itemsSection: {
    items: [],
  },
  approvalSection: {
    costCenterId: "",
    departmentId: "",
    managerId: "",
    approvalNotes: "",
    attachments: [],
  },
};

const methods = useForm<WizardFormValues>({
  resolver: zodResolver(wizardFormSchema),
  mode: "onChange",
  defaultValues: {
    ...baseDefaultValues,
    ...wizardFormValues,
    basicInfo: { ...baseDefaultValues.basicInfo, ...wizardFormValues?.basicInfo },
    itemsSection: { ...baseDefaultValues.itemsSection, ...wizardFormValues?.itemsSection },
    approvalSection: { ...baseDefaultValues.approvalSection, ...wizardFormValues?.approvalSection },
  },
});

  // ==========================================
  // حساب الإجمالي الكلي للفاتورة + بناء context للـ Rule Engine
  // ==========================================

   const watchedFormValues = methods.watch();
  useAutoSave({ data: watchedFormValues, enabled: true });

  React.useEffect(() => {
  setWizardFormValues(watchedFormValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [JSON.stringify(watchedFormValues)]);


  const items = methods.watch("itemsSection.items") || [];
  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.totalAfterDiscountWithTax || 0), 0);

  // الـ context اللي المحرك (rule-engine) هيقيّم عليه كل القواعد.
  // أي قاعدة جديدة في المستقبل تحتاج تشاور على حقل جديد، لازم الحقل ده
  // يتضاف هنا الأول عشان المحرك يقدر يوصله.
  const ruleContext = {
    total: totalAmount,
    basicInfo: methods.watch("basicInfo"),
  };

  // الخطوات الظاهرة فعليًا دلوقتي، بعد تطبيق كل قواعد visibleWhen
  const visibleSteps = wizardStepsConfig.filter((step) => evaluateRule(step.visibleWhen, ruleContext));

  // مزامنة: لو الخطوة الحالية اختفت فجأة (بسبب تغيّر شرط، مثلًا المستخدم
  // قلل قيمة الفاتورة وهو واقف في خطوة الاعتماد)، ننقله تلقائيًا لأقرب
  // خطوة ظاهرة بدل ما يفضل واقف في خطوة مش موجودة أصلًا في الـ Stepper
  React.useEffect(() => {
    const stillVisible = visibleSteps.some((s) => s.id === currentStepId);
    if (!stillVisible) {
      const fallback = visibleSteps[visibleSteps.length - 1]?.id ?? "basic-info";
      setStep(fallback as StepId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSteps.map((s) => s.id).join(","), currentStepId]);

  // ==========================================
  // دوال التحقق من صحة كل خطوة
  // ==========================================

  /**
   * التحقق من صحة الخطوة الحالية قبل الانتقال للخطوة التالية
   */
  const validateCurrentStep = async (targetStepId: StepId): Promise<boolean> => {
    const currentStepFields = getStepFields(currentStepId);

    let isValid = true;
    for (const field of currentStepFields) {
      const fieldValid = await methods.trigger(field as any);
      if (!fieldValid) {
        isValid = false;
      }
    }

    if (!isValid) {
      // getFirstErrorMessage: بتدور recursively جوه شجرة الأخطاء المتداخلة
      // (زي errors.basicInfo.invoiceNumber.message) وترجع أول رسالة حقيقية،
      // بدل الطريقة القديمة (Object.keys(errors)[0]) اللي كانت بترجع اسم
      // الـ section مش اسم الحقل، فكانت الرسالة دايمًا تطلع فاضية/افتراضية
      const firstErrorMessage = getFirstErrorMessage(methods.formState.errors);
      toast.error(firstErrorMessage || "يرجى تصحيح الأخطاء قبل المتابعة", {
        duration: 3000,
      });
      return false;
    }

    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId]);
    }

    return true;
  };

  /**
   * الحصول على أسماء حقول كل خطوة عشان نتحقق منها وقت الانتقال.
   * خطوة "approval" بقت ديناميكية بالكامل: بتاخد الحقول المطلوبة فعليًا
   * دلوقتي من wizardFieldsConfig حسب حالة الفاتورة، بدل ليستة ثابتة.
   */
  const getStepFields = (stepId: StepId): string[] => {
    switch (stepId) {
      case "basic-info":
        return [
          "basicInfo.invoiceNumber",
          "basicInfo.customerId",
          "basicInfo.invoiceType",
          "basicInfo.currency",
          "basicInfo.issueDate",
           "basicInfo.dueDate", 
        ];
      case "items":
        return ["itemsSection.items"];
      case "approval":
        return wizardFieldsConfig
          .filter(
            (rule) =>
              rule.field.startsWith("approvalSection.") && evaluateRule(rule.requiredWhen, ruleContext)
          )
          .map((rule) => rule.field);
      case "review":
        return []; // خطوة المراجعة عرض فقط، مفيش حقول تتحقق منها
      default:
        return [];
    }
  };

  /**
   * التعامل مع الانتقال بين الخطوات (بالضغط على الـ Stepper نفسه)
   */
  const handleStepChange = async (targetStepId: string) => {
    const stepId = targetStepId as StepId;

    // ترتيب الخطوات بيتحدد من visibleSteps الحالية، مش array ثابت،
    // عشان يفضل صحيح حتى لو خطوة الاعتماد ظاهرة أو مخفية
    const stepsOrder = visibleSteps.map((s) => s.id) as StepId[];
    const currentIndex = stepsOrder.indexOf(currentStepId);
    const targetIndex = stepsOrder.indexOf(stepId);

    // السماح بالرجوع للخلف بدون أي تحقق
    if (targetIndex < currentIndex) {
      setStep(stepId);
      return;
    }

    // التحقق من صحة الخطوة الحالية قبل السماح بالانتقال للأمام
    const isValid = await validateCurrentStep(stepId);
    if (isValid) {
      setStep(stepId);
    }
  };

  // ==========================================
  // دالة Submit النهائية — بتستخدم طبقة الـ Mock API الحقيقية
  // ==========================================
  const onSubmit = async (data: WizardFormValues) => {
    // حماية من الإرسال المزدوج
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
     
      
   const response = await submitInvoice({ data, scenario: mockScenario });

      // نجاح فعلي (201/200): بنحدّث حالة الفاتورة في الـ store عشان
      // أي Badge في الواجهة يعكس الحالة الحقيقية القادمة من الـ API
      setInvoiceStatus(response.status);

      toast.success(`تم إرسال الفاتورة بنجاح! رقم الفاتورة: ${response.id}`, {
        duration: 3000,
      });



    } catch (error) {
      // بنتأكد إن الخطأ من نوع ApiError اللي إحنا عرّفناه في types/api.ts،
      // عشان نقدر نوصل بأمان لـ status و fieldErrors
      if (error instanceof ApiError) {
        switch (error.status) {
          case 422: {
            // خطأ Validation راجع من "السيرفر" — نوجّه المستخدم تلقائيًا
            // لأول خطوة فيها الحقل اللي المشكلة فيه
            const firstFieldPath = error.fieldErrors ? Object.keys(error.fieldErrors)[0] : undefined;
            if (firstFieldPath?.startsWith("itemsSection")) {
              setStep("items");
            } else if (firstFieldPath?.startsWith("approvalSection")) {
              setStep("approval");
            } else if (firstFieldPath?.startsWith("basicInfo")) {
              setStep("basic-info");
            }
            toast.error(error.message, { duration: 4000 });
            break;
          }

          case 409:
            // تعارض في المسودة (حد تاني عدّل نفس الفاتورة) — رسالة أطول
            // عشان المستخدم يقدر يقرأها ويقرر قبل ما تختفي
            toast.error(error.message, { duration: 6000 });
            break;

          case 403:
          case 401:
            // مشاكل صلاحيات/جلسة
            toast.error(getUserFriendlyErrorMessage(error.status, error.message), { duration: 4000 });
            break;

          case 500:
          default:
            // أي خطأ سيرفر غير متوقع
            toast.error(getUserFriendlyErrorMessage(error.status, error.message), { duration: 4000 });
            break;
        }
      } else {
        // خطأ غير متوقع تمامًا (مش حتى ApiError، زي مشكلة شبكة عامة)
        console.error("خطأ غير متوقع أثناء إرسال الفاتورة:", error);
        toast.error("حدث خطأ غير متوقع أثناء إرسال البيانات", { duration: 3000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const onInvalidSubmit = (errors: any) => {
  const firstErrorMessage = getFirstErrorMessage(errors);
  toast.error(firstErrorMessage || "يرجى تصحيح الأخطاء قبل إصدار الفاتورة", {
    duration: 4000,
  });

  if (errors.itemsSection) {
    setStep("items");
  } else if (errors.approvalSection) {
    setStep("approval");
  } else if (errors.basicInfo) {
    setStep("basic-info");
  }
};

  const renderStepContent = () => {
    switch (currentStepId) {
      case "basic-info":
        return <BasicInfoStep />;
      case "items":
        return <ItemsStep />;
      case "approval":
        return <ApprovalStep />;
      case "review":
        return <ReviewStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onInvalidSubmit)} className="w-full space-y-8">
          <div className="w-full">
          <WizardStepper
            activeStepId={currentStepId}
            steps={visibleSteps}
            formContext={ruleContext}
            onStepClick={handleStepChange}
            completedSteps={completedSteps}
          />
        </div>

        <div className="rounded-xl border border-[#E2E4E9] bg-white p-6 md:p-8 shadow-xs transition-all">
          {renderStepContent()}
        </div>
      </form>
    </FormProvider>
  );
}

// ==========================================
// Helper: استخراج أول رسالة خطأ حقيقية من شجرة أخطاء React Hook Form
// المتداخلة (زي errors.basicInfo.invoiceNumber.message).
// بدون الدالة دي، Object.keys(errors)[0] كانت بترجع اسم الـ section
// (مثل "basicInfo") مش اسم الحقل، فالرسالة كانت دايمًا تطلع فاضية.
// ==========================================
function getFirstErrorMessage(errors: any): string | undefined {
  for (const key in errors) {
    const err = errors[key];
    if (err?.message) return err.message as string;
    if (typeof err === "object" && err !== null) {
      const nested = getFirstErrorMessage(err);
      if (nested) return nested;
    }
  }
  return undefined;
}