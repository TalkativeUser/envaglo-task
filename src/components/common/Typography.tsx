import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface TypographyProps<T extends React.ElementType = "div"> {
  as?: T;
  children: React.ReactNode;
  className?: string;
}

type CombinedProps<T extends React.ElementType> = TypographyProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof TypographyProps<T>>;

// ============================================================================
// 1. PageTitle
// Font: IBM Plex Sans Arabic | Weight: SemiBold (600) | Size: 24px | Color: #191C1D
// ============================================================================
export const PageTitle = <T extends React.ElementType = "h1">({
  as,
  children,
  className,
  ...props
}: CombinedProps<T>) => {
  const Component = as || "h1";
  return (
    <Component
      className={cn(
        "font-ibm text-[24px] font-semibold leading-tight text-[#191C1D]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================================================
// 2. SectionTitle
// Font: Tajawal | Weight: Bold (700) | Size: 20px | Color: #191C1D
// ============================================================================
export const SectionTitle = <T extends React.ElementType = "h2">({
  as,
  children,
  className,
  ...props
}: CombinedProps<T>) => {
  const Component = as || "h2";
  return (
    <Component
      className={cn(
        "font-tajawal text-[20px] font-bold leading-normal text-[#191C1D]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================================================
// 3. SubHeading
// Font: Tajawal | Weight: Medium (500) | Size: 16px | Color: #191C1D
// ============================================================================
export const SubHeading = <T extends React.ElementType = "h3">({
  as,
  children,
  className,
  ...props
}: CombinedProps<T>) => {
  const Component = as || "h3";
  return (
    <Component
      className={cn(
        "font-tajawal text-[16px] font-medium leading-normal text-[#191C1D]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================================================
// 4. BodyText
// Font: Tajawal | Weight: Regular (400) | Size: 14px | Color: #434654
// ============================================================================
export const BodyText = <T extends React.ElementType = "p">({
  as,
  children,
  className,
  ...props
}: CombinedProps<T>) => {
  const Component = as || "p";
  return (
    <Component
      className={cn(
        "font-tajawal text-[14px] font-normal leading-relaxed text-[#434654]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
