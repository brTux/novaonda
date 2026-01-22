"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createPressell(data: {
    slug: string;
    title: string;
    vslUrl: string;
    buttonText: string;
    botId: string;
    pixelId?: string;
    safeUrl?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const pressell = await prisma.pressell.create({
        data: {
            ...data,
            userId: session.user.id,
            config: [] // Initial empty config
        }
    });

    revalidatePath("/ferramentas/pressel");
    return { success: true, pressell };
}

export async function updatePressell(id: string, data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.pressell.update({
        where: { id, userId: session.user.id },
        data
    });

    revalidatePath("/ferramentas/pressel");
    revalidatePath(`/ferramentas/pressel/${id}/builder`);
    return { success: true };
}

export async function deletePressell(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.pressell.delete({
        where: { id, userId: session.user.id }
    });

    revalidatePath("/ferramentas/pressel");
    return { success: true };
}
