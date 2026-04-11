import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'test';
const base = process.env.PAYPAL_ENVIRONMENT === "live" 
    ? "https://api-m.paypal.com" 
    : "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || PAYPAL_CLIENT_ID === 'test_client_id_placeholder') {
        return "mock_access_token";
    }
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_SECRET).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error_description || data.error);
    return data.access_token;
}

export async function POST(req: Request) {
    try {
        const { orderID, pin, packageId } = await req.json();

        if (!orderID || !pin) {
            return NextResponse.json({ error: "ID Ordine o PIN mancante" }, { status: 400 });
        }

        // Determina quanti crediti attribuire
        let creditsToAdd = 100;
        if (packageId === "topup_500") creditsToAdd = 300;

        const accessToken = await generateAccessToken();

        let data = { status: "COMPLETED" };

        if (accessToken !== "mock_access_token") {
            const url = `${base}/v2/checkout/orders/${orderID}/capture`;
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                method: "POST",
            });

            data = await response.json();
            
            if (data.status !== "COMPLETED") {
                console.error("CAPTURE FAILED:", data);
                return NextResponse.json({ error: "Pagamento Fallito", status: data.status }, { status: 400 });
            }
        }

        // Pagamento catturato con successo, aggiungiamo i crediti nel DB
        const user = await prisma.user.findUnique({ where: { bot_pin: pin } });
        
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    images_allowance: { increment: creditsToAdd }
                }
            });
            console.log(`[TOP-UP] Aggiunti ${creditsToAdd} crediti all'utente ${pin}.`);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to capture top-up order:", error);
        return NextResponse.json({ error: "Failed to capture top-up order." }, { status: 500 });
    }
}
