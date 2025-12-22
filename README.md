# GST Invoice Flow

React application for generating GST-compliant tax invoices from profile-aware company data. The app streamlines invoice capture, renders professional templates, and exports polished PDFs that are ready to share with customers.

## Features

- Profile management stored in browser localStorage, including company GSTIN, address, and default terms.
- Guided invoice form with Zod-powered validation, GSTIN helpers, automatic sale type detection, and HSN-based tax calculations.
- Real-time preview powered by reusable HTML templates (`public/templates/invoices`) with original and duplicate copies.
- One-click PDF export using `html2pdf.js`, including combined multi-page output with preserved styling.
- Template selector, profile switcher, and toast-driven notifications for smooth user feedback.
- Persistent draft invoices, so partially completed forms survive page reloads.

## Tech Stack

- React 18 + TypeScript
- Vite build tooling
- Tailwind CSS with shadcn/ui components
- React Hook Form + Zod for form handling and validation
- html2pdf.js for client-side PDF generation

## Getting Started

### Prerequisites

- Node.js 18+ (or any runtime supported by Vite 5)
- npm, pnpm, or bun (project includes a `bun.lockb` for users who prefer Bun)

### Installation

```sh
git clone <repo-url>
cd excel2web-invoice-flow
npm install            # or pnpm install / bun install
```

### Local Development

```sh
npm run dev            # starts Vite dev server on http://localhost:5173
```

### Production Build

```sh
npm run build          # outputs production assets to dist/
npm run preview        # serves the build locally for smoke testing
```

### Linting

```sh
npm run lint
```

## Project Structure

```
src/
	pages/               Route-level components (invoice form, preview, profiles)
	components/          Reusable UI and domain components
	  invoice-form/      Modular invoice form components
	lib/                 PDF generation and template utilities
	data/                HSN codes, transport modes, state codes
	hooks/               Profile persistence and responsive helpers
	types/               Shared TypeScript definitions
public/templates/      HTML invoice templates injected with runtime data
server/                (Optional) backend helpers for future expansion
```

### Invoice Form Components

The invoice form is organized into focused, maintainable modules:

```
src/components/invoice-form/
├── index.ts                    # Main exports
├── constants.ts                # All static values, regex, options
├── types.ts                    # Zod schemas, TypeScript types
├── utils.ts                    # Helper functions, formatters, calculations
├── InvoiceForm.tsx             # Main orchestrator component
└── sections/
    ├── index.ts                # Section exports
    ├── CompanyDetailsSection.tsx
    ├── InvoiceMetadataSection.tsx
    ├── TransportDetailsSection.tsx
    ├── ReceiverDetailsSection.tsx
    ├── ConsigneeDetailsSection.tsx
    ├── InvoiceItemsSection.tsx
    ├── TermsAndConditionsSection.tsx
    └── FormActionButtons.tsx
```

| File | Purpose |
|------|---------|
| `constants.ts` | GSTIN regex, HSN options, state lookups, CSS classes |
| `types.ts` | Zod validation schemas, form data types |
| `utils.ts` | Date formatters, currency formatter, tax calculations |
| `InvoiceForm.tsx` | Connects all sections, manages form state |
| `CompanyDetailsSection` | Shows company name, GSTIN, address (locked from profile) |
| `InvoiceMetadataSection` | Invoice number, dates, sale type selector |
| `TransportDetailsSection` | Vehicle, transporter, e-way bill fields |
| `ReceiverDetailsSection` | Customer billing info with state autocomplete |
| `ConsigneeDetailsSection` | Shipping info with "Copy from Receiver" button |
| `InvoiceItemsSection` | Add/remove items with HSN lookup and tax calculations |
| `TermsAndConditionsSection` | Editable terms textarea |
| `FormActionButtons` | New Invoice (clear) and Preview buttons |

## Customization Guide

- **Invoice templates**: edit the HTML files in `public/templates/invoices` or add new ones and register them in `src/lib/templateLoader.ts`.
- **HSN codes and tax rates**: adjust data in `src/data/hsnCodes.ts` to match your product catalog and GST slabs.
- **Default profiles**: seed profiles via `DEFAULT_PROFILES` in `src/types/profile.ts` or manage them in-app via the profile management screen.
- **Terms and conditions**: defaults live alongside profiles; users can override them per profile and per invoice.

## Persistence & Storage

All state is stored client-side using browser localStorage:

- `invoice-profiles` holds the managed profiles.
- `selected-profile-id` tracks the active company profile.
- `invoice-form-data-<profileId>` stores draft invoice data per profile.

Clear site data from your browser to reset the app or provide a fresh onboarding experience.

## Deployment

Build static assets with `npm run build` and serve the contents of `dist/` on any static host (Vercel, Netlify, S3, etc.). No server-side rendering is required.
