import { TemplateTheme, TemplateOptions } from '@/types/invoice';

type ThemedTemplate = 'standard' | 'professional';

export const DEFAULT_THEMES: Record<ThemedTemplate, TemplateTheme> = {
  standard: {
    primaryColor: '#2F5061',
    secondaryColor: '#4A5568',
    accentColor: '#FFF200',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    headerFontSize: '22px',
    bodyFontSize: '11px',
    borderStyle: '1px solid #000000'
  },
  professional: {
    primaryColor: '#1a365d',
    secondaryColor: '#2d3748',
    accentColor: '#d4af37',
    fontFamily: "'Georgia', 'Times New Roman', serif",
    headerFontSize: '22px',
    bodyFontSize: '11px',
    borderStyle: '2px solid #1a365d'
  }
};

export const DEFAULT_OPTIONS: TemplateOptions = {
  showLogo: false,
  showBankDetails: true,
  showQRCode: false,
  showSignature: true,
  showTerms: true,
  showTransportDetails: true,
  compactMode: false,
  colorScheme: 'default'
};

/**
 * Get theme for a specific template type
 * @param templateType - The template type
 * @returns Theme configuration
 */
export function getTemplateTheme(templateType: ThemedTemplate): TemplateTheme {
  return DEFAULT_THEMES[templateType] || DEFAULT_THEMES.standard;
}

/**
 * Validate theme colors are valid hex codes
 * @param theme - Theme to validate
 * @returns true if valid
 */
export function validateTheme(theme: TemplateTheme): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  return (
    hexColorRegex.test(theme.primaryColor) &&
    hexColorRegex.test(theme.secondaryColor) &&
    hexColorRegex.test(theme.accentColor)
  );
}
