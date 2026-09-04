// lib/rule-engine.ts
import { RuleCondition, VisibilityRule } from "@/types/rules";

/**
 * يجيب قيمة من object بمسار nested زي "basicInfo.invoiceType"
 */
function getValueByPath(data: Record<string, any>, path: string): unknown {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), data as any);
}

/**
 * يقيّم شرط واحد بس (leaf condition)
 */
function evaluateCondition(condition: RuleCondition, context: Record<string, any>): boolean {
  const actual = getValueByPath(context, condition.field);
  const expected = condition.value;

  switch (condition.operator) {
    case "equals":
      return actual === expected;
    case "notEquals":
      return actual !== expected;
    case "greaterThan":
      return typeof actual === "number" && actual > (expected as number);
    case "greaterThanOrEqual":
      return typeof actual === "number" && actual >= (expected as number);
    case "lessThan":
      return typeof actual === "number" && actual < (expected as number);
    case "lessThanOrEqual":
      return typeof actual === "number" && actual <= (expected as number);
    case "in":
      return Array.isArray(expected) && expected.includes(actual);
    case "contains":
      return Array.isArray(actual) && actual.includes(expected);
    case "isTruthy":
      return Boolean(actual);
    default:
      // لو حد ضاف operator جديد ونسي يعرّفه هنا، منمنعش الابليكيشن ينهار
      console.warn(`Unknown rule operator: ${(condition as any).operator}`);
      return false;
  }
}

/**
 * يقيّم شجرة قواعد كاملة (تدعم all / any / condition مفردة) — Recursive
 */
export function evaluateRule(rule: VisibilityRule | undefined, context: Record<string, any>): boolean {
  if (!rule) return true; // مفيش شرط = دايمًا ظاهر/مطلوب

  if ("all" in rule) {
    return rule.all.every((r) => evaluateRule(r, context));
  }
  if ("any" in rule) {
    return rule.any.some((r) => evaluateRule(r, context));
  }
  // leaf condition
  return evaluateCondition(rule as RuleCondition, context);
}