import { Navigation } from "@/components/Navigation";
import { auth } from "@/auth";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc]">
            <Navigation user={session?.user} />
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}
