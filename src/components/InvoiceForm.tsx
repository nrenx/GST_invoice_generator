import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { hsnCodes, uomOptions, transportModes, indianStates } from "@/data/hsnCodes";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { toast } from "sonner";

const invoiceSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  companyGSTIN: z.string().min(15, "Valid GSTIN is required"),
  companyEmail: z.string().email("Valid email is required"),
  companyState: z.string().min(1, "State is required"),
  companyStateCode: z.string().min(1, "State code is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  invoiceType: z.string().default("Tax Invoice"),
  saleType: z.string().min(1, "Sale type is required"),
  reverseCharge: z.string().default("No"),
  transportMode: z.string().optional(),
  vehicleNumber: z.string().optional(),
  transporterName: z.string().optional(),
  challanNumber: z.string().optional(),
  lrNumber: z.string().optional(),
  dateOfSupply: z.string().min(1, "Date of supply is required"),
  placeOfSupply: z.string().optional(),
  poNumber: z.string().optional(),
  eWayBillNumber: z.string().optional(),
  receiverName: z.string().min(1, "Receiver name is required"),
  receiverAddress: z.string().min(1, "Receiver address is required"),
  receiverGSTIN: z.string().min(1, "Receiver GSTIN is required"),
  receiverState: z.string().min(1, "Receiver state is required"),
  receiverStateCode: z.string().min(1, "Receiver state code is required"),
  consigneeName: z.string().min(1, "Consignee name is required"),
  consigneeAddress: z.string().min(1, "Consignee address is required"),
  consigneeGSTIN: z.string().min(1, "Consignee GSTIN is required"),
  consigneeState: z.string().min(1, "Consignee state is required"),
  consigneeStateCode: z.string().min(1, "Consignee state code is required"),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    hsnCode: z.string().min(1, "HSN code is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    uom: z.string().min(1, "UOM is required"),
    rate: z.number().min(0.01, "Rate must be greater than 0"),
  })).min(1, "At least one item is required"),
  termsAndConditions: z.string().default(
    "1. This is an electronically generated invoice.\n2. All disputes are subject to GUDUR jurisdiction only.\n3. If the Consignee makes any Inter State Sale, he has to pay GST himself.\n4. Goods once sold cannot be taken back or exchanged.\n5. Payment terms as per agreement between buyer and seller."
  ),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const InvoiceForm = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyName: "KAVERI TRADERS",
      companyAddress: "191, Guduru, Pagadalapalli, Idulapalli, Tirupati, Andhra Pradesh - 524409",
      companyGSTIN: "37HERPB7733F1Z5",
      companyEmail: "kotidarisetty7777@gmail.com",
      companyState: "Andhra Pradesh",
      companyStateCode: "37",
      invoiceType: "Tax Invoice",
      reverseCharge: "No",
      saleType: "Interstate",
      items: [{ description: "", hsnCode: "", quantity: 0, uom: "", rate: 0 }],
      termsAndConditions: "1. This is an electronically generated invoice.\n2. All disputes are subject to GUDUR jurisdiction only.\n3. If the Consignee makes any Inter State Sale, he has to pay GST himself.\n4. Goods once sold cannot be taken back or exchanged.\n5. Payment terms as per agreement between buyer and seller.",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchSaleType = watch("saleType");
  const watchCompanyStateCode = watch("companyStateCode");
  const watchReceiverStateCode = watch("receiverStateCode");

  // Auto-determine sale type based on state codes
  const determineSaleType = (companyCode: string, receiverCode: string) => {
    if (companyCode && receiverCode) {
      return companyCode === receiverCode ? "Intrastate" : "Interstate";
    }
    return "Interstate";
  };

  const copyReceiverToConsignee = () => {
    const receiverName = watch("receiverName");
    const receiverAddress = watch("receiverAddress");
    const receiverGSTIN = watch("receiverGSTIN");
    const receiverState = watch("receiverState");
    const receiverStateCode = watch("receiverStateCode");

    setValue("consigneeName", receiverName);
    setValue("consigneeAddress", receiverAddress);
    setValue("consigneeGSTIN", receiverGSTIN);
    setValue("consigneeState", receiverState);
    setValue("consigneeStateCode", receiverStateCode);
    toast.success("Consignee details copied from receiver");
  };

  const calculateItemTotals = (item: any): InvoiceItem => {
    const taxableValue = item.quantity * item.rate;
    const hsnData = hsnCodes.find(h => h.code === item.hsnCode);
    
    let cgstRate = 0, sgstRate = 0, igstRate = 0;
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

    if (hsnData) {
      if (watchSaleType === "Intrastate") {
        cgstRate = hsnData.cgst;
        sgstRate = hsnData.sgst;
        cgstAmount = (taxableValue * cgstRate) / 100;
        sgstAmount = (taxableValue * sgstRate) / 100;
      } else {
        igstRate = hsnData.igst;
        igstAmount = (taxableValue * igstRate) / 100;
      }
    }

    const totalAmount = taxableValue + cgstAmount + sgstAmount + igstAmount;

    return {
      id: Math.random().toString(),
      description: item.description,
      hsnCode: item.hsnCode,
      quantity: item.quantity,
      uom: item.uom,
      rate: item.rate,
      taxableValue,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalAmount,
    };
  };

  const onSubmit = (data: InvoiceFormData, action: "preview" | "download") => {
    const invoiceData: InvoiceData = {
      companyName: data.companyName || "",
      companyAddress: data.companyAddress || "",
      companyGSTIN: data.companyGSTIN || "",
      companyEmail: data.companyEmail || "",
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
      items: data.items.map(calculateItemTotals),
      termsAndConditions: data.termsAndConditions || "",
    };

    if (action === "preview") {
      navigate("/preview", { state: invoiceData });
    } else {
      navigate("/preview", { state: invoiceData });
      setTimeout(() => window.print(), 500);
    }
  };

  const sections = [
    { title: "Company Details", fields: ["companyName", "companyAddress", "companyGSTIN"] },
    { title: "Invoice Metadata", fields: ["invoiceNumber", "invoiceDate", "saleType"] },
    { title: "Transport Details", fields: ["transportMode", "vehicleNumber"] },
    { title: "Receiver Details", fields: ["receiverName", "receiverAddress"] },
    { title: "Consignee Details", fields: ["consigneeName", "consigneeAddress"] },
    { title: "Invoice Items", fields: ["items"] },
  ];

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
              <Input {...register("companyName")} id="companyName" />
              {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <Label htmlFor="companyGSTIN">GSTIN *</Label>
              <Input {...register("companyGSTIN")} id="companyGSTIN" />
              {errors.companyGSTIN && <p className="text-sm text-destructive mt-1">{errors.companyGSTIN.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="companyAddress">Address *</Label>
            <Textarea {...register("companyAddress")} id="companyAddress" rows={2} />
            {errors.companyAddress && <p className="text-sm text-destructive mt-1">{errors.companyAddress.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="companyEmail">Email *</Label>
              <Input {...register("companyEmail")} type="email" id="companyEmail" />
              {errors.companyEmail && <p className="text-sm text-destructive mt-1">{errors.companyEmail.message}</p>}
            </div>
            <div>
              <Label htmlFor="companyState">State *</Label>
              <Select onValueChange={(value) => {
                setValue("companyState", value);
                const state = indianStates.find(s => s.name === value);
                if (state) setValue("companyStateCode", state.code);
              }} defaultValue={watch("companyState")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map(state => (
                    <SelectItem key={state.code} value={state.name}>{state.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="companyStateCode">State Code *</Label>
              <Input {...register("companyStateCode")} id="companyStateCode" readOnly />
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
              <Input {...register("invoiceDate")} type="date" id="invoiceDate" />
              {errors.invoiceDate && <p className="text-sm text-destructive mt-1">{errors.invoiceDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="dateOfSupply">Date of Supply *</Label>
              <Input {...register("dateOfSupply")} type="date" id="dateOfSupply" />
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
              <Select onValueChange={(value) => setValue("saleType", value)} defaultValue={watch("saleType")}>
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
              <Select onValueChange={(value) => setValue("reverseCharge", value)} defaultValue={watch("reverseCharge")}>
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
              <Select onValueChange={(value) => setValue("transportMode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
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
              <Input {...register("receiverGSTIN")} id="receiverGSTIN" placeholder="UNREGISTERED or GSTIN" />
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
              <Select onValueChange={(value) => {
                setValue("receiverState", value);
                const state = indianStates.find(s => s.name === value);
                if (state) {
                  setValue("receiverStateCode", state.code);
                  const newSaleType = determineSaleType(watchCompanyStateCode, state.code);
                  setValue("saleType", newSaleType);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map(state => (
                    <SelectItem key={state.code} value={state.name}>{state.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="receiverStateCode">State Code *</Label>
              <Input {...register("receiverStateCode")} id="receiverStateCode" readOnly />
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
              <Input {...register("consigneeGSTIN")} id="consigneeGSTIN" placeholder="UNREGISTERED or GSTIN" />
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
              <Select onValueChange={(value) => {
                setValue("consigneeState", value);
                const state = indianStates.find(s => s.name === value);
                if (state) setValue("consigneeStateCode", state.code);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map(state => (
                    <SelectItem key={state.code} value={state.name}>{state.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="consigneeStateCode">State Code *</Label>
              <Input {...register("consigneeStateCode")} id="consigneeStateCode" readOnly />
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
          {fields.map((field, index) => (
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
                <div className="md:col-span-2">
                  <Label>Description *</Label>
                  <Input {...register(`items.${index}.description` as const)} placeholder="Casuarina Poles" />
                  {errors.items?.[index]?.description && (
                    <p className="text-sm text-destructive mt-1">{errors.items[index]?.description?.message}</p>
                  )}
                </div>
                <div>
                  <Label>HSN/SAC Code *</Label>
                  <Select onValueChange={(value) => {
                    setValue(`items.${index}.hsnCode`, value);
                    const hsn = hsnCodes.find(h => h.code === value);
                    if (hsn) {
                      setValue(`items.${index}.rate`, hsn.rate);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select HSN code" />
                    </SelectTrigger>
                    <SelectContent>
                      {hsnCodes.map(hsn => (
                        <SelectItem key={hsn.code} value={hsn.code}>
                          {hsn.code} - {hsn.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>UOM *</Label>
                  <Select onValueChange={(value) => setValue(`items.${index}.uom`, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select UOM" />
                    </SelectTrigger>
                    <SelectContent>
                      {uomOptions.map(uom => (
                        <SelectItem key={uom} value={uom}>{uom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label>Rate *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.rate`, { valueAsNumber: true })}
                    placeholder="1400"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ description: "", hsnCode: "", quantity: 0, uom: "", rate: 0 })}
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
      <div className="flex gap-4 justify-end sticky bottom-0 bg-background border-t border-border p-4 shadow-lg">
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
    </form>
  );
};
