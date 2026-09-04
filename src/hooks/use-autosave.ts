

"use client";

import { useEffect, useRef } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { saveDraft } from "@/lib/api-client";
import { ApiError } from "@/types/api";

interface UseAutoSaveOptions {
  data: unknown;
  delay?: number; // مدة الـ debounce بالميلي ثانية (افتراضيًا 2 ثانية)
  enabled?: boolean;
}

export function useAutoSave({ data, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const setAutoSaveStatus = useWizardStore((s) => s.setAutoSaveStatus);
  const setLastSavedAt = useWizardStore((s) => s.setLastSavedAt);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        await saveDraft(data);
        setAutoSaveStatus("saved");
        setLastSavedAt(new Date().toISOString());
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setAutoSaveStatus("conflict");
        } else {
          setAutoSaveStatus("error");
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), enabled, delay]);
}