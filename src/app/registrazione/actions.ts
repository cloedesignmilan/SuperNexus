'use server';

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function generateSecurePassword(storeName: string): string {
    // Generiamo una password del tipo: Armani-9482
    // Rimuoviamo gli spazi e teniamo le prime 6 lettere in UpperCamelCase
    const cleanName = storeName.replace(/[^a-zA-Z]/g, '').slice(0, 6);
    const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
    
    // Genera 4 numeri casuali
    const randomNums = Math.floor(1000 + Math.random() * 9000);
    
    // Se il nome era vuoto o strano, mettiamo Store di default
    const prefix = capitalizedName || "Boutique";
    
    return `${prefix}-${randomNums}`;
}

export async function processRegistration(formData: FormData) {
    const storeName = formData.get('storeName') as string;
    const planName = formData.get('planName') as string;
    
    let genLimit = 0;
    let monthlyFee = 0.0;
    
    // Mappatura Piani Simulatori (da cambiare in futuro con Webhook di Stripe)
    if (planName === 'starter') {
        genLimit = 150;
        monthlyFee = 29.90;
    } else if (planName === 'pro') {
        genLimit = 500;
        monthlyFee = 69.90;
    } else if (planName === 'enterprise') {
        genLimit = 1500;
        monthlyFee = 149.90;
    }

    // Crea un nuovo cliente nel Database
    const password = generateSecurePassword(storeName);

    const newStore = await (prisma as any).store.create({
        data: {
            name: storeName,
            password: password,
            plan_name: planName.toUpperCase(),
            monthly_fee: monthlyFee,
            generation_limit: genLimit,
            subscription_credits: genLimit, // Prima carica inclusa istantanea
            supplementary_credits: 0,
            is_active: true
        }
    });

    // Passiamo la password generata alla pagina di Benvenuto
    // Usiamo redirect verso la pagina congratulazioni appendendo i param in base64 per maggior "sicurezza visiva" ed evitare URL bruttissimi
    const welcomeData = Buffer.from(JSON.stringify({ name: storeName, psw: password, plan: planName })).toString('base64');

    redirect(`/benvenuto?d=${welcomeData}`);
}
