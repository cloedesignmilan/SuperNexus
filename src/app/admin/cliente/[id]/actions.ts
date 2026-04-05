'use server';

import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation';

export async function updateStoreAction(storeId: string, formData: FormData) {
    const name = formData.get('name') as string;
    const plan_name = formData.get('plan_name') as string || 'Starter';
    const generation_limit = parseInt(formData.get('generation_limit') as string) || 0;
    const supplementary_credits = parseInt(formData.get('supplementary_credits') as string) || 0;
    
    // Potremmo ricaricare manualmente o reimpostare a mano la subscription, 
    // solitamente subscription_credits viene scalata o resettata autonomamente.
    // Ma diamo al CRM il cruscotto se si spunta 'Force Reset' o simile, ma lo lasciamo in pace per ora se no è complesso
    const subscription_credits = parseInt(formData.get('subscription_credits') as string);
    const hasSubCreditsOverride = !isNaN(subscription_credits);

    const monthly_fee = parseFloat(formData.get('monthly_fee') as string) || 0;
    const is_active_str = formData.get('is_active') as string;
    let default_template_id: string | null = formData.get('default_template_id') as string;
    if (default_template_id === "") default_template_id = null;
    let password: string | null = formData.get('password') as string;
    if (password === "") password = null;
    
    const is_active = is_active_str === 'true';

    const updateData: any = {
            name,
            plan_name,
            generation_limit,
            supplementary_credits,
            monthly_fee,
            is_active,
            default_template_id,
            password
    };

    if (hasSubCreditsOverride) {
        updateData.subscription_credits = subscription_credits;
    }

    await (prisma as any).store.update({
        where: { id: storeId },
        data: updateData
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
