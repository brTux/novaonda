'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
        await prisma.bot.create({
            data: {
                token,
                name: first_name,
                username: username,
                userId: session.user.id,
                status: "ACTIVE", // Default to active for now
            },
        });

        revalidatePath("/bots");
        return { success: true, message: `Bot @${username} conectado com sucesso!` };

    } catch (error: any) {
        if (error.code === 'P2002') {
            return { message: "Este bot já está conectado a uma conta.", errors: { token: ["Token já em uso."] } };
        }
        console.error("Erro ao adicionar bot:", error);
        return { message: "Erro interno ao conectar bot.", errors: {} };
    }
}

export async function getBots() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.bot.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });
}

export async function deleteBot(botId: string) {
    const session = await auth();
    if (!session?.user?.id) return { message: "Unauthorized" };

    try {
        await prisma.bot.delete({
            where: {
                id: botId,
                userId: session.user.id // Security check
            }
        });
        revalidatePath("/bots");
        return { success: true };
    } catch (error) {
        return { message: "Error deleting bot" };
    }
}
