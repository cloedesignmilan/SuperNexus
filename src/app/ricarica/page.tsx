"use client";

import { useState } from "react";
import { verifyPinForTopup } from "./actions";
import TopupCheckout from "./TopupCheckout";

export default function RicaricaPage() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // User state
    const [user, setUser] = useState<{ email: string | null; remaining: number } | null>(null);
    const [selectedPackage, setSelectedPackage] = useState("topup_150");
    const [success, setSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await verifyPinForTopup(pin);
            if (res.error) {
                setError(res.error);
            } else if (res.success && res.user) {
                setUser(res.user);
            }
        } catch (err) {
            setError("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '60px 20px', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                <div style={{width: '64px', height: '64px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'}}>
                    <svg style={{width: '32px', height: '32px', color: '#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px'}}>Top-up Successful!</h1>
                <p style={{color: '#a0a0a0', marginBottom: '32px', maxWidth: '400px'}}>Your credits have been added instantly. You can go back to Telegram and start generating images right away!</p>
                <a href="https://t.me/SuperNexus_Pro_bot" target="_blank" rel="noopener noreferrer" style={{background: '#06b6d4', color: '#000', padding: '12px 32px', borderRadius: '99px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'none'}}>
                    Back to Telegram
                </a>
            </div>
        );
    }

    return (
        <div style={{minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '60px 24px', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100%', maxWidth: '450px'}}>
                
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px'}}>
                    <div style={{width: '64px', height: '64px', background: 'linear-gradient(to top right, #06b6d4, #3b82f6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 0 30px rgba(6,182,212,0.3)'}}>
                        <svg style={{width: '32px', height: '32px', color: '#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold'}}>Buy Credits</h1>
                    <p style={{color: '#a0a0a0', marginTop: '8px', textAlign: 'center', fontSize: '0.875rem'}}>Add instant computing power to your SuperNexus subscription.</p>
                </div>

                {!user ? (
                    <div style={{background: '#111', border: '1px solid #1f2937', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'}}>
                        <h2 style={{fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '24px'}}>Secure Login</h2>
                        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            <div>
                                <label style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block'}}>Your Bot PIN</label>
                                <input 
                                    type="text" 
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="E.g. 123456" 
                                    style={{width: '100%', background: '#000', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '1rem', outline: 'none'}}
                                    required
                                />
                            </div>
                            
                            {error && <div style={{color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '0.875rem'}}>{error}</div>}
                            
                            <button 
                                type="submit" 
                                disabled={loading || pin.length < 5}
                                style={{width: '100%', background: '#fff', color: '#000', fontWeight: 'bold', padding: '12px', borderRadius: '12px', marginTop: '8px', opacity: (loading || pin.length < 5) ? 0.5 : 1, cursor: 'pointer', border: 'none'}}
                            >
                                {loading ? "Verifying..." : "Verify Account"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{background: '#111', border: '1px solid #1f2937', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #1f2937'}}>
                            <div>
                                <p style={{fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Account</p>
                                <p style={{fontWeight: 'medium', color: '#d1d5db'}}>{user.email || "Anonymous User"}</p>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <p style={{fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Remaining Credits</p>
                                <p style={{fontWeight: 'bold', fontSize: '1.125rem', color: user.remaining < 10 ? '#ef4444' : '#22d3ee'}}>{user.remaining} photos</p>
                            </div>
                        </div>

                        <h2 style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px'}}>Select Package</h2>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
                            <label style={{position: 'relative', border: selectedPackage === 'topup_150' ? '1px solid #06b6d4' : '1px solid #1f2937', background: selectedPackage === 'topup_150' ? 'rgba(6, 182, 212, 0.1)' : 'transparent', borderRadius: '12px', padding: '16px', cursor: 'pointer'}}>
                                <input type="radio" name="package" value="topup_150" checked={selectedPackage === 'topup_150'} onChange={() => setSelectedPackage("topup_150")} style={{display: 'none'}} />
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div>
                                        <p style={{fontWeight: 'bold', color: '#fff'}}>Booster 100 <span style={{fontSize: '0.75rem', color: '#22d3ee', background: 'rgba(34, 211, 238, 0.2)', padding: '2px 8px', borderRadius: '99px', marginLeft: '8px'}}>Standard</span></p>
                                        <p style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px'}}>100 instant extra images</p>
                                    </div>
                                    <p style={{fontWeight: 'bold'}}>$ 19.00</p>
                                </div>
                            </label>

                            <label style={{position: 'relative', border: selectedPackage === 'topup_500' ? '1px solid #06b6d4' : '1px solid #1f2937', background: selectedPackage === 'topup_500' ? 'rgba(6, 182, 212, 0.1)' : 'transparent', borderRadius: '12px', padding: '16px', cursor: 'pointer'}}>
                                <input type="radio" name="package" value="topup_500" checked={selectedPackage === 'topup_500'} onChange={() => setSelectedPackage("topup_500")} style={{display: 'none'}} />
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div>
                                        <p style={{fontWeight: 'bold', color: '#fff'}}>Booster 300</p>
                                        <p style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px'}}>300 instant extra images</p>
                                    </div>
                                    <p style={{fontWeight: 'bold'}}>$ 39.00</p>
                                </div>
                            </label>
                        </div>

                        <TopupCheckout 
                            pin={pin} 
                            packageId={selectedPackage} 
                            onSuccess={() => setSuccess(true)} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
