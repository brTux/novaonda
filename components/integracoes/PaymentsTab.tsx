"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { PaymentSettingsForm } from "@/components/settings/PaymentSettingsForm";

interface PaymentsTabProps {
    credentials: any[];
}

export function PaymentsTab({ credentials }: PaymentsTabProps) {
    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[#2d3339]">Gateways de Pagamento</h3>
                <p className="text-sm text-[#555d66] font-medium">Configure as chaves de API para automatizar a entrega após o pagamento.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                <PaymentSettingsForm initialCredentials={credentials} />
            </div>
        </div>
    );
}
