"use client";

import React, { useState, useEffect } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SectionTitle } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import {
  Package,
  Plus,
  Trash2,
  Laptop,
  ScanLine,
  X,
  Search,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner"; // أو مكتبة التوست المتاحة لديك
import { calculateItemTotals } from "@/lib/invoice-calculations";
import { useFormContext, useFieldArray, useForm, useWatch } from "react-hook-form";

// ==========================================
// 1. Mock Data (قائمة المنتجات الوهمية للمخزن)
// ==========================================
interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stockQty: number; 
  
}

const MOCK_INVENTORY: InventoryProduct[] = [
  { id: "1", name: "جهاز حاسب آلي محمول - فئة الأعمال", sku: "LPT-PRO-15", unitPrice: 3450, stockQty: 45 },
  { id: "2", name: "طابعة ليزر متعددة المهام", sku: "PRN-LZ-M2", unitPrice: 1200, stockQty: 5 },
  { id: "3", name: "شاشة عرض 27 بوصة آي بي إس", sku: "SCR-27-IPS", unitPrice: 850, stockQty: 20 },
  { id: "4", name: "لوحة مفاتيح وفأرة لاسلكية", sku: "ACC-WL-KB", unitPrice: 180, stockQty: 100 },
];

// ==========================================
// 2. Zod Schema للـ Modal (الفورم الفرعية للإضافة)
// ==========================================
const modalItemSchema = z.object({
  productId: z.string().min(1, "يجب اختيار المنتج"),
  name: z.string().min(1, "اسم المنتج مطلوب"),
  barcode: z.string().optional(),
  sku: z.string(),
  // سعر الوحدة قبل الخصم قبل الضريبة
  unitPriceBeforeDiscountBeforeTax: z.number().min(0.01, "سعر الوحدة يجب أن يكون أكبر من صفر"),
  // سعر الوحدة قبل الخصم مع الضريبة (محسوب تلقائياً)
  unitPriceBeforeDiscountWithTax: z.number().min(0.01, "سعر الوحدة يجب أن يكون أكبر من صفر"),
  quantity: z.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  discountPercentage: z.number().min(0, "الخصم لا يمكن أن يكون سالباً").max(100, "الخصم لا يمكن أن يتجاوز 100%").default(0),
  taxRate: z.number().default(15), // 15% ضريبة ثابتة
  stockQty: z.number(),
  // سعر الوحدة بعد الخصم قبل الضريبة (محسوب تلقائياً)
  unitPriceAfterDiscountBeforeTax: z.number().min(0.01, "سعر الوحدة يجب أن يكون أكبر من صفر"),
  // سعر الوحدة بعد الخصم مع الضريبة (محسوب تلقائياً)
  unitPriceAfterDiscountWithTax: z.number().min(0.01, "سعر الوحدة يجب أن يكون أكبر من صفر"),
  // الإجمالي بعد الخصم قبل الضريبة (محسوب تلقائياً)
  totalAfterDiscountBeforeTax: z.number().min(0, "الإجمالي يجب أن يكون 0 أو أكثر"),
  // إجمالي ضريبة القيمة المضافة (محسوب تلقائياً)
  totalVAT: z.number().min(0, "الضريبة يجب أن تكون 0 أو أكثر"),
  // الإجمالي بعد الخصم مع الضريبة (محسوب تلقائياً)
  totalAfterDiscountWithTax: z.number().min(0, "الإجمالي يجب أن يكون 0 أو أكثر"),
});

type ModalItemFormValues = z.infer<typeof modalItemSchema>;

export function ItemsStep() {
  const { control, register: registerMain, trigger } = useFormContext();
  const { setStep } = useWizardStore();

  // ربط الـ FieldArray بالمسار المطلوب في الفورم الكبيرة
  const { fields, append, remove } = useFieldArray({
    control,
    name: "itemsSection.items",
  });

  // حالة التحكم في الـ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);


  
 const handleNextStep = async () => {
  const isValid = await trigger("itemsSection.items");

  if (isValid && fields.length > 0) {
    setStep("approval");
  } else if (fields.length === 0) {
    toast.error("يجب إضافة منتج واحد على الأقل");
  } else {
    toast.error("يوجد خطأ في أحد البنود المضافة، يرجى المراجعة");   // ⬅️ حالة جديدة
  }
};
  

  const handlePreviousStep = () => {
    setStep("basic-info");
  };

  return (
    <div className="space-y-6 select-none font-tajawal text-[#191C1D] relative">
      {/* رأس القسم */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E2E4E9] pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <SectionTitle className="font-tajawal text-xl font-bold text-[#191C1D]">
            إدارة البنود والمخزون
          </SectionTitle>
          <Package className="h-5 w-5 text-[#434654]" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="flex h-9 items-center gap-1.5 px-3 font-tajawal text-sm font-medium text-[#003D9B] hover:bg-[#ECEEF2]"
          >
            <ScanLine className="h-4 w-4" />
            <span>مسح باركود</span>
          </Button>

          {/* زر فتح الـ Modal */}
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#003D9B] px-4 font-tajawal text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#002D72]"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة سطر جديد</span>
          </Button>
        </div>
      </div>

      {/* جدول الفاتورة الرئيسي */}
      <div className="overflow-visible rounded-lg border border-[#E2E4E9] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-right font-tajawal text-xs">
            <thead className="border-b border-[#E2E4E9] bg-[#F8F9FB] text-[#74777F]">
              <tr>
                <th className="w-10 px-3 py-3.5 text-center">#</th>
                <th className="min-w-[240px] px-4 py-3.5">الخدمة / المنتج</th>
                <th className="min-w-[120px] px-3 py-3.5 text-center">رمز التخزين (SKU)</th>
                <th className="min-w-[130px] px-3 py-3.5 text-center">الكمية</th>
                <th className="min-w-[130px] px-3 py-3.5 text-center">سعر الوحدة</th>
                <th className="min-w-[80px] px-3 py-3.5 text-center">الخصم (%)</th>
                <th className="min-w-[110px] px-3 py-3.5 text-center">الضريبة (15%)</th>
                <th className="min-w-[110px] px-3 py-3.5 text-center">الإجمالي</th>
                <th className="w-12 px-3 py-3.5 text-center">إجراء</th>
              </tr>
            </thead>
          
          
              <tbody className="divide-y divide-[#E2E4E9]">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      لا توجد بنود مضافة. اضغط على "إضافة سطر جديد" لاختيار المنتجات.
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => (
                    <ItemRow key={field.id} index={index} onRemove={() => { remove(index); toast.info("تم حذف البند من الفاتورة"); }} />
                  ))
                )}
              </tbody>






          </table>
        </div>
      </div>

      {/* نافذة الـ Modal لإضافة منتج مع Auto-Search */}
      {isModalOpen && (
        <AddProductModal
          onClose={() => setIsModalOpen(false)}
          onAdd={(productData) => {
            append(productData);
            toast.success("تم إضافة المنتج بنجاح إلى الفاتورة!");
            setIsModalOpen(false);
          }}
        />
      )}

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between border-t border-[#E2E4E9] pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviousStep}
          className="h-10 rounded-lg border border-[#E2E4E9] bg-slate-200/80 px-8 font-tajawal text-sm font-medium text-[#434654] transition-colors hover:bg-slate-300"
        >
          السابق
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          className="h-10 rounded-lg bg-[#003D9B] px-8 font-tajawal text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#002D72]"
        >
          الخطوة التالية
        </Button>
      </div>
    </div>
  );
}



// ==========================================
// مكوّن الصف — بيراقب حقوله بنفسه ويعيد الحساب لحظيًا
// ==========================================
function ItemRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { register, control, setValue } = useFormContext();

  // useWatch بيراقب القيم الحية بدل الاعتماد على snapshot الـ fields الثابت
  const name = useWatch({ control, name: `itemsSection.items.${index}.name` });
  const sku = useWatch({ control, name: `itemsSection.items.${index}.sku` });
  const stockQty = useWatch({ control, name: `itemsSection.items.${index}.stockQty` });
  const unitPrice = useWatch({ control, name: `itemsSection.items.${index}.unitPriceBeforeDiscountBeforeTax` });
  const quantity = useWatch({ control, name: `itemsSection.items.${index}.quantity` });
  const discountPercentage = useWatch({ control, name: `itemsSection.items.${index}.discountPercentage` });
  const taxRate = useWatch({ control, name: `itemsSection.items.${index}.taxRate` });

  // إعادة الحساب لحظيًا كل ما تتغيّر الكمية/السعر/الخصم في الصف ده تحديدًا
  useEffect(() => {
    const result = calculateItemTotals({
      unitPriceBeforeDiscountBeforeTax: unitPrice,
      quantity,
      discountPercentage,
      taxRate,
    });

    setValue(`itemsSection.items.${index}.unitPriceBeforeDiscountWithTax`, result.unitPriceBeforeDiscountWithTax);
    setValue(`itemsSection.items.${index}.unitPriceAfterDiscountBeforeTax`, result.unitPriceAfterDiscountBeforeTax);
    setValue(`itemsSection.items.${index}.unitPriceAfterDiscountWithTax`, result.unitPriceAfterDiscountWithTax);
    setValue(`itemsSection.items.${index}.totalAfterDiscountBeforeTax`, result.totalAfterDiscountBeforeTax);
    setValue(`itemsSection.items.${index}.totalVAT`, result.totalVAT);
    setValue(`itemsSection.items.${index}.totalAfterDiscountWithTax`, result.totalAfterDiscountWithTax);
  }, [unitPrice, quantity, discountPercentage, taxRate, index, setValue]);

  // نراقب الإجمالي بعد ما اتحدث عشان نعرضه فورًا في نفس اللحظة
  const totalAfterDiscountWithTax = useWatch({
    control,
    name: `itemsSection.items.${index}.totalAfterDiscountWithTax`,
  });

  const isOverStock = quantity > stockQty;

  return (
    <tr className="transition-colors hover:bg-slate-50/50">
      <td className="px-3 py-4 text-center font-medium text-[#74777F]">{index + 1}</td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E2E4E9] bg-[#F8F9FB]">
            <Laptop className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-snug text-[#191C1D]">{name}</span>
            <span className="mt-0.5 text-[11px] text-[#74777F]">متوفر {stockQty} وحدة</span>
          </div>
        </div>
        <input type="hidden" {...register(`itemsSection.items.${index}.name`)} />
        <input type="hidden" {...register(`itemsSection.items.${index}.productId`)} />
        <input type="hidden" {...register(`itemsSection.items.${index}.barcode`)} />
        <input type="hidden" {...register(`itemsSection.items.${index}.stockQty`, { valueAsNumber: true })} />
        <input type="hidden" {...register(`itemsSection.items.${index}.taxRate`, { valueAsNumber: true })} />
        <input type="hidden" {...register(`itemsSection.items.${index}.unitPriceBeforeDiscountWithTax`, { valueAsNumber: true })} />
        <input type="hidden" {...register(`itemsSection.items.${index}.unitPriceAfterDiscountBeforeTax`, { valueAsNumber: true })} />
        <input type="hidden" {...register(`itemsSection.items.${index}.unitPriceAfterDiscountWithTax`, { valueAsNumber: true })} />
        <input type="hidden" {...register(`itemsSection.items.${index}.totalAfterDiscountBeforeTax`, { valueAsNumber: true })} />
        <input type="hidden" {...register(`itemsSection.items.${index}.totalVAT`, { valueAsNumber: true })} />
      </td>

      <td className="px-3 py-4 text-center text-xs text-[#434654]">
        <span className="font-mono text-[#434654]">{sku}</span>
        <input type="hidden" {...register(`itemsSection.items.${index}.sku`)} />
      </td>

      <td className="px-3 py-4">
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            {...register(`itemsSection.items.${index}.quantity`, { valueAsNumber: true })}
            className={`w-16 h-9 text-center rounded-md border bg-white font-semibold text-sm focus:outline-none ${
              isOverStock ? "border-red-500" : "border-[#E2E4E9]"
            }`}
          />
          {isOverStock && <span className="text-[10px] text-red-500">تجاوز المخزون</span>}
        </div>
      </td>

      <td className="px-3 py-4">
        <div className="flex items-center justify-center">
          <input
            type="number"
            {...register(`itemsSection.items.${index}.unitPriceBeforeDiscountBeforeTax`, { valueAsNumber: true })}
            className="w-24 h-9 text-center rounded-md border border-[#E2E4E9] bg-white text-sm focus:outline-none px-2"
          />
        </div>
      </td>

      <td className="px-3 py-4 text-center">
        <input
          type="number"
          {...register(`itemsSection.items.${index}.discountPercentage`, { valueAsNumber: true })}
          className="w-14 h-9 text-center rounded-md border border-[#E2E4E9] bg-white text-sm focus:outline-none"
        />
      </td>

      <td className="px-3 py-4 text-center text-sm text-[#191C1D]">15%</td>

      <td className="px-3 py-4 text-center text-sm font-bold text-[#191C1D]">
        {(totalAfterDiscountWithTax || 0).toFixed(2)}
      </td>

      <td className="px-3 py-4 text-center">
        <button type="button" onClick={onRemove} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

// ==========================================
// 3. مكون الـ Popup (Modal) الفرعي المعزول
// ==========================================
function AddProductModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: ModalItemFormValues) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // استيراد toast داخل المكون لاستخدامه
  // (تم استيراده بالفعل في أعلى الملف)

  // إعداد الفورم الفرعية الخاصة بالـ Modal مع الـ Validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ModalItemFormValues>({
    resolver: zodResolver(modalItemSchema),
    defaultValues: {
      quantity: 1,
      discountPercentage: 0,
      taxRate: 15,
      unitPriceBeforeDiscountBeforeTax: 0,
      unitPriceBeforeDiscountWithTax: 0,
      unitPriceAfterDiscountBeforeTax: 0,
      unitPriceAfterDiscountWithTax: 0,
      totalAfterDiscountBeforeTax: 0,
      totalVAT: 0,
      totalAfterDiscountWithTax: 0,
    },
  });

  const selectedProductName = watch("name");
  const barcodeValue = watch("barcode");

  // مشاهدة الحقول التي تؤثر على الحسابات
  const unitPriceBeforeDiscountBeforeTax = watch("unitPriceBeforeDiscountBeforeTax");
  const quantity = watch("quantity");
  const discountPercentage = watch("discountPercentage");
  const taxRate = watch("taxRate");

  // ==========================================
  // Auto-fill للبيانات عند كتابة الباركود
  // ==========================================
  useEffect(() => {
    if (barcodeValue && barcodeValue.length > 0) {
      let product: InventoryProduct | undefined;
      
      // البحث عن المنتج في المخزون بناءً على الباركود
      // الحالة 1: الباركود بالصيغة المتوقعة (مثال: BC-LPT-PRO-15-1234)
      const barcodeSkuMatch = barcodeValue.match(/BC-([A-Z0-9-]+)/);
      
      if (barcodeSkuMatch) {
        const skuFromBarcode = barcodeSkuMatch[1];
        product = MOCK_INVENTORY.find((p) => p.sku === skuFromBarcode);
      } else {
        // الحالة 2: البحث المباشر بالـ SKU أو الاسم
        product = MOCK_INVENTORY.find(
          (p) => 
            p.sku.toLowerCase() === barcodeValue.toLowerCase() ||
            p.sku.toLowerCase().includes(barcodeValue.toLowerCase())
        );
      }
      
      if (product) {
        // ملء البيانات تلقائياً
        setValue("productId", product.id, { shouldValidate: true });
        setValue("name", product.name, { shouldValidate: true });
        setValue("sku", product.sku);
        setValue("unitPriceBeforeDiscountBeforeTax", product.unitPrice, { shouldValidate: true });
        setValue("stockQty", product.stockQty);
        setSearchQuery(product.name);
        
        toast.success(`تم العثور على المنتج: ${product.name}`, {
          duration: 2000,
        });
      } else {
        // إذا لم يتم العثور على المنتج، نظف الحقول
        // فقط إذا كان الباركود طويلاً بما يكفي (لتجنب التنظيف أثناء الكتابة)
        if (barcodeValue.length > 5) {
          // لا نظف الحقول لكي لا يزعج المستخدم أثناء الكتابة
        }
      }
    }
  }, [barcodeValue, setValue]);



useEffect(() => {
  const result = calculateItemTotals({
    unitPriceBeforeDiscountBeforeTax,
    quantity,
    discountPercentage,
    taxRate,
  });

  setValue("unitPriceBeforeDiscountWithTax", result.unitPriceBeforeDiscountWithTax);
  setValue("unitPriceAfterDiscountBeforeTax", result.unitPriceAfterDiscountBeforeTax);
  setValue("unitPriceAfterDiscountWithTax", result.unitPriceAfterDiscountWithTax);
  setValue("totalAfterDiscountBeforeTax", result.totalAfterDiscountBeforeTax);
  setValue("totalVAT", result.totalVAT);
  setValue("totalAfterDiscountWithTax", result.totalAfterDiscountWithTax);
}, [unitPriceBeforeDiscountBeforeTax, quantity, discountPercentage, taxRate, setValue]);

  // تصفية المنتجات بناءً على البحث التلقائي (Auto-Search)
  const filteredProducts = MOCK_INVENTORY.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProduct = (product: InventoryProduct) => {
    setValue("productId", product.id, { shouldValidate: true });
    setValue("name", product.name, { shouldValidate: true });
    setValue("sku", product.sku);
    setValue("unitPriceBeforeDiscountBeforeTax", product.unitPrice, { shouldValidate: true });
    setValue("stockQty", product.stockQty);
    
    // توليد باركود تلقائي من SKU (إضافة بادئة لتمييزه)
    const generatedBarcode = `BC-${product.sku}-${Date.now().toString().slice(-4)}`;
    setValue("barcode", generatedBarcode, { shouldValidate: true });
    
    setSearchQuery(product.name);
    setIsDropdownOpen(false);
  };

  const onSubmitModal = (data: ModalItemFormValues) => {
    if (data.quantity > data.stockQty) {
      toast.error("الكمية المطلوبة تتجاوز المخزون المتاح!");
      return;
    }
    onAdd(data);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 m-0 p-0"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-[#191C1D] flex items-center gap-2">
            <Package className="h-5 w-5 text-[#003D9B]" />
            إضافة منتج جديد للفاتورة
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* حقل البحث الذكي عن المنتج (Auto-Search) */}
          <div className="relative space-y-1">
            <label className="text-xs font-semibold text-[#434654]">اسم المنتج أو الخدمة</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="ابحث بالاسم أو رمز التخزين (SKU)..."
                className="w-full h-10 px-3 pl-9 rounded-lg border border-[#E2E4E9] text-sm focus:outline-none focus:border-[#003D9B]"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}

            {/* قائمة المقترحات المنسدلة للبحث */}
            {isDropdownOpen && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-gray-100 last:border-none"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#191C1D]">{p.name}</p>
                      <span className="text-[11px] text-gray-500">SKU: {p.sku} | متوفر: {p.stockQty}</span>
                    </div>
                    <span className="text-sm font-bold text-[#003D9B]">{p.unitPrice} ر.س</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* شبكة الحقول - صفين */}
          <div className="grid grid-cols-2 gap-4">
            {/* باركود الصنف */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#434654]">باركود الصنف</label>
              <input
                type="text"
                {...register("barcode")}
                placeholder="أدخل الباركود..."
                className="w-full h-10 px-3 rounded-lg border border-[#E2E4E9] text-sm focus:outline-none focus:border-[#003D9B]"
              />
            </div>

            {/* سعر الوحدة قبل الخصم قبل الضريبة */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#434654]">سعر الوحدة (ر.س)</label>
              <input
                type="number"
                {...register("unitPriceBeforeDiscountBeforeTax", { valueAsNumber: true })}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E4E9] text-sm focus:outline-none focus:border-[#003D9B]"
              />
              {errors.unitPriceBeforeDiscountBeforeTax && <p className="text-xs text-red-500 mt-1">{errors.unitPriceBeforeDiscountBeforeTax.message}</p>}
            </div>

            {/* كمية الشراء */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#434654]">الكمية</label>
              <input
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E4E9] text-sm focus:outline-none focus:border-[#003D9B]"
              />
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
            </div>

            {/* نسبة الخصم */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#434654]">نسبة الخصم (%)</label>
              <input
                type="number"
                {...register("discountPercentage", { valueAsNumber: true })}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E4E9] text-sm focus:outline-none focus:border-[#003D9B]"
              />
              {errors.discountPercentage && <p className="text-xs text-red-500 mt-1">{errors.discountPercentage.message}</p>}
            </div>
          </div>

          {/* الحقول المحسوبة - مخفية */}
          <input type="hidden" {...register("unitPriceBeforeDiscountWithTax", { valueAsNumber: true })} />
          <input type="hidden" {...register("unitPriceAfterDiscountBeforeTax", { valueAsNumber: true })} />
          <input type="hidden" {...register("unitPriceAfterDiscountWithTax", { valueAsNumber: true })} />
          <input type="hidden" {...register("totalAfterDiscountBeforeTax", { valueAsNumber: true })} />
          <input type="hidden" {...register("totalVAT", { valueAsNumber: true })} />

          {/* الإجمالي النهائي */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#434654]">الإجمالي النهائي (ر.س)</label>
            <input
              type="number"
              {...register("totalAfterDiscountWithTax", { valueAsNumber: true })}
              className="w-full h-10 px-3 rounded-lg border border-[#E2E4E9] bg-gray-50 text-sm text-gray-600 cursor-not-allowed font-bold"
              disabled
            />
          </div>

          {/* أزرار الإجراء */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-sm"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmitModal)}
              className="flex items-center gap-2 bg-[#003D9B] text-white hover:bg-[#002D72] px-5 py-2 text-sm font-semibold rounded-lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>إضافة المنتج للفاتورة</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}