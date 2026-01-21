import { Navigation } from "@/components/Navigation";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
            <Navigation />
            <main className="flex-1 flex flex-col pt-16 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
