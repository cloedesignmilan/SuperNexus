'use client';

import React from 'react';
import PayPalCheckout from './PayPalCheckout';
import { PRICING_CONFIG } from '@/lib/pricingConfig';
import { ArrowLeft, CheckCircle2, Zap, Gem } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutClient({ email, plan }: { email: string, plan: string }) {
    
    const getPlanDetails = () => {
        if (plan === 'starter_pack') return { title: 'Starter Pack', price: PRICING_CONFIG.starter_pack.price, images: PRICING_CONFIG.starter_pack.images, type: 'one-time', icon: <Zap size={24} color="#ff0ab3" /> };
        if (plan === 'retail_pack') return { title: 'Retail Pack', price: PRICING_CONFIG.retail_pack.price, images: PRICING_CONFIG.retail_pack.images, type: 'one-time', icon: <Gem size={24} color="#00ffff" /> };
        if (plan === 'retail_monthly') return { title: 'Retail Monthly', price: PRICING_CONFIG.retail_monthly.price, images: PRICING_CONFIG.retail_monthly.images, type: 'per month', icon: <Gem size={24} color="#ccff00" /> };
        return { title: 'Unknown', price: '0', images: 0, type: '', icon: null };
    };

    const details = getPlanDetails();

    return (
        <div style={{minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '40px 20px', fontFamily: 'Inter, sans-serif'}}>
            <div style={{maxWidth: '600px', margin: '0 auto'}}>
                <Link href="/dashboard" style={{color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '30px'}}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div style={{textAlign: 'center', marginBottom: '40px'}}>
                    <h1 style={{fontSize: '2.5rem', marginBottom: '10px'}}>Complete Checkout</h1>
                    <p style={{color: '#a0a0a0', fontSize: '1.1rem'}}>You're logged in as <strong style={{color: '#fff'}}>{email}</strong></p>
                </div>

                <div style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px'}}>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            {details.icon}
                            <div>
                                <h2 style={{margin: 0, fontSize: '1.5rem'}}>{details.title}</h2>
                                <p style={{color: '#a0a0a0', margin: '5px 0 0 0'}}>{details.images} Generative Images</p>
                            </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <span style={{fontSize: '1.8rem', fontWeight: 'bold'}}>${details.price}</span>
                            <div style={{color: '#888', fontSize: '0.9rem'}}>{details.type}</div>
                        </div>
                    </div>

                    <h3 style={{marginBottom: '20px', fontSize: '1.1rem'}}>Secure Payment via PayPal</h3>
                    <PayPalCheckout 
                        email={email} 
                        planName={plan} 
                        onSuccess={() => { window.location.href = '/dashboard?checkout_success=true'; }} 
                    />
                    
                    <p style={{color: '#666', fontSize: '0.85rem', marginTop: '20px', textAlign: 'center'}}>
                        After payment, your account will be instantly credited.
                    </p>
                </div>
            </div>
        </div>
    );
}
