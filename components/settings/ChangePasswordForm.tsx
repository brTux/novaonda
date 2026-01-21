'use client';

import { useActionState } from 'react';
import { updatePassword } from '@/app/actions/settings';
import { KeyRound } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff5100] hover:bg-[#e64900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5100] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? 'Atualizando...' : 'Atualizar Senha'}
        </button>
    );
}

const initialState: { message: string; errors?: any; success?: boolean } = {
    message: '',
    errors: {},
    success: undefined
};

export function ChangePasswordForm() {
    const [state, dispatch] = useActionState(updatePassword, initialState);

    return (
        <div className="bg-white shadow rounded-lg p-6 border border-slate-100 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg">
                    <KeyRound className="w-6 h-6 text-[#ff5100]" />
                </div>
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Alterar Senha</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Atualize sua senha de acesso ao painel.
                    </p>
                </div>
            </div>

            <form action={dispatch} className="space-y-6">
                <div className="grid gap-6">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            Senha Atual
                        </label>
                        <div className="mt-1">
                            <input
                                type="password"
                                name="currentPassword"
                                id="currentPassword"
                                required
                                className="shadow-sm focus:ring-[#ff5100] focus:border-[#ff5100] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                        {state?.errors?.currentPassword && (
                            <p className="mt-2 text-sm text-red-600">{state.errors.currentPassword}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                Nova Senha
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    name="newPassword"
                                    id="newPassword"
                                    minLength={6}
                                    required
                                    className="shadow-sm focus:ring-[#ff5100] focus:border-[#ff5100] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmar Nova Senha
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    minLength={6}
                                    required
                                    className="shadow-sm focus:ring-[#ff5100] focus:border-[#ff5100] block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                            {state?.errors?.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">{state.errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                </div>

                {state?.message && (
                    <div className={`p-4 rounded-md ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {state.message}
                    </div>
                )}

                <div className="flex justify-end">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
