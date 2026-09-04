import { describe, it, expect } from "vitest";
import { evaluateRule } from "./rule-engine";
import { VisibilityRule } from "@/types/rules";

describe("evaluateRule - شرط مفرد (leaf condition)", () => {
  it("equals: بيرجع true لو القيمة متطابقة", () => {
    const rule: VisibilityRule = { field: "basicInfo.invoiceType", operator: "equals", value: "cash" };
    expect(evaluateRule(rule, { basicInfo: { invoiceType: "cash" } })).toBe(true);
    expect(evaluateRule(rule, { basicInfo: { invoiceType: "credit" } })).toBe(false);
  });

  it("greaterThan: بيرجع true لو القيمة أكبر من الحد", () => {
    const rule: VisibilityRule = { field: "total", operator: "greaterThan", value: 50000 };
    expect(evaluateRule(rule, { total: 60000 })).toBe(true);
    expect(evaluateRule(rule, { total: 50000 })).toBe(false);
    expect(evaluateRule(rule, { total: 10000 })).toBe(false);
  });

  it("greaterThanOrEqual / lessThan / lessThanOrEqual", () => {
    expect(evaluateRule({ field: "total", operator: "greaterThanOrEqual", value: 50000 }, { total: 50000 })).toBe(true);
    expect(evaluateRule({ field: "total", operator: "lessThan", value: 50000 }, { total: 49999 })).toBe(true);
    expect(evaluateRule({ field: "total", operator: "lessThanOrEqual", value: 50000 }, { total: 50000 })).toBe(true);
  });

  it("in: بيرجع true لو القيمة موجودة في الليستة", () => {
    const rule: VisibilityRule = { field: "basicInfo.invoiceType", operator: "in", value: ["cash", "credit"] };
    expect(evaluateRule(rule, { basicInfo: { invoiceType: "cash" } })).toBe(true);
    expect(evaluateRule(rule, { basicInfo: { invoiceType: "other" } })).toBe(false);
  });

  it("isTruthy: بيرجع true لو القيمة truthy", () => {
    const rule: VisibilityRule = { field: "hasTaxableItems", operator: "isTruthy" };
    expect(evaluateRule(rule, { hasTaxableItems: true })).toBe(true);
    expect(evaluateRule(rule, { hasTaxableItems: false })).toBe(false);
    expect(evaluateRule(rule, {})).toBe(false);
  });

  it("مفيش rule خالص = دايمًا true", () => {
    expect(evaluateRule(undefined, { total: 0 })).toBe(true);
  });

  it("مسار nested غير موجود يرجع false من غير ما ينهار", () => {
    const rule: VisibilityRule = { field: "a.b.c", operator: "equals", value: "x" };
    expect(evaluateRule(rule, {})).toBe(false);
  });
});

describe("evaluateRule - شروط مركّبة (AND / OR)", () => {
  it("all (AND): كل الشروط لازم تتحقق", () => {
    const rule: VisibilityRule = {
      all: [
        { field: "basicInfo.invoiceType", operator: "equals", value: "credit" },
        { field: "total", operator: "greaterThan", value: 50000 },
      ],
    };
    expect(evaluateRule(rule, { basicInfo: { invoiceType: "credit" }, total: 60000 })).toBe(true);
    expect(evaluateRule(rule, { basicInfo: { invoiceType: "cash" }, total: 60000 })).toBe(false);
  });

  it("any (OR): شرط واحد يكفي", () => {
    const rule: VisibilityRule = {
      any: [
        { field: "basicInfo.invoiceType", operator: "equals", value: "credit" },
        { field: "total", operator: "greaterThan", value: 50000 },
      ],
    };
    expect(evaluateRule(rule, { basicInfo: { invoiceType: "cash" }, total: 60000 })).toBe(true);
    expect(evaluateRule(rule, { basicInfo: { invoiceType: "cash" }, total: 100 })).toBe(false);
  });

  it("تداخل all جوه any (nested rules)", () => {
    const rule: VisibilityRule = {
      any: [
        {
          all: [
            { field: "basicInfo.invoiceType", operator: "equals", value: "credit" },
            { field: "total", operator: "greaterThan", value: 50000 },
          ],
        },
        { field: "hasTaxableItems", operator: "isTruthy" },
      ],
    };

    expect(
      evaluateRule(rule, { basicInfo: { invoiceType: "cash" }, total: 100, hasTaxableItems: true })
    ).toBe(true);

    expect(
      evaluateRule(rule, { basicInfo: { invoiceType: "cash" }, total: 100, hasTaxableItems: false })
    ).toBe(false);
  });
});