import React from 'react';
import { InvoiceData } from '../types/invoice';

interface CompactVBATableProps {
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

export const CompactVBATable = ({ invoiceData, pageType, totalTaxableValue, totalCGST, totalSGST, totalIGST, totalTax, grandTotal, amountInWords }: CompactVBATableProps) => {
  // VBA Colors - Exact match
  const colors = {
    headerBg: '#2F5061',
    headerText: '#FFFFFF',
    companyInfoBg: '#F5F5F5',
    taxInvoiceBg: '#F0F0F0',
    fieldLabelBg: '#F5F5F5',
    itemHeaderBg: '#E6E6E6',
    amountInWordsBg: '#FFFF00',
    totalAfterTaxBg: '#FFD700',
    signatureLabelBg: '#D3D3D3',
    termsHeaderBg: '#FFFF00'
  };

  return (
    <table style={{ 
      width: '100%', 
      border: '2px solid black', 
      borderCollapse: 'collapse',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: '10px'
    }}>
      <tbody>
        {/* Row 1: ORIGINAL/DUPLICATE */}
        <tr style={{ height: '18px' }}>
          <td colSpan={15} style={{ backgroundColor: colors.headerBg, color: colors.headerText, textAlign: 'center', fontWeight: 'bold', fontSize: '12px', border: '1px solid black', padding: '2px' }}>
            {pageType}
          </td>
        </tr>

        {/* Row 2: Company Name */}
        <tr style={{ height: '30px' }}>
          <td colSpan={15} style={{ backgroundColor: colors.headerBg, color: colors.headerText, textAlign: 'center', fontWeight: 'bold', fontSize: '20px', border: '1px solid black', padding: '4px' }}>
            {invoiceData.companyName}
          </td>
        </tr>

        {/* Row 3-5: Company Details */}
        <tr style={{ height: '18px' }}>
          <td colSpan={15} style={{ backgroundColor: colors.companyInfoBg, textAlign: 'center', fontSize: '10px', border: '1px solid black', padding: '2px' }}>
            {invoiceData.companyAddress}
          </td>
        </tr>
        <tr style={{ height: '18px' }}>
          <td colSpan={15} style={{ backgroundColor: colors.companyInfoBg, textAlign: 'center', fontSize: '10px', border: '1px solid black', padding: '2px' }}>
            GSTIN: {invoiceData.companyGSTIN} | Email: {invoiceData.companyEmail}
          </td>
        </tr>

        {/* Row 6: TAX-INVOICE */}
        <tr style={{ height: '25px' }}>
          <td colSpan={10} style={{ backgroundColor: colors.taxInvoiceBg, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '1px solid black', padding: '2px' }}>
            TAX-INVOICE
          </td>
          <td colSpan={5} style={{ backgroundColor: colors.taxInvoiceBg, textAlign: 'center', fontSize: '8px', border: '1px solid black', padding: '2px' }}>
            Original for Recipient<br/>Duplicate for Supplier/Transporter
          </td>
        </tr>

        {/* Rows 7-10: Invoice Details - Readable */}
        <tr style={{ height: '16px' }}>
          <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>Invoice No.</td>
          <td colSpan={2} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.invoiceNumber}</td>
          <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>Invoice Date</td>
          <td colSpan={2} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.invoiceDate}</td>
          <td colSpan={2} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>Sale Type</td>
          <td colSpan={5} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.saleType}</td>
        </tr>

        {/* Rows 11-14: Party Details - Readable */}
        <tr style={{ height: '20px' }}>
          <td colSpan={8} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px', textAlign: 'center' }}>
            Details of Receiver (Billed to)
          </td>
          <td colSpan={7} style={{ backgroundColor: colors.fieldLabelBg, fontWeight: 'bold', fontSize: '11px', border: '1px solid black', padding: '2px', textAlign: 'center' }}>
            Details of Consignee (Shipped to)
          </td>
        </tr>
        <tr style={{ height: '16px' }}>
          <td colSpan={1} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>Name:</td>
          <td colSpan={7} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.receiverName}</td>
          <td colSpan={1} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>Name:</td>
          <td colSpan={6} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.consigneeName}</td>
        </tr>
        <tr style={{ height: '16px' }}>
          <td colSpan={1} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>Address:</td>
          <td colSpan={7} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.receiverAddress}</td>
          <td colSpan={1} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>Address:</td>
          <td colSpan={6} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.consigneeAddress}</td>
        </tr>
        <tr style={{ height: '16px' }}>
          <td colSpan={1} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>GSTIN:</td>
          <td colSpan={7} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.receiverGSTIN}</td>
          <td colSpan={1} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>GSTIN:</td>
          <td colSpan={6} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>{invoiceData.consigneeGSTIN}</td>
        </tr>

        {/* Row 17-18: Item Headers - Readable */}
        <tr style={{ height: '20px' }}>
          <td style={{ backgroundColor: colors.itemHeaderBg, fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>Sl</td>
          <td colSpan={5} style={{ backgroundColor: colors.itemHeaderBg, fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>Description</td>
          <td style={{ backgroundColor: colors.itemHeaderBg, fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>HSN</td>
          <td style={{ backgroundColor: colors.itemHeaderBg, fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>Qty</td>
          <td style={{ backgroundColor: colors.itemHeaderBg, fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>UOM</td>
          <td style={{ backgroundColor: colors.itemHeaderBg, fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>Rate</td>
          <td style={{ backgroundColor: colors.itemHeaderBg, fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>Amount</td>
          <td style={{ backgroundColor: colors.itemHeaderBg, fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>Taxable</td>
          <td colSpan={2} style={{ backgroundColor: colors.itemHeaderBg, fontSize: '8px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>
            {invoiceData.saleType === 'Interstate' ? 'IGST' : 'CGST'}
          </td>
          <td style={{ backgroundColor: colors.itemHeaderBg, fontSize: '8px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>
            {invoiceData.saleType === 'Interstate' ? 'Not Applicable' : 'SGST'}
          </td>
        </tr>

        {/* Row 19-24: Item Data - 6 rows for items */}
        {[...Array(6)].map((_, index) => {
          const item = invoiceData.items[index];
          return (
            <tr key={index} style={{ height: '16px' }}>
              <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>
                {item ? index + 1 : ''}
              </td>
              <td colSpan={5} style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}>
                {item?.description || ''}
              </td>
              <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>
                {item?.hsnCode || ''}
              </td>
              <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>
                {item?.quantity || ''}
              </td>
              <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>
                {item?.uom || ''}
              </td>
              <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'right' }}>
                {item?.rate ? item.rate.toFixed(2) : ''}
              </td>
              <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'right' }}>
                {item ? (item.quantity * item.rate).toFixed(2) : ''}
              </td>
              <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'right' }}>
                {item ? (item.quantity * item.rate).toFixed(2) : ''}
              </td>
              <td colSpan={2} style={{ fontSize: '8px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>
                {item && invoiceData.saleType === 'Interstate' ? `18% | ${((item.quantity * item.rate) * 0.18).toFixed(2)}` : 
                 item && invoiceData.saleType !== 'Interstate' ? `9% | ${((item.quantity * item.rate) * 0.09).toFixed(2)}` : ''}
              </td>
              <td style={{ fontSize: '8px', border: '1px solid black', padding: '1px', textAlign: 'center' }}>
                {item && invoiceData.saleType !== 'Interstate' ? `9% | ${((item.quantity * item.rate) * 0.09).toFixed(2)}` : 'Not Applicable'}
              </td>
            </tr>
          );
        })}

        {/* Row 25: Total */}
        <tr style={{ height: '18px' }}>
          <td style={{ fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>Total</td>
          <td colSpan={5} style={{ fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>Sub Total</td>
          <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}></td>
          <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}></td>
          <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}></td>
          <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px' }}></td>
          <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'right', fontWeight: 'bold' }}>{totalTaxableValue.toFixed(2)}</td>
          <td style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'right', fontWeight: 'bold' }}>{totalTaxableValue.toFixed(2)}</td>
          <td colSpan={2} style={{ fontSize: '8px', border: '1px solid black', padding: '1px', textAlign: 'right', fontWeight: 'bold' }}>
            {invoiceData.saleType === 'Interstate' ? totalIGST.toFixed(2) : totalCGST.toFixed(2)}
          </td>
          <td style={{ fontSize: '8px', border: '1px solid black', padding: '1px', textAlign: 'right', fontWeight: 'bold' }}>
            {invoiceData.saleType === 'Interstate' ? '0.00' : totalSGST.toFixed(2)}
          </td>
        </tr>

        {/* Row 26: Amount in Words */}
        <tr style={{ height: '22px' }}>
          <td colSpan={8} style={{ backgroundColor: colors.amountInWordsBg, fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>
            Total Invoice Amount in Words
          </td>
          <td colSpan={3} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>
            Total Amount Before Tax:
          </td>
          <td colSpan={4} style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'right' }}>
            {totalTaxableValue.toFixed(2)}
          </td>
        </tr>

        <tr style={{ height: '22px' }}>
          <td colSpan={8} style={{ backgroundColor: '#FFFFE6', fontSize: '9px', border: '1px solid black', padding: '2px', fontWeight: 'bold' }}>
            {amountInWords}
          </td>
          <td colSpan={3} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>
            {invoiceData.saleType === 'Interstate' ? 'IGST:' : 'CGST:'}
          </td>
          <td colSpan={4} style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'right' }}>
            {invoiceData.saleType === 'Interstate' ? totalIGST.toFixed(2) : totalCGST.toFixed(2)}
          </td>
        </tr>

        {invoiceData.saleType !== 'Interstate' && (
          <tr style={{ height: '18px' }}>
            <td colSpan={8} style={{ backgroundColor: colors.termsHeaderBg, fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>
              Terms and Conditions
            </td>
            <td colSpan={3} style={{ backgroundColor: colors.fieldLabelBg, fontSize: '9px', border: '1px solid black', padding: '1px' }}>
              SGST:
            </td>
            <td colSpan={4} style={{ fontSize: '9px', border: '1px solid black', padding: '1px', textAlign: 'right' }}>
              {totalSGST.toFixed(2)}
            </td>
          </tr>
        )}

        <tr style={{ height: '22px' }}>
          <td colSpan={8} style={{ backgroundColor: '#FFFFF5', fontSize: '8px', border: '1px solid black', padding: '2px' }}>
            1) This is an electronically generated invoice.<br/>
            2) All disputes are subject to GUDUR jurisdiction only.<br/>
            3) Goods once sold cannot be taken back.
          </td>
          <td colSpan={3} style={{ backgroundColor: colors.totalAfterTaxBg, fontSize: '10px', border: '1px solid black', padding: '2px', fontWeight: 'bold', textAlign: 'center' }}>
            Total Amount After Tax:
          </td>
          <td colSpan={4} style={{ backgroundColor: colors.totalAfterTaxBg, fontSize: '10px', border: '1px solid black', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>
            {grandTotal.toFixed(2)}
          </td>
        </tr>

        {/* Row 37-40: Signature Section - Readable */}
        <tr style={{ height: '30px' }}>
          <td colSpan={5} style={{ fontSize: '9px', border: '1px solid black', padding: '2px' }}></td>
          <td colSpan={5} style={{ fontSize: '9px', border: '1px solid black', padding: '2px' }}></td>
          <td colSpan={5} style={{ backgroundColor: '#FAFAFA', fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'right' }}>
            Certified that the particulars given above are true and correct
          </td>
        </tr>
        <tr style={{ height: '22px' }}>
          <td colSpan={5} style={{ backgroundColor: colors.signatureLabelBg, fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>
            Transporter's Signature
          </td>
          <td colSpan={5} style={{ backgroundColor: colors.signatureLabelBg, fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>
            Receiver's Signature
          </td>
          <td colSpan={5} style={{ backgroundColor: colors.signatureLabelBg, fontSize: '9px', border: '1px solid black', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>
            Authorized Signatory
          </td>
        </tr>
      </tbody>
    </table>
  );
};