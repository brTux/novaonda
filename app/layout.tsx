import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Isy Flow - Automação Telegram",
  description: "Plataforma avançada para automação de chatbots e gestão de vendas no Telegram.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light">
      <body className={`${inter.className} antialiased text-slate-900 bg-[#f8fafc]`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
