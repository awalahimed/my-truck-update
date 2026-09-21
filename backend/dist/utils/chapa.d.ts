export interface ChapaInitializeOptions {
    amount: string;
    currency: string;
    email?: string;
    first_name: string;
    last_name: string;
    tx_ref: string;
    callback_url?: string;
    return_url?: string;
    customization?: {
        title?: string;
        description?: string;
        logo?: string;
    };
}
export interface ChapaInitializeResponse {
    message: string;
    status: string;
    data: {
        checkout_url: string;
    };
}
export interface ChapaVerifyResponse {
    message: string;
    status: string;
    data: {
        first_name: string;
        last_name: string;
        email: string;
        currency: string;
        amount: string;
        charge: string;
        mode: string;
        method: string;
        type: string;
        status: string;
        reference: string;
        tx_ref: string;
        customization: Record<string, unknown>;
        meta: Record<string, unknown> | null;
        created_at: string;
        updated_at: string;
    };
}
export declare class Chapa {
    private secretKey;
    private baseUrl;
    constructor();
    initialize(options: ChapaInitializeOptions): Promise<ChapaInitializeResponse>;
    verify(txRef: string): Promise<ChapaVerifyResponse>;
}
export declare const chapa: Chapa;
//# sourceMappingURL=chapa.d.ts.map