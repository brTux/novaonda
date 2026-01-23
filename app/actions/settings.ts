'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import * as schema from '@/db/schema';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Senha atual é obrigatória.' }),
    newPassword: z.string().min(6, { message: 'A nova senha deve ter pelo menos 6 caracteres.' }),
    confirmPassword: z.string().min(1, { message: 'Confirmação de senha obrigatória.' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
});

export async function updatePassword(prevState: any, formData: FormData) {
    const session = await auth();

    if (!session?.user?.email) {
        return { message: 'Não autorizado.' };
    }

    const validatedFields = ChangePasswordSchema.safeParse({
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos.',
        };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    const user = await db.query.users.findFirst({
        where: eq(schema.users.email, session.user.email),
    });

    if (!user || !user.password) {
        return { message: 'Usuário não encontrado.' };
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
        return {
            errors: { currentPassword: ['Senha atual incorreta.'] },
            message: 'Falha ao atualizar senha.',
        };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(schema.users)
        .set({
            password: hashedPassword,
            updatedAt: new Date()
        })
        .where(eq(schema.users.email, session.user.email));

    revalidatePath('/settings');
    return { message: 'Senha atualizada com sucesso!', success: true };
}
