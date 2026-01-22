import { Navigation } from "@/components/Navigation";
import { auth } from "@/auth";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    return (
        <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
            <Navigation user={session?.user} />
            <main className="flex-1 flex flex-col overflow-auto">
                {children}
            </main>
        </div>
    );
}
