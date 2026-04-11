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
        const { subscriptionID, email, planName } = await req.json();

        if (!subscriptionID) {
            return NextResponse.json({ error: "No subscription ID provided." }, { status: 400 });
        }

        const accessToken = await generateAccessToken();

        if (accessToken === "mock_access_token") {
            return NextResponse.json({ success: true, status: "MOCK_ACTIVE" });
        }

        // Recuperiamo i dettagli della subscription da PayPal
        const url = `${base}/v1/billing/subscriptions/${subscriptionID}`;
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            method: "GET",
        });

        const data = await response.json();

        if (data.status === "ACTIVE" || data.status === "APPROVAL_PENDING") {
             // APPROVAL_PENDING si trasforma in ACTIVE in pochi istanti. ACTIVE è lo stato ideale.
             return NextResponse.json({ success: true, status: data.status });
        } else {
             console.error("PAYPAL_SUBSCRIPTION_NOT_ACTIVE:", data);
             return NextResponse.json({ success: false, status: data.status, details: data }, { status: 400 });
        }

    } catch (error) {
        console.error("Failed to verify subscription:", error);
        return NextResponse.json({ error: "Failed to verify subscription." }, { status: 500 });
    }
}
