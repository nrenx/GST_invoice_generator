/**
 * Invoice Form Constants
 * Contains all static values, options, and configuration used across invoice form components
 */

import { hsnCodes, hsnCodeMap, normalizeHsnCode, uomOptions, indianStates } from "@/data/hsnCodes";
import type { AutoCompleteOption } from "@/components/ui/auto-complete-input";

// ============================================
// REGEX PATTERNS
// ============================================
export const GSTIN_REGEX = /^[0-9A-Z]{15}$/i;
export const DATE_FORMAT_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

// ============================================
// DEFAULT VALUES
// ============================================
export const DEFAULT_UOM = uomOptions[0] ?? "MTS";
export const DEFAULT_HSN_CODE = normalizeHsnCode(hsnCodes[0]?.code ?? "4404");
export const DEFAULT_HSN_DETAILS = hsnCodeMap.get(DEFAULT_HSN_CODE);

export const TERMS_TEMPLATE = `1. This is an electronically generated invoice.
2. All disputes are subject to GUDUR jurisdiction only.
3. If the Consignee makes any Inter State Sale, he has to pay GST himself.
4. Goods once sold cannot be taken back or exchanged.
5. Payment terms as per agreement between buyer and seller.`;

// ============================================
// INPUT STYLING CLASSES
// ============================================
export const LOCKED_INPUT_CLASSES = "bg-muted/40 text-muted-foreground cursor-not-allowed";
export const COMPUTED_INPUT_CLASSES = "bg-muted/30 font-medium cursor-not-allowed";
export const COMPUTED_TOTAL_INPUT_CLASSES = "bg-muted font-semibold cursor-not-allowed";

// ============================================
// AUTOCOMPLETE OPTIONS
// ============================================

// Description suggestions from HSN codes
export const DESCRIPTION_OPTIONS = Array.from(new Set(hsnCodes.map((entry) => entry.description)))
  .filter((description): description is string => Boolean(description && description.trim()))
  .sort((a, b) => a.localeCompare(b));

export const DESCRIPTION_SUGGESTIONS: AutoCompleteOption[] = DESCRIPTION_OPTIONS.map((description) => ({
  value: description,
  label: description,
}));

// HSN Code options
export const HSN_CODE_OPTIONS: AutoCompleteOption[] = hsnCodes.map((hsn) => ({
  value: hsn.code,
  label: `${hsn.code} — ${hsn.description}`,
  keywords: [hsn.description, hsn.code],
}));

// UOM suggestions
export const UOM_SUGGESTIONS: AutoCompleteOption[] = uomOptions.map((unit) => ({ value: unit }));

// GSTIN suggestions
export const GSTIN_SUGGESTIONS: AutoCompleteOption[] = [{ value: "UNREGISTERED" }];

// State name options
export const STATE_NAME_OPTIONS: AutoCompleteOption[] = indianStates.map((state) => ({
  value: state.name,
  label: `${state.name} (${state.code})`,
  keywords: [state.code],
}));

// State code options
export const STATE_CODE_OPTIONS: AutoCompleteOption[] = indianStates.map((state) => ({
  value: state.code,
  label: `${state.code} — ${state.name}`,
  keywords: [state.name],
}));

// ============================================
// LOOKUP MAPS
// ============================================

export const normalizeStateName = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();
export const normalizeStateCodeValue = (value: string) => value.trim().toUpperCase();

export const STATE_NAME_LOOKUP = new Map(
  indianStates.map((state) => [normalizeStateName(state.name), state])
);

export const STATE_CODE_LOOKUP = new Map(
  indianStates.map((state) => [state.code, state])
);

// ============================================
// STORAGE KEYS
// ============================================
export const getFormStorageKey = (profileId: string) => `invoice-form-data-${profileId}`;
