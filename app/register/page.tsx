'use client';

import { useActionState } from 'react';
import { registerUser } from '@/app/actions/register';
import { AuthLayout, SubmitButton } from '@/components/auth/AuthComponents';
import Link from 'next/link';

export default function RegisterPage() {
    const initialState = { message: '', errors: {} };
    const [state, dispatch] = useActionState(registerUser, initialState);

    return (
        <AuthLayout
            title="Crie sua conta"
            subtitle="Comece a automatizar suas vendas hoje"
        >
            <form action={dispatch} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome Completo
                    </label>
                    <div className="mt-1">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#ff5100] focus:border-[#ff5100] sm:text-sm"
                        />
                    </div>
                    {state?.errors?.name && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#ff5100] focus:border-[#ff5100] sm:text-sm"
                        />
                    </div>
                    {state?.errors?.email && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Senha
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#ff5100] focus:border-[#ff5100] sm:text-sm"
                        />
                    </div>
                    {state?.errors?.password && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.password}</p>
                    )}
                </div>

                {state?.message && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {state.message}
                    </div>
                )}

                <div>
                    <SubmitButton>Criar Conta</SubmitButton>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Já tem uma conta?
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <Link
                        href="/login"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5100]"
                    >
                        Fazer Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
