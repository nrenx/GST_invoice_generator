import { useLocation, useNavigate } from "react-router-dom";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TemplateSelector } from "@/components/TemplateSelector";
import { loadTemplate, injectDataIntoTemplate, TemplateType } from "@/lib/templateLoader";
import { generateAndDownloadPDF } from "@/lib/pdfGenerator";

const InvoicePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<"original" | "duplicate">("original");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("standard");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [originalHTML, setOriginalHTML] = useState<string>("");
  const [duplicateHTML, setDuplicateHTML] = useState<string>("");
  const invoiceData = location.state as InvoiceData;

  if (!invoiceData) {
    navigate("/");
    return null;
  }

  // Load and inject data into templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateHTML = await loadTemplate(selectedTemplate);
        const originalRendered = injectDataIntoTemplate(templateHTML, invoiceData, "ORIGINAL");
        const duplicateRendered = injectDataIntoTemplate(templateHTML, invoiceData, "DUPLICATE");
        setOriginalHTML(originalRendered);
        setDuplicateHTML(duplicateRendered);
      } catch (error) {
        console.error("Failed to load template:", error);
        toast.error("Failed to load invoice template");
      }
    };
    loadTemplates();
  }, [selectedTemplate, invoiceData]);

  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) {
      return;
    }

    setIsGeneratingPdf(true);

    try {
      // Combine both pages for PDF
      const combinedHTML = `
        ${originalHTML}
        <div style="page-break-before: always;"></div>
        ${duplicateHTML}
      `;

      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const companyName = invoiceData.companyName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Invoice_${date}_${companyName}.pdf`;

      await generateAndDownloadPDF({
        filename,
        html: combinedHTML
      });

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleNewInvoice = () => {
    localStorage.removeItem('invoice-form-data');
    navigate("/");
    toast.success("Starting new invoice - form cleared");
  };

  const togglePage = () => {
    setCurrentPage(currentPage === "original" ? "duplicate" : "original");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Action Bar */}
      <div className="no-print sticky top-0 z-10 bg-white border-b-2 border-black shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2 border-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
            <Button variant="secondary" onClick={handleNewInvoice} className="gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
            <Button variant="outline" onClick={togglePage} className="gap-2">
              View {currentPage === "original" ? "Duplicate" : "Original"}
            </Button>
            <Button variant="outline" onClick={() => setShowTemplateSelector(true)} className="gap-2">
              Change Template
            </Button>
          </div>
          <h1 className="text-xl font-bold text-center flex-1">
            Invoice Preview - {currentPage.toUpperCase()}
          </h1>
          <Button onClick={handleDownloadPDF} className="gap-2" disabled={isGeneratingPdf} aria-busy={isGeneratingPdf}>
            <Download className="h-4 w-4" />
            {isGeneratingPdf ? "Preparing PDF" : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Invoice Preview - A4 centered display */}
      <div className="flex flex-col items-center gap-8 px-4 py-6 lg:px-8 bg-gray-100 min-h-screen">
        {/* Original Page */}
        <div 
          data-page="original"
          className="bg-white shadow-2xl mx-auto"
          style={{
            width: "100%",
            maxWidth: "210mm",
            display: currentPage === "original" ? "block" : "none"
          }}
          dangerouslySetInnerHTML={{ __html: originalHTML }}
        />

        {/* Duplicate Page */}
        <div 
          data-page="duplicate"
          className="bg-white shadow-2xl mx-auto"
          style={{
            width: "100%",
            maxWidth: "210mm",
            display: currentPage === "duplicate" ? "block" : "none"
          }}
          dangerouslySetInnerHTML={{ __html: duplicateHTML }}
        />
      </div>

      <TemplateSelector
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={(template) => {
          setSelectedTemplate(template);
          setShowTemplateSelector(false);
          toast.success(`Switched to ${template} template`);
        }}
      />
    </div>
  );
};

export default InvoicePreview;