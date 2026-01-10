import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Briefcase, Store, Truck } from "lucide-react";

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: "standard" | "professional" | "composition" | "interstate") => void;
}

export const TemplateSelector = ({ open, onClose, onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Invoice Template</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow p-6 border-2 hover:border-accent"
            onClick={() => onSelectTemplate("professional")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Professional Template</h3>
              <p className="text-sm text-muted-foreground text-center">
                Pixel-perfect GST invoice with detailed tax sections and yellow highlights
              </p>
              <Button className="w-full">Select</Button>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow p-6 border-2 hover:border-accent"
            onClick={() => onSelectTemplate("standard")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-invoice-header/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-invoice-header" />
              </div>
              <h3 className="text-xl font-semibold">Standard Template</h3>
              <p className="text-sm text-muted-foreground text-center">
                Classic Excel-based layout with traditional GST invoice format
              </p>
              <Button variant="outline" className="w-full">Select</Button>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow p-6 border-2 hover:border-emerald-500"
            onClick={() => onSelectTemplate("composition")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Store className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">Composition Scheme</h3>
              <p className="text-sm text-muted-foreground text-center">
                Bill of Supply for GST Composition Dealers - No tax collection on supplies
              </p>
              <div className="w-full space-y-1">
                <Button variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50">Select</Button>
                <p className="text-xs text-emerald-600 text-center font-medium">For Small Businesses</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow p-6 border-2 hover:border-slate-600"
            onClick={() => onSelectTemplate("interstate")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-slate-700/10 flex items-center justify-center">
                <Truck className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="text-xl font-semibold">Interstate Supply</h3>
              <p className="text-sm text-muted-foreground text-center">
                Tax Invoice for Interstate Transport with IGST, E-Way Bill & Vehicle Details
              </p>
              <div className="w-full space-y-1">
                <Button variant="outline" className="w-full border-slate-600 text-slate-700 hover:bg-slate-50">Select</Button>
                <p className="text-xs text-slate-600 text-center font-medium">Cross-State Sales</p>
              </div>
            </div>
          </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
};
