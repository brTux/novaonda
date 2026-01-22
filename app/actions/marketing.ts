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
