// Enum types for better type safety
export type InvoiceType = 'Tax Invoice' | 'Proforma Invoice' | 'Credit Note' | 'Debit Note';
export type SaleType = 'Interstate' | 'Intrastate';
export type ReverseCharge = 'Yes' | 'No';
export type TransportMode = 'Road' | 'Rail' | 'Air' | 'Ship' | 'By Hand';

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  uom: string;
  rate: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface InvoiceData {
  // Company Details
  companyName: string;
  companyAddress: string;
  companyGSTIN: string;
  companyEmail: string;
  companyPhone?: string;
  companyState: string;
  companyStateCode: string;
  companyLogo?: string;
  companyBankName?: string;
  companyBankAccount?: string;
  companyBankIFSC?: string;
  companyBankBranch?: string;

  // Invoice Metadata
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: string;
  saleType: string;
  reverseCharge: string;
  dueDate?: string;
  paymentTerms?: string;

  // Transport Details
  transportMode?: string;
  vehicleNumber?: string;
  transporterName?: string;
  challanNumber?: string;
  lrNumber?: string;
  dateOfSupply: string;
  placeOfSupply?: string;
  poNumber?: string;
  eWayBillNumber?: string;

  // Receiver Details
  receiverName: string;
  receiverAddress: string;
  receiverGSTIN: string;
  receiverState: string;
  receiverStateCode: string;

  // Consignee Details
  consigneeName: string;
  consigneeAddress: string;
  consigneeGSTIN: string;
  consigneeState: string;
  consigneeStateCode: string;

  // Items
  items: InvoiceItem[];

  // Terms and Additional
  termsAndConditions: string;
  notes?: string;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  additionalCharges?: number;
}

// Validation types
export interface InvoiceValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  value?: unknown;
  suggestion?: string;
}

// Template configuration types
export interface TemplateTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerFontSize: string;
  bodyFontSize: string;
  borderStyle: string;
}

export interface TemplateOptions {
  showLogo: boolean;
  showBankDetails: boolean;
  showQRCode: boolean;
  showSignature: boolean;
  showTerms: boolean;
  showTransportDetails: boolean;
  compactMode: boolean;
  colorScheme: 'default' | 'minimal' | 'vibrant';
}

export interface HSNCode {
  code: string;
  description: string;
  rate: number;
  cgst: number;
  sgst: number;
  igst: number;
}
