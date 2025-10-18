# Invoice Events Module Refactoring

This folder contains the refactored VBA modules extracted from the core GST system for better organization and maintainability.

##  Module Organization

### 15_DataPopulation.bas
**Purpose:** Data population and validation setup
- `AutoPopulateInvoiceFields()` - Auto-populate invoice numbers, dates with manual override
- `SetupDataValidation()` - Setup dropdown validation for all form fields

### 16_WorksheetEventsSetup.bas  
**Purpose:** Worksheet event handling and change monitoring
- `SetupWorksheetChangeEvents()` - Enable automatic calculation and change monitoring
- `SetupStateCodeChangeEvents()` - State code change handling
- `HandleSaleTypeChange()` - Dynamic sale type change processing
- `RefreshSaleTypeDisplay()` - Manual refresh for sale type updates

### 17_TaxCalculationEngine.bas
**Purpose:** Core tax calculation logic and formulas
- `SetupTaxCalculationFormulas()` - Initial tax formula setup for item rows
- `UpdateMultiItemTaxCalculations()` - Sum calculations across all items and tax summary

### 18_DynamicTaxDisplay.bas
**Purpose:** Dynamic tax field display management
- `SetupDynamicTaxDisplay()` - Initialize dynamic tax display system
- `UpdateTaxFieldsDisplay()` - Switch between Interstate/Intrastate tax columns
- `RefreshTaxDisplayForCurrentSaleType()` - Manual refresh for current sale type

### 19_DataCleanup.bas
**Purpose:** Data cleanup and form reset operations
- `CleanEmptyProductRows()` - Remove empty/invalid product rows
- `ClearAllInvoiceData()` - Clear all invoice data while preserving structure
- `ResetInvoiceFormToDefaults()` - Reset entire form to default state
- `ClearCustomerDataOnly()` - Clear only customer/consignee data
- `ClearProductDataOnly()` - Clear only product data

## 🔧 Integration Notes

### Function Dependencies
All functions maintain their original dependencies and can be called from the main modules. The core modules (1-6) now contain stub functions that reference the moved implementations.

### Import Process
When importing the refactored system:
1. Import all core modules (1-6) first
2. Import all button modules (7-14) from the button/ folder
3. Import all invoice_events modules (15-19) from this folder
4. Modules can be imported individually as needed

### Cross-Module Communication
- Functions continue to work with the same worksheet references
- Error handling remains consistent across all modules
- Original function signatures are preserved for compatibility

##  Usage Examples

```vba
' Data Population
Call AutoPopulateInvoiceFields(ws)
Call SetupDataValidation(ws)

' Event Handling  
Call HandleSaleTypeChange(ws, changedRange)
Call RefreshSaleTypeDisplay()

' Tax Calculations
Call SetupTaxCalculationFormulas(ws)
Call UpdateMultiItemTaxCalculations(ws)

' Dynamic Display
Call UpdateTaxFieldsDisplay(ws, "Interstate")
Call RefreshTaxDisplayForCurrentSaleType()

' Data Cleanup
Call CleanEmptyProductRows(ws)
Call ClearAllInvoiceData(ws)
```

##  Benefits of Refactoring

1. **Better Organization**: Functions grouped by logical functionality
2. **Easier Maintenance**: Isolated modules for specific operations
3. **Reduced Complexity**: Smaller, focused modules instead of monolithic files
4. **Improved Readability**: Clear separation of concerns
5. **Flexible Import**: Import only needed modules for specific functionality

## [ok] Important Notes

- All original functionality is preserved
- Function signatures remain unchanged for compatibility
- Error handling and dependencies are maintained
- Core modules now contain reference notes to the moved functions
- This is purely an organizational refactoring - no functional changes
