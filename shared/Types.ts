export interface ExtractXMLPayload {
  urls: string[];
}

// Most of these fields could be optional depending on the data.
// So always use safe getters.
export interface CharityForm990JSON {
  Return: {
    ReturnHeader: {
      ReturnType?: string;
      TaxPeriodEndDate?: string;
      TaxPeriodBeginDate?: string;
      Filer: {
        EIN?: string;
        Name: {
          BusinessNameLine1?: string;
          BusinessNameLine2?: string;
        };
        NameControl?: string;
        Phone?: string;
        USAddress: {
          AddressLine1?: string;
          AddressLine2?: string;
          City?: string;
          State?: string;
          ZIPCode?: string;
        };
      };
      TaxYear?: string;
    };
  };
}
