"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getTags() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userId = session.user.id;

    const tags = await prisma.tag.findMany({
        where: { userId },
        include: { bot: true },
        orderBy: { createdAt: "desc" }
    });

    // Calculate counts efficiently
    const tagsWithCounts = await Promise.all(tags.map(async (tag) => {
        const count = await prisma.conversation.count({
            where: {
                // If it's a bot specific tag, ideally check botId too, but conversation tags are just strings right now.
                // We'll trust the name + bot context.
                // Actually, if a tag is global, it counts everywhere. If bot-specific, it counts only for that bot?
                // For simplicity and "sync", let's count occurrences of the name in the scope of the user's bots.
                tags: { has: tag.name },
                bot: tag.botId ? { id: tag.botId } : { userId }
            }
        });
        return { ...tag, count };
    }));

    return tagsWithCounts;
}

export async function createTag(data: { name: string; color?: string; botId?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const tag = await prisma.tag.create({
            data: {
                name: data.name,
                color: data.color || "#ff5100",
                botId: data.botId === "global" ? null : data.botId,
                userId: session.user.id
            }
        });
        revalidatePath("/tags");
        revalidatePath("/chat"); // Revalidate chat to update suggestions
        return { success: true, tag };
    } catch (error: any) {
        console.error("Error creating tag:", error);
        return { success: false, error: "Erro ao criar tag. Verifique se já não existe." };
    }
}

export async function deleteTag(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.tag.delete({
        where: { id }
    });

    revalidatePath("/tags");
    return { success: true };
}
