// lib/api-client.ts
//
// طبقة الـ Mock API الخاصة بالمشروع.
// ==========================================================
// الهدف من الملف ده: محاكاة التعامل مع Backend حقيقي (زي ما لو
// كنا بنعمل fetch() فعلي)، من غير ما يكون فيه سيرفر فعلي شغال.
// الفايدة: كل كود إرسال الفاتورة (WizardContainer) بيتعامل مع
// الدالة دي بنفس الشكل اللي هيتعامل بيه مع API حقيقي لاحقًا —
// يعني لما السيرفر الحقيقي يبقى جاهز، هنستبدل بس محتوى الدالة
// دي (submitInvoice) بـ fetch() فعلي، وباقي المشروع مش هيتغيّر.
//
// ==========================================================
// إزاي تختبرها في المتصفح؟
// ضيف query parameter اسمه mockScenario في الـ URL بعد ما تفتح
// صفحة إنشاء الفاتورة، مثال:
//   /invoices/new?mockScenario=success
//   /invoices/new?mockScenario=validation   → يرجّع 422
//   /invoices/new?mockScenario=conflict     → يرجّع 409
//   /invoices/new?mockScenario=server-error → يرجّع 500
// لو معملتش query param، هيشتغل السلوك الافتراضي (409 Conflict)
// عشان تقدر تختبر أهم Edge Case (تعارض المسودات) بسهولة.
// ==========================================================

import { ApiError, ApiStatusCode, InvoiceSubmitResponse } from "@/types/api";

// أنواع السيناريوهات المتاحة للاختبار اليدوي من المتصفح
export type MockScenario = "success" | "validation" | "conflict" | "server-error" | "unauthorized";

interface SubmitInvoiceParams {
  data: unknown; // بيانات الفورم الكاملة (WizardFormValues)
  scenario?: MockScenario; // اختياري: بيتحدد من الـ query param وقت التطوير/الاختبار
}

/**
 * دالة محاكاة إرسال الفاتورة للـ Backend.
 * بترجّع Promise بيتأخر شوية (زي أي network request حقيقي)،
 * وبترمي ApiError بأكواد الحالة المختلفة حسب الـ scenario.
 */
export async function submitInvoice({
  data,
  scenario = "success", // الافتراضي 409 عشان نتأكد إن أهم Edge Case اتغطى دايمًا
}: SubmitInvoiceParams): Promise<InvoiceSubmitResponse> {
  // محاكاة زمن استجابة شبكة حقيقي (800ms) — يفيد في اختبار الـ Loading state
  await new Promise((resolve) => setTimeout(resolve, 800));

  switch (scenario) {
    case "success":
      // 201 Created — الحالة السعيدة، الفاتورة اتسجلت فعلًا
      return {
        id: `INV-${Date.now()}`,
        status: "pending_approval",
        createdAt: new Date().toISOString(),
      };

    case "validation":
      // 422 Unprocessable Entity — البيانات وصلت لكن فيها خطأ في حقل معين
      // (زي مثال الورقة: الكمية أكبر من المخزون المتاح فعليًا وقت الإرسال،
      // حتى لو التحقق الأمامي عدّاها لسبب ما)
      throw new ApiError({
        status: 422,
        message: "الكمية المطلوبة غير متوفرة في المخزون",
        fieldErrors: {
          "itemsSection.items.0.quantity": "الكمية المطلوبة تتجاوز المخزون المتاح حاليًا",
        },
      });

    case "conflict":
      // 409 Conflict — حد تاني عدّل نفس المسودة في نفس الوقت (Auto-save clash)
      throw new ApiError({
        status: 409,
        message: "تم تعديل هذه المسودة من مستخدم آخر. يرجى تحديث الصفحة ومراجعة أحدث نسخة قبل الإرسال.",
      });

    case "unauthorized":
      // 401/403 — المستخدم مش مسجل دخول أو معندوش صلاحية يعمل الحركة دي
      throw new ApiError({
        status: 403,
        message: "ليس لديك صلاحية اعتماد هذا النوع من الفواتير",
      });

    case "server-error":
      // 500 — خطأ غير متوقع من السيرفر، مفيش تفاصيل تتعرض للمستخدم
      throw new ApiError({
        status: 500,
        message: "حدث خطأ غير متوقع، يرجى المحاولة لاحقًا",
      });

    default:
      throw new ApiError({ status: 500, message: "سيناريو غير معروف" });
  }
}







/**
 * دالة محاكاة حفظ المسودة تلقائيًا (Auto-save).
 * بتتنادى من use-autosave.ts كل ما المستخدم يوقف عن الكتابة لفترة قصيرة.
 * بترمي 409 بنسبة ضئيلة عشان نقدر نختبر تعارض المسودات (Draft Conflict)
 * زي ما لو حد تاني بيعدّل نفس الفاتورة في نفس الوقت.
 */
export async function saveDraft(data: unknown): Promise<{ savedAt: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (Math.random() < 0.08) {
    throw new ApiError({
      status: 409,
      message: "تم تعديل هذه المسودة من مستخدم آخر. يرجى تحديث الصفحة قبل المتابعة.",
    });
  }

  return { savedAt: new Date().toISOString() };
}



/**
 * Helper: بيحوّل أي status code لرسالة toast مناسبة ومفهومة للمستخدم النهائي،
 * بدل ما نعرض له رسائل تقنية أو status code خام.
 * بنستخدمها في WizardContainer.onSubmit عشان نوحّد شكل الرسائل.
 */
export function getUserFriendlyErrorMessage(status: ApiStatusCode, fallbackMessage: string): string {
  switch (status) {
    case 400:
      return "البيانات المرسلة غير صحيحة، يرجى المراجعة";
    case 401:
      return "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى";
    case 403:
      return fallbackMessage; // رسالة الصلاحيات بتكون واضحة أصلًا من الـ API
    case 409:
      return fallbackMessage; // رسالة التعارض محتاجة تفاصيل خاصة، سايبينها زي ما جت
    case 422:
      return fallbackMessage; // رسالة الـ validation بتكون محددة للحقل
    case 500:
      return "حدث خطأ في الخادم، فريقنا التقني تم إبلاغه";
    default:
      return fallbackMessage;
  }
}