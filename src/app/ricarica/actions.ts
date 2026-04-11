'use server';

import { prisma } from "@/lib/prisma";

export async function verifyPinForTopup(pin: string) {
    if (!pin || pin.trim() === '') {
        return { error: "PIN non valido." };
    }

    const user = await prisma.user.findUnique({
        where: { bot_pin: pin.trim() }
    });

    if (!user) {
        return { error: "PIN inesistente. Assicurati che sia quello generato alla prima registrazione." };
    }

    if (user.subscription_status !== 'active' || user.subscription_active === false) {
        return { error: "Impossibile ricaricare: il tuo abbonamento risulta SCADUTO o NON ATTIVO. Rinnova prima l'abbonamento mensile." };
    }

    const remaining = user.images_allowance - user.images_generated;

    return { 
        success: true, 
        user: { 
            email: user.email, 
            remaining: remaining > 0 ? remaining : 0,
            allowance: user.images_allowance,
            generated: user.images_generated
        } 
    };
}
