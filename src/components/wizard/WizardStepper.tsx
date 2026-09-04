"use client";

import React from "react";
import { Check } from "lucide-react";
import { evaluateRule } from "@/lib/rule-engine";
import { StepRuleConfig } from "@/types/rules";

interface WizardStepperProps {
  activeStepId?: string;
  steps: StepRuleConfig[];       // بدل defaultSteps الثابتة
  formContext: Record<string, any>; // كل بيانات الفورم عشان المحرك يقيّم عليها
  onStepClick?: (stepId: string) => void;
  completedSteps?: string[];
}

export function WizardStepper({
  activeStepId = "basic-info",
  steps,
  formContext,
  onStepClick,
  completedSteps = [],
}: WizardStepperProps) {
  // الفلترة بقت عامة بالكامل: كل خطوة بتتقيّم بقاعدتها الخاصة، مفيش أي رقم ثابت هنا
  const filteredSteps = steps.filter((step) => evaluateRule(step.visibleWhen, formContext));

  const activeIndex = filteredSteps.findIndex((step) => step.id === activeStepId);
  const currentIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className="w-full select-none py-2" dir="rtl">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-[14px] right-0 left-0 h-[1.5px] bg-[#E2E4E9]" aria-hidden="true" />

        {filteredSteps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isCompleted = index < currentIndex || completedSteps.includes(step.id);
          const isFuture = index > currentIndex && !completedSteps.includes(step.id);

          return (
            <div
              key={step.id}
              role="button"
              tabIndex={isFuture ? -1 : 0}
              aria-current={isActive ? "step" : undefined}
              aria-disabled={isFuture}
              onKeyDown={(e) => {
                if (!isFuture && (e.key === "Enter" || e.key === " ")) onStepClick?.(step.id);
              }}
              onClick={() => !isFuture && onStepClick?.(step.id)}
              className={`relative z-10 flex flex-col items-center ${
                isFuture ? "cursor-not-allowed opacity-50" : onStepClick ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex h-7 items-center justify-center">
                {isActive ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#003D9B] text-white text-xs font-bold ring-2 ring-[#003D9B] ring-offset-2 ring-offset-white transition-all">
                    {index + 1}
                  </div>
                ) : isCompleted ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#003D9B] text-white text-xs font-bold transition-all">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ECEEF2] text-[#74777F] text-xs font-semibold transition-all">
                    {index + 1}
                  </div>
                )}
              </div>
              <span
                className={`mt-2.5 font-tajawal text-xs md:text-sm transition-colors text-center ${
                  isActive
                    ? "font-bold text-[#003D9B]"
                    : isCompleted
                    ? "font-medium text-[#191C1D]"
                    : "font-normal text-[#74777F]"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}