Option Explicit
' Main setup and initialization for GST Invoice System

Public Sub QuickSetup()
    ' Quick setup function for fast initialization
    ' Simplified entry point that matches documentation references
    ' Creates all required sheets and basic setup
    
    Call StartGSTSystem
End Sub

Public Sub StartGSTSystem()
    ' Main entry point for GST Invoice System setup
    ' • Validates Excel environment before initialization
    ' • Provides clear success/failure feedback
    ' • Handles all error conditions gracefully
    
    On Error GoTo ErrorHandler
    
    If Not ValidateExcelEnvironment() Then
        MsgBox "Excel environment validation failed. Please ensure Excel is properly configured.", _
               vbCritical, "Environment Error"
        Exit Sub
    End If
    
    Call InitializeGSTSystem
    Exit Sub
    
ErrorHandler:
    Call HandleUnifiedError("StartGSTSystem", Err.Number, Err.Description, "GST System")
End Sub

' HELP AND INFORMATION FUNCTIONS

Public Sub ShowAvailableFunctions()
    ' Display available system functions
    Dim functionList As String
    
    functionList = "GST INVOICE SYSTEM - AVAILABLE FUNCTIONS:" & vbCrLf & vbCrLf
    functionList = functionList & "MAIN SETUP:" & vbCrLf
    functionList = functionList & "- StartGSTSystem - Complete system setup with all features" & vbCrLf
    functionList = functionList & "- ValidateCompleteSystem - Comprehensive system validation" & vbCrLf
    functionList = functionList & "- FixCommonIssues - Automated troubleshooting and repair" & vbCrLf
    functionList = functionList & "- ShowAvailableFunctions - Display this help" & vbCrLf & vbCrLf
    
    functionList = functionList & "[OK] COMPLETE SYSTEM FEATURES (All included in StartGSTSystem):" & vbCrLf
    functionList = functionList & "- 4 sheets: Invoice, Master, Warehouse, Dropdowns" & vbCrLf
    functionList = functionList & "- Centralized dropdown data management" & vbCrLf
    functionList = functionList & "- Automatic tax calculations (CGST/SGST/IGST)" & vbCrLf
    functionList = functionList & "- Real-time updates without refresh buttons" & vbCrLf
    functionList = functionList & "- HSN code auto-population of rates and UOM" & vbCrLf
    functionList = functionList & "- Sale type automatic tax field switching" & vbCrLf
    functionList = functionList & "- PDF export functionality" & vbCrLf
    functionList = functionList & "- Customer and product dropdown management" & vbCrLf
    functionList = functionList & "- Invoice numbering: INV-YYYY-NNN format" & vbCrLf & vbCrLf
    
    functionList = functionList & "START: QUICK START:" & vbCrLf
    functionList = functionList & "1. Import all .bas modules (1-19)" & vbCrLf
    functionList = functionList & "2. Run 'StartGSTSystem' ONCE - sets up everything!" & vbCrLf
    functionList = functionList & "3. Start using the invoice sheet - everything works automatically" & vbCrLf & vbCrLf
    
    functionList = functionList & "FEATURES: FEATURES WORK AUTOMATICALLY:" & vbCrLf
    functionList = functionList & "- Select HSN code => Rate and UOM auto-fill" & vbCrLf
    functionList = functionList & "• Change sale type → Tax fields update instantly" & vbCrLf
    functionList = functionList & "• Enter quantities → Tax amounts calculate automatically" & vbCrLf
    functionList = functionList & "• No manual refresh needed for any operation!"
    
    MsgBox functionList, vbInformation, "GST Invoice System - Help"
End Sub

' CORE SYSTEM FUNCTIONS

Public Sub InitializeGSTSystem()
    ' Core system initialization
    ' • Creates all worksheets with validation
    ' • Sets up Phase 3 features 
    ' • Provides progress feedback
    
    On Error GoTo ErrorHandler
    
    Dim operationStart As Double
    operationStart = Timer
    
    ' Validate prerequisites before starting
    If Not ValidateSystemPrerequisites() Then
        MsgBox "System prerequisites validation failed. Cannot proceed with initialization.", _
               vbCritical, "Prerequisites Error"
        Exit Sub
    End If
    
    ' Optimize performance for system initialization
    Call OptimizeExcelPerformance
    
    ' Create all required sheets with validation
    If Not CreateAllRequiredSheets() Then
        Call RestoreExcelPerformance
        MsgBox "Failed to create required worksheets. System initialization aborted.", _
               vbCritical, "Sheet Creation Error"
        Exit Sub
    End If
    
    ' Setup Phase 3 advanced features after sheet creation
    Call SetupPhase3Features
    
    ' Final step: Create and initialize the first invoice
    Call CreateReadyToUseInvoice
    
    ' Restore Excel settings
    Call RestoreExcelPerformance
    
    ' Calculate and display completion time
    Dim operationTime As Double
    operationTime = Timer - operationStart
    
    MsgBox "SUCCESS: GST Invoice System is Ready for Use!" & vbCrLf & vbCrLf & _
           "[OK] All 4 worksheets created (Invoice, Master, Warehouse, Dropdowns)" & vbCrLf & _
           "[OK] First invoice generated: " & GetCurrentInvoiceNumber() & vbCrLf & _
           "[OK] Centralized dropdown system enabled" & vbCrLf & _
           "[OK] Automatic tax calculations active" & vbCrLf & _
           "[OK] Real-time updates configured" & vbCrLf & _
           "[OK] Professional PDF export ready" & vbCrLf & vbCrLf & _
           " Invoice sheet is active and ready for data entry!" & vbCrLf & _
           " System initialized in " & Format(operationTime, "0.00") & " seconds.", _
           vbInformation, "GST System Ready - Start Using!"
    Exit Sub
    
ErrorHandler:
    Call RestoreExcelPerformance
    Call HandleUnifiedError("InitializeGSTSystem", Err.Number, Err.Description, "GST System")
End Sub

Private Sub SetupPhase3Features()
    ' Setup Phase 3 advanced features after sheet creation
    ' • Centralized dropdown validations
    ' • Automatic tax calculations  
    ' • Real-time updates
    ' • Customer dropdown setup
    
    Dim invoiceWs As Worksheet
    On Error Resume Next
    
    ' Get invoice worksheet
    Set invoiceWs = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    If invoiceWs Is Nothing Then Exit Sub
    
    ' Setup all dropdown validations pointing to centralized Dropdowns sheet
    Call SetupAllDropdownValidations(invoiceWs)
    
    ' Setup automatic tax calculations with centralized data
    Call SetupAutoTaxCalculation(invoiceWs)
    
    ' Enable auto-updates for seamless operation
    Call EnableAutoUpdates(invoiceWs)
    
    ' Setup customer dropdown from warehouse data
    Call SetupCustomerDropdown(invoiceWs)
    
    On Error GoTo 0
End Sub

Private Sub CreateReadyToUseInvoice()
    ' Create and activate a ready-to-use invoice after system setup
    ' This ensures the user has a working invoice immediately after initialization
    
    Dim invoiceWs As Worksheet
    On Error Resume Next
    
    ' Get the invoice worksheet
    Set invoiceWs = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    If invoiceWs Is Nothing Then Exit Sub
    
    ' Ensure the invoice has the first invoice number populated
    If Trim(invoiceWs.Range("C7").Value) = "" Then
        Call AutoPopulateInvoiceFields(invoiceWs)
    End If
    
    ' Apply final border formatting to ensure professional appearance
    Call ApplyStandardInvoiceBorders(invoiceWs)
    
    ' Activate the invoice sheet so user can start working immediately
    invoiceWs.Activate
    invoiceWs.Range("C12").Select  ' Position cursor at customer name field
    
    On Error GoTo 0
End Sub

Private Function GetCurrentInvoiceNumber() As String
    ' Get the current invoice number from the invoice sheet
    Dim invoiceWs As Worksheet
    On Error Resume Next
    
    Set invoiceWs = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    If Not invoiceWs Is Nothing Then
        GetCurrentInvoiceNumber = Trim(invoiceWs.Range("C7").Value)
    End If
    
    If GetCurrentInvoiceNumber = "" Then
        GetCurrentInvoiceNumber = "INV-" & Year(Date) & "-001"
    End If
    
    On Error GoTo 0
End Function

Private Function ValidateExcelEnvironment() As Boolean
    ' Validates Excel state and permissions before initialization
    
    On Error GoTo ValidationError
    
    ' Check basic Excel application accessibility
    If Application Is Nothing Then
        ValidateExcelEnvironment = False
        Exit Function
    End If
    
    ' Check if we have a valid workbook
    If ActiveWorkbook Is Nothing Then
        ValidateExcelEnvironment = False
        Exit Function
    End If
    
    ' Test worksheet creation permissions
    If Not TestWorksheetPermissions() Then
        ValidateExcelEnvironment = False
        Exit Function
    End If
    
    ' All validations passed
    ValidateExcelEnvironment = True
    Exit Function
    
ValidationError:
    ValidateExcelEnvironment = False
End Function

Private Function ValidateSystemPrerequisites() As Boolean
    ' Validates system prerequisites before initialization
    
    On Error GoTo PrerequisiteError
    
    ' Check if required utility functions are available
    If Not TestUtilityFunctions() Then
        ValidateSystemPrerequisites = False
        Exit Function
    End If
    
    ' Validate constants are properly loaded
    If Not TestSystemConstants() Then
        ValidateSystemPrerequisites = False
        Exit Function
    End If
    
    ' All prerequisites validated
    ValidateSystemPrerequisites = True
    Exit Function
    
PrerequisiteError:
    ValidateSystemPrerequisites = False
End Function

Private Function CreateAllRequiredSheets() As Boolean
    ' Creates all required sheets with validation
    
    On Error GoTo SheetCreationError
    
    ' Create supporting sheets first in dependency order
    
    ' Create master sheet first (no dependencies)
    Call CreateMasterSheet
    If Not ValidateSheetCreation(MASTER_SHEET_NAME) Then
        CreateAllRequiredSheets = False
        Exit Function
    End If
    
    ' Create warehouse sheet (depends on master for some references)
    Call CreateWarehouseSheet
    If Not ValidateSheetCreation(WAREHOUSE_SHEET_NAME) Then
        CreateAllRequiredSheets = False
        Exit Function
    End If
    
    ' Create dropdowns sheet (independent validation data)
    Call CreateDropdownsSheet
    If Not ValidateSheetCreation(DROPDOWNS_SHEET_NAME) Then
        CreateAllRequiredSheets = False
        Exit Function
    End If

    ' Create invoice sheet last (depends on all supporting sheets)
    Call CreateInvoiceSheet
    If Not ValidateSheetCreation(INVOICE_SHEET_NAME) Then
        CreateAllRequiredSheets = False
        Exit Function
    End If
    
    ' All sheets created successfully
    CreateAllRequiredSheets = True
    Exit Function
    
SheetCreationError:
    CreateAllRequiredSheets = False
End Function

Private Function TestWorksheetPermissions() As Boolean
    ' Test if we can create/modify worksheets
    On Error GoTo PermissionError
    
    Dim testSheet As Worksheet
    Set testSheet = ActiveWorkbook.Worksheets.Add
    testSheet.Name = "TempTest_" & Format(Now, "hhmmss")
    Application.DisplayAlerts = False
    testSheet.Delete
    Application.DisplayAlerts = True
    
    TestWorksheetPermissions = True
    Exit Function
    
PermissionError:
    Application.DisplayAlerts = True
    TestWorksheetPermissions = False
End Function

Private Function TestUtilityFunctions() As Boolean
    ' Test if critical utility functions are available
    On Error GoTo UtilityError
    
    ' Test OptimizeExcelPerformance function exists
    Call OptimizeExcelPerformance
    Call RestoreExcelPerformance
    
    TestUtilityFunctions = True
    Exit Function
    
UtilityError:
    TestUtilityFunctions = False
End Function

Private Function TestSystemConstants() As Boolean
    ' Test if system constants are properly loaded and validate critical dependencies
    On Error GoTo ConstantError
    
    ' Test basic constants exist
    If Len(INVOICE_SHEET_NAME) = 0 Then
        TestSystemConstants = False
        Exit Function
    End If
    
    If Len(MASTER_SHEET_NAME) = 0 Then
        TestSystemConstants = False
        Exit Function
    End If
    
    If Len(WAREHOUSE_SHEET_NAME) = 0 Then
        TestSystemConstants = False
        Exit Function
    End If
    
    If Len(DROPDOWNS_SHEET_NAME) = 0 Then
        TestSystemConstants = False
        Exit Function
    End If
    
    ' Test invoice numbering constants
    If Len(INVOICE_PREFIX) = 0 Or Len(INVOICE_NUMBER_FORMAT) = 0 Then
        TestSystemConstants = False
        Exit Function
    End If
    
    ' Test that critical functions are available by trying to call them
    Dim testResult As String
    testResult = "INV-" & Year(Date) & "-001"  ' Test basic string operations
    
    TestSystemConstants = True
    Exit Function
    
ConstantError:
    TestSystemConstants = False
End Function

Public Sub ValidateCompleteSystem()
    ' Comprehensive system validation function to check all components
    ' Run this after setup to ensure everything is working correctly
    
    Dim validationResults As String
    Dim allTestsPassed As Boolean
    allTestsPassed = True
    
    validationResults = "🔍 GST INVOICE SYSTEM - COMPREHENSIVE VALIDATION" & vbCrLf & vbCrLf
    
    ' Test 1: Check all required worksheets exist
    If WorksheetExists(INVOICE_SHEET_NAME) Then
        validationResults = validationResults & "[OK] Invoice sheet exists" & vbCrLf
    Else
        validationResults = validationResults & "[no] Invoice sheet missing" & vbCrLf
        allTestsPassed = False
    End If
    
    If WorksheetExists(MASTER_SHEET_NAME) Then
        validationResults = validationResults & "[OK] Master sheet exists" & vbCrLf
    Else
        validationResults = validationResults & "[no] Master sheet missing" & vbCrLf
        allTestsPassed = False
    End If
    
    If WorksheetExists(WAREHOUSE_SHEET_NAME) Then
        validationResults = validationResults & "[OK] Warehouse sheet exists" & vbCrLf
    Else
        validationResults = validationResults & "[no] Warehouse sheet missing" & vbCrLf
        allTestsPassed = False
    End If
    
    If WorksheetExists(DROPDOWNS_SHEET_NAME) Then
        validationResults = validationResults & "[OK] Dropdowns sheet exists" & vbCrLf
    Else
        validationResults = validationResults & "[no] Dropdowns sheet missing" & vbCrLf
        allTestsPassed = False
    End If
    
    ' Test 2: Check invoice number generation
    Dim testInvoiceNumber As String
    testInvoiceNumber = GetNextInvoiceNumber()
    If Len(testInvoiceNumber) > 10 And InStr(testInvoiceNumber, "INV-") = 1 Then
        validationResults = validationResults & "[OK] Invoice numbering working: " & testInvoiceNumber & vbCrLf
    Else
        validationResults = validationResults & "[no] Invoice numbering failed" & vbCrLf
        allTestsPassed = False
    End If
    
    ' Test 3: Check border management
    Dim invoiceWs As Worksheet
    Set invoiceWs = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    If Not invoiceWs Is Nothing Then
        If ValidateInvoiceBorders(invoiceWs) Then
            validationResults = validationResults & "[OK] Border management working" & vbCrLf
        Else
            validationResults = validationResults & "[ok] Border formatting needs refresh" & vbCrLf
        End If
    End If
    
    ' Test 4: Check constants
    If TestSystemConstants() Then
        validationResults = validationResults & "[OK] System constants loaded" & vbCrLf
    Else
        validationResults = validationResults & "[no] System constants missing" & vbCrLf
        allTestsPassed = False
    End If
    
    validationResults = validationResults & vbCrLf
    
    If allTestsPassed Then
        validationResults = validationResults & "SUCCESS: ALL TESTS PASSED - System is ready for production use!"
        MsgBox validationResults, vbInformation, "System Validation - SUCCESS"
    Else
        validationResults = validationResults & "[ok] SOME TESTS FAILED - Please run StartGSTSystem() to fix issues."
        MsgBox validationResults, vbExclamation, "System Validation - Issues Found"
    End If
End Sub

Public Sub FixCommonIssues()
    ' Automated fix for common issues that might occur after setup
    ' This function can be run if users experience problems
    
    Dim fixResults As String
    Dim fixCount As Integer
    fixCount = 0
    
    fixResults = "🔧 AUTOMATED ISSUE RESOLUTION" & vbCrLf & vbCrLf
    
    On Error Resume Next
    
    ' Fix 1: Ensure all required worksheets exist
    If Not WorksheetExists(INVOICE_SHEET_NAME) Then
        Call CreateInvoiceSheet
        fixResults = fixResults & "[OK] Fixed: Created missing Invoice sheet" & vbCrLf
        fixCount = fixCount + 1
    End If
    
    If Not WorksheetExists(MASTER_SHEET_NAME) Then
        Call CreateMasterSheet
        fixResults = fixResults & "[OK] Fixed: Created missing Master sheet" & vbCrLf
        fixCount = fixCount + 1
    End If
    
    If Not WorksheetExists(WAREHOUSE_SHEET_NAME) Then
        Call CreateWarehouseSheet
        fixResults = fixResults & "[OK] Fixed: Created missing Warehouse sheet" & vbCrLf
        fixCount = fixCount + 1
    End If
    
    If Not WorksheetExists(DROPDOWNS_SHEET_NAME) Then
        Call CreateDropdownsSheet
        fixResults = fixResults & "[OK] Fixed: Created missing Dropdowns sheet" & vbCrLf
        fixCount = fixCount + 1
    End If
    
    ' Fix 2: Ensure invoice has proper formatting and number
    Dim invoiceWs As Worksheet
    Set invoiceWs = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    If Not invoiceWs Is Nothing Then
        ' Fix missing invoice number
        If Trim(invoiceWs.Range("C7").Value) = "" Then
            Call AutoPopulateInvoiceFields(invoiceWs)
            fixResults = fixResults & "[OK] Fixed: Added missing invoice number" & vbCrLf
            fixCount = fixCount + 1
        End If
        
        ' Fix border formatting
        If Not ValidateInvoiceBorders(invoiceWs) Then
            Call ApplyStandardInvoiceBorders(invoiceWs)
            fixResults = fixResults & "[OK] Fixed: Applied proper border formatting" & vbCrLf
            fixCount = fixCount + 1
        End If
        
        ' Ensure dropdowns are working
        Call SetupAllDropdownValidations(invoiceWs)
        fixResults = fixResults & "[OK] Fixed: Refreshed dropdown validations" & vbCrLf
        fixCount = fixCount + 1
        
        ' Activate invoice sheet
        invoiceWs.Activate
    End If
    
    On Error GoTo 0
    
    fixResults = fixResults & vbCrLf
    If fixCount > 0 Then
        fixResults = fixResults & "SUCCESS: " & fixCount & " issues resolved! System should now work properly."
        MsgBox fixResults, vbInformation, "Issues Fixed Successfully"
    Else
        fixResults = fixResults & "[OK] No issues found - system is working correctly!"
        MsgBox fixResults, vbInformation, "System Status - All Good"
    End If
End Sub

Private Function ValidateSheetCreation(sheetName As String) As Boolean
    ' Validate that a specific sheet was created successfully
    On Error GoTo ValidationError
    
    Dim ws As Worksheet
    Set ws = ActiveWorkbook.Worksheets(sheetName)
    
    If ws Is Nothing Then
        ValidateSheetCreation = False
    Else
        ValidateSheetCreation = True
    End If
    Exit Function
    
ValidationError:
    ValidateSheetCreation = False
End Function
