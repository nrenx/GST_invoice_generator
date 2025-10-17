import { useLocation, useNavigate } from "react-router-dom";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useRef } from "react";

const InvoicePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoiceData = location.state as InvoiceData;

  if (!invoiceData) {
    navigate("/");
    return null;
  }

  const handleDownloadPDF = () => {
    window.print();
  };

  const totalTaxableValue = invoiceData.items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCGST = invoiceData.items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSGST = invoiceData.items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIGST = invoiceData.items.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = totalCGST + totalSGST + totalIGST;
  const grandTotal = totalTaxableValue + totalTax;

  const numberToWords = (num: number): string => {
    // Simple implementation - you can expand this
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    if (num === 0) return "Zero";
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + " " + units[num % 10];
    if (num < 1000) return units[Math.floor(num / 100)] + " Hundred " + numberToWords(num % 100);
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand " + numberToWords(num % 1000);
    return "Amount exceeds conversion limit";
  };

  const amountInWords = numberToWords(Math.floor(grandTotal)) + " Rupees Only";

  return (
    <div className="min-h-screen bg-section-bg">
      {/* Action Bar - Hidden in Print */}
      <div className="no-print sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
          <h1 className="text-lg font-semibold">Invoice Preview</h1>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="container mx-auto px-4 py-8">
        <div ref={invoiceRef} className="bg-background shadow-lg mx-auto" style={{ maxWidth: "210mm" }}>
          {/* Original Invoice */}
          <div className="p-8 page-break">
            {/* Header */}
            <div className="border-2 border-foreground p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xl font-bold text-accent">ORIGINAL</div>
              </div>
              <div className="text-center mb-2">
                <h1 className="text-2xl font-bold text-invoice-header mb-1">{invoiceData.companyName}</h1>
                <p className="text-sm">{invoiceData.companyAddress}</p>
                <p className="text-sm">GSTIN: {invoiceData.companyGSTIN}</p>
                <p className="text-sm">Email: {invoiceData.companyEmail}</p>
              </div>
              <div className="text-center border-t-2 border-b-2 border-foreground py-2 my-2">
                <h2 className="text-xl font-bold">TAX-INVOICE</h2>
              </div>
              <div className="text-xs flex justify-around">
                <span>Original for Recipient</span>
                <span>Duplicate for Supplier/Transporter</span>
                <span>Triplicate for Supplier</span>
              </div>
            </div>

            {/* Invoice Details Grid */}
            <div className="border-2 border-foreground mb-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="border border-foreground p-2 font-semibold w-1/6">Invoice No.</td>
                    <td className="border border-foreground p-2 w-1/6">{invoiceData.invoiceNumber}</td>
                    <td className="border border-foreground p-2 font-semibold w-1/6">Transport Mode</td>
                    <td className="border border-foreground p-2 w-1/6">{invoiceData.transportMode}</td>
                    <td className="border border-foreground p-2 font-semibold w-1/6">Challan No.</td>
                    <td className="border border-foreground p-2 w-1/6">{invoiceData.challanNumber}</td>
                  </tr>
                  <tr>
                    <td className="border border-foreground p-2 font-semibold">Invoice Date</td>
                    <td className="border border-foreground p-2">{invoiceData.invoiceDate}</td>
                    <td className="border border-foreground p-2 font-semibold">Vehicle Number</td>
                    <td className="border border-foreground p-2">{invoiceData.vehicleNumber}</td>
                    <td className="border border-foreground p-2 font-semibold">Transporter Name</td>
                    <td className="border border-foreground p-2">{invoiceData.transporterName}</td>
                  </tr>
                  <tr>
                    <td className="border border-foreground p-2 font-semibold">State</td>
                    <td className="border border-foreground p-2">{invoiceData.companyState}</td>
                    <td className="border border-foreground p-2 font-semibold">Date of Supply</td>
                    <td className="border border-foreground p-2">{invoiceData.dateOfSupply}</td>
                    <td className="border border-foreground p-2 font-semibold">L.R Number</td>
                    <td className="border border-foreground p-2">{invoiceData.lrNumber}</td>
                  </tr>
                  <tr>
                    <td className="border border-foreground p-2 font-semibold">State Code</td>
                    <td className="border border-foreground p-2">{invoiceData.companyStateCode}</td>
                    <td className="border border-foreground p-2 font-semibold">Place of Supply</td>
                    <td className="border border-foreground p-2">{invoiceData.placeOfSupply}</td>
                    <td className="border border-foreground p-2 font-semibold">P.O Number</td>
                    <td className="border border-foreground p-2">{invoiceData.poNumber}</td>
                  </tr>
                  <tr>
                    <td className="border border-foreground p-2 font-semibold">Sale Type</td>
                    <td className="border border-foreground p-2">{invoiceData.saleType}</td>
                    <td className="border border-foreground p-2 font-semibold">Invoice Type</td>
                    <td className="border border-foreground p-2">{invoiceData.invoiceType}</td>
                    <td className="border border-foreground p-2 font-semibold">E-Way Bill No.</td>
                    <td className="border border-foreground p-2">{invoiceData.eWayBillNumber}</td>
                  </tr>
                  <tr>
                    <td className="border border-foreground p-2 font-semibold" colSpan={2}>Reverse Charge</td>
                    <td className="border border-foreground p-2" colSpan={4}>{invoiceData.reverseCharge}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Receiver and Consignee Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border-2 border-foreground">
                <div className="bg-table-header p-2 font-bold text-sm">Details of Receiver (Billed to)</div>
                <div className="p-2 text-sm space-y-1">
                  <div><span className="font-semibold">Name:</span> {invoiceData.receiverName}</div>
                  <div><span className="font-semibold">Address:</span> {invoiceData.receiverAddress}</div>
                  <div><span className="font-semibold">GSTIN:</span> {invoiceData.receiverGSTIN}</div>
                  <div><span className="font-semibold">State:</span> {invoiceData.receiverState}</div>
                  <div><span className="font-semibold">State Code:</span> {invoiceData.receiverStateCode}</div>
                </div>
              </div>
              <div className="border-2 border-foreground">
                <div className="bg-table-header p-2 font-bold text-sm">Details of Consignee (Shipped to)</div>
                <div className="p-2 text-sm space-y-1">
                  <div><span className="font-semibold">Name:</span> {invoiceData.consigneeName}</div>
                  <div><span className="font-semibold">Address:</span> {invoiceData.consigneeAddress}</div>
                  <div><span className="font-semibold">GSTIN:</span> {invoiceData.consigneeGSTIN}</div>
                  <div><span className="font-semibold">State:</span> {invoiceData.consigneeState}</div>
                  <div><span className="font-semibold">State Code:</span> {invoiceData.consigneeStateCode}</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-2 border-foreground mb-4">
              <table className="w-full text-xs">
                <thead className="bg-table-header">
                  <tr>
                    <th className="border border-foreground p-2">Sr.</th>
                    <th className="border border-foreground p-2">Description</th>
                    <th className="border border-foreground p-2">HSN/SAC</th>
                    <th className="border border-foreground p-2">Qty</th>
                    <th className="border border-foreground p-2">UOM</th>
                    <th className="border border-foreground p-2">Rate</th>
                    <th className="border border-foreground p-2">Taxable Value</th>
                    {invoiceData.saleType === "Intrastate" ? (
                      <>
                        <th className="border border-foreground p-2">CGST %</th>
                        <th className="border border-foreground p-2">CGST Amt</th>
                        <th className="border border-foreground p-2">SGST %</th>
                        <th className="border border-foreground p-2">SGST Amt</th>
                      </>
                    ) : (
                      <>
                        <th className="border border-foreground p-2">IGST %</th>
                        <th className="border border-foreground p-2">IGST Amt</th>
                      </>
                    )}
                    <th className="border border-foreground p-2">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-foreground p-2 text-center">{index + 1}</td>
                      <td className="border border-foreground p-2">{item.description}</td>
                      <td className="border border-foreground p-2 text-center">{item.hsnCode}</td>
                      <td className="border border-foreground p-2 text-right">{item.quantity.toFixed(2)}</td>
                      <td className="border border-foreground p-2 text-center">{item.uom}</td>
                      <td className="border border-foreground p-2 text-right">{item.rate.toFixed(2)}</td>
                      <td className="border border-foreground p-2 text-right">{item.taxableValue.toFixed(2)}</td>
                      {invoiceData.saleType === "Intrastate" ? (
                        <>
                          <td className="border border-foreground p-2 text-center">{item.cgstRate.toFixed(2)}</td>
                          <td className="border border-foreground p-2 text-right">{item.cgstAmount.toFixed(2)}</td>
                          <td className="border border-foreground p-2 text-center">{item.sgstRate.toFixed(2)}</td>
                          <td className="border border-foreground p-2 text-right">{item.sgstAmount.toFixed(2)}</td>
                        </>
                      ) : (
                        <>
                          <td className="border border-foreground p-2 text-center">{item.igstRate.toFixed(2)}</td>
                          <td className="border border-foreground p-2 text-right">{item.igstAmount.toFixed(2)}</td>
                        </>
                      )}
                      <td className="border border-foreground p-2 text-right font-semibold">{item.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-table-header">
                    <td colSpan={6} className="border border-foreground p-2 text-right">Total</td>
                    <td className="border border-foreground p-2 text-right">{totalTaxableValue.toFixed(2)}</td>
                    {invoiceData.saleType === "Intrastate" ? (
                      <>
                        <td className="border border-foreground p-2"></td>
                        <td className="border border-foreground p-2 text-right">{totalCGST.toFixed(2)}</td>
                        <td className="border border-foreground p-2"></td>
                        <td className="border border-foreground p-2 text-right">{totalSGST.toFixed(2)}</td>
                      </>
                    ) : (
                      <>
                        <td className="border border-foreground p-2"></td>
                        <td className="border border-foreground p-2 text-right">{totalIGST.toFixed(2)}</td>
                      </>
                    )}
                    <td className="border border-foreground p-2 text-right">{grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Amount in Words and Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border-2 border-foreground p-2">
                <div className="font-bold text-sm mb-2">Total Invoice Amount in Words</div>
                <div className="text-sm">{amountInWords}</div>
              </div>
              <div className="border-2 border-foreground">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-foreground p-2 font-semibold">Total Amount Before Tax:</td>
                      <td className="border border-foreground p-2 text-right">{totalTaxableValue.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-foreground p-2">CGST:</td>
                      <td className="border border-foreground p-2 text-right">{totalCGST.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-foreground p-2">SGST:</td>
                      <td className="border border-foreground p-2 text-right">{totalSGST.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-foreground p-2">IGST:</td>
                      <td className="border border-foreground p-2 text-right">{totalIGST.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-foreground p-2">CESS:</td>
                      <td className="border border-foreground p-2 text-right">0.00</td>
                    </tr>
                    <tr>
                      <td className="border border-foreground p-2 font-semibold">Total Tax:</td>
                      <td className="border border-foreground p-2 text-right font-semibold">{totalTax.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-table-header">
                      <td className="border border-foreground p-2 font-bold">Total Amount After Tax:</td>
                      <td className="border border-foreground p-2 text-right font-bold">{grandTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border-2 border-foreground p-2 mb-4">
              <div className="font-bold text-sm mb-2">Terms and Conditions</div>
              <div className="text-xs whitespace-pre-line">{invoiceData.termsAndConditions}</div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-3 gap-4 border-2 border-foreground">
              <div className="border-r border-foreground p-4 text-center">
                <div className="text-sm font-semibold mb-8">Transporter</div>
                <div className="text-xs">Mobile No: ___________________</div>
                <div className="text-xs mt-4">Transporter's Signature</div>
              </div>
              <div className="border-r border-foreground p-4 text-center">
                <div className="text-sm font-semibold mb-8">Receiver</div>
                <div className="text-xs">Mobile No: ___________________</div>
                <div className="text-xs mt-4">Receiver's Signature</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-sm font-semibold mb-2">Certified that the particulars given above are true and correct</div>
                <div className="text-xs mt-8">Mobile No: ___________________</div>
                <div className="text-xs mt-4">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreview;
