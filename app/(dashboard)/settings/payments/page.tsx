import { PaymentSettingsForm } from '@/components/settings/PaymentSettingsForm';
import { getPaymentCredentials } from '@/app/actions/payments';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pagamentos - Isy Flow',
};

export default async function PaymentSettingsPage() {
    const credentials = await getPaymentCredentials();

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Configurações de Pagamento</h1>
                <p className="text-gray-500">Configure seus gateways para receber via PIX nos robôs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Gateways Ativos</h2>
                    <PaymentSettingsForm initialCredentials={credentials} />
                </div>
                <div className="space-y-6">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Informações Úteis</h2>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-sm text-blue-700 space-y-3">
                        <p className="font-bold">Como funciona a integração?</p>
                        <p>Ao salvar seu token da PushinPay, os blocos de "Ação PIX" nos seus fluxos passarão a gerar cobranças reais automaticamente.</p>
                        <p>O robô enviará o código "Copia e Cola" e confirmará o pagamento assim que ele for detectado.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
