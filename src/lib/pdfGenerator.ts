import html2pdf from 'html2pdf.js';

export interface PDFOptions {
  filename: string;
  html: string;
}

export const generateAndDownloadPDF = async ({ filename, html }: PDFOptions): Promise<void> => {
  const options = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg' as const, quality: 1 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm' as const, 
      format: 'a4' as const, 
      orientation: 'portrait' as const,
      compress: true
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(options).from(html).save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
};