'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as schema from "@/db/schema";
import { eq, and, desc } from "drizzle-orm"; // Import desc

const AddBotSchema = z.object({
    token: z.string().min(10, "Token inválido"),
});

export async function addBot(prevState: any, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { message: "Não autorizado", errors: {} };
        }

        const token = formData.get("token") as string;
        const validatedFields = AddBotSchema.safeParse({ token });

        if (!validatedFields.success) {
            return {
                message: "Erro de validação",
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        // 1. Verify Token with Telegram API
        const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const data = await response.json();

        if (!data.ok) {
            return {
                message: "Token inválido ou bot não encontrado no Telegram.",
                errors: { token: ["Verifique o token e tente novamente."] },
            };
        }

        const { id, first_name, username } = data.result;

        // 2. Save to Database
        let bot;
        try {
            const result = await db.insert(schema.bots).values({
                token,
                name: first_name,
                username: username,
                userId: session.user.id,
                status: "ACTIVE",
            }).returning();
            bot = result[0];
        } catch (dbError: any) {
            // Check for unique constraint violation (Postgres error code 23505)
            if (dbError.code === '23505') {
                return { message: "Este bot já está conectado a uma conta.", errors: { token: ["Token já em uso."] } };
            }
            throw dbError;
        }

        // 3. Register Webhook
        const appUrl = process.env.AUTH_URL;
        if (appUrl) {
            const webhookUrl = `${appUrl}/api/webhooks/telegram/${bot.id}`;
            const webhookResponse = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
            const webhookData = await webhookResponse.json();

            if (!webhookData.ok) {
                console.error("Failed to set webhook:", webhookData);
            } else {
                console.log(`Webhook set to: ${webhookUrl}`);
            }
        } else {
            console.warn("AUTH_URL not set, skipping webhook registration. Please configure this in production.");
        }

        revalidatePath("/bots");
        return { success: true, message: `Bot @${username} conectado com sucesso!` };

    } catch (error: any) {
        console.error("Erro ao adicionar bot:", error);
        return { message: "Erro interno ao conectar bot.", errors: {} };
    }
}

export async function getBots() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.query.bots.findMany({
        where: eq(schema.bots.userId, session.user.id),
        orderBy: [desc(schema.bots.createdAt)],
    });
}

export async function deleteBot(botId: string) {
    const session = await auth();
    if (!session?.user?.id) return { message: "Unauthorized" };

    try {
        await db.delete(schema.bots)
            .where(and(
                eq(schema.bots.id, botId),
                eq(schema.bots.userId, session.user.id)
            ));

        revalidatePath("/bots");
        return { success: true };
    } catch (error) {
        return { message: "Error deleting bot" };
    }
}
