export interface IPaymentInitiate {
    userId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    customerPostCode?: string;
    customerCountry?: string;
    productName: string;
    productCategory?: string;
}

export interface ISSLCOMMERZResponse {
    status?: string;
    failedreason?: string;

    GatewayPageURL?: string;
    GatewayPageURLFailed?: string;

    sessionkey?: string;

    tran_date?: string;
    tran_id?: string;
    val_id?: string;

    amount?: string;
    store_amount?: string;

    bank_tran_id?: string;

    card_type?: string;
    card_no?: string;
    card_issuer?: string;
    card_brand?: string;

    card_issuer_country?: string;
    card_issuer_country_code?: string;

    risk_level?: string;
    risk_title?: string;

    currency?: string;
    currency_type?: string;

    [key: string]: unknown;
}

export interface IPaymentCallback {
    tran_id?: string;
    val_id?: string;
    amount?: string;
    status?: string;
    bank_tran_id?: string;
    card_type?: string;
    card_brand?: string;
    card_issuer?: string;
    card_issuer_country?: string;
    risk_level?: string;
    risk_title?: string;
    [key: string]: unknown;
}
