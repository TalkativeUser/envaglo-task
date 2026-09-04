import React from "react";
import { Search, Loader2, Bell, Settings } from "lucide-react";
import { PageTitle, BodyText } from "@/components/common/Typography";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E2E4E9] bg-white p-6 select-none">
      {/* Right Side (Title & Search) */}
      <div className="flex items-center gap-6">
        <PageTitle
          className="text-[20px] font-bold text-[#003D9B] tracking-tight"
          as="h1"
        >
          نظام الفواتير
        </PageTitle>

        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="بحث..."
            className="h-9 w-64 rounded-full bg-[#ECEEF2] pr-10 pl-4 font-tajawal text-xs text-[#191C1D] placeholder:text-[#74777F] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
          />
          <Search className="pointer-events-none absolute right-3.5 h-4 w-4 text-[#74777F]" />
        </div>
      </div>

      {/* Left Side (Auto-save, Actions & Profile) */}
      <div className="flex items-center gap-4">
        {/* Auto-save status */}
        <div className="flex items-center gap-1.5 text-[#0052CC]">
          <Loader2 className="h-4 w-4  text-[#0052CC]" />
          <BodyText as="span" className="text-xs font-medium text-[#0052CC]">
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

