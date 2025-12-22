/**
 * TransportDetailsSection
 * Logistics and shipping information
 * Shows: Transport Mode, Vehicle Number, Transporter Name, Challan Number, LR Number, Place of Supply, PO Number, E-Way Bill
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { transportModes } from "@/data/hsnCodes";
import { InvoiceFormContextType } from "../types";

interface TransportDetailsSectionProps {
  register: InvoiceFormContextType["register"];
  setValue: InvoiceFormContextType["setValue"];
  transportModeValue: string;
}

export const TransportDetailsSection = ({
  register,
  setValue,
  transportModeValue,
}: TransportDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-invoice-header">Transport Details</CardTitle>
        <CardDescription>Logistics and shipping information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transport Mode, Vehicle Number, Transporter Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="transportMode">Transport Mode</Label>
            <Select
              value={transportModeValue || transportModes[0]}
              onValueChange={(value) =>
                setValue("transportMode", value, { shouldDirty: true, shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transportModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
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

        {/* Challan, LR, Place of Supply, PO Number Row */}
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

        {/* E-Way Bill Row */}
        <div>
          <Label htmlFor="eWayBillNumber">E-Way Bill Number</Label>
          <Input {...register("eWayBillNumber")} id="eWayBillNumber" placeholder="Not Applicable" />
        </div>
      </CardContent>
    </Card>
  );
};
