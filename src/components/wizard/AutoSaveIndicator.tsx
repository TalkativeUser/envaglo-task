"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
const MAX_TICKING_SECONDS = 10;
export function AutoSaveIndicator() {
  const status = useWizardStore((s) => s.autoSaveStatus);
  const lastSavedAt = useWizardStore((s) => s.lastSavedAt);
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);


  

useEffect(() => {
  if (!lastSavedAt) return;

  const update = () => {
    const elapsed = Math.floor((Date.now() - new Date(lastSavedAt).getTime()) / 1000);
    setSecondsAgo(Math.min(elapsed, MAX_TICKING_SECONDS));
  };

  update();
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - new Date(lastSavedAt).getTime()) / 1000);
    if (elapsed >= MAX_TICKING_SECONDS) {
      setSecondsAgo(MAX_TICKING_SECONDS);
      clearInterval(interval);
      return;
    }
    setSecondsAgo(elapsed);
  }, 1000);
  return () => clearInterval(interval);
}, [lastSavedAt]);




  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-[#0052CC]">
        <Loader2 className="h-4 w-4 animate-spin text-[#0052CC]" />
        <span className="text-xs font-medium text-[#0052CC]">جاري الحفظ...</span>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="flex items-center gap-1.5 text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
       
       <span className="text-xs font-medium">
          {   secondsAgo === null
                ? "تم الحفظ"
                : secondsAgo >= MAX_TICKING_SECONDS
                ? `تم الحفظ منذ أكثر من ${MAX_TICKING_SECONDS} ثوانٍ`
                : `تم الحفظ منذ ${secondsAgo} ثانية`
            }
        </span>



      </div>
    );
  }

  if (status === "conflict") {
    return (
      <div className="flex items-center gap-1.5 text-amber-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs font-medium">تم تعديل هذه المسودة من مستخدم آخر</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-1.5 text-red-600">
        <XCircle className="h-4 w-4" />
        <span className="text-xs font-medium">خطأ في الحفظ</span>
      </div>
    );
  }

  return null;
}