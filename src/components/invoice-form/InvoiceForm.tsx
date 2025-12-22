/**
 * InvoiceForm
 * Main orchestrator component that composes all invoice form sections
 * Manages form state, validation, localStorage persistence, and navigation
 */

import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Profile } from "@/types/profile";
import { InvoiceData } from "@/types/invoice";

// Form sections
import {
  CompanyDetailsSection,
  InvoiceMetadataSection,
  TransportDetailsSection,
  ReceiverDetailsSection,
  ConsigneeDetailsSection,
  InvoiceItemsSection,
  TermsAndConditionsSection,
  FormActionButtons,
} from "./sections";

// Types and utilities
import { invoiceSchema, InvoiceFormData, ItemFormValue } from "./types";
import { getFormStorageKey } from "./constants";
import {
  getDefaultValues,
  buildBaseDefaults,
  calculateItemTotals,
  determineSaleType,
  normalizeDateInput,
  getTodayForInput,
} from "./utils";

interface InvoiceFormProps {
  profile: Profile;
}

export const InvoiceForm = ({ profile }: InvoiceFormProps) => {
  const navigate = useNavigate();

  // Initialize form with react-hook-form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: getDefaultValues(profile),
  });

  // Field array for invoice items
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watched values for reactive updates
  const watchSaleType = watch("saleType");
  const watchCompanyStateCode = watch("companyStateCode");
  const watchReceiverStateCode = watch("receiverStateCode");
  const transportModeValue = watch("transportMode");
  const reverseChargeValue = watch("reverseCharge");
  const invoiceDateValue = watch("invoiceDate");
  const dateOfSupplyValue = watch("dateOfSupply");
  const watchedItems = useWatch({ control, name: "items" });
  const watchedFormData = watch();

  // Local state for manual sale type override tracking
  const [isSaleTypeManuallySet, setIsSaleTypeManuallySet] = useState(false);

  // Computed values
  const effectiveSaleType = watchSaleType || "Interstate";
  const itemsForCalculation = Array.isArray(watchedItems) ? (watchedItems as ItemFormValue[]) : [];
  const derivedItems = itemsForCalculation.map((item) =>
    calculateItemTotals(item, effectiveSaleType)
  );

  // ============================================
  // EFFECTS
  // ============================================

  // Track manual sale type changes
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

  // Save form data to localStorage on changes
  useEffect(() => {
    const saveFormData = () => {
      try {
        if (typeof window === "undefined") return;
        const storageKey = getFormStorageKey(profile.id);
        window.localStorage.setItem(storageKey, JSON.stringify(watchedFormData));
      } catch (error) {
        // Silently fail if localStorage is unavailable
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveFormData, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedFormData, profile.id]);

  // Auto-update sale type when state codes change (unless user overrode)
  useEffect(() => {
    if (!watchCompanyStateCode || !watchReceiverStateCode) return;

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
  }, [
    watchCompanyStateCode,
    watchReceiverStateCode,
    watchSaleType,
    isSaleTypeManuallySet,
    setValue,
  ]);

  // Normalize invoice date format
  useEffect(() => {
    const normalizedInvoiceDate = normalizeDateInput(invoiceDateValue, getTodayForInput());
    if (invoiceDateValue && normalizedInvoiceDate !== invoiceDateValue) {
      setValue("invoiceDate", normalizedInvoiceDate, { shouldDirty: true, shouldValidate: true });
    }
  }, [invoiceDateValue, setValue]);

  // Normalize date of supply format
  useEffect(() => {
    const normalizedSupplyDate = normalizeDateInput(dateOfSupplyValue, getTodayForInput());
    if (dateOfSupplyValue && normalizedSupplyDate !== dateOfSupplyValue) {
      setValue("dateOfSupply", normalizedSupplyDate, { shouldDirty: true, shouldValidate: true });
    }
  }, [dateOfSupplyValue, setValue]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSaleTypeChange = (value: string) => {
    setIsSaleTypeManuallySet(true);
    setValue("saleType", value, { shouldDirty: true, shouldValidate: true });
  };

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

  const onSubmit = (data: InvoiceFormData) => {
    // Save form data to localStorage before navigation
    try {
      if (typeof window !== "undefined") {
        const storageKey = getFormStorageKey(profile.id);
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      }
    } catch (error) {
      // Silently fail if localStorage is unavailable
    }

    // Build invoice data for preview
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

    navigate("/preview", { state: invoiceData });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <form className="space-y-6">
      {/* Section 1: Company Details */}
      <CompanyDetailsSection register={register} errors={errors} />

      {/* Section 2: Invoice Metadata */}
      <InvoiceMetadataSection
        register={register}
        errors={errors}
        setValue={setValue}
        effectiveSaleType={effectiveSaleType}
        reverseChargeValue={reverseChargeValue || "No"}
        onSaleTypeChange={handleSaleTypeChange}
      />

      {/* Section 3: Transport Details */}
      <TransportDetailsSection
        register={register}
        setValue={setValue}
        transportModeValue={transportModeValue || ""}
      />

      {/* Section 4: Receiver Details */}
      <ReceiverDetailsSection
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
      />

      {/* Section 5: Consignee Details */}
      <ConsigneeDetailsSection
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        onCopyFromReceiver={copyReceiverToConsignee}
      />

      {/* Section 6: Invoice Items */}
      <InvoiceItemsSection
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        fields={fields}
        append={append}
        remove={remove}
        itemsForCalculation={itemsForCalculation}
        derivedItems={derivedItems}
      />

      {/* Section 7: Terms and Conditions */}
      <TermsAndConditionsSection register={register} />

      {/* Action Buttons */}
      <FormActionButtons
        onClearForm={clearForm}
        onPreview={handleSubmit(onSubmit)}
      />
    </form>
  );
};
