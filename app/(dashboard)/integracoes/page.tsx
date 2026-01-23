import { Metadata } from "next";
import { IntegrationContent } from "@/components/integracoes/IntegrationContent";
import { getBots } from "@/app/actions/bots";
import { getPaymentCredentials } from "@/app/actions/payments";
import { Link2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Integrações - Isy Flow",
};

export default async function IntegracoesPage() {
    const [bots, credentials] = await Promise.all([
        getBots(),
        getPaymentCredentials(),
    ]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Page Header */}
            <div className="px-6 md:px-10 pt-10 pb-6 bg-white">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-600/10 flex items-center justify-center text-orange-600">
                            <Link2 size={18} />
                        </div>
                        <span className="text-orange-600 font-bold text-[10px] uppercase tracking-wider">Configurações de Conexão</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#2d3339]">Central de Integrações</h1>
                    <p className="text-sm text-[#555d66] font-medium max-w-xl">
                        Conecte seu robô às melhores ferramentas de marketing e gateways de pagamento.
                    </p>
                </div>
            </div>

            {/* Content with Tabs */}
            <IntegrationContent bots={bots} credentials={credentials} />
        </div>
    );
}
