import type { CSSProperties } from 'react';

import type { InvoiceData, InvoiceItem } from '../types/invoice';

type FormatAmountOptions = {
  allowZero?: boolean;
};

const TOTAL_COLUMNS = 15;
const COLUMN_WIDTHS = [5, 12, 12, 9, 7, 10, 14, 10, 6, 10, 6, 10, 6, 10, 16];
const MIN_ITEM_ROWS = 1;

const formatAmount = (value?: number, options: FormatAmountOptions = {}): string => {
  const { allowZero = false } = options;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return allowZero ? '0.00' : '';
  }

  if (!allowZero && value === 0) {
    return '';
  }

  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatRate = (value?: number, options: FormatAmountOptions = {}): string => {
  const formatted = formatAmount(value, options);
  return formatted ? `${formatted}%` : '';
};

const formatQuantity = (value?: number): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const safeText = (value?: string, fallback = '---'): string => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const splitLines = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|\u2022|\u2023|\u25E6|\u2043|\u2219/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

const computeAmount = (item?: InvoiceItem | null): number | undefined => {
  if (!item) {
    return undefined;
  }

  const amount = item.quantity * item.rate;
  return Number.isFinite(amount) ? amount : undefined;
};

export function CompactVBATable({
  invoiceData,
  pageType,
  totalTaxableValue,
  totalCGST,
  totalSGST,
  totalIGST,
  totalTax,
  grandTotal,
  amountInWords,
}: {
  invoiceData: InvoiceData;
  pageType: 'ORIGINAL' | 'DUPLICATE';
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalTax: number;
  grandTotal: number;
  amountInWords: string;
}) {
  const colors = {
    topHeaderBg: '#2F5061',
    topHeaderText: '#FFFFFF',
    companyInfoBg: '#F4F4F4',
    taxInvoiceBg: '#F7F7F7',
    detailLabelBg: '#EFEFEF',
    detailValueBg: '#FFFFFF',
    receiverHeaderBg: '#E4E8F5',
    itemsHeaderBg: '#DFE6F5',
    itemsHeaderSubBg: '#EDF1FB',
    itemRowOddBg: '#FFFFFF',
    itemRowEvenBg: '#F9F9F9',
    totalRowBg: '#E6E6E6',
    amountHeaderBg: '#FFF200',
    amountTextBg: '#FFF8CC',
    taxSummaryLabelBg: '#F5F5F5',
    taxSummaryValueBg: '#D8DEE9',
    taxSummaryHighlightBg: '#FFD966',
    taxSummaryHighlightValueBg: '#FFE699',
    termsHeaderBg: '#FFF200',
    termsBodyBg: '#FFF8CC',
    signatureHeaderBg: '#D9D9D9',
    signatureSubBg: '#FAFAFA',
    signatureSpaceBg: '#FFFFFF',
    signatureFooterBg: '#D3D3D3',
    footerNoteBg: '#F0F0F0',
  } as const;

  const tableStyle: CSSProperties = {
    width: '100%',
    border: '2px solid #000',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: '#000000',
    backgroundColor: '#FFFFFF',
  };

  const baseCellStyle: CSSProperties = {
    border: '1px solid #000000',
    padding: '4px 6px',
    fontSize: '11px',
    lineHeight: 1.3,
    verticalAlign: 'middle',
    textAlign: 'left',
    backgroundColor: 'inherit',
  };

  const centeredCellStyle: CSSProperties = {
    ...baseCellStyle,
    textAlign: 'center',
  };

  const rightAlignedCellStyle: CSSProperties = {
    ...baseCellStyle,
    textAlign: 'right',
  };

  const detailLabelStyle: CSSProperties = {
    ...baseCellStyle,
    backgroundColor: colors.detailLabelBg,
    fontWeight: 600,
    fontSize: '12px',
  };

  const detailValueStyle: CSSProperties = {
    ...baseCellStyle,
    backgroundColor: colors.detailValueBg,
    fontSize: '12px',
  };

  const detailValueStrongStyle: CSSProperties = {
    ...detailValueStyle,
    fontWeight: 600,
  };

  const saleTypeValueStyle: CSSProperties = {
    ...detailValueStrongStyle,
    color: '#C53030',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: '16px',
  };

  const sectionHeaderStyle: CSSProperties = {
    ...centeredCellStyle,
    fontWeight: 700,
    fontSize: '13px',
    backgroundColor: colors.receiverHeaderBg,
  };

  const itemHeaderCellStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.itemsHeaderBg,
    fontWeight: 700,
    fontSize: '12px',
  };

  const itemHeaderSubCellStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.itemsHeaderSubBg,
    fontWeight: 600,
    fontSize: '11px',
  };

  const totalRowBaseStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.totalRowBg,
    fontWeight: 700,
    fontSize: '12px',
  };

  const amountHeaderStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.amountHeaderBg,
    fontWeight: 700,
    fontSize: '16px',
  };

  const amountBodyStyle: CSSProperties = {
    ...baseCellStyle,
    backgroundColor: colors.amountTextBg,
    fontWeight: 600,
    textAlign: 'center',
    fontSize: '12px',
  };

  const taxSummaryLabelStyle: CSSProperties = {
    ...baseCellStyle,
    backgroundColor: colors.taxSummaryLabelBg,
    fontWeight: 600,
    fontSize: '12px',
  };

  const taxSummaryValueStyle: CSSProperties = {
    ...rightAlignedCellStyle,
    backgroundColor: colors.taxSummaryValueBg,
    fontWeight: 600,
    fontSize: '12px',
  };

  const taxSummaryHighlightLabelStyle: CSSProperties = {
    ...taxSummaryLabelStyle,
    backgroundColor: colors.taxSummaryHighlightBg,
  };

  const taxSummaryHighlightValueStyle: CSSProperties = {
    ...taxSummaryValueStyle,
    backgroundColor: colors.taxSummaryHighlightValueBg,
    fontSize: '13px',
  };

  const termsHeaderStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.termsHeaderBg,
    fontWeight: 700,
    fontSize: '14px',
  };

  const termsBodyStyle: CSSProperties = {
    ...baseCellStyle,
    backgroundColor: colors.termsBodyBg,
    fontSize: '12px',
    lineHeight: 1.4,
  };

  const signatureHeaderCellStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.signatureHeaderBg,
    fontWeight: 700,
    fontSize: '13px',
  };

  const signatureSubCellStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.signatureSubBg,
    fontSize: '11px',
  };

  const signatureSpaceStyle: CSSProperties = {
    ...baseCellStyle,
    backgroundColor: colors.signatureSpaceBg,
    height: '55px',
  };

  const signatureFooterCellStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.signatureFooterBg,
    fontWeight: 600,
    fontSize: '11px',
  };

  const footerNoteStyle: CSSProperties = {
    ...centeredCellStyle,
    backgroundColor: colors.footerNoteBg,
    fontSize: '10px',
    padding: '6px',
  };

  const normalizedSaleType = invoiceData.saleType?.trim().toLowerCase() ?? '';
  const isInterState = normalizedSaleType === 'interstate'
    || invoiceData.companyStateCode.trim() !== invoiceData.receiverStateCode.trim();

  const itemRowCount = Math.max(invoiceData.items.length, MIN_ITEM_ROWS);
  const paddedItems: Array<InvoiceItem | null> = Array.from({ length: itemRowCount }, (_, index) => invoiceData.items[index] ?? null);

  const termsLines = splitLines(invoiceData.termsAndConditions);
  const defaultTerms = [
    'This is an electronically generated invoice.',
    'All disputes are subject to GUDUR jurisdiction only.',
    'If the consignee makes any inter-state sale, he has to pay GST himself.',
    'Goods once sold cannot be taken back or exchanged.',
    'Payment terms as per agreement between buyer and seller.',
  ];
  const displayTerms = termsLines.length > 0 ? termsLines : defaultTerms;

  const acknowledgementLines = [
    'Received the goods in good condition.',
    'Certified that the particulars given above are true and correct.',
    'This is an electronically generated invoice.',
  ];

  const amountWordsText = safeText(amountInWords);

  const totalQuantity = invoiceData.items.reduce((acc, item) => acc + (Number.isFinite(item.quantity) ? item.quantity : 0), 0);
  const totalAmountBeforeTax = invoiceData.items.reduce((acc, item) => acc + (Number.isFinite(item.rate) && Number.isFinite(item.quantity) ? item.rate * item.quantity : 0), 0);
  const totalItemAmount = invoiceData.items.reduce((acc, item) => acc + (Number.isFinite(item.totalAmount) ? item.totalAmount : 0), 0);

  const firstCgstRate = invoiceData.items.find((item) => item.cgstRate > 0)?.cgstRate ?? 0;
  const firstSgstRate = invoiceData.items.find((item) => item.sgstRate > 0)?.sgstRate ?? 0;
  const firstIgstRate = invoiceData.items.find((item) => item.igstRate > 0)?.igstRate ?? 0;

  const totalColumnWidth = COLUMN_WIDTHS.reduce((acc, width) => acc + width, 0);

  return (
    <table style={tableStyle}>
      <colgroup>
        {COLUMN_WIDTHS.map((width, index) => (
          <col key={`col-${index}`} style={{ width: `${(width / totalColumnWidth) * 100}%` }} />
        ))}
      </colgroup>

      <tbody>
        <tr>
          <td colSpan={TOTAL_COLUMNS} style={{
            ...centeredCellStyle,
            backgroundColor: colors.topHeaderBg,
            color: colors.topHeaderText,
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.5px',
          }}>
            {pageType.toUpperCase()}
          </td>
        </tr>

        <tr>
          <td colSpan={TOTAL_COLUMNS} style={{
            ...centeredCellStyle,
            backgroundColor: colors.topHeaderBg,
            color: colors.topHeaderText,
            fontWeight: 700,
            fontSize: '34px',
            padding: '12px 6px',
          }}>
            {safeText(invoiceData.companyName).toUpperCase()}
          </td>
        </tr>

        <tr>
          <td colSpan={TOTAL_COLUMNS} style={{
            ...centeredCellStyle,
            backgroundColor: colors.companyInfoBg,
            fontWeight: 600,
            fontSize: '14px',
          }}>
            {safeText(invoiceData.companyAddress)}
          </td>
        </tr>

        <tr>
          <td colSpan={TOTAL_COLUMNS} style={{
            ...centeredCellStyle,
            backgroundColor: colors.companyInfoBg,
            fontSize: '13px',
          }}>
            GSTIN: {safeText(invoiceData.companyGSTIN)}
          </td>
        </tr>

        <tr>
          <td colSpan={TOTAL_COLUMNS} style={{
            ...centeredCellStyle,
            backgroundColor: colors.companyInfoBg,
            fontSize: '13px',
          }}>
            Email: {safeText(invoiceData.companyEmail)}
          </td>
        </tr>

        <tr>
          <td colSpan={10} style={{
            ...centeredCellStyle,
            backgroundColor: colors.taxInvoiceBg,
            fontWeight: 700,
            fontSize: '22px',
            padding: '10px 6px',
          }}>
            TAX-INVOICE
          </td>
          <td colSpan={5} style={{
            ...centeredCellStyle,
            backgroundColor: colors.taxInvoiceBg,
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: 1.5,
          }}>
            Original for Recipient<br />
            Duplicate for Supplier/Transporter<br />
            Triplicate for Supplier
          </td>
        </tr>

        <tr>
          <td colSpan={2} style={detailLabelStyle}>Invoice No.</td>
          <td style={{ ...detailValueStrongStyle, color: '#C53030', textAlign: 'center' }}>{safeText(invoiceData.invoiceNumber)}</td>
          <td colSpan={2} style={detailLabelStyle}>Transport Mode</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.transportMode)}</td>
          <td colSpan={2} style={detailLabelStyle}>Challan No.</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.challanNumber)}</td>
          <td colSpan={2} style={detailLabelStyle}>Sale Type</td>
          <td colSpan={2} style={saleTypeValueStyle}>{safeText(invoiceData.saleType)}</td>
        </tr>

        <tr>
          <td colSpan={2} style={detailLabelStyle}>Invoice Date</td>
          <td style={detailValueStrongStyle}>{safeText(invoiceData.invoiceDate)}</td>
          <td colSpan={2} style={detailLabelStyle}>Vehicle No.</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.vehicleNumber)}</td>
          <td colSpan={2} style={detailLabelStyle}>Transporter Name</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.transporterName)}</td>
          <td colSpan={2} style={detailLabelStyle}>Invoice Type</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.invoiceType)}</td>
        </tr>

        <tr>
          <td colSpan={2} style={detailLabelStyle}>State</td>
          <td style={detailValueStyle}>{safeText(invoiceData.companyState)}</td>
          <td colSpan={2} style={detailLabelStyle}>Date of Supply</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.dateOfSupply)}</td>
          <td colSpan={2} style={detailLabelStyle}>L.R Number</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.lrNumber)}</td>
          <td colSpan={2} style={detailLabelStyle}>Reverse Charge</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.reverseCharge)}</td>
        </tr>

        <tr>
          <td colSpan={2} style={detailLabelStyle}>State Code</td>
          <td style={detailValueStyle}>{safeText(invoiceData.companyStateCode)}</td>
          <td colSpan={2} style={detailLabelStyle}>Place of Supply</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.placeOfSupply)}</td>
          <td colSpan={2} style={detailLabelStyle}>P.O Number</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.poNumber)}</td>
          <td colSpan={2} style={detailLabelStyle}>E-Way Bill No.</td>
          <td colSpan={2} style={detailValueStyle}>{safeText(invoiceData.eWayBillNumber)}</td>
        </tr>

        <tr>
          <td colSpan={8} style={sectionHeaderStyle}>Details of Receiver (Billed To)</td>
          <td colSpan={7} style={sectionHeaderStyle}>Details of Consignee (Shipped To)</td>
        </tr>

        <tr>
          <td colSpan={2} style={detailLabelStyle}>Name:</td>
          <td colSpan={6} style={detailValueStyle}>{safeText(invoiceData.receiverName)}</td>
          <td colSpan={2} style={detailLabelStyle}>Name:</td>
          <td colSpan={5} style={detailValueStyle}>{safeText(invoiceData.consigneeName)}</td>
        </tr>

        <tr>
          <td colSpan={2} style={detailLabelStyle}>Address:</td>
          <td colSpan={6} style={detailValueStyle}>{safeText(invoiceData.receiverAddress)}</td>
          <td colSpan={2} style={detailLabelStyle}>Address:</td>
          <td colSpan={5} style={detailValueStyle}>{safeText(invoiceData.consigneeAddress)}</td>
        </tr>

        <tr>
          <td colSpan={2} style={detailLabelStyle}>GSTIN:</td>
          <td colSpan={6} style={detailValueStyle}>{safeText(invoiceData.receiverGSTIN)}</td>
          <td colSpan={2} style={detailLabelStyle}>GSTIN:</td>
          <td colSpan={5} style={detailValueStyle}>{safeText(invoiceData.consigneeGSTIN)}</td>
        </tr>

        <tr>
          <td colSpan={2} style={detailLabelStyle}>State:</td>
          <td colSpan={6} style={detailValueStyle}>{safeText(invoiceData.receiverState)} (Code: {safeText(invoiceData.receiverStateCode)})</td>
          <td colSpan={2} style={detailLabelStyle}>State:</td>
          <td colSpan={5} style={detailValueStyle}>{safeText(invoiceData.consigneeState)} (Code: {safeText(invoiceData.consigneeStateCode)})</td>
        </tr>

        <tr>
          <td rowSpan={2} style={itemHeaderCellStyle}>Sr. No.</td>
          <td rowSpan={2} style={itemHeaderCellStyle}>Description of Goods / Services</td>
          <td rowSpan={2} style={itemHeaderCellStyle}>HSN/SAC Code</td>
          <td rowSpan={2} style={itemHeaderCellStyle}>Qty</td>
          <td rowSpan={2} style={itemHeaderCellStyle}>UOM</td>
          <td rowSpan={2} style={itemHeaderCellStyle}>Rate (Rs.)</td>
          <td rowSpan={2} style={itemHeaderCellStyle}>Amount (Rs.)</td>
          <td rowSpan={2} style={itemHeaderCellStyle}>Taxable Value</td>
          <td colSpan={2} style={itemHeaderCellStyle}>CGST</td>
          <td colSpan={2} style={itemHeaderCellStyle}>SGST</td>
          <td colSpan={2} style={itemHeaderCellStyle}>IGST</td>
          <td rowSpan={2} style={itemHeaderCellStyle}>Total Amount</td>
        </tr>
        <tr>
          <td style={itemHeaderSubCellStyle}>Rate (%)</td>
          <td style={itemHeaderSubCellStyle}>Amount (Rs.)</td>
          <td style={itemHeaderSubCellStyle}>Rate (%)</td>
          <td style={itemHeaderSubCellStyle}>Amount (Rs.)</td>
          <td style={itemHeaderSubCellStyle}>Rate (%)</td>
          <td style={itemHeaderSubCellStyle}>Amount (Rs.)</td>
        </tr>

        {paddedItems.map((item, index) => {
          const rowBackground = index % 2 === 0 ? colors.itemRowOddBg : colors.itemRowEvenBg;
          const amount = computeAmount(item);

          return (
            <tr key={`item-row-${index}`} style={{ backgroundColor: rowBackground }}>
              <td style={centeredCellStyle}>{item ? index + 1 : ''}</td>
              <td style={baseCellStyle}>{safeText(item?.description ?? '', '')}</td>
              <td style={centeredCellStyle}>{safeText(item?.hsnCode ?? '', '')}</td>
              <td style={centeredCellStyle}>{item ? formatQuantity(item.quantity) : ''}</td>
              <td style={centeredCellStyle}>{safeText(item?.uom ?? '', '')}</td>
              <td style={rightAlignedCellStyle}>{formatAmount(item?.rate, { allowZero: true })}</td>
              <td style={rightAlignedCellStyle}>{formatAmount(amount, { allowZero: true })}</td>
              <td style={rightAlignedCellStyle}>{formatAmount(item?.taxableValue, { allowZero: true })}</td>
              <td style={centeredCellStyle}>{isInterState ? '—' : formatRate(item?.cgstRate, { allowZero: true })}</td>
              <td style={rightAlignedCellStyle}>{isInterState ? '—' : formatAmount(item?.cgstAmount, { allowZero: true })}</td>
              <td style={centeredCellStyle}>{isInterState ? '—' : formatRate(item?.sgstRate, { allowZero: true })}</td>
              <td style={rightAlignedCellStyle}>{isInterState ? '—' : formatAmount(item?.sgstAmount, { allowZero: true })}</td>
              <td style={centeredCellStyle}>{isInterState ? formatRate(item?.igstRate, { allowZero: true }) : '—'}</td>
              <td style={rightAlignedCellStyle}>{isInterState ? formatAmount(item?.igstAmount, { allowZero: true }) : '—'}</td>
              <td style={rightAlignedCellStyle}>{formatAmount(item?.totalAmount ?? (isInterState ? (amount ?? 0) + (item?.igstAmount ?? 0) : (amount ?? 0) + (item?.cgstAmount ?? 0) + (item?.sgstAmount ?? 0)), { allowZero: true })}</td>
            </tr>
          );
        })}

        <tr style={{ backgroundColor: colors.totalRowBg }}>
          <td colSpan={3} style={totalRowBaseStyle}>Total</td>
          <td style={totalRowBaseStyle}>{formatQuantity(totalQuantity)}</td>
          <td colSpan={2} style={{ ...totalRowBaseStyle, textAlign: 'right' }}>Sub Total:</td>
          <td style={{ ...totalRowBaseStyle, textAlign: 'right' }}>{formatAmount(totalAmountBeforeTax, { allowZero: true })}</td>
          <td style={{ ...totalRowBaseStyle, textAlign: 'right' }}>{formatAmount(totalTaxableValue, { allowZero: true })}</td>
          <td style={totalRowBaseStyle}>{isInterState ? '—' : formatRate(firstCgstRate, { allowZero: true })}</td>
          <td style={{ ...totalRowBaseStyle, textAlign: 'right' }}>{isInterState ? '—' : formatAmount(totalCGST, { allowZero: true })}</td>
          <td style={totalRowBaseStyle}>{isInterState ? '—' : formatRate(firstSgstRate, { allowZero: true })}</td>
          <td style={{ ...totalRowBaseStyle, textAlign: 'right' }}>{isInterState ? '—' : formatAmount(totalSGST, { allowZero: true })}</td>
          <td style={totalRowBaseStyle}>{isInterState ? formatRate(firstIgstRate, { allowZero: true }) : '—'}</td>
          <td style={{ ...totalRowBaseStyle, textAlign: 'right' }}>{isInterState ? formatAmount(totalIGST, { allowZero: true }) : '—'}</td>
          <td style={{ ...totalRowBaseStyle, textAlign: 'right' }}>{formatAmount(totalItemAmount || grandTotal, { allowZero: true })}</td>
        </tr>

        <tr>
          <td colSpan={10} style={amountHeaderStyle}>Amount Chargeable (in words)</td>
          <td colSpan={4} style={taxSummaryLabelStyle}>Taxable Value</td>
          <td style={taxSummaryValueStyle}>{formatAmount(totalTaxableValue, { allowZero: true })}</td>
        </tr>
        <tr>
          <td colSpan={10} rowSpan={2} style={{ ...amountBodyStyle, textAlign: 'left', padding: '8px 10px' }}>{amountWordsText}</td>
          <td colSpan={4} style={taxSummaryLabelStyle}>CGST</td>
          <td style={taxSummaryValueStyle}>{isInterState ? '0.00' : formatAmount(totalCGST, { allowZero: true })}</td>
        </tr>
        <tr>
          <td colSpan={4} style={taxSummaryLabelStyle}>SGST</td>
          <td style={taxSummaryValueStyle}>{isInterState ? '0.00' : formatAmount(totalSGST, { allowZero: true })}</td>
        </tr>
        <tr>
          <td colSpan={10} style={termsHeaderStyle}>Terms &amp; Conditions</td>
          <td colSpan={4} style={taxSummaryHighlightLabelStyle}>IGST</td>
          <td style={taxSummaryHighlightValueStyle}>{isInterState ? formatAmount(totalIGST, { allowZero: true }) : '0.00'}</td>
        </tr>
        <tr>
          <td colSpan={10} rowSpan={4} style={termsBodyStyle}>
            {displayTerms.map((line, index) => (
              <div key={`term-${index}`} style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>{index + 1}.</span> <span>{line}</span>
              </div>
            ))}
          </td>
          <td colSpan={4} style={taxSummaryLabelStyle}>CESS</td>
          <td style={taxSummaryValueStyle}>0.00</td>
        </tr>
        <tr>
          <td colSpan={4} style={taxSummaryLabelStyle}>Total Tax</td>
          <td style={taxSummaryValueStyle}>{formatAmount(totalTax, { allowZero: true })}</td>
        </tr>
        <tr>
          <td colSpan={4} rowSpan={2} style={{
            ...taxSummaryHighlightLabelStyle,
            textAlign: 'center',
            fontSize: '13px',
          }}>
            Total Amount After Tax
          </td>
          <td rowSpan={2} style={{
            ...taxSummaryHighlightValueStyle,
            fontSize: '13px',
            textAlign: 'center',
          }}>
            {formatAmount(grandTotal, { allowZero: true })}
          </td>
        </tr>
        <tr />

        <tr>
          <td colSpan={5} style={signatureHeaderCellStyle}>Transporter</td>
          <td colSpan={5} style={signatureHeaderCellStyle}>Receiver</td>
          <td colSpan={5} style={signatureHeaderCellStyle}>Acknowledgement</td>
        </tr>
        <tr>
          <td colSpan={5} rowSpan={2} style={signatureSubCellStyle}>Mobile No.: ___________________</td>
          <td colSpan={5} rowSpan={2} style={signatureSubCellStyle}>Mobile No.: ___________________</td>
          <td colSpan={5} rowSpan={2} style={{ ...signatureSubCellStyle, lineHeight: 1.4 }}>
            {acknowledgementLines.map((line, index) => (
              <div key={`ack-${index}`} style={{ marginBottom: '4px' }}>{line}</div>
            ))}
          </td>
        </tr>
        <tr />
        <tr>
          <td colSpan={5} rowSpan={3} style={signatureSpaceStyle} />
          <td colSpan={5} rowSpan={3} style={signatureSpaceStyle} />
          <td colSpan={5} rowSpan={3} style={signatureSpaceStyle} />
        </tr>
        <tr />
        <tr />
        <tr>
          <td colSpan={5} style={signatureFooterCellStyle}>Transporter&apos;s Signature</td>
          <td colSpan={5} style={signatureFooterCellStyle}>Receiver&apos;s Signature</td>
          <td colSpan={5} style={signatureFooterCellStyle}>Authorized Signatory</td>
        </tr>
        <tr>
          <td colSpan={TOTAL_COLUMNS} style={footerNoteStyle}>This is a computer generated invoice.</td>
        </tr>
      </tbody>
    </table>
  );
}
