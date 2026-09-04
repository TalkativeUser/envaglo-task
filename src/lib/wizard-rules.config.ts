// lib/wizard-rules.config.ts
import { StepRuleConfig, FieldRuleConfig } from "@/types/rules";

export const wizardStepsConfig: StepRuleConfig[] = [
  { id: "basic-info", title: "البيانات الأساسية" },
  { id: "items", title: "بنود الفاتورة" },
  {
    id: "approval",
    title: "التكلفة والاعتماد",
    visibleWhen: {
      field: "total",
      operator: "greaterThan",
      value: 50000,
    },
  },
  { id: "review", title: "المراجعة والإصدار" },
];

export const wizardFieldsConfig: FieldRuleConfig[] = [
  {
    field: "approvalSection.costCenterId",
    requiredWhen: { field: "total", operator: "greaterThan", value: 50000 },
  },
  {
    field: "approvalSection.departmentId",
    requiredWhen: { field: "total", operator: "greaterThan", value: 50000 },
  },
  {
    field: "approvalSection.managerId",
    requiredWhen: { field: "total", operator: "greaterThan", value: 50000 },
  },
  {
    field: "basicInfo.dueDate",
    requiredWhen: { field: "basicInfo.invoiceType", operator: "equals", value: "credit" },
  },
];