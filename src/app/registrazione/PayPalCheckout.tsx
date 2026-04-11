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

    const getPlanId = () => {
        if (planName === "starter") return process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_STARTER;
        if (planName === "retail") return process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_RETAIL;
        if (planName === "retail_annual") return process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_RETAIL_ANNUAL;
        return process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_STARTER;
    };

    const createSubscription = async (data: any, actions: any) => {
        const planId = getPlanId();
        if (!planId || planId.includes("placeholder")) {
            setError("Errore di configurazione: Nessun Plan ID trovato per questo abbonamento.");
            return null;
        }
        
        return actions.subscription.create({
            plan_id: planId
        });
    };

    const onApprove = async (data: any, actions: any) => {
        setIsPending(true);
        try {
            // Inviamo il subscriptionID al nostro backend per registrarlo
            const response = await fetch("/api/paypal/save-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionID: data.subscriptionID, email, planName }),
            });

            const subData = await response.json();

            if (response.ok && subData.success) {
                // Pagamento ok! Creiamo l'utente sul DB!
                await processRegistrationFrontend(email, planName, data.subscriptionID);
            } else {
                setError("Errore attivazione abbonamento: " + (subData.error || "Sconosciuto"));
                setIsPending(false);
            }
        } catch (err) {
            console.error(err);
            setError("Errore durante la finalizzazione dell'abbonamento.");
            setIsPending(false);
        }
    };

    if (error) {
        return <div style={{ color: "var(--red-500)", padding: "10px", background: "rgba(255,0,0,0.1)", borderRadius: "8px" }}>{error}</div>;
    }

    if (isPending) {
        return <div style={{ padding: "20px", color: "var(--cyan-500)", fontWeight: "bold" }}>Elaborazione Abbonamento in Corso... Attivazione Profilo...</div>;
    }

    return (
        <PayPalScriptProvider options={{ "clientId": clientId, currency: "EUR", vault: true, intent: "subscription" }}>
            <PayPalButtons 
                createSubscription={createSubscription} 
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
