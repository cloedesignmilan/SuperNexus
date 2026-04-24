"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { applyPlanToExistingUser } from "./actions";

interface PayPalCheckoutProps {
    email: string;
    planName: string;
    onSuccess: () => void;
}

export default function PayPalCheckout({ email, planName, onSuccess }: PayPalCheckoutProps) {
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
            setError("Config error: No Plan ID found.");
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
                const res = await applyPlanToExistingUser(email, planName, data.subscriptionID);
                if (res.error) setError(res.error);
                else onSuccess();
            } else {
                setError("Subscription activation error: " + (subData.error || "Unknown"));
                setIsPending(false);
            }
        } catch (err) {
            console.error(err);
            setError("Error during checkout.");
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
                const res = await applyPlanToExistingUser(email, planName, data.orderID);
                if (res.error) setError(res.error);
                else onSuccess();
            } else {
                setError("Order error: " + (orderData.error || "Unknown"));
                setIsPending(false);
            }
        } catch (err) {
            console.error(err);
            setError("Error during checkout.");
            setIsPending(false);
        }
    };

    if (error) {
        return <div style={{ color: "#ef4444", padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>{error}</div>;
    }

    if (isPending) {
        return <div style={{ padding: "20px", color: "#06b6d4", fontWeight: "bold" }}>Processing payment... Setting up account...</div>;
    }

    const initialOptions = {
        clientId: clientId,
        currency: "USD",
        intent: isSubscription ? "subscription" : "capture",
        vault: isSubscription ? true : false,
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            {isSubscription ? (
                <PayPalButtons 
                    createSubscription={createSubscription} 
                    onApprove={onApproveSubscription} 
                    style={{ layout: "vertical", color: "gold", shape: "pill" }}
                />
            ) : (
                <PayPalButtons 
                    createOrder={createOrder} 
                    onApprove={onApproveOrder} 
                    style={{ layout: "vertical", color: "gold", shape: "pill" }}
                />
            )}
        </PayPalScriptProvider>
    );
}
