/**
 * FormActionButtons
 * Sticky action bar with New Invoice (clear) and Preview buttons
 */

import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";

interface FormActionButtonsProps {
  onClearForm: () => void;
  onPreview: () => void;
}

export const FormActionButtons = ({ onClearForm, onPreview }: FormActionButtonsProps) => {
  return (
    <div className="flex gap-4 justify-between sticky bottom-0 bg-background border-t border-border p-4 shadow-lg">
      <Button
        type="button"
        variant="destructive"
        size="lg"
        onClick={onClearForm}
        className="gap-2"
      >
        <Plus className="h-5 w-5" />
        New Invoice
      </Button>
      <div className="flex gap-4">
        <Button type="button" variant="outline" size="lg" onClick={onPreview} className="gap-2">
          <Eye className="h-5 w-5" />
          Preview Invoice
        </Button>
      </div>
    </div>
  );
};
