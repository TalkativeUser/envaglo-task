import { describe, it, expect } from "vitest";
import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("Sales يقدر يعمل draft و submit", () => {
    expect(hasPermission("sales", "draft")).toBe(true);
    expect(hasPermission("sales", "submit")).toBe(true);
  });

  it("Sales مايقدرش يعتمد أو يرفض فاتورة", () => {
    expect(hasPermission("sales", "approve")).toBe(false);
    expect(hasPermission("sales", "reject")).toBe(false);
  });

  it("Manager يقدر يعمل كل الحاجات", () => {
    expect(hasPermission("manager", "draft")).toBe(true);
    expect(hasPermission("manager", "submit")).toBe(true);
    expect(hasPermission("manager", "approve")).toBe(true);
    expect(hasPermission("manager", "reject")).toBe(true);
  });
});