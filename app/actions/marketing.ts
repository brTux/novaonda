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
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const pressell = await prisma.pressell.create({
        data: {
            ...data,
            userId: session.user.id,
        }
    });

    revalidatePath("/ferramentas/pressell");
    return { success: true, pressell };
}

export async function deletePressell(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.pressell.delete({
        where: { id, userId: session.user.id }
    });

    revalidatePath("/ferramentas/pressell");
    return { success: true };
}
