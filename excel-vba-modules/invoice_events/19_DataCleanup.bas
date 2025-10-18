Option Explicit
' Module 19: Data Cleanup
' Handles data cleanup operations including form clearing, product row cleanup,
' and data reset functionality

' Data cleanup functions

Public Sub CleanEmptyProductRows(ws As Worksheet)
    ' Clean up empty product rows to remove any #N/A values or unwanted content
    Dim i As Long
    On Error Resume Next

    With ws
        For i = 19 To 23  ' Product rows
            ' If no product description, clear the entire row
            If Trim(.Range("B" & i).Value) = "" And Trim(.Range("C" & i).Value) = "" Then
                .Range("A" & i & ":O" & i).ClearContents
                ' Set default formatting for empty rows
                .Range("A" & i & ":O" & i).Font.Color = RGB(26, 26, 26)
                .Range("A" & i & ":O" & i).Font.Bold = False
                .Range("A" & i & ":O" & i).Font.Size = 10
                .Range("A" & i & ":O" & i).HorizontalAlignment = xlLeft
                .Range("A" & i & ":O" & i).VerticalAlignment = xlCenter
            End If
        Next i
    End With

    On Error GoTo 0
End Sub

Public Sub ClearAllInvoiceData(ws As Worksheet)
    ' Clear all invoice data while preserving structure and formatting
    On Error Resume Next
    
    With ws
        ' Clear invoice details (excluding pre-filled data like transporter name)
        .Range("C7").ClearContents     ' Invoice Number
        .Range("C8").ClearContents     ' Invoice Date
        .Range("F7").ClearContents     ' Transport Mode
        .Range("J7").ClearContents     ' Challan No
        .Range("F8").ClearContents     ' Vehicle Number
        .Range("F9").ClearContents     ' Date of Supply
        .Range("G9").ClearContents     ' Date of Supply (second cell)
        .Range("J9").ClearContents     ' L.R Number
        .Range("F10").ClearContents    ' Place of Supply
        .Range("J10").ClearContents    ' P.O Number
        .Range("N10").Value = "Not Applicable"  ' Reset E-Way Bill No to default
        .Range("N7").Value = "Interstate"  ' Reset to default
        
        ' Clear customer data (Billed to)
        .Range("C12:H15").ClearContents
        .Range("C15").NumberFormat = "@"  ' Ensure state field remains text format
        
        ' Clear consignee data (Shipped to)
        .Range("K12:O15").ClearContents
        .Range("K15").NumberFormat = "@"  ' Ensure state field remains text format
        
        ' Clear product data (all 6 rows)
        .Range("A18:O21").ClearContents
        
        ' Clear totals section
        .Range("A31:K31").ClearContents
        
        ' Reset dynamic tax display to default
        Call UpdateTaxFieldsDisplay(ws, "Interstate")
        
        ' Recalculate worksheet
        .Calculate
    End With
    
    On Error GoTo 0
End Sub

Public Sub ResetInvoiceFormToDefaults(ws As Worksheet)
    ' Reset the entire invoice form to default state
    On Error Resume Next
    
    ' Clear all data first
    Call ClearAllInvoiceData(ws)
    
    With ws
        ' Set default values
        .Range("N7").Value = "Interstate"
        .Range("C9").Value = "Andhra Pradesh"
        .Range("C10").Value = "37"
        .Range("F7").Value = "By Lorry"
        .Range("J8").Value = "NARENDRA"
        .Range("N8").Value = "Tax Invoice"
        .Range("N9").Value = "No"
        
        ' Auto-populate default fields
        Call AutoPopulateInvoiceFields(ws)
        
        ' Setup dynamic tax display
        Call SetupDynamicTaxDisplay(ws)
        
        ' Clean empty rows
        Call CleanEmptyProductRows(ws)
    End With
    
    On Error GoTo 0
End Sub

Public Sub ClearCustomerDataOnly(ws As Worksheet)
    ' Clear only customer and consignee data, preserve invoice details
    On Error Resume Next
    
    With ws
        ' Clear customer data (Billed to)
        .Range("C12:H15").ClearContents
        .Range("C15").NumberFormat = "@"  ' Ensure state field remains text format
        
        ' Clear consignee data (Shipped to)
        .Range("K12:O15").ClearContents
        .Range("K15").NumberFormat = "@"  ' Ensure state field remains text format
    End With
    
    On Error GoTo 0
End Sub

Public Sub ClearProductDataOnly(ws As Worksheet)
    ' Clear only product data, preserve customer and invoice details
    On Error Resume Next
    
    With ws
        ' Clear product data (all 6 rows)
        .Range("A18:O21").ClearContents
        
        ' Clear totals section
        .Range("A31:K31").ClearContents
        
        ' Clean empty rows
        Call CleanEmptyProductRows(ws)
        
        ' Recalculate to update totals
        .Calculate
    End With
    
    On Error GoTo 0
End Sub
