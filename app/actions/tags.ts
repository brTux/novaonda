"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import * as schema from "@/db/schema";
import { eq, desc, and, arrayContains, count } from "drizzle-orm";

export async function getTags() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userId = session.user.id;

    const tags = await db.query.tags.findMany({
        where: eq(schema.tags.userId, userId),
        with: { bot: true },
        orderBy: [desc(schema.tags.createdAt)]
    });

    // Calculate counts efficiently
    const tagsWithCounts = await Promise.all(tags.map(async (tag) => {
        // Count conversations that have this tag
        // If it's a bot specific tag, check botId too AND user ownership
        // If Global, check user ownership of bots

        let conditions = [
            arrayContains(schema.conversations.tags, [tag.name])
        ];

        // Filter conversations valid for this user context
        if (tag.botId) {
            conditions.push(eq(schema.conversations.botId, tag.botId));
        } else {
            // For global tags, we need to ensure we only count conversations from bots owned by this user
            // Subquery exists or join logic
            conditions.push(
                (conversations: any, { exists }: any) => exists(
                    db.select().from(schema.bots)
                        .where(and(
                            eq(schema.bots.id, schema.conversations.botId),
                            eq(schema.bots.userId, userId)
                        ))
                ) as any
            );
        }

        const result = await db.select({ value: count() })
            .from(schema.conversations)
            .where(and(...conditions));

        return { ...tag, count: result[0].value };
    }));

    return tagsWithCounts;
}

export async function createTag(data: { name: string; color?: string; botId?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const result = await db.insert(schema.tags).values({
            name: data.name,
            color: data.color || "#ff5100",
            botId: data.botId === "global" ? null : data.botId,
            userId: session.user.id
        }).returning();

        revalidatePath("/tags");
        revalidatePath("/chat");
        return { success: true, tag: result[0] };
    } catch (error: any) {
        // Unique constraint violation
        if (error.code === '23505') {
            return { success: false, error: "Erro ao criar tag. Verifique se já não existe." };
        }
        console.error("Error creating tag:", error);
        return { success: false, error: "Erro interno ao criar tag." };
    }
}

export async function deleteTag(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(schema.tags)
        .where(eq(schema.tags.id, id));

    revalidatePath("/tags");
    return { success: true };
}
