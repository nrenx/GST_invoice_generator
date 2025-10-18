Option Explicit
' Module 7: Add Customer to Warehouse Button
' Button function to capture customer details from current invoice and save to warehouse

Public Sub AddCustomerToWarehouseButton()
    ' Capture customer details from current invoice and save to warehouse
    Dim invoiceWs As Worksheet
    Dim warehouseWs As Worksheet
    Dim customerName As String, address As String, gstin As String, stateCode As String
    Dim lastRow As Long
    Dim i As Long
    Dim newRow As Long
    Dim duplicateRow As Long
    Dim userChoice As VbMsgBoxResult
    On Error GoTo ErrorHandler

    ' Get worksheets with validation
    Set invoiceWs = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    Set warehouseWs = GetRequiredWorksheet(WAREHOUSE_SHEET_NAME)
    
    ' Exit if any required worksheet is missing
    If invoiceWs Is Nothing Or warehouseWs Is Nothing Then
        Exit Sub
    End If

    ' Get customer details from invoice using constants and proper field extraction
    customerName = Trim(invoiceWs.Range(CUSTOMER_NAME_CELL).Value)
    address = Trim(invoiceWs.Range("C13").Value)  ' Extract ONLY the address field from C13
    gstin = Trim(invoiceWs.Range(CUSTOMER_GSTIN_CELL).Value)
    stateCode = Trim(invoiceWs.Range("C10").Value)
    
    ' Get state name from C15 (not concatenating with address)
    Dim stateName As String
    stateName = Trim(invoiceWs.Range("C15").Value)

    ' Validate required fields
    If customerName = "" Then
        MsgBox "Please enter customer name before adding to warehouse.", vbExclamation, "Missing Information"
        Exit Sub
    End If

    ' Check for duplicates in warehouse (Customer section - columns A-G)
    lastRow = warehouseWs.Cells(warehouseWs.Rows.Count, "A").End(xlUp).Row
    duplicateRow = 0

    For i = 2 To lastRow ' Start from row 2 (skip header)
        If UCase(Trim(warehouseWs.Cells(i, "A").Value)) = UCase(customerName) Then
            duplicateRow = i
            Exit For
        End If
    Next i

    ' Handle duplicate customer with professional options
    If duplicateRow > 0 Then
        userChoice = MsgBox("Customer '" & customerName & "' already exists in warehouse." & vbCrLf & vbCrLf & _
                           "Choose an action:" & vbCrLf & _
                           "YES = Overwrite existing customer data" & vbCrLf & _
                           "NO = Add as new entry (duplicate)" & vbCrLf & _
                           "CANCEL = Do nothing", _
                           vbYesNoCancel + vbQuestion, "Duplicate Customer Found")
        
        Select Case userChoice
            Case vbYes ' Overwrite existing
                newRow = duplicateRow
            Case vbNo ' Add as new entry
                newRow = lastRow + 1
            Case vbCancel ' Cancel operation
                Exit Sub
        End Select
    Else
        ' No duplicate, add to next available row
        newRow = lastRow + 1
    End If

    ' UPDATED WAREHOUSE STRUCTURE per requirements (No GST Status column):
    warehouseWs.Cells(newRow, "A").Value = customerName     ' Column A: Customer Name
    warehouseWs.Cells(newRow, "B").Value = address          ' Column B: Address (only address, not concatenated)
    warehouseWs.Cells(newRow, "C").Value = stateName        ' Column C: State (from C15, not concatenated)
    warehouseWs.Cells(newRow, "D").Value = stateCode        ' Column D: State Code
    warehouseWs.Cells(newRow, "E").Value = gstin            ' Column E: GSTIN (removed GST Status)
    warehouseWs.Cells(newRow, "F").Value = ""               ' Column F: Phone (empty for manual entry)
    warehouseWs.Cells(newRow, "G").Value = ""               ' Column G: Email (empty for manual entry)

    ' Auto-fit columns for better visibility (updated for new structure)
    warehouseWs.Columns("A:G").AutoFit
    ' Set minimum column widths for clarity
    warehouseWs.Columns("A").ColumnWidth = 20  ' Customer Name
    warehouseWs.Columns("B").ColumnWidth = 30  ' Address
    warehouseWs.Columns("C").ColumnWidth = 15  ' State
    warehouseWs.Columns("D").ColumnWidth = 12  ' State Code
    warehouseWs.Columns("E").ColumnWidth = 18  ' GSTIN
    warehouseWs.Columns("F").ColumnWidth = 15  ' Phone
    warehouseWs.Columns("G").ColumnWidth = 25  ' Email

    ' Show success message based on action taken
    If duplicateRow > 0 And userChoice = vbYes Then
        MsgBox "Customer '" & customerName & "' updated successfully!" & vbCrLf & _
               "State: " & stateName & " (" & stateCode & ")" & vbCrLf & _
               "GSTIN: " & gstin, vbInformation, "Customer Updated"
    Else
        MsgBox "Customer '" & customerName & "' added successfully to warehouse!" & vbCrLf & _
               "State: " & stateName & " (" & stateCode & ")" & vbCrLf & _
               "GSTIN: " & gstin, vbInformation, "Customer Added"
    End If
    Exit Sub

ErrorHandler:
    MsgBox "Error adding customer: " & Err.Description, vbCritical, "Error"
End Sub
