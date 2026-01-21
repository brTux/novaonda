import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova Onda - Automação Telegram",
  description: "Plataforma avançada para automação de chatbots e gestão de vendas no Telegram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light">
      <body className={`${inter.className} antialiased bg-[#f8fafc] text-slate-900 overflow-hidden`}>
        <div className="h-screen flex flex-col">
          <Navigation />
          <main className="flex-1 flex flex-col pt-16 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
