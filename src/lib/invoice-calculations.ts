// lib/invoice-calculations.ts

export interface ItemCalculationInput {
  unitPriceBeforeDiscountBeforeTax: number;
  quantity: number;
  discountPercentage: number;
  taxRate: number;
}

export interface ItemCalculationResult {
  unitPriceBeforeDiscountWithTax: number;
  unitPriceAfterDiscountBeforeTax: number;
  unitPriceAfterDiscountWithTax: number;
  totalAfterDiscountBeforeTax: number;
  totalVAT: number;
  totalAfterDiscountWithTax: number;
}

export function calculateItemTotals(input: ItemCalculationInput): ItemCalculationResult {
  const { unitPriceBeforeDiscountBeforeTax, quantity, discountPercentage, taxRate } = input;

  // لو القيم الأساسية غير صالحة، رجّع أصفار بدل NaN منتشر في الفورم
  if (
    !unitPriceBeforeDiscountBeforeTax ||
    !quantity ||
    discountPercentage === undefined ||
    discountPercentage === null ||
    !taxRate
  ) {
    return {
      unitPriceBeforeDiscountWithTax: 0,
      unitPriceAfterDiscountBeforeTax: 0,
      unitPriceAfterDiscountWithTax: 0,
      totalAfterDiscountBeforeTax: 0,
      totalVAT: 0,
      totalAfterDiscountWithTax: 0,
    };
  }

  const unitPriceBeforeDiscountWithTax = unitPriceBeforeDiscountBeforeTax * (1 + taxRate / 100);
  const discountAmount = unitPriceBeforeDiscountBeforeTax * (discountPercentage / 100);
  const unitPriceAfterDiscountBeforeTax = unitPriceBeforeDiscountBeforeTax - discountAmount;
  const unitPriceAfterDiscountWithTax = unitPriceAfterDiscountBeforeTax * (1 + taxRate / 100);
  const totalAfterDiscountBeforeTax = unitPriceAfterDiscountBeforeTax * quantity;
  const totalVAT = totalAfterDiscountBeforeTax * (taxRate / 100);
  const totalAfterDiscountWithTax = totalAfterDiscountBeforeTax + totalVAT;

  return {
    unitPriceBeforeDiscountWithTax,
    unitPriceAfterDiscountBeforeTax,
    unitPriceAfterDiscountWithTax,
    totalAfterDiscountBeforeTax,
    totalVAT,
    totalAfterDiscountWithTax,
  };
}

export function isQuantityOverStock(quantity: number, availableStock: number): boolean {
  return quantity > availableStock;
}