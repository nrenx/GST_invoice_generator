import { InvoiceForm } from "@/components/InvoiceForm";
import { FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-section-bg">
      {/* Header */}
      <header className="bg-invoice-header text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-lg">
              <FileText className="h-8 w-8 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">GST Tax Invoice Generator</h1>
              <p className="text-primary-foreground/80 text-sm">Professional invoice creation system</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-background rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-invoice-header mb-2">Create New Invoice</h2>
            <p className="text-muted-foreground">
              Fill in the invoice details below. All required fields are marked with an asterisk (*). 
              After completing the form, you can preview the invoice or download it as a PDF.
            </p>
          </div>
          <InvoiceForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
