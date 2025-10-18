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
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    if (num === 0) return "Zero";
    
    const convertBelow1000 = (n: number): string => {
      if (n === 0) return "";
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
      return units[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertBelow1000(n % 100) : "");
    };
    
    if (num < 1000) return convertBelow1000(num);
    if (num < 100000) return convertBelow1000(Math.floor(num / 1000)) + " Thousand " + convertBelow1000(num % 1000);
    if (num < 10000000) return convertBelow1000(Math.floor(num / 100000)) + " Lakh " + convertBelow1000(num % 100000);
    return convertBelow1000(Math.floor(num / 10000000)) + " Crore " + convertBelow1000(num % 10000000);
  };

  const amountInWords = numberToWords(Math.floor(grandTotal)).trim() + " Rupees Only";

  return (
    <div className="min-h-screen bg-white">
      {/* Action Bar - Hidden in Print */}
      <div className="no-print sticky top-0 z-10 bg-white border-b-2 border-black shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2 border-2">
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

      {/* Invoice Content - Matching Excel A1:O40 Structure */}
      <div className="container mx-auto px-4 py-8">
        <div ref={invoiceRef} className="bg-white shadow-lg mx-auto border-2 border-black" style={{ maxWidth: "210mm", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
          
          {/* Row 1: ORIGINAL Label - Excel A1:O1 */}
          <div className="bg-[#2F5061] text-white text-center py-3 border-b-2 border-black">
            <span className="text-xl font-bold">ORIGINAL</span>
          </div>

          {/* Row 2: Company Name - Excel A2:O2 */}
          <div className="bg-[#2F5061] text-white text-center border-b-2 border-black">
            <h1 className="text-4xl font-bold py-3" style={{ fontSize: "36px" }}>{invoiceData.companyName}</h1>
          </div>

          {/* Row 3: Company Address - Excel A3:O3 */}
          <div className="bg-[#F5F5F5] text-center py-3 border-b border-black">
            <p className="text-base" style={{ fontSize: "16px" }}>{invoiceData.companyAddress}</p>
          </div>

          {/* Row 4: Company GSTIN - Excel A4:O4 */}
          <div className="bg-[#F5F5F5] text-center py-3 border-b border-black">
            <p className="text-base" style={{ fontSize: "16px" }}>GSTIN: {invoiceData.companyGSTIN}</p>
          </div>

          {/* Row 5: Company Email - Excel A5:O5 */}
          <div className="bg-[#F5F5F5] text-center py-3 border-b-2 border-black">
            <p className="text-sm" style={{ fontSize: "14px" }}>Email: {invoiceData.companyEmail}</p>
          </div>

          {/* Row 6: TAX-INVOICE Header - Excel A6:O6 */}
          <div className="grid grid-cols-15 border-b-2 border-black" style={{ height: "50px" }}>
            <div className="col-span-10 bg-[#F0F0F0] text-center flex items-center justify-center border-r border-black">
              <h2 className="text-2xl font-bold">TAX-INVOICE</h2>
            </div>
            <div className="col-span-5 bg-[#FAFAFA] text-center text-xs leading-tight flex items-center justify-center px-2">
              <div>
                Original for Recipient<br/>
                Duplicate for Supplier/Transporter<br/>
                Triplicate for Supplier
              </div>
            </div>
          </div>

          {/* Rows 7-10: Invoice Metadata Grid - Excel A7:O10 */}
          <div className="bg-[#F5F5F5]">
            {/* Row 7 */}
            <div className="grid grid-cols-15 border-b border-black" style={{ height: "35px" }}>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>Invoice No.</div>
              <div className="col-span-1 px-2 flex items-center justify-center border-r border-black font-bold text-[#DC143C]">{invoiceData.invoiceNumber}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "12px" }}>Transport Mode</div>
              <div className="col-span-2 px-2 flex items-center border-r border-black">{invoiceData.transportMode}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>Challan No.</div>
              <div className="col-span-2 px-2 flex items-center border-r border-black">{invoiceData.challanNumber}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>Sale Type</div>
              <div className="col-span-2 px-2 flex items-center justify-center font-bold text-[#DC143C]" style={{ fontSize: "16px" }}>{invoiceData.saleType}</div>
            </div>

            {/* Row 8 */}
            <div className="grid grid-cols-15 border-b border-black" style={{ height: "35px" }}>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>Invoice Date</div>
              <div className="col-span-1 px-2 flex items-center border-r border-black font-bold">{invoiceData.invoiceDate}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "12px" }}>Vehicle Number</div>
              <div className="col-span-2 px-2 flex items-center border-r border-black">{invoiceData.vehicleNumber}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>Transporter Name</div>
              <div className="col-span-2 px-2 flex items-center border-r border-black">{invoiceData.transporterName}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>Invoice Type</div>
              <div className="col-span-2 px-2 flex items-center justify-center">{invoiceData.invoiceType}</div>
            </div>

            {/* Row 9 */}
            <div className="grid grid-cols-15 border-b border-black" style={{ height: "35px" }}>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>State</div>
              <div className="col-span-1 px-2 flex items-center border-r border-black text-xs">{invoiceData.companyState}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "12px" }}>Date of Supply</div>
              <div className="col-span-2 px-2 flex items-center border-r border-black">{invoiceData.dateOfSupply}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>L.R Number</div>
              <div className="col-span-2 px-2 flex items-center border-r border-black">{invoiceData.lrNumber}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "12px" }}>Reverse Charge</div>
              <div className="col-span-2 px-2 flex items-center justify-center">{invoiceData.reverseCharge}</div>
            </div>

            {/* Row 10 */}
            <div className="grid grid-cols-15 border-b-2 border-black" style={{ height: "35px" }}>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>State Code</div>
              <div className="col-span-1 px-2 flex items-center border-r border-black">{invoiceData.companyStateCode}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "12px" }}>Place of Supply</div>
              <div className="col-span-2 px-2 flex items-center border-r border-black">{invoiceData.placeOfSupply}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "14px" }}>P.O Number</div>
              <div className="col-span-2 px-2 flex items-center border-r border-black">{invoiceData.poNumber}</div>
              <div className="col-span-2 font-bold px-2 flex items-center border-r border-black" style={{ fontSize: "12px" }}>E-Way Bill No.</div>
              <div className="col-span-2 px-2 flex items-center justify-center text-gray-500">{invoiceData.eWayBillNumber}</div>
            </div>
          </div>

          {/* Row 11: Party Details Headers - Excel A11:O11 */}
          <div className="grid grid-cols-2 border-b border-black bg-[#F5F5F5]" style={{ height: "45px" }}>
            <div className="font-bold text-center flex items-center justify-center border-r-2 border-black" style={{ fontSize: "16px" }}>
              Details of Receiver (Billed to)
            </div>
            <div className="font-bold text-center flex items-center justify-center" style={{ fontSize: "16px" }}>
              Details of Consignee (Shipped to)
            </div>
          </div>

          {/* Rows 12-16: Party Details Content - Excel A12:O16 */}
          <div className="grid grid-cols-2 bg-[#F5F5F5] border-b-2 border-black">
            <div className="border-r-2 border-black">
              <div className="grid grid-cols-8 border-b border-black px-2 py-2">
                <div className="col-span-2 font-bold" style={{ fontSize: "14px" }}>Name:</div>
                <div className="col-span-6">{invoiceData.receiverName}</div>
              </div>
              <div className="grid grid-cols-8 border-b border-black px-2 py-2">
                <div className="col-span-2 font-bold" style={{ fontSize: "14px" }}>Address:</div>
                <div className="col-span-6">{invoiceData.receiverAddress}</div>
              </div>
              <div className="grid grid-cols-8 border-b border-black px-2 py-2">
                <div className="col-span-2 font-bold" style={{ fontSize: "14px" }}>GSTIN:</div>
                <div className="col-span-6">{invoiceData.receiverGSTIN}</div>
              </div>
              <div className="grid grid-cols-8 border-b border-black px-2 py-2">
                <div className="col-span-2 font-bold" style={{ fontSize: "14px" }}>State:</div>
                <div className="col-span-6">{invoiceData.receiverState}</div>
              </div>
              <div className="grid grid-cols-8 px-2 py-2">
                <div className="col-span-2 font-bold" style={{ fontSize: "14px" }}>State Code:</div>
                <div className="col-span-6">{invoiceData.receiverStateCode}</div>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-8 border-b border-black px-2 py-2">
                <div className="col-span-2 font-bold text-xs">Name:</div>
                <div className="col-span-6">{invoiceData.consigneeName}</div>
              </div>
              <div className="grid grid-cols-8 border-b border-black px-2 py-2">
                <div className="col-span-2 font-bold text-xs">Address:</div>
                <div className="col-span-6">{invoiceData.consigneeAddress}</div>
              </div>
              <div className="grid grid-cols-8 border-b border-black px-2 py-2">
                <div className="col-span-2 font-bold text-xs">GSTIN:</div>
                <div className="col-span-6">{invoiceData.consigneeGSTIN}</div>
              </div>
              <div className="grid grid-cols-8 border-b border-black px-2 py-2">
                <div className="col-span-2 font-bold text-xs">State:</div>
                <div className="col-span-6">{invoiceData.consigneeState}</div>
              </div>
              <div className="grid grid-cols-8 px-2 py-2">
                <div className="col-span-2 font-bold text-xs">State Code:</div>
                <div className="col-span-6">{invoiceData.consigneeStateCode}</div>
              </div>
            </div>
          </div>

          {/* Rows 17-18: Items Table Header (2-row structure) - Excel A17:O18 */}
          <div className="bg-[#E6E6E6]">
            <div className="grid grid-cols-15 text-xs font-bold text-center border-b border-black" style={{ height: "40px" }}>
              <div className="col-span-1 border-r border-black flex items-center justify-center" style={{ fontSize: "14px" }}>Sr.No.</div>
              <div className="col-span-2 border-r border-black flex items-center justify-center text-xs">Description</div>
              <div className="col-span-1 border-r border-black flex items-center justify-center" style={{ fontSize: "12px" }}>HSN/SAC Code</div>
              <div className="col-span-1 border-r border-black flex items-center justify-center text-xs">Quantity</div>
              <div className="col-span-1 border-r border-black flex items-center justify-center" style={{ fontSize: "14px" }}>UOM</div>
              <div className="col-span-1 border-r border-black flex items-center justify-center" style={{ fontSize: "14px" }}>Rate</div>
              <div className="col-span-1 border-r border-black flex items-center justify-center" style={{ fontSize: "12px" }}>Taxable Value</div>
              {invoiceData.saleType === "Intrastate" ? (
                <>
                  <div className="col-span-2 border-r border-black flex items-center justify-center" style={{ fontSize: "12px" }}>CGST</div>
                  <div className="col-span-2 border-r border-black flex items-center justify-center" style={{ fontSize: "12px" }}>SGST</div>
                  <div className="col-span-2 border-r border-black flex items-center justify-center text-[#DC143C]" style={{ fontSize: "12px" }}>IGST Not Apply</div>
                </>
              ) : (
                <>
                  <div className="col-span-2 border-r border-black flex items-center justify-center text-[#DC143C]" style={{ fontSize: "12px" }}>CGST Not Apply</div>
                  <div className="col-span-2 border-r border-black flex items-center justify-center text-[#DC143C]" style={{ fontSize: "12px" }}>SGST Not Apply</div>
                  <div className="col-span-2 border-r border-black flex items-center justify-center" style={{ fontSize: "12px" }}>IGST</div>
                </>
              )}
              <div className="col-span-2 flex items-center justify-center" style={{ fontSize: "12px" }}>Total Amount</div>
            </div>
            <div className="grid grid-cols-15 text-xs font-bold text-center border-b-2 border-black" style={{ height: "40px" }}>
              <div className="col-span-1 border-r border-black"></div>
              <div className="col-span-2 border-r border-black"></div>
              <div className="col-span-1 border-r border-black"></div>
              <div className="col-span-1 border-r border-black"></div>
              <div className="col-span-1 border-r border-black"></div>
              <div className="col-span-1 border-r border-black"></div>
              <div className="col-span-1 border-r border-black"></div>
              {invoiceData.saleType === "Intrastate" ? (
                <>
                  <div className="col-span-1 border-r border-black flex items-center justify-center text-xs">Rate (%)</div>
                  <div className="col-span-1 border-r border-black flex items-center justify-center text-xs">Amount (Rs.)</div>
                  <div className="col-span-1 border-r border-black flex items-center justify-center text-xs">Rate (%)</div>
                  <div className="col-span-1 border-r border-black flex items-center justify-center text-xs">Amount (Rs.)</div>
                  <div className="col-span-2 border-r border-black"></div>
                </>
              ) : (
                <>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-1 border-r border-black flex items-center justify-center text-xs">Rate (%)</div>
                  <div className="col-span-1 border-r border-black flex items-center justify-center text-xs">Amount (Rs.)</div>
                </>
              )}
              <div className="col-span-2"></div>
            </div>
          </div>

          {/* Rows 19-24: Item Rows - Excel A19:O24 */}
          {invoiceData.items.map((item, index) => (
            <div key={item.id} className={`grid grid-cols-15 text-xs border-b border-black ${index % 2 === 0 ? 'bg-[#FAFAFA]' : 'bg-white'}`} style={{ minHeight: "38px" }}>
              <div className="col-span-1 text-center px-1 py-2 border-r border-black flex items-center justify-center">{index + 1}</div>
              <div className="col-span-2 px-2 py-2 border-r border-black flex items-center">{item.description}</div>
              <div className="col-span-1 text-center px-1 py-2 border-r border-black flex items-center justify-center">{item.hsnCode}</div>
              <div className="col-span-1 text-right px-2 py-2 border-r border-black flex items-center justify-end">{item.quantity.toFixed(2)}</div>
              <div className="col-span-1 text-center px-1 py-2 border-r border-black flex items-center justify-center">{item.uom}</div>
              <div className="col-span-1 text-right px-2 py-2 border-r border-black flex items-center justify-end font-bold">{item.rate.toFixed(2)}</div>
              <div className="col-span-1 text-right px-2 py-2 border-r border-black flex items-center justify-end font-bold">{item.taxableValue.toFixed(2)}</div>
              {invoiceData.saleType === "Intrastate" ? (
                <>
                  <div className="col-span-1 text-center px-1 py-2 border-r border-black flex items-center justify-center font-bold">{item.cgstRate.toFixed(2)}</div>
                  <div className="col-span-1 text-right px-2 py-2 border-r border-black flex items-center justify-end font-bold">{item.cgstAmount.toFixed(2)}</div>
                  <div className="col-span-1 text-center px-1 py-2 border-r border-black flex items-center justify-center font-bold">{item.sgstRate.toFixed(2)}</div>
                  <div className="col-span-1 text-right px-2 py-2 border-r border-black flex items-center justify-end font-bold">{item.sgstAmount.toFixed(2)}</div>
                  <div className="col-span-2 border-r border-black"></div>
                </>
              ) : (
                <>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-2 border-r border-black"></div>
                  <div className="col-span-1 text-center px-1 py-2 border-r border-black flex items-center justify-center font-bold">{item.igstRate.toFixed(2)}</div>
                  <div className="col-span-1 text-right px-2 py-2 border-r border-black flex items-center justify-end font-bold">{item.igstAmount.toFixed(2)}</div>
                </>
              )}
              <div className="col-span-2 text-right px-2 py-2 flex items-center justify-end font-bold">{item.totalAmount.toFixed(2)}</div>
            </div>
          ))}

          {/* Row 25: Totals Row - Excel A25:O25 */}
          <div className="grid grid-cols-15 bg-[#EAEAEA] font-bold border-b-2 border-black" style={{ height: "50px" }}>
            <div className="col-span-3 text-center px-2 border-r border-black flex items-center justify-center" style={{ fontSize: "22px" }}>Total</div>
            <div className="col-span-1 text-center px-2 border-r border-black flex items-center justify-center">{invoiceData.items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}</div>
            <div className="col-span-2 text-right px-2 border-r border-black flex items-center justify-end">Sub Total:</div>
            <div className="col-span-1 text-right px-2 border-r border-black flex items-center justify-end">{totalTaxableValue.toFixed(2)}</div>
            {invoiceData.saleType === "Intrastate" ? (
              <>
                <div className="col-span-1 border-r border-black"></div>
                <div className="col-span-1 text-right px-2 border-r border-black flex items-center justify-end">{totalCGST.toFixed(2)}</div>
                <div className="col-span-1 border-r border-black"></div>
                <div className="col-span-1 text-right px-2 border-r border-black flex items-center justify-end">{totalSGST.toFixed(2)}</div>
                <div className="col-span-2 border-r border-black"></div>
              </>
            ) : (
              <>
                <div className="col-span-2 border-r border-black"></div>
                <div className="col-span-2 border-r border-black"></div>
                <div className="col-span-1 border-r border-black"></div>
                <div className="col-span-1 text-right px-2 border-r border-black flex items-center justify-end">{totalIGST.toFixed(2)}</div>
              </>
            )}
            <div className="col-span-2 text-right px-2 flex items-center justify-end">{grandTotal.toFixed(2)}</div>
          </div>

          {/* Rows 26-33: Amount in Words & Tax Summary Side-by-Side */}
          <div className="grid grid-cols-10">
            {/* Left side (cols A-J): Amount in Words & Terms */}
            <div className="col-span-6 border-r-2 border-black">
              {/* Row 26: Amount in Words Header */}
              <div className="bg-[#FFFF00] font-bold text-center py-2 border-b border-black" style={{ height: "32px", fontSize: "16px" }}>
                Total Invoice Amount in Words
              </div>

              {/* Rows 27-28: Amount in Words Content */}
              <div className="bg-[#FFFFE6] font-bold text-center flex items-center justify-center border-b-2 border-black" style={{ minHeight: "64px", fontSize: "13px", padding: "12px" }}>
                {amountInWords}
              </div>

              {/* Row 29: Terms and Conditions Header */}
              <div className="bg-[#FFFF00] font-bold text-center py-2 border-b border-black" style={{ height: "25px", fontSize: "14px" }}>
                Terms and Conditions
              </div>

              {/* Rows 30-33: Terms and Conditions Content */}
              <div className="bg-[#FFFFF5] px-3 py-2 text-xs leading-relaxed" style={{ minHeight: "100px", fontSize: "10px" }}>
                {invoiceData.termsAndConditions.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>

            {/* Right side (cols K-O): Tax Summary */}
            <div className="col-span-4">
              {/* Row 26 */}
              <div className="grid grid-cols-2 border-b border-black" style={{ height: "32px" }}>
                <div className="font-bold px-2 bg-[#F5F5F5] border-r border-black flex items-center text-xs">Total Amount Before Tax:</div>
                <div className="text-right px-2 font-bold bg-[#D8DEE9] flex items-center justify-end text-xs">{totalTaxableValue.toFixed(2)}</div>
              </div>

              {/* Row 27 */}
              <div className="grid grid-cols-2 border-b border-black" style={{ height: "30px" }}>
                <div className="font-bold px-2 bg-[#F5F5F5] border-r border-black flex items-center text-xs">CGST :</div>
                <div className="text-right px-2 font-bold bg-[#D8DEE9] flex items-center justify-end text-xs">{totalCGST.toFixed(2)}</div>
              </div>

              {/* Row 28 */}
              <div className="grid grid-cols-2 border-b border-black" style={{ height: "30px" }}>
                <div className="font-bold px-2 bg-[#F5F5F5] border-r border-black flex items-center text-xs">SGST :</div>
                <div className="text-right px-2 font-bold bg-[#D8DEE9] flex items-center justify-end text-xs">{totalSGST.toFixed(2)}</div>
              </div>

              {/* Row 29 */}
              <div className="grid grid-cols-2 border-b border-black" style={{ height: "30px" }}>
                <div className="font-bold px-2 bg-[#FFFFC8] border-r border-black flex items-center text-xs">IGST :</div>
                <div className="text-right px-2 font-bold bg-[#FFFFC8] flex items-center justify-end text-xs">{totalIGST.toFixed(2)}</div>
              </div>

              {/* Row 30 */}
              <div className="grid grid-cols-2 border-b border-black" style={{ height: "30px" }}>
                <div className="font-bold px-2 bg-[#F5F5F5] border-r border-black flex items-center text-xs">CESS :</div>
                <div className="text-right px-2 font-bold bg-[#D8DEE9] flex items-center justify-end text-xs">0.00</div>
              </div>

              {/* Row 31 */}
              <div className="grid grid-cols-2 border-b-2 border-black" style={{ height: "30px" }}>
                <div className="font-bold px-2 bg-[#F0F0F0] border-r border-black flex items-center text-xs">Total Tax:</div>
                <div className="text-right px-2 font-bold bg-[#F0F0F0] flex items-center justify-end text-xs">{totalTax.toFixed(2)}</div>
              </div>

              {/* Rows 32-33: Total Amount After Tax (merged 2 rows) */}
              <div className="grid grid-cols-2 bg-[#FFD700]" style={{ minHeight: "76px" }}>
                <div className="font-bold px-2 text-center border-r border-black flex items-center justify-center" style={{ fontSize: "13px" }}>Total Amount After Tax:</div>
                <div className="text-center px-2 font-bold flex items-center justify-center" style={{ fontSize: "14px" }}>{grandTotal.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Rows 34-40: Signature Section (3 columns) - Excel A34:O40 */}
          <div className="grid grid-cols-3 border-t-2 border-black">
            <div className="border-r-2 border-black text-center" style={{ minHeight: "120px", padding: "20px" }}>
              <div className="font-bold mb-6" style={{ fontSize: "13px" }}>Transporter</div>
              <div className="text-xs mb-2">Mobile No: ___________________</div>
              <div className="text-xs mt-8">Transporter's Signature</div>
            </div>
            <div className="border-r-2 border-black text-center" style={{ minHeight: "120px", padding: "20px" }}>
              <div className="font-bold mb-6" style={{ fontSize: "13px" }}>Receiver</div>
              <div className="text-xs mb-2">Mobile No: ___________________</div>
              <div className="text-xs mt-8">Receiver's Signature</div>
            </div>
            <div className="text-center" style={{ minHeight: "120px", padding: "20px" }}>
              <div className="font-bold text-sm mb-3">
                Certified that the particulars given above are true and correct
              </div>
              <div className="text-xs mb-2 mt-6">Mobile No: ___________________</div>
              <div className="text-xs mt-8">Authorized Signatory</div>
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
            background: white;
          }
          .page-break {
            page-break-after: always;
          }
          @page {
            size: A4 portrait;
            margin: 0.15in;
          }
        }
        
        /* Custom 15-column grid */
        .grid-cols-15 {
          display: grid;
          grid-template-columns: repeat(15, minmax(0, 1fr));
        }
        
        .col-span-1 { grid-column: span 1 / span 1; }
        .col-span-2 { grid-column: span 2 / span 2; }
        .col-span-3 { grid-column: span 3 / span 3; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .col-span-5 { grid-column: span 5 / span 5; }
        .col-span-6 { grid-column: span 6 / span 6; }
        .col-span-7 { grid-column: span 7 / span 7; }
        .col-span-8 { grid-column: span 8 / span 8; }
        .col-span-9 { grid-column: span 9 / span 9; }
        .col-span-10 { grid-column: span 10 / span 10; }
      `}</style>
    </div>
  );
};

export default InvoicePreview;
