// lib/permissions.ts
//
// المصدر المركزي الوحيد لكل منطق الصلاحيات في المشروع (RBAC).

export type UserRole = "sales" | "manager";

export type PermissionAction = "draft" | "submit" | "approve" | "reject";

// المستخدم الحالي: mock ثابت بما إن مفيش auth/session حقيقي في المشروع.
// غيّر القيمة دي يدويًا لـ "manager" عشان تختبر صلاحيات مختلفة.
export const CURRENT_USER_ROLE: UserRole = "sales";

const PERMISSIONS_MATRIX: Record<UserRole, PermissionAction[]> = {
  sales: ["draft", "submit"],
  manager: ["draft", "submit", "approve", "reject"],
};

export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  return PERMISSIONS_MATRIX[role]?.includes(action) ?? false;
}