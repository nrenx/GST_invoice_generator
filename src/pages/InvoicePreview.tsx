import { useLocation, useNavigate } from "react-router-dom";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { CompactVBATable } from "@/components/CompactVBATable";

const InvoicePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<"original" | "duplicate">("original");
  const invoiceData = location.state as InvoiceData;

  if (!invoiceData) {
    navigate("/");
    return null;
  }

  const handleDownloadPDF = () => {
    // Force both pages to be visible for printing (like VBA exports both Original and Duplicate)
    const originalPage = document.querySelector('[data-page="original"]') as HTMLElement;
    const duplicatePage = document.querySelector('[data-page="duplicate"]') as HTMLElement;
    
    // Show both pages for PDF
    if (originalPage) originalPage.style.display = 'block';
    if (duplicatePage) duplicatePage.style.display = 'block';

    // Apply print styles that match VBA page setup exactly
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .no-print { 
          display: none !important; 
        }
        
        @page {
          size: A4 portrait;
          margin: 0.15in;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        body { 
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          margin: 0;
          padding: 0;
        }
        
        /* Show both pages for PDF - Each page gets its own sheet */
        .invoice-container {
          width: 100% !important;
          height: auto !important;
          transform: scale(0.8) !important;
          transform-origin: top center !important;
          page-break-inside: avoid !important;
          page-break-after: always !important;
          margin: 0 auto !important;
          padding: 0 !important;
          display: block !important; /* Force both pages visible */
        }
        
        /* Remove the last page break to avoid blank page */
        .invoice-container:last-child {
          page-break-after: avoid !important;
        }
        
        table {
          border-collapse: collapse !important;
          width: 100% !important;
          border: 2px solid black !important;
          font-size: 9px !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        
        td {
          border: 1px solid black !important;
          padding: 1px 2px !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-size: 9px !important;
          line-height: 1.0 !important;
          margin: 0 !important;
        }
        
        tr {
          height: auto !important;
          margin: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      window.print();
      
      // Cleanup - restore original visibility state
      document.head.removeChild(style);
      if (originalPage && currentPage !== "original") {
        originalPage.style.display = 'none';
      }
      if (duplicatePage && currentPage !== "duplicate") {
        duplicatePage.style.display = 'none';
      }
    }, 100);
  };

  const handleNewInvoice = () => {
    localStorage.removeItem('invoice-form-data');
    navigate("/");
    toast.success("Starting new invoice - form cleared");
  };

  const togglePage = () => {
    setCurrentPage(currentPage === "original" ? "duplicate" : "original");
  };

  // Calculate totals
  const totalTaxableValue = invoiceData.items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCGST = invoiceData.items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSGST = invoiceData.items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIGST = invoiceData.items.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = totalCGST + totalSGST + totalIGST;
  const grandTotal = totalTaxableValue + totalTax;

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const amountInWords = numberToWords(Math.floor(grandTotal)) + ' Rupees Only';

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
          </div>
          <h1 className="text-xl font-bold text-center flex-1">
            Invoice Preview - {currentPage.toUpperCase()}
          </h1>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Content - Two pages for PDF like VBA */}
      <div className="container mx-auto px-4 py-8">
        {/* Original Page */}
        <div 
          data-page="original"
          className="bg-white shadow-lg mx-auto border-2 border-black invoice-container mb-8"
          style={{ 
            width: "210mm", 
            minHeight: "297mm",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            display: currentPage === "original" ? "block" : "none"
          }}
        >
          <CompactVBATable 
            invoiceData={invoiceData} 
            pageType="ORIGINAL"
            totalTaxableValue={totalTaxableValue}
            totalCGST={totalCGST}
            totalSGST={totalSGST}
            totalIGST={totalIGST}
            totalTax={totalTax}
            grandTotal={grandTotal}
            amountInWords={amountInWords}
          />
        </div>

        {/* Duplicate Page */}
        <div 
          data-page="duplicate"
          className="bg-white shadow-lg mx-auto border-2 border-black invoice-container"
          style={{ 
            width: "210mm", 
            minHeight: "297mm",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            display: currentPage === "duplicate" ? "block" : "none"
          }}
        >
          <CompactVBATable 
            invoiceData={invoiceData} 
            pageType="DUPLICATE"
            totalTaxableValue={totalTaxableValue}
            totalCGST={totalCGST}
            totalSGST={totalSGST}
            totalIGST={totalIGST}
            totalTax={totalTax}
            grandTotal={grandTotal}
            amountInWords={amountInWords}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;