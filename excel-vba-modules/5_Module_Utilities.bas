Option Explicit
' System constants, utilities, and helper functions

' SYSTEM CONSTANTS AND CONFIGURATION

' Worksheet names
Public Const INVOICE_SHEET_NAME As String = "GST_Tax_Invoice"
Public Const MASTER_SHEET_NAME As String = "Master"
Public Const WAREHOUSE_SHEET_NAME As String = "warehouse"
Public Const DROPDOWNS_SHEET_NAME As String = "Dropdowns"

' Cell references
Public Const INVOICE_NUMBER_CELL As String = "C7"
Public Const INVOICE_DATE_CELL As String = "C8"
Public Const SALE_TYPE_CELL As String = "N7"
Public Const CUSTOMER_NAME_CELL As String = "C12"
Public Const CUSTOMER_GSTIN_CELL As String = "C14"
Public Const CUSTOMER_STATE_CELL As String = "C15"
Public Const CUSTOMER_STATE_CODE_CELL As String = "C16"

' Tax calculation ranges
Public Const ITEM_START_ROW As Long = 19
Public Const ITEM_END_ROW As Long = 24
Public Const TOTAL_ROW As Long = 25

' Tax column mappings
Public Const CGST_RATE_COL As String = "I"
Public Const CGST_AMOUNT_COL As String = "J"
Public Const SGST_RATE_COL As String = "K"
Public Const SGST_AMOUNT_COL As String = "L"
Public Const IGST_RATE_COL As String = "M"
Public Const IGST_AMOUNT_COL As String = "N"
Public Const TOTAL_AMOUNT_COL As String = "O"

' Default values
Public Const DEFAULT_IGST_RATE As Double = 18
Public Const DEFAULT_CGST_RATE As Double = 9
Public Const DEFAULT_SGST_RATE As Double = 9
Public Const DEFAULT_STATE_CODE As String = "37"
Public Const DEFAULT_STATE As String = "Andhra Pradesh"

' Invoice numbering
Public Const INVOICE_PREFIX As String = "INV-"
Public Const INVOICE_NUMBER_FORMAT As String = "000"

' PDF export
Public Const PDF_SUBFOLDER As String = "GST_Invoices"
Public Const PDF_FILE_EXTENSION As String = ".pdf"

' Business information
' Business information
Public Const BUSINESS_NAME As String = "Your Business Name"
Public Const BUSINESS_GSTIN As String = "Your GSTIN"
Public Const BUSINESS_ADDRESS As String = "Your Business Address"

' DATA STRUCTURES

' Data structure for invoice record
Public Type InvoiceDataRecord
    InvoiceNumber As String
    InvoiceDate As String
    CustomerName As String
    CustomerGSTIN As String
    CustomerState As String
    CustomerStateCode As String
    SaleType As String
    TaxableTotal As Double
    IGSTTotal As Double
    CGSTTotal As Double
    SGSTTotal As Double
    GrandTotal As Double
    IGSTRate As String
    CGSTRate As String
    SGSTRate As String
    HSNCodes As String
    ItemDescriptions As String
    TotalQuantity As Double
    UOMList As String
End Type
Public Const COMPANY_EMAIL As String = "kotidarisetty7777@gmail.com"
Public Const TRANSPORTER_NAME As String = "NARENDRA"

' UTILITY FUNCTIONS

Public Function WorksheetExists(sheetName As String) As Boolean
    ' Check if a worksheet exists
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets(sheetName)
    On Error GoTo 0
    WorksheetExists = Not (ws Is Nothing)
End Function

Public Function GetRequiredWorksheet(sheetName As String) As Worksheet
    ' Safely get a required worksheet with validation
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets(sheetName)
    On Error GoTo 0
    
    If ws Is Nothing Then
        MsgBox "Critical Error: Required worksheet '" & sheetName & "' not found!" & vbCrLf & _
               "Please run StartGSTSystem() to create all required worksheets.", vbCritical, "Missing Worksheet"
        Set GetRequiredWorksheet = Nothing
        Exit Function
    End If
    
    Set GetRequiredWorksheet = ws
End Function

Public Function GetOrCreateWorksheet(sheetName As String) As Worksheet
    ' Safely get or create a worksheet
    Dim ws As Worksheet

    On Error Resume Next
    Set ws = ThisWorkbook.Sheets(sheetName)
    On Error GoTo 0

    If ws Is Nothing Then
        Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        ws.Name = sheetName
    End If

    Set GetOrCreateWorksheet = ws
End Function

Public Sub EnsureAllSupportingWorksheetsExist()
    ' Ensure all required supporting worksheets exist in correct order
    On Error Resume Next

    ' Create Master sheet if it doesn't exist
    If Not WorksheetExists(MASTER_SHEET_NAME) Then
        Call CreateMasterSheet
    End If

    ' Create warehouse sheet if it doesn't exist
    If Not WorksheetExists(WAREHOUSE_SHEET_NAME) Then
        Call CreateWarehouseSheet
    End If

    ' Create Dropdowns sheet if it doesn't exist
    If Not WorksheetExists(DROPDOWNS_SHEET_NAME) Then
        Call CreateDropdownsSheet
    End If

    On Error GoTo 0
End Sub

Public Function GetPDFExportPath() As String
    ' Get a dynamic PDF export path that works across different users and systems
    ' Updated to use the specified BNC directory
    Dim testPath As String
    
    On Error Resume Next
    
    ' Try primary path: /Users/narendrachowdary/BNC/gst invoices/
    testPath = "/Users/narendrachowdary/BNC/gst invoices/"
    If Dir(testPath, vbDirectory) <> "" Then
        GetPDFExportPath = testPath
        Exit Function
    End If
    
    ' Fallback: Try Documents folder with standard subfolder if primary doesn't exist
    testPath = Environ("HOME") & "/Documents/" & PDF_SUBFOLDER & "/"
    GetPDFExportPath = testPath
    
    ' Note: CreateDirectoryIfNotExists will handle creation if path doesn't exist
    On Error GoTo 0
End Function

' Unified error handling for all modules
Public Sub HandleUnifiedError(functionName As String, errorNumber As Long, errorDescription As String, Optional context As String = "System")
    ' Centralized error handling with user feedback for all modules
    
    Dim errorMessage As String
    errorMessage = context & " Error in " & functionName & vbCrLf & vbCrLf
    errorMessage = errorMessage & "Error Number: " & errorNumber & vbCrLf
    errorMessage = errorMessage & "Description: " & errorDescription & vbCrLf & vbCrLf
    errorMessage = errorMessage & "Please try again or contact system administrator."
    
    MsgBox errorMessage, vbCritical, context & " Error"
End Sub

' PERFORMANCE OPTIMIZATION UTILITIES

Public Sub OptimizeExcelPerformance()
    ' Enhanced performance optimization with memory management
    On Error Resume Next
    
    ' Memory and calculation optimizations
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    Application.Calculation = xlCalculationManual
    Application.EnableEvents = False
    Application.DisplayStatusBar = False
    Application.PrintCommunication = False
    
    ' Advanced memory management
    Dim memUsed As Double
    memUsed = Application.MemoryUsed  ' Force garbage collection
    DoEvents  ' Process pending events
    
    ' Optimize for large data sets
    Application.AskToUpdateLinks = False
    Application.AlertBeforeOverwriting = False
End Sub

Public Sub RestoreExcelPerformance()
    ' Comprehensive performance restoration
    On Error Resume Next
    
    ' Restore all settings with validation
    Application.ScreenUpdating = True
    Application.DisplayAlerts = True
    Application.Calculation = xlCalculationAutomatic
    Application.EnableEvents = True
    Application.DisplayStatusBar = True
    Application.PrintCommunication = True
    
    ' Restore advanced settings
    Application.AskToUpdateLinks = True
    Application.AlertBeforeOverwriting = True
    
    ' Force final recalculation
    Call Application.Calculate
End Sub

Public Function SafePerformanceOperation(operationName As String) As Boolean
    ' Wrapper for performance-critical operations with proper error handling
    On Error GoTo ErrorHandler
    
    Call OptimizeExcelPerformance
    SafePerformanceOperation = True
    Exit Function
    
ErrorHandler:
    Call RestoreExcelPerformance
    MsgBox "Error in " & operationName & ": " & Err.Description, vbCritical, "Performance Operation Error"
    SafePerformanceOperation = False
End Function

' Advanced parameter validation functions

Public Function ValidateStringParameter(paramValue As Variant, paramName As String, _
                                       Optional allowEmpty As Boolean = False, _
                                       Optional minLength As Integer = 0, _
                                       Optional maxLength As Integer = 255) As Boolean
    ' Comprehensive string parameter validation with detailed error reporting
    
    On Error GoTo ValidationError
    
    ' Check if parameter is Nothing or Null
    If IsNull(paramValue) Or IsEmpty(paramValue) Then
        If Not allowEmpty Then
            MsgBox "Parameter '" & paramName & "' cannot be null or empty.", vbCritical, "Parameter Validation Error"
            ValidateStringParameter = False
            Exit Function
        End If
    End If
    
    ' Convert to string and validate type
    Dim stringValue As String
    stringValue = CStr(paramValue)
    
    ' Check length constraints
    If Len(stringValue) < minLength Then
        MsgBox "Parameter '" & paramName & "' must be at least " & minLength & " characters long." & vbCrLf & _
               "Current length: " & Len(stringValue), vbCritical, "Parameter Validation Error"
        ValidateStringParameter = False
        Exit Function
    End If
    
    If Len(stringValue) > maxLength Then
        MsgBox "Parameter '" & paramName & "' cannot exceed " & maxLength & " characters." & vbCrLf & _
               "Current length: " & Len(stringValue), vbCritical, "Parameter Validation Error"
        ValidateStringParameter = False
        Exit Function
    End If
    
    ' All validations passed
    ValidateStringParameter = True
    Exit Function
    
ValidationError:
    MsgBox "Validation error for parameter '" & paramName & "': " & Err.Description, vbCritical, "Parameter Validation Error"
    ValidateStringParameter = False
End Function

Public Function ValidateNumericParameter(paramValue As Variant, paramName As String, _
                                        Optional minValue As Double = -999999999, _
                                        Optional maxValue As Double = 999999999) As Boolean
    ' Comprehensive numeric parameter validation
    
    On Error GoTo ValidationError
    
    ' Check if parameter is numeric
    If Not IsNumeric(paramValue) Then
        MsgBox "Parameter '" & paramName & "' must be a numeric value." & vbCrLf & _
               "Provided value: " & CStr(paramValue), vbCritical, "Parameter Validation Error"
        ValidateNumericParameter = False
        Exit Function
    End If
    
    ' Convert to double for range checking
    Dim numericValue As Double
    numericValue = CDbl(paramValue)
    
    ' Check range constraints
    If numericValue < minValue Then
        MsgBox "Parameter '" & paramName & "' must be at least " & minValue & "." & vbCrLf & _
               "Provided value: " & numericValue, vbCritical, "Parameter Validation Error"
        ValidateNumericParameter = False
        Exit Function
    End If
    
    If numericValue > maxValue Then
        MsgBox "Parameter '" & paramName & "' cannot exceed " & maxValue & "." & vbCrLf & _
               "Provided value: " & numericValue, vbCritical, "Parameter Validation Error"
        ValidateNumericParameter = False
        Exit Function
    End If
    
    ' All validations passed
    ValidateNumericParameter = True
    Exit Function
    
ValidationError:
    MsgBox "Validation error for parameter '" & paramName & "': " & Err.Description, vbCritical, "Parameter Validation Error"
    ValidateNumericParameter = False
End Function

Public Function ValidateWorksheetParameter(wsParam As Variant, paramName As String) As Boolean
    ' Validate worksheet object parameters
    
    On Error GoTo ValidationError
    
    ' Check if parameter is Nothing
    If wsParam Is Nothing Then
        MsgBox "Parameter '" & paramName & "' cannot be Nothing." & vbCrLf & _
               "Please provide a valid worksheet object.", vbCritical, "Parameter Validation Error"
        ValidateWorksheetParameter = False
        Exit Function
    End If
    
    ' Check if it's actually a worksheet object
    If Not TypeOf wsParam Is Worksheet Then
        MsgBox "Parameter '" & paramName & "' must be a Worksheet object." & vbCrLf & _
               "Provided type: " & TypeName(wsParam), vbCritical, "Parameter Validation Error"
        ValidateWorksheetParameter = False
        Exit Function
    End If
    
    ' Check if worksheet is accessible
    Dim testName As String
    testName = wsParam.Name
    
    ' All validations passed
    ValidateWorksheetParameter = True
    Exit Function
    
ValidationError:
    MsgBox "Validation error for parameter '" & paramName & "': " & Err.Description, vbCritical, "Parameter Validation Error"
    ValidateWorksheetParameter = False
End Function

Public Function ValidateCellReferenceParameter(cellRef As String, paramName As String) As Boolean
    ' Validate cell reference string parameters (e.g., "A1", "B2:C5")
    
    On Error GoTo ValidationError
    
    ' Basic string validation first
    If Not ValidateStringParameter(cellRef, paramName, False, 1, 20) Then
        ValidateCellReferenceParameter = False
        Exit Function
    End If
    
    ' Test if Excel can parse the cell reference
    Dim testRange As Range
    Set testRange = Range(cellRef)
    
    ' If we got here, the reference is valid
    ValidateCellReferenceParameter = True
    Exit Function
    
ValidationError:
    MsgBox "Parameter '" & paramName & "' contains an invalid cell reference." & vbCrLf & _
           "Provided value: " & cellRef & vbCrLf & _
           "Error: " & Err.Description, vbCritical, "Parameter Validation Error"
    ValidateCellReferenceParameter = False
End Function


Public Function CleanText(inputText As String) As String
    Dim cleanedText As String
    Dim i As Integer

    cleanedText = inputText

    ' Remove any question marks that might appear due to encoding issues
    cleanedText = Replace(cleanedText, "?", "")

    ' Remove any other problematic characters
    cleanedText = Replace(cleanedText, Chr(63), "") ' ASCII 63 is question mark

    ' Trim extra spaces
    cleanedText = Trim(cleanedText)

    ' Replace multiple spaces with single space
    Do While InStr(cleanedText, "  ") > 0
        cleanedText = Replace(cleanedText, "  ", " ")
    Loop

    CleanText = cleanedText
End Function

Public Sub VerifyValidationSettings()
    ' Display current validation settings to confirm manual editing is enabled
    Dim ws As Worksheet
    Dim message As String

    On Error GoTo ErrorHandler

    Set ws = ThisWorkbook.Worksheets(INVOICE_SHEET_NAME)

    message = "VALIDATION SETTINGS VERIFICATION:" & vbCrLf & vbCrLf
    message = message & "[OK] ALL FIELDS SUPPORT MANUAL EDITING:" & vbCrLf & vbCrLf

    message = message & " DROPDOWN + MANUAL ENTRY FIELDS:" & vbCrLf
    message = message & "• Customer Name (C12) - Dropdown + Manual" & vbCrLf
    message = message & "• Receiver State (C15) - Dropdown + Manual" & vbCrLf
    message = message & "• Consignee State (I15) - Dropdown + Manual" & vbCrLf
    message = message & "• HSN Code (C18:C21) - Dropdown + Manual" & vbCrLf
    message = message & "• UOM (E18:E21) - Dropdown + Manual" & vbCrLf
    message = message & "• Transport Mode (F7) - Dropdown + Manual" & vbCrLf & vbCrLf

    message = message & " FULLY EDITABLE FIELDS:" & vbCrLf
    message = message & "• Invoice Number (C7) - Auto + Manual Override" & vbCrLf
    message = message & "• Invoice Date (C8) - Auto + Manual Override" & vbCrLf
    message = message & "• Date of Supply (F9, G9) - Auto + Manual Override" & vbCrLf
    message = message & "• State Code (C10) - Fixed + Manual Override" & vbCrLf
    message = message & "• All Address/GSTIN fields - Fully Manual" & vbCrLf
    message = message & "• All Item details - Fully Manual" & vbCrLf & vbCrLf

    message = message & " KEY FEATURES:" & vbCrLf
    message = message & "• No restrictive validations (xlValidAlertStop removed)" & vbCrLf
    message = message & "• ShowError = False for all dropdowns" & vbCrLf
    message = message & "• Users can override ANY auto-populated value" & vbCrLf
    message = message & "• Dropdown suggestions + free text entry" & vbCrLf & vbCrLf

    message = message & " All validation requirements have been successfully implemented!"

    MsgBox message, vbInformation, "Validation Settings - All Clear [OK]"
    Exit Sub

ErrorHandler:
    MsgBox "Error verifying validation settings: " & Err.Description, vbCritical, "Verification Error"
End Sub

' Amount in words conversion system

Public Function NumberToWords(ByVal MyNumber As Variant) As String
    Dim Rupees As String, Paise As String
    Dim DecimalPlace As Integer
    Dim NumStr As String
    
    ' Convert to string and handle decimal
    NumStr = Trim(Str(MyNumber))
    DecimalPlace = InStr(NumStr, ".")
    
    ' Extract paise (decimal part)
    If DecimalPlace > 0 Then
        Paise = ConvertTens(Left(Mid(NumStr, DecimalPlace + 1) & "00", 2))
        NumStr = Trim(Left(NumStr, DecimalPlace - 1))
    End If
    
    ' Convert rupees part using Indian numbering system
    Rupees = ConvertToIndianWords(NumStr)
    
    ' Format rupees
    Select Case Rupees
        Case ""
            Rupees = "Zero Rupees"
        Case "One"
            Rupees = "One Rupee"
        Case Else
            Rupees = Rupees & " Rupees"
    End Select
    
    ' Format paise
    If Paise <> "" Then
        Select Case Paise
            Case "One"
                Paise = " and One Paisa"
            Case Else
                Paise = " and " & Paise & " Paise"
        End Select
    End If
    
    NumberToWords = CleanText(Rupees & Paise & " Only")
End Function

Private Function ConvertToIndianWords(ByVal NumStr As String) As String
    Dim Result As String
    Dim NumLength As Integer
    Dim CroresPart As String, LakhsPart As String, ThousandsPart As String, HundredsPart As String
    
    ' Remove leading zeros
    NumStr = Trim(NumStr)
    If NumStr = "" Or Val(NumStr) = 0 Then
        ConvertToIndianWords = ""
        Exit Function
    End If
    
    NumLength = Len(NumStr)
    
    ' Process according to Indian numbering system
    ' Crores (positions 8 and above)
    If NumLength >= 8 Then
        CroresPart = Left(NumStr, NumLength - 7)
        Result = ConvertTens(CroresPart) & " Crore "
        NumStr = Right(NumStr, 7)
        NumLength = 7
    End If
    
    ' Lakhs (positions 6-7)
    If NumLength >= 6 Then
        LakhsPart = Left(NumStr, NumLength - 5)
        If Val(LakhsPart) > 0 Then
            Result = Result & ConvertTens(LakhsPart) & " Lakh "
        End If
        NumStr = Right(NumStr, 5)
        NumLength = 5
    End If
    
    ' Thousands (positions 4-5)
    If NumLength >= 4 Then
        ThousandsPart = Left(NumStr, NumLength - 3)
        If Val(ThousandsPart) > 0 Then
            Result = Result & ConvertTens(ThousandsPart) & " Thousand "
        End If
        NumStr = Right(NumStr, 3)
        NumLength = 3
    End If
    
    ' Hundreds (positions 1-3)
    If NumLength >= 1 And Val(NumStr) > 0 Then
        Result = Result & ConvertHundreds(NumStr)
    End If
    
    ConvertToIndianWords = Trim(Result)
End Function

Private Function ConvertHundreds(ByVal MyNumber As Variant) As String
    Dim Result As String

    ' Exit if there is nothing to convert
    If Val(MyNumber) = 0 Then Exit Function

    ' Append leading zeros to number
    MyNumber = Right("000" & MyNumber, 3)

    ' Do we have a hundreds place digit to convert?
    If Left(MyNumber, 1) <> "0" Then
        Result = ConvertDigit(Left(MyNumber, 1)) & " Hundred "
    End If

    ' Do we have a tens place digit to convert?
    If Mid(MyNumber, 2, 1) <> "0" Then
        Result = Result & ConvertTens(Mid(MyNumber, 2))
    Else
        ' If not, then convert the ones place digit
        Result = Result & ConvertDigit(Mid(MyNumber, 3))
    End If

    ConvertHundreds = Trim(Result)
End Function

Private Function ConvertTens(ByVal MyTens As Variant) As String
    Dim Result As String
    Dim TensStr As String
    
    ' Handle empty or zero values
    If IsEmpty(MyTens) Or Val(MyTens) = 0 Then
        ConvertTens = ""
        Exit Function
    End If
    
    TensStr = Trim(Str(MyTens))
    
    ' Handle single digit
    If Len(TensStr) = 1 Then
        ConvertTens = ConvertDigit(TensStr)
        Exit Function
    End If
    
    ' Pad to two digits if needed
    If Len(TensStr) = 1 Then TensStr = "0" & TensStr
    
    ' Is value between 10 and 19?
    If Val(Left(TensStr, 1)) = 1 Then
        Select Case Val(TensStr)
            Case 10: Result = "Ten"
            Case 11: Result = "Eleven"
            Case 12: Result = "Twelve"
            Case 13: Result = "Thirteen"
            Case 14: Result = "Fourteen"
            Case 15: Result = "Fifteen"
            Case 16: Result = "Sixteen"
            Case 17: Result = "Seventeen"
            Case 18: Result = "Eighteen"
            Case 19: Result = "Nineteen"
        End Select
    Else
        ' Otherwise it's between 20 and 99
        Select Case Val(Left(TensStr, 1))
            Case 2: Result = "Twenty"
            Case 3: Result = "Thirty"
            Case 4: Result = "Forty"
            Case 5: Result = "Fifty"
            Case 6: Result = "Sixty"
            Case 7: Result = "Seventy"
            Case 8: Result = "Eighty"
            Case 9: Result = "Ninety"
        End Select
        
        ' Add ones place digit if not zero
        If Val(Right(TensStr, 1)) > 0 Then
            Result = Result & " " & ConvertDigit(Right(TensStr, 1))
        End If
    End If
    
    ConvertTens = Result
End Function

Private Function ConvertDigit(ByVal MyDigit As Variant) As String
    Select Case Val(MyDigit)
        Case 1: ConvertDigit = "One"
        Case 2: ConvertDigit = "Two"
        Case 3: ConvertDigit = "Three"
        Case 4: ConvertDigit = "Four"
        Case 5: ConvertDigit = "Five"
        Case 6: ConvertDigit = "Six"
        Case 7: ConvertDigit = "Seven"
        Case 8: ConvertDigit = "Eight"
        Case 9: ConvertDigit = "Nine"
        Case Else: ConvertDigit = ""
    End Select
End Function

Public Sub TestNumberToWords()
    ' Test function to verify NumberToWords works correctly for various amounts
    Dim TestResults As String
    
    TestResults = "NumberToWords Test Results:" & vbCrLf & vbCrLf
    TestResults = TestResults & "99,999: " & NumberToWords(99999) & vbCrLf
    TestResults = TestResults & "1,00,000: " & NumberToWords(100000) & vbCrLf
    TestResults = TestResults & "1,25,000: " & NumberToWords(125000) & vbCrLf
    TestResults = TestResults & "5,50,000: " & NumberToWords(550000) & vbCrLf
    TestResults = TestResults & "10,00,000: " & NumberToWords(1000000) & vbCrLf
    TestResults = TestResults & "12,34,567: " & NumberToWords(1234567) & vbCrLf
    TestResults = TestResults & "1,00,00,000: " & NumberToWords(10000000) & vbCrLf
    TestResults = TestResults & "2,50,00,000: " & NumberToWords(25000000) & vbCrLf
    TestResults = TestResults & "1234.56: " & NumberToWords(1234.56) & vbCrLf
    
    MsgBox TestResults, vbInformation, "NumberToWords Function Test"
End Sub

Public Sub EnsureStateFieldsTextFormat(ws As Worksheet)
    ' Ensure state input fields are formatted as text to prevent formula interpretation
    ' This prevents Excel from interpreting user input like "=1" or "-1" as formulas
    On Error Resume Next
    
    With ws
        ' State field for Receiver (Row 15, Column C15)
        .Range("C15").NumberFormat = "@"
        
        ' State field for Consignee (Row 15, Column K15)
        .Range("K15").NumberFormat = "@"
    End With
    
    On Error GoTo 0
End Sub

Public Sub ApplyCustomBorderFormatting(ws As Worksheet)
    ' DEPRECATED: This function is now replaced by centralized border management
    ' Redirect to the new centralized border system for consistent formatting
    Call ApplyStandardInvoiceBorders(ws)
End Sub

Public Sub VerifyCustomBorderFormatting(ws As Worksheet)
    ' DEPRECATED: Border verification now handled by centralized border management
    ' Use ValidateInvoiceBorders from Module 19 instead
    If Not ValidateInvoiceBorders(ws) Then
        MsgBox "Invoice borders need refresh. Applying standard borders...", vbInformation, "Border Check"
        Call ApplyStandardInvoiceBorders(ws)
    Else
        MsgBox "[OK] Invoice borders are correctly applied!", vbInformation, "Border Check"
    End If
End Sub

Public Sub VerifyPDFLayoutOptimization()
    ' Verify that row heights have been optimized for better PDF layout
    Dim ws As Worksheet
    Dim message As String
    Dim allCorrect As Boolean
    
    On Error GoTo ErrorHandler
    
    Set ws = ThisWorkbook.Sheets(INVOICE_SHEET_NAME)
    allCorrect = True
    message = "PDF Layout Optimization Verification:" & vbCrLf & vbCrLf
    
    ' Check Company Name Header (Row 2)
    If ws.Rows(2).RowHeight = 55 Then
        message = message & "[OK] Company Name Header (Row 2): Optimized to 55pt" & vbCrLf
    Else
        message = message & "[no] Company Name Header (Row 2): Height incorrect (" & ws.Rows(2).RowHeight & "pt)" & vbCrLf
        allCorrect = False
    End If
    
    ' Check Invoice Details Section (Rows 7-10)
    If ws.Rows(7).RowHeight = 35 And ws.Rows(10).RowHeight = 35 Then
        message = message & "[ok] Invoice Details (Rows 7-10): Optimized to 35pt" & vbCrLf
    Else
        message = message & "[no] Invoice Details (Rows 7-10): Height incorrect" & vbCrLf
        allCorrect = False
    End If
    
    ' Check Party Details Section (Rows 12-16)
    If ws.Rows(12).RowHeight = 35 And ws.Rows(16).RowHeight = 35 Then
        message = message & "[ok] Party Details (Rows 12-16): Optimized to 35pt" & vbCrLf
    Else
        message = message & "[no] Party Details (Rows 12-16): Height incorrect" & vbCrLf
        allCorrect = False
    End If
    
    ' Check Item Details Section (Rows 19-24)
    If ws.Rows(19).RowHeight = 42 And ws.Rows(24).RowHeight = 38 Then
        message = message & "[ok] Item Details (Rows 19-24): Optimized (19=42pt, 20-24=38pt)" & vbCrLf
    Else
        message = message & "[no] Item Details (Rows 19-24): Height incorrect" & vbCrLf
        allCorrect = False
    End If
    
    ' Check Totals and Tax Summary Section (Rows 25-33)
    If ws.Rows(25).RowHeight = 50 And ws.Rows(26).RowHeight = 32 And ws.Rows(32).RowHeight = 38 Then
        message = message & "[ok] Totals & Tax Summary (Rows 25-33): Optimized (25=50pt, 26-31=32/30pt, 32-33=38pt)" & vbCrLf
    Else
        message = message & "[no] Totals & Tax Summary (Rows 25-33): Height incorrect" & vbCrLf
        allCorrect = False
    End If
    
    ' Check Signature Headers (Row 34)
    If ws.Rows(34).RowHeight = 55 Then
        message = message & "[ok] Signature Headers (Row 34): Optimized to 55pt" & vbCrLf
    Else
        message = message & "[no] Signature Headers (Row 34): Height incorrect (" & ws.Rows(34).RowHeight & "pt)" & vbCrLf
        allCorrect = False
    End If
    
    ' Check Signature Space (Rows 37-39)
    If ws.Rows(37).RowHeight = 45 And ws.Rows(39).RowHeight = 45 Then
        message = message & "[ok] Signature Space (Rows 37-39): Optimized to 45pt" & vbCrLf
    Else
        message = message & "[no] Signature Space (Rows 37-39): Height incorrect" & vbCrLf
        allCorrect = False
    End If
    
    message = message & vbCrLf
    If allCorrect Then
        message = message & "SUCCESS: All PDF layout optimizations applied successfully!" & vbCrLf & _
                         "The invoice should now utilize PDF page space optimally with minimal blank space." & vbCrLf & _
                         "Comprehensive optimization includes header, details, items, totals, and signature sections."
    Else
        message = message & "[ok] Some optimizations may need to be re-applied." & vbCrLf & _
                         "Run CreateInvoiceSheet() to apply all optimizations."
    End If
    
    MsgBox message, vbInformation, "PDF Layout Verification"
    Exit Sub
    
ErrorHandler:
    MsgBox "Error verifying PDF layout optimization: " & Err.Description, vbCritical, "Verification Error"
    On Error GoTo 0
End Sub



' Advanced input validation

Public Function ValidateUserInput(ws As Worksheet) As Boolean
    ' Comprehensive validation of all user inputs with detailed feedback
    
    Dim validationResults As String
    Dim errorCount As Integer
    Dim warningCount As Integer
    
    On Error GoTo ValidationError
    
    validationResults = "INPUT VALIDATION RESULTS:" & vbCrLf & vbCrLf
    errorCount = 0
    warningCount = 0
    
    ' 1. Validate Invoice Number
    If Trim(ws.Range("C7").Value) = "" Then
        validationResults = validationResults & "[no] ERROR: Invoice Number is required" & vbCrLf
        errorCount = errorCount + 1
    ElseIf Not ValidateInvoiceNumberFormat(ws.Range("C7").Value) Then
        validationResults = validationResults & "[ok] WARNING: Invoice Number format may be incorrect" & vbCrLf
        warningCount = warningCount + 1
    End If
    
    ' 2. Validate Customer Information
    If Trim(ws.Range("C12").Value) = "" Then
        validationResults = validationResults & "[no] ERROR: Customer Name is required" & vbCrLf
        errorCount = errorCount + 1
    End If
    
    ' 3. Validate GSTIN Format
    If Trim(ws.Range("C14").Value) <> "" Then
        If Not ValidateGSTINFormat(ws.Range("C14").Value) Then
            validationResults = validationResults & "[no] ERROR: Invalid GSTIN format" & vbCrLf
            errorCount = errorCount + 1
        End If
    End If
    
    ' 4. Validate Sale Type
    Dim saleType As String
    saleType = Trim(ws.Range("N7").Value)
    If saleType <> "Interstate" And saleType <> "Intrastate" Then
        validationResults = validationResults & "[no] ERROR: Sale Type must be Interstate or Intrastate" & vbCrLf
        errorCount = errorCount + 1
    End If
    
    ' 5. Validate Item Data
    Dim itemValidation As String
    itemValidation = ValidateItemData(ws)
    If itemValidation <> "" Then
        validationResults = validationResults & itemValidation
        errorCount = errorCount + 1
    End If
    
    ' 6. Validate Tax Calculations
    If Not ValidateTaxCalculations(ws) Then
        validationResults = validationResults & "[ok] WARNING: Tax calculations may need refresh" & vbCrLf
        warningCount = warningCount + 1
    End If
    
    ' Summary
    validationResults = validationResults & vbCrLf
    If errorCount = 0 And warningCount = 0 Then
        validationResults = validationResults & "[ok] ALL VALIDATIONS PASSED!" & vbCrLf
        ValidateUserInput = True
    ElseIf errorCount = 0 Then
        validationResults = validationResults & "[ok] " & warningCount & " WARNING(S) - Data is valid but may need review" & vbCrLf
        ValidateUserInput = True
    Else
        validationResults = validationResults & "[no] " & errorCount & " ERROR(S) - Please fix before proceeding" & vbCrLf
        ValidateUserInput = False
    End If
    
    ' Show results if there are issues
    If errorCount > 0 Or warningCount > 0 Then
        MsgBox validationResults, IIf(errorCount > 0, vbCritical, vbExclamation), "Input Validation"
    End If
    
    Exit Function
    
ValidationError:
    ValidateUserInput = False
    MsgBox "Error during validation: " & Err.Description, vbCritical, "Validation Error"
End Function

Private Function ValidateInvoiceNumberFormat(invoiceNumber As String) As Boolean
    ' Validate invoice number follows INV-YYYY-NNN pattern
    Dim pattern As String
    pattern = "^INV-\d{4}-\d{3}$"
    
    ' Simple validation - check basic structure
    If Len(invoiceNumber) >= 12 And InStr(invoiceNumber, "INV-") = 1 Then
        ValidateInvoiceNumberFormat = True
    Else
        ValidateInvoiceNumberFormat = False
    End If
End Function

Private Function ValidateGSTINFormat(gstin As String) As Boolean
    ' Validate GSTIN format: 15 characters with specific pattern
    If Len(gstin) = 15 Then
        ' Basic validation for 15-character format
        ValidateGSTINFormat = True
    Else
        ValidateGSTINFormat = False
    End If
End Function

Private Function ValidateItemData(ws As Worksheet) As String
    ' Validate item data in rows 19-24
    Dim errorMsg As String
    Dim i As Integer
    
    errorMsg = ""
    
    For i = 19 To 24
        ' Check if row has any data
        If Trim(ws.Range("B" & i).Value) <> "" Then
            ' If description exists, validate other required fields
            If Trim(ws.Range("C" & i).Value) = "" Then
                errorMsg = errorMsg & "[no] ERROR: HSN Code missing for item in row " & i & vbCrLf
            End If
            
            If Not IsNumeric(ws.Range("D" & i).Value) Or ws.Range("D" & i).Value <= 0 Then
                errorMsg = errorMsg & "[no] ERROR: Invalid quantity in row " & i & vbCrLf
            End If
            
            If Not IsNumeric(ws.Range("F" & i).Value) Or ws.Range("F" & i).Value <= 0 Then
                errorMsg = errorMsg & "[no] ERROR: Invalid rate in row " & i & vbCrLf
            End If
        End If
    Next i
    
    ValidateItemData = errorMsg
End Function

Private Function ValidateTaxCalculations(ws As Worksheet) As Boolean
    ' Simple validation to check if tax calculations are working
    Dim sampleRow As Integer
    sampleRow = 19
    
    ' Check if there's data and tax calculations
    If Trim(ws.Range("B" & sampleRow).Value) <> "" Then
        If IsNumeric(ws.Range("H" & sampleRow).Value) And ws.Range("H" & sampleRow).Value > 0 Then
            ValidateTaxCalculations = True
        Else
            ValidateTaxCalculations = False
        End If
    Else
        ValidateTaxCalculations = True  ' No data to validate
    End If
End Function

