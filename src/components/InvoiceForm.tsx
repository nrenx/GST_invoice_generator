import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, Download, Copy } from "lucide-react";
import { AutoCompleteInput, type AutoCompleteOption } from "@/components/ui/auto-complete-input";
import { hsnCodes, hsnCodeMap, normalizeHsnCode, uomOptions, transportModes, indianStates } from "@/data/hsnCodes";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { toast } from "sonner";

const GSTIN_REGEX = /^[0-9A-Z]{15}$/i;

const gstinSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .superRefine((value, ctx) => {
    if (!GSTIN_REGEX.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid 15-character GSTIN" });
    }
  });

const gstinOrUnregisteredSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .superRefine((value, ctx) => {
    if (value === "UNREGISTERED") {
      return;
    }
    if (!GSTIN_REGEX.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter UNREGISTERED or a valid 15-character GSTIN" });
    }
  });

const invoiceSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  companyGSTIN: gstinSchema,
  companyEmail: z.string().optional().transform(val => val?.trim() || ""),
  companyPhone: z.string().optional(),
  companyState: z.string().min(1, "State is required"),
  companyStateCode: z.string().min(1, "State code is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z
    .string()
    .min(1, "Invoice date is required")
    .refine((value) => DATE_FORMAT_REGEX.test(value), "Use DD/MM/YYYY format"),
  invoiceType: z.string().default("Tax Invoice"),
  saleType: z.string().min(1, "Sale type is required"),
  reverseCharge: z.string().default("No"),
  transportMode: z.string().optional(),
  vehicleNumber: z.string().optional(),
  transporterName: z.string().optional(),
  challanNumber: z.string().optional(),
  lrNumber: z.string().optional(),
  dateOfSupply: z
    .string()
    .min(1, "Date of supply is required")
    .refine((value) => DATE_FORMAT_REGEX.test(value), "Use DD/MM/YYYY format"),
  placeOfSupply: z.string().optional(),
  poNumber: z.string().optional(),
  eWayBillNumber: z.string().optional(),
  receiverName: z.string().min(1, "Receiver name is required"),
  receiverAddress: z.string().min(1, "Receiver address is required"),
  receiverGSTIN: gstinOrUnregisteredSchema,
  receiverState: z.string().min(1, "Receiver state is required"),
  receiverStateCode: z.string().min(1, "Receiver state code is required"),
  consigneeName: z.string().min(1, "Consignee name is required"),
  consigneeAddress: z.string().min(1, "Consignee address is required"),
  consigneeGSTIN: gstinOrUnregisteredSchema,
  consigneeState: z.string().min(1, "Consignee state is required"),
  consigneeStateCode: z.string().min(1, "Consignee state code is required"),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    hsnCode: z.string().min(1, "HSN code is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    uom: z.string().min(1, "UOM is required"),
    rate: z.number().min(0.01, "Rate must be greater than 0"),
    cessRate: z
      .number({ invalid_type_error: "Compensation cess must be a number" })
      .min(0, "Compensation cess cannot be negative")
      .default(0),
  })).min(1, "At least one item is required"),
  termsAndConditions: z.string().default(
    "1. This is an electronically generated invoice.\n2. All disputes are subject to GUDUR jurisdiction only.\n3. If the Consignee makes any Inter State Sale, he has to pay GST himself.\n4. Goods once sold cannot be taken back or exchanged.\n5. Payment terms as per agreement between buyer and seller."
  ),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const getFormStorageKey = (profileId: string) => `invoice-form-data-${profileId}`;
const DEFAULT_UOM = uomOptions[0] ?? "MTS";
const DEFAULT_HSN_CODE = normalizeHsnCode(hsnCodes[0]?.code ?? "4404");
const DEFAULT_HSN_DETAILS = hsnCodeMap.get(DEFAULT_HSN_CODE);
const DESCRIPTION_OPTIONS = Array.from(new Set(hsnCodes.map((entry) => entry.description)))
  .filter((description): description is string => Boolean(description && description.trim()))
  .sort((a, b) => a.localeCompare(b));
const GSTIN_SUGGESTIONS: AutoCompleteOption[] = [{ value: "UNREGISTERED" }];
const STATE_NAME_OPTIONS: AutoCompleteOption[] = indianStates.map((state) => ({
  value: state.name,
  label: `${state.name} (${state.code})`,
  keywords: [state.code],
}));
const STATE_CODE_OPTIONS: AutoCompleteOption[] = indianStates.map((state) => ({
  value: state.code,
  label: `${state.code} — ${state.name}`,
  keywords: [state.name],
}));
const normalizeStateName = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();
const normalizeStateCodeValue = (value: string) => value.trim().toUpperCase();
const STATE_NAME_LOOKUP = new Map(indianStates.map((state) => [normalizeStateName(state.name), state]));
const STATE_CODE_LOOKUP = new Map(indianStates.map((state) => [state.code, state]));
const DESCRIPTION_SUGGESTIONS: AutoCompleteOption[] = DESCRIPTION_OPTIONS.map((description) => ({
  value: description,
  label: description,
}));
const HSN_CODE_OPTIONS: AutoCompleteOption[] = hsnCodes.map((hsn) => ({
  value: hsn.code,
  label: `${hsn.code} — ${hsn.description}`,
  keywords: [hsn.description, hsn.code],
}));
const UOM_SUGGESTIONS: AutoCompleteOption[] = uomOptions.map((unit) => ({ value: unit }));
const TERMS_TEMPLATE = "1. This is an electronically generated invoice.\n2. All disputes are subject to GUDUR jurisdiction only.\n3. If the Consignee makes any Inter State Sale, he has to pay GST himself.\n4. Goods once sold cannot be taken back or exchanged.\n5. Payment terms as per agreement between buyer and seller.";
const LOCKED_INPUT_CLASSES = "bg-muted/40 text-muted-foreground cursor-not-allowed";
const COMPUTED_INPUT_CLASSES = "bg-muted/30 font-medium cursor-not-allowed";
const COMPUTED_TOTAL_INPUT_CLASSES = "bg-muted font-semibold cursor-not-allowed";
const DATE_FORMAT_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPercent = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0.00%";
  }

  return `${value.toFixed(2)}%`;
};

const formatDateDDMMYYYY = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getTodayForInput = () => formatDateDDMMYYYY(new Date());

const normalizeDateInput = (value: string | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }

  if (value.includes("/")) {
    return value;
  }

  if (value.includes("-")) {
    const [year, month, day] = value.split("-");
    if (year && month && day) {
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
  }

  return value;
};

type ItemFormValue = {
  description?: string;
  hsnCode?: string;
  quantity?: number;
  uom?: string;
  rate?: number;
  cessRate?: number;
};

const buildDefaultItem = (): ItemFormValue => {
  const baseCode = DEFAULT_HSN_CODE;
  const hsnDetails = DEFAULT_HSN_DETAILS ?? hsnCodeMap.get(baseCode);

  return {
    description: hsnDetails?.description ?? "",
    hsnCode: baseCode,
    quantity: 0,
    uom: DEFAULT_UOM,
    rate: 0,
    cessRate: hsnDetails?.cess ?? 0,
  };
};

const buildBaseDefaults = (profile?: Profile): InvoiceFormData => {
  const today = getTodayForInput();

  return {
    companyName: profile?.companyDetails.companyName || "KAVERI TRADERS",
    companyAddress: profile?.companyDetails.address || "191, Guduru, Pagadalapalli, Idulapalli, Tirupati, Andhra Pradesh - 524409",
    companyGSTIN: profile?.companyDetails.gstin || "37HERPB7733F1Z5",
    companyEmail: profile?.companyDetails.email || "",
    companyPhone: profile?.companyDetails.phone || "",
    companyState: profile?.companyDetails.state || "Andhra Pradesh",
    companyStateCode: profile?.companyDetails.stateCode || "37",
  invoiceNumber: "INV-2025-12",
    invoiceDate: today,
    invoiceType: "Tax Invoice",
    saleType: "Interstate",
    reverseCharge: "No",
  transportMode: transportModes[0] ?? "",
    vehicleNumber: "",
    transporterName: "",
    challanNumber: "",
    lrNumber: "",
    dateOfSupply: today,
    placeOfSupply: "",
    poNumber: "",
    eWayBillNumber: "",
    receiverName: "",
    receiverAddress: "",
    receiverGSTIN: "UNREGISTERED",
    receiverState: "",
    receiverStateCode: "",
    consigneeName: "",
    consigneeAddress: "",
    consigneeGSTIN: "UNREGISTERED",
    consigneeState: "",
    consigneeStateCode: "",
    items: [buildDefaultItem()],
    termsAndConditions: profile?.termsAndConditions || TERMS_TEMPLATE,
  };
};

const mergeItemsWithDefaults = (items: unknown[]): InvoiceFormData["items"] => {
  return items.map((item) => {
    const castItem = item as ItemFormValue;
    const rawHSNCode = typeof castItem?.hsnCode === "string" ? castItem.hsnCode : DEFAULT_HSN_CODE;
    const normalizedHSNCode = normalizeHsnCode(rawHSNCode) || DEFAULT_HSN_CODE;
  const hsnDetails = hsnCodeMap.get(normalizedHSNCode) ?? DEFAULT_HSN_DETAILS;

    return {
      description:
        typeof castItem?.description === "string" && castItem.description.trim()
          ? castItem.description
          : hsnDetails?.description ?? "",
      hsnCode: normalizedHSNCode,
      quantity: typeof castItem?.quantity === "number" && !Number.isNaN(castItem.quantity) ? castItem.quantity : 0,
      uom: typeof castItem?.uom === "string" && castItem.uom ? castItem.uom : DEFAULT_UOM,
      rate: typeof castItem?.rate === "number" && !Number.isNaN(castItem.rate) ? castItem.rate : 0,
      cessRate:
        typeof castItem?.cessRate === "number" && !Number.isNaN(castItem.cessRate)
          ? castItem.cessRate
          : hsnDetails?.cess ?? 0,
    };
  });
};

const getDefaultValues = (profile: Profile): InvoiceFormData => {
  const baseDefaults = buildBaseDefaults(profile);

  if (typeof window === "undefined") {
    return baseDefaults;
  }

  const storageKey = getFormStorageKey(profile.id);
  const storedData = window.localStorage.getItem(storageKey);
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      const mergedItems = Array.isArray(parsedData?.items)
        ? mergeItemsWithDefaults(parsedData.items)
        : baseDefaults.items;

      return {
        ...baseDefaults,
        ...parsedData,
        // Ensure every fresh load starts with today's dates even when cached data exists.
        invoiceDate: baseDefaults.invoiceDate,
        dateOfSupply: baseDefaults.dateOfSupply,
        receiverGSTIN: parsedData?.receiverGSTIN || baseDefaults.receiverGSTIN,
        consigneeGSTIN: parsedData?.consigneeGSTIN || baseDefaults.consigneeGSTIN,
        items: mergedItems,
        termsAndConditions: parsedData?.termsAndConditions || baseDefaults.termsAndConditions,
      };
    } catch (error) {
      console.error("Error parsing stored form data:", error);
      window.localStorage.removeItem(storageKey);
    }
  }

  return baseDefaults;
};

function calculateItemTotals(item: ItemFormValue, saleType: string): InvoiceItem {
  const normalizedHsnCode = normalizeHsnCode(
    typeof item.hsnCode === "string" && item.hsnCode ? item.hsnCode : DEFAULT_HSN_CODE,
  ) || DEFAULT_HSN_CODE;
  const quantity = typeof item.quantity === "number" && !Number.isNaN(item.quantity) ? item.quantity : 0;
  const rate = typeof item.rate === "number" && !Number.isNaN(item.rate) ? item.rate : 0;
  const taxableValue = quantity * rate;
  const hsnData = hsnCodeMap.get(normalizedHsnCode) ?? DEFAULT_HSN_DETAILS;

  let cgstRate = hsnData?.cgst ?? 0;
  let sgstRate = hsnData?.sgst ?? 0;
  let igstRate = hsnData?.igst ?? 0;

  if (saleType === "Intrastate") {
    if (cgstRate === 0 && sgstRate === 0 && igstRate > 0) {
      cgstRate = igstRate / 2;
      sgstRate = igstRate / 2;
    }
    igstRate = 0;
  } else {
    if (igstRate === 0 && (cgstRate > 0 || sgstRate > 0)) {
      igstRate = cgstRate + sgstRate;
    }
    cgstRate = 0;
    sgstRate = 0;
  }

  const cgstAmount = (taxableValue * cgstRate) / 100;
  const sgstAmount = (taxableValue * sgstRate) / 100;
  const igstAmount = (taxableValue * igstRate) / 100;

  const manualCessRate =
    typeof item.cessRate === "number" && !Number.isNaN(item.cessRate)
      ? item.cessRate
      : hsnData?.cess ?? 0;
  const cessRate = Math.max(0, manualCessRate);
  const cessAmount = (taxableValue * cessRate) / 100;

  const totalAmount = taxableValue + cgstAmount + sgstAmount + igstAmount + cessAmount;

  return {
    id: Math.random().toString(),
    description:
      typeof item.description === "string" && item.description.trim()
        ? item.description
        : hsnData?.description ?? "",
    hsnCode: normalizedHsnCode,
    quantity,
    uom: typeof item.uom === "string" ? item.uom : DEFAULT_UOM,
    rate,
    taxableValue,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    cessRate,
    cessAmount,
    totalAmount,
  };
}

import { Profile } from "@/types/profile";

interface InvoiceFormProps {
  profile: Profile;
}

export const InvoiceForm = ({ profile }: InvoiceFormProps) => {
  const navigate = useNavigate();

  const { register, control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: getDefaultValues(profile),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchSaleType = watch("saleType");
  const watchCompanyStateCode = watch("companyStateCode");
  const watchReceiverStateCode = watch("receiverStateCode");
  const watchConsigneeStateCode = watch("consigneeStateCode");
  const receiverStateValue = watch("receiverState");
  const consigneeStateValue = watch("consigneeState");
  const transportModeValue = watch("transportMode");
  const reverseChargeValue = watch("reverseCharge");
  const invoiceDateValue = watch("invoiceDate");
  const dateOfSupplyValue = watch("dateOfSupply");
  const watchedItems = useWatch({ control, name: "items" });
  const [isSaleTypeManuallySet, setIsSaleTypeManuallySet] = useState(false);

  const effectiveSaleType = watchSaleType || "Interstate";

  const itemsForCalculation = Array.isArray(watchedItems) ? (watchedItems as ItemFormValue[]) : [];
  const derivedItems = itemsForCalculation.map((item) => calculateItemTotals(item, effectiveSaleType));

  // Watch all form data and save to localStorage
  const watchedFormData = watch();

  useEffect(() => {
    if (!watchCompanyStateCode || !watchReceiverStateCode || !watchSaleType) {
      return;
    }

    const derivedSaleType = determineSaleType(watchCompanyStateCode, watchReceiverStateCode);

    if (watchSaleType !== derivedSaleType) {
      if (!isSaleTypeManuallySet) {
        setIsSaleTypeManuallySet(true);
      }
    } else if (isSaleTypeManuallySet) {
      setIsSaleTypeManuallySet(false);
    }
  }, [watchCompanyStateCode, watchReceiverStateCode, watchSaleType, isSaleTypeManuallySet]);

  useEffect(() => {
    // Save form data to localStorage whenever form changes
    const saveFormData = () => {
      try {
        if (typeof window === "undefined") {
          return;
        }
        const storageKey = getFormStorageKey(profile.id);
        window.localStorage.setItem(storageKey, JSON.stringify(watchedFormData));
      } catch (error) {
        console.error('Error saving form data to localStorage:', error);
      }
    };

    // Debounce the save operation to avoid too frequent localStorage writes
    const timeoutId = setTimeout(saveFormData, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedFormData, profile.id]);

  // Auto-update sale type when state codes change unless user overrides
  useEffect(() => {
    if (!watchCompanyStateCode || !watchReceiverStateCode) {
      return;
    }

    const derivedSaleType = determineSaleType(watchCompanyStateCode, watchReceiverStateCode);

    if (isSaleTypeManuallySet) {
      if (watchSaleType === derivedSaleType) {
        setIsSaleTypeManuallySet(false);
      }
      return;
    }

    if (derivedSaleType !== watchSaleType) {
      setValue("saleType", derivedSaleType, { shouldDirty: false, shouldValidate: true });
      toast.success(`Sale type updated to ${derivedSaleType}`);
    }
  }, [watchCompanyStateCode, watchReceiverStateCode, watchSaleType, isSaleTypeManuallySet, setValue]);

  // Auto-determine sale type based on state codes
  const determineSaleType = (companyCode: string, receiverCode: string) => {
    if (companyCode && receiverCode) {
      return companyCode === receiverCode ? "Intrastate" : "Interstate";
    }
    return "Interstate";
  };

  useEffect(() => {
    const normalizedInvoiceDate = normalizeDateInput(invoiceDateValue, getTodayForInput());
    if (invoiceDateValue && normalizedInvoiceDate !== invoiceDateValue) {
      setValue("invoiceDate", normalizedInvoiceDate, { shouldDirty: true, shouldValidate: true });
    }
  }, [invoiceDateValue, setValue]);

  useEffect(() => {
    const normalizedSupplyDate = normalizeDateInput(dateOfSupplyValue, getTodayForInput());
    if (dateOfSupplyValue && normalizedSupplyDate !== dateOfSupplyValue) {
      setValue("dateOfSupply", normalizedSupplyDate, { shouldDirty: true, shouldValidate: true });
    }
  }, [dateOfSupplyValue, setValue]);

  // Clear form and localStorage
  const clearForm = () => {
    const defaults = buildBaseDefaults(profile);

    reset(defaults);
    setIsSaleTypeManuallySet(false);
    if (typeof window !== "undefined") {
      const storageKey = getFormStorageKey(profile.id);
      window.localStorage.removeItem(storageKey);
    }
    toast.success("Form cleared successfully");
  };

  const copyReceiverToConsignee = () => {
    const receiverName = watch("receiverName");
    const receiverAddress = watch("receiverAddress");
    const receiverGSTIN = watch("receiverGSTIN");
    const receiverState = watch("receiverState");
    const receiverStateCode = watch("receiverStateCode");

    setValue("consigneeName", receiverName, { shouldDirty: true, shouldValidate: true });
    setValue("consigneeAddress", receiverAddress, { shouldDirty: true, shouldValidate: true });
    setValue("consigneeGSTIN", receiverGSTIN, { shouldDirty: true, shouldValidate: true });
    setValue("consigneeState", receiverState, { shouldDirty: true, shouldValidate: true });
    setValue("consigneeStateCode", receiverStateCode, { shouldDirty: true, shouldValidate: true });
    toast.success("Consignee details copied from receiver");
  };

  const onSubmit = (data: InvoiceFormData, action: "preview" | "download") => {
    // Ensure form data is saved to localStorage before navigation
    try {
      if (typeof window !== "undefined") {
        const storageKey = getFormStorageKey(profile.id);
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }

    const invoiceData: InvoiceData = {
      companyName: data.companyName || "",
      companyAddress: data.companyAddress || "",
      companyGSTIN: data.companyGSTIN || "",
      companyEmail: data.companyEmail || "",
      companyPhone: data.companyPhone || "",
      companyState: data.companyState || "",
      companyStateCode: data.companyStateCode || "",
      invoiceNumber: data.invoiceNumber || "",
      invoiceDate: data.invoiceDate || "",
      invoiceType: data.invoiceType || "Tax Invoice",
      saleType: data.saleType || "Interstate",
      reverseCharge: data.reverseCharge || "No",
      transportMode: data.transportMode || "",
      vehicleNumber: data.vehicleNumber || "",
      transporterName: data.transporterName || "",
      challanNumber: data.challanNumber || "",
      lrNumber: data.lrNumber || "",
      dateOfSupply: data.dateOfSupply || "",
      placeOfSupply: data.placeOfSupply || "",
      poNumber: data.poNumber || "",
      eWayBillNumber: data.eWayBillNumber || "Not Applicable",
      receiverName: data.receiverName || "",
      receiverAddress: data.receiverAddress || "",
      receiverGSTIN: data.receiverGSTIN || "",
      receiverState: data.receiverState || "",
      receiverStateCode: data.receiverStateCode || "",
      consigneeName: data.consigneeName || "",
      consigneeAddress: data.consigneeAddress || "",
    consigneeGSTIN: data.consigneeGSTIN || "",
    consigneeState: data.consigneeState || "",
    consigneeStateCode: data.consigneeStateCode || "",
    items: data.items.map((item) => calculateItemTotals(item, data.saleType)),
      termsAndConditions: data.termsAndConditions || "",
    };

    if (action === "preview") {
      navigate("/preview", { state: invoiceData });
    } else {
      navigate("/preview", { state: invoiceData });
      setTimeout(() => window.print(), 500);
    }
  };

  return (
    <form className="space-y-6">
      {/* Section 1: Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-header">Company Details</CardTitle>
          <CardDescription>Your business information for the invoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                {...register("companyName")}
                id="companyName"
                readOnly
                className={LOCKED_INPUT_CLASSES}
              />
              {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <Label htmlFor="companyGSTIN">GSTIN *</Label>
              <Input
                {...register("companyGSTIN")}
                id="companyGSTIN"
                readOnly
                className={LOCKED_INPUT_CLASSES}
              />
              {errors.companyGSTIN && <p className="text-sm text-destructive mt-1">{errors.companyGSTIN.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="companyAddress">Address *</Label>
            <Textarea
              {...register("companyAddress")}
              id="companyAddress"
              rows={2}
              readOnly
              className={LOCKED_INPUT_CLASSES}
            />
            {errors.companyAddress && <p className="text-sm text-destructive mt-1">{errors.companyAddress.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                {...register("companyEmail")}
                type="email"
                id="companyEmail"
                readOnly
                className={LOCKED_INPUT_CLASSES}
              />
              {errors.companyEmail && <p className="text-sm text-destructive mt-1">{errors.companyEmail.message}</p>}
            </div>
            <div>
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                {...register("companyPhone")}
                type="tel"
                id="companyPhone"
                readOnly
                className={LOCKED_INPUT_CLASSES}
              />
            </div>
            <div>
              <Label htmlFor="companyState">State *</Label>
              <Input
                {...register("companyState")}
                id="companyState"
                readOnly
                className={LOCKED_INPUT_CLASSES}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyGSTIN">GSTIN *</Label>
              <Input
                {...register("companyGSTIN")}
                id="companyGSTIN"
                readOnly
                className={LOCKED_INPUT_CLASSES}
              />
              {errors.companyGSTIN && <p className="text-sm text-destructive mt-1">{errors.companyGSTIN.message}</p>}
            </div>
            <div>
              <Label htmlFor="companyStateCode">State Code *</Label>
              <Input
                {...register("companyStateCode")}
                id="companyStateCode"
                readOnly
                className={LOCKED_INPUT_CLASSES}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Invoice Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-header">Invoice Metadata</CardTitle>
          <CardDescription>Invoice identification and classification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input {...register("invoiceNumber")} id="invoiceNumber" placeholder="INV-2025-001" />
              {errors.invoiceNumber && <p className="text-sm text-destructive mt-1">{errors.invoiceNumber.message}</p>}
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input {...register("invoiceDate")} id="invoiceDate" placeholder="DD/MM/YYYY" />
              {errors.invoiceDate && <p className="text-sm text-destructive mt-1">{errors.invoiceDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="dateOfSupply">Date of Supply *</Label>
              <Input {...register("dateOfSupply")} id="dateOfSupply" placeholder="DD/MM/YYYY" />
              {errors.dateOfSupply && <p className="text-sm text-destructive mt-1">{errors.dateOfSupply.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceType">Invoice Type</Label>
              <Input {...register("invoiceType")} id="invoiceType" defaultValue="Tax Invoice" />
            </div>
            <div>
              <Label htmlFor="saleType">Sale Type *</Label>
              <Select
                value={effectiveSaleType}
                onValueChange={(value) => {
                  setIsSaleTypeManuallySet(true);
                  setValue("saleType", value, { shouldDirty: true, shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sale type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Interstate">Interstate</SelectItem>
                  <SelectItem value="Intrastate">Intrastate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reverseCharge">Reverse Charge</Label>
              <Select
                value={reverseChargeValue || "No"}
                onValueChange={(value) => setValue("reverseCharge", value, { shouldDirty: true, shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Transport Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-header">Transport Details</CardTitle>
          <CardDescription>Logistics and shipping information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="transportMode">Transport Mode</Label>
              <Select
                value={transportModeValue || transportModes[0]}
                onValueChange={(value) => setValue("transportMode", value, { shouldDirty: true, shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transportModes.map(mode => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input {...register("vehicleNumber")} id="vehicleNumber" placeholder="AP37TD9449" />
            </div>
            <div>
              <Label htmlFor="transporterName">Transporter Name</Label>
              <Input {...register("transporterName")} id="transporterName" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="challanNumber">Challan Number</Label>
              <Input {...register("challanNumber")} id="challanNumber" />
            </div>
            <div>
              <Label htmlFor="lrNumber">L.R Number</Label>
              <Input {...register("lrNumber")} id="lrNumber" />
            </div>
            <div>
              <Label htmlFor="placeOfSupply">Place of Supply</Label>
              <Input {...register("placeOfSupply")} id="placeOfSupply" />
            </div>
            <div>
              <Label htmlFor="poNumber">P.O Number</Label>
              <Input {...register("poNumber")} id="poNumber" />
            </div>
          </div>
          <div>
            <Label htmlFor="eWayBillNumber">E-Way Bill Number</Label>
            <Input {...register("eWayBillNumber")} id="eWayBillNumber" placeholder="Not Applicable" />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Receiver Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-header">Receiver Details (Billed to)</CardTitle>
          <CardDescription>Customer billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="receiverName">Name *</Label>
              <Input {...register("receiverName")} id="receiverName" />
              {errors.receiverName && <p className="text-sm text-destructive mt-1">{errors.receiverName.message}</p>}
            </div>
            <div>
              <Label htmlFor="receiverGSTIN">GSTIN *</Label>
              <Controller
                control={control}
                name="receiverGSTIN"
                render={({ field }) => (
                  <AutoCompleteInput
                    id="receiverGSTIN"
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onChange={(nextValue) => field.onChange(nextValue.toUpperCase())}
                    onBlur={(event) => {
                      field.onBlur();
                      const normalized = event.target.value.trim().toUpperCase();
                      if (normalized !== field.value) {
                        setValue("receiverGSTIN", normalized, { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    placeholder="Enter GSTIN or type UNREGISTERED"
                    options={GSTIN_SUGGESTIONS}
                    emptyMessage="Enter GSTIN or choose UNREGISTERED"
                  />
                )}
              />
              {errors.receiverGSTIN && <p className="text-sm text-destructive mt-1">{errors.receiverGSTIN.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="receiverAddress">Address *</Label>
            <Textarea {...register("receiverAddress")} id="receiverAddress" rows={2} />
            {errors.receiverAddress && <p className="text-sm text-destructive mt-1">{errors.receiverAddress.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="receiverState">State *</Label>
              <Controller
                control={control}
                name="receiverState"
                render={({ field }) => (
                  <AutoCompleteInput
                    id="receiverState"
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onChange={(value) => {
                      field.onChange(value);
                      if (!value.trim()) {
                        setValue("receiverStateCode", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onBlur={(event) => {
                      field.onBlur();
                      const typed = event.target.value.trim();
                      if (!typed) {
                        setValue("receiverState", "", { shouldDirty: true, shouldValidate: true });
                        setValue("receiverStateCode", "", { shouldDirty: true, shouldValidate: true });
                        return;
                      }
                      const match = STATE_NAME_LOOKUP.get(normalizeStateName(typed));
                      if (match) {
                        setValue("receiverState", match.name, { shouldDirty: true, shouldValidate: true });
                        setValue("receiverStateCode", match.code, { shouldDirty: true, shouldValidate: true });
                      } else {
                        setValue("receiverState", typed, { shouldDirty: true, shouldValidate: true });
                        setValue("receiverStateCode", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onOptionSelect={(option) => {
                      const match = STATE_NAME_LOOKUP.get(normalizeStateName(option.value));
                      if (match) {
                        setValue("receiverState", match.name, { shouldDirty: true, shouldValidate: true });
                        setValue("receiverStateCode", match.code, { shouldDirty: true, shouldValidate: true });
                      } else {
                        setValue("receiverState", option.value, { shouldDirty: true, shouldValidate: true });
                        setValue("receiverStateCode", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    placeholder="Type or select state"
                    options={STATE_NAME_OPTIONS}
                    emptyMessage="No matching state"
                  />
                )}
              />
              {errors.receiverState && <p className="text-sm text-destructive mt-1">{errors.receiverState.message}</p>}
            </div>
            <div>
              <Label htmlFor="receiverStateCode">State Code *</Label>
              <Controller
                control={control}
                name="receiverStateCode"
                render={({ field }) => (
                  <AutoCompleteInput
                    id="receiverStateCode"
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onChange={(value) => {
                      const normalized = normalizeStateCodeValue(value);
                      field.onChange(normalized);
                      if (!normalized) {
                        setValue("receiverState", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onBlur={(event) => {
                      field.onBlur();
                      const typed = normalizeStateCodeValue(event.target.value);
                      if (!typed) {
                        setValue("receiverStateCode", "", { shouldDirty: true, shouldValidate: true });
                        setValue("receiverState", "", { shouldDirty: true, shouldValidate: true });
                        return;
                      }
                      const match = STATE_CODE_LOOKUP.get(typed);
                      if (match) {
                        setValue("receiverStateCode", match.code, { shouldDirty: true, shouldValidate: true });
                        setValue("receiverState", match.name, { shouldDirty: true, shouldValidate: true });
                      } else {
                        setValue("receiverStateCode", typed, { shouldDirty: true, shouldValidate: true });
                        setValue("receiverState", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onOptionSelect={(option) => {
                      const normalized = normalizeStateCodeValue(option.value);
                      const match = STATE_CODE_LOOKUP.get(normalized);
                      setValue("receiverStateCode", normalized, { shouldDirty: true, shouldValidate: true });
                      if (match) {
                        setValue("receiverState", match.name, { shouldDirty: true, shouldValidate: true });
                      } else {
                        setValue("receiverState", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    placeholder="Type or select code"
                    options={STATE_CODE_OPTIONS}
                    emptyMessage="No matching code"
                    inputMode="numeric"
                  />
                )}
              />
              {errors.receiverStateCode && <p className="text-sm text-destructive mt-1">{errors.receiverStateCode.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Consignee Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-invoice-header">Consignee Details (Shipped to)</CardTitle>
            <CardDescription>Shipping destination information</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copyReceiverToConsignee} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy from Receiver
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="consigneeName">Name *</Label>
              <Input {...register("consigneeName")} id="consigneeName" />
              {errors.consigneeName && <p className="text-sm text-destructive mt-1">{errors.consigneeName.message}</p>}
            </div>
            <div>
              <Label htmlFor="consigneeGSTIN">GSTIN *</Label>
              <Controller
                control={control}
                name="consigneeGSTIN"
                render={({ field }) => (
                  <AutoCompleteInput
                    id="consigneeGSTIN"
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onChange={(nextValue) => field.onChange(nextValue.toUpperCase())}
                    onBlur={(event) => {
                      field.onBlur();
                      const normalized = event.target.value.trim().toUpperCase();
                      if (normalized !== field.value) {
                        setValue("consigneeGSTIN", normalized, { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    placeholder="Enter GSTIN or type UNREGISTERED"
                    options={GSTIN_SUGGESTIONS}
                    emptyMessage="Enter GSTIN or choose UNREGISTERED"
                  />
                )}
              />
              {errors.consigneeGSTIN && <p className="text-sm text-destructive mt-1">{errors.consigneeGSTIN.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="consigneeAddress">Address *</Label>
            <Textarea {...register("consigneeAddress")} id="consigneeAddress" rows={2} />
            {errors.consigneeAddress && <p className="text-sm text-destructive mt-1">{errors.consigneeAddress.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="consigneeState">State *</Label>
              <Controller
                control={control}
                name="consigneeState"
                render={({ field }) => (
                  <AutoCompleteInput
                    id="consigneeState"
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onChange={(value) => {
                      field.onChange(value);
                      if (!value.trim()) {
                        setValue("consigneeStateCode", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onBlur={(event) => {
                      field.onBlur();
                      const typed = event.target.value.trim();
                      if (!typed) {
                        setValue("consigneeState", "", { shouldDirty: true, shouldValidate: true });
                        setValue("consigneeStateCode", "", { shouldDirty: true, shouldValidate: true });
                        return;
                      }
                      const match = STATE_NAME_LOOKUP.get(normalizeStateName(typed));
                      if (match) {
                        setValue("consigneeState", match.name, { shouldDirty: true, shouldValidate: true });
                        setValue("consigneeStateCode", match.code, { shouldDirty: true, shouldValidate: true });
                      } else {
                        setValue("consigneeState", typed, { shouldDirty: true, shouldValidate: true });
                        setValue("consigneeStateCode", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onOptionSelect={(option) => {
                      const match = STATE_NAME_LOOKUP.get(normalizeStateName(option.value));
                      if (match) {
                        setValue("consigneeState", match.name, { shouldDirty: true, shouldValidate: true });
                        setValue("consigneeStateCode", match.code, { shouldDirty: true, shouldValidate: true });
                      } else {
                        setValue("consigneeState", option.value, { shouldDirty: true, shouldValidate: true });
                        setValue("consigneeStateCode", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    placeholder="Type or select state"
                    options={STATE_NAME_OPTIONS}
                    emptyMessage="No matching state"
                  />
                )}
              />
              {errors.consigneeState && <p className="text-sm text-destructive mt-1">{errors.consigneeState.message}</p>}
            </div>
            <div>
              <Label htmlFor="consigneeStateCode">State Code *</Label>
              <Controller
                control={control}
                name="consigneeStateCode"
                render={({ field }) => (
                  <AutoCompleteInput
                    id="consigneeStateCode"
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? ""}
                    onChange={(value) => {
                      const normalized = normalizeStateCodeValue(value);
                      field.onChange(normalized);
                      if (!normalized) {
                        setValue("consigneeState", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onBlur={(event) => {
                      field.onBlur();
                      const typed = normalizeStateCodeValue(event.target.value);
                      if (!typed) {
                        setValue("consigneeStateCode", "", { shouldDirty: true, shouldValidate: true });
                        setValue("consigneeState", "", { shouldDirty: true, shouldValidate: true });
                        return;
                      }
                      const match = STATE_CODE_LOOKUP.get(typed);
                      if (match) {
                        setValue("consigneeStateCode", match.code, { shouldDirty: true, shouldValidate: true });
                        setValue("consigneeState", match.name, { shouldDirty: true, shouldValidate: true });
                      } else {
                        setValue("consigneeStateCode", typed, { shouldDirty: true, shouldValidate: true });
                        setValue("consigneeState", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onOptionSelect={(option) => {
                      const normalized = normalizeStateCodeValue(option.value);
                      const match = STATE_CODE_LOOKUP.get(normalized);
                      setValue("consigneeStateCode", normalized, { shouldDirty: true, shouldValidate: true });
                      if (match) {
                        setValue("consigneeState", match.name, { shouldDirty: true, shouldValidate: true });
                      } else {
                        setValue("consigneeState", "", { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    placeholder="Type or select code"
                    options={STATE_CODE_OPTIONS}
                    emptyMessage="No matching code"
                    inputMode="numeric"
                  />
                )}
              />
              {errors.consigneeStateCode && <p className="text-sm text-destructive mt-1">{errors.consigneeStateCode.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-header">Invoice Items</CardTitle>
          <CardDescription>Products or services being invoiced</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const currentItem = itemsForCalculation[index] ?? buildDefaultItem();
            const derivedItem = derivedItems[index];
            const taxableAmountLabel = currencyFormatter.format(derivedItem?.taxableValue ?? 0);
            const cgstRateLabel = formatPercent(derivedItem?.cgstRate);
            const sgstRateLabel = formatPercent(derivedItem?.sgstRate);
            const igstRateLabel = formatPercent(derivedItem?.igstRate);
            const cessRateLabel = formatPercent(derivedItem?.cessRate ?? currentItem.cessRate);
            const cgstAmountLabel = currencyFormatter.format(derivedItem?.cgstAmount ?? 0);
            const sgstAmountLabel = currencyFormatter.format(derivedItem?.sgstAmount ?? 0);
            const igstAmountLabel = currencyFormatter.format(derivedItem?.igstAmount ?? 0);
            const cessAmountLabel = currencyFormatter.format(derivedItem?.cessAmount ?? 0);
            const totalTaxAmountLabel = currencyFormatter.format(
              (derivedItem?.cgstAmount ?? 0) +
              (derivedItem?.sgstAmount ?? 0) +
              (derivedItem?.igstAmount ?? 0) +
              (derivedItem?.cessAmount ?? 0)
            );
            const totalAmountLabel = currencyFormatter.format(derivedItem?.totalAmount ?? 0);

            return (
              <div key={field.id} className="border border-border rounded-lg p-4 space-y-4 bg-section-bg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>HSN/SAC Code *</Label>
                    <Controller
                      control={control}
                      name={`items.${index}.hsnCode` as const}
                      render={({ field }) => (
                        <AutoCompleteInput
                          id={`item-${index}-hsn`}
                          name={field.name}
                          ref={field.ref}
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(normalizeHsnCode(value))}
                          onBlur={(event) => {
                            field.onBlur();
                            const typed = normalizeHsnCode(event.target.value);
                            if (!typed) {
                              return;
                            }
                            const match = hsnCodeMap.get(typed);
                            if (match) {
                              setValue(`items.${index}.hsnCode`, match.code, { shouldDirty: true, shouldValidate: true });
                              setValue(`items.${index}.description`, match.description, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              setValue(`items.${index}.cessRate`, match.cess ?? 0, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }
                          }}
                          onOptionSelect={(option) => {
                            const normalized = normalizeHsnCode(option.value);
                            field.onChange(normalized);
                            const match = hsnCodeMap.get(normalized);
                            if (!match) {
                              return;
                            }
                            setValue(`items.${index}.hsnCode`, match.code, { shouldDirty: true, shouldValidate: true });
                            setValue(`items.${index}.description`, match.description, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            setValue(`items.${index}.cessRate`, match.cess ?? 0, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                          placeholder="Enter HSN/SAC code"
                          options={HSN_CODE_OPTIONS}
                          emptyMessage="No matching HSN code"
                        />
                      )}
                    />
                    {errors.items?.[index]?.hsnCode && (
                      <p className="text-sm text-destructive mt-1">{errors.items[index]?.hsnCode?.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Description *</Label>
                    <Controller
                      control={control}
                      name={`items.${index}.description` as const}
                      render={({ field }) => (
                        <AutoCompleteInput
                          id={`item-${index}-description`}
                          name={field.name}
                          ref={field.ref}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={() => field.onBlur()}
                          placeholder="Enter item description"
                          options={DESCRIPTION_SUGGESTIONS}
                          emptyMessage="No matching description"
                        />
                      )}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-sm text-destructive mt-1">{errors.items[index]?.description?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>UOM *</Label>
                    <Controller
                      control={control}
                      name={`items.${index}.uom` as const}
                      render={({ field }) => (
                        <AutoCompleteInput
                          id={`item-${index}-uom`}
                          name={field.name}
                          ref={field.ref}
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value.toUpperCase())}
                          onBlur={() => field.onBlur()}
                          placeholder="Enter unit of measure"
                          options={UOM_SUGGESTIONS}
                          emptyMessage="No matching unit"
                        />
                      )}
                    />
                    {errors.items?.[index]?.uom && (
                      <p className="text-sm text-destructive mt-1">{errors.items[index]?.uom?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      placeholder="30"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-destructive mt-1">{errors.items[index]?.quantity?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Rate *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`items.${index}.rate`, { valueAsNumber: true })}
                      placeholder="1400"
                    />
                    {errors.items?.[index]?.rate && (
                      <p className="text-sm text-destructive mt-1">{errors.items[index]?.rate?.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Compensation Cess (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`items.${index}.cessRate`, { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.items?.[index]?.cessRate && (
                      <p className="text-sm text-destructive mt-1">{errors.items[index]?.cessRate?.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>CGST Rate</Label>
                    <Input value={cgstRateLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                  <div>
                    <Label>SGST Rate</Label>
                    <Input value={sgstRateLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                  <div>
                    <Label>IGST Rate</Label>
                    <Input value={igstRateLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                  <div>
                    <Label>Compensation Cess Rate</Label>
                    <Input value={cessRateLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>CGST Amount</Label>
                    <Input value={cgstAmountLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                  <div>
                    <Label>SGST Amount</Label>
                    <Input value={sgstAmountLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                  <div>
                    <Label>IGST Amount</Label>
                    <Input value={igstAmountLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                  <div>
                    <Label>Compensation Cess Amount</Label>
                    <Input value={cessAmountLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Taxable Amount</Label>
                    <Input value={taxableAmountLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                  <div>
                    <Label>Total Tax</Label>
                    <Input value={totalTaxAmountLabel} readOnly className={COMPUTED_INPUT_CLASSES} />
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <Input value={totalAmountLabel} readOnly className={COMPUTED_TOTAL_INPUT_CLASSES} />
                  </div>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            onClick={() => append(buildDefaultItem())}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Section 7: Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-invoice-header">Terms and Conditions</CardTitle>
          <CardDescription>Invoice terms and legal notices</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea {...register("termsAndConditions")} rows={6} />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-between sticky bottom-0 bg-background border-t border-border p-4 shadow-lg">
        <Button
          type="button"
          variant="destructive"
          size="lg"
          onClick={clearForm}
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          New Invoice
        </Button>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleSubmit((data) => onSubmit(data, "preview"))}
            className="gap-2"
          >
            <Eye className="h-5 w-5" />
            Preview Invoice
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit((data) => onSubmit(data, "download"))}
            className="gap-2"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </Button>
        </div>
      </div>
    </form>
  );
};
