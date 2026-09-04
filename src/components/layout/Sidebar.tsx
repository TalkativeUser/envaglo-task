import Link from "next/link";
import {
  Building2,
  LayoutGrid,
  Receipt,
  Package,
  Users,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { SubHeading, BodyText } from "@/components/common/Typography";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  active?: boolean;
}

const navItems: NavItem[] = [
  { label: "لوحة التحكم", href: "/", icon: LayoutGrid },
  { label: "الفواتير", href: "/invoices/new", icon: Receipt, active: true },
  { label: "المخزون", href: "#", icon: Package },
  { label: "العملاء", href: "#", icon: Users },
  { label: "التقارير", href: "#", icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-l border-[#E2E4E9] bg-[#F8F9FB] p-5 select-none">
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
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-all duration-150 ${
                  item.active
                    ? "bg-[#D7E2FF] shadow-xs"
                    : "hover:bg-[#ECEEF2]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    item.active
                      ? "text-[#003D9B]"
                      : "text-[#434654] group-hover:text-[#191C1D]"
                  }`}
                />
                <BodyText
                  as="span"
                  className={`transition-colors ${
                    item.active
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
          className="group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-all duration-150 hover:bg-[#ECEEF2]"
        >
          <HelpCircle className="h-5 w-5 shrink-0 text-[#434654] transition-colors group-hover:text-[#191C1D]" />
          <BodyText
            as="span"
            className="font-medium text-[#434654] transition-colors group-hover:text-[#191C1D]"
          >
            المساعدة
          </BodyText>
        </Link>
      </div>
    </aside>
  );
}


