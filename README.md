ERP Invoice Wizard

Next.js (App Router) + react-hook-form + zod + zustand

Structure
src/
├── app/
│   ├── layout.tsx                  # root layout, Toaster هنا
│   ├── globals.css
│   └── (dashboard)/
│       ├── layout.tsx              # Sidebar + Header
│       ├── page.tsx                # home
│       └── invoices/new/page.tsx   # صفحة الويزارد
│
├── components/
│   ├── common/Typography.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── ui/                         # shadcn primitives (button, card, select...)
│   └── wizard/
│       ├── WizardContainer.tsx     # الأورشستريتور الرئيسي
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
│   ├── api-client.ts               # mock API (submitInvoice, saveDraft)
│   ├── invoice-calculations.ts
│   ├── permissions.ts
│   ├── rule-engine.ts
│   ├── wizard-rules.config.ts
│   └── wizard-schema.ts            # zod schema + superRefine
│
├── store/
│   └── wizard-store.ts             # zustand
│
└── types/
    ├── api.ts
    ├── invoice.ts
    └── rules.ts
مصطلحات المشروع
Wizard — الفورم متعدد الخطوات (4 خطوات)
Step / StepId — basic-info, items, approval, review
Stepper — الشريط اللي فوق بيوري الخطوات ويسمح بالتنقل بينها
Rule Engine — بيقيّم شروط زي "الخطوة دي تظهر لو total > 50000"
visibleWhen — شرط ظهور خطوة
requiredWhen — شرط مطلوبية حقل (زي dueDate لو النوع credit)
FieldRuleConfig / StepRuleConfig — كونفيج القواعد الديناميكية
Mock Scenario — سيناريوهات وهمية للـ API (success / validation / conflict / server-error / unauthorized) بتتحدد من query param mockScenario
ApiError — الكلاس الموحد لأخطاء الـ API
Auto-save — حفظ تلقائي للمسودة كل 2 ثانية (debounce)
completedSteps — الخطوات اللي المستخدم خلّصها فعليًا
wizardFormValues — نسخة من بيانات الفورم متخزنة في الـ store عشان متضيعش عند الـ navigation
RBAC / permissions matrix — sales / manager وصلاحيات كل واحد (draft, submit, approve, reject)
