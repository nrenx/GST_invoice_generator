Option Explicit
' Module 19: Border Management
' Centralized border management for consistent invoice formatting
' Single source of truth for all border styles across the entire system

' Main border application function - called by all other modules
Public Sub ApplyStandardInvoiceBorders(ws As Worksheet)
    ' Apply consistent, professional borders across entire invoice
    ' This is the ONLY function that should set borders - all others call this
    On Error Resume Next
    
    If ws Is Nothing Then Exit Sub
    
    ' Disable screen updating for performance
    Application.ScreenUpdating = False
    
    ' Disable gridlines to prevent interference with borders (fix for export error)
    On Error Resume Next
    If Not Application.ActiveWindow Is Nothing Then
        Application.ActiveWindow.DisplayGridlines = False
    End If
    On Error Resume Next
    
    With ws
        ' Ensure stable column widths for consistent border alignment
        .Columns(1).ColumnWidth = 5    ' Column A - Sr.No.
        .Columns(2).ColumnWidth = 12   ' Column B - Description
        .Columns(3).ColumnWidth = 12   ' Column C - HSN/SAC Code
        .Columns(4).ColumnWidth = 9    ' Column D - Quantity
        .Columns(5).ColumnWidth = 7    ' Column E - UOM
        .Columns(6).ColumnWidth = 10   ' Column F - Rate
        .Columns(7).ColumnWidth = 14   ' Column G - Amount
        .Columns(8).ColumnWidth = 10   ' Column H - Taxable Value
        .Columns(9).ColumnWidth = 6    ' Column I - IGST Rate
        .Columns(10).ColumnWidth = 10  ' Column J - IGST Amount
        .Columns(11).ColumnWidth = 6   ' Column K - CGST Rate
        .Columns(12).ColumnWidth = 10  ' Column L - CGST Amount
        .Columns(13).ColumnWidth = 6   ' Column M - SGST Rate
        .Columns(14).ColumnWidth = 10  ' Column N - SGST Amount
        .Columns(15).ColumnWidth = 16  ' Column O - Total Amount - updated to 16
        
        ' STEP 1: Clear all existing borders to prevent conflicts
        .Range("A1:O40").Borders.LineStyle = xlNone
        
        ' STEP 2: Apply consistent internal borders to entire invoice area
        .Range("A1:O40").Borders.LineStyle = xlContinuous
        .Range("A1:O40").Borders.Weight = xlThin
        .Range("A1:O40").Borders.Color = RGB(0, 0, 0)  ' Pure black for professional appearance
        
        ' STEP 3: Apply thick outer border around entire invoice for professional frame
        With .Range("A1:O40")
            .Borders(xlEdgeLeft).LineStyle = xlContinuous
            .Borders(xlEdgeLeft).Weight = xlMedium
            .Borders(xlEdgeLeft).Color = RGB(0, 0, 0)
            .Borders(xlEdgeRight).LineStyle = xlContinuous
            .Borders(xlEdgeRight).Weight = xlMedium
            .Borders(xlEdgeRight).Color = RGB(0, 0, 0)
            .Borders(xlEdgeTop).LineStyle = xlContinuous
            .Borders(xlEdgeTop).Weight = xlMedium
            .Borders(xlEdgeTop).Color = RGB(0, 0, 0)
            .Borders(xlEdgeBottom).LineStyle = xlContinuous
            .Borders(xlEdgeBottom).Weight = xlMedium
            .Borders(xlEdgeBottom).Color = RGB(0, 0, 0)
        End With
        
        ' STEP 4: Apply seamless company header design (rows 3-4)
        ' Remove horizontal borders between company info rows for seamless appearance
        With .Range("A3:O3")
            .Borders(xlEdgeTop).LineStyle = xlNone
            .Borders(xlEdgeBottom).LineStyle = xlNone
            .Borders(xlInsideHorizontal).LineStyle = xlNone
        End With
        
        With .Range("A4:O4")
            .Borders(xlEdgeTop).LineStyle = xlNone
            .Borders(xlEdgeBottom).LineStyle = xlNone
            .Borders(xlInsideHorizontal).LineStyle = xlNone
        End With
    End With
    
    Application.ScreenUpdating = True
    On Error GoTo 0
End Sub

' Quick border refresh for operations that might disturb formatting
Public Sub RefreshInvoiceBorders(ws As Worksheet)
    ' Lightweight border refresh without column width changes
    ' Use this for quick operations like clearing content
    Call ApplyStandardInvoiceBorders(ws)
End Sub

' Border validation function to check if borders are properly applied
Public Function ValidateInvoiceBorders(ws As Worksheet) As Boolean
    ' Check if borders are properly applied (useful for debugging)
    On Error Resume Next
    
    If ws Is Nothing Then
        ValidateInvoiceBorders = False
        Exit Function
    End If
    
    ' Check if outer borders exist
    With ws.Range("A1:O40")
        If .Borders(xlEdgeLeft).LineStyle = xlContinuous And _
           .Borders(xlEdgeRight).LineStyle = xlContinuous And _
           .Borders(xlEdgeTop).LineStyle = xlContinuous And _
           .Borders(xlEdgeBottom).LineStyle = xlContinuous Then
            ValidateInvoiceBorders = True
        Else
            ValidateInvoiceBorders = False
        End If
    End With
    
    On Error GoTo 0
End Function

' Constants for border styling (future customization)
Public Const INVOICE_BORDER_COLOR As Long = 0          ' RGB(0, 0, 0) - Black
Public Const INVOICE_INNER_WEIGHT As Long = xlThin     ' Internal borders
Public Const INVOICE_OUTER_WEIGHT As Long = xlMedium   ' Outer frame borders
