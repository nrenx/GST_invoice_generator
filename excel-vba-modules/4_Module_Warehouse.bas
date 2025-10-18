Option Explicit
' Customer data management in the warehouse sheet

Public Sub CreateWarehouseSheet()
    ' Creates the warehouse sheet focused on customer data management
    
    Dim ws As Worksheet

    On Error Resume Next
    Set ws = ThisWorkbook.Sheets(WAREHOUSE_SHEET_NAME)
    If Not ws Is Nothing Then
        Application.DisplayAlerts = False
        ws.Delete
        Application.DisplayAlerts = True
    End If
    On Error GoTo 0

    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = WAREHOUSE_SHEET_NAME

    With ws
        ' Customer master data section (Columns A-G) - UPDATED STRUCTURE (Removed GST Status)
        
        ' Updated customer headers per requirements - GSTIN only, no status
        .Range("A1").Value = "Customer_Name"
        .Range("B1").Value = "Address"          ' Renamed from Address_Line1
        .Range("C1").Value = "State"            ' Moved to Column C  
        .Range("D1").Value = "State_Code"       ' Moved to Column D
        .Range("E1").Value = "GSTIN"            ' GST Number (removed GST Status column)
        .Range("F1").Value = "Phone"
        .Range("G1").Value = "Email"
        ' Note: Removed Address_Line2 as requested

        ' Format customer headers
        .Range("A1:G1").Font.Bold = True
        .Range("A1:G1").Interior.Color = RGB(47, 80, 97)
        .Range("A1:G1").Font.Color = RGB(255, 255, 255)
        .Range("A1:G1").Borders.Color = RGB(204, 204, 204)

        ' Formatting & protection
        
        ' Set optimized column widths for clarity (as requested - sheet dedicated to these details)
        .Columns("A").ColumnWidth = 20  ' Customer Name
        .Columns("B").ColumnWidth = 30  ' Address
        .Columns("C").ColumnWidth = 15  ' State
        .Columns("D").ColumnWidth = 12  ' State Code
        .Columns("E").ColumnWidth = 18  ' GSTIN
        .Columns("F").ColumnWidth = 15  ' Phone
        .Columns("G").ColumnWidth = 25  ' Email
        .Columns("H").ColumnWidth = 25  ' Email
        
        ' Add borders to header row only
        .Range("A1:H1").Borders.Color = RGB(204, 204, 204)
        
        ' Freeze top row
        .Range("A2").Select
        ActiveWindow.FreezePanes = True
        
        ' Set sheet tab color
        .Tab.Color = RGB(70, 130, 180)  ' Steel blue
    End With
    
    Exit Sub

ErrorHandler:
    MsgBox "Error creating warehouse sheet: " & Err.Description, vbCritical, "Sheet Creation Error"
End Sub

' CUSTOMER DATA MANAGEMENT FUNCTIONS

Public Sub SetupCustomerDropdown(invoiceWs As Worksheet)
    ' Setup customer dropdown using warehouse customer data
    
    Dim warehouseWs As Worksheet
    On Error Resume Next

    ' Ensure warehouse sheet exists
    If GetOrCreateWorksheet(WAREHOUSE_SHEET_NAME) Is Nothing Then
        Call CreateWarehouseSheet
    End If
    
    Set warehouseWs = GetOrCreateWorksheet(WAREHOUSE_SHEET_NAME)
    If warehouseWs Is Nothing Then Exit Sub

    With invoiceWs
        ' Customer Name dropdown (C12) - using new customer data location
        .Range("C12").Validation.Delete
        .Range("C12").Validation.Add Type:=xlValidateList, _
                                    AlertStyle:=xlValidAlertWarning, _
                                    Formula1:="=" & WAREHOUSE_SHEET_NAME & "!$A$2:$A$20"
        .Range("C12").Validation.ShowError = False
        .Range("C12").Validation.InCellDropdown = True
        
        ' Setup similar dropdown for consignee section if needed
        .Range("K12").Validation.Delete
        .Range("K12").Validation.Add Type:=xlValidateList, _
                                    AlertStyle:=xlValidAlertWarning, _
                                    Formula1:="=" & WAREHOUSE_SHEET_NAME & "!$A$2:$A$20"
        .Range("K12").Validation.ShowError = False
        .Range("K12").Validation.InCellDropdown = True
    End With

    On Error GoTo 0
End Sub

Public Function GetCustomerDetails(customerName As String) As Variant
    ' Get customer details from warehouse sheet using new structure
    
    Dim warehouseWs As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim customerDetails(7) As String  ' Array to hold customer details

    On Error GoTo ErrorHandler

    ' Initialize array with empty values
    For i = 0 To 7
        customerDetails(i) = ""
    Next i

    ' Ensure warehouse worksheet exists
    Set warehouseWs = GetOrCreateWorksheet(WAREHOUSE_SHEET_NAME)
    If warehouseWs Is Nothing Then GoTo ErrorHandler

    ' Find customer in warehouse data (Column A)
    lastRow = warehouseWs.Cells(warehouseWs.Rows.Count, "A").End(xlUp).Row

    For i = 2 To lastRow ' Start from row 2 (skip header)
        If Trim(LCase(warehouseWs.Cells(i, "A").Value)) = Trim(LCase(customerName)) Then
            customerDetails(0) = warehouseWs.Cells(i, "A").Value  ' Customer Name
            customerDetails(1) = warehouseWs.Cells(i, "B").Value  ' Address Line 1
            customerDetails(2) = warehouseWs.Cells(i, "C").Value  ' Address Line 2
            customerDetails(3) = warehouseWs.Cells(i, "D").Value  ' State
            customerDetails(4) = warehouseWs.Cells(i, "E").Value  ' State Code
            customerDetails(5) = warehouseWs.Cells(i, "F").Value  ' GSTIN
            customerDetails(6) = warehouseWs.Cells(i, "G").Value  ' Phone
            customerDetails(7) = warehouseWs.Cells(i, "H").Value  ' Email
            Exit For
        End If
    Next i

    GetCustomerDetails = customerDetails
    Exit Function

ErrorHandler:
    GetCustomerDetails = customerDetails
End Function

Public Sub AddNewCustomer(customerName As String, address1 As String, address2 As String, _
                         state As String, stateCode As String, gstin As String, _
                         phone As String, email As String)
    ' Add new customer to warehouse sheet
    
    Dim warehouseWs As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim newRow As Long
    On Error GoTo ErrorHandler

    ' Ensure warehouse worksheet exists
    Set warehouseWs = GetOrCreateWorksheet(WAREHOUSE_SHEET_NAME)
    If warehouseWs Is Nothing Then Exit Sub

    ' Check for duplicates
    lastRow = warehouseWs.Cells(warehouseWs.Rows.Count, "A").End(xlUp).Row
    For i = 2 To lastRow
        If Trim(LCase(warehouseWs.Cells(i, "A").Value)) = Trim(LCase(customerName)) Then
            MsgBox "Customer '" & customerName & "' already exists in warehouse.", vbExclamation, "Duplicate Customer"
            Exit Sub
        End If
    Next i

    ' Add new customer to next available row
    newRow = lastRow + 1
    With warehouseWs
        .Cells(newRow, "A").Value = customerName    ' Customer Name
        .Cells(newRow, "B").Value = address1        ' Address Line 1
        .Cells(newRow, "C").Value = address2        ' Address Line 2
        .Cells(newRow, "D").Value = state           ' State
        .Cells(newRow, "E").Value = stateCode       ' State Code
        .Cells(newRow, "F").Value = gstin           ' GSTIN
        .Cells(newRow, "G").Value = phone           ' Phone
        .Cells(newRow, "H").Value = email           ' Email
    End With

    MsgBox "Customer '" & customerName & "' added successfully to warehouse.", vbInformation, "Customer Added"
    Exit Sub

ErrorHandler:
    MsgBox "Error adding customer: " & Err.Description, vbCritical, "Error"
End Sub

' Legacy functions for backward compatibility
Public Sub SetupHSNDropdown(invoiceWs As Worksheet)
    ' Legacy function - redirects to new Dropdowns module
    Call SetupAllDropdownValidations(invoiceWs)
End Sub

Public Function GetHSNDetails(hsnCode As String) As Variant
    ' Legacy function - still functional but now uses Dropdowns sheet
    Dim dropdownWs As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim hsnDetails(4) As String  ' Array to hold HSN details

    On Error GoTo ErrorHandler

    ' Initialize array
    For i = 0 To 4
        hsnDetails(i) = ""
    Next i

    ' Get dropdowns worksheet
    Set dropdownWs = GetOrCreateWorksheet(DROPDOWNS_SHEET_NAME)
    If dropdownWs Is Nothing Then GoTo ErrorHandler

    ' Find HSN code in dropdowns data
    lastRow = dropdownWs.Cells(dropdownWs.Rows.Count, "A").End(xlUp).Row
    For i = 2 To lastRow
        If Trim(LCase(dropdownWs.Cells(i, "A").Value)) = Trim(LCase(hsnCode)) Then
            hsnDetails(0) = dropdownWs.Cells(i, "A").Value  ' HSN Code
            hsnDetails(1) = dropdownWs.Cells(i, "B").Value  ' Description
            hsnDetails(2) = dropdownWs.Cells(i, "C").Value  ' UOM
            hsnDetails(3) = dropdownWs.Cells(i, "D").Value  ' Rate
            hsnDetails(4) = dropdownWs.Cells(i, "E").Value  ' Tax Rate
            Exit For
        End If
    Next i

    GetHSNDetails = hsnDetails
    Exit Function

ErrorHandler:
    GetHSNDetails = hsnDetails
End Function

' WORKSHEET CREATION & DATA VALIDATION
' Note: Duplicate CreateWarehouseSheetOldRemoved function removed
' All dropdown data moved to 6_Module_Dropdowns.bas
' Note: SetupDataValidation moved to Module_InvoiceEvents

' ===== CUSTOMER DATABASE INTEGRATION =====
        ' ===== SECTION 1: HSN/SAC DATA (Columns A-E) =====
        ' HSN headers
        .Range("A1").Value = "HSN_Code"
        .Range("B1").Value = "Description"
        .Range("C1").Value = "CGST_Rate"
        .Range("D1").Value = "SGST_Rate"
        .Range("E1").Value = "IGST_Rate"

        ' Format HSN headers
        .Range("A1:E1").Font.Bold = True
        .Range("A1:E1").Interior.Color = RGB(47, 80, 97)
        .Range("A1:E1").Font.Color = RGB(255, 255, 255)
        .Range("A1:E1").HorizontalAlignment = xlCenter

        ' HSN data centralized in Module 6 (Dropdowns) - removed duplicate here

        ' ===== SECTION 2: VALIDATION LISTS =====
        ' Validation lists are centralized in Dropdowns sheet (Module 6)
        ' This warehouse sheet tracks usage patterns only

        ' ===== SECTION 3: CUSTOMER MASTER DATA (Columns M-T) =====
        ' Customer headers (restored to original positions)
        .Range("M1").Value = "Customer_Name"
        .Range("N1").Value = "Address_Line1"
        .Range("O1").Value = "State"
        .Range("P1").Value = "State_Code"
        .Range("Q1").Value = "GSTIN"
        .Range("R1").Value = "Phone"
        .Range("S1").Value = "Email"
        .Range("T1").Value = "Contact_Person"

        ' GST Type List (Column X)
        .Range("X1").Value = "GST_Type"
        .Range("X1").Font.Bold = True
        .Range("X1").Interior.Color = RGB(47, 80, 97)
        .Range("X1").Font.Color = RGB(255, 255, 255)
        .Range("X2").Value = "UNREGISTERED"
        
        ' Description List (Column Z)
        .Range("Z1").Value = "Description"
        .Range("Z1").Font.Bold = True
        .Range("Z1").Interior.Color = RGB(47, 80, 97)
        .Range("Z1").Font.Color = RGB(255, 255, 255)
        .Range("Z2").Value = "Casurina Wood"

        ' Sale Type List (Column AA)
        .Range("AA1").Value = "Sale_Type_List"
        .Range("AA1").Font.Bold = True
        .Range("AA1").Interior.Color = RGB(47, 80, 97)
        .Range("AA1").Font.Color = RGB(255, 255, 255)
        .Range("AA2").Value = "Interstate"
        .Range("AA3").Value = "Intrastate"

        ' Increase column widths for customer data
        .Columns("M:T").ColumnWidth = 25

        ' Format customer headers
        .Range("M1:T1").Font.Bold = True
        .Range("M1:T1").Interior.Color = RGB(47, 80, 97)
        .Range("M1:T1").Font.Color = RGB(255, 255, 255)
        .Range("M1:T1").HorizontalAlignment = xlCenter

        ' Add sample customer data (simplified structure)
        ' Customer data is intentionally left blank for the user to populate.

        ' Auto-fit columns for other sections
        .Columns("A:L").AutoFit

        ' Add borders to all sections
        ' HSN data borders
        .Range("A1:E" & UBound(hsnData) + 2).Borders.LineStyle = xlContinuous
        .Range("A1:E" & UBound(hsnData) + 2).Borders.Color = RGB(204, 204, 204)

        ' Validation lists borders
        .Range("G1:G" & UBound(uomList) + 2).Borders.LineStyle = xlContinuous
        .Range("H1:H" & UBound(transportList) + 2).Borders.LineStyle = xlContinuous
        .Range("J1:J" & UBound(stateList) + 2).Borders.LineStyle = xlContinuous
        .Range("K1:K" & UBound(stateCodeList) + 2).Borders.LineStyle = xlContinuous

        ' Customer data borders
        .Range("M1:T1").Borders.LineStyle = xlContinuous
        .Range("M1:T1").Borders.Color = RGB(204, 204, 204)
End Sub

' ===== HSN/SAC CODE LOOKUP SYSTEM =====
' HSN data is centralized in Dropdowns sheet (Module 6)
