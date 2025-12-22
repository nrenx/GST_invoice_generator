/**
 * ReceiverDetailsSection
 * Customer billing information (Billed to)
 * Shows: Receiver Name, GSTIN, Address, State, State Code
 */

import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoCompleteInput } from "@/components/ui/auto-complete-input";
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

interface ReceiverDetailsSectionProps {
  register: InvoiceFormContextType["register"];
  control: InvoiceFormContextType["control"];
  errors: InvoiceFormContextType["errors"];
  setValue: InvoiceFormContextType["setValue"];
}

export const ReceiverDetailsSection = ({
  register,
  control,
  errors,
  setValue,
}: ReceiverDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-invoice-header">Receiver Details (Billed to)</CardTitle>
        <CardDescription>Customer billing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name & GSTIN Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="receiverName">Name *</Label>
            <Input {...register("receiverName")} id="receiverName" />
            {errors.receiverName && (
              <p className="text-sm text-destructive mt-1">{errors.receiverName.message}</p>
            )}
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
            {errors.receiverGSTIN && (
              <p className="text-sm text-destructive mt-1">{errors.receiverGSTIN.message}</p>
            )}
          </div>
        </div>

        {/* Address Row */}
        <div>
          <Label htmlFor="receiverAddress">Address *</Label>
          <Textarea {...register("receiverAddress")} id="receiverAddress" rows={2} />
          {errors.receiverAddress && (
            <p className="text-sm text-destructive mt-1">{errors.receiverAddress.message}</p>
          )}
        </div>

        {/* State & State Code Row */}
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
            {errors.receiverState && (
              <p className="text-sm text-destructive mt-1">{errors.receiverState.message}</p>
            )}
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
            {errors.receiverStateCode && (
              <p className="text-sm text-destructive mt-1">{errors.receiverStateCode.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
