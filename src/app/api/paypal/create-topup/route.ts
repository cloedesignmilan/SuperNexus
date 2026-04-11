import { NextResponse } from 'next/server';

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
    if (data.error) {
        throw new Error(`Auth Failed in env [${process.env.PAYPAL_ENVIRONMENT || 'sandbox'}]: ${data.error_description || data.error}`);
    }
    return data.access_token;
}

export async function POST(req: Request) {
    try {
        const { pin, packageId } = await req.json();

        if (!pin) {
            return NextResponse.json({ error: "No PIN provided" }, { status: 400 });
        }

        let value = "9.90"; // default 150 pics
        if (packageId === "topup_500") value = "19.90";

        const accessToken = await generateAccessToken();

        // MOCK MODE if not configured
        if (accessToken === "mock_access_token") {
            const mockOrderId = "MOCK_TOPUP_" + Math.floor(Math.random() * 1000000);
            return NextResponse.json({ id: mockOrderId });
        }

        const url = `${base}/v2/checkout/orders`;
        const payload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "EUR",
                        value: value,
                    },
                    description: `SuperNexus Extra Credits (${packageId})`
                },
            ],
        };

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        
        if (!data.id) {
            console.error("PAYPAL_API_ERROR_NO_ID:", data);
            return NextResponse.json({ id: null, details: data, error: "Connessione API Rifiutata: " + JSON.stringify(data.error) }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to create top-up order:", error);
        return NextResponse.json({ error: "Failed to create topup order." }, { status: 500 });
    }
}
