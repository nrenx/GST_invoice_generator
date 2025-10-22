import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Sparkles, Briefcase } from "lucide-react";

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: "standard" | "modern" | "professional") => void;
}

export const TemplateSelector = ({ open, onClose, onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Invoice Template</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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
            className="cursor-pointer hover:shadow-lg transition-shadow p-6 border-2 hover:border-accent"
            onClick={() => onSelectTemplate("modern")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Modern Template</h3>
              <p className="text-sm text-muted-foreground text-center">
                Clean, contemporary design with enhanced visual appeal
              </p>
              <Button variant="secondary" className="w-full">Select</Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
