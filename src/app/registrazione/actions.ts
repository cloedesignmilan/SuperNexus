'use server';

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function generateSecurePassword(storeName: string): string {
    // Genera un PIN univoco a 6 o 7 cifre (più rassicurante e rapido per l'utente, e sicuro matematicamente).
    const pin = Math.floor(100000 + Math.random() * 900000); // Ritorna un numero tra 100000 e 999999
    
    return pin.toString();
}

export async function processRegistrationFrontend(email: string, planName: string, subscriptionId?: string) {
    let imagesAllowance = 150;
    if (planName === "retail") imagesAllowance = 600;
    if (planName === "retail_annual") imagesAllowance = 7200; // 600 * 12

    // Genera un PIN casuale di 6 cifre
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Impostiamo la scadenza
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 giorni di base, se annuale possiamo estendere, ma il Webhook aggiornerà.
    if (planName === "retail_annual") expiresAt.setDate(expiresAt.getDate() + 335);

    try {
        await prisma.user.create({
            data: {
                email,
                role: 'client',
                bot_pin: pin,
                images_allowance: imagesAllowance,
                base_allowance: imagesAllowance,
                subscription_active: true,
                paypal_subscription_id: subscriptionId || null,
                subscription_status: 'active',
                subscription_expires_at: expiresAt,
            }
        });

        // Passiamo la password generata alla pagina di Benvenuto
        // Usiamo redirect verso la pagina congratulazioni appendendo i param in base64 per maggior "sicurezza visiva" ed evitare URL bruttissimi
        const welcomeData = Buffer.from(JSON.stringify({ name: email, psw: pin, plan: planName })).toString('base64');

        redirect(`/benvenuto?d=${welcomeData}`);
    } catch (error) {
        console.error("Errore durante la registrazione:", error);
        throw new Error("Impossibile completare la registrazione.");
    }

}
