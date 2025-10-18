Option Explicit
' Module 9: Save Invoice Button
' Button function to save complete invoice record to Master sheet for future reference
' Includes GST compliance, comprehensive error handling, and parameter validation

Public Sub SaveInvoiceButton()
    ' Save complete invoice record to Master sheet with comprehensive validation
    ' Validates data, calculates GST totals, provides user feedback
    
    On Error GoTo ErrorHandler
    
    Dim operationStart As Double
    operationStart = Timer
    
    ' Validate system state before proceeding
    If Not ValidateSystemForSaveOperation() Then
        Exit Sub
    End If
    
    ' Get validated worksheets
    Dim invoiceWs As Worksheet, masterWs As Worksheet
    Set invoiceWs = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    Set masterWs = GetRequiredWorksheet(MASTER_SHEET_NAME)
    
    ' Exit if any required worksheet is missing
    If invoiceWs Is Nothing Or masterWs Is Nothing Then
        Exit Sub
    End If
    
    ' Extract and validate invoice data
    Dim invoiceData As InvoiceDataRecord
    If Not ExtractValidatedInvoiceData(invoiceWs, invoiceData) Then
        Exit Sub
    End If
    
    ' CHECK FOR DUPLICATE INVOICE NUMBER - REQUIREMENT 4
    Dim duplicateCheckResult As Integer
    duplicateCheckResult = CheckForDuplicateInvoice(masterWs, invoiceData.InvoiceNumber)
    
    Select Case duplicateCheckResult
        Case 0 ' No duplicate found, proceed with save
            ' Continue to save
        Case 1 ' Duplicate found, user wants to overwrite
            ' Continue to save (will overwrite)
        Case 2 ' Duplicate found, user cancelled
            Exit Sub
        Case -1 ' Error in check
            MsgBox "Error checking for duplicate invoices. Save operation cancelled.", vbCritical, "Error"
            Exit Sub
    End Select
    
    ' Confirm save operation with user (if not duplicate overwrite)
    If duplicateCheckResult = 0 Then
        If Not ConfirmSaveOperation(invoiceData) Then
            Exit Sub
        End If
    End If
    
    ' Perform the save operation with performance optimization
    Call OptimizeExcelPerformance
    
    If Not SaveInvoiceToMaster(masterWs, invoiceData) Then
        Call RestoreExcelPerformance
        Exit Sub
    End If
    
    Call RestoreExcelPerformance
    
    ' Ensure invoice borders remain intact after save operation
    Call RefreshInvoiceBorders(invoiceWs)
    
    ' Calculate and display completion time
    Dim operationTime As Double
    operationTime = Timer - operationStart
    
    ' Display success message
    MsgBox "Invoice " & invoiceData.InvoiceNumber & " saved successfully!" & vbCrLf & _
           "Total Amount: Rs:" & Format(invoiceData.GrandTotal, "#,##0.00") & vbCrLf & _
           "Operation completed in " & Format(operationTime, "0.00") & " seconds.", _
           vbInformation, "Invoice Saved"
    Exit Sub
    
ErrorHandler:
    Call RestoreExcelPerformance
    Call HandleUnifiedError("SaveInvoiceButton", Err.Number, Err.Description, "Save Operation")
End Sub

' DUPLICATE CHECK FUNCTION - REQUIREMENT 4

Private Function CheckForDuplicateInvoice(masterWs As Worksheet, invoiceNumber As String) As Integer
    ' Check if invoice number already exists in Master sheet
    ' Returns: 0 = No duplicate, 1 = Duplicate-Overwrite, 2 = Duplicate-Cancel, -1 = Error
    
    On Error GoTo CheckError
    
    Dim lastRow As Long
    Dim i As Long
    Dim existingInvoiceNumber As String
    Dim userResponse As VbMsgBoxResult
    
    ' Get last row with data in Master sheet
    lastRow = masterWs.Cells(masterWs.Rows.Count, "A").End(xlUp).Row
    
    ' Search for duplicate invoice number (assuming invoice number is in column A)
    For i = 2 To lastRow ' Start from row 2 (skip header)
        existingInvoiceNumber = Trim(masterWs.Cells(i, "A").Value)
        If UCase(existingInvoiceNumber) = UCase(invoiceNumber) Then
            ' Duplicate found - show professional confirmation dialog
            userResponse = MsgBox( _
                "WARNING: DUPLICATE INVOICE DETECTED" & vbCrLf & vbCrLf & _
                "Invoice Number: " & invoiceNumber & vbCrLf & _
                "This invoice number already exists in the system." & vbCrLf & vbCrLf & _
                "Do you want to overwrite the existing invoice record?" & vbCrLf & vbCrLf & _
                "YES - Replace the existing record with current data" & vbCrLf & _
                "NO - Cancel save operation and keep existing record", _
                vbYesNo + vbQuestion + vbDefaultButton2, _
                "Invoice Number Already Exists")
            
            If userResponse = vbYes Then
                ' User wants to overwrite
                CheckForDuplicateInvoice = 1
            Else
                ' User cancelled
                CheckForDuplicateInvoice = 2
            End If
            Exit Function
        End If
    Next i
    
    ' No duplicate found
    CheckForDuplicateInvoice = 0
    Exit Function
    
CheckError:
    CheckForDuplicateInvoice = -1
End Function

' Data extraction and validation functions

Private Function ValidateSystemForSaveOperation() As Boolean
    ' Validate system state before attempting save operation
    
    On Error GoTo ValidationError
    
    ' Check if required worksheets exist
    If Not WorksheetExists(INVOICE_SHEET_NAME) Then
        MsgBox "Invoice worksheet not found. Please run system initialization first.", _
               vbCritical, "System Validation Error"
        ValidateSystemForSaveOperation = False
        Exit Function
    End If
    
    If Not WorksheetExists(MASTER_SHEET_NAME) Then
        MsgBox "Master worksheet not found. Please run system initialization first.", _
               vbCritical, "System Validation Error"
        ValidateSystemForSaveOperation = False
        Exit Function
    End If
    
    ' All validations passed
    ValidateSystemForSaveOperation = True
    Exit Function
    
ValidationError:
    ValidateSystemForSaveOperation = False
End Function

Private Function ExtractValidatedInvoiceData(invoiceWs As Worksheet, ByRef invoiceData As InvoiceDataRecord) As Boolean
    ' Extract and validate all invoice data with comprehensive error checking
    
    On Error GoTo ExtractionError
    
    ' Validate worksheet parameter
    If Not ValidateWorksheetParameter(invoiceWs, "invoiceWs") Then
        ExtractValidatedInvoiceData = False
        Exit Function
    End If
    
    ' Extract basic invoice information
    invoiceData.InvoiceNumber = Trim(invoiceWs.Range(INVOICE_NUMBER_CELL).Value)
    invoiceData.InvoiceDate = Trim(invoiceWs.Range(INVOICE_DATE_CELL).Value)
    invoiceData.CustomerName = Trim(invoiceWs.Range(CUSTOMER_NAME_CELL).Value)
    invoiceData.CustomerGSTIN = Trim(invoiceWs.Range(CUSTOMER_GSTIN_CELL).Value)
    invoiceData.CustomerState = Trim(invoiceWs.Range(CUSTOMER_STATE_CELL).Value)
    invoiceData.CustomerStateCode = Trim(invoiceWs.Range(CUSTOMER_STATE_CODE_CELL).Value)
    invoiceData.SaleType = Trim(invoiceWs.Range(SALE_TYPE_CELL).Value)
    
    ' Validate critical fields
    If Not ValidateStringParameter(invoiceData.InvoiceNumber, "Invoice Number", False, 1, 50) Then
        ExtractValidatedInvoiceData = False
        Exit Function
    End If
    
    If Not ValidateStringParameter(invoiceData.CustomerName, "Customer Name", False, 1, 100) Then
        ExtractValidatedInvoiceData = False
        Exit Function
    End If
    
    ' Calculate totals and collect item details
    If Not CalculateInvoiceTotals(invoiceWs, invoiceData) Then
        ExtractValidatedInvoiceData = False
        Exit Function
    End If
    
    ' Validate financial totals
    If Not ValidateNumericParameter(invoiceData.TaxableTotal, "Taxable Total", 0, 999999999) Then
        ExtractValidatedInvoiceData = False
        Exit Function
    End If
    
    ' Calculate tax rates
    CalculateTaxRates invoiceData
    
    ' All extractions and validations successful
    ExtractValidatedInvoiceData = True
    Exit Function
    
ExtractionError:
    MsgBox "Error extracting invoice data: " & Err.Description, vbCritical, "Data Extraction Error"
    ExtractValidatedInvoiceData = False
End Function

Private Function CalculateInvoiceTotals(invoiceWs As Worksheet, ByRef invoiceData As InvoiceDataRecord) As Boolean
    ' Calculate all invoice totals with error handling
    On Error GoTo CalculationError
    
    Dim i As Long
    Dim hsnCodes As String, itemDescriptions As String, uomList As String
    
    ' Initialize totals
    invoiceData.TaxableTotal = 0
    invoiceData.IGSTTotal = 0
    invoiceData.CGSTTotal = 0
    invoiceData.SGSTTotal = 0
    invoiceData.TotalQuantity = 0
    
    ' Process each item row
    For i = ITEM_START_ROW To ITEM_END_ROW
        ' Add taxable amounts
        If invoiceWs.Cells(i, "H").Value <> "" And IsNumeric(invoiceWs.Cells(i, "H").Value) Then
            invoiceData.TaxableTotal = invoiceData.TaxableTotal + invoiceWs.Cells(i, "H").Value
        End If
        
        ' Add tax amounts using constants
        If invoiceWs.Cells(i, CGST_AMOUNT_COL).Value <> "" And IsNumeric(invoiceWs.Cells(i, CGST_AMOUNT_COL).Value) Then
            invoiceData.CGSTTotal = invoiceData.CGSTTotal + invoiceWs.Cells(i, CGST_AMOUNT_COL).Value
        End If
        
        If invoiceWs.Cells(i, SGST_AMOUNT_COL).Value <> "" And IsNumeric(invoiceWs.Cells(i, SGST_AMOUNT_COL).Value) Then
            invoiceData.SGSTTotal = invoiceData.SGSTTotal + invoiceWs.Cells(i, SGST_AMOUNT_COL).Value
        End If
        
        If invoiceWs.Cells(i, IGST_AMOUNT_COL).Value <> "" And IsNumeric(invoiceWs.Cells(i, IGST_AMOUNT_COL).Value) Then
            invoiceData.IGSTTotal = invoiceData.IGSTTotal + invoiceWs.Cells(i, IGST_AMOUNT_COL).Value
        End If
        
        ' Collect item details (simplified for Phase 3)
        If Trim(invoiceWs.Cells(i, "C").Value) <> "" Then
            If hsnCodes <> "" Then hsnCodes = hsnCodes & "; "
            hsnCodes = hsnCodes & Trim(invoiceWs.Cells(i, "C").Value)
        End If
        
        If Trim(invoiceWs.Cells(i, "B").Value) <> "" Then
            If itemDescriptions <> "" Then itemDescriptions = itemDescriptions & "; "
            itemDescriptions = itemDescriptions & Trim(invoiceWs.Cells(i, "B").Value)
        End If
        
        If invoiceWs.Cells(i, "D").Value <> "" And IsNumeric(invoiceWs.Cells(i, "D").Value) Then
            invoiceData.TotalQuantity = invoiceData.TotalQuantity + invoiceWs.Cells(i, "D").Value
        End If
    Next i
    
    ' Store collected data
    invoiceData.HSNCodes = hsnCodes
    invoiceData.ItemDescriptions = itemDescriptions
    invoiceData.UOMList = uomList
    
    ' Calculate grand total
    invoiceData.GrandTotal = invoiceData.TaxableTotal + invoiceData.IGSTTotal + invoiceData.CGSTTotal + invoiceData.SGSTTotal
    
    CalculateInvoiceTotals = True
    Exit Function
    
CalculationError:
    MsgBox "Error calculating invoice totals: " & Err.Description, vbCritical, "Calculation Error"
    CalculateInvoiceTotals = False
End Function

Private Sub CalculateTaxRates(ByRef invoiceData As InvoiceDataRecord)
    ' Calculate tax rates based on totals and sale type
    If invoiceData.TaxableTotal > 0 Then
        If invoiceData.SaleType = "Interstate" Then
            invoiceData.IGSTRate = Format((invoiceData.IGSTTotal / invoiceData.TaxableTotal) * 100, "0.00") & "%"
            invoiceData.CGSTRate = "0.00%"
            invoiceData.SGSTRate = "0.00%"
        ElseIf invoiceData.SaleType = "Intrastate" Then
            invoiceData.IGSTRate = "0.00%"
            invoiceData.CGSTRate = Format((invoiceData.CGSTTotal / invoiceData.TaxableTotal) * 100, "0.00") & "%"
            invoiceData.SGSTRate = Format((invoiceData.SGSTTotal / invoiceData.TaxableTotal) * 100, "0.00") & "%"
        End If
    End If
End Sub

Private Function ConfirmSaveOperation(invoiceData As InvoiceDataRecord) As Boolean
    ' Confirm save operation with detailed summary
    Dim confirmMessage As String
    confirmMessage = "Confirm Invoice Save Operation" & vbCrLf & vbCrLf
    confirmMessage = confirmMessage & "Invoice Number: " & invoiceData.InvoiceNumber & vbCrLf
    confirmMessage = confirmMessage & "Customer: " & invoiceData.CustomerName & vbCrLf
    confirmMessage = confirmMessage & "Total Amount: Rs:" & Format(invoiceData.GrandTotal, "#,##0.00") & vbCrLf & vbCrLf
    confirmMessage = confirmMessage & "Do you want to save this invoice to the Master sheet?"
    
    ConfirmSaveOperation = (MsgBox(confirmMessage, vbYesNo + vbQuestion, "Confirm Save") = vbYes)
End Function

Private Function SaveInvoiceToMaster(masterWs As Worksheet, invoiceData As InvoiceDataRecord) As Boolean
    ' Save invoice data to master sheet with error handling and overwrite support
    On Error GoTo SaveError
    
    Dim lastRow As Long
    Dim targetRow As Long
    Dim i As Long
    Dim existingInvoiceNumber As String
    Dim foundExisting As Boolean
    
    ' Check if we need to overwrite an existing record
    foundExisting = False
    lastRow = masterWs.Cells(masterWs.Rows.Count, "A").End(xlUp).Row
    
    ' Search for existing invoice number to overwrite
    For i = 2 To lastRow
        existingInvoiceNumber = Trim(masterWs.Cells(i, "A").Value)
        If UCase(existingInvoiceNumber) = UCase(invoiceData.InvoiceNumber) Then
            targetRow = i ' Overwrite this row
            foundExisting = True
            Exit For
        End If
    Next i
    
    ' If not found, add to new row
    If Not foundExisting Then
        targetRow = lastRow + 1
    End If

    With masterWs
        .Cells(targetRow, "A").Value = invoiceData.InvoiceNumber
        .Cells(targetRow, "B").Value = invoiceData.InvoiceDate
        .Cells(targetRow, "C").Value = invoiceData.CustomerName
        .Cells(targetRow, "D").Value = invoiceData.CustomerGSTIN
        .Cells(targetRow, "E").Value = invoiceData.CustomerState
        .Cells(targetRow, "F").Value = invoiceData.CustomerStateCode
        .Cells(targetRow, "G").Value = invoiceData.TaxableTotal
        .Cells(targetRow, "H").Value = invoiceData.SaleType
        .Cells(targetRow, "I").Value = invoiceData.IGSTRate
        .Cells(targetRow, "J").Value = invoiceData.IGSTTotal
        .Cells(targetRow, "K").Value = invoiceData.CGSTRate
        .Cells(targetRow, "L").Value = invoiceData.CGSTTotal
        .Cells(targetRow, "M").Value = invoiceData.SGSTRate
        .Cells(targetRow, "N").Value = invoiceData.SGSTTotal
        .Cells(targetRow, "O").Value = invoiceData.IGSTTotal + invoiceData.CGSTTotal + invoiceData.SGSTTotal
        .Cells(targetRow, "P").Value = invoiceData.GrandTotal
        .Cells(targetRow, "Q").Value = invoiceData.HSNCodes
        .Cells(targetRow, "R").Value = invoiceData.ItemDescriptions
        .Cells(targetRow, "S").Value = invoiceData.TotalQuantity
        .Cells(targetRow, "T").Value = invoiceData.UOMList  ' FIX REQUIREMENT 4: Ensure UOM saves properly
        .Cells(targetRow, "U").Value = Now
        
        ' NOTE: Border formatting for Master sheet handled separately from invoice borders
        ' Master sheet uses standard Excel formatting for data tables
        .Range("A" & targetRow & ":U" & targetRow).Borders.LineStyle = xlContinuous
        .Range("A" & targetRow & ":U" & targetRow).Borders.Color = RGB(204, 204, 204)
    End With
    
    SaveInvoiceToMaster = True
    Exit Function
    
SaveError:
    MsgBox "Error saving to Master sheet: " & Err.Description, vbCritical, "Save Error"
    SaveInvoiceToMaster = False
End Function
