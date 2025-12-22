/**
 * Invoice Form Types
 * Type definitions specific to the invoice form components
 */

import * as z from "zod";
import { GSTIN_REGEX, DATE_FORMAT_REGEX, TERMS_TEMPLATE } from "./constants";

// ============================================
// ZOD SCHEMAS
// ============================================

export const gstinSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .superRefine((value, ctx) => {
    if (!GSTIN_REGEX.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid 15-character GSTIN" });
    }
  });

export const gstinOrUnregisteredSchema = z
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

export const invoiceSchema = z.object({
  // Company details
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  companyGSTIN: gstinSchema,
  companyEmail: z.string().optional().transform(val => val?.trim() || ""),
  companyPhone: z.string().optional(),
  companyState: z.string().min(1, "State is required"),
  companyStateCode: z.string().min(1, "State code is required"),

  // Invoice metadata
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z
    .string()
    .min(1, "Invoice date is required")
    .refine((value) => DATE_FORMAT_REGEX.test(value), "Use DD/MM/YYYY format"),
  invoiceType: z.string().default("Tax Invoice"),
  saleType: z.string().min(1, "Sale type is required"),
  reverseCharge: z.string().default("No"),

  // Transport details
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

  // Receiver details
  receiverName: z.string().min(1, "Receiver name is required"),
  receiverAddress: z.string().min(1, "Receiver address is required"),
  receiverGSTIN: gstinOrUnregisteredSchema,
  receiverState: z.string().min(1, "Receiver state is required"),
  receiverStateCode: z.string().min(1, "Receiver state code is required"),

  // Consignee details
  consigneeName: z.string().min(1, "Consignee name is required"),
  consigneeAddress: z.string().min(1, "Consignee address is required"),
  consigneeGSTIN: gstinOrUnregisteredSchema,
  consigneeState: z.string().min(1, "Consignee state is required"),
  consigneeStateCode: z.string().min(1, "Consignee state code is required"),

  // Items
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

  // Terms
  termsAndConditions: z.string().default(TERMS_TEMPLATE),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export type ItemFormValue = {
  description?: string;
  hsnCode?: string;
  quantity?: number;
  uom?: string;
  rate?: number;
  cessRate?: number;
};

// Form context type for sharing between components
export interface InvoiceFormContextType {
  register: ReturnType<typeof import("react-hook-form").useForm<InvoiceFormData>>["register"];
  control: ReturnType<typeof import("react-hook-form").useForm<InvoiceFormData>>["control"];
  errors: ReturnType<typeof import("react-hook-form").useForm<InvoiceFormData>>["formState"]["errors"];
  watch: ReturnType<typeof import("react-hook-form").useForm<InvoiceFormData>>["watch"];
  setValue: ReturnType<typeof import("react-hook-form").useForm<InvoiceFormData>>["setValue"];
}
