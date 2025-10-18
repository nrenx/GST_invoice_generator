Option Explicit
' Module 10: Print as PDF Button  
' Button function to export invoice as a two-page PDF (Original and Duplicate)
' Enhanced macOS compatibility

Public Sub PrintAsPDFButton()
    ' Export invoice as a two-page PDF (Original and Duplicate)
    Dim originalWs As Worksheet
    Dim duplicateWs As Worksheet
    Dim invoiceNumber As String
    Dim cleanInvoiceNumber As String
    Dim pdfPath As String
    Dim fullPath As String
    Dim fso As Object
    Dim cell As Range
    On Error GoTo ErrorHandler

    Set originalWs = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    
    ' Exit if required worksheet is missing
    If originalWs Is Nothing Then
        Exit Sub
    End If

    ' Ensure warehouse worksheet exists to prevent file dialog errors
    Call EnsureAllSupportingWorksheetsExist

    ' Get invoice number for filename using constants
    invoiceNumber = Trim(originalWs.Range(INVOICE_NUMBER_CELL).Value)

    If invoiceNumber = "" Then
        MsgBox "Please ensure invoice number is filled before exporting to PDF.", vbExclamation, "Missing Invoice Number"
        Exit Sub
    End If

    ' Clean invoice number for filename
    cleanInvoiceNumber = Replace(Replace(Replace(invoiceNumber, "/", "-"), "\", "-"), ":", "-")

    ' Set PDF export path with dynamic user detection
    pdfPath = GetPDFExportPath()

    ' Validate and create directory with enhanced error handling
    On Error Resume Next
    Call CreateDirectoryIfNotExists(pdfPath)
    If Err.Number <> 0 Then
        ' Try Desktop as fallback if main path fails
        pdfPath = Environ("HOME") & "/Desktop/"
        Call CreateDirectoryIfNotExists(pdfPath)
        If Err.Number <> 0 Then
            MsgBox "Cannot create directory for PDF export. Using Desktop as fallback.", vbExclamation, "Directory Warning"
        End If
    End If
    On Error GoTo PDFExportError

    ' Full filename with path (ensure clean filename)
    If cleanInvoiceNumber = "" Then cleanInvoiceNumber = "GST_Invoice_" & Format(Now, "yyyymmdd_hhmmss")
    fullPath = pdfPath & cleanInvoiceNumber & ".pdf"

    ' Validate the full path length (macOS has path length limits)
    If Len(fullPath) > 255 Then
        cleanInvoiceNumber = "Invoice_" & Format(Now, "yyyymmdd")
        fullPath = pdfPath & cleanInvoiceNumber & ".pdf"
    End If

    ' Delete any existing temporary sheet to avoid errors
    Application.DisplayAlerts = False
    On Error Resume Next
    ThisWorkbook.Sheets("DuplicateInvoiceTemp").Delete
    On Error GoTo 0
    Application.DisplayAlerts = True

    ' Create a temporary duplicate of the invoice sheet (ENHANCED METHOD)
    Application.DisplayAlerts = False

    ' Copy the original sheet to create duplicate
    originalWs.Copy After:=originalWs

    ' Get reference to the newly created sheet (more reliable method)
    Set duplicateWs = Nothing
    On Error Resume Next
    Set duplicateWs = ThisWorkbook.Sheets(originalWs.Index + 1)
    On Error GoTo 0

    ' Fallback method if the above fails
    If duplicateWs Is Nothing Then
        Set duplicateWs = ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)
    End If

    ' Ensure we have a valid duplicate sheet
    If duplicateWs Is Nothing Then
        Application.DisplayAlerts = True
        MsgBox "Failed to create duplicate sheet for PDF export.", vbCritical, "PDF Export Error"
        Exit Sub
    End If

    duplicateWs.Name = "DuplicateInvoiceTemp"
    Application.DisplayAlerts = True

    ' Change the header on the duplicate sheet to "DUPLICATE"
    duplicateWs.Range("A1").Value = "DUPLICATE"

    ' Ensure both sheets have identical content except for the header
    ' Copy all data from original to duplicate (except A1) - UPDATED RANGE TO O40
    ' Use PasteSpecial with xlPasteValues to avoid warehouse reference issues
    On Error Resume Next
    originalWs.Range("A2:O40").Copy
    duplicateWs.Range("A2").PasteSpecial Paste:=xlPasteValues
    duplicateWs.Range("A2").PasteSpecial Paste:=xlPasteFormats
    Application.CutCopyMode = False
    On Error GoTo PDFExportError

    ' OPTIMIZE PDF LAYOUT - Updated for new row structure (ends at row 38)
    ' Set print area and page setup for the original sheet - OPTIMIZED FOR ENHANCED LAYOUT AND SCALING
    On Error Resume Next  ' Handle macOS PageSetup compatibility issues
    originalWs.PageSetup.PrintArea = "A1:O40"  ' Updated to include all rows up to row 40
    With originalWs.PageSetup
        .Orientation = xlPortrait
        .PaperSize = xlPaperA4
        .Zoom = False
        .FitToPagesWide = 1
        .FitToPagesTall = 1
        .LeftMargin = Application.InchesToPoints(0.15)  ' Reduced margins for more content space
        .RightMargin = Application.InchesToPoints(0.15)
        .TopMargin = Application.InchesToPoints(0.15)
        .BottomMargin = Application.InchesToPoints(0.15)
        .HeaderMargin = Application.InchesToPoints(0.1)
        .FooterMargin = Application.InchesToPoints(0.1)
        .CenterHorizontally = True
        .CenterVertically = True  ' Enable vertical centering for better appearance
        .BlackAndWhite = False  ' Ensure colors are preserved
    End With
    On Error GoTo PDFExportError  ' Resume error handling

    ' Set print area and page setup for the duplicate sheet - OPTIMIZED FOR ENHANCED LAYOUT AND SCALING
    On Error Resume Next  ' Handle macOS PageSetup compatibility issues
    duplicateWs.PageSetup.PrintArea = "A1:O40"  ' Updated to include all rows up to row 40
    With duplicateWs.PageSetup
        .Orientation = xlPortrait
        .PaperSize = xlPaperA4
        .Zoom = False
        .FitToPagesWide = 1
        .FitToPagesTall = 1
        .LeftMargin = Application.InchesToPoints(0.15)  ' Reduced margins for more content space
        .RightMargin = Application.InchesToPoints(0.15)
        .TopMargin = Application.InchesToPoints(0.15)
        .BottomMargin = Application.InchesToPoints(0.15)
        .HeaderMargin = Application.InchesToPoints(0.1)
        .FooterMargin = Application.InchesToPoints(0.1)
        .CenterHorizontally = True
        .CenterVertically = True  ' Enable vertical centering for better appearance
        .BlackAndWhite = False  ' Ensure colors are preserved
    End With
    On Error GoTo PDFExportError  ' Resume error handling

    ' ENHANCED PDF EXPORT with better quality and error handling
    On Error GoTo PDFExportError

    ' Apply PDF-optimized formatting before export
    On Error Resume Next
    ' Use centralized border management from Module 19
    Call ApplyStandardInvoiceBorders(originalWs)
    Call ApplyStandardInvoiceBorders(duplicateWs)
    On Error GoTo PDFExportError

    ' Verify we only have the two invoice sheets we want to export
    Dim totalSheets As Integer
    totalSheets = ThisWorkbook.Sheets.Count

    ' macOS-Compatible PDF Export Method
    On Error GoTo PDFExportError

    ' ENHANCED PDF EXPORT METHOD - Ensure only invoice sheets are exported
    On Error GoTo PDFExportError

    ' Verify both sheets exist before export
    If originalWs Is Nothing Or duplicateWs Is Nothing Then
        MsgBox "Error: Invoice sheets not found for PDF export.", vbCritical, "PDF Export Error"
        Exit Sub
    End If

    ' Method 1: Export both invoice sheets to a single PDF using explicit sheet names
    Dim sheetNames As Variant
    sheetNames = Array(originalWs.Name, duplicateWs.Name)

    ' Select only the two invoice sheets (Original and Duplicate)
    ThisWorkbook.Sheets(sheetNames).Select

    ' Export the selected sheets as a single PDF
    ActiveSheet.ExportAsFixedFormat Type:=xlTypePDF, _
                                    Filename:=fullPath, _
                                    Quality:=xlQualityStandard, _
                                    IgnorePrintAreas:=False, _
                                    OpenAfterPublish:=False

    ' Restore worksheet formatting after PDF export
    On Error Resume Next
    ' Use centralized border management from Module 19
    Call ApplyStandardInvoiceBorders(originalWs)
    On Error GoTo PDFExportError

    ' Clean up the temporary duplicate sheet
    Application.DisplayAlerts = False
    On Error Resume Next
    If Not duplicateWs Is Nothing Then
        duplicateWs.Delete
    End If
    On Error GoTo 0
    Application.DisplayAlerts = True

    ' Select the original invoice sheet
    originalWs.Select

    ' Success message with detailed information
    MsgBox "SUCCESS: Invoice exported successfully as a 2-page PDF!" & vbCrLf & vbCrLf & _
           " Page 1: ORIGINAL (for recipient)" & vbCrLf & _
           " Page 2: DUPLICATE (for driver/transport)" & vbCrLf & vbCrLf & _
           " File: " & cleanInvoiceNumber & ".pdf" & vbCrLf & _
           " Location: " & pdfPath, vbInformation, "PDF Export Complete"
    Exit Sub

PDFExportError:
    ' Enhanced PDF export error handling with fallback method
    If Err.Number <> 0 Then
        ' Clean up the temporary sheet first
        On Error Resume Next
        Application.DisplayAlerts = False
        If Not duplicateWs Is Nothing Then duplicateWs.Delete
        Application.DisplayAlerts = True
        On Error GoTo 0

        ' Try fallback method: Export only the original sheet
        On Error Resume Next
        Dim fallbackPath As String
        fallbackPath = Replace(fullPath, ".pdf", "_single.pdf")

        originalWs.Select
        originalWs.ExportAsFixedFormat Type:=xlTypePDF, _
                                       Filename:=fallbackPath, _
                                       Quality:=xlQualityStandard, _
                                       IgnorePrintAreas:=False, _
                                       OpenAfterPublish:=False

        If Err.Number = 0 Then
            ' Fallback succeeded
            MsgBox "PDF Export Successful (Single Page)!" & vbCrLf & _
                   "File: " & Dir(fallbackPath) & vbCrLf & _
                   "Location: " & Left(fallbackPath, InStrRev(fallbackPath, "/")) & vbCrLf & vbCrLf & _
                   "Note: Only the original invoice was exported due to macOS compatibility.", _
                   vbInformation, "PDF Export Complete"
            originalWs.Select
            Exit Sub
        End If
        On Error GoTo 0
    End If

    ' If fallback also failed, show detailed error
    Dim macOSErrorMsg As String
    macOSErrorMsg = "PDF Export Failed (macOS Troubleshooting):" & vbCrLf & vbCrLf & _
                    "Error: " & Err.Description & vbCrLf & _
                    "Error Number: " & Err.Number & vbCrLf & vbCrLf & _
                    "macOS-Specific Solutions:" & vbCrLf & _
                    "• Check Excel permissions in System Preferences > Security & Privacy" & vbCrLf & _
                    "• Ensure the directory exists and is writable" & vbCrLf & _
                    "• Close any PDF files with the same name" & vbCrLf & _
                    "• Try exporting to Desktop first" & vbCrLf & _
                    "• Restart Excel if the issue persists"

    MsgBox macOSErrorMsg, vbCritical, "PDF Export Error"
    GoTo ErrorHandler

ErrorHandler:
    ' Enhanced error handling with detailed diagnostics
    Dim errorMsg As String
    errorMsg = "PDF Export Error Details:" & vbCrLf & vbCrLf & _
               "Error: " & Err.Description & vbCrLf & _
               "Error Number: " & Err.Number & vbCrLf & _
               "PDF Path: " & pdfPath & vbCrLf & vbCrLf & _
               "Possible Solutions:" & vbCrLf & _
               "• Check if the folder path exists and is accessible" & vbCrLf & _
               "• Verify you have write permissions to the directory" & vbCrLf & _
               "• Ensure the invoice number is valid for filename" & vbCrLf & _
               "• Close any open PDF files with the same name"

    ' Ensure cleanup happens even if there's an error
    If Not duplicateWs Is Nothing Then
        Application.DisplayAlerts = False
        On Error Resume Next
        duplicateWs.Delete
        On Error GoTo 0
        Application.DisplayAlerts = True
    End If

    ' Restore original settings
    Application.ScreenUpdating = True
    Application.DisplayAlerts = True

    ' Show detailed error message only if there was actually an error
    If Err.Number <> 0 Then
        MsgBox errorMsg, vbCritical, "PDF Export Failed"
    End If
End Sub

' PDF utility functions are centralized in Module 14 (PDFUtilities)
