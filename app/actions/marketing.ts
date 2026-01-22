"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBotMarketing(botId: string, data: { pixelId: string, capiToken: string, testEventCode?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Não autorizado" };
        }

        // Verify ownership
        const bot = await prisma.bot.findUnique({
            where: { id: botId, userId: session.user.id }
        });

        if (!bot) {
            return { success: false, message: "Bot não encontrado" };
        }

        await prisma.bot.update({
            where: { id: botId },
            data: {
                pixelId: data.pixelId || null,
                capiToken: data.capiToken || null,
                testEventCode: data.testEventCode || null,
            }
        });

        revalidatePath("/ferramentas/tracking");
        return { success: true };
    } catch (error) {
        console.error("[updateBotMarketing] Error:", error);
        return { success: false, message: "Erro ao atualizar" };
    }
}

export async function createPressell(data: {
    title: string;
    slug: string;
    vslUrl: string;
    buttonText: string;
    botId: string;
    pixelId?: string;
    safeUrl?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Não autorizado");
        }

        const pressell = await prisma.pressell.create({
            data: {
                ...data,
                userId: session.user.id,
                config: [] // Empty config initially
            }
        });

        revalidatePath("/ferramentas/pressel");
        return { success: true, pressell };
    } catch (error) {
        console.error("[createPressell] Error:", error);
        throw error;
    }
}

export async function updatePressell(id: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Não autorizado");
        }

        const pressell = await prisma.pressell.update({
            where: { id, userId: session.user.id },
            data
        });

        revalidatePath("/ferramentas/pressel");
        revalidatePath(`/ferramentas/pressel/${id}/builder`);
        return { success: true, pressell };
    } catch (error) {
        console.error("[updatePressell] Error:", error);
        throw error;
    }
}

export async function deletePressell(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Não autorizado");
        }

        await prisma.pressell.delete({
            where: { id, userId: session.user.id }
        });

        revalidatePath("/ferramentas/pressel");
        return { success: true };
    } catch (error) {
        console.error("[deletePressell] Error:", error);
        throw error;
    }
}
