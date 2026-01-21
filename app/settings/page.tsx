import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Configurações - Isy Flow',
};

export default function SettingsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Configurações da Conta</h1>
                <p className="text-gray-500">Gerencie suas preferências e segurança.</p>
            </div>

            <div className="space-y-6">
                <ChangePasswordForm />
            </div>
        </div>
    );
}
