Option Explicit
' Master sheet operations, invoice records, and numbering system

' MASTER SHEET & INVOICE COUNTER FUNCTIONS

Public Sub CreateMasterSheet()
    Dim ws As Worksheet

    On Error Resume Next
    Set ws = ThisWorkbook.Sheets(MASTER_SHEET_NAME)
    If Not ws Is Nothing Then
        Application.DisplayAlerts = False
        ws.Delete
        Application.DisplayAlerts = True
    End If
    On Error GoTo 0

    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = MASTER_SHEET_NAME

    With ws
        ' GST invoice records for audit & return filing (A1:U1)
        ' GST-compliant headers for complete invoice records
        .Range("A1").Value = "Invoice_Number"
        .Range("B1").Value = "Invoice_Date"
        .Range("C1").Value = "Customer_Name"
        .Range("D1").Value = "Customer_GSTIN"
        .Range("E1").Value = "Customer_State"
        .Range("F1").Value = "Customer_State_Code"
        .Range("G1").Value = "Total_Taxable_Value"
        .Range("H1").Value = "Sale_Type"
        .Range("I1").Value = "IGST_Rate"
        .Range("J1").Value = "IGST_Amount"
        .Range("K1").Value = "CGST_Rate"
        .Range("L1").Value = "CGST_Amount"
        .Range("M1").Value = "SGST_Rate"
        .Range("N1").Value = "SGST_Amount"
        .Range("O1").Value = "Total_Tax_Amount"
        .Range("P1").Value = "Total_Invoice_Value"
        .Range("Q1").Value = "HSN_Codes"
        .Range("R1").Value = "Item_Description"
        .Range("S1").Value = "Quantity"
        .Range("T1").Value = "UOM"
        .Range("U1").Value = "Date_Created"

        ' Format GST audit headers
        .Range("A1:U1").Font.Bold = True
        .Range("A1:U1").Interior.Color = RGB(47, 80, 97)
        .Range("A1:U1").Font.Color = RGB(255, 255, 255)
        .Range("A1:U1").HorizontalAlignment = xlCenter
        .Range("A1:U1").WrapText = True
        .Rows(1).RowHeight = 30

        ' Add borders to header
        .Range("A1:U1").Borders.LineStyle = xlContinuous
        .Range("A1:U1").Borders.Color = RGB(204, 204, 204)

        ' Auto-fit columns for better visibility
        .Columns.AutoFit

        ' Set specific column widths for GST data
        .Columns("A").ColumnWidth = 20  ' Invoice Number
        .Columns("B").ColumnWidth = 15  ' Invoice Date
        .Columns("C").ColumnWidth = 30  ' Customer Name
        .Columns("D").ColumnWidth = 20  ' Customer GSTIN
        .Columns("E").ColumnWidth = 25  ' Customer State
        .Columns("F").ColumnWidth = 15  ' State Code
        .Columns("G").ColumnWidth = 20  ' Taxable Value
        .Columns("H").ColumnWidth = 15  ' Sale Type
        .Columns("I").ColumnWidth = 12  ' IGST Rate
        .Columns("J").ColumnWidth = 15  ' IGST Amount
        .Columns("K").ColumnWidth = 12  ' CGST Rate
        .Columns("L").ColumnWidth = 15  ' CGST Amount
        .Columns("M").ColumnWidth = 12  ' SGST Rate
        .Columns("N").ColumnWidth = 15  ' SGST Amount
        .Columns("O").ColumnWidth = 15  ' Total Tax
        .Columns("P").ColumnWidth = 20  ' Invoice Value
        .Columns("Q").ColumnWidth = 20  ' HSN Codes
        .Columns("R").ColumnWidth = 40  ' Item Description
        .Columns("S").ColumnWidth = 12  ' Quantity
        .Columns("T").ColumnWidth = 10  ' UOM
        .Columns("U").ColumnWidth = 20  ' Date Created

        ' Set professional sheet tab color
        .Tab.Color = RGB(34, 139, 34)  ' Forest green for Master records
        
        ' Freeze top row for easy navigation
        .Range("A2").Select
        ActiveWindow.FreezePanes = True

    End With
End Sub

Public Function GetNextInvoiceNumber() As String
    Dim masterWs As Worksheet
    Dim currentYear As Integer
    Dim counter As Integer
    Dim newInvoiceNumber As String
    Dim lastRow As Long
    Dim i As Long
    Dim maxCounter As Integer
    Dim invoiceNum As String

    On Error GoTo ErrorHandler

    ' Ensure supporting worksheets exist
    Call EnsureAllSupportingWorksheetsExist

    ' Get or create Master sheet using constants
    Set masterWs = GetOrCreateWorksheet(MASTER_SHEET_NAME)

    currentYear = Year(Date)
    maxCounter = 0

    ' Find the highest counter for the current year by examining existing invoice records
    lastRow = masterWs.Cells(masterWs.Rows.Count, "A").End(xlUp).Row

    If lastRow > 1 Then ' If there are invoice records
        For i = 2 To lastRow ' Start from row 2 (after header)
            invoiceNum = Trim(masterWs.Cells(i, "A").Value)
            If invoiceNum <> "" And InStr(invoiceNum, INVOICE_PREFIX & currentYear & "-") = 1 Then
                ' Extract counter from invoice number (format: INV-YYYY-NNN)
                maxCounter = Application.WorksheetFunction.Max(maxCounter, Val(Right(invoiceNum, 3)))
            End If
        Next i
    End If

    ' Set next counter
    counter = maxCounter + 1

    ' Generate new invoice number using constants
    newInvoiceNumber = INVOICE_PREFIX & currentYear & "-" & Format(counter, INVOICE_NUMBER_FORMAT)

    GetNextInvoiceNumber = newInvoiceNumber
    Exit Function

ErrorHandler:
    GetNextInvoiceNumber = INVOICE_PREFIX & Year(Date) & "-001"
End Function

Public Function GetCurrentInvoiceNumber() As String
    Dim masterWs As Worksheet
    Dim lastRow As Long
    Dim currentYear As Integer
    Dim maxCounter As Integer
    Dim i As Long
    Dim invoiceNum As String

    On Error GoTo ErrorHandler

    ' Ensure supporting worksheets exist
    Call EnsureAllSupportingWorksheetsExist

    Set masterWs = GetOrCreateWorksheet(MASTER_SHEET_NAME)
    currentYear = Year(Date)
    maxCounter = 0

    If masterWs Is Nothing Then
        GetCurrentInvoiceNumber = "INV-" & currentYear & "-001"
        Exit Function
    End If

    ' Find the highest counter for the current year
    lastRow = masterWs.Cells(masterWs.Rows.Count, "A").End(xlUp).Row

    If lastRow > 1 Then ' If there are invoice records
        For i = 2 To lastRow ' Start from row 2 (after header)
            invoiceNum = Trim(masterWs.Cells(i, "A").Value)
            If invoiceNum <> "" And InStr(invoiceNum, "INV-" & currentYear & "-") = 1 Then
                ' Extract counter from invoice number
                maxCounter = Application.WorksheetFunction.Max(maxCounter, Val(Right(invoiceNum, 3)))
            End If
        Next i
    End If

    If maxCounter = 0 Then
        GetCurrentInvoiceNumber = "INV-" & currentYear & "-001"
    Else
        GetCurrentInvoiceNumber = "INV-" & currentYear & "-" & Format(maxCounter, "000")
    End If
    Exit Function

ErrorHandler:
    GetCurrentInvoiceNumber = "INV-" & Year(Date) & "-001"
End Function

Public Sub ResetInvoiceCounter()
    Dim response As VbMsgBoxResult
    Dim masterWs As Worksheet
    Dim lastRow As Long

    response = MsgBox("WARNING: This will clear all invoice records from the Master sheet!" & vbCrLf & vbCrLf & _
                     "The invoice counter is based on existing records in the Master sheet." & vbCrLf & _
                     "To reset numbering, you need to clear the Master sheet." & vbCrLf & vbCrLf & _
                     "Are you sure you want to proceed?", vbYesNo + vbCritical, "Reset Invoice Counter")

    If response = vbYes Then
        Set masterWs = GetOrCreateWorksheet(MASTER_SHEET_NAME)

        If Not masterWs Is Nothing Then
            ' Clear all invoice records (keep only the header row)
            lastRow = masterWs.Cells(masterWs.Rows.Count, "A").End(xlUp).Row
            If lastRow > 1 Then
                masterWs.Range("A2:P" & lastRow).ClearContents
            End If
            MsgBox "All invoice records cleared! Next invoice will be INV-" & Year(Date) & "-001", vbInformation, "Reset Complete"
        Else
            MsgBox "Master sheet not found!", vbExclamation
        End If
    End If
End Sub