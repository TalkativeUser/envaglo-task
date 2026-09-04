# نظام إدارة الفواتير — Boilerplate مبسط

الصفحة الرئيسية: `/` (لوحة التحكم) — الفورم: `/invoices/new`

## هيكل المشروع

```
src/
  app/
    layout.tsx                      # الـ layout الرئيسي (عربي + RTL)
    (dashboard)/
      layout.tsx                    # يجمع Sidebar + Header
      page.tsx                      # صفحة الرئيسية (فاضية)
      invoices/new/page.tsx         # صفحة إنشاء فاتورة (فاضية)

  components/
    layout/
      Sidebar.tsx                   # قائمة جانبية ثابتة (شكل بس)
      Header.tsx                    # هيدر ثابت (شكل بس)
    wizard/
      WizardContainer.tsx           # حاوية الـ Wizard (بدون state/تنقل حقيقي)
      WizardStepper.tsx             # الخطوات (شكل بس، بدون منطق تنقل)
      steps/
        BasicInfoStep.tsx           # فاضية + تعليق بما يجب أن تحتويه
        ItemsStep.tsx                # فاضية + تعليق
        ApprovalStep.tsx             # فاضية + تعليق
        ReviewStep.tsx                # فاضية + تعليق
    ui/
      button.tsx, card.tsx, badge.tsx, input.tsx, textarea.tsx,
      label.tsx, select.tsx, dialog.tsx, table.tsx, separator.tsx,
      skeleton.tsx                  # مكونات shadcn/ui جاهزة تستخدمها

  lib/
    rule-engine/
      types.ts, evaluator.ts, wizard-config.ts   # كل ملف فيه تعليق بس
    validation/schemas.ts             # تعليق بس
    permissions/permissions.ts        # تعليق بس

  hooks/
    use-wizard-rules.ts, use-autosave.ts, use-permission.ts   # تعليق بس

  store/
    wizard-store.ts                   # تعليق بس

  types/
    invoice.ts                        # تعليق بس
```

## ملاحظات مهمة

- كل ملف فيه "منطق" (rule engine, validation, store, hooks) **فاضي تماماً**
  وفيه تعليق عربي بيشرح المفروض يتكتب فيه إيه — إنت اللي هتكتب المنطق.
- صفحات الـ Wizard (الخطوات الأربعة) **فاضية تماماً**، من غير أي inputs أو
  selectors — إنت اللي هتضيفها.
- `WizardStepper` شكل بس (خطوة نشطة ثابتة عن طريق prop)، من غير أي منطق
  تنقل أو ربط بقواعد العمل.
- `Sidebar` و `Header` شكل ثابت بس، مفيش بيانات حقيقية أو صلاحيات.
- الـ dependencies (react-hook-form, zod, zustand) متسطبة في `package.json`
  جاهزة تستخدمها لما تبدأ تكتب المنطق، من غير ما تحتاج تنزلها بنفسك.

## shadcn/ui

فولدر `src/components/ui/` فيه مجموعة مكونات مكتوبة بنفس أسلوب وconventions
shadcn/ui (Radix + class-variance-authority + `cn()`)، جاهزة تستخدمها في أي
صفحة: `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Label`, `Select`,
`Dialog`, `Table`, `Separator`, `Skeleton`.

فيه كمان `components.json` في جذر المشروع، فلو حبيت تجيب مكون إضافي مش
موجود (زي `Toast` أو `Popover`)، تقدر تشغل على جهازك:

```bash
npx shadcn@latest add toast
```

وهيتحط تلقائياً في نفس الفولدر بنفس الشكل.
