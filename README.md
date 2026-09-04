# ERP Invoice Wizard

![TypeScript](https://img.shields.io/badge/TypeScript-99.6%25-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![Zod](https://img.shields.io/badge/validation-zod-3E67B1)
![Zustand](https://img.shields.io/badge/state-zustand-orange)

فورم إصدار فواتير على شكل Wizard من 4 خطوات (بيانات أساسية، بنود الفاتورة، اعتماد، مراجعة)، مبني على **Next.js App Router** مع **react-hook-form**، **zod** للـ validation، و**zustand** لإدارة الحالة.

---

## 📁 Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout + Toaster
│   ├── globals.css
│   └── (dashboard)/
│       ├── layout.tsx                 # Sidebar + Header
│       ├── page.tsx                   # الصفحة الرئيسية
│       └── invoices/
│           └── new/
│               └── page.tsx           # صفحة الويزارد
│
├── components/
│   ├── common/
│   │   └── Typography.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── ui/                            # shadcn primitives
│   └── wizard/
│       ├── WizardContainer.tsx        # الأورشستريتور الرئيسي
│       ├── WizardStepper.tsx
│       ├── AutoSaveIndicator.tsx
│       ├── StatusBadge.tsx
│       ├── InvoiceStatusBadge.tsx
│       └── steps/
│           ├── BasicInfoStep.tsx
│           ├── ItemsStep.tsx
│           ├── ApprovalStep.tsx
│           └── ReviewStep.tsx
│
├── hooks/
│   ├── use-autosave.ts
│   ├── use-permission.ts
│   └── use-wizard-rules.ts
│
├── lib/
│   ├── api-client.ts                  # Mock API (submitInvoice, saveDraft)
│   ├── invoice-calculations.ts
│   ├── permissions.ts
│   ├── rule-engine.ts
│   ├── wizard-rules.config.ts
│   └── wizard-schema.ts               # zod schema + superRefine
│
├── store/
│   └── wizard-store.ts                # zustand store
│
└── types/
    ├── api.ts
    ├── invoice.ts
    └── rules.ts
```

---

## 🧩 مصطلحات المشروع

### Wizard Core

| المصطلح | الوصف |
|:--|:--|
| `Wizard` | الفورم متعدد الخطوات (4 خطوات) |
| `Step` / `StepId` | `basic-info` \| `items` \| `approval` \| `review` |
| `Stepper` | الشريط العلوي لعرض الخطوات والتنقل بينها |
| `completedSteps` | الخطوات اللي المستخدم خلّصها فعليًا (متخزنة في الـ store) |
| `wizardFormValues` | نسخة من بيانات الفورم متخزنة في الـ store عشان متضيعش عند الـ navigation |

### Rules & Validation

| المصطلح | الوصف |
|:--|:--|
| `Rule Engine` | بيقيّم شروط ديناميكية زي "اظهار خطوة لو `total > 50000`" |
| `visibleWhen` | شرط ظهور خطوة |
| `requiredWhen` | شرط مطلوبية حقل (زي `dueDate` لو `invoiceType = credit`) |
| `FieldRuleConfig` / `StepRuleConfig` | كونفيج القواعد الديناميكية |

### API Layer

| المصطلح | الوصف |
|:--|:--|
| `Mock Scenario` | `success` \| `validation` \| `conflict` \| `server-error` \| `unauthorized`، بتتحدد عبر `?mockScenario=` في الرابط |
| `ApiError` | الكلاس الموحد لأخطاء الـ API |
| `Auto-save` | حفظ تلقائي للمسودة كل 2 ثانية (debounce) |

### Permissions

| المصطلح | الوصف |
|:--|:--|
| `RBAC` / `permissions matrix` | صلاحيات كل دور (`sales`, `manager`) — `draft`, `submit`, `approve`, `reject` |

---

## ⚡ ملاحظات سريعة

- الفورم كله فورم واحد (`FormProvider`)، وكل خطوة بتستخدم `useFormContext`
- التحقق شامل schema واحد (`wizardFormSchema`) مع `superRefine` للحقول الديناميكية
- استخدم `?mockScenario=success` في الرابط عشان تجرب نجاح الإصدار
- الـ 409 العشوائي في `saveDraft` مقصود (8% احتمالية) — مش باج
