'use server';

import { prisma } from "@/lib/prisma";
import { PRICING_CONFIG } from "@/lib/pricingConfig";

async function notifyAdmin(email: string, plan: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    
    if (!token || !chatId) return;

    const message = `💰 <b>Nuovo Acquisto Web!</b>\n\n👤 Email: ${email}\n📦 Piano: ${plan}\n📅 Data: ${new Date().toLocaleString('it-IT')}`;
    
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (e) {
        console.error("Failed to notify admin via Telegram:", e);
    }
}

export async function applyPlanToExistingUser(email: string, planName: string, subscriptionId?: string) {
    let imagesToAdd = 0;
    
    if (planName === "starter_pack") imagesToAdd = PRICING_CONFIG.starter_pack.images;
    if (planName === "retail_pack") imagesToAdd = PRICING_CONFIG.retail_pack.images;
    if (planName === "retail_monthly") imagesToAdd = PRICING_CONFIG.retail_monthly.images;

    const isSubscription = planName === "retail_monthly";

    try {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
            throw new Error("Utente non trovato nel database.");
        }

        const expiresAt = new Date();
        if (isSubscription) {
            expiresAt.setDate(expiresAt.getDate() + 30); 
        } else {
            // Se aveva una scadenza vecchia o nulla, metti 10 anni
            if (!dbUser.subscription_expires_at || dbUser.subscription_expires_at < expiresAt) {
                expiresAt.setFullYear(expiresAt.getFullYear() + 10); 
            } else {
                expiresAt.setTime(dbUser.subscription_expires_at.getTime());
            }
        }

        await prisma.user.update({
            where: { email },
            data: {
                images_allowance: dbUser.images_allowance + imagesToAdd,
                base_allowance: dbUser.base_allowance + imagesToAdd,
                subscription_active: true,
                paypal_subscription_id: subscriptionId || dbUser.paypal_subscription_id,
                subscription_status: isSubscription ? 'active' : 'one_time_pack',
                subscription_expires_at: expiresAt,
            }
        });

        await notifyAdmin(email, planName);

        return { success: true };
    } catch (error) {
        console.error("Errore durante l'aggiornamento del piano:", error);
        return { error: "Impossibile aggiornare l'account." };
    }
}
