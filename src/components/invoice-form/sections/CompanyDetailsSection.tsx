/**
 * CompanyDetailsSection
 * Displays company information (read-only from profile)
 * Shows: Company Name, GSTIN, Address, Email, Phone, State, State Code
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LOCKED_INPUT_CLASSES } from "../constants";
import { InvoiceFormContextType } from "../types";

interface CompanyDetailsSectionProps {
  register: InvoiceFormContextType["register"];
  errors: InvoiceFormContextType["errors"];
}

export const CompanyDetailsSection = ({ register, errors }: CompanyDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-invoice-header">Company Details</CardTitle>
        <CardDescription>Your business information for the invoice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Name & GSTIN Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              {...register("companyName")}
              id="companyName"
              readOnly
              className={LOCKED_INPUT_CLASSES}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="companyGSTIN">GSTIN *</Label>
            <Input
              {...register("companyGSTIN")}
              id="companyGSTIN"
              readOnly
              className={LOCKED_INPUT_CLASSES}
            />
            {errors.companyGSTIN && (
              <p className="text-sm text-destructive mt-1">{errors.companyGSTIN.message}</p>
            )}
          </div>
        </div>

        {/* Address Row */}
        <div>
          <Label htmlFor="companyAddress">Address *</Label>
          <Textarea
            {...register("companyAddress")}
            id="companyAddress"
            rows={2}
            readOnly
            className={LOCKED_INPUT_CLASSES}
          />
          {errors.companyAddress && (
            <p className="text-sm text-destructive mt-1">{errors.companyAddress.message}</p>
          )}
        </div>

        {/* Email, Phone, State Row */}
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
            {errors.companyEmail && (
              <p className="text-sm text-destructive mt-1">{errors.companyEmail.message}</p>
            )}
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

        {/* GSTIN & State Code Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyGSTIN2">GSTIN *</Label>
            <Input
              {...register("companyGSTIN")}
              id="companyGSTIN2"
              readOnly
              className={LOCKED_INPUT_CLASSES}
            />
            {errors.companyGSTIN && (
              <p className="text-sm text-destructive mt-1">{errors.companyGSTIN.message}</p>
            )}
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
  );
};
