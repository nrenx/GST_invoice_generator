# GST Tax Invoice System - Refactored VBA Modules

This directory contains the refactored VBA code for the GST Tax Invoice System. The original monolithic script has been broken down into six core modules plus eight button modules to improve readability, maintainability, and scalability.

---

## Import Order for Excel VBA

When importing into Excel VBA, follow this exact sequence:

### Core Modules (1-6):
1. `1_Main_Setup.bas`
2. `2_Module_InvoiceStructure.bas` 
3. `3_Module_Master.bas`
4. `4_Module_Warehouse.bas`
5. `5_Module_Utilities.bas`
6. `6_Module_Dropdowns.bas` (NEW - Centralized dropdown management)

### Button Modules (7-14):
7. `07_AddCustomerToWarehouseButton.bas`
8. `08_NewInvoiceButton.bas`
9. `09_SaveInvoiceButton.bas`
10. `10_PrintAsPDFButton.bas`
11. `11_PrintButton.bas`
12. `12_RefreshButton.bas`
13. `13_ButtonManagement.bas`
14. `14_PDFUtilities.bas`

### Invoice Events Modules (15-19):
15. `15_DataPopulation.bas`
16. `16_WorksheetEventsSetup.bas`
17. `17_TaxCalculationEngine.bas`
18. `18_DynamicTaxDisplay.bas`
19. `19_DataCleanup.bas`

### Run Setup:
- Execute `QuickSetup()` from Module 1 to initialize the complete system

---

### How to Use These Modules

*   **Open the VBA Editor**: In Excel, press `Alt + F11` to open the Visual Basic for Applications editor.
*   **Remove Old Code**: If you have the previous version of the code in a single module, it is recommended to remove it to avoid any potential conflicts.
*   **Import New Modules**:
    *   In the VBA Editor, right-click on the "Project Explorer" pane (usually on the left).
    *   Select **Import File...**.
    *   Navigate to this `modules` directory.
    *   Import each of the six `.bas` files one by one.

---

### How to Run the System

The main entry points for the system are located in the **`Main_Setup.bas`** module. To get started, you can run one of the following macros (`Alt + F8`):

*   **`QuickSetup()`**: The recommended macro for first-time use. It quickly creates all necessary worksheets (`GST_Tax_Invoice`, `Master`, `warehouse`).
*   **`StartGSTSystem()`**: This macro provides the complete setup, including worksheet creation and the configuration of all data validation rules and dropdowns.

---

## Module Features Breakdown

### 1. `Main_Setup.bas` (Main Module)

*   **Purpose**: The primary module for system initialization and user interaction.
*   **Features**:
    *   **System Initialization**: Provides `StartGSTSystem()` to run the complete setup, including data validation.
    *   **Quick Setup**: Offers `QuickSetup()` for a fast, minimal setup that creates the required sheets.
    *   **Minimal Setup**: Includes `StartGSTSystemMinimal()` for debugging purposes, which skips data validation setup.
    *   **Function Help**: Contains `ShowAvailableFunctions()` to display a message box with a list of all available user-facing functions.
    *   **Debugging & Testing**: Includes private routines (`DebugInitialization`, `TestGSTSystem`) to verify the integrity of the setup process.

### 2. `Module_InvoiceStructure.bas`

*   **Purpose**: Handles the creation, formatting, and layout of the main invoice worksheet.
*   **Features**:
    *   **Invoice Sheet Creation**: `CreateInvoiceSheet()` generates the entire invoice layout from scratch, including all headers, sections, and formatting.
    *   **Professional Formatting**: Applies professional styling, including fonts, colors, borders, and merged cells, to create a polished invoice look.
    *   **Dynamic Header Creation**: Uses a helper function `CreateHeaderRow()` to standardize the creation of header sections.
    *   **Auto-Population of Fields**: `AutoPopulateInvoiceFields()` automatically fills in the invoice number, current date, and date of supply.
    *   **Automatic Tax Formulas**: `SetupTaxCalculationFormulas()` sets up the Excel formulas for automatic calculation of item amounts, taxable values, and GST.
    *   **Multi-Item Tax Summary**: `UpdateMultiItemTaxCalculations()` updates the summary section to correctly sum up totals from multiple item rows.
    *   **Consignee Auto-Fill**: `AutoFillConsigneeFromReceiver()` automatically copies the receiver's details to the consignee section.

### 3. `Module_InvoiceEvents.bas`

*   **Purpose**: Contains all event handlers for the buttons on the invoice sheet, managing all user interactions.
*   **Features**:
    *   **Button Creation**: `CreateInvoiceButtons()` dynamically creates and places all interactive buttons on the invoice sheet.
    *   **Save Customer**: `AddCustomerToWarehouseButton()` saves the customer details from the invoice to the `warehouse` sheet.
    *   **Add New Item**: `AddNewItemRowButton()` allows the user to add a new row to the item table for multiple products.
    *   **New Invoice**: `NewInvoiceButton()` clears the current invoice data and generates a new, sequential invoice number.
    *   **Save Invoice**: `SaveInvoiceButton()` saves a complete record of the invoice to the `Master` sheet for auditing and record-keeping.
    *   **Export to PDF**: `PrintAsPDFButton()` exports the invoice as a two-page PDF (Original and Duplicate).
    *   **Print Invoice**: `PrintButton()` first saves the invoice as a PDF and then sends it to the default printer.

### 4. `Module_Warehouse.bas`

*   **Purpose**: Manages all data-related operations for the `warehouse` sheet.
*   **Features**:
    *   **Warehouse Sheet Creation**: `CreateWarehouseSheet()` generates the `warehouse` sheet and populates it with sample data for HSN codes, UOM, transport modes, states, and customers.
    *   **Data Validation Setup**: `SetupDataValidation()` configures all dropdown lists on the invoice sheet, ensuring they are populated from the `warehouse` sheet.
    *   **Customer Dropdown**: `SetupCustomerDropdown()` specifically sets up the customer selection dropdowns.
    *   **HSN Dropdown**: `SetupHSNDropdown()` sets up the HSN code dropdown for each item row.

### 5. `Module_Master.bas`

*   **Purpose**: Responsible for all operations related to the `Master` sheet, which stores invoice records.
*   **Features**:
    *   **Master Sheet Creation**: `CreateMasterSheet()` generates the `Master` sheet with a comprehensive set of headers for GST-compliant record-keeping.
    *   **Automatic Invoice Numbering**: `GetNextInvoiceNumber()` generates a new, sequential invoice number based on the current year and the last invoice number in the `Master` sheet.
    *   **Invoice Counter Reset**: `ResetInvoiceCounter()` provides a way to clear all invoice records from the `Master` sheet, effectively resetting the invoice counter.

### 6. `Module_Utilities.bas`

*   **Purpose**: A collection of shared helper functions used by other modules.
*   **Features**:
    *   **Worksheet Management**: Includes `WorksheetExists()` and `GetOrCreateWorksheet()` to safely handle worksheet operations.
    *   **Number to Words Conversion**: `NumberToWords()` converts the final invoice amount into its word representation.
    *   **Text Cleaning**: `CleanText()` removes problematic characters from strings to prevent errors.
    *   **Validation Verification**: `VerifyValidationSettings()` is a utility to check and confirm that all data validation rules allow for manual override.