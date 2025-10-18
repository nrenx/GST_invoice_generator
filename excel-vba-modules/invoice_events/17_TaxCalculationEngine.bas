Option Explicit
' Module 17: Tax Calculation Engine
' Core tax calculation engine for GST, including formula setup, multi-item calculations,
' tax computation logic with comprehensive validation, error handling, and precision control

' Tax calculation engine

Public Sub SetupTaxCalculationFormulas(ws As Worksheet)
    ' Set up comprehensive tax calculation formulas with validation
    ' Creates dynamic GST calculation formulas for all item rows
    ' Implements interstate/intrastate tax logic
    
    On Error GoTo ErrorHandler
    
    ' Validate input parameters
    If Not ValidateWorksheetParameter(ws, "worksheet") Then
        Exit Sub
    End If
    
    ' Validate required constants are available
    If Not ValidateSystemConstants() Then
        MsgBox "System constants not properly loaded. Cannot setup tax formulas.", vbCritical, "Setup Error"
        Exit Sub
    End If
    
    ' Start formula setup with performance optimization
    Call OptimizeExcelPerformance
    
    Dim operationStart As Double
    operationStart = Timer
    
    With ws
        ' Set up formulas for the first item row with enhanced validation
        Dim firstRow As String
        firstRow = CStr(ITEM_START_ROW)
        
        ' Validate that we can access the required cells
        If Not ValidateCellReferenceParameter("G" & firstRow, "Amount cell") Then
            Call RestoreExcelPerformance
            Exit Sub
        End If
        
        ' Setup basic calculation formulas with error checking
        Call SetupBasicCalculationFormulas(ws, firstRow)
        
        ' Setup tax-specific formulas with validation
        Call SetupTaxFormulas(ws, firstRow)
        
        ' Setup total calculation formulas
        Call SetupTotalFormulas(ws, firstRow)
        
        ' Apply number formatting with precision control
        Call ApplyPrecisionFormatting(ws, firstRow)
        
        ' Validate formula setup
        If Not ValidateFormulaSetup(ws, firstRow) Then
            Call RestoreExcelPerformance
            MsgBox "Formula validation failed. Please check worksheet structure.", vbCritical, "Formula Setup Error"
            Exit Sub
        End If
        
    End With
    
    Call RestoreExcelPerformance
    
    ' Calculate and display setup time
    Dim operationTime As Double
    operationTime = Timer - operationStart
    
    ' Optional: Display success message for debugging
    ' MsgBox "Tax formulas setup completed in " & Format(operationTime, "0.000") & " seconds.", vbInformation, "Formula Setup Complete"
    
    Exit Sub
    
ErrorHandler:
    Call RestoreExcelPerformance
    Call HandleUnifiedError("SetupTaxCalculationFormulas", Err.Number, Err.Description, "Tax Engine")
End Sub

Public Sub UpdateMultiItemTaxCalculations(ws As Worksheet)
    ' Update comprehensive tax calculations for all item rows with validation
    ' Updates total row calculations, tax summary section, amount in words
    
    On Error GoTo ErrorHandler
    
    ' Validate input parameters
    If Not ValidateWorksheetParameter(ws, "worksheet") Then
        Exit Sub
    End If
    
    With ws
        ' TOTAL ROW CALCULATIONS (Row 25)
        Dim totalRowStr As String
        totalRowStr = CStr(TOTAL_ROW)
        
        ' Total Quantity
        .Range("D" & totalRowStr).Formula = "=SUM(D" & ITEM_START_ROW & ":D" & ITEM_END_ROW & ")"
        .Range("D" & totalRowStr).NumberFormat = "#,##0.00"

        ' Sub Total calculations
        .Range("G" & totalRowStr).Formula = "=SUM(G" & ITEM_START_ROW & ":G" & ITEM_END_ROW & ")"  ' Amount column
        .Range("H" & totalRowStr).Formula = "=SUM(H" & ITEM_START_ROW & ":H" & ITEM_END_ROW & ")"  ' Taxable Value column
        .Range("G" & totalRowStr & ":H" & totalRowStr).NumberFormat = "#,##0.00"

        ' Tax amounts using constants - CGST, SGST, IGST
        .Range(CGST_RATE_COL & totalRowStr).Formula = "=SUM(" & CGST_RATE_COL & ITEM_START_ROW & ":" & CGST_RATE_COL & ITEM_END_ROW & ")"  ' CGST Rate (sum)
        .Range(CGST_AMOUNT_COL & totalRowStr).Formula = "=SUM(" & CGST_AMOUNT_COL & ITEM_START_ROW & ":" & CGST_AMOUNT_COL & ITEM_END_ROW & ")"  ' CGST Amount
        .Range(SGST_RATE_COL & totalRowStr).Formula = "=SUM(" & SGST_RATE_COL & ITEM_START_ROW & ":" & SGST_RATE_COL & ITEM_END_ROW & ")"  ' SGST Rate (sum)
        .Range(SGST_AMOUNT_COL & totalRowStr).Formula = "=SUM(" & SGST_AMOUNT_COL & ITEM_START_ROW & ":" & SGST_AMOUNT_COL & ITEM_END_ROW & ")"  ' SGST Amount
        .Range(IGST_RATE_COL & totalRowStr).Formula = "=SUM(" & IGST_RATE_COL & ITEM_START_ROW & ":" & IGST_RATE_COL & ITEM_END_ROW & ")"  ' IGST Rate (sum)
        .Range(IGST_AMOUNT_COL & totalRowStr).Formula = "=SUM(" & IGST_AMOUNT_COL & ITEM_START_ROW & ":" & IGST_AMOUNT_COL & ITEM_END_ROW & ")"  ' IGST Amount
        .Range(TOTAL_AMOUNT_COL & totalRowStr).Formula = "=SUM(" & TOTAL_AMOUNT_COL & ITEM_START_ROW & ":" & TOTAL_AMOUNT_COL & ITEM_END_ROW & ")"  ' Total Amount
        .Range(CGST_RATE_COL & totalRowStr & ":" & TOTAL_AMOUNT_COL & totalRowStr).NumberFormat = "#,##0.00"

        ' TAX SUMMARY SECTION (Right side O26:O32)
        ' Row 26: Total Amount Before Tax
        .Range("O26").Formula = "=SUM(H" & ITEM_START_ROW & ":H" & ITEM_END_ROW & ")"

        ' Row 27: CGST
        .Range("O27").Formula = "=SUM(" & CGST_AMOUNT_COL & ITEM_START_ROW & ":" & CGST_AMOUNT_COL & ITEM_END_ROW & ")"

        ' Row 28: SGST
        .Range("O28").Formula = "=SUM(" & SGST_AMOUNT_COL & ITEM_START_ROW & ":" & SGST_AMOUNT_COL & ITEM_END_ROW & ")"

        ' Row 29: IGST
        .Range("O29").Formula = "=SUM(" & IGST_AMOUNT_COL & ITEM_START_ROW & ":" & IGST_AMOUNT_COL & ITEM_END_ROW & ")"

        ' Row 30: CESS (0 by default)
        .Range("O30").Value = 0

        ' Row 31: Total Tax
        .Range("O31").Formula = "=O27+O28+O29+O30"

        ' Row 32: Total Amount After Tax
        .Range("O32").Formula = "=O26+O31"

        ' Format all calculation cells
        .Range("O26:O32").NumberFormat = "#,##0.00"

        ' AMOUNT IN WORDS UPDATE
        ' Update Amount in Words (A27 merged cell)
        .Range("A27").Formula = "=NumberToWords(O32)"
    End With

    Exit Sub

ErrorHandler:
    Call HandleUnifiedError("UpdateMultiItemTaxCalculations", Err.Number, Err.Description, "Tax Engine")
End Sub

' Advanced tax engine support functions

Private Sub SetupBasicCalculationFormulas(ws As Worksheet, firstRow As String)
    ' Setup basic amount and taxable value calculation formulas
    
    With ws
        ' Column G (Amount) = Quantity * Rate with validation
        .Range("G" & firstRow).Formula = "=IF(AND(D" & firstRow & "<>"""",F" & firstRow & "<>"""",ISNUMBER(D" & firstRow & "),ISNUMBER(F" & firstRow & ")),ROUND(D" & firstRow & "*F" & firstRow & ",2),"""")"

        ' Column H (Taxable Value) = Amount (with error checking)
        .Range("H" & firstRow).Formula = "=IF(AND(G" & firstRow & "<>"""",ISNUMBER(G" & firstRow & ")),G" & firstRow & ","""")"
    End With
End Sub

Private Sub SetupTaxFormulas(ws As Worksheet, firstRow As String)
    ' Setup optimized tax calculation formulas with advanced error handling
    ' UPDATED: Uses new dropdown structure - CGST(D), SGST(E), IGST(F)
    
    With ws
        ' CGST Rate - NEW COLUMN D for CGST percentage
        .Range(CGST_RATE_COL & firstRow).Formula = "=IF(AND(" & SALE_TYPE_CELL & "=""Intrastate"",LEN(C" & firstRow & ")>0),IFERROR(INDEX(" & DROPDOWNS_SHEET_NAME & "!$D$2:$D$50,MATCH(C" & firstRow & "," & DROPDOWNS_SHEET_NAME & "!$A$2:$A$50,0)),0),0)"

        ' CGST Amount with enhanced precision and validation
        .Range(CGST_AMOUNT_COL & firstRow).Formula = "=IF(AND(ISNUMBER(H" & firstRow & "),H" & firstRow & ">0,ISNUMBER(" & CGST_RATE_COL & firstRow & ")," & CGST_RATE_COL & firstRow & ">0),ROUND(H" & firstRow & "*" & CGST_RATE_COL & firstRow & "/100,2),0)"

        ' SGST Rate - NEW COLUMN E for SGST percentage
        .Range(SGST_RATE_COL & firstRow).Formula = "=IF(AND(" & SALE_TYPE_CELL & "=""Intrastate"",LEN(C" & firstRow & ")>0),IFERROR(INDEX(" & DROPDOWNS_SHEET_NAME & "!$E$2:$E$50,MATCH(C" & firstRow & "," & DROPDOWNS_SHEET_NAME & "!$A$2:$A$50,0)),0),0)"

        ' SGST Amount with enhanced validation 
        .Range(SGST_AMOUNT_COL & firstRow).Formula = "=IF(AND(ISNUMBER(H" & firstRow & "),H" & firstRow & ">0,ISNUMBER(" & SGST_RATE_COL & firstRow & ")," & SGST_RATE_COL & firstRow & ">0),ROUND(H" & firstRow & "*" & SGST_RATE_COL & firstRow & "/100,2),0)"

        ' IGST Rate - NEW COLUMN F for IGST percentage  
        .Range(IGST_RATE_COL & firstRow).Formula = "=IF(AND(" & SALE_TYPE_CELL & "=""Interstate"",LEN(C" & firstRow & ")>0),IFERROR(INDEX(" & DROPDOWNS_SHEET_NAME & "!$F$2:$F$50,MATCH(C" & firstRow & "," & DROPDOWNS_SHEET_NAME & "!$A$2:$A$50,0)),0),0)"

        ' IGST Amount with comprehensive validation
        .Range(IGST_AMOUNT_COL & firstRow).Formula = "=IF(AND(ISNUMBER(H" & firstRow & "),H" & firstRow & ">0,ISNUMBER(" & IGST_RATE_COL & firstRow & ")," & IGST_RATE_COL & firstRow & ">0),ROUND(H" & firstRow & "*" & IGST_RATE_COL & firstRow & "/100,2),0)"
    End With
End Sub

Private Sub SetupTotalFormulas(ws As Worksheet, firstRow As String)
    ' Setup optimized total calculation formulas with advanced logic
    ' Optimized calculation chains, conditional logic, precision control
    
    With ws
        ' Total Amount with optimized logic and enhanced validation
        .Range(TOTAL_AMOUNT_COL & firstRow).Formula = "=IF(AND(ISNUMBER(H" & firstRow & "),H" & firstRow & ">0),IF(" & SALE_TYPE_CELL & "=""Interstate"",ROUND(H" & firstRow & "+MAX(0," & IGST_AMOUNT_COL & firstRow & "),2),IF(" & SALE_TYPE_CELL & "=""Intrastate"",ROUND(H" & firstRow & "+MAX(0," & CGST_AMOUNT_COL & firstRow & ")+MAX(0," & SGST_AMOUNT_COL & firstRow & "),2),H" & firstRow & ")),0)"
    End With
End Sub

Private Sub ApplyPrecisionFormatting(ws As Worksheet, firstRow As String)
    ' Apply number formatting with financial precision controls
    
    With ws
        ' Format amount and total cells with 2-decimal precision
        .Range("G" & firstRow & ":" & TOTAL_AMOUNT_COL & firstRow).NumberFormat = "#,##0.00"
        
        ' Format tax rate cells with percentage display
        .Range(CGST_RATE_COL & firstRow & "," & SGST_RATE_COL & firstRow & "," & IGST_RATE_COL & firstRow).NumberFormat = "0.00"
        
        ' Ensure tax amount cells show proper decimal precision
        .Range(CGST_AMOUNT_COL & firstRow & "," & SGST_AMOUNT_COL & firstRow & "," & IGST_AMOUNT_COL & firstRow).NumberFormat = "#,##0.00"
    End With
End Sub

Private Function ValidateFormulaSetup(ws As Worksheet, firstRow As String) As Boolean
    ' Validate that all formulas were set up correctly
    
    On Error GoTo ValidationError
    
    With ws
        ' Check that critical formula cells have formulas
        If Left(.Range("G" & firstRow).Formula, 1) <> "=" Then
            ValidateFormulaSetup = False
            Exit Function
        End If
        
        If Left(.Range(CGST_AMOUNT_COL & firstRow).Formula, 1) <> "=" Then
            ValidateFormulaSetup = False
            Exit Function
        End If
        
        If Left(.Range(TOTAL_AMOUNT_COL & firstRow).Formula, 1) <> "=" Then
            ValidateFormulaSetup = False
            Exit Function
        End If
    End With
    
    ' All validations passed
    ValidateFormulaSetup = True
    Exit Function
    
ValidationError:
    ValidateFormulaSetup = False
End Function

Private Function ValidateSystemConstants() As Boolean
    ' Validate that all required constants are properly loaded
    On Error GoTo ConstantError
    
    ' Test critical constants
    If Len(CGST_RATE_COL) = 0 Or Len(IGST_RATE_COL) = 0 Or Len(SALE_TYPE_CELL) = 0 Then
        ValidateSystemConstants = False
        Exit Function
    End If
    
    If ITEM_START_ROW <= 0 Or ITEM_END_ROW <= 0 Then
        ValidateSystemConstants = False
        Exit Function
    End If
    
    ValidateSystemConstants = True
    Exit Function
    
ConstantError:
    ValidateSystemConstants = False
End Function
