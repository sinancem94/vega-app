export {};

interface PartFields {
  partNumber: string,
  partDesc: string,
  partQuantity: string,
  unitPrices: string,
  unitCurrency: string,
  purchaseOrder: string,
  orderType: string,
}

interface VendorFields {
  vendorCode: string,
  vendorName: string,
}

interface MainFields {
  sheetName: string,
}

export interface FilterFields {
  typeFilter: string[],
  currencyFilter: string[],
  vendorFilter: string[],
}

export interface AllMappedFields extends PartFields, VendorFields, MainFields, FilterFields {}

export class FieldMapper {
    constructor() {
      this.main = { sheetName: "" };
      this.vendor = { vendorCode: "", vendorName: "" };
      this.part = { partNumber: "", partDesc: "", partQuantity: "", unitPrices: "", unitCurrency: "", purchaseOrder: "", orderType: "" };
      this.filter = { typeFilter: [], currencyFilter: [], vendorFilter:[] };
    }

    main: MainFields;
    vendor: VendorFields;
    part: PartFields;
    filter: FilterFields;

    joinedFields(): AllMappedFields {
      return { ...this.part, ...this.vendor, ...this.main, ...this.filter };
    }

    mapFields(form: any) {
      this.MapMain(form);
      this.MapVendor(form);
      this.MapPart(form);
      this.MapFilter(form);
    }
  
    MapMain(form: any){
      this.main.sheetName = form.sheet_name ?? this.getDefault();
      return this.main;
    }

    MapVendor(form: any){
      this.vendor.vendorCode = form.vendor_code ?? this.getDefault();
      this.vendor.vendorName = form.vendor_name ?? this.getDefault();
      return this.vendor;
    }

    MapPart(form: any){
      this.part.partNumber = form.part_number ?? this.getDefault();
      this.part.partDesc = form.part_description ?? this.getDefault();
      this.part.partQuantity = form.part_quantity ?? this.getDefault();
      this.part.unitPrices = form.unit_prices ?? this.getDefault();
      this.part.unitCurrency = form.unit_currency ?? this.getDefault();
      this.part.purchaseOrder = form.purchase_order ?? this.getDefault();
      this.part.orderType = form.order_type ?? this.getDefault();
      return this.part;
    }

    MapFilter(form: any){

      for(let i = 0; i < form.type_filter.length; i++){
        this.filter.typeFilter.push(form.type_filter[i]);
      }

      for(let i = 0; i < form.currency_filter.length; i++){
        this.filter.currencyFilter.push(form.currency_filter[i]);
      }

      for(let i = 0; i < form.vendor_filter.length; i++){
        this.filter.vendorFilter.push(form.vendor_filter[i]);
      }

      return this.filter;
    }


    protected getDefault(){
      return "";
    }
}

module.exports = FieldMapper;