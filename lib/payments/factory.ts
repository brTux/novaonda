import { PushinPayProvider } from "./pushinpay";
import { IPaymentGateway, PaymentProviderType } from "./types";

export class PaymentGatewayFactory {
    static create(provider: PaymentProviderType, token: string, secret?: string | null): IPaymentGateway {
        switch (provider) {
            case 'PUSHINPAY':
                return new PushinPayProvider(token);
            case 'ASAAS':
                throw new Error("Asaas provider not implemented yet");
            case 'MERCADOPAGO':
                throw new Error("MercadoPago provider not implemented yet");
            default:
                throw new Error(`Unsupported payment provider: ${provider}`);
        }
    }
}
