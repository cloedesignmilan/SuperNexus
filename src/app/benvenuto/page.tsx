import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Send, Sparkles, Copy, AlertTriangle } from 'lucide-react';
import styles from '../admin/page.module.css';

export const dynamic = "force-dynamic";

export default async function BenvenutoPage({ searchParams }: { searchParams: Promise<{ d: string }> }) {
    const resolvedParams = await searchParams;
    let data = { name: "New Client", psw: "Unknown", plan: "Unknown" };

    try {
        if (resolvedParams.d) {
            const decoded = Buffer.from(resolvedParams.d, 'base64').toString('utf8');
            data = JSON.parse(decoded);
        }
    } catch(e) {
        // Fallback
    }

    return (
        <div style={{minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '60px 20px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{maxWidth: '650px', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '50px', textAlign: 'center', position: 'relative', overflow: 'hidden'}}>
                
                {/* Effetto Glow di background */}
                <div style={{position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0, 133, 255, 0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0}}></div>

                <div style={{position: 'relative', zIndex: 1}}>
                    <div style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #0085FF, #00C6FF)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 10px 25px rgba(0,133,255,0.4)'}}>
                        <ShieldCheck size={40} color="#ffffff" />
                    </div>

                    <h1 style={{fontSize: '2.5rem', marginBottom: '10px'}}>Registration Confirmed!</h1>
                    <p style={{color: '#a0a0a0', fontSize: '1.1rem', marginBottom: '40px'}}>
                        Welcome aboard, <strong>{data.name}</strong>. Your AI-powered workspace has been encrypted and configured.
                    </p>

                    <div style={{background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '30px', marginBottom: '30px'}}>
                        <h3 style={{fontSize: '1rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px'}}>YOUR SECRET ACCESS PIN</h3>
                        
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px'}}>
                            <div style={{fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 'bold', color: '#03dac6', letterSpacing: '3px'}}>
                                {data.psw}
                            </div>
                        </div>

                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ffffff', fontSize: '0.85rem', marginTop: '20px', background: 'rgba(255, 51, 51, 0.05)', padding: '10px', borderRadius: '8px'}}>
                            <AlertTriangle size={16} color="#ff3333" /> <strong style={{ color: '#ff3333' }}>Warning:</strong> <span style={{ opacity: 0.9 }}>Take a screenshot. This PIN will not be shown again. You will need it to link your Telegram account with the Bot.</span>
                        </div>
                    </div>

                    <h3 style={{fontSize: '1.2rem', marginBottom: '20px'}}>Click the button below to start!</h3>

                    {/* Bottone d'azione verso Telegram */}
                    <a href="https://t.me/SuperNexus_Pro_bot" target="_blank" rel="noopener noreferrer" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#0088cc', color: '#fff', textDecoration: 'none', padding: '20px 40px', fontSize: '1.3rem', fontWeight: 'bold', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0, 136, 204, 0.4)', transition: 'transform 0.2s'}}>
                        <Send size={24} /> Start SuperNexus on Telegram
                    </a>

                    <div style={{marginTop: '40px'}}>
                        <Link href="/" style={{color: '#888', textDecoration: 'none', fontSize: '0.9rem', borderBottom: '1px solid #444'}}>
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
