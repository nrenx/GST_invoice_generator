Option Explicit
' Module 16: Worksheet Events Setup
' Handles worksheet event setup, change monitoring, and event handling
' for sale type changes and state code management

' Worksheet event handling

Public Sub SetupWorksheetChangeEvents(ws As Worksheet)
    ' Set up comprehensive change monitoring with auto-updates
    On Error Resume Next

    ' Enable automatic calculation to ensure formulas update properly
    Application.Calculation = xlCalculationAutomatic
    Application.EnableEvents = True
    
    ' Setup automatic updates for the invoice worksheet
    Call EnableAutoUpdates(ws)
    
    ' Note: The actual worksheet change events are handled by the 
    ' HandleSaleTypeAutoUpdate and other auto-update functions in Module_Dropdowns
    ' These functions provide seamless updates without manual refresh

    On Error GoTo 0
End Sub

Public Sub SetupStateCodeChangeEvents(ws As Worksheet)
    ' Simple state code setup - no automatic extraction needed
    ' State code dropdowns will show simple numeric codes only
    On Error GoTo 0
End Sub

' Sale type event handling

Public Sub HandleSaleTypeChange(ws As Worksheet, changedRange As Range)
    ' Handle Sale Type dropdown changes to update tax field display dynamically
    On Error Resume Next

    ' Check if the changed cell is the Sale Type dropdown (N7)
    If Not Intersect(changedRange, ws.Range("N7")) Is Nothing Then
        Dim saleType As String
        saleType = Trim(ws.Range("N7").Value)

        ' Validate sale type and update display
        If saleType = "Interstate" Or saleType = "Intrastate" Then
            Call UpdateTaxFieldsDisplay(ws, saleType)

            ' Recalculate the worksheet to update formulas
            ws.Calculate
        End If
    End If

    On Error GoTo 0
End Sub

Public Sub RefreshSaleTypeDisplay()
    ' Manual function to refresh Sale Type display
    ' Users can run this after changing Sale Type
    Dim ws As Worksheet
    Dim saleType As String
    On Error GoTo ErrorHandler
    
    Set ws = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    
    ' Exit if required worksheet is missing
    If ws Is Nothing Then
        Exit Sub
    End If
    saleType = Trim(ws.Range("N7").Value)
    
    If saleType = "Interstate" Or saleType = "Intrastate" Then
        Call UpdateTaxFieldsDisplay(ws, saleType)
        ws.Calculate
        MsgBox "Tax fields updated for " & saleType & " sale type!", vbInformation, "Sale Type Updated"
    Else
        MsgBox "Please select either 'Interstate' or 'Intrastate' in cell N7.", vbExclamation, "Invalid Sale Type"
    End If
    
    Exit Sub
    
ErrorHandler:
    MsgBox "Error updating sale type: " & Err.Description, vbCritical, "Error"
End Sub
