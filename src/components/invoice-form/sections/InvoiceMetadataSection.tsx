/**
 * InvoiceMetadataSection
 * Invoice identification and classification fields
 * Shows: Invoice Number, Invoice Date, Date of Supply, Invoice Type, Sale Type, Reverse Charge
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceFormContextType } from "../types";

interface InvoiceMetadataSectionProps {
  register: InvoiceFormContextType["register"];
  errors: InvoiceFormContextType["errors"];
  setValue: InvoiceFormContextType["setValue"];
  effectiveSaleType: string;
  reverseChargeValue: string;
  onSaleTypeChange: (value: string) => void;
}

export const InvoiceMetadataSection = ({
  register,
  errors,
  setValue,
  effectiveSaleType,
  reverseChargeValue,
  onSaleTypeChange,
}: InvoiceMetadataSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-invoice-header">Invoice Metadata</CardTitle>
        <CardDescription>Invoice identification and classification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invoice Number, Date, Date of Supply Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
            <Input {...register("invoiceNumber")} id="invoiceNumber" placeholder="INV-2025-001" />
            {errors.invoiceNumber && (
              <p className="text-sm text-destructive mt-1">{errors.invoiceNumber.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="invoiceDate">Invoice Date *</Label>
            <Input {...register("invoiceDate")} id="invoiceDate" placeholder="DD/MM/YYYY" />
            {errors.invoiceDate && (
              <p className="text-sm text-destructive mt-1">{errors.invoiceDate.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="dateOfSupply">Date of Supply *</Label>
            <Input {...register("dateOfSupply")} id="dateOfSupply" placeholder="DD/MM/YYYY" />
            {errors.dateOfSupply && (
              <p className="text-sm text-destructive mt-1">{errors.dateOfSupply.message}</p>
            )}
          </div>
        </div>

        {/* Invoice Type, Sale Type, Reverse Charge Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="invoiceType">Invoice Type</Label>
            <Input {...register("invoiceType")} id="invoiceType" defaultValue="Tax Invoice" />
          </div>
          <div>
            <Label htmlFor="saleType">Sale Type *</Label>
            <Select value={effectiveSaleType} onValueChange={onSaleTypeChange}>
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
              onValueChange={(value) =>
                setValue("reverseCharge", value, { shouldDirty: true, shouldValidate: true })
              }
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
  );
};
