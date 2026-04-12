"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Zap, Gem } from 'lucide-react';
import PayPalCheckout from './PayPalCheckout';

export default function RegistrazionePage() {
    const [email, setEmail] = useState("");
    const [planName, setPlanName] = useState("starter");
    const [isUpgrade, setIsUpgrade] = useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlEmail = params.get('email');
            const urlUpgrade = params.get('upgrade');
            if (urlEmail) setEmail(urlEmail);
            if (urlUpgrade === 'true') {
                setIsUpgrade(true);
                setPlanName('starter'); // Default to starter on upgrade
            }
        }
    }, []);

    return (
        <div style={{minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '40px 20px', fontFamily: 'Inter, sans-serif'}}>
            <div style={{maxWidth: '800px', margin: '0 auto'}}>
                <Link href="/" style={{color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '30px'}}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div style={{textAlign: 'center', marginBottom: '40px'}}>
                    <h1 style={{fontSize: '2.5rem', marginBottom: '10px'}}>Get Started with SuperNexus</h1>
                    <p style={{color: '#a0a0a0', fontSize: '1.1rem'}}>Select the plan that best suits your sales volume and start selling right away.</p>
                </div>

                <div style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px'}}>
                    
                    <div style={{marginBottom: '30px'}}>
                        <label style={{display: 'block', marginBottom: '10px', fontSize: '1.1rem', fontWeight: 600}}>Email Address</label>
                        <input type="email" name="email" required placeholder="E.g. info@myoffice.com"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               style={{width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
                        <p style={{color: '#666', fontSize: '0.85rem', marginTop: '8px'}}>We will use this email to send you login details in case you need to recover them.</p>
                    </div>

                    <h3 style={{marginBottom: '20px', fontSize: '1.2rem', color: '#ffffff'}}>Select your subscription</h3>
                    
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px'}}>
                        {/* FREE TRIAL */}
                        {!isUpgrade && (
                            <label style={{cursor: 'pointer', display: 'block'}}>
                                <input type="radio" name="planName" value="free_trial" className="peer" style={{display: 'none'}} 
                                       checked={planName === 'free_trial'} onChange={(e) => setPlanName(e.target.value)} />
                                <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column'}} 
                                     className="radio-card trial-card">
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                        <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18} color="#ff0ab3" /> Free Trial</h4>
                                        <span style={{fontSize: '1.4rem', fontWeight: 'bold'}}>$0</span>
                                    </div>
                                    <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                        <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> 10 Free Images</li>
                                        <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> No Credit Card</li>
                                        <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> 14 Days Expiration</li>
                                    </ul>
                                </div>
                            </label>
                        )}

                        {/* STARTER */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="starter" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'starter'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column'}} 
                                 className="radio-card starter-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18} color="#ff0ab3" /> Starter</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold'}}>$29<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> 100 generations / month</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff0ab3"/> Telegram Bot Access</li>
                                </ul>
                            </div>
                        </label>

                        {/* RETAIL */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="retail" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'retail'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'}}
                                 className="radio-card retail-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Gem size={18} color="#00ffff" /> Retail</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#fff'}}>$79<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> <strong>300 generations / month</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> Ultra GPU Bot Priority</li>
                                </ul>
                            </div>
                        </label>

                        {/* RETAIL ANNUALE */}
                        <label style={{cursor: 'pointer', display: 'block', gridColumn: '1 / -1'}}>
                            <input type="radio" name="planName" value="retail_annual" className="peer" style={{display: 'none'}} 
                                   checked={planName === 'retail_annual'} onChange={(e) => setPlanName(e.target.value)} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'}}
                                 className="radio-card annual-card">
                                <span style={{position: 'absolute', top: '-12px', right: '10px', background: '#ccff00', color: '#000', fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '10px', textTransform: 'uppercase'}}>Special Offer</span>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, color: '#ccff00', display: 'flex', alignItems: 'center', gap: '8px'}}>Annual Retail</h4>
                                    <div style={{textAlign: 'right'}}>
                                        <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', display: 'block'}}>$49<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                        <span style={{fontSize: '0.7rem', color: '#ccff00'}}>Billed $588</span>
                                    </div>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#e0e0e0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> <strong>Full Retail Plan</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> Save $360 per year</li>
                                </ul>
                            </div>
                        </label>
                    </div>

                    <div style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', textAlign: 'center'}}>
                        {planName === 'free_trial' ? (
                            <button 
                                onClick={async () => {
                                    if (!email || !email.includes('@')) {
                                        alert("Please enter a valid email address first.");
                                        return;
                                    }
                                    const { createFreeTrial } = await import('./actions');
                                    const res = await createFreeTrial(email);
                                    if (res.error) {
                                        alert(res.error);
                                    } else if (res.success && res.redirectUrl) {
                                        window.location.href = res.redirectUrl;
                                    }
                                }}
                                style={{width: '100%', padding: '16px', background: '#ff0ab3', color: '#000', fontWeight: '900', borderRadius: '12px', fontSize: '1.2rem', cursor: 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(255,10,179,0.4)', transition: 'all 0.2s'}}>
                                Start Free Trial Now
                            </button>
                        ) : (
                            <PayPalCheckout email={email} planName={planName} />
                        )}
                        
                        <p style={{color: '#666', fontSize: '0.8rem', marginTop: '15px'}}>
                            {planName === 'free_trial' ? 'A welcome PIN will be shown instantly on the next page.' : 'You will be redirected to the secure PayPal circuit. After payment, your account will be active.'}
                        </p>
                        {planName !== 'free_trial' && (
                            <p style={{color: '#888', fontSize: '0.9rem', marginTop: '15px', fontWeight: '500'}}>
                                <span style={{color: '#03dac6', marginRight: '5px'}}>✓</span> You can cancel your subscription at any time directly from your PayPal account.
                            </p>
                        )}
                    </div>

                </div>
            </div>
            {/* CSS GLOBALE PER LE RADIO */}
            <style dangerouslySetInnerHTML={{__html: `
                .radio-card { border: 2px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); }
                input[value="free_trial"]:checked + .radio-card { border-color: #ff0ab3 !important; background: rgba(255,10,179,0.05) !important; box-shadow: 0 0 15px rgba(255,10,179,0.2); }
                input[value="starter"]:checked + .radio-card { border-color: #ff0ab3 !important; background: rgba(255,10,179,0.05) !important; }
                input[value="retail"]:checked + .radio-card { border-color: #00ffff !important; background: rgba(0,255,255,0.05) !important; }
                input[value="retail_annual"]:checked + .radio-card { border-color: #ccff00 !important; background: rgba(204,255,0,0.05) !important; }
            `}} />
        </div>
    );
}
