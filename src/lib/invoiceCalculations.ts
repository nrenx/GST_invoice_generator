import { InvoiceItem } from '@/types/invoice';

/**
 * Determines if a sale is interstate based on state codes
 * @param companyStateCode - Company's state code (from GSTIN)
 * @param receiverStateCode - Receiver's state code (from GSTIN)
 * @param saleType - Explicit sale type override
 * @returns true if interstate, false if intrastate
 */
export function determineIfInterstate(
  companyStateCode: string,
  receiverStateCode: string,
  saleType?: string
): boolean {
  // If saleType is explicitly set, use it as override
  if (saleType) {
    return saleType.toLowerCase() === 'interstate';
  }
  
  // Otherwise, determine by comparing state codes
  return companyStateCode !== receiverStateCode;
}

/**
 * Calculates all totals for a single invoice item
 * @param item - Partial invoice item data
 * @param isInterstate - Whether this is an interstate sale
 * @returns Complete invoice item with all calculated values
 */
export function calculateItemTotals(
  item: Partial<InvoiceItem>,
  isInterstate: boolean
): InvoiceItem {
  const id = item.id || crypto.randomUUID();
  const description = item.description || '';
  const hsnCode = item.hsnCode || '';
  const quantity = item.quantity ?? 0;
  const uom = item.uom || '';
  const rate = item.rate ?? 0;
  
  // Calculate taxable value
  const taxableValue = quantity * rate;
  
  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;
  
  if (isInterstate) {
    // Interstate: Use IGST
    igstRate = item.igstRate ?? 0;
    igstAmount = (taxableValue * igstRate) / 100;
  } else {
    // Intrastate: Use CGST + SGST
    cgstRate = item.cgstRate ?? 0;
    sgstRate = item.sgstRate ?? 0;
    cgstAmount = (taxableValue * cgstRate) / 100;
    sgstAmount = (taxableValue * sgstRate) / 100;
  }
  
  // Calculate total amount
  const totalAmount = taxableValue + cgstAmount + sgstAmount + igstAmount;
  
  return {
    id,
    description,
    hsnCode,
    quantity,
    uom,
    rate,
    taxableValue,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalAmount
  };
}

/**
 * Calculates invoice-level totals from all items
 * @param items - Array of invoice items
 * @returns Object with all calculated totals
 */
export function calculateInvoiceTotals(items: InvoiceItem[]) {
  const totals = items.reduce(
    (acc, item) => ({
      totalTaxableValue: acc.totalTaxableValue + item.taxableValue,
      totalCGST: acc.totalCGST + item.cgstAmount,
      totalSGST: acc.totalSGST + item.sgstAmount,
      totalIGST: acc.totalIGST + item.igstAmount,
      totalQuantity: acc.totalQuantity + item.quantity
    }),
    {
      totalTaxableValue: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
      totalQuantity: 0
    }
  );
  
  const totalTax = totals.totalCGST + totals.totalSGST + totals.totalIGST;
  const grandTotal = totals.totalTaxableValue + totalTax;
  
  return {
    ...totals,
    totalTax,
    grandTotal
  };
}

/**
 * Validates that tax rates follow GST rules
 * @param cgstRate - CGST rate
 * @param sgstRate - SGST rate
 * @param igstRate - IGST rate
 * @param isInterstate - Whether this is interstate sale
 * @returns true if rates are valid
 */
export function validateTaxRates(
  cgstRate: number,
  sgstRate: number,
  igstRate: number,
  isInterstate: boolean
): boolean {
  if (isInterstate) {
    // Interstate: Only IGST should be present
    return igstRate > 0 && cgstRate === 0 && sgstRate === 0;
  } else {
    // Intrastate: CGST and SGST should be equal and no IGST
    return cgstRate === sgstRate && igstRate === 0;
  }
}
