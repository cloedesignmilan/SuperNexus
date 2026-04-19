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

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'test_client_id_placeholder' 
        ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID 
        : "test"; 

    const isSubscription = planName === 'retail_monthly';

    const getPlanId = () => {
        if (planName === "retail_monthly") return process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_RETAIL;
        return "";
    };

    const getPriceForPack = () => {
        if (planName === "starter_pack") return "29.00";
        if (planName === "retail_pack") return "69.00";
        return "29.00";
    };

    const createSubscription = async (data: any, actions: any) => {
        const planId = getPlanId();
        if (!planId || planId.includes("placeholder")) {
            setError("Errore di configurazione: Nessun Plan ID trovato per questo abbonamento.");
            return null;
        }
        return actions.subscription.create({ plan_id: planId });
    };

    const onApproveSubscription = async (data: any, actions: any) => {
        setIsPending(true);
        try {
            const response = await fetch("/api/paypal/save-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionID: data.subscriptionID, email, planName }),
            });
            const subData = await response.json();
            if (response.ok && subData.success) {
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

    const createOrder = (data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [{
                description: `SuperNexus ${planName}`,
                amount: {
                    currency_code: "USD",
                    value: getPriceForPack()
                }
            }]
        });
    };

    const onApproveOrder = async (data: any, actions: any) => {
        setIsPending(true);
        try {
            const response = await fetch("/api/paypal/save-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID, email, planName }),
            });
            const orderData = await response.json();
            if (response.ok && orderData.success) {
                await processRegistrationFrontend(email, planName, data.orderID);
            } else {
                setError("Errore completamento ordine: " + (orderData.error || "Sconosciuto"));
                setIsPending(false);
            }
        } catch (err) {
            console.error(err);
            setError("Errore durante la finalizzazione dell'ordine.");
            setIsPending(false);
        }
    };

    if (error) {
        return <div style={{ color: "var(--red-500)", padding: "10px", background: "rgba(255,0,0,0.1)", borderRadius: "8px" }}>{error}</div>;
    }

    if (isPending) {
        return <div style={{ padding: "20px", color: "var(--cyan-500)", fontWeight: "bold" }}>Elaborazione Pagamento in Corso... Attivazione Profilo...</div>;
    }

    const initialOptions = {
        clientId: clientId,
        currency: "USD",
        intent: isSubscription ? "subscription" : "capture",
        vault: isSubscription ? true : false,
    };

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

    return (
        <PayPalScriptProvider options={initialOptions} key={isSubscription ? "sub" : "cap"}>
            {isSubscription ? (
                <PayPalButtons 
                    createSubscription={createSubscription} 
                    onApprove={onApproveSubscription} 
                    style={{ layout: "vertical", color: "gold", shape: "pill" }}
                    disabled={!isEmailValid}
                />
            ) : (
                <PayPalButtons 
                    createOrder={createOrder} 
                    onApprove={onApproveOrder} 
                    style={{ layout: "vertical", color: "gold", shape: "pill" }}
                    disabled={!isEmailValid}
                />
            )}
            {!isEmailValid && (
                <p style={{ color: "#ff5e00", fontSize: "0.85rem", marginTop: "10px" }}>Inserisci un indirizzo Email valido in alto per sbloccare il bottone.</p>
            )}
        </PayPalScriptProvider>
    );
}
