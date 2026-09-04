// types/rules.ts

export type RuleOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "in"
  | "contains"
  | "isTruthy";

export interface RuleCondition {
  field: string; // مسار الحقل، مثال: "total" أو "basicInfo.invoiceType"
  operator: RuleOperator;
  value?: unknown;
}

// يدعم شرط واحد، أو AND/OR بين عدة شروط
export type VisibilityRule =
  | RuleCondition
  | { all: VisibilityRule[] } // AND
  | { any: VisibilityRule[] }; // OR

export interface StepRuleConfig {
  id: string;
  title: string;
  visibleWhen?: VisibilityRule; // لو مش موجودة = الخطوة تظهر دايمًا
}

export interface FieldRuleConfig {
  field: string; // مسار الحقل في الفورم، مثال: "approvalSection.costCenterId"
  requiredWhen?: VisibilityRule; // لو الشرط اتحقق يبقى الحقل required
}