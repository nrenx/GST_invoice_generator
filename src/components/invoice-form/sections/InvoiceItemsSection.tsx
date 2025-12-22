/**
 * InvoiceItemsSection
 * Products or services being invoiced with HSN codes, quantities, rates, and calculated taxes
 * Shows: HSN Code, Description, UOM, Quantity, Rate, Tax Rates & Amounts, Totals
 */

import { UseFieldArrayReturn, Controller, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoCompleteInput } from "@/components/ui/auto-complete-input";
import { Plus, Trash2 } from "lucide-react";
import { hsnCodeMap, normalizeHsnCode } from "@/data/hsnCodes";
import { InvoiceItem } from "@/types/invoice";
import {
  HSN_CODE_OPTIONS,
  DESCRIPTION_SUGGESTIONS,
  UOM_SUGGESTIONS,
  COMPUTED_INPUT_CLASSES,
  COMPUTED_TOTAL_INPUT_CLASSES,
} from "../constants";
import { InvoiceFormData, InvoiceFormContextType, ItemFormValue } from "../types";
import { currencyFormatter, formatPercent, buildDefaultItem } from "../utils";

interface InvoiceItemsSectionProps {
  register: InvoiceFormContextType["register"];
  control: Control<InvoiceFormData>;
  errors: InvoiceFormContextType["errors"];
  setValue: InvoiceFormContextType["setValue"];
  fields: UseFieldArrayReturn<InvoiceFormData, "items">["fields"];
  append: UseFieldArrayReturn<InvoiceFormData, "items">["append"];
  remove: UseFieldArrayReturn<InvoiceFormData, "items">["remove"];
  itemsForCalculation: ItemFormValue[];
  derivedItems: InvoiceItem[];
}

export const InvoiceItemsSection = ({
  register,
  control,
  errors,
  setValue,
  fields,
  append,
  remove,
  itemsForCalculation,
  derivedItems,
}: InvoiceItemsSectionProps) => {
  return (
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
            <div
              key={field.id}
              className="border border-border rounded-lg p-4 space-y-4 bg-section-bg"
            >
              {/* Item Header */}
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Item {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* HSN Code & Description */}
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
                          if (!typed) return;
                          const match = hsnCodeMap.get(typed);
                          if (match) {
                            setValue(`items.${index}.hsnCode`, match.code, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
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
                          if (!match) return;
                          setValue(`items.${index}.hsnCode`, match.code, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
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
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.hsnCode?.message}
                    </p>
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
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>

                {/* UOM */}
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
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.uom?.message}
                    </p>
                  )}
                </div>

                {/* Quantity */}
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
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                {/* Rate */}
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
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.rate?.message}
                    </p>
                  )}
                </div>

                {/* Compensation Cess */}
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
                    <p className="text-sm text-destructive mt-1">
                      {errors.items[index]?.cessRate?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Tax Rates Row */}
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

              {/* Tax Amounts Row */}
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

              {/* Totals Row */}
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
                  <Input
                    value={totalAmountLabel}
                    readOnly
                    className={COMPUTED_TOTAL_INPUT_CLASSES}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Item Button */}
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
  );
};
