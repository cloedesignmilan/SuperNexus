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
        const { orderID, email, planName } = await req.json();

        if (!orderID) {
            return NextResponse.json({ error: "No order ID provided." }, { status: 400 });
        }

        const accessToken = await generateAccessToken();

        if (accessToken === "mock_access_token") {
            // Se siamo in locale col test account
            return NextResponse.json({ success: true, status: "COMPLETED" });
        }

        // Recuperiamo i dettagli dell'ordine da PayPal (non facciamo il capture perché il client l'ha già approvato, ma potremmo dover fare il capture)
        // Nota: se il client usa onApprove, in genere PayPal richiede di catturare l'ordine dal server, oppure il client lo ha già catturato.
        // Assumiamo che il bottone client lo abbia solo approvato, quindi lo catturiamo.
        const url = `${base}/v2/checkout/orders/${orderID}/capture`;
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
        });

        const data = await response.json();

        if (data.status === "COMPLETED") {
             return NextResponse.json({ success: true, status: data.status });
        } else {
             // Potrebbe essere già stato catturato (es: retry)
             const checkUrl = `${base}/v2/checkout/orders/${orderID}`;
             const checkResp = await fetch(checkUrl, {
                 headers: { Authorization: `Bearer ${accessToken}` }, method: "GET"
             });
             const checkData = await checkResp.json();
             
             if (checkData.status === "COMPLETED") {
                 return NextResponse.json({ success: true, status: checkData.status });
             }

             console.error("PAYPAL_ORDER_NOT_COMPLETED:", data);
             return NextResponse.json({ success: false, status: data.status, details: data }, { status: 400 });
        }

    } catch (error) {
        console.error("Failed to verify/capture order:", error);
        return NextResponse.json({ error: "Failed to verify order." }, { status: 500 });
    }
}
