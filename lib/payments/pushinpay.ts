import { IPaymentGateway, PixChargeRequest, PixChargeResponse } from "./types";

export class PushinPayProvider implements IPaymentGateway {
    private baseUrl = "https://api.pushinpay.com.br/api";
    private token: string;

    constructor(token: string, sandbox: boolean = false) {
        this.token = token;
        if (sandbox) {
            this.baseUrl = "https://api-sandbox.pushinpay.com.br/api";
        }
    }

    async generatePix(request: PixChargeRequest): Promise<PixChargeResponse> {
        console.log(`[PushinPay] Generating PIX charge for ${request.value} cents`);

        try {
            const response = await fetch(`${this.baseUrl}/pix/cashIn`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    value: request.value,
                    webhook_url: request.webhook_url
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("[PushinPay] API Error:", data);
                throw new Error(data.message || "Failed to generate PIX with PushinPay");
            }

            return {
                id: data.id,
                pixCopyPaste: data.qr_code,
                pixQrCodeBase64: data.qr_code_base64,
                status: data.status,
                amount: data.value
            };
        } catch (error) {
            console.error("[PushinPay] Network/API Error:", error);
            throw error;
        }
    }

    async checkStatus(transactionId: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/transaction/${transactionId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Accept": "application/json"
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("[PushinPay] Status Check Error:", error);
            throw error;
        }
    }
}
