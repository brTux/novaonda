'use client';

import { useFormStatus } from 'react-dom';
import { Sparkles, Terminal } from 'lucide-react';

export function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff5100] hover:bg-[#e64900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5100] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? 'Processando...' : children}
        </button>
    );
}

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
    return (
        <div className="min-h-screen bg-[#f7f8f9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                        <Terminal className="h-8 w-8 text-[#ff5100]" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2d3339]">
                    {title}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {subtitle}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
