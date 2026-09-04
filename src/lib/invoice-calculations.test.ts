import { describe, it, expect } from "vitest";
import { calculateItemTotals, isQuantityOverStock } from "./invoice-calculations";

describe("calculateItemTotals", () => {
  it("يحسب الإجمالي صح من غير خصم", () => {
    const result = calculateItemTotals({
      unitPriceBeforeDiscountBeforeTax: 100,
      quantity: 2,
      discountPercentage: 0,
      taxRate: 15,
    });

    expect(result.totalAfterDiscountBeforeTax).toBe(200);
    expect(result.totalVAT).toBe(30);
    expect(result.totalAfterDiscountWithTax).toBe(230);
  });

  it("يحسب الخصم والضريبة مع بعض صح", () => {
    const result = calculateItemTotals({
      unitPriceBeforeDiscountBeforeTax: 1000,
      quantity: 3,
      discountPercentage: 10,
      taxRate: 15,
    });

    expect(result.unitPriceAfterDiscountBeforeTax).toBe(900);
    expect(result.totalAfterDiscountBeforeTax).toBe(2700);
    expect(result.totalVAT).toBeCloseTo(405);
    expect(result.totalAfterDiscountWithTax).toBeCloseTo(3105);
  });

  it("يرجع أصفار لو السعر صفر أو غير موجود (مش NaN)", () => {
    const result = calculateItemTotals({
      unitPriceBeforeDiscountBeforeTax: 0,
      quantity: 5,
      discountPercentage: 0,
      taxRate: 15,
    });

    expect(result.totalAfterDiscountWithTax).toBe(0);
    expect(Number.isNaN(result.totalAfterDiscountWithTax)).toBe(false);
  });

  it("يرجع أصفار لو الكمية صفر أو غير موجودة", () => {
    const result = calculateItemTotals({
      unitPriceBeforeDiscountBeforeTax: 500,
      quantity: 0,
      discountPercentage: 0,
      taxRate: 15,
    });

    expect(result.totalAfterDiscountWithTax).toBe(0);
  });

  it("خصم 100% يخلي السعر بعد الخصم صفر", () => {
    const result = calculateItemTotals({
      unitPriceBeforeDiscountBeforeTax: 500,
      quantity: 1,
      discountPercentage: 100,
      taxRate: 15,
    });

    expect(result.unitPriceAfterDiscountBeforeTax).toBe(0);
    expect(result.totalAfterDiscountWithTax).toBe(0);
  });
});

describe("isQuantityOverStock", () => {
  it("يرجع true لو الكمية المطلوبة أكبر من المتاح", () => {
    expect(isQuantityOverStock(10, 5)).toBe(true);
  });

  it("يرجع false لو الكمية المطلوبة أقل من أو تساوي المتاح", () => {
    expect(isQuantityOverStock(5, 5)).toBe(false);
    expect(isQuantityOverStock(3, 5)).toBe(false);
  });

  it("يرجع false لو المخزون صفر والكمية المطلوبة صفر", () => {
    expect(isQuantityOverStock(0, 0)).toBe(false);
  });
});