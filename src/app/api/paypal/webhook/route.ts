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
                // Troviamo l'utente
                const user = await prisma.user.findUnique({
                    where: { paypal_subscription_id: subscriptionId }
                });

                if (user) {
                    // Calcolo riporto crediti: i crediti extra (top-up) non usati si conservano,
                    // quelli del piano base si azzerano.
                    const leftover = user.images_allowance - user.images_generated;
                    const extraRemaining = Math.max(0, leftover - user.base_allowance);
                    const newAllowance = user.base_allowance + extraRemaining;

                    const newExpires = new Date();
                    newExpires.setDate(newExpires.getDate() + 30);
                    
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            subscription_status: 'active',
                            subscription_expires_at: newExpires,
                            images_allowance: newAllowance,
                            images_generated: 0
                        }
                    });
                    console.log(`[PayPal Webhook] Abbonamento ${subscriptionId} rinnovato. Crediti Ricalibrati a ${newAllowance}`);
                }
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
