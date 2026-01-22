"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function savePaymentCredential(provider: "PUSHINPAY" | "ASAAS" | "MERCADOPAGO", token: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.paymentCredential.upsert({
        where: {
            userId_provider: {
                userId: session.user.id,
                provider
            }
        },
        update: {
            token,
            isActive: true
        },
        create: {
            userId: session.user.id,
            provider,
            token,
            isActive: true
        }
    });

    revalidatePath("/(dashboard)/settings/payments");
    return { success: true };
}

export async function getPaymentCredentials() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.paymentCredential.findMany({
        where: { userId: session.user.id }
    });
}
