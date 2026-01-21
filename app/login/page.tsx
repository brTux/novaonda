'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/actions/login';
import { AuthLayout, SubmitButton } from '@/components/auth/AuthComponents';
import Link from 'next/link';

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <AuthLayout
            title="Acesse sua conta"
            subtitle="Gerencie seus bots e automações"
        >
            <form action={dispatch} className="space-y-6">
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
                            autoComplete="current-password"
                            required
                            minLength={6}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#ff5100] focus:border-[#ff5100] sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-[#ff5100] focus:ring-[#ff5100] border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            Lembrar-me
                        </label>
                    </div>

                    <div className="text-sm">
                        <a href="#" className="font-medium text-[#ff5100] hover:text-[#e64900]">
                            Esqueceu a senha?
                        </a>
                    </div>
                </div>

                <div>
                    {errorMessage && (
                        <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100">
                            {errorMessage}
                        </div>
                    )}
                    <SubmitButton>Entrar</SubmitButton>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Novo por aqui?
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <Link
                        href="/register"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5100]"
                    >
                        Criar conta gratuita
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
