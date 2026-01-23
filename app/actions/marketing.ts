"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateBotMarketing(botId: string, data: { pixelId: string, capiToken: string, testEventCode?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Não autorizado" };
        }

        // Verify ownership
        const bot = await db.query.bots.findFirst({
            where: and(
                eq(schema.bots.id, botId),
                eq(schema.bots.userId, session.user.id)
            )
        });

        if (!bot) {
            return { success: false, message: "Bot não encontrado" };
        }

        await db.update(schema.bots)
            .set({
                pixelId: data.pixelId || null,
                capiToken: data.capiToken || null,
                testEventCode: data.testEventCode || null,
                updatedAt: new Date(),
            })
            .where(eq(schema.bots.id, botId));

        revalidatePath("/ferramentas/tracking");
        revalidatePath("/integracoes");
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

        const [pressell] = await db.insert(schema.pressells)
            .values({
                ...data,
                userId: session.user.id,
                config: [], // Empty config initially
            })
            .returning();

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

        const [pressell] = await db.update(schema.pressells)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(and(
                eq(schema.pressells.id, id),
                eq(schema.pressells.userId, session.user.id)
            ))
            .returning();

        if (!pressell) {
            throw new Error("Pressell não encontrada ou não pertence ao usuário");
        }

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

        await db.delete(schema.pressells)
            .where(and(
                eq(schema.pressells.id, id),
                eq(schema.pressells.userId, session.user.id)
            ));

        revalidatePath("/ferramentas/pressel");
        return { success: true };
    } catch (error) {
        console.error("[deletePressell] Error:", error);
        throw error;
    }
}
