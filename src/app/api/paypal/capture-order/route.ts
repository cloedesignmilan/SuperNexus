import { NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'test';
// Usa "live" quando vuoi farti pagare per davvero, usa sandbox o omettilo mentre testi coi soldi finti
const base = process.env.PAYPAL_ENVIRONMENT === "live" 
    ? "https://api-m.paypal.com" 
    : "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
    try {
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
        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const { orderID } = await req.json();

        const accessToken = await generateAccessToken();

        // MOCK MODE
        if (accessToken === "mock_access_token") {
            return NextResponse.json({ id: orderID, status: "COMPLETED" });
        }

        const url = `${base}/v2/checkout/orders/${orderID}/capture`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to capture order:", error);
        return NextResponse.json({ error: "Failed to capture order." }, { status: 500 });
    }
}
