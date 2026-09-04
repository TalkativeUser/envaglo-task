// types/api.ts

/**
 * أكواد حالة الاستجابة اللي الـ API ممكن يرجّعها.
 * بنعرّفهم هنا كـ union type عشان نقدر نتحكم فيهم بشكل موحّد
 * في كل مكان بيستخدم الـ API، بدل ما كل ملف يكتب الأرقام يدوي.
 */
export type ApiStatusCode = 200 | 201 | 400 | 401 | 403 | 409 | 422 | 500;

/**
 * شكل الخطأ الموحّد اللي كل استجابة فاشلة من الـ API لازم ترجّعه.
 * - message: رسالة عامة تتعرض للمستخدم (زي في Toast)
 * - fieldErrors: أخطاء خاصة بحقول معينة (بيتفيد أكتر مع 422 Validation)
 * - status: نفس كود الحالة، بنكرره هنا عشان يبقى متاح مع الـ error object نفسه
 */
export interface ApiErrorPayload {
  status: ApiStatusCode;
  message: string;
  fieldErrors?: Record<string, string>; // مثال: { "itemsSection.items.0.quantity": "الكمية غير متوفرة" }
}

/**
 * Custom Error class بدل ما نرمي string عادي.
 * الفايدة: أي حد ماسك catch (error) يقدر يعمل (error instanceof ApiError)
 * ويوصل بسهولة لـ status و fieldErrors، بدل ما يفكّك object عادي يدوي.
 */
export class ApiError extends Error {
  status: ApiStatusCode;
  fieldErrors?: Record<string, string>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.fieldErrors = payload.fieldErrors;
  }
}

/**
 * شكل الاستجابة الناجحة من الـ API وقت إرسال الفاتورة.
 */
export interface InvoiceSubmitResponse {
  id: string;
  status: "draft" | "pending_approval" | "approved" | "rejected";
  createdAt: string;
}