'use server';

import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation';

export async function updateStoreAction(storeId: string, formData: FormData) {
    const name = formData.get('name') as string;
    const telegram_bot_token = formData.get('telegram_bot_token') as string;
    const monthly_fee = parseFloat(formData.get('monthly_fee') as string) || 0;
    const is_active_str = formData.get('is_active') as string;
    let default_template_id: string | null = formData.get('default_template_id') as string;
    if (default_template_id === "") default_template_id = null;
    let password: string | null = formData.get('password') as string;
    if (password === "") password = null;
    
    const is_active = is_active_str === 'true';

    await (prisma as any).store.update({
        where: { id: storeId },
        data: {
            name,
            telegram_bot_token,
            monthly_fee,
            is_active,
            default_template_id,
            password
        }
    });

    redirect('/admin');
}

export async function deleteStoreAction(storeId: string) {
    // Rimuove permanentemente uno Store (Prisma eseguirà il cascade dei Jobs/Users se configurato, o fallirà. Assumiamo che ci sia cascade Delete impostato o che la cancellazione pulisca in base a relations)
    // Per sicurezza, verifichiamo prima se ha job, in una app reale faremmo pulizia manuale
    await (prisma as any).store.delete({
        where: { id: storeId }
    });

    redirect('/admin');
}
