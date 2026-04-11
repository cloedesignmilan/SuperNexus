import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

// Funzione opzionale per verificare l'effettiva validità della firma.
// In produzione si usa la route /v1/notifications/verify-webhook-signature 
// per delegare il check a PayPal. Qui implementiamo un placeholder.
export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        const headersList = req.headers;
        
        // Dati ricevuti da PayPal in JSON
        const event = JSON.parse(bodyText);
        console.log(`[PayPal Webhook] Ricevuto evento: ${event.event_type}`);

        if (event.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.COMPLETED') {
            const subscriptionId = event.resource.billing_agreement_id;
            
            if (subscriptionId) {
                // Aggiorniamo di 30 giorni la scadenza (+1 mese)
                const newExpires = new Date();
                newExpires.setDate(newExpires.getDate() + 30);
                
                await prisma.user.updateMany({
                    where: { paypal_subscription_id: subscriptionId },
                    data: {
                        subscription_status: 'active',
                        subscription_expires_at: newExpires
                    }
                });
                console.log(`[PayPal Webhook] Abbonamento ${subscriptionId} rinnovato con successo nel database.`);
            }
        } 
        else if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' || event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED') {
            const subscriptionId = event.resource.id; // Nel caso di cancellazione l'id è nella radice resource
            if (subscriptionId) {
                await prisma.user.updateMany({
                    where: { paypal_subscription_id: subscriptionId },
                    data: {
                        subscription_status: 'cancelled'
                    }
                });
                console.log(`[PayPal Webhook] Abbonamento ${subscriptionId} cancellato.`);
            }
        }

        return new NextResponse("Webhook Gestito", { status: 200 });

    } catch (error) {
        console.error("Errore Webhook PayPal:", error);
        return new NextResponse("Errore Server", { status: 500 });
    }
}
