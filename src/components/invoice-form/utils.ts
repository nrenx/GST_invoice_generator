/**
 * Invoice Form Utilities
 * Helper functions for form operations, calculations, and formatting
 */

import { hsnCodeMap, normalizeHsnCode, transportModes } from "@/data/hsnCodes";
import { InvoiceItem } from "@/types/invoice";
import { Profile } from "@/types/profile";
import { 
  DEFAULT_UOM, 
  DEFAULT_HSN_CODE, 
  DEFAULT_HSN_DETAILS, 
  TERMS_TEMPLATE,
  getFormStorageKey 
} from "./constants";
import { InvoiceFormData, ItemFormValue } from "./types";

// ============================================
// FORMATTERS
// ============================================

export const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPercent = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0.00%";
  }
  return `${value.toFixed(2)}%`;
};

export const formatDateDDMMYYYY = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getTodayForInput = () => formatDateDDMMYYYY(new Date());

export const normalizeDateInput = (value: string | undefined, fallback: string) => {
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

// ============================================
// SALE TYPE HELPERS
// ============================================

export const determineSaleType = (companyCode: string, receiverCode: string) => {
  if (companyCode && receiverCode) {
    return companyCode === receiverCode ? "Intrastate" : "Interstate";
  }
  return "Interstate";
};

// ============================================
// ITEM BUILDERS
// ============================================

export const buildDefaultItem = (): ItemFormValue => {
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

// ============================================
// FORM DEFAULT VALUES
// ============================================

export const buildBaseDefaults = (profile?: Profile): InvoiceFormData => {
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

export const mergeItemsWithDefaults = (items: unknown[]): InvoiceFormData["items"] => {
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

export const getDefaultValues = (profile: Profile): InvoiceFormData => {
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
        // Ensure every fresh load starts with today's dates even when cached data exists
        invoiceDate: baseDefaults.invoiceDate,
        dateOfSupply: baseDefaults.dateOfSupply,
        receiverGSTIN: parsedData?.receiverGSTIN || baseDefaults.receiverGSTIN,
        consigneeGSTIN: parsedData?.consigneeGSTIN || baseDefaults.consigneeGSTIN,
        items: mergedItems,
        termsAndConditions: parsedData?.termsAndConditions || baseDefaults.termsAndConditions,
      };
    } catch (error) {
      // Clear corrupted data and use defaults
      window.localStorage.removeItem(storageKey);
    }
  }

  return baseDefaults;
};

// ============================================
// CALCULATIONS
// ============================================

export function calculateItemTotals(item: ItemFormValue, saleType: string): InvoiceItem {
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
