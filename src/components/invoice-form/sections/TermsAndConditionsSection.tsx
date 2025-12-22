/**
 * TermsAndConditionsSection
 * Invoice terms and legal notices
 */

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceFormContextType } from "../types";

interface TermsAndConditionsSectionProps {
  register: InvoiceFormContextType["register"];
}

export const TermsAndConditionsSection = ({ register }: TermsAndConditionsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-invoice-header">Terms and Conditions</CardTitle>
        <CardDescription>Invoice terms and legal notices</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea {...register("termsAndConditions")} rows={6} />
      </CardContent>
    </Card>
  );
};
