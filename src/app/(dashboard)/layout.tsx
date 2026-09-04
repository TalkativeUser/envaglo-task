import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// هذا الـ layout بتاع كل صفحات لوحة التحكم (اللي جوه مجلد (dashboard)).
// دلوقتي بس بيحط الـ Sidebar والـ Header حوالين المحتوى، من غير أي منطق زيادة.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header />
        <main className="flex-1 p-12  ">{children}</main>
      </div>
    </div>
  );
}
