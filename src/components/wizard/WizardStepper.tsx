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
  const activeStep = filteredSteps[currentIndex];

  return (
    <div className="w-full select-none py-2" dir="rtl">
      {/*
        المشكلة الأصلية: العناوين تحت كل دائرة كانت بعرض حر (text-center من
        غير أي حد أقصى للعرض)، فعلى الشاشات الضيقة (موبايل) كانت العناوين
        الطويلة بتتصادم مع بعض أو تعمل overflow برة الحاوية، وكل عنصر كان
        بياخد مساحته الطبيعية بس مش بالتساوي (justify-between)، فمع 4 خطوات
        بعناوين عربية طويلة كان بيبوظ تمامًا على شاشة صغيرة.

        الحل: كل خطوة بقت تاخد نفس المساحة (flex-1) مع min-w-0 عشان
        النص يقدر يتقصّر (truncate) بدل ما يعمل overflow، والعنوان نفسه
        بقى بحد أقصى سطرين (line-clamp-2) وباختفاء تلقائي على أصغر
        الشاشات (يظهر بس اسم الخطوة الحالية تحت الشريط) عشان الحلقات
        تفضل متباعدة صح مهما كان طول العنوان.
      */}
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
              className={`relative z-10 flex min-w-0 flex-1 flex-col items-center px-0.5 ${
                isFuture ? "cursor-not-allowed opacity-50" : onStepClick ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex h-6 w-6 items-center justify-center sm:h-7 sm:w-7">
                {isActive ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#003D9B] text-white text-[11px] sm:text-xs font-bold ring-2 ring-[#003D9B] ring-offset-2 ring-offset-white transition-all sm:h-7 sm:w-7">
                    {index + 1}
                  </div>
                ) : isCompleted ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#003D9B] text-white text-[11px] sm:text-xs font-bold transition-all sm:h-7 sm:w-7">
                    <Check className="h-3 w-3 stroke-[2.5] sm:h-3.5 sm:w-3.5" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ECEEF2] text-[#74777F] text-[11px] sm:text-xs font-semibold transition-all sm:h-7 sm:w-7">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* العنوان تحت كل دائرة — متاح بس من sm فوق، عشان على الموبايل
                  ميتصادمش مع الدوائر التانية. على الموبايل بنعرض بس اسم
                  الخطوة الحالية تحت الشريط كله (تحت). */}
              <span
                className={`mt-2.5 hidden w-full truncate text-center font-tajawal text-xs transition-colors sm:block sm:text-sm md:line-clamp-none md:whitespace-normal ${
                  isActive
                    ? "font-bold text-[#003D9B]"
                    : isCompleted
                    ? "font-medium text-[#191C1D]"
                    : "font-normal text-[#74777F]"
                }`}
                title={step.title}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* بديل الموبايل: بدل ما نعرض كل العناوين تحت كل دائرة (وده اللي كان
          بيعمل التصادم)، بنعرض سطر واحد بس تحت الشريط بيوري رقم الخطوة
          الحالية من إجمالي الخطوات + عنوانها. */}
      {activeStep && (
        <p className="mt-2.5 text-center font-tajawal text-xs font-bold text-[#003D9B] sm:hidden">
          الخطوة {currentIndex + 1} من {filteredSteps.length}: {activeStep.title}
        </p>
      )}
    </div>
  );
}
