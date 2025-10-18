Option Explicit
' Module 11: Print Button
' Button function to save as PDF and then send to default printer

Public Sub PrintButton()
    ' Save as PDF and then send to default printer
    Dim ws As Worksheet
    Dim invoiceNumber As String
    Dim response As VbMsgBoxResult
    On Error GoTo ErrorHandler

    Set ws = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    
    ' Exit if required worksheet is missing
    If ws Is Nothing Then
        Exit Sub
    End If

    ' Get invoice number using constants
    invoiceNumber = Trim(ws.Range(INVOICE_NUMBER_CELL).Value)

    If invoiceNumber = "" Then
        MsgBox "Please ensure invoice number is filled before printing.", vbExclamation, "Missing Invoice Number"
        Exit Sub
    End If

    ' First, save as PDF (call the PDF export function)
    Call PrintAsPDFButton

    ' Configure print settings - UPDATED FOR NEW LAYOUT STRUCTURE (macOS compatible)
    On Error Resume Next  ' Handle macOS PageSetup compatibility issues
    With ws.PageSetup
        .PrintArea = "A1:O40"  ' Updated to match new layout with enhanced structure
        .Orientation = xlPortrait
        .PaperSize = xlPaperA4
        .FitToPagesWide = 1
        .FitToPagesTall = 1
        .LeftMargin = Application.InchesToPoints(0.25)  ' Optimized margins
        .RightMargin = Application.InchesToPoints(0.25)
        .TopMargin = Application.InchesToPoints(0.25)
        .BottomMargin = Application.InchesToPoints(0.25)
        .CenterHorizontally = True
        .CenterVertically = False
        .PrintComments = xlPrintNoComments
        .PrintErrors = xlPrintErrorsDisplayed
        ' REMOVED: .PrintQuality = 600 (not supported on macOS Excel)
    End With
    On Error GoTo ErrorHandler  ' Resume error handling

    ' Confirm printing
    response = MsgBox("Send invoice " & invoiceNumber & " to printer?" & vbCrLf & _
                     "PDF has been saved to: /Users/narendrachowdary/BNC/gst invoices/", _
                     vbYesNo + vbQuestion, "Confirm Print")

    If response = vbYes Then
        ' Print the invoice
        ws.PrintOut Copies:=1, Preview:=False, ActivePrinter:=""

        MsgBox "Invoice " & invoiceNumber & " sent to printer successfully!" & vbCrLf & _
               "PDF copy saved to: /Users/narendrachowdary/BNC/gst invoices/", _
               vbInformation, "Print Complete"
    End If

    Exit Sub

ErrorHandler:
    MsgBox "Error printing invoice: " & Err.Description, vbCritical, "Print Error"
End Sub
