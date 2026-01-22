import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import PressellBuilderClient from "@/components/marketing/builder/PressellBuilderClient";

export default async function BuilderPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    const pressell = await prisma.pressell.findUnique({
        where: { id, userId: session.user.id },
        include: { bot: true }
    });

    if (!pressell) return notFound();

    return (
        <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden h-screen bg-[#f8fafc]">
            <PressellBuilderClient pressell={JSON.parse(JSON.stringify(pressell))} />
        </div>
    );
}
