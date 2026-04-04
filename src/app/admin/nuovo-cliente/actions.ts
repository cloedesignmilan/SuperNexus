'use server';

import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function createStoreAction(formData: FormData) {
    const name = formData.get('name') as string;
    const telegram_bot_token = formData.get('telegram_bot_token') as string;
    const monthly_fee = parseFloat(formData.get('monthly_fee') as string);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const store = await prisma.store.create({
        data: {
            name,
            slug: slug + '-' + Date.now().toString().slice(-4),
            telegram_bot_token: telegram_bot_token || null,
            monthly_fee: monthly_fee || 0,
            is_active: true
        }
    });

    // Bonus: Configura automaticamente il nuovo Bot Telegram
    if (telegram_bot_token) {
        try {
            const headersList = await headers();
            const host = headersList.get('host');
            const protocol = host?.includes('localhost') ? 'http' : 'https';
            
            const webhookUrl = `${protocol}://${host}/api/telegram/webhook?storeSlug=${store.slug}`;
            console.log(`Setting Webhook for store ${store.name}: ${webhookUrl}`);
            
            await fetch(`https://api.telegram.org/bot${telegram_bot_token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
        } catch (e) {
            console.error("Errore nell'impostazione del Webhook: ", e);
        }
    }

    redirect('/admin');
}
