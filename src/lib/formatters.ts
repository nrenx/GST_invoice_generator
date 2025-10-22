/**
 * Format a number as currency with Indian locale
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: {
    locale?: string;
    currency?: string;
    showSymbol?: boolean;
    allowZero?: boolean;
  } = {}
): string {
  const {
    locale = 'en-IN',
    currency = 'INR',
    showSymbol = true,
    allowZero = true
  } = options;
  
  if (!allowZero && amount === 0) return '';
  
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Format quantity with specified decimal places
 * @param quantity - The quantity to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted quantity string
 */
export function formatQuantity(quantity: number, decimals: number = 2): string {
  return quantity.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format percentage rate
 * @param rate - The rate to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(rate: number, decimals: number = 2): string {
  if (rate === 0) return '0%';
  
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Format date string
 * @param dateString - Date string to format
 * @param format - Desired format (default: DD/MM/YYYY)
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'DD/MM/YYYY'
): string {
  if (!dateString) return '';
  
  // If already in desired format, return as is
  if (dateString.includes('/')) {
    return dateString;
  }
  
  // Parse ISO date or other formats
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return format === 'DD/MM/YYYY' ? `${day}/${month}/${year}` : `${month}/${day}/${year}`;
}

/**
 * Convert number to words (Indian numbering system)
 * @param amount - The amount to convert
 * @param currency - Currency type (default: INR)
 * @returns Amount in words
 */
export function numberToWords(amount: number, currency: 'INR' | 'USD' = 'INR'): string {
  if (amount === 0) return 'Zero Only';
  
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  }
  
  function convertToWords(n: number): string {
    if (n === 0) return '';
    
    // Crore (10,000,000)
    if (n >= 10000000) {
      return convertToWords(Math.floor(n / 10000000)) + ' Crore ' + convertToWords(n % 10000000);
    }
    
    // Lakh (100,000)
    if (n >= 100000) {
      return convertToWords(Math.floor(n / 100000)) + ' Lakh ' + convertToWords(n % 100000);
    }
    
    // Thousand
    if (n >= 1000) {
      return convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ' + convertToWords(n % 1000);
    }
    
    return convertLessThanThousand(n);
  }
  
  // Split into rupees and paise
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = '';
  
  if (rupees > 0) {
    result += convertToWords(rupees).trim();
    result += currency === 'INR' ? ' Rupees' : ' Dollars';
  }
  
  if (paise > 0) {
    if (rupees > 0) result += ' and ';
    result += convertToWords(paise).trim();
    result += currency === 'INR' ? ' Paise' : ' Cents';
  }
  
  result += ' Only';
  
  return result.trim();
}

/**
 * Safe text formatter - returns text or fallback
 * @param text - Text to display
 * @param fallback - Fallback value if text is empty
 * @returns Formatted text
 */
export function safeText(text: string | undefined | null, fallback: string = '---'): string {
  if (!text || text.trim() === '') return fallback;
  return text;
}
