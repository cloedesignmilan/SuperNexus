"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface TopupCheckoutProps {
    pin: string;
    packageId: string;
    onSuccess: () => void;
}

export default function TopupCheckout({ pin, packageId, onSuccess }: TopupCheckoutProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'test_client_id_placeholder' 
        ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID 
        : "test"; 

    const createOrder = async () => {
        try {
            const response = await fetch("/api/paypal/create-topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin, packageId }),
            });
            const orderData = await response.json();
            if (orderData.id) {
                return orderData.id;
            } else {
                throw new Error("Impossibile creare ordine: " + (orderData.error || ""));
            }
        } catch (err) {
            console.error(err);
            setError("Errore Backend: Controlla la connessione o l'ambiente PayPal.");
            return null;
        }
    };

    const onApprove = async (data: any, actions: any) => {
        setIsPending(true);
        try {
            const response = await fetch("/api/paypal/capture-topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID, pin, packageId }),
            });

            const orderData = await response.json();

            if (orderData.status === "COMPLETED" || orderData.id) {
                onSuccess(); // Trasmette la vittoria alla pagina
            } else {
                setError("Pagamento non completato (Status: " + orderData.status + ")");
                setIsPending(false);
            }
        } catch (err) {
            console.error(err);
            setError("Errore durante la finalizzazione della ricarica.");
            setIsPending(false);
        }
    };

    if (error) {
        return <div style={{ color: "var(--red-500)", padding: "12px", background: "rgba(255,0,0,0.1)", borderRadius: "8px", marginTop: "10px", fontSize: "0.9rem" }}>{error}</div>;
    }

    if (isPending) {
        return <div style={{ padding: "20px", color: "var(--cyan-500)", fontWeight: "bold", textAlign: "center" }}>⚡ Erogazione Crediti in Corso... Attendi...</div>;
    }

    return (
        <div style={{ marginTop: "20px" }}>
            <PayPalScriptProvider options={{ "clientId": clientId, currency: "EUR" }}>
                <PayPalButtons 
                    createOrder={createOrder} 
                    onApprove={onApprove} 
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                />
            </PayPalScriptProvider>
        </div>
    );
}
