Option Explicit
' Module 6: Dropdown Management
' Handles all dropdown list data and validation setup separately from customer data
' Creates and manages the Dropdowns sheet with HSN codes, states, and validation lists

' Dropdowns sheet creation and management

Public Sub CreateDropdownsSheet()
    ' Creates a centralized "Dropdowns" sheet containing all validation lists
    ' Separates dropdown data from customer data
    
    Dim ws As Worksheet
    Dim i As Integer
    Dim hsnData As Variant
    Dim uomList As Variant
    Dim transportList As Variant
    Dim saleTypeList As Variant
    Dim stateList As Variant
    Dim stateCodeList As Variant
    Dim gstTypeList As Variant

    On Error Resume Next
    Set ws = ThisWorkbook.Sheets(DROPDOWNS_SHEET_NAME)
    If Not ws Is Nothing Then
        Application.DisplayAlerts = False
        ws.Delete
        Application.DisplayAlerts = True
    End If
    On Error GoTo 0

    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = DROPDOWNS_SHEET_NAME

    With ws
        ' REORGANIZED DROPDOWN STRUCTURE PER REQUIREMENTS
        
        ' SECTION 1: HSN Code with Explanation and Rates (Columns A-F)
        .Range("A1").Value = "HSN_Code"
        .Range("B1").Value = "Explanation"
        .Range("C1").Value = "Rate"
        .Range("D1").Value = "CGST_%"
        .Range("E1").Value = "SGST_%"
        .Range("F1").Value = "IGST_%"

        ' Format HSN headers
        .Range("A1:F1").Font.Bold = True
        .Range("A1:F1").Interior.Color = RGB(47, 80, 97)
        .Range("A1:F1").Font.Color = RGB(255, 255, 255)
        .Range("A1:F1").Borders.Color = RGB(204, 204, 204)

        ' Enhanced HSN data with complete structure - REAL DATA FROM ONLINE SOURCE
        ' Split into multiple arrays to avoid VBA line continuation limit
        Dim hsnData1 As Variant
        Dim hsnData2 As Variant
        Dim hsnData3 As Variant
        
        hsnData1 = Array( _
            Array("4401", "Wood in chips or particles; sawdust and wood waste", 8, 2.5, 2.5, 5), _
            Array("4601", "Mats, matting and screens of vegetable material", 250, 2.5, 2.5, 5), _
            Array("4823", "Articles made of paper mache", 1000, 2.5, 2.5, 5), _
            Array("4404", "Hoopwood; split poles; piles, pickets and stakes", 35, 6, 6, 12), _
            Array("4405", "Wood wool; wood flour", 16, 6, 6, 12), _
            Array("4406", "Railway or tramway sleepers of wood", 1500, 6, 6, 12), _
            Array("4408", "Sheets for veneering, for plywood", 95, 6, 6, 12), _
            Array("4409", "Bamboo flooring", 190, 6, 6, 12), _
            Array("4415", "Packing cases, boxes, crates, drums", 1000, 6, 6, 12) _
        )
        
        hsnData2 = Array( _
            Array("4416", "Casks, barrels, vats, tubs and coopers products", 2500, 6, 6, 12), _
            Array("4417", "Tools, tool bodies, tool handles", 275, 6, 6, 12), _
            Array("4418", "Bamboo wood building joinery", 450, 6, 6, 12), _
            Array("4419", "Tableware and kitchenware of wood", 1300, 6, 6, 12), _
            Array("4420", "Wood marquetry and inlaid wood; caskets", 5250, 6, 6, 12), _
            Array("4421", "Other articles of wood", 510, 6, 6, 12), _
            Array("3803", "Tall oil, whether or not refined", 42, 9, 9, 18), _
            Array("3804", "Residual lyes from manufacture of wood pulp", 27, 9, 9, 18), _
            Array("3805", "Gum, wood or sulphate turpentine", 140, 9, 9, 18) _
        )
        
        hsnData3 = Array( _
            Array("3807", "Wood tar; wood tar oils; wood creosote", 75, 9, 9, 18), _
            Array("4403", "Wood in the rough", 1125, 9, 9, 18), _
            Array("4407", "Wood sawn or chipped lengthwise", 1750, 9, 9, 18), _
            Array("4410", "Particle board, Oriented Strand Board", 80, 9, 9, 18), _
            Array("4411", "Fibre board of wood or other ligneous materials", 67, 9, 9, 18), _
            Array("4412", "Plywood, veneered panels and similar laminated wood", 100, 9, 9, 18), _
            Array("4413", "Densified wood, in blocks, plates, strips", 190, 9, 9, 18), _
            Array("4414", "Wooden frames for paintings, photographs, mirrors", 2600, 9, 9, 18), _
            Array("6808", "Panels, boards, tiles of vegetable fibre", 52, 9, 9, 18) _
        )

        ' Populate HSN data from multiple arrays
        Dim rowNum As Integer
        rowNum = 2
        
        ' Array 1
        For i = 0 To UBound(hsnData1)
            .Cells(rowNum, 1).Value = hsnData1(i)(0)
            .Cells(rowNum, 2).Value = hsnData1(i)(1)
            .Cells(rowNum, 3).Value = hsnData1(i)(2)
            .Cells(rowNum, 4).Value = hsnData1(i)(3)
            .Cells(rowNum, 5).Value = hsnData1(i)(4)
            .Cells(rowNum, 6).Value = hsnData1(i)(5)
            rowNum = rowNum + 1
        Next i
        
        ' Array 2
        For i = 0 To UBound(hsnData2)
            .Cells(rowNum, 1).Value = hsnData2(i)(0)
            .Cells(rowNum, 2).Value = hsnData2(i)(1)
            .Cells(rowNum, 3).Value = hsnData2(i)(2)
            .Cells(rowNum, 4).Value = hsnData2(i)(3)
            .Cells(rowNum, 5).Value = hsnData2(i)(4)
            .Cells(rowNum, 6).Value = hsnData2(i)(5)
            rowNum = rowNum + 1
        Next i
        
        ' Array 3
        For i = 0 To UBound(hsnData3)
            .Cells(rowNum, 1).Value = hsnData3(i)(0)
            .Cells(rowNum, 2).Value = hsnData3(i)(1)
            .Cells(rowNum, 3).Value = hsnData3(i)(2)
            .Cells(rowNum, 4).Value = hsnData3(i)(3)
            .Cells(rowNum, 5).Value = hsnData3(i)(4)
            .Cells(rowNum, 6).Value = hsnData3(i)(5)
            rowNum = rowNum + 1
        Next i

        ' SECTION 2: State List and State Code List (Columns H-I, with gap)
        .Range("H1").Value = "State_List"
        .Range("I1").Value = "State_Code_List"
        .Range("H1:I1").Font.Bold = True
        .Range("H1:I1").Interior.Color = RGB(47, 80, 97)
        .Range("H1:I1").Font.Color = RGB(255, 255, 255)

        ' Split state arrays to avoid line continuation limit
        Dim stateList1 As Variant
        Dim stateList2 As Variant
        Dim stateCodeList1 As Variant
        Dim stateCodeList2 As Variant
        
        stateList1 = Array("Jammu and Kashmir", "Himachal Pradesh", "Punjab", "Chandigarh", "Uttarakhand", "Haryana", "Delhi", "Rajasthan", "Uttar Pradesh", "Bihar", "Sikkim", "Arunachal Pradesh", "Nagaland", "Manipur", "Mizoram", "Tripura", "Meghalaya", "Assam", "West Bengal")
        stateCodeList1 = Array("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19")
        
        stateList2 = Array("Jharkhand", "Odisha", "Chhattisgarh", "Madhya Pradesh", "Gujarat", "Dadra and Nagar Haveli and Daman and Diu", "Maharashtra", "Karnataka", "Goa", "Lakshadweep", "Kerala", "Tamil Nadu", "Puducherry", "Andaman and Nicobar Islands", "Telangana", "Andhra Pradesh", "Ladakh", "OTHER TERRITORY", "OTHER COUNTRIES")
        stateCodeList2 = Array("20", "21", "22", "23", "24", "26", "27", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "97", "96")
        
        rowNum = 2
        
        ' Populate first set of states
        For i = 0 To UBound(stateList1)
            .Cells(rowNum, 8).Value = stateList1(i)
            .Cells(rowNum, 9).Value = stateCodeList1(i)
            rowNum = rowNum + 1
        Next i
        
        ' Populate second set of states
        For i = 0 To UBound(stateList2)
            .Cells(rowNum, 8).Value = stateList2(i)
            .Cells(rowNum, 9).Value = stateCodeList2(i)
            rowNum = rowNum + 1
        Next i

        ' SECTION 3: UOM List and Unit Description (Columns K-L, with gap)
        .Range("K1").Value = "Unit"
        .Range("L1").Value = "Unit_Description"
        .Range("K1:L1").Font.Bold = True
        .Range("K1:L1").Interior.Color = RGB(47, 80, 97)
        .Range("K1:L1").Font.Color = RGB(255, 255, 255)

        ' Split UOM data to avoid line continuation limit
        Dim uomData1 As Variant
        Dim uomData2 As Variant
        Dim uomData3 As Variant
        
        uomData1 = Array( _
            Array("BAG", "BAGS"), _
            Array("BAL", "BALE"), _
            Array("BDL", "BUNDLES"), _
            Array("BOX", "BOX"), _
            Array("BTL", "BOTTLES"), _
            Array("BUN", "BUNCHES"), _
            Array("CAN", "CANS"), _
            Array("CBM", "CUBIC METERS"), _
            Array("CCM", "CUBIC CENTIMETERS"), _
            Array("CMS", "CENTI METERS"), _
            Array("CTN", "CARTONS"), _
            Array("DOZ", "DOZENS"), _
            Array("DRM", "DRUMS") _
        )
        
        uomData2 = Array( _
            Array("GMS", "GRAMMES"), _
            Array("GRS", "GROSS"), _
            Array("KGS", "KILOGRAMS"), _
            Array("KLR", "KILOLITRE"), _
            Array("KME", "KILOMETRE"), _
            Array("LTR", "LITER"), _
            Array("MLS", "MILLI LITRES"), _
            Array("MTR", "METERS"), _
            Array("MTS", "METRIC TON"), _
            Array("NOS", "NUMBERS"), _
            Array("PAC", "PACKS"), _
            Array("PAR", "PAIRS"), _
            Array("PCS", "PIECES") _
        )
        
        uomData3 = Array( _
            Array("QTL", "QUINTAL"), _
            Array("ROL", "ROLLS"), _
            Array("SET", "SETS"), _
            Array("SQF", "SQUARE FEET"), _
            Array("SQM", "SQUARE METERS"), _
            Array("SQY", "SQUARE YARDS"), _
            Array("TBS", "TABLETS"), _
            Array("THD", "THOUSANDS"), _
            Array("TON", "TONNES"), _
            Array("TUB", "TUBES"), _
            Array("UNT", "UNITS"), _
            Array("YDS", "YARDS") _
        )
        
        rowNum = 2
        
        ' Populate UOM data from multiple arrays
        For i = 0 To UBound(uomData1)
            .Cells(rowNum, 11).Value = uomData1(i)(0)
            .Cells(rowNum, 12).Value = uomData1(i)(1)
            rowNum = rowNum + 1
        Next i
        
        For i = 0 To UBound(uomData2)
            .Cells(rowNum, 11).Value = uomData2(i)(0)
            .Cells(rowNum, 12).Value = uomData2(i)(1)
            rowNum = rowNum + 1
        Next i
        
        For i = 0 To UBound(uomData3)
            .Cells(rowNum, 11).Value = uomData3(i)(0)
            .Cells(rowNum, 12).Value = uomData3(i)(1)
            rowNum = rowNum + 1
        Next i

        ' SECTION 4: Transport Mode List (Column M, with gap)
        .Range("M1").Value = "Transport_Mode_List"
        .Range("M1").Font.Bold = True
        .Range("M1").Interior.Color = RGB(47, 80, 97)
        .Range("M1").Font.Color = RGB(255, 255, 255)

        transportList = Array("By Lorry", "By Train", "By Air", "By Ship", "By Hand", "Courier", "Self Transport", "By Road")
        For i = 0 To UBound(transportList)
            .Cells(i + 2, 13).Value = transportList(i)
        Next i

        ' SECTION 5: GST Type (Column O, with gap)
        .Range("O1").Value = "GST_Type"
        .Range("O1").Font.Bold = True
        .Range("O1").Interior.Color = RGB(47, 80, 97)
        .Range("O1").Font.Color = RGB(255, 255, 255)
        .Range("O2").Value = "REGISTERED"
        .Range("O3").Value = "UNREGISTERED"
        .Range("O4").Value = "COMPOSITION"
        .Range("O5").Value = "EXPORT"

        ' SECTION 6: Description (Sample Product Data) (Column Q, with gap)
        .Range("Q1").Value = "Description"
        .Range("Q1").Font.Bold = True
        .Range("Q1").Interior.Color = RGB(47, 80, 97)
        .Range("Q1").Font.Color = RGB(255, 255, 255)
        .Range("Q2").Value = "Casuarina Wood"
        .Range("Q3").Value = "Casuarina Poles"
        .Range("Q4").Value = "Timber Logs"
        .Range("Q5").Value = "Wooden Planks"
        .Range("Q6").Value = "Construction Wood"

        ' SECTION 7: Sale Type (Column S, with gap)
        .Range("S1").Value = "Sale_Type"
        .Range("S1").Font.Bold = True
        .Range("S1").Interior.Color = RGB(47, 80, 97)
        .Range("S1").Font.Color = RGB(255, 255, 255)
        .Range("S2").Value = "Interstate"
        .Range("S3").Value = "Intrastate"

        ' Formatting and protection
        
        ' Set optimized column widths for new structure
        .Columns("A").ColumnWidth = 10
        .Columns("B").ColumnWidth = 40
        .Columns("C").ColumnWidth = 12
        .Columns("D").ColumnWidth = 8
        .Columns("E").ColumnWidth = 8
        .Columns("F").ColumnWidth = 8
        .Columns("H").ColumnWidth = 25
        .Columns("I").ColumnWidth = 12
        .Columns("K").ColumnWidth = 8
        .Columns("L").ColumnWidth = 20
        .Columns("M").ColumnWidth = 15
        .Columns("O").ColumnWidth = 15
        .Columns("Q").ColumnWidth = 20
        .Columns("S").ColumnWidth = 12
        
        ' Add borders to all data sections
        .Range("A1:F28").Borders.Color = RGB(204, 204, 204)
        .Range("H1:I39").Borders.Color = RGB(204, 204, 204)
        .Range("K1:L39").Borders.Color = RGB(204, 204, 204)
        .Range("M1:M10").Borders.Color = RGB(204, 204, 204)
        .Range("O1:O5").Borders.Color = RGB(204, 204, 204)
        .Range("Q1:Q6").Borders.Color = RGB(204, 204, 204)
        .Range("S1:S3").Borders.Color = RGB(204, 204, 204)
        
        ' Freeze top row
        .Range("A2").Select
        ActiveWindow.FreezePanes = True
        
        ' Set sheet tab color
        .Tab.Color = RGB(255, 165, 0)
    End With
    
    Exit Sub

ErrorHandler:
    MsgBox "Error creating Dropdowns sheet: " & Err.Description, vbCritical, "Sheet Creation Error"
End Sub

' Dropdown validation setup

Public Sub SetupAllDropdownValidations(invoiceWs As Worksheet)
    ' Setup all dropdown validations using Dropdowns sheet data
    
    On Error Resume Next

    ' Ensure Dropdowns sheet exists
    If GetOrCreateWorksheet(DROPDOWNS_SHEET_NAME) Is Nothing Then
        Call CreateDropdownsSheet
    End If

    With invoiceWs
        ' Sale Type dropdown (N7)
        .Range("N7").Validation.Delete
        .Range("N7").Validation.Add Type:=xlValidateList, _
                                  AlertStyle:=xlValidAlertWarning, _
                                  Formula1:="=Dropdowns!$S$2:$S$3"
        .Range("N7").Validation.ShowError = False
        .Range("N7").Validation.InCellDropdown = True

        ' Transport Mode dropdown (F7)
        .Range("F7").Validation.Delete
        .Range("F7").Validation.Add Type:=xlValidateList, _
                                  AlertStyle:=xlValidAlertWarning, _
                                  Formula1:="=Dropdowns!$M$2:$M$9"
        .Range("F7").Validation.ShowError = False
        .Range("F7").Validation.InCellDropdown = True

        ' UOM dropdowns for product rows (E19:E24)
        .Range("E19:E24").Validation.Delete
        .Range("E19:E24").Validation.Add Type:=xlValidateList, _
                                         AlertStyle:=xlValidAlertWarning, _
                                         Formula1:="=Dropdowns!$K$2:$K$39"
        .Range("E19:E24").Validation.ShowError = False
        .Range("E19:E24").Validation.InCellDropdown = True

        ' HSN Code dropdowns for product rows (C19:C24)
        .Range("C19:C24").Validation.Delete
        .Range("C19:C24").Validation.Add Type:=xlValidateList, _
                                         AlertStyle:=xlValidAlertWarning, _
                                         Formula1:="=Dropdowns!$A$2:$A$28"
        .Range("C19:C24").Validation.ShowError = False
        .Range("C19:C24").Validation.InCellDropdown = True

        ' Product Description dropdowns for product rows (B19:B24)
        .Range("B19:B24").Validation.Delete
        .Range("B19:B24").Validation.Add Type:=xlValidateList, _
                                         AlertStyle:=xlValidAlertWarning, _
                                         Formula1:="=Dropdowns!$Q$2:$Q$6"
        .Range("B19:B24").Validation.ShowError = False
        .Range("B19:B24").Validation.InCellDropdown = True

        ' State dropdown for customer (C15)
        .Range("C15").Validation.Delete
        .Range("C15").Validation.Add Type:=xlValidateList, _
                                   AlertStyle:=xlValidAlertWarning, _
                                   Formula1:="=Dropdowns!$H$2:$H$39"
        .Range("C15").Validation.ShowError = False
        .Range("C15").Validation.InCellDropdown = True

        ' Consignee State dropdown (K15)
        .Range("K15").Validation.Delete
        .Range("K15").Validation.Add Type:=xlValidateList, _
                                   AlertStyle:=xlValidAlertWarning, _
                                   Formula1:="=Dropdowns!$H$2:$H$39"
        .Range("K15").Validation.ShowError = False
        .Range("K15").Validation.InCellDropdown = True
        
        ' Customer GSTIN dropdown (C14) - Pull from Dropdowns sheet column O (GST Types)
        .Range("C14").Validation.Delete
        .Range("C14").Validation.Add Type:=xlValidateList, _
                                   AlertStyle:=xlValidAlertWarning, _
                                   Formula1:="=Dropdowns!$O$2:$O$5"
        .Range("C14").Validation.ShowError = False
        .Range("C14").Validation.InCellDropdown = True
        
        ' Consignee GSTIN dropdown (K14) - Pull from Dropdowns sheet column O (GST Types)
        .Range("K14").Validation.Delete
        .Range("K14").Validation.Add Type:=xlValidateList, _
                                   AlertStyle:=xlValidAlertWarning, _
                                   Formula1:="=Dropdowns!$O$2:$O$5"
        .Range("K14").Validation.ShowError = False
        .Range("K14").Validation.InCellDropdown = True
        
        ' Ensure E-way Bill field (N10) has no validation - manual entry only
        .Range("N10").Validation.Delete
        .Range("N10").Value = "Not Applicable"  ' Set default value
        .Range("N10").Font.Color = RGB(100, 100, 100)  ' Gray color to indicate default
        
    End With

    On Error GoTo 0
End Sub

Public Sub SetupAutoTaxCalculation(invoiceWs As Worksheet)
    ' Setup automatic tax calculations referencing Dropdowns sheet
    
    Dim i As Long
    On Error Resume Next

    With invoiceWs
        ' Setup tax rate lookups for each product row (19-24)
        For i = 19 To 24
            ' CGST Rate (I column)
            .Range("I" & i).Formula = "=IF(AND($N$7=""Intrastate"",C" & i & "<>""""),IFERROR(VLOOKUP(C" & i & ",Dropdowns!$A:$F,4,FALSE),0),"""")"
            
            ' CGST Amount (J column)
            .Range("J" & i).Formula = "=IF(I" & i & "<>"""",ROUND(H" & i & "*I" & i & "/100,2),"""")"
            
            ' SGST Rate (K column)
            .Range("K" & i).Formula = "=IF(AND($N$7=""Intrastate"",C" & i & "<>""""),IFERROR(VLOOKUP(C" & i & ",Dropdowns!$A:$F,5,FALSE),0),"""")"
            
            ' SGST Amount (L column)
            .Range("L" & i).Formula = "=IF(K" & i & "<>"""",ROUND(H" & i & "*K" & i & "/100,2),"""")"
            
            ' IGST Rate (M column)
            .Range("M" & i).Formula = "=IF(AND($N$7=""Interstate"",C" & i & "<>""""),IFERROR(VLOOKUP(C" & i & ",Dropdowns!$A:$F,6,FALSE),0),"""")"
            
            ' IGST Amount (N column)
            .Range("N" & i).Formula = "=IF(M" & i & "<>"""",ROUND(H" & i & "*M" & i & "/100,2),"""")"
            
            ' Total Amount (O column)
            .Range("O" & i).Formula = "=IF(H" & i & "<>"""",H" & i & "+J" & i & "+L" & i & "+N" & i & ","""")"
        Next i
        
        ' Setup total calculations (row 25)
        .Range("H25").Formula = "=SUM(H19:H24)"
        .Range("J25").Formula = "=SUM(J19:J24)"
        .Range("L25").Formula = "=SUM(L19:L24)"
        .Range("N25").Formula = "=SUM(N19:N24)"
        .Range("O25").Formula = "=SUM(O19:O24)"
        
        ' Auto-fill rate from HSN selection
        For i = 19 To 24
            .Range("F" & i).Formula = "=IF(C" & i & "<>"""",IFERROR(VLOOKUP(C" & i & ",Dropdowns!$A:$F,3,FALSE),""""),"""")"
        Next i
        
        .Calculate
    End With

    On Error GoTo 0
End Sub

Public Sub EnableAutoUpdates(invoiceWs As Worksheet)
    ' Enable automatic updates for sale type changes and calculations
    
    On Error Resume Next
    
    Application.Calculation = xlCalculationAutomatic
    Application.EnableEvents = True
    
    invoiceWs.Calculate
    Call Application.Calculate
    
    Dim currentSaleType As String
    currentSaleType = Trim(invoiceWs.Range("N7").Value)
    If currentSaleType = "Interstate" Or currentSaleType = "Intrastate" Then
        Call UpdateTaxFieldsDisplay(invoiceWs, currentSaleType)
    End If
    
    On Error GoTo 0
End Sub

Public Sub HandleSaleTypeAutoUpdate(invoiceWs As Worksheet)
    ' Automatically handle sale type changes
    
    Dim saleType As String
    On Error Resume Next
    
    saleType = Trim(invoiceWs.Range("N7").Value)
    
    If saleType = "Interstate" Or saleType = "Intrastate" Then
        Call UpdateTaxFieldsDisplay(invoiceWs, saleType)
        
        invoiceWs.Calculate
        Call Application.Calculate
        
        If saleType = "Interstate" Then
            invoiceWs.Range("I19:I24,K19:K24").Value = ""
        Else
            invoiceWs.Range("M19:M24").Value = ""
        End If
    End If
    
    On Error GoTo 0
End Sub

Public Function GetDropdownSheetReference(listName As String) As String
    ' Get proper Excel reference for dropdown lists
    
    Select Case UCase(listName)
        Case "HSN", "HSN_CODE"
            GetDropdownSheetReference = "=Dropdowns!$A$2:$A$28"
        Case "UOM", "UOM_LIST", "UNIT"
            GetDropdownSheetReference = "=Dropdowns!$K$2:$K$39"
        Case "UNIT_DESCRIPTION"
            GetDropdownSheetReference = "=Dropdowns!$L$2:$L$39"
        Case "TRANSPORT", "TRANSPORT_MODE"
            GetDropdownSheetReference = "=Dropdowns!$M$2:$M$9"
        Case "SALE_TYPE"
            GetDropdownSheetReference = "=Dropdowns!$S$2:$S$3"
        Case "STATE", "STATE_LIST"
            GetDropdownSheetReference = "=Dropdowns!$H$2:$H$39"
        Case "STATE_CODE"
            GetDropdownSheetReference = "=Dropdowns!$I$2:$I$39"
        Case "GST_TYPE"
            GetDropdownSheetReference = "=Dropdowns!$O$2:$O$5"
        Case "DESCRIPTION", "DESCRIPTION_SAMPLES"
            GetDropdownSheetReference = "=Dropdowns!$Q$2:$Q$6"
        Case "GSTIN", "GSTIN_LIST"
            GetDropdownSheetReference = "=Dropdowns!$O$2:$O$5"
        Case Else
            GetDropdownSheetReference = ""
    End Select
End Function

Public Sub VerifyDropdownValidations(invoiceWs As Worksheet)
    ' Verify all dropdown validations are correctly set up
    Dim message As String
    Dim testResult As String
    
    On Error Resume Next
    
    message = "DROPDOWN VALIDATION VERIFICATION:" & vbCrLf & vbCrLf
    
    ' Test C14 (Customer GSTIN)
    testResult = invoiceWs.Range("C14").Validation.Formula1
    If InStr(testResult, "O$2:$O$5") > 0 Then
        message = message & "[OK] C14 Customer GSTIN: Points to Dropdowns column O (GST Types)" & vbCrLf
        message = message & "     Formula: " & testResult & vbCrLf & vbCrLf
    Else
        message = message & "[ERROR] C14 Customer GSTIN: Wrong reference" & vbCrLf
        message = message & "     Current: " & testResult & vbCrLf
        message = message & "     Expected: Dropdowns sheet column O" & vbCrLf & vbCrLf
    End If
    
    ' Test K14 (Consignee GSTIN)
    testResult = invoiceWs.Range("K14").Validation.Formula1
    If InStr(testResult, "O$2:$O$5") > 0 Then
        message = message & "[OK] K14 Consignee GSTIN: Points to Dropdowns column O (GST Types)" & vbCrLf
        message = message & "     Formula: " & testResult & vbCrLf & vbCrLf
    Else
        message = message & "[ERROR] K14 Consignee GSTIN: Wrong reference" & vbCrLf
        message = message & "     Current: " & testResult & vbCrLf
        message = message & "     Expected: Dropdowns sheet column O" & vbCrLf & vbCrLf
    End If
    
    ' Test HSN dropdown
    testResult = invoiceWs.Range("C19").Validation.Formula1
    If InStr(testResult, "A$2:$A$28") > 0 Then
        message = message & "[OK] HSN Codes: Correctly points to A2:A28" & vbCrLf
    Else
        message = message & "[ERROR] HSN Codes: Wrong range" & vbCrLf
        message = message & "     Current: " & testResult & vbCrLf
    End If
    
    ' Test UOM dropdown  
    testResult = invoiceWs.Range("E19").Validation.Formula1
    If InStr(testResult, "K$2:$K$39") > 0 Then
        message = message & "[OK] UOM Units: Correctly points to K2:K39" & vbCrLf
    Else
        message = message & "[ERROR] UOM Units: Wrong range" & vbCrLf
        message = message & "     Current: " & testResult & vbCrLf
    End If
    
    message = message & vbCrLf & "NOTE: GSTIN dropdowns now pull from Dropdowns sheet column O (GST Types)," & vbCrLf
    message = message & "while actual GSTIN values are auto-populated via XLOOKUP formulas from warehouse data." & vbCrLf
    message = message & "E-way Bill field (N10) uses manual entry with default 'Not Applicable'."
    
    MsgBox message, vbInformation, "Dropdown Validation Check"
    
    On Error GoTo 0
End Sub
