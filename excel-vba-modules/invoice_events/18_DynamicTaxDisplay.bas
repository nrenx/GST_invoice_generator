Option Explicit
' Module 18: Dynamic Tax Display
' Handles dynamic tax field display based on sale type, including
' Interstate/Intrastate tax column switching and visibility

' Dynamic tax display management

Public Sub SetupDynamicTaxDisplay(ws As Worksheet)
    ' Set up dynamic tax field display based on sale type
    On Error GoTo ErrorHandler

    With ws
        ' Set up conditional formatting for "Not Applicable" display
        ' This will be handled through worksheet change events

        ' Initialize with default Interstate setup
        Call UpdateTaxFieldsDisplay(ws, "Interstate")
    End With

    Exit Sub

ErrorHandler:
    MsgBox "Error setting up dynamic tax display: " & Err.Description, vbCritical, "Tax Display Error"
End Sub

Public Sub UpdateTaxFieldsDisplay(ws As Worksheet, saleType As String)
    ' Update tax fields display based on sale type selection
    ' Fixed column mapping
    Dim i As Long
    On Error GoTo ErrorHandler

    With ws
        If saleType = "Interstate" Then
            ' Interstate: Only IGST applies, CGST and SGST are not applicable
            
            ' Clear all tax fields first for all 6 product rows (19-24)
            .Range("I19:N24").ClearContents
            
            ' Restore proper headers for active IGST columns (M,N)
            .Range("M17").Value = "IGST Rate (%)"
            .Range("M17").Font.Color = RGB(26, 26, 26)  ' Black color
            .Range("M17").Font.Bold = True
            .Range("M17").HorizontalAlignment = xlCenter
            
            .Range("N17").Value = "IGST Amount (Rs.)"
            .Range("N17").Font.Color = RGB(26, 26, 26)  ' Black color
            .Range("N17").Font.Bold = True
            .Range("N17").HorizontalAlignment = xlCenter
            
            ' Set "Not Apply" messages in red for CGST and SGST headers
            .Range("I17").Value = "CGST Not Apply"
            .Range("I17").Font.Color = RGB(220, 20, 60)  ' Red color
            .Range("I17").Font.Bold = True
            .Range("I17").HorizontalAlignment = xlCenter
            
            .Range("J17").Value = "CGST Not Apply"
            .Range("J17").Font.Color = RGB(220, 20, 60)  ' Red color
            .Range("J17").Font.Bold = True
            .Range("J17").HorizontalAlignment = xlCenter
            
            .Range("K17").Value = "SGST Not Apply"
            .Range("K17").Font.Color = RGB(220, 20, 60)  ' Red color
            .Range("K17").Font.Bold = True
            .Range("K17").HorizontalAlignment = xlCenter
            
            .Range("L17").Value = "SGST Not Apply"
            .Range("L17").Font.Color = RGB(220, 20, 60)  ' Red color
            .Range("L17").Font.Bold = True
            .Range("L17").HorizontalAlignment = xlCenter
            
            ' Clear content completely from CGST columns (I19-I24, J19-J24)
            .Range("I19:I24").ClearContents
            .Range("J19:J24").ClearContents
            
            ' Clear content completely from SGST columns (K19-K24, L19-L24)
            .Range("K19:K24").ClearContents
            .Range("L19:L24").ClearContents
            
            ' Set up active IGST formulas (M,N columns)
            For i = 19 To 24
                .Range("M" & i).Formula = "=IF(AND(N7=""Interstate"",C" & i & "<>""""),IFERROR(VLOOKUP(C" & i & ",Dropdowns!$A:$F,6,FALSE),""""),"""")"
                .Range("N" & i).Formula = "=IF(AND(N7=""Interstate"",H" & i & "<>"""",M" & i & "<>""""),H" & i & "*M" & i & "/100,"""")"
            Next i

        ElseIf saleType = "Intrastate" Then
            ' Intrastate: Only CGST and SGST apply, IGST is not applicable
            
            ' Clear all tax fields first for all 6 product rows (19-24)
            .Range("I19:N24").ClearContents
            
            ' Restore proper headers for active CGST columns (I,J)
            .Range("I17").Value = "CGST Rate (%)"
            .Range("I17").Font.Color = RGB(26, 26, 26)  ' Black color
            .Range("I17").Font.Bold = True
            .Range("I17").HorizontalAlignment = xlCenter
            
            .Range("J17").Value = "CGST Amount (Rs.)"
            .Range("J17").Font.Color = RGB(26, 26, 26)  ' Black color
            .Range("J17").Font.Bold = True
            .Range("J17").HorizontalAlignment = xlCenter
            
            ' Restore proper headers for active SGST columns (K,L)
            .Range("K17").Value = "SGST Rate (%)"
            .Range("K17").Font.Color = RGB(26, 26, 26)  ' Black color
            .Range("K17").Font.Bold = True
            .Range("K17").HorizontalAlignment = xlCenter
            
            .Range("L17").Value = "SGST Amount (Rs.)"
            .Range("L17").Font.Color = RGB(26, 26, 26)  ' Black color
            .Range("L17").Font.Bold = True
            .Range("L17").HorizontalAlignment = xlCenter
            
            ' Set "Not Apply" messages in red for IGST headers
            .Range("M17").Value = "IGST Not Apply"
            .Range("M17").Font.Color = RGB(220, 20, 60)  ' Red color
            .Range("M17").Font.Bold = True
            .Range("M17").HorizontalAlignment = xlCenter
            
            .Range("N17").Value = "IGST Not Apply"
            .Range("N17").Font.Color = RGB(220, 20, 60)  ' Red color
            .Range("N17").Font.Bold = True
            .Range("N17").HorizontalAlignment = xlCenter
            
            ' Clear content completely from IGST columns (M19-M24, N19-N24)
            .Range("M19:M24").ClearContents
            .Range("N19:N24").ClearContents
            
            ' Set up active CGST formulas (I,J columns) - using NEW column structure
            For i = 19 To 24
                .Range("I" & i).Formula = "=IF(AND(N7=""Intrastate"",C" & i & "<>""""),IFERROR(VLOOKUP(C" & i & ",Dropdowns!$A:$F,4,FALSE),""""),"""")"
                .Range("J" & i).Formula = "=IF(AND(N7=""Intrastate"",H" & i & "<>"""",I" & i & "<>""""),H" & i & "*I" & i & "/100,"""")"
            Next i
            
            ' Set up active SGST formulas (K,L columns) - using NEW column structure
            For i = 19 To 24
                .Range("K" & i).Formula = "=IF(AND(N7=""Intrastate"",C" & i & "<>""""),IFERROR(VLOOKUP(C" & i & ",Dropdowns!$A:$F,5,FALSE),""""),"""")"
                .Range("L" & i).Formula = "=IF(AND(N7=""Intrastate"",H" & i & "<>"""",K" & i & "<>""""),H" & i & "*K" & i & "/100,"""")"
            Next i
        End If
        
        ' Force recalculation
        .Calculate
    End With

    Exit Sub

ErrorHandler:
    MsgBox "Error updating tax fields display: " & Err.Description, vbCritical, "Tax Display Error"
End Sub

Public Sub RefreshTaxDisplayForCurrentSaleType()
    ' Manual refresh function for tax display based on current sale type
    Dim ws As Worksheet
    Dim saleType As String
    On Error GoTo ErrorHandler
    
    Set ws = GetRequiredWorksheet(INVOICE_SHEET_NAME)
    
    ' Exit if required worksheet is missing
    If ws Is Nothing Then
        Exit Sub
    End If
    saleType = Trim(ws.Range(SALE_TYPE_CELL).Value)
    
    If saleType = "Interstate" Or saleType = "Intrastate" Then
        Call UpdateTaxFieldsDisplay(ws, saleType)
        ws.Calculate
        MsgBox "Tax display refreshed for " & saleType & " sale type!", vbInformation, "Tax Display Updated"
    Else
        MsgBox "Please select either 'Interstate' or 'Intrastate' in cell N7.", vbExclamation, "Invalid Sale Type"
    End If
    
    Exit Sub
    
ErrorHandler:
    MsgBox "Error refreshing tax display: " & Err.Description, vbCritical, "Error"
End Sub
