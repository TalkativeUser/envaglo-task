"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  LayoutGrid,
  Receipt,
  Package,
  Users,
  BarChart3,
  HelpCircle,
  X,
} from "lucide-react";
import { SubHeading, BodyText } from "@/components/common/Typography";
import { useUIStore } from "@/store/ui-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// شلت `active: true` الثابتة من هنا. حالة الـ active بقت بتتحدد ديناميكيًا
// تحت — إما من الـ route الحالي (usePathname) للصفحات اللي فعلاً موجودة،
// أو من آخر عنصر اتضغط عليه بالنسبة للروابط اللي لسه مفيهاش صفحة حقيقية.
const navItems: NavItem[] = [
  { label: "لوحة التحكم", href: "/", icon: LayoutGrid },
  { label: "الفواتير", href: "/invoices/new", icon: Receipt },
  { label: "المخزون", href: "#", icon: Package },
  { label: "العملاء", href: "#", icon: Users },
  { label: "التقارير", href: "#", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  // حالة الفتح/القفل بقت جاية من ستور مشترك (useUIStore) بدل useState محلي،
  // عشان زرار الـ hamburger في الـ Header يقدر يتحكم في نفس القائمة دي
  const isOpen = useUIStore((s) => s.isSidebarOpen);
  const closeSidebar = useUIStore((s) => s.closeSidebar);

  // الروابط اللي لسه href="#" (معندهاش صفحة حقيقية) بنتتبع آخر واحد
  // اتضغط عليه يدويًا عشان ياخد اللون الأزرق الفاتح برضه، زي أي زرار تاني
  const [manualActiveLabel, setManualActiveLabel] = useState<string | null>(null);

  const isItemActive = (item: NavItem) =>
    item.href !== "#" ? pathname === item.href : manualActiveLabel === item.label;

  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.href === "#") {
      // مفيش صفحة حقيقية نروحلها لسه، فبنمنع الانتقال ونكتفي بتلوين
      // الزرار كـ active بس
      e.preventDefault();
      setManualActiveLabel(item.label);
    } else {
      // الصفحات الحقيقية بتتحدد active بتاعتها من الـ pathname نفسه
      setManualActiveLabel(null);
    }
    // على الموبايل، بعد ما تختار أي عنصر، اقفل القائمة تلقائيًا
    closeSidebar();
  };

  const isHelpActive = manualActiveLabel === "المساعدة";

  return (
    <>
      {/* زرار فتح القائمة بقى في الـ Header بدل ما يبقى هنا (floating)،
          عشان يبقى في مكانه الطبيعي جنب باقي عناصر الهيدر. الستور
          المشترك (useUIStore) هو اللي بيربط الاتنين ببعض. */}

      {/* خلفية شفافة تظهر خلف القائمة على الموبايل بس، وتقفلها لو ضغط عليها */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex h-screen w-64 flex-col justify-between border-l border-[#E2E4E9] bg-[#F8F9FB] p-5 select-none transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } lg:static lg:z-auto lg:translate-x-0`}
        role="dialog"
        aria-modal={isOpen ? true : undefined}
      >
        {/* زرار إغلاق داخلي — موبايل بس */}
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[#74777F] hover:bg-[#ECEEF2] lg:hidden"
          aria-label="إغلاق القائمة الجانبية"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Section */}
        <div className="flex flex-col gap-8">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0052CC] text-white shadow-sm shadow-blue-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <SubHeading
                as="span"
                className="font-bold text-[#003D9B] leading-tight tracking-tight text-[16px]"
              >
                إدارة الموارد
              </SubHeading>
              <BodyText as="span" className="text-[12px] text-[#74777F] mt-0.5">
                المؤسسة العربية
              </BodyText>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleItemClick(item, e)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-all duration-150 ${
                    active ? "bg-[#D7E2FF] shadow-xs" : "hover:bg-[#ECEEF2]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active ? "text-[#003D9B]" : "text-[#434654] group-hover:text-[#191C1D]"
                    }`}
                  />
                  <BodyText
                    as="span"
                    className={`transition-colors ${
                      active
                        ? "font-bold text-[#003D9B]"
                        : "font-medium text-[#434654] group-hover:text-[#191C1D]"
                    }`}
                  >
                    {item.label}
                  </BodyText>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#E2E4E9] pt-4">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setManualActiveLabel("المساعدة");
              closeSidebar();
            }}
            aria-current={isHelpActive ? "page" : undefined}
            className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-all duration-150 ${
              isHelpActive ? "bg-[#D7E2FF] shadow-xs" : "hover:bg-[#ECEEF2]"
            }`}
          >
            <HelpCircle
              className={`h-5 w-5 shrink-0 transition-colors ${
                isHelpActive ? "text-[#003D9B]" : "text-[#434654] group-hover:text-[#191C1D]"
              }`}
            />
            <BodyText
              as="span"
              className={`transition-colors ${
                isHelpActive
                  ? "font-bold text-[#003D9B]"
                  : "font-medium text-[#434654] group-hover:text-[#191C1D]"
              }`}
            >
              المساعدة
            </BodyText>
          </Link>
        </div>
      </aside>
    </>
  );
}
