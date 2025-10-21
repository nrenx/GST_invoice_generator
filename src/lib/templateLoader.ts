import { InvoiceData } from "@/types/invoice";

export type TemplateType = "standard" | "modern";

export const loadTemplate = async (templateType: TemplateType): Promise<string> => {
  const templatePath = `/templates/invoices/${templateType}-template.html`;
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${templateType}`);
  }
  return response.text();
};

export const numberToWords = (num: number): string => {
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

export const injectDataIntoTemplate = (
  template: string,
  invoiceData: InvoiceData,
  pageType: "ORIGINAL" | "DUPLICATE"
): string => {
  const isInterstate = invoiceData.saleType === "Interstate";
  
  // Calculate totals
  const totalTaxableValue = invoiceData.items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCGST = invoiceData.items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSGST = invoiceData.items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIGST = invoiceData.items.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = totalCGST + totalSGST + totalIGST;
  const grandTotal = totalTaxableValue + totalTax;
  const amountInWords = numberToWords(Math.floor(grandTotal)) + ' Rupees Only';

  // Build tax headers
  let taxHeaders = '';
  if (isInterstate) {
    taxHeaders = '<th class="text-right" style="width: 12%;">IGST</th>';
  } else {
    taxHeaders = '<th class="text-right" style="width: 10%;">CGST</th><th class="text-right" style="width: 10%;">SGST</th>';
  }

  // Build items rows
  const itemsRows = invoiceData.items.map((item, index) => {
    let taxCells = '';
    if (isInterstate) {
      taxCells = `<td class="text-right">₹${item.igstAmount.toFixed(2)}</td>`;
    } else {
      taxCells = `<td class="text-right">₹${item.cgstAmount.toFixed(2)}</td><td class="text-right">₹${item.sgstAmount.toFixed(2)}</td>`;
    }

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.description}</td>
        <td class="text-right">${item.hsnCode}</td>
        <td class="text-right">${item.quantity} ${item.uom}</td>
        <td class="text-right">₹${item.rate.toFixed(2)}</td>
        <td class="text-right">₹${item.taxableValue.toFixed(2)}</td>
        ${taxCells}
        <td class="text-right"><strong>₹${item.totalAmount.toFixed(2)}</strong></td>
      </tr>
    `;
  }).join('');

  // Build tax totals
  let taxTotals = '';
  if (isInterstate) {
    taxTotals = `<td class="text-right">₹${totalIGST.toFixed(2)}</td>`;
  } else {
    taxTotals = `<td class="text-right">₹${totalCGST.toFixed(2)}</td><td class="text-right">₹${totalSGST.toFixed(2)}</td>`;
  }

  // Replace all placeholders
  let result = template
    .replace(/{{PAGE_TYPE}}/g, pageType)
    .replace(/{{COMPANY_NAME}}/g, invoiceData.companyName)
    .replace(/{{COMPANY_ADDRESS}}/g, invoiceData.companyAddress)
    .replace(/{{COMPANY_STATE}}/g, invoiceData.companyState)
    .replace(/{{COMPANY_GSTIN}}/g, invoiceData.companyGSTIN)
    .replace(/{{COMPANY_EMAIL}}/g, invoiceData.companyEmail)
    .replace(/{{COMPANY_PHONE}}/g, invoiceData.companyPhone)
    .replace(/{{INVOICE_NUMBER}}/g, invoiceData.invoiceNumber)
    .replace(/{{INVOICE_DATE}}/g, invoiceData.invoiceDate)
    .replace(/{{TRANSPORT_MODE}}/g, invoiceData.transportMode)
    .replace(/{{VEHICLE_NUMBER}}/g, invoiceData.vehicleNumber)
    .replace(/{{RECEIVER_NAME}}/g, invoiceData.receiverName)
    .replace(/{{RECEIVER_ADDRESS}}/g, invoiceData.receiverAddress)
    .replace(/{{RECEIVER_STATE}}/g, invoiceData.receiverState)
    .replace(/{{RECEIVER_GSTIN}}/g, invoiceData.receiverGSTIN)
    .replace(/{{CONSIGNEE_NAME}}/g, invoiceData.consigneeName)
    .replace(/{{CONSIGNEE_ADDRESS}}/g, invoiceData.consigneeAddress)
    .replace(/{{CONSIGNEE_STATE}}/g, invoiceData.consigneeState)
    .replace(/{{CONSIGNEE_GSTIN}}/g, invoiceData.consigneeGSTIN)
    .replace(/{{TAX_HEADERS}}/g, taxHeaders)
    .replace(/{{ITEMS_ROWS}}/g, itemsRows)
    .replace(/{{TAX_TOTALS}}/g, taxTotals)
    .replace(/{{TOTAL_TAXABLE_VALUE}}/g, totalTaxableValue.toFixed(2))
    .replace(/{{GRAND_TOTAL}}/g, grandTotal.toFixed(2))
    .replace(/{{AMOUNT_IN_WORDS}}/g, amountInWords)
    .replace(/{{TERMS_AND_CONDITIONS}}/g, invoiceData.termsAndConditions);

  return result;
};