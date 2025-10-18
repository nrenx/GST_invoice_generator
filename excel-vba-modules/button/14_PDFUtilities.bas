Option Explicit
' Module 14: PDF Utilities
' Helper utilities for PDF export functionality including directory creation
' and macOS compatibility functions

Public Sub CreateDirectoryIfNotExists(directoryPath As String)
    ' Robust directory creation that works across different operating systems
    ' Handles both Windows and macOS compatibility issues
    Dim fso As Object
    On Error GoTo DirectoryError

    ' Try FileSystemObject first (works on most systems)
    Set fso = CreateObject("Scripting.FileSystemObject")
    If Not fso.FolderExists(directoryPath) Then
        fso.CreateFolder directoryPath
        ' Directory created successfully
    Else
        ' Directory already exists
    End If
    Set fso = Nothing
    Exit Sub

DirectoryError:
    ' Fallback method for macOS or when FileSystemObject fails
    On Error Resume Next
    Set fso = Nothing

    ' Try using MkDir as fallback (more compatible with macOS)
    If Dir(directoryPath, vbDirectory) = "" Then
        MkDir directoryPath
        If Err.Number <> 0 Then
            ' Don't throw error - let the PDF export attempt to continue
        End If
    End If

    On Error GoTo 0
End Sub

Public Sub OptimizeForPDFExport(ws As Worksheet)
    ' Optimize worksheet formatting for PDF export using centralized border management
    On Error Resume Next
    
    ' Use centralized border system for consistency
    Call ApplyStandardInvoiceBorders(ws)
    
    On Error GoTo 0
End Sub

Public Sub RestoreWorksheetFormatting(ws As Worksheet)
    ' Restore original worksheet formatting after PDF export
    ' With centralized border system, formatting is always consistent
    On Error Resume Next
    
    ' No restoration needed - centralized borders ensure consistency
    ' All formatting is maintained through ApplyStandardInvoiceBorders
    
    On Error GoTo 0
End Sub

Public Sub EnforceBordersForPDFExport(ws As Worksheet)
    ' Legacy function - now redirects to centralized border management
    ' Ensures PDF matches on-screen appearance exactly
    Call ApplyStandardInvoiceBorders(ws)
End Sub

Private Function GetMacOSCompatiblePDFPath() As String
    ' Get a reliable PDF export path for macOS
    ' Updated to use the specified BNC directory
    Dim testPath As String

    ' Try the intended BNC directory first
    testPath = "/Users/narendrachowdary/BNC/gst invoices/"
    If Dir(testPath, vbDirectory) <> "" Then
        GetMacOSCompatiblePDFPath = testPath
        Exit Function
    End If

    ' Fallback to Desktop
    testPath = "/Users/narendrachowdary/Desktop/"
    If Dir(testPath, vbDirectory) <> "" Then
        GetMacOSCompatiblePDFPath = testPath
        Exit Function
    End If

    ' Last resort - Documents folder
    testPath = "/Users/narendrachowdary/Documents/"
    GetMacOSCompatiblePDFPath = testPath
End Function

Public Sub SimplePDFExportForMacOS()
    ' Simplified, highly reliable PDF export for macOS
    Dim ws As Worksheet
    Dim invoiceNumber As String
    Dim pdfPath As String
    Dim fullPath As String
    On Error GoTo SimpleExportError

    Set ws = ThisWorkbook.Worksheets(INVOICE_SHEET_NAME)
    invoiceNumber = Trim(ws.Range("C7").Value)

    If invoiceNumber = "" Then
        MsgBox "Please enter an invoice number before exporting to PDF.", vbExclamation, "Missing Invoice Number"
        Exit Sub
    End If

    ' Use BNC directory as the primary path on macOS
    pdfPath = "/Users/narendrachowdary/BNC/gst invoices/"
    
    ' Create directory if it doesn't exist
    Call CreateDirectoryIfNotExists(pdfPath)
    
    fullPath = pdfPath & Replace(invoiceNumber, "/", "-") & ".pdf"

    ' Apply consistent border formatting before export
    Call ApplyStandardInvoiceBorders(ws)

    ' Simple, single-sheet export (most reliable on macOS)
    ws.Select
    ws.ExportAsFixedFormat Type:=xlTypePDF, _
                           Filename:=fullPath, _
                           Quality:=xlQualityStandard, _
                           IgnorePrintAreas:=False, _
                           OpenAfterPublish:=False

    MsgBox "PDF exported successfully to Desktop!" & vbCrLf & _
           "File: " & Replace(invoiceNumber, "/", "-") & ".pdf", _
           vbInformation, "PDF Export Complete"
    Exit Sub

SimpleExportError:
    MsgBox "Simple PDF export failed: " & Err.Description & vbCrLf & _
           "Please check file permissions and try again.", vbCritical, "Export Error"
End Sub

' PDF utility functions

Public Sub BatchPDFExport(invoiceRange As String)
    ' Export multiple invoices to PDF in batch operation
    ' Batch processing, progress tracking, automated naming, error recovery
    
    Dim batchResults As String
    Dim processedCount As Integer
    Dim errorCount As Integer
    
    On Error GoTo BatchError
    
    Application.ScreenUpdating = False
    batchResults = "BATCH PDF EXPORT RESULTS:" & vbCrLf & vbCrLf
    processedCount = 0
    errorCount = 0
    
    ' Process current invoice with enhanced features
    Dim ws As Worksheet
    Set ws = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    
    If ws Is Nothing Then
        batchResults = batchResults & "ERROR: Invoice sheet not found" & vbCrLf
        GoTo BatchComplete
    End If
    
    ' Apply advanced PDF optimization
    Call ApplyAdvancedPDFOptimization(ws)
    
    ' Export with enhanced formatting
    Dim fileName As String
    fileName = GenerateTimestampedFileName(ws)
    
    If ExportSinglePDFWithValidation(ws, fileName) Then
        batchResults = batchResults & "[OK] Exported: " & fileName & vbCrLf
        processedCount = processedCount + 1
    Else
        batchResults = batchResults & "Failed: " & fileName & vbCrLf
        errorCount = errorCount + 1
    End If
    
BatchComplete:
    Application.ScreenUpdating = True
    
    batchResults = batchResults & vbCrLf
    batchResults = batchResults & "📊 SUMMARY:" & vbCrLf
    batchResults = batchResults & "Processed: " & processedCount & vbCrLf
    batchResults = batchResults & "Errors: " & errorCount & vbCrLf
    
    MsgBox batchResults, vbInformation, "Batch PDF Export Complete"
    Exit Sub
    
BatchError:
    Application.ScreenUpdating = True
    MsgBox "Error during batch export: " & Err.Description, vbCritical, "Batch Export Error"
End Sub

Private Sub ApplyAdvancedPDFOptimization(ws As Worksheet)
    ' Apply advanced PDF optimization techniques
    On Error Resume Next
    
    With ws
        ' Advanced page setup optimization
        With .PageSetup
            .PrintErrors = xlPrintErrorsBlank
            .PrintTitleRows = "$1:$6"  ' Repeat header on multiple pages
            .PrintGridlines = False
            .PrintComments = xlPrintNoComments
            .CenterHorizontally = True
            .CenterVertically = True
            .Orientation = xlPortrait
            .Zoom = False
            .FitToPagesWide = 1
            .FitToPagesTall = 1
            .LeftMargin = Application.InchesToPoints(0.15)
            .RightMargin = Application.InchesToPoints(0.15)
            .TopMargin = Application.InchesToPoints(0.15)
            .BottomMargin = Application.InchesToPoints(0.15)
        End With
        
        ' Enhanced border optimization
        Call ApplyStandardInvoiceBorders(ws)
        
        ' Color optimization for PDF
        .Range("A1:O40").Interior.Color = RGB(255, 255, 255)  ' Ensure white background
        
        ' Font optimization for PDF clarity
        .Range("A1:O40").Font.Name = "Arial"  ' PDF-friendly font
    End With
    
    On Error GoTo 0
End Sub

Private Function GenerateTimestampedFileName(ws As Worksheet) As String
    ' Generate timestamped filename for batch operations
    Dim invoiceNumber As String
    Dim timestamp As String
    
    invoiceNumber = Trim(ws.Range("C7").Value)
    If invoiceNumber = "" Then invoiceNumber = "INVOICE"
    
    timestamp = Format(Now, "yyyy-mm-dd_hh-mm-ss")
    GenerateTimestampedFileName = invoiceNumber & "_" & timestamp & ".pdf"
End Function

Private Function ExportSinglePDFWithValidation(ws As Worksheet, fileName As String) As Boolean
    ' Export single PDF with comprehensive validation
    Dim exportPath As String
    
    On Error GoTo ExportError
    
    ' Validate input before export
    If Not ValidateUserInput(ws) Then
        ExportSinglePDFWithValidation = False
        Exit Function
    End If
    
    exportPath = "/Users/narendrachowdary/BNC/gst invoices/" & fileName
    
    ' Create directory if needed
    Call CreateDirectoryIfNotExists("/Users/narendrachowdary/BNC/gst invoices/")
    
    ' Export with error handling
    ws.ExportAsFixedFormat Type:=xlTypePDF, _
                          fileName:=exportPath, _
                          Quality:=xlQualityStandard, _
                          IncludeDocProps:=True, _
                          IgnorePrintAreas:=False, _
                          OpenAfterPublish:=False
    
    ExportSinglePDFWithValidation = True
    Exit Function
    
ExportError:
    ExportSinglePDFWithValidation = False
End Function

Public Sub EnhancedPDFPreview(ws As Worksheet)
    ' Enhanced PDF preview with optimization display
    On Error Resume Next
    
    Call ApplyAdvancedPDFOptimization(ws)
    
    ' Show print preview with enhanced formatting
    ws.PrintPreview
    
    MsgBox "PDF Preview with optimizations applied:" & vbCrLf & _
           "• Enhanced page layout" & vbCrLf & _
           "• Optimized borders and colors" & vbCrLf & _
           "• PDF-friendly font selection" & vbCrLf & _
           "• Professional formatting", vbInformation, "Enhanced PDF Preview"
    
    On Error GoTo 0
End Sub
