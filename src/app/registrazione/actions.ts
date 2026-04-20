'use server';

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PRICING_CONFIG } from "@/lib/pricingConfig";

async function notifyAdmin(email: string, plan: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    
    if (!token || !chatId) return;

    const message = `🚀 <b>Nuovo Cliente!</b>\n\n👤 Email: ${email}\n📦 Piano: ${plan}\n📅 Data: ${new Date().toLocaleString('it-IT')}`;
    
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

export async function processRegistrationFrontend(email: string, planName: string, subscriptionId?: string) {
    let imagesAllowance = 0;
    
    // Assegna il numero di immagini in base al nuovo nome del piano
    if (planName === "starter_pack") imagesAllowance = PRICING_CONFIG.starter_pack.images;
    if (planName === "retail_pack") imagesAllowance = PRICING_CONFIG.retail_pack.images;
    if (planName === "retail_monthly") imagesAllowance = PRICING_CONFIG.retail_monthly.images;

    // Genera un PIN casuale di 6 cifre
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Impostiamo la scadenza
    // I Pack (starter_pack, retail_pack) NON hanno una scadenza reale, mettiamo 10 anni.
    // L'abbonamento (retail_monthly) scade tra 30 giorni (verrà poi aggiornato dai webhooks di PayPal).
    const expiresAt = new Date();
    if (planName === "retail_monthly") {
        expiresAt.setDate(expiresAt.getDate() + 30); 
    } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 10); // Packs non scadono (10 anni)
    }

    // Se è un pack, non considerarlo come un abbonamento attivo nel senso classico (se il db richiede boolean)
    // Manteniamo subscription_active a true per permettere l'accesso al bot
    const isSubscription = planName === "retail_monthly";

    try {
        await prisma.user.create({
            data: {
                email,
                role: 'client',
                bot_pin: pin,
                images_allowance: imagesAllowance,
                base_allowance: imagesAllowance,
                subscription_active: true, // true per poterlo far accedere
                paypal_subscription_id: subscriptionId || null, // Per i pack, questo conterrà l'OrderID
                subscription_status: isSubscription ? 'active' : 'one_time_pack',
                subscription_expires_at: expiresAt,
            }
        });

        // Notify Admin
        await notifyAdmin(email, planName);

        // Passiamo la password generata alla pagina di Benvenuto
        const welcomeData = Buffer.from(JSON.stringify({ name: email, psw: pin, plan: planName })).toString('base64');

        redirect(`/benvenuto?d=${welcomeData}`);
    } catch (error) {
        console.error("Errore durante la registrazione:", error);
        throw new Error("Impossibile completare la registrazione.");
    }
}

export async function createFreeTrial(email: string) {
    const existingEmail = await prisma.user.findUnique({
        where: { email }
    });

    if (existingEmail) {
        return { error: "This email is already registered." };
    }

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PRICING_CONFIG.free_trial.days); // scadenza configurata

    try {
        await prisma.user.create({
            data: {
                email,
                role: 'client',
                bot_pin: pin,
                images_allowance: PRICING_CONFIG.free_trial.images,
                base_allowance: PRICING_CONFIG.free_trial.images,
                subscription_active: true,
                paypal_subscription_id: 'free_trial_' + Date.now().toString(),
                subscription_status: 'active',
                subscription_expires_at: expiresAt,
            }
        });

        // Notify Admin
        await notifyAdmin(email, 'free_trial');

        const welcomeData = Buffer.from(JSON.stringify({ name: email, psw: pin, plan: 'free_trial' })).toString('base64');
        return { success: true, redirectUrl: `/benvenuto?d=${welcomeData}` };
    } catch (error) {
        console.error("Errore durante free trial:", error);
        return { error: "Failed to create free trial account." };
    }
}
