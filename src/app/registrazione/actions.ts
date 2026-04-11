'use server';

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function generateSecurePassword(storeName: string): string {
    // Genera un PIN univoco a 6 o 7 cifre (più rassicurante e rapido per l'utente, e sicuro matematicamente).
    const pin = Math.floor(100000 + Math.random() * 900000); // Ritorna un numero tra 100000 e 999999
    
    return pin.toString();
}

export async function processRegistrationFrontend(storeName: string, planName: string) {
    let genLimit = 0;
    let monthlyFee = 0.0;
    
    // Mappatura Piani Simulatori (da cambiare in futuro con Webhook di Stripe)
    if (planName === 'starter') {
        genLimit = 150;
        monthlyFee = 29.90;
    } else if (planName === 'retail') {
        genLimit = 500;
        monthlyFee = 69.90;
    } else if (planName === 'retail_annual') {
        genLimit = 1500;
        monthlyFee = 149.90;
    }

    // Crea un nuovo cliente nel Database usando il modello User
    const password = generateSecurePassword(storeName);

    const newUser = await prisma.user.create({
        data: {
            email: storeName, // Salviamo in email il valore inserito
            role: "client",
            bot_pin: password, // Il password qua lo usiamo cone bot_pin simulato
            images_allowance: genLimit,
            subscription_active: true
        }
    });

    // Passiamo la password generata alla pagina di Benvenuto
    // Usiamo redirect verso la pagina congratulazioni appendendo i param in base64 per maggior "sicurezza visiva" ed evitare URL bruttissimi
    const welcomeData = Buffer.from(JSON.stringify({ name: storeName, psw: password, plan: planName })).toString('base64');

    redirect(`/benvenuto?d=${welcomeData}`);
}
