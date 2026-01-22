export type PaymentProviderType = 'PUSHINPAY' | 'ASAAS' | 'MERCADOPAGO';

export interface PixChargeRequest {
    value: number; // In cents
    webhook_url?: string;
    description?: string;
    correlationId?: string; // Internal transaction ID
}

export interface PixChargeResponse {
    id: string; // Gateway transaction ID
    pixCopyPaste: string;
    pixQrCodeBase64: string;
    status: string;
    amount: number;
}

export interface IPaymentGateway {
    generatePix(request: PixChargeRequest): Promise<PixChargeResponse>;
    checkStatus(transactionId: string): Promise<any>;
}
