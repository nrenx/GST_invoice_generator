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
  companyPhone: string;
  companyState: string;
  companyStateCode: string;

  // Invoice Metadata
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: string;
  saleType: string;
  reverseCharge: string;

  // Transport Details
  transportMode: string;
  vehicleNumber: string;
  transporterName: string;
  challanNumber: string;
  lrNumber: string;
  dateOfSupply: string;
  placeOfSupply: string;
  poNumber: string;
  eWayBillNumber: string;

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

  // Terms
  termsAndConditions: string;
}

export interface HSNCode {
  code: string;
  description: string;
  rate: number;
  cgst: number;
  sgst: number;
  igst: number;
}
