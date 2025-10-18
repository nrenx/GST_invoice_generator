Option Explicit
' Module 8: New Invoice Button
' Button function to generate a fresh invoice with next sequential number and cleared fields

Public Sub NewInvoiceButton()
    ' Generate a fresh invoice with next sequential number and cleared fields
    Dim ws As Worksheet
    Dim response As VbMsgBoxResult
    Dim nextInvoiceNumber As String
    Dim clearRow As Long
    Dim i As Long
    On Error GoTo ErrorHandler

    Set ws = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    
    ' Exit if required worksheet is missing
    If ws Is Nothing Then
        Exit Sub
    End If

    ' Confirm creating new invoice
    response = MsgBox("Create a new invoice?" & vbCrLf & "All current data will be cleared and a new invoice number will be generated.", vbYesNo + vbQuestion, "Confirm New Invoice")
    If response = vbNo Then Exit Sub

    ' Generate next sequential invoice number
    nextInvoiceNumber = GetNextInvoiceNumber()

    ' Clear and set invoice number (C7) with new sequential number
    With ws.Range("C7")
        .Value = nextInvoiceNumber
        .Font.Bold = True
        .Font.Color = RGB(220, 20, 60)  ' Red color for user input
        .HorizontalAlignment = xlCenter
        .VerticalAlignment = xlCenter
    End With

    ' Set current date for Invoice Date (C8) and Date of Supply (F9, G9)
    With ws.Range("C8")
        .Value = Format(Date, "dd/mm/yyyy")
        .Font.Bold = True
        .HorizontalAlignment = xlLeft
        .VerticalAlignment = xlCenter
    End With

    With ws.Range("F9")
        .Value = Format(Date, "dd/mm/yyyy")
        .Font.Bold = True
        .HorizontalAlignment = xlLeft
        .VerticalAlignment = xlCenter
    End With

    With ws.Range("G9")
        .Value = Format(Date, "dd/mm/yyyy")
        .Font.Bold = True
        .HorizontalAlignment = xlLeft
        .VerticalAlignment = xlCenter
    End With

    ' Reset state code to default (C10)
    With ws.Range("C10")
        .Value = "37"  ' Fixed value for Andhra Pradesh
        .Font.Bold = True
        .HorizontalAlignment = xlCenter
        .VerticalAlignment = xlCenter
    End With

    ' Clear all customer details (handle merged cells properly)
    On Error Resume Next
    ' Clear individual cells to avoid merged cell issues - Use individual cell references for merged ranges
    ws.Range("C12").Value = ""  ' Customer Name (merged C12:H12)
    ws.Range("C13").Formula = "=IFERROR(XLOOKUP(TRIM(C12), warehouse!$A:$A, warehouse!$B:$B, """", 0), """")"  ' Auto-populate address
    ws.Range("C14").Formula = "=IFERROR(XLOOKUP(TRIM(C12), warehouse!$A:$A, warehouse!$E:$E, """", 0), """")"  ' Auto-populate GSTIN
    ws.Range("C15").Value = ""  ' Customer State (merged C15:H15)
    
    ws.Range("K12").Value = ""  ' Consignee Name (merged K12:O12)
    ws.Range("K13").Formula = "=IFERROR(XLOOKUP(TRIM(K12), warehouse!$A:$A, warehouse!$B:$B, """", 0), """")"  ' Auto-populate address
    ws.Range("K14").Formula = "=IFERROR(XLOOKUP(TRIM(K12), warehouse!$A:$A, warehouse!$E:$E, """", 0), """")"  ' Auto-populate GSTIN
    ws.Range("K15").Value = ""  ' Consignee State (merged K15:O15)
    
    ws.Range("F7").Value = "By Lorry"   ' Reset Transport Mode
    ws.Range("F8").Value = ""           ' Clear Vehicle Number
    ws.Range("F10").Value = ""          ' Clear Place of Supply
    ws.Range("N10").Value = "Not Applicable"  ' Reset E-Way Bill No to default
    ws.Range("N7").Value = "Interstate" ' Reset Sale Type to default
    On Error GoTo ErrorHandler

    ' Clear item table data (rows 19-24, keep headers and formulas) - Use individual cell clearing
    ' CRITICAL: Only clear data fields, NOT formula/label cells
    Dim itemRow As Long
    For itemRow = 19 To 24  ' Item data rows (adjusted to match actual invoice structure)
        ' Clear only user input fields, preserve formulas
        ws.Range("A" & itemRow).Value = ""    ' Sr.No.
        ws.Range("B" & itemRow).Value = ""    ' Description
        ws.Range("C" & itemRow).Value = ""    ' HSN Code
        ws.Range("D" & itemRow).Value = ""    ' Quantity
        ws.Range("E" & itemRow).Value = ""    ' UOM
        ws.Range("F" & itemRow).Value = ""    ' Rate
        ' NOTE: Amount (G), Tax calculations (I-O) are FORMULAS - do NOT clear them
        ' These will auto-recalculate when data is entered
    Next itemRow
    
    ' Reset first Sr.No.
    ws.Range("A19").Value = 1

    ' Clear ONLY calculated VALUES in tax summary, NOT labels or formulas
    On Error Resume Next
    ' These cells should contain formulas that will recalculate automatically
    ' We're only clearing the ranges that contain user data or calculated values
    ' Tax summary labels and formulas are preserved
    
    ' Clear transport and document details (not formulas)
    ws.Range("J7").Value = ""   ' Challan No
    ws.Range("J9").Value = ""   ' L.R Number  
    ws.Range("J10").Value = ""  ' P.O Number
    
    ' Clear amount in words (this is typically a formula result)
    ws.Range("A32").Value = ""  ' Amount in words row (will be recalculated)
    On Error GoTo ErrorHandler

    ' Update tax calculations and ensure formulas are properly set
    Call SetupTaxCalculationFormulas(ws)
    Call UpdateMultiItemTaxCalculations(ws)
    
    ' Ensure all dropdowns are properly configured after clearing
    Call SetupAllDropdownValidations(ws)
    
    ' Ensure borders remain intact after clearing content
    On Error Resume Next
    ' Use centralized border management from Module 20
    Call ApplyStandardInvoiceBorders(ws)
    On Error GoTo ErrorHandler

    MsgBox "New invoice created successfully!" & vbCrLf & "Invoice Number: " & nextInvoiceNumber & vbCrLf & "Date: " & Format(Date, "dd/mm/yyyy"), vbInformation, "New Invoice Ready"

    ' Select a safe, non-merged cell and then activate the customer name area
    ws.Range("A1").Select
    ws.Range("C12").Activate
    Exit Sub

ErrorHandler:
    MsgBox "Error creating new invoice: " & Err.Description, vbCritical, "Error"
End Sub
