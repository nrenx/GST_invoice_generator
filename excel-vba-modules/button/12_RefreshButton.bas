Option Explicit
' Module 12: Refresh Button
' Comprehensive refresh button function that handles all refresh operations
' Includes Sale Type display, tax calculations, dropdowns, and system updates

Public Sub RefreshButton()
    ' Comprehensive refresh button handling all refresh operations
    Dim ws As Worksheet
    Dim saleType As String
    Dim refreshCount As Integer
    Dim refreshResults As String
    On Error GoTo ErrorHandler
    
    Application.ScreenUpdating = False
    refreshCount = 0
    refreshResults = "REFRESH OPERATIONS COMPLETED:" & vbCrLf & vbCrLf
    
    Set ws = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    
    ' Exit if required worksheet is missing
    If ws Is Nothing Then
        Exit Sub
    End If
    
    ' 1. Refresh Sale Type Display using constants
    saleType = Trim(ws.Range(SALE_TYPE_CELL).Value)
    If saleType = "Interstate" Or saleType = "Intrastate" Then
        Call UpdateTaxFieldsDisplay(ws, saleType)
        refreshResults = refreshResults & "[OK] Sale Type (" & saleType & ") tax fields updated" & vbCrLf
        refreshCount = refreshCount + 1
    Else
        refreshResults = refreshResults & "[WARN] Sale Type: Please select Interstate or Intrastate in N7" & vbCrLf
    End If
    
    ' 2. Refresh Tax Calculations
    Call UpdateMultiItemTaxCalculations(ws)
    refreshResults = refreshResults & "[OK] Tax calculations refreshed" & vbCrLf
    refreshCount = refreshCount + 1
    
    ' 3. Refresh Data Validation Dropdowns using new centralized system
    Call SetupAllDropdownValidations(ws)
    refreshResults = refreshResults & "[OK] Centralized dropdown validations refreshed" & vbCrLf
    refreshCount = refreshCount + 1
    
    ' 4. Enable Auto-Updates (Phase 3 Enhancement)
    Call EnableAutoUpdates(ws)
    refreshResults = refreshResults & "[OK] Auto-update functionality enabled" & vbCrLf
    refreshCount = refreshCount + 1
    
    ' 4. Refresh Customer Auto-Population (if customer selected)
    Dim customerName As String
    customerName = Trim(ws.Range("C12").Value)
    If customerName <> "" Then
        Call SetupCustomerDropdown(ws)
        refreshResults = refreshResults & "[OK] Customer dropdown refreshed" & vbCrLf
        refreshCount = refreshCount + 1
    End If
    
    ' 5. Refresh HSN Code Dropdowns
    Call SetupHSNDropdown(ws)
    refreshResults = refreshResults & "[OK] HSN code dropdowns refreshed" & vbCrLf
    refreshCount = refreshCount + 1
    
    ' 6. Force worksheet recalculation
    ws.Calculate
    Call Application.Calculate
    refreshResults = refreshResults & "[OK] Worksheet calculations updated" & vbCrLf
    refreshCount = refreshCount + 1
    
    ' 7. Clean empty product rows
    Call CleanEmptyProductRows(ws)
    refreshResults = refreshResults & "[OK] Empty product rows cleaned" & vbCrLf
    refreshCount = refreshCount + 1
    
    ' 8. Refresh invoice borders for consistency
    Call ApplyStandardInvoiceBorders(ws)
    refreshResults = refreshResults & "[OK] Invoice borders refreshed" & vbCrLf
    refreshCount = refreshCount + 1
    
    ' 9. Update dates to current date
    On Error Resume Next
    ' Update Invoice Date (C8)
    With ws.Range("C8")
        .Value = Format(Date, "dd/mm/yyyy")
        .Font.Bold = True
        .HorizontalAlignment = xlLeft
        .VerticalAlignment = xlCenter
    End With
    
    ' Update Date of Supply (F9)
    With ws.Range("F9")
        .Value = Format(Date, "dd/mm/yyyy")
        .Font.Bold = True
        .HorizontalAlignment = xlLeft
        .VerticalAlignment = xlCenter
    End With
    
    ' Update Date of Supply (G9)
    With ws.Range("G9")
        .Value = Format(Date, "dd/mm/yyyy")
        .Font.Bold = True
        .HorizontalAlignment = xlLeft
        .VerticalAlignment = xlCenter
    End With
    On Error GoTo ErrorHandler
    refreshResults = refreshResults & "[OK] Dates updated to current date" & vbCrLf
    refreshCount = refreshCount + 1
    
    Application.ScreenUpdating = True
    
    refreshResults = refreshResults & vbCrLf & "Total operations: " & refreshCount & vbCrLf & vbCrLf
    refreshResults = refreshResults & "SUCCESS: All systems refreshed successfully!"
    
    MsgBox refreshResults, vbInformation, "System Refresh Complete"
    Exit Sub
    
ErrorHandler:
    Application.ScreenUpdating = True
    MsgBox "Error during refresh: " & Err.Description, vbCritical, "Refresh Error"
End Sub
