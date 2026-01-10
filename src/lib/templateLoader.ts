import { InvoiceData } from "@/types/invoice";

export type TemplateType = "standard" | "professional" | "composition" | "interstate";

export const loadTemplate = async (templateType: TemplateType): Promise<string> => {
  const basePath = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const templatePath = `${normalizedBase}templates/invoices/${templateType}-template.html`;
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
  const hasDynamicTaxPlaceholders = template.includes("{{TAX_HEADERS}}");
  const formatCurrency = (value: number) => value.toFixed(2);
  
  // Calculate totals
  const totalTaxableValue = invoiceData.items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCGST = invoiceData.items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSGST = invoiceData.items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIGST = invoiceData.items.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalCess = invoiceData.items.reduce((sum, item) => sum + item.cessAmount, 0);
  const totalTax = totalCGST + totalSGST + totalIGST + totalCess;
  const grandTotal = totalTaxableValue + totalTax;
  const totalQuantity = invoiceData.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = invoiceData.items.reduce((sum, item) => sum + item.taxableValue, 0);
  const amountInWords = numberToWords(Math.floor(grandTotal)) + ' Rupees Only';

  // Build items rows
  const detailedItemsRows = invoiceData.items.map((item, index) => {
    return `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.description}</td>
        <td class="text-center">${item.hsnCode}</td>
        <td class="text-right">${item.quantity.toFixed(2)}</td>
        <td class="text-center">${item.uom}</td>
        <td class="text-right">${item.rate.toFixed(2)}</td>
        <td class="text-right">${item.taxableValue.toFixed(2)}</td>
        <td class="text-right">${item.taxableValue.toFixed(2)}</td>
        <td class="text-center">${item.cgstRate > 0 ? item.cgstRate.toFixed(2) : '0.00'}</td>
        <td class="text-right">${item.cgstAmount > 0 ? item.cgstAmount.toFixed(2) : '0.00'}</td>
        <td class="text-center">${item.sgstRate > 0 ? item.sgstRate.toFixed(2) : '0.00'}</td>
        <td class="text-right">${item.sgstAmount > 0 ? item.sgstAmount.toFixed(2) : '0.00'}</td>
        <td class="text-center">${item.igstRate > 0 ? item.igstRate.toFixed(2) : '0.00'}</td>
        <td class="text-right">${item.igstAmount > 0 ? item.igstAmount.toFixed(2) : '0.00'}</td>
        <td class="text-right"><strong>${item.totalAmount.toFixed(2)}</strong></td>
      </tr>
    `;
  }).join('');

  const dynamicItemsRows = invoiceData.items.map((item, index) => {
    const taxCells = isInterstate
      ? `<td class="text-right">₹${formatCurrency(item.igstAmount)}</td><td class="text-right">₹${formatCurrency(item.cessAmount)}</td>`
      : `<td class="text-right">₹${formatCurrency(item.cgstAmount)}</td><td class="text-right">₹${formatCurrency(item.sgstAmount)}</td><td class="text-right">₹${formatCurrency(item.cessAmount)}</td>`;

    return `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.description}</td>
        <td class="text-right">${item.hsnCode}</td>
        <td class="text-right">${item.quantity.toFixed(2)}</td>
        <td class="text-right">₹${formatCurrency(item.rate)}</td>
        <td class="text-right">₹${formatCurrency(item.taxableValue)}</td>
        ${taxCells}
        <td class="text-right"><strong>₹${formatCurrency(item.totalAmount)}</strong></td>
      </tr>
    `;
  }).join('');

  // Composition scheme items rows (simplified - no tax columns)
  const compositionItemsRows = invoiceData.items.map((item, index) => {
    return `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.description}</td>
        <td class="text-center">${item.hsnCode}</td>
        <td class="text-right">${item.quantity.toFixed(2)}</td>
        <td class="text-center">${item.uom}</td>
        <td class="text-right">${formatCurrency(item.rate)}</td>
        <td class="text-right">${formatCurrency(item.taxableValue)}</td>
      </tr>
    `;
  }).join('');

  const taxHeaders = isInterstate
    ? '<th class="text-right" style="width: 12%;">IGST</th><th class="text-right" style="width: 12%;">Compensation Cess</th>'
    : '<th class="text-right" style="width: 10%;">CGST</th><th class="text-right" style="width: 10%;">SGST</th><th class="text-right" style="width: 12%;">Compensation Cess</th>';

  const taxTotals = isInterstate
    ? `<td class="text-right">₹${formatCurrency(totalIGST)}</td><td class="text-right">₹${formatCurrency(totalCess)}</td>`
    : `<td class="text-right">₹${formatCurrency(totalCGST)}</td><td class="text-right">₹${formatCurrency(totalSGST)}</td><td class="text-right">₹${formatCurrency(totalCess)}</td>`;

  const cgstHeaderLabel = isInterstate ? "CGST Not Apply" : "CGST Rate (%)";
  const cgstHeaderClass = isInterstate ? "red-header" : "";
  const sgstHeaderLabel = isInterstate ? "SGST Not Apply" : "SGST Rate (%)";
  const sgstHeaderClass = isInterstate ? "red-header" : "";
  const igstHeaderLabel = isInterstate ? "IGST Rate (%)" : "IGST Not Apply";
  const igstHeaderClass = isInterstate ? "" : "red-header";

  // Calculate tax rate totals (for display in totals row)
  const totalCGSTRate = invoiceData.items.length > 0 && totalCGST > 0 
    ? invoiceData.items.reduce((sum, item) => item.cgstRate > 0 ? item.cgstRate : sum, 0) 
    : 0;
  const totalSGSTRate = invoiceData.items.length > 0 && totalSGST > 0 
    ? invoiceData.items.reduce((sum, item) => item.sgstRate > 0 ? item.sgstRate : sum, 0) 
    : 0;
  const totalIGSTRate = invoiceData.items.length > 0 && totalIGST > 0 
    ? invoiceData.items.reduce((sum, item) => item.igstRate > 0 ? item.igstRate : sum, 0) 
    : 0;

  // Build company contact info dynamically based on template type
  const companyContactParts: string[] = [];
  if (invoiceData.companyEmail && invoiceData.companyEmail.trim()) {
    companyContactParts.push(`Email: ${invoiceData.companyEmail}`);
  }
  if (invoiceData.companyPhone && invoiceData.companyPhone.trim()) {
    companyContactParts.push(`Phone: ${invoiceData.companyPhone}`);
  }
  
  // Detect template type and format accordingly
  let companyContactInfo = '';
  if (companyContactParts.length > 0) {
    if (template.includes('class="header"') || template.includes('<!-- Header -->')) {
      // Standard template uses <p> tags
      companyContactInfo = companyContactParts.map(part => `<p><strong>${part}</strong></p>`).join('\n      ');
    } else if (template.includes('class="company-info"') || template.includes('class="detail-label"')) {
      // Professional template uses div with detail-label/detail-value
      const formattedParts = companyContactParts.map(part => {
        const [label, value] = part.split(': ');
        return `<span class="detail-label">${label}:</span> <span class="detail-value">${value}</span>`;
      });
      companyContactInfo = `<div>${formattedParts.join(' | ')}</div>`;
    } else {
      // Eway/Antique templates use inline with <strong>
      companyContactInfo = `<strong>${companyContactParts.join('</strong> | <strong>')}</strong>`;
    }
  }

  // Replace all placeholders
  let result = template
    .replace(/{{PAGE_TYPE}}/g, pageType)
    .replace(/{{COMPANY_NAME}}/g, invoiceData.companyName)
    .replace(/{{COMPANY_ADDRESS}}/g, invoiceData.companyAddress)
    .replace(/{{COMPANY_STATE}}/g, invoiceData.companyState)
    .replace(/{{COMPANY_STATE_CODE}}/g, invoiceData.companyStateCode)
    .replace(/{{COMPANY_GSTIN}}/g, invoiceData.companyGSTIN)
    .replace(/{{COMPANY_EMAIL}}/g, invoiceData.companyEmail)
    .replace(/{{COMPANY_PHONE}}/g, invoiceData.companyPhone || '')
    .replace(/{{COMPANY_CONTACT_INFO}}/g, companyContactInfo)
    .replace(/{{INVOICE_NUMBER}}/g, invoiceData.invoiceNumber)
    .replace(/{{INVOICE_DATE}}/g, invoiceData.invoiceDate)
    .replace(/{{INVOICE_TYPE}}/g, invoiceData.invoiceType)
    .replace(/{{SALE_TYPE}}/g, invoiceData.saleType)
    .replace(/{{REVERSE_CHARGE}}/g, invoiceData.reverseCharge)
    .replace(/{{TRANSPORT_MODE}}/g, invoiceData.transportMode || '')
    .replace(/{{VEHICLE_NUMBER}}/g, invoiceData.vehicleNumber || '')
    .replace(/{{TRANSPORTER_NAME}}/g, invoiceData.transporterName || '')
    .replace(/{{CHALLAN_NUMBER}}/g, invoiceData.challanNumber || '')
    .replace(/{{LR_NUMBER}}/g, invoiceData.lrNumber || '')
    .replace(/{{DATE_OF_SUPPLY}}/g, invoiceData.dateOfSupply)
    .replace(/{{PLACE_OF_SUPPLY}}/g, invoiceData.placeOfSupply || '')
    .replace(/{{PO_NUMBER}}/g, invoiceData.poNumber || '')
    .replace(/{{EWAY_BILL_NUMBER}}/g, invoiceData.eWayBillNumber || 'Not Applicable')
    .replace(/{{RECEIVER_NAME}}/g, invoiceData.receiverName)
    .replace(/{{RECEIVER_ADDRESS}}/g, invoiceData.receiverAddress)
    .replace(/{{RECEIVER_STATE}}/g, invoiceData.receiverState)
    .replace(/{{RECEIVER_STATE_CODE}}/g, invoiceData.receiverStateCode)
    .replace(/{{RECEIVER_GSTIN}}/g, invoiceData.receiverGSTIN)
    .replace(/{{CONSIGNEE_NAME}}/g, invoiceData.consigneeName)
    .replace(/{{CONSIGNEE_ADDRESS}}/g, invoiceData.consigneeAddress)
    .replace(/{{CONSIGNEE_STATE}}/g, invoiceData.consigneeState)
    .replace(/{{CONSIGNEE_STATE_CODE}}/g, invoiceData.consigneeStateCode)
    .replace(/{{CONSIGNEE_GSTIN}}/g, invoiceData.consigneeGSTIN)
    .replace(/{{TOTAL_QUANTITY}}/g, totalQuantity.toFixed(2))
    .replace(/{{TOTAL_AMOUNT}}/g, totalAmount.toFixed(2))
    .replace(/{{TOTAL_TAXABLE_VALUE}}/g, totalTaxableValue.toFixed(2))
    .replace(/{{TOTAL_CGST_RATE}}/g, totalCGSTRate.toFixed(2))
    .replace(/{{TOTAL_CGST}}/g, totalCGST.toFixed(2))
    .replace(/{{TOTAL_SGST_RATE}}/g, totalSGSTRate.toFixed(2))
    .replace(/{{TOTAL_SGST}}/g, totalSGST.toFixed(2))
    .replace(/{{TOTAL_IGST_RATE}}/g, totalIGSTRate.toFixed(2))
    .replace(/{{TOTAL_IGST}}/g, totalIGST.toFixed(2))
    .replace(/{{TOTAL_TAX}}/g, totalTax.toFixed(2))
    .replace(/{{GRAND_TOTAL}}/g, grandTotal.toFixed(2))
    .replace(/{{AMOUNT_IN_WORDS}}/g, amountInWords)
  .replace(/{{TERMS_AND_CONDITIONS}}/g, invoiceData.termsAndConditions || '')
  .replace(/{{CGST_HEADER_LABEL}}/g, cgstHeaderLabel)
  .replace(/{{CGST_HEADER_CLASS}}/g, cgstHeaderClass)
  .replace(/{{SGST_HEADER_LABEL}}/g, sgstHeaderLabel)
  .replace(/{{SGST_HEADER_CLASS}}/g, sgstHeaderClass)
  .replace(/{{IGST_HEADER_LABEL}}/g, igstHeaderLabel)
  .replace(/{{IGST_HEADER_CLASS}}/g, igstHeaderClass);

  if (hasDynamicTaxPlaceholders) {
    result = result
      .replace(/{{TAX_HEADERS}}/g, taxHeaders)
      .replace(/{{TAX_TOTALS}}/g, taxTotals)
      .replace(/{{ITEMS_ROWS}}/g, dynamicItemsRows);
  } else {
    result = result.replace(/{{ITEMS_ROWS}}/g, detailedItemsRows);
  }

  // Handle composition scheme template (simplified items without tax columns)
  const hasCompositionPlaceholder = template.includes("{{COMPOSITION_ITEMS_ROWS}}");
  if (hasCompositionPlaceholder) {
    // For composition scheme, grand total equals taxable value (no tax added)
    const compositionGrandTotal = totalTaxableValue;
    const compositionAmountInWords = numberToWords(Math.floor(compositionGrandTotal)) + ' Rupees Only';
    
    result = result
      .replace(/{{COMPOSITION_ITEMS_ROWS}}/g, compositionItemsRows)
      .replace(/{{GRAND_TOTAL}}/g, compositionGrandTotal.toFixed(2))
      .replace(/{{AMOUNT_IN_WORDS}}/g, compositionAmountInWords);
  }

  // Handle interstate template (IGST-only layout)
  const hasInterstatePlaceholder = template.includes("{{INTERSTATE_ITEMS_ROWS}}");
  if (hasInterstatePlaceholder) {
    const interstateItemsRows = invoiceData.items.map((item, index) => {
      return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${item.description}</td>
          <td class="text-center">${item.hsnCode}</td>
          <td class="text-right">${item.quantity.toFixed(2)}</td>
          <td class="text-center">${item.uom}</td>
          <td class="text-right">${formatCurrency(item.rate)}</td>
          <td class="text-right">${formatCurrency(item.taxableValue)}</td>
          <td class="text-center">${item.igstRate.toFixed(2)}</td>
          <td class="text-right">${formatCurrency(item.igstAmount)}</td>
          <td class="text-right"><strong>${formatCurrency(item.totalAmount)}</strong></td>
        </tr>
      `;
    }).join('');
    
    result = result.replace(/{{INTERSTATE_ITEMS_ROWS}}/g, interstateItemsRows);
  }

  return result;
};