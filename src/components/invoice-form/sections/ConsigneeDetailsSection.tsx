/**
 * ConsigneeDetailsSection
 * Shipping destination information (Shipped to)
 * Shows: Consignee Name, GSTIN, Address, State, State Code
 * Includes "Copy from Receiver" functionality
 */

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoCompleteInput } from "@/components/ui/auto-complete-input";
import { Copy } from "lucide-react";
import {
  GSTIN_SUGGESTIONS,
  STATE_NAME_OPTIONS,
  STATE_CODE_OPTIONS,
  STATE_NAME_LOOKUP,
  STATE_CODE_LOOKUP,
  normalizeStateName,
  normalizeStateCodeValue,
} from "../constants";
import { InvoiceFormContextType } from "../types";

interface ConsigneeDetailsSectionProps {
  register: InvoiceFormContextType["register"];
  control: InvoiceFormContextType["control"];
  errors: InvoiceFormContextType["errors"];
  setValue: InvoiceFormContextType["setValue"];
  onCopyFromReceiver: () => void;
}

export const ConsigneeDetailsSection = ({
  register,
  control,
  errors,
  setValue,
  onCopyFromReceiver,
}: ConsigneeDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-invoice-header">Consignee Details (Shipped to)</CardTitle>
          <CardDescription>Shipping destination information</CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopyFromReceiver}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy from Receiver
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name & GSTIN Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="consigneeName">Name *</Label>
            <Input {...register("consigneeName")} id="consigneeName" />
            {errors.consigneeName && (
              <p className="text-sm text-destructive mt-1">{errors.consigneeName.message}</p>
            )}
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
            {errors.consigneeGSTIN && (
              <p className="text-sm text-destructive mt-1">{errors.consigneeGSTIN.message}</p>
            )}
          </div>
        </div>

        {/* Address Row */}
        <div>
          <Label htmlFor="consigneeAddress">Address *</Label>
          <Textarea {...register("consigneeAddress")} id="consigneeAddress" rows={2} />
          {errors.consigneeAddress && (
            <p className="text-sm text-destructive mt-1">{errors.consigneeAddress.message}</p>
          )}
        </div>

        {/* State & State Code Row */}
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
            {errors.consigneeState && (
              <p className="text-sm text-destructive mt-1">{errors.consigneeState.message}</p>
            )}
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
            {errors.consigneeStateCode && (
              <p className="text-sm text-destructive mt-1">{errors.consigneeStateCode.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
