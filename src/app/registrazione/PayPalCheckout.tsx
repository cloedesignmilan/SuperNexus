"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { processRegistrationFrontend } from "./actions";

interface PayPalCheckoutProps {
    email: string;
    planName: string;
}

export default function PayPalCheckout({ email, planName }: PayPalCheckoutProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");

    // Utilizziamo un client id placeholder o reale dipendente da .env (pubblico)
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'test_client_id_placeholder' 
        ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID 
        : "test"; // 'test' abilita i bottoni in locale per design

    const createOrder = async () => {
        try {
            const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planName }),
            });
            const orderData = await response.json();
            if (orderData.id) {
                return orderData.id;
            } else {
                throw new Error("Unable to create order: " + (orderData.error || JSON.stringify(orderData)));
            }
        } catch (err) {
            console.error(err);
            setError("Errore Backend: " + err);
            return null;
        }
    };

    const onApprove = async (data: any, actions: any) => {
        setIsPending(true);
        try {
            const response = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID }),
            });

            const orderData = await response.json();

            if (orderData.status === "COMPLETED" || orderData.id) {
                // Pagamento ok! Creiamo l'utente!
                await processRegistrationFrontend(email, planName);
            } else {
                setError("Pagamento non completato (Status: " + orderData.status + ")");
                setIsPending(false);
            }
        } catch (err) {
            console.error(err);
            setError("Errore durante la finalizzazione del pagamento.");
            setIsPending(false);
        }
    };

    if (error) {
        return <div style={{ color: "var(--red-500)", padding: "10px", background: "rgba(255,0,0,0.1)", borderRadius: "8px" }}>{error}</div>;
    }

    if (isPending) {
        return <div style={{ padding: "20px", color: "var(--cyan-500)", fontWeight: "bold" }}>Elaborazione Pagamento in Corso... Creazione Profilo...</div>;
    }

    return (
        <PayPalScriptProvider options={{ "clientId": clientId, currency: "EUR" }}>
            <PayPalButtons 
                createOrder={createOrder} 
                onApprove={onApprove} 
                style={{ layout: "vertical", color: "gold", shape: "pill" }}
                disabled={!email || email.trim().length < 5}
            />
            {(!email || email.trim().length < 5) && (
                <p style={{ color: "#ff5e00", fontSize: "0.85rem", marginTop: "10px" }}>Inserisci un indirizzo Email valido in alto per sbloccare il bottone.</p>
            )}
        </PayPalScriptProvider>
    );
}
