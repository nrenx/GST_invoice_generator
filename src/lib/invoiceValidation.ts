import { InvoiceData, InvoiceItem, InvoiceValidationError } from '@/types/invoice';
import { determineIfInterstate } from './invoiceCalculations';

/**
 * Validate GSTIN format (15 alphanumeric characters)
 * @param gstin - GSTIN to validate
 * @returns true if valid
 */
export function isValidGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indian)
 * @param phone - Phone number to validate
 * @returns true if valid
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone);
}

/**
 * Validate date format (DD/MM/YYYY)
 * @param dateString - Date string to validate
 * @returns true if valid
 */
export function isValidDate(dateString: string): boolean {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Extract state code from GSTIN (first 2 digits)
 * @param gstin - GSTIN
 * @returns State code
 */
export function extractStateCodeFromGSTIN(gstin: string): string {
  if (gstin.length >= 2) {
    return gstin.substring(0, 2);
  }
  return '';
}

/**
 * Validate a single invoice item
 * @param item - Invoice item to validate
 * @param isInterstate - Whether this is interstate sale
 * @returns Array of validation errors
 */
export function validateInvoiceItem(
  item: InvoiceItem,
  isInterstate: boolean
): InvoiceValidationError[] {
  const errors: InvoiceValidationError[] = [];
  
  // Validate description
  if (!item.description || item.description.trim() === '') {
    errors.push({
      field: `item.${item.id}.description`,
      message: 'Item description is required',
      severity: 'error',
      suggestion: 'Please provide a description for this item'
    });
  }
  
  // Validate HSN code
  if (!item.hsnCode || item.hsnCode.trim() === '') {
    errors.push({
      field: `item.${item.id}.hsnCode`,
      message: 'HSN code is required',
      severity: 'error',
      suggestion: 'Please select or enter an HSN code'
    });
  }
  
  // Validate quantity
  if (item.quantity <= 0) {
    errors.push({
      field: `item.${item.id}.quantity`,
      message: 'Quantity must be greater than 0',
      severity: 'error',
      value: item.quantity,
      suggestion: 'Enter a positive quantity'
    });
  }
  
  // Validate rate
  if (item.rate <= 0) {
    errors.push({
      field: `item.${item.id}.rate`,
      message: 'Rate must be greater than 0',
      severity: 'error',
      value: item.rate,
      suggestion: 'Enter a positive rate'
    });
  }
  
  // Validate tax rates based on sale type
  if (isInterstate) {
    if (item.igstRate === 0) {
      errors.push({
        field: `item.${item.id}.igstRate`,
        message: 'IGST rate is required for interstate sales',
        severity: 'error',
        suggestion: 'Set IGST rate (CGST and SGST should be 0)'
      });
    }
    if (item.cgstRate > 0 || item.sgstRate > 0) {
      errors.push({
        field: `item.${item.id}.taxes`,
        message: 'CGST/SGST should not be applied in interstate sales',
        severity: 'warning',
        suggestion: 'Set CGST and SGST to 0 for interstate sales'
      });
    }
  } else {
    if (item.cgstRate === 0 || item.sgstRate === 0) {
      errors.push({
        field: `item.${item.id}.taxes`,
        message: 'CGST and SGST are required for intrastate sales',
        severity: 'error',
        suggestion: 'Set CGST and SGST rates (IGST should be 0)'
      });
    }
    if (item.cgstRate !== item.sgstRate) {
      errors.push({
        field: `item.${item.id}.taxes`,
        message: 'CGST and SGST rates must be equal',
        severity: 'error',
        value: { cgst: item.cgstRate, sgst: item.sgstRate },
        suggestion: 'Set equal CGST and SGST rates'
      });
    }
    if (item.igstRate > 0) {
      errors.push({
        field: `item.${item.id}.igstRate`,
        message: 'IGST should not be applied in intrastate sales',
        severity: 'warning',
        suggestion: 'Set IGST to 0 for intrastate sales'
      });
    }
  }
  
  // Validate calculated amounts
  const expectedTaxableValue = item.quantity * item.rate;
  if (Math.abs(item.taxableValue - expectedTaxableValue) > 0.01) {
    errors.push({
      field: `item.${item.id}.taxableValue`,
      message: 'Taxable value calculation mismatch',
      severity: 'warning',
      value: { expected: expectedTaxableValue, actual: item.taxableValue },
      suggestion: 'Recalculate the item totals'
    });
  }
  
  return errors;
}

/**
 * Validate complete invoice data
 * @param data - Invoice data to validate
 * @returns Array of validation errors
 */
export function validateInvoiceData(data: InvoiceData): InvoiceValidationError[] {
  const errors: InvoiceValidationError[] = [];
  
  // Validate company details
  if (!data.companyName || data.companyName.trim() === '') {
    errors.push({
      field: 'companyName',
      message: 'Company name is required',
      severity: 'error',
      suggestion: 'Enter your company name'
    });
  }
  
  if (!isValidGSTIN(data.companyGSTIN)) {
    errors.push({
      field: 'companyGSTIN',
      message: 'Invalid company GSTIN format',
      severity: 'error',
      value: data.companyGSTIN,
      suggestion: 'GSTIN should be 15 characters (e.g., 27AABCU9603R1ZM)'
    });
  }
  
  if (!isValidEmail(data.companyEmail)) {
    errors.push({
      field: 'companyEmail',
      message: 'Invalid email format',
      severity: 'error',
      value: data.companyEmail,
      suggestion: 'Enter a valid email address'
    });
  }
  
  if (data.companyPhone && !isValidPhone(data.companyPhone)) {
    errors.push({
      field: 'companyPhone',
      message: 'Invalid phone number format',
      severity: 'warning',
      value: data.companyPhone,
      suggestion: 'Phone should be 10 digits starting with 6-9'
    });
  }
  
  // Validate state code matches GSTIN
  const gstinStateCode = extractStateCodeFromGSTIN(data.companyGSTIN);
  if (gstinStateCode && gstinStateCode !== data.companyStateCode) {
    errors.push({
      field: 'companyStateCode',
      message: 'State code does not match GSTIN',
      severity: 'error',
      value: { gstin: gstinStateCode, stateCode: data.companyStateCode },
      suggestion: `State code should be ${gstinStateCode} to match GSTIN`
    });
  }
  
  // Validate receiver details
  if (!data.receiverName || data.receiverName.trim() === '') {
    errors.push({
      field: 'receiverName',
      message: 'Receiver name is required',
      severity: 'error',
      suggestion: 'Enter the bill-to party name'
    });
  }
  
  if (!isValidGSTIN(data.receiverGSTIN)) {
    errors.push({
      field: 'receiverGSTIN',
      message: 'Invalid receiver GSTIN format',
      severity: 'error',
      value: data.receiverGSTIN,
      suggestion: 'Enter a valid 15-character GSTIN'
    });
  }
  
  // Validate receiver state code matches GSTIN
  const receiverGstinStateCode = extractStateCodeFromGSTIN(data.receiverGSTIN);
  if (receiverGstinStateCode && receiverGstinStateCode !== data.receiverStateCode) {
    errors.push({
      field: 'receiverStateCode',
      message: 'Receiver state code does not match GSTIN',
      severity: 'error',
      value: { gstin: receiverGstinStateCode, stateCode: data.receiverStateCode },
      suggestion: `State code should be ${receiverGstinStateCode} to match GSTIN`
    });
  }
  
  // Validate invoice metadata
  if (!data.invoiceNumber || data.invoiceNumber.trim() === '') {
    errors.push({
      field: 'invoiceNumber',
      message: 'Invoice number is required',
      severity: 'error',
      suggestion: 'Enter an invoice number'
    });
  }
  
  if (!isValidDate(data.invoiceDate)) {
    errors.push({
      field: 'invoiceDate',
      message: 'Invalid invoice date format',
      severity: 'error',
      value: data.invoiceDate,
      suggestion: 'Date should be in DD/MM/YYYY format'
    });
  }
  
  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one item is required',
      severity: 'error',
      suggestion: 'Add items to the invoice'
    });
  } else {
    const isInterstate = determineIfInterstate(
      data.companyStateCode,
      data.receiverStateCode,
      data.saleType
    );
    
    data.items.forEach(item => {
      errors.push(...validateInvoiceItem(item, isInterstate));
    });
  }
  
  // Validate sale type consistency
  const isInterstate = determineIfInterstate(
    data.companyStateCode,
    data.receiverStateCode,
    data.saleType
  );
  
  const expectedSaleType = isInterstate ? 'Interstate' : 'Intrastate';
  if (data.saleType && data.saleType !== expectedSaleType) {
    errors.push({
      field: 'saleType',
      message: `Sale type mismatch: set as ${data.saleType} but state codes indicate ${expectedSaleType}`,
      severity: 'warning',
      suggestion: `Consider changing to ${expectedSaleType} or verify state codes`
    });
  }
  
  return errors;
}
