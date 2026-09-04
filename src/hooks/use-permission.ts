// المفروض هذا الـ hook يرجع هل المستخدم الحالي عنده صلاحية معينة ولا لأ،
// بالاعتماد على الـ permissions matrix اللي في src/lib/permissions،
// وعلى role المستخدم الحالي (من الـ auth/session).
"use client";

import { CURRENT_USER_ROLE, hasPermission, PermissionAction } from "@/lib/permissions";

export function usePermission(action: PermissionAction): boolean {
  return hasPermission(CURRENT_USER_ROLE, action);
}