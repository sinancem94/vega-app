export {};

import { Worksheet } from "exceljs";
import * as ExcelJS from 'exceljs';
const {Part} = require("./../objects/Part");
import { Analyser, PartAnalysis, PartsAnalysisResult } from "./Analyser";
import { AllMappedFields, FilterFields } from "./../mapper/Mapper"
import { ExcelParser } from "./ExcelParser";

export class PartAnalyser extends Analyser{

    parts: typeof Part[] | null;
    analysisResult: PartsAnalysisResult;

    constructor(worksheet: Worksheet) {
        super(worksheet);
        this.parts = null;
        this.analysisResult = {
            success: false,
            totalVolume: {},
            uniquePartCount: 0,
            uniqueVendorCount: 0,
            parts: [],
          };
    }

    reset(): void{
        super.reset();
        this.parts = null;
        this.analysisResult = {
            success: false,
            totalVolume: {},
            uniquePartCount: 0,
            uniqueVendorCount: 0,
            parts: [],
          };
    }

    getResultColumnNames(): string[] {
        return ["PN", "Part Description", "Vendor Name", "Vendor Code", "Quantity", "Total Quantity", "Price", "Total Price", "Currency", "Order Type", "Related POs"];
    }

    analyze(worksheet: ExcelJS.Worksheet, fields: AllMappedFields): PartsAnalysisResult {
        
        this.setFields(fields);
        this.setWorksheet(worksheet);

        var partNoColNum = this.getColumnNumberOfField(this.fields.partNumber);
        const uniquePNs = this.getUniqueValuesWithCount(Number(partNoColNum));
        
        for(const key in uniquePNs)
        {
            const rows: any[] = [];

            var found = 0;
            const rowCount = this.worksheet.rowCount;
            for (let i = 2; i <= rowCount; i++) {
                const row = this.worksheet.getRow(i);
                const columnValue = row.getCell(Number(partNoColNum)).value;

                if (columnValue == key) {
                    rows.push(row);
                    found++;
                }

                if (found >= uniquePNs[key]) {
                    let filters: FilterFields = { typeFilter: this.fields.typeFilter, currencyFilter: this.fields.currencyFilter, vendorFilter: this.fields.vendorFilter};
                    var analysis = this.analyzeRows(rows, filters);

                    if (analysis.partNo != ""){

                        this.analysisResult.parts.push(analysis);

                        for(const cur in analysis.prices){

                            let totalVol = 0;
                            analysis.prices[cur].forEach(price => {
                                totalVol += price;
                            });

                            if(this.analysisResult.totalVolume[cur]){
                                this.analysisResult.totalVolume[cur] += totalVol;
                            }
                            else{
                                this.analysisResult.totalVolume[cur] = totalVol;
                            }
                        }
                    }

                    
                    break;
                }
            }
        }
        this.analysisResult.uniqueVendorCount = this.getUniqueValuesOnColumn(Number(this.getColumnNumberOfField(this.fields.vendorCode))).length;
        this.analysisResult.uniquePartCount = Object.keys(uniquePNs).length;
        this.analysisResult.success = true;
        return this.analysisResult;
    }

    protected analyzeRows(rows: ExcelJS.Row[], filters: FilterFields): PartAnalysis {

        var partNoColNum = this.getColumnNumberOfField(this.fields.partNumber);
        var partDescColNum = this.getColumnNumberOfField(this.fields.partDesc);
        var partQtyColNum = this.getColumnNumberOfField(this.fields.partQuantity);
        var unitPriceColNum = this.getColumnNumberOfField(this.fields.unitPrices);
        var unitCurrColNum = this.getColumnNumberOfField(this.fields.unitCurrency);
        var purchaseOrderColNum = this.getColumnNumberOfField(this.fields.purchaseOrder);
        var orderTypeColNum = this.getColumnNumberOfField(this.fields.orderType);
        var vendorCodeColNum = this.getColumnNumberOfField(this.fields.vendorCode);
        var vendorNameColNum = this.getColumnNumberOfField(this.fields.vendorName);

        var analysisRes: PartAnalysis = {
            partNo: "", partDesc: "", quantities: [],
            purchaseOrders: {}, prices: {}, vendors: {}       
        };

        for(let i = 0; i < rows.length; i++){
            var row = rows[i];

            var orderType = row.getCell(Number(orderTypeColNum)).value as string;
            var currency = row.getCell(Number(unitCurrColNum)).value as string;
            var vendorName = row.getCell(Number(vendorNameColNum)).value as string;

            //check filters
            if( (filters.typeFilter.length > 0 && filters.typeFilter.some(t => {return t !== orderType;})) || 
                (filters.currencyFilter.length > 0 && filters.currencyFilter.some(c => {return c !== currency;})) ||
                (filters.vendorFilter.length > 0 && filters.vendorFilter.some(v => {return v !== vendorName;})) ) {
                    
                    continue;
            }


            analysisRes.partNo = row.getCell(Number(partNoColNum)).value as string;
            analysisRes.partDesc = row.getCell(Number(partDescColNum)).value as string;

            var qty = row.getCell(Number(partQtyColNum)).value as number;
            analysisRes.quantities.push(qty);
            
            
            var price = row.getCell(Number(unitPriceColNum)).value as number;
            
            if (analysisRes.prices[currency]){
                analysisRes.prices[currency].push(price);
            }
            else{
                analysisRes.prices[currency] = [price];
            }

            var purchaseOrder = row.getCell(Number(purchaseOrderColNum)).value as string;

            if(analysisRes.purchaseOrders[orderType]){
                analysisRes.purchaseOrders[orderType].push(purchaseOrder);
            }
            else{
                analysisRes.purchaseOrders[orderType] = [purchaseOrder];
            }

            var vendorCode = row.getCell(Number(vendorCodeColNum)).value as string;
            if (analysisRes.vendors[vendorCode]){
                analysisRes.vendors[vendorCode][1]++;
            }
            else{
                analysisRes.vendors[vendorCode] = [vendorName, 1];
            }
        }

        return analysisRes;
    }
}



module.exports = PartAnalyser;