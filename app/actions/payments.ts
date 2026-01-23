"use server";

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function savePaymentCredential(provider: "PUSHINPAY" | "ASAAS" | "MERCADOPAGO", token: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.insert(schema.paymentCredentials)
        .values({
            userId: session.user.id,
            provider,
            token,
            isActive: true,
        })
        .onConflictDoUpdate({
            target: [schema.paymentCredentials.userId, schema.paymentCredentials.provider],
            set: {
                token,
                isActive: true,
                updatedAt: new Date(),
            }
        });

    revalidatePath("/(dashboard)/settings/payments");
    revalidatePath("/integracoes");
    return { success: true };
}

export async function getPaymentCredentials() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await db.query.paymentCredentials.findMany({
        where: eq(schema.paymentCredentials.userId, session.user.id)
    });
}
