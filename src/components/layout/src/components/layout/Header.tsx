"use client";

import React, { useState } from "react";
import { Search, Loader2, Bell, Settings, Menu, X } from "lucide-react";
import { PageTitle, BodyText } from "@/components/common/Typography";
import { useUIStore } from "@/store/ui-store";

export function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  // حقل البحث كان w-64 ثابت دايمًا — على شاشة موبايل ضيقة (320-375px)
  // العنوان + البحث + الأيقونات مع بعض كانوا بيعملوا overflow أفقي.
  // بقى البحث مخفي على الموبايل، وبدالها زرار بحث بيفتح الحقل كـ overlay
  // كامل العرض فوق باقي عناصر الهيدر لما تدوس عليه.
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-[#E2E4E9] bg-white px-3 select-none sm:px-6">
      {/* حقل البحث في وضع الموبايل — يظهر كـ overlay فوق الهيدر كله لما
          يتفتح، بدل ما ياخد مساحة ثابتة طول الوقت */}
      {isMobileSearchOpen && (
        <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white px-3 sm:hidden">
          <div className="relative flex flex-1 items-center">
            <input
              autoFocus
              type="text"
              placeholder="بحث..."
              className="h-9 w-full rounded-full bg-[#ECEEF2] pr-10 pl-4 font-tajawal text-xs text-[#191C1D] placeholder:text-[#74777F] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
            />
            <Search className="pointer-events-none absolute right-3.5 h-4 w-4 text-[#74777F]" />
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            aria-label="إغلاق البحث"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#434654] hover:bg-[#ECEEF2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Right Side (Title & Search) */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-6">
        {/* زرار فتح السايدبار — موبايل وتابلت بس، بيختفي من lg فوق */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="فتح القائمة الجانبية"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#434654] transition-colors hover:bg-[#ECEEF2] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <PageTitle
          className="truncate text-base font-bold text-[#003D9B] tracking-tight sm:text-[20px]"
          as="h1"
        >
          نظام الفواتير
        </PageTitle>

        {/* البحث بشكله الأصلي — من sm فوق بس، على الموبايل بيتحول لزرار */}
        <div className="relative hidden items-center sm:flex">
          <input
            type="text"
            placeholder="بحث..."
            className="h-9 w-48 rounded-full bg-[#ECEEF2] pr-10 pl-4 font-tajawal text-xs text-[#191C1D] placeholder:text-[#74777F] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 md:w-64"
          />
          <Search className="pointer-events-none absolute right-3.5 h-4 w-4 text-[#74777F]" />
        </div>
      </div>

      {/* Left Side (Auto-save, Actions & Profile) */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
        {/* زرار البحث اللي بيظهر بس على الموبايل بدل الحقل الكامل */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen(true)}
          aria-label="بحث"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#434654] transition-colors hover:bg-[#ECEEF2] hover:text-[#191C1D] sm:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Auto-save status — النص بيختفي على الموبايل، السبينر لوحده كفاية */}
        <div className="flex items-center gap-1.5 text-[#0052CC]">
          <Loader2 className="h-4 w-4 animate-spin text-[#0052CC]" />
          <BodyText as="span" className="hidden text-xs font-medium text-[#0052CC] sm:inline">
            جاري الحفظ...
          </BodyText>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="الإشعارات"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#434654] transition-colors hover:bg-[#ECEEF2] hover:text-[#191C1D]"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Settings */}
        <button
          type="button"
          aria-label="الإعدادات"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#434654] transition-colors hover:bg-[#ECEEF2] hover:text-[#191C1D]"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* User Profile Avatar */}
        <div className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-[#E2E4E9]">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            alt="صورة المستخدم"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
