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
    // Show both pages for printing (matching VBA behavior)
    const duplicatePage = document.querySelector('.invoice-container:last-child') as HTMLElement;
    if (duplicatePage) {
      duplicatePage.style.display = 'block';
    }
    
    // Add print-specific styling
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        
        /* VBA Page Setup: A4 Portrait, 0.15" margins, fit to 1 page each */
        @page {
          size: A4 portrait;
          margin: 0.15in;
          -webkit-print-color-adjust: exact;
        }
        
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        /* Two separate pages like VBA PDF export */
        .invoice-container {
          width: 210mm;
          height: 297mm;
          page-break-after: always;
          page-break-inside: avoid;
          transform: scale(0.98);
          transform-origin: top left;
          margin: 0;
          padding: 0;
        }
        
        .invoice-container:last-child {
          page-break-after: avoid;
        }
        
        /* Ensure table fits exactly like VBA */
        table {
          width: 100%;
          font-size: 8px !important;
        }
        
        td {
          padding: 1px 2px !important;
          font-size: 8px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      window.print();
      
      // Cleanup
      document.head.removeChild(style);
      if (duplicatePage && currentPage === "original") {
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
      {/* Print Styles - Matching VBA PageSetup exactly */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page-break { page-break-after: always; }
          
          /* VBA PageSetup: A4, Portrait, 0.15" margins, fit to 1 page */
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
          
          /* Ensure invoice fits exactly like VBA FitToPagesWide=1, FitToPagesTall=1 */
          .invoice-container {
            width: 100% !important;
            height: auto !important;
            transform: scale(0.95) !important;
            transform-origin: top left !important;
            page-break-inside: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Table styling to match VBA borders exactly - Ultra compact */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            border: 2px solid black !important;
            font-size: 6px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          td {
            border: 1px solid black !important;
            padding: 0px 1px !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-size: 6px !important;
            line-height: 0.9 !important;
            margin: 0 !important;
          }
          
          tr {
            height: auto !important;
          }
        }
      `}</style>
      
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
          <h1 className="text-lg font-semibold">
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
          className="bg-white shadow-lg mx-auto border-2 border-black invoice-container mb-8"
          style={{ 
            width: "210mm", 
            minHeight: "297mm",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            pageBreakAfter: currentPage === "original" ? "always" : "auto"
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

        {/* Duplicate Page - Always show for PDF */}
        <div 
          className="bg-white shadow-lg mx-auto border-2 border-black invoice-container print-page-break"
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

interface VBAInvoiceTableProps {
  invoiceData: InvoiceData;
  pageType: "ORIGINAL" | "DUPLICATE";
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalTax: number;
  grandTotal: number;
  amountInWords: string;
}

const VBAInvoiceTable = ({ invoiceData, pageType, totalTaxableValue, totalCGST, totalSGST, totalIGST, totalTax, grandTotal, amountInWords }: VBAInvoiceTableProps) => {
  // VBA Color Scheme - Exact RGB values from VBA modules
  const colors = {
    headerBg: '#2F5061',        // RGB(47,80,97) - Main headers
    headerText: '#FFFFFF',       // White text
    companyInfoBg: '#F5F5F5',   // Light gray for company info
    taxInvoiceBg: '#F0F0F0',    // Tax invoice header
    fieldLabelBg: '#F5F5F5',    // Field labels
    itemHeaderBg: '#E6E6E6',    // Item table headers
    itemRowBg: '#FAFAFA',       // Item rows
    totalRowBg: '#EAEAEA',      // Total row
    amountInWordsBg: '#FFFF00', // Yellow for amount in words
    amountInWordsContentBg: '#FFFFE6', // Light yellow content
    taxSummaryLabelBg: '#F5F5F5',      // Tax summary labels
    taxSummaryValueBg: '#D8DEEA',      // Tax summary values
    totalAfterTaxBg: '#FFD700',        // Gold for final total
    signatureLabelBg: '#D3D3D3',       // Signature labels
    termsHeaderBg: '#FFFF00',          // Terms header
    termsContentBg: '#FFFFF5'          // Terms content
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: '8px' }}>
      {/* Exact VBA A1:O40 Table Structure - Ultra Compact */}
      <table 
        className="invoice-table w-full border-collapse"
        style={{ 
          border: '2px solid black',
          tableLayout: 'fixed',
          fontSize: '8px'
        }}
      >
        <tbody>
          {/* Row 1: ORIGINAL/DUPLICATE Header */}
          <tr style={{ height: '15px' }}>
            <td colSpan={15} style={{ backgroundColor: colors.headerBg, color: colors.headerText, textAlign: 'center', fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '1px' }}>
              {pageType}
            </td>
          </tr>

          {/* Row 2: Company Name */}
          <tr style={{ height: '25px' }}>
            <td colSpan={15} style={{ backgroundColor: colors.headerBg, color: colors.headerText, textAlign: 'center', fontWeight: 'bold', fontSize: '20px', border: '1px solid black', padding: '2px' }}>
              {invoiceData.companyName}
            </td>
          </tr>

          {/* Row 3: Address */}
          <tr style={{ height: '15px' }}>
            <td colSpan={15} style={{ backgroundColor: colors.companyInfoBg, textAlign: 'center', fontSize: '8px', border: '1px solid black', padding: '1px' }}>
              {invoiceData.companyAddress}
            </td>
          </tr>

          {/* Row 4: GSTIN */}
          <tr style={{ height: '15px' }}>
            <td colSpan={15} style={{ backgroundColor: colors.companyInfoBg, textAlign: 'center', fontSize: '8px', border: '1px solid black', padding: '1px' }}>
              GSTIN: {invoiceData.companyGSTIN}
            </td>
          </tr>

          {/* Row 5: Email */}
          <tr style={{ height: '15px' }}>
            <td colSpan={15} style={{ backgroundColor: colors.companyInfoBg, textAlign: 'center', fontSize: '8px', border: '1px solid black', padding: '1px' }}>
              Email: {invoiceData.companyEmail}
            </td>
          </tr>

          {/* Row 6: TAX-INVOICE */}
          <tr style={{ height: '20px' }}>
            <td colSpan={10} style={{ backgroundColor: colors.taxInvoiceBg, textAlign: 'center', fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '1px' }}>
              TAX-INVOICE
            </td>
            <td colSpan={5} style={{ backgroundColor: colors.taxInvoiceBg, textAlign: 'center', fontSize: '6px', border: '1px solid black', padding: '1px' }}>
              Original for Recipient<br/>Duplicate for Supplier/Transporter
            </td>
          </tr>

          {/* Rows 7-10: Invoice Details - Ultra Compact */}
          <tr style={{ height: '12px' }}>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>Invoice No.</td>
            <td style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>{invoiceData.invoiceNumber}</td>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>Transport Mode</td>
            <td colSpan={2} style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>By Lorry</td>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>Way Bill No.</td>
            <td colSpan={6} style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>{invoiceData.eWayBillNumber}</td>
          </tr>
          <tr style={{ height: '12px' }}>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>Invoice Date</td>
            <td style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>{invoiceData.invoiceDate}</td>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>Vehicle Number</td>
            <td colSpan={2} style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>{invoiceData.vehicleNumber}</td>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>Date of Supply</td>
            <td colSpan={6} style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>{invoiceData.dateOfSupply}</td>
          </tr>
          <tr style={{ height: '12px' }}>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>State</td>
            <td style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>Andhra Pradesh</td>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>State Code</td>
            <td colSpan={2} style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>37</td>
            <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '7px', border: '1px solid black', padding: '1px' }}>Place of Supply</td>
            <td colSpan={6} style={{ fontSize: '7px', border: '1px solid black', padding: '1px' }}>{invoiceData.placeOfSupply}</td>
          </tr>

          {/* Row 2: A2:O2 - Company Name - Compact */}
          <tr style={{ height: '40px' }}>
            <td 
              colSpan={15}
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '24px',
                border: '1px solid black',
                padding: '4px',
                verticalAlign: 'middle'
              }}
            >
              {invoiceData.companyName}
            </td>
          </tr>

          {/* Row 3: A3:O3 - Company Address - Compact */}
          <tr style={{ height: '25px' }}>
            <td 
              colSpan={15}
              style={{
                backgroundColor: colors.companyInfoBg,
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '1px solid black',
                padding: '2px',
                verticalAlign: 'middle'
              }}
            >
              {invoiceData.companyAddress}
            </td>
          </tr>

          {/* Row 4: A4:O4 - GSTIN - Compact */}
          <tr style={{ height: '25px' }}>
            <td 
              colSpan={15}
              style={{
                backgroundColor: colors.companyInfoBg,
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '1px solid black',
                padding: '2px',
                verticalAlign: 'middle'
              }}
            >
              GSTIN: {invoiceData.companyGSTIN}
            </td>
          </tr>

          {/* Row 5: A5:O5 - Email - Compact */}
          <tr style={{ height: '25px' }}>
            <td 
              colSpan={15}
              style={{
                backgroundColor: colors.companyInfoBg,
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '1px solid black',
                padding: '2px',
                verticalAlign: 'middle'
              }}
            >
              Email: {invoiceData.companyEmail}
            </td>
          </tr>

          {/* Row 6: TAX-INVOICE Header Split - Compact */}
          <tr style={{ height: '35px' }}>
            <td 
              colSpan={10}
              style={{
                backgroundColor: colors.taxInvoiceBg,
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '1px solid black',
                padding: '4px',
                verticalAlign: 'middle'
              }}
            >
              TAX-INVOICE
            </td>
            <td 
              colSpan={5}
              style={{
                backgroundColor: '#FAFAFA',
                textAlign: 'center',
                fontSize: '9px',
                fontWeight: 'bold',
                border: '1px solid black',
                padding: '2px',
                verticalAlign: 'middle',
                whiteSpace: 'pre-line'
              }}
            >
              Original for Recipient{'\n'}Duplicate for Supplier/Transporter{'\n'}Triplicate for Supplier
            </td>
          </tr>

          {/* Rows 7-10: Invoice Details Grid */}
          <VBAInvoiceDetailsRows invoiceData={invoiceData} colors={colors} />

          {/* Rows 11-16: Party Details */}
          <VBAPartyDetailsRows invoiceData={invoiceData} colors={colors} />

          {/* Rows 17-18: Item Table Headers */}
          <VBAItemTableHeaders invoiceData={invoiceData} colors={colors} />

          {/* Rows 19-24: Item Data */}
          <VBAItemDataRows invoiceData={invoiceData} colors={colors} />

          {/* Row 25: Totals Row */}
          <VBATotalsRow invoiceData={invoiceData} colors={colors} totalTaxableValue={totalTaxableValue} totalCGST={totalCGST} totalSGST={totalSGST} totalIGST={totalIGST} grandTotal={grandTotal} />

          {/* Rows 26-33: Amount in Words & Tax Summary */}
          <VBAAmountWordsAndTaxSummary invoiceData={invoiceData} colors={colors} amountInWords={amountInWords} totalTaxableValue={totalTaxableValue} totalCGST={totalCGST} totalSGST={totalSGST} totalIGST={totalIGST} totalTax={totalTax} grandTotal={grandTotal} />

          {/* Rows 34-40: Signature Section */}
          <VBASignatureSection invoiceData={invoiceData} colors={colors} />
        </tbody>
      </table>
    </div>
  );
};

// Helper components for complex row structures
const VBAInvoiceDetailsRows = ({ invoiceData, colors }: { invoiceData: InvoiceData, colors: any }) => (
  <>
    {/* Row 7: Invoice No, Transport Mode, Challan No, Sale Type - Compact */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>Invoice No.</td>
      <td style={{ border: '1px solid black', padding: '2px', color: '#DC143C', fontWeight: 'bold', textAlign: 'center', fontSize: '10px' }}>{invoiceData.invoiceNumber}</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>Transport Mode</td>
      <td colSpan={2} style={{ border: '1px solid black', padding: '2px', fontSize: '9px' }}>By Lorry</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px' }}>Challan No.</td>
      <td colSpan={1} style={{ border: '1px solid black', padding: '2px' }}></td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>Sale Type</td>
      <td colSpan={2} style={{ border: '1px solid black', padding: '2px', color: '#DC143C', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>{invoiceData.saleType}</td>
    </tr>
    {/* Row 8: Invoice Date, Vehicle Number, etc. */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>Invoice Date</td>
      <td style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.invoiceDate}</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>Vehicle Number</td>
      <td colSpan={2} style={{ border: '1px solid black', padding: '2px', fontSize: '9px' }}></td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px' }}>Transporter Name</td>
      <td colSpan={1} style={{ border: '1px solid black', padding: '2px', fontSize: '9px' }}>NARENDRA</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>Invoice Type</td>
      <td colSpan={2} style={{ border: '1px solid black', padding: '2px', fontSize: '10px', textAlign: 'center' }}>Tax Invoice</td>
    </tr>
    {/* Row 9: State, Date of Supply */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>State</td>
      <td style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>Andhra Pradesh</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>Date of Supply</td>
      <td colSpan={2} style={{ border: '1px solid black', padding: '2px', fontSize: '9px' }}></td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px' }}>L.R Number</td>
      <td colSpan={1} style={{ border: '1px solid black', padding: '2px' }}></td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>Reverse Charge</td>
      <td colSpan={2} style={{ border: '1px solid black', padding: '2px', fontSize: '10px', textAlign: 'center' }}>No</td>
    </tr>
    {/* Row 10: State Code, Place of Supply */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>State Code</td>
      <td style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>37</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>Place of Supply</td>
      <td colSpan={2} style={{ border: '1px solid black', padding: '2px', fontSize: '9px' }}></td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px' }}>P.O Number</td>
      <td colSpan={1} style={{ border: '1px solid black', padding: '2px' }}></td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>E-Way Bill No.</td>
      <td colSpan={2} style={{ border: '1px solid black', padding: '2px', fontSize: '10px', textAlign: 'center', color: '#666' }}>Not Applicable</td>
    </tr>
  </>
);

const VBAPartyDetailsRows = ({ invoiceData, colors }: { invoiceData: InvoiceData, colors: any }) => (
  <>
    {/* Row 11: Party Headers - Compact */}
    <tr style={{ height: '30px' }}>
      <td colSpan={8} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '14px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>
        Details of Receiver (Billed to)
      </td>
      <td colSpan={7} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '14px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>
        Details of Consignee (Shipped to)
      </td>
    </tr>
    {/* Row 12: Names */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>Name:</td>
      <td colSpan={6} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.receiverName}</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>Name:</td>
      <td colSpan={5} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.consigneeName}</td>
    </tr>
    {/* Row 13: Addresses */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>Address:</td>
      <td colSpan={6} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.receiverAddress}</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>Address:</td>
      <td colSpan={5} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.consigneeAddress}</td>
    </tr>
    {/* Row 14: GSTIN */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>GSTIN:</td>
      <td colSpan={6} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.receiverGSTIN}</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>GSTIN:</td>
      <td colSpan={5} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.consigneeGSTIN}</td>
    </tr>
    {/* Row 15: State */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>State:</td>
      <td colSpan={6} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.receiverState}</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>State:</td>
      <td colSpan={5} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>{invoiceData.consigneeState}</td>
    </tr>
    {/* Row 16: State Code */}
    <tr style={{ height: '25px' }}>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px' }}>State Code:</td>
      <td colSpan={6} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>37</td>
      <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px' }}>State Code:</td>
      <td colSpan={5} style={{ border: '1px solid black', padding: '2px', fontSize: '10px' }}>37</td>
    </tr>
  </>
);

const VBAItemTableHeaders = ({ invoiceData, colors }: { invoiceData: InvoiceData, colors: any }) => (
  <>
    {/* Row 17: Main Headers - Compact */}
    <tr style={{ height: '25px' }}>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>Sr.No.</td>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>Description</td>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>HSN/SAC Code</td>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>Quantity</td>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>UOM</td>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>Rate</td>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>Amount</td>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>Taxable Value</td>
      <td colSpan={2} style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>
        {invoiceData.saleType === 'Interstate' ? 'IGST' : 'CGST'}
      </td>
      <td colSpan={2} style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>
        {invoiceData.saleType === 'Interstate' ? 'IGST Not Apply' : 'SGST'}
      </td>
      <td colSpan={2} style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>
        {invoiceData.saleType === 'Interstate' ? 'CGST Not Apply' : 'IGST Not Apply'}
      </td>
      <td style={{ backgroundColor: colors.itemHeaderBg, fontWeight: 'bold', fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', verticalAlign: 'middle' }}>Total Amount</td>
    </tr>
    {/* Row 18: Sub Headers - Compact */}
    <tr style={{ height: '20px' }}>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
      <td style={{ backgroundColor: '#FAFAFA', fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '2px', textAlign: 'center' }}>Rate (%)</td>
      <td style={{ backgroundColor: '#FAFAFA', fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '2px', textAlign: 'center' }}>Amount (Rs.)</td>
      <td style={{ backgroundColor: '#FAFAFA', fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '2px', textAlign: 'center' }}>Rate (%)</td>
      <td style={{ backgroundColor: '#FAFAFA', fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '2px', textAlign: 'center' }}>Amount (Rs.)</td>
      <td style={{ backgroundColor: '#FAFAFA', fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '2px', textAlign: 'center' }}>Rate (%)</td>
      <td style={{ backgroundColor: '#FAFAFA', fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '2px', textAlign: 'center' }}>Amount (Rs.)</td>
      <td style={{ backgroundColor: '#FAFAFA', border: '1px solid black' }}></td>
    </tr>
  </>
);

const VBAItemDataRows = ({ invoiceData, colors }: { invoiceData: InvoiceData, colors: any }) => (
  <>
    {invoiceData.items.map((item, index) => (
      <tr key={item.id} style={{ height: '42px' }}>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'center' }}>{index + 1}</td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px' }}>{item.description}</td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'center' }}>{item.hsnCode}</td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'center' }}>{item.quantity}</td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'center' }}>PCS</td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{item.rate.toFixed(2)}</td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{item.taxableValue.toFixed(2)}</td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{item.taxableValue.toFixed(2)}</td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
          {invoiceData.saleType === 'Interstate' ? item.igstRate : item.cgstRate}
        </td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
          {invoiceData.saleType === 'Interstate' ? item.igstAmount.toFixed(2) : item.cgstAmount.toFixed(2)}
        </td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
          {invoiceData.saleType === 'Interstate' ? '' : item.sgstRate}
        </td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
          {invoiceData.saleType === 'Interstate' ? '' : item.sgstAmount.toFixed(2)}
        </td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
          {invoiceData.saleType === 'Interstate' ? '' : (item.igstRate || '')}
        </td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
          {invoiceData.saleType === 'Interstate' ? '' : ''}
        </td>
        <td style={{ backgroundColor: colors.itemRowBg, fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{item.totalAmount.toFixed(2)}</td>
      </tr>
    ))}
    {/* Fill remaining empty rows to match VBA structure */}
    {[...Array(6 - invoiceData.items.length)].map((_, index) => (
      <tr key={`empty-${index}`} style={{ height: '38px' }}>
        <td colSpan={15} style={{ backgroundColor: index % 2 === 0 ? colors.itemRowBg : colors.itemRowAltBg, border: '1px solid black', padding: '4px' }}></td>
      </tr>
    ))}
  </>
);

const VBATotalsRow = ({ invoiceData, colors, totalTaxableValue, totalCGST, totalSGST, totalIGST, grandTotal }: { invoiceData: InvoiceData, colors: any, totalTaxableValue: number, totalCGST: number, totalSGST: number, totalIGST: number, grandTotal: number }) => (
  <tr style={{ height: '50px' }}>
    <td colSpan={3} style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', fontSize: '26px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>Total</td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'center' }}>{invoiceData.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
    <td colSpan={2} style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>Sub Total:</td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>{totalTaxableValue.toFixed(2)}</td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>{totalTaxableValue.toFixed(2)}</td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
      {invoiceData.saleType === 'Interstate' ? invoiceData.items.reduce((sum, item) => sum + item.igstRate, 0) : invoiceData.items.reduce((sum, item) => sum + item.cgstRate, 0)}
    </td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
      {invoiceData.saleType === 'Interstate' ? totalIGST.toFixed(2) : totalCGST.toFixed(2)}
    </td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
      {invoiceData.saleType === 'Interstate' ? '' : invoiceData.items.reduce((sum, item) => sum + item.sgstRate, 0)}
    </td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
      {invoiceData.saleType === 'Interstate' ? '' : totalSGST.toFixed(2)}
    </td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}></td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}></td>
    <td style={{ backgroundColor: colors.totalRowBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>{grandTotal.toFixed(2)}</td>
  </tr>
);

const VBAAmountWordsAndTaxSummary = ({ invoiceData, colors, amountInWords, totalTaxableValue, totalCGST, totalSGST, totalIGST, totalTax, grandTotal }: { invoiceData: InvoiceData, colors: any, amountInWords: string, totalTaxableValue: number, totalCGST: number, totalSGST: number, totalIGST: number, totalTax: number, grandTotal: number }) => (
  <>
    {/* Row 26: Amount in Words Header + Tax Summary Start */}
    <tr style={{ height: '32px' }}>
      <td colSpan={10} style={{ backgroundColor: colors.amountInWordsBg, fontWeight: 'bold', fontSize: '20px', border: '1px solid black', padding: '4px', textAlign: 'center' }}>
        Total Invoice Amount in Words
      </td>
      <td colSpan={4} style={{ backgroundColor: colors.taxSummaryLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '4px' }}>
        Total Amount Before Tax:
      </td>
      <td style={{ backgroundColor: colors.taxSummaryValueBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
        {totalTaxableValue.toFixed(2)}
      </td>
    </tr>
    
    {/* Rows 27-28: Amount in Words Content + Tax Breakdown */}
    <tr style={{ height: '32px' }}>
      <td colSpan={10} rowSpan={2} style={{ backgroundColor: colors.amountInWordsContentBg, fontWeight: 'bold', fontSize: '15px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
        {amountInWords}
      </td>
      <td colSpan={4} style={{ backgroundColor: colors.taxSummaryLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '4px' }}>
        CGST :
      </td>
      <td style={{ backgroundColor: colors.taxSummaryValueBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
        {totalCGST.toFixed(2)}
      </td>
    </tr>
    
    <tr style={{ height: '32px' }}>
      <td colSpan={4} style={{ backgroundColor: colors.taxSummaryLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '4px' }}>
        SGST :
      </td>
      <td style={{ backgroundColor: colors.taxSummaryValueBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
        {totalSGST.toFixed(2)}
      </td>
    </tr>

    {/* Terms and Conditions + Tax Summary Continue */}
    <tr style={{ height: '25px' }}>
      <td colSpan={10} style={{ backgroundColor: colors.termsHeaderBg, fontWeight: 'bold', fontSize: '18px', border: '1px solid black', padding: '4px', textAlign: 'center' }}>
        Terms and Conditions
      </td>
      <td colSpan={4} style={{ backgroundColor: colors.igstHighlightBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '4px' }}>
        IGST :
      </td>
      <td style={{ backgroundColor: colors.igstHighlightBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
        {totalIGST.toFixed(2)}
      </td>
    </tr>
    
    {/* Rows 30-33: Terms Content + Final Tax Summary */}
    {[
      { label: 'CESS :', value: '0.00' },
      { label: 'Total Tax:', value: totalTax.toFixed(2) }
    ].map((item, index) => (
      <tr key={index} style={{ height: '25px' }}>
        <td colSpan={10} rowSpan={index === 0 ? 4 : 1} style={{ 
          backgroundColor: colors.termsContentBg, 
          fontSize: '11px', 
          border: '1px solid black', 
          padding: '4px', 
          verticalAlign: 'top',
          ...(index === 0 ? {} : { display: 'none' })
        }}>
          {index === 0 && (
            <>
              1. This is an electronically generated invoice.<br />
              2. All disputes are subject to GUDUR jurisdiction only.<br />
              3. If the Consignee makes any Inter State Sale, he has to pay GST himself.<br />
              4. Goods once sold cannot be taken back or exchanged.<br />
              5. Payment terms as per agreement between buyer and seller.
            </>
          )}
        </td>
        <td colSpan={4} style={{ backgroundColor: colors.taxSummaryLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '4px' }}>
          {item.label}
        </td>
        <td style={{ backgroundColor: colors.taxSummaryValueBg, fontWeight: 'bold', border: '1px solid black', padding: '4px', textAlign: 'right' }}>
          {item.value}
        </td>
      </tr>
    ))}

    {/* Rows 32-33: Total Amount After Tax (2-row prominence) */}
    <tr style={{ height: '38px' }}>
      <td colSpan={4} rowSpan={2} style={{ backgroundColor: colors.totalAfterTaxBg, fontWeight: 'bold', fontSize: '16px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
        Total Amount After Tax:
      </td>
      <td rowSpan={2} style={{ backgroundColor: colors.totalAfterTaxBg, fontWeight: 'bold', fontSize: '16px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
        {grandTotal.toFixed(2)}
      </td>
    </tr>
    <tr style={{ height: '38px' }}></tr>
  </>
);

const VBASignatureSection = ({ invoiceData, colors }: { invoiceData: InvoiceData, colors: any }) => (
  <>
    {/* Row 34: Signature Headers */}
    <tr style={{ height: '55px' }}>
      <td colSpan={5} style={{ backgroundColor: colors.signatureBg, fontWeight: 'bold', fontSize: '14px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
        Transporter
      </td>
      <td colSpan={5} style={{ backgroundColor: colors.signatureBg, fontWeight: 'bold', fontSize: '14px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
        Receiver
      </td>
      <td colSpan={5} style={{ backgroundColor: colors.signatureBg, fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'pre-line' }}>
        Certified that the particulars given above are true and correct
      </td>
    </tr>

    {/* Rows 35-39: Mobile Numbers and Signature Spaces */}
    {[...Array(5)].map((_, index) => (
      <tr key={index} style={{ height: index < 2 ? '25px' : '45px' }}>
        <td colSpan={5} style={{ backgroundColor: colors.signatureSpaceBg, border: '1px solid black', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
          {index < 2 ? 'Mobile No: ___________________' : ''}
        </td>
        <td colSpan={5} style={{ backgroundColor: colors.signatureSpaceBg, border: '1px solid black', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
          {index < 2 ? 'Mobile No: ___________________' : ''}
        </td>
        <td colSpan={5} style={{ backgroundColor: colors.signatureSpaceBg, border: '1px solid black', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
          {index < 2 ? 'Mobile No: ___________________' : ''}
        </td>
      </tr>
    ))}

    {/* Row 40: Signature Labels */}
    <tr style={{ height: '25px' }}>
      <td colSpan={5} style={{ backgroundColor: colors.signatureLabelBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
        Transporter's Signature
      </td>
      <td colSpan={5} style={{ backgroundColor: colors.signatureLabelBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
        Receiver's Signature
      </td>
      <td colSpan={5} style={{ backgroundColor: colors.signatureLabelBg, fontWeight: 'bold', fontSize: '10px', border: '1px solid black', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
        Authorized Signatory
      </td>
    </tr>
  </>
);

export default InvoicePreview;
