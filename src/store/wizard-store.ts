import { create } from "zustand";
import { StepId, InvoiceFormData, AutoSaveStatus, InvoiceItem, InvoiceStatus } from "@/types/invoice";
export const WIZARD_STEPS: StepId[] = [
  "basic-info",
  "items",
  "approval",
  "review",
];
import type { WizardFormValues } from "@/lib/wizard-schema"; 
interface WizardState {
  currentStepId: StepId;
  formData: InvoiceFormData;
   autoSaveStatus: AutoSaveStatus;
  lastSavedAt: string | null;
  invoiceStatus: InvoiceStatus;
    wizardFormValues: Partial<WizardFormValues> | null;   
  completedSteps: StepId[];                             
  // الإجراءات (Actions)
  setStep: (stepId: StepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<InvoiceFormData>) => void;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;
   setLastSavedAt: (timestamp: string) => void;
  setInvoiceStatus: (status: InvoiceStatus) => void;
  resetForm: () => void;
    setWizardFormValues: (data: Partial<WizardFormValues>) => void;  
  setCompletedSteps: (steps: StepId[]) => void;   
 
}

const defaultDemoItems: InvoiceItem[] = [
  {
    id: "item-1",
    name: "جهاز حاسب آلي محمول - فئة الأعمال",
    sku: "LPT-PRO-15",
    iconType: "laptop",
    quantity: 2,
    availableStock: 45,
    unitPrice: 3450,
    discountPercent: 0,
    taxRate: 15,
    taxAmount: 1035,
    total: 7935,
  },
  {
    id: "item-2",
    name: "طابعة ليزر متعددة المهام",
    sku: "PRN-LZ-M2",
    iconType: "printer",
    quantity: 8,
    availableStock: 5,
    unitPrice: 1200,
    discountPercent: 5,
    taxRate: 15,
    taxAmount: 1368,
    total: 10488,
  },
];

const initialFormData: InvoiceFormData = {
  userName: "أحمد محمد",
  customerName: "شركة النور للتجارة",
  customerId: "cust-1",
  invoiceNumber: "INV-2024-00142",
  invoiceType: "credit",
  currency: "SAR",
  issueDate: "2024-10-24",
  dueDate: "2026-01-01",
  notes: "",
  items: defaultDemoItems,
  subtotal: 15930,
  taxTotal: 2403,
  grandTotal: 18423,
};

export const useWizardStore = create<WizardState>((set) => ({
  currentStepId: "basic-info",
  formData: initialFormData,
  autoSaveStatus: "saved",
 lastSavedAt: null,
  invoiceStatus: "draft",
    wizardFormValues: null,     // ⬅️ جديد
  completedSteps: [],          // ⬅️ جديد

  setStep: (stepId) => set({ currentStepId: stepId }),

  nextStep: () =>
    set((state) => {
      const currentIndex = WIZARD_STEPS.indexOf(state.currentStepId);
      if (currentIndex < WIZARD_STEPS.length - 1) {
        return { currentStepId: WIZARD_STEPS[currentIndex + 1] };
      }
      return state;
    }),

  prevStep: () =>
    set((state) => {
      const currentIndex = WIZARD_STEPS.indexOf(state.currentStepId);
      if (currentIndex > 0) {
        return { currentStepId: WIZARD_STEPS[currentIndex - 1] };
      }
      return state;
    }),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      autoSaveStatus: "saving",
    })),

  setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),
  setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),
 setInvoiceStatus: (status) => set({ invoiceStatus: status }),


  setWizardFormValues: (data) =>          // ⬅️ جديد
    set((state) => ({ wizardFormValues: { ...state.wizardFormValues, ...data } })),
  setCompletedSteps: (steps) => set({ completedSteps: steps }),   // ⬅️ جديد


  resetForm: () =>
    set({
      currentStepId: "basic-info",
      formData: initialFormData,
      autoSaveStatus: "idle",
       lastSavedAt: null,
      invoiceStatus: "draft",
       wizardFormValues: null,    // ⬅️ ضيفها هنا كمان
      completedSteps: [],         // ⬅️ وهنا
    }),
}));

