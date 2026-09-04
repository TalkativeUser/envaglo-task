import { Loader2 } from "lucide-react";
import { BodyText, PageTitle  } from "@/components/common/Typography";
import { WizardContainer } from "@/components/wizard/WizardContainer";
import { Suspense } from "react";
import { AutoSaveIndicator } from "@/components/wizard/AutoSaveIndicator";
import { InvoiceStatusBadge } from "@/components/wizard/InvoiceStatusBadge";

// صفحة إنشاء فاتورة جديدة. بتعرض الـ Wizard بس.

export default function NewInvoicePage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-8">
             <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PageTitle as="h2" className=""> 
            إنشاء فاتورة جديدة
          </PageTitle>
            <InvoiceStatusBadge />
          </div>
          <BodyText   as="p" className="text-sm font-medium text-[#434654]"   >الرجاء إدخال البيانات الأساسية للفاتورة قبل المتابعة لإضافة العناصر.</BodyText>

        </div>
        
        
        <AutoSaveIndicator />
      </div>
     <Suspense fallback={<div>جارٍ التحميل...</div>}>
      <WizardContainer />
    </Suspense>
    </div>
  );
}
