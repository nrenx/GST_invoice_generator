Option Explicit
' Module 15: Data Population  
' Handles data population for invoices including customer data, HSN data,
' automatic field population, and data validation setup

' Data population functions

Public Sub AutoPopulateInvoiceFields(ws As Worksheet)
    ' Auto-populate invoice number and dates with full manual override capability
    ' All auto-populated values can be manually edited by users
    Dim nextInvoiceNumber As String
    On Error GoTo ErrorHandler

    ' Auto-populate Invoice Number (Row 7, Column C)
    nextInvoiceNumber = GetNextInvoiceNumber()

    With ws.Range("C7")
        .Value = nextInvoiceNumber
        .Font.Bold = True
        .Font.Color = RGB(220, 20, 60)  ' Red color for user input
        .HorizontalAlignment = xlCenter
        .VerticalAlignment = xlCenter
        ' Allow manual editing - no validation restrictions
    End With

    ' Auto-populate Invoice Date (Row 8, Column C)
    With ws.Range("C8")
        .Value = Format(Date, "dd/mm/yyyy")
        .Font.Bold = True
        .HorizontalAlignment = xlLeft
        ' Allow manual editing - no validation restrictions
    End With

    ' Auto-populate Date of Supply (Row 9, Columns F & G)
    With ws.Range("F9")
        .Value = Format(Date, "dd/mm/yyyy")
        .HorizontalAlignment = xlLeft
        ' Allow manual editing - no validation restrictions
    End With

    With ws.Range("G9")
        .Value = Format(Date, "dd/mm/yyyy")
        .HorizontalAlignment = xlLeft
        ' Allow manual editing - no validation restrictions
    End With

    ' Set fixed State Code (Row 10, Column C) for Andhra Pradesh
    With ws.Range("C10")
        .Value = "37"
        .HorizontalAlignment = xlLeft
        ' No validation - fixed value
    End With

    ' Set default E-way Bill No. (Row 10, Columns N-O) - Allow manual editing
    With ws.Range("N10")
        .Value = "Not Applicable"
        .HorizontalAlignment = xlCenter
        .Font.Color = RGB(100, 100, 100)  ' Gray color to indicate default
        ' Allow manual editing - no validation restrictions
    End With

    Exit Sub

ErrorHandler:
    ' If auto-population fails, set default values
    ws.Range("C7").Value = "INV-" & Year(Date) & "-001"
    ws.Range("C8").Value = Format(Date, "dd/mm/yyyy")
    ws.Range("F9").Value = Format(Date, "dd/mm/yyyy")
    ws.Range("G9").Value = Format(Date, "dd/mm/yyyy")
End Sub

Public Sub SetupDataValidation(ws As Worksheet)
    ' Legacy function - replaced by SetupAllDropdownValidations in Module_Dropdowns
    ' Maintained for backward compatibility during transition
    
    MsgBox "SetupDataValidation is deprecated. Use SetupAllDropdownValidations from Module_Dropdowns instead.", vbInformation, "Function Deprecated"
    
    ' Call the new centralized function
    Call SetupAllDropdownValidations(ws)
End Sub

' Orphaned code from incomplete function removed to prevent syntax errors
