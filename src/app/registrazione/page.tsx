import React from 'react';
import Link from 'next/link';
import { processRegistration } from './actions';
import { ArrowLeft, CheckCircle2, Zap, Gem } from 'lucide-react';
import styles from '../admin/page.module.css'; // Possiamo riusare lo stesso CSS dark

export default function RegistrazionePage() {
    return (
        <div style={{minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '40px 20px', fontFamily: 'Inter, sans-serif'}}>
            <div style={{maxWidth: '800px', margin: '0 auto'}}>
                <Link href="/" style={{color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '30px'}}>
                    <ArrowLeft size={16} /> Torna alla Home
                </Link>

                <div style={{textAlign: 'center', marginBottom: '40px'}}>
                    <h1 style={{fontSize: '2.5rem', marginBottom: '10px'}}>Inizia con SuperNexus</h1>
                    <p style={{color: '#a0a0a0', fontSize: '1.1rem'}}>Seleziona il piano più adatto al tuo volume di vendite e lancia la tua scuderia AI.</p>
                </div>

                <form action={processRegistration} style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px'}}>
                    
                    <div style={{marginBottom: '30px'}}>
                        <label style={{display: 'block', marginBottom: '10px', fontSize: '1.1rem', fontWeight: 600}}>Nome del tuo Negozio / Boutique</label>
                        <input type="text" name="storeName" required placeholder="Es. Armani Milano, Magazzini Emilio..."
                               style={{width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
                        <p style={{color: '#666', fontSize: '0.85rem', marginTop: '8px'}}>Questo nome verrà usato per configurare il tuo cruscotto aziendale e generare le tue chiavi di sicurezza.</p>
                    </div>

                    <h3 style={{marginBottom: '20px', fontSize: '1.2rem', color: '#bb86fc'}}>Seleziona il tuo abbonamento mensile</h3>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px'}}>
                        {/* STARTER */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="starter" className="peer" style={{display: 'none'}} defaultChecked />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s'}} 
                                 className="radio-card starter-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18} color="#03dac6" /> Starter 150</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold'}}>€29<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#03dac6"/> 150 Immagini incluse/mese</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#03dac6"/> Server Condiviso</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#03dac6"/> Ricariche Extra a 0.25€</li>
                                </ul>
                            </div>
                        </label>

                        {/* PRO */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="pro" className="peer" style={{display: 'none'}} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative'}}
                                 className="radio-card pro-card">
                                <span style={{position: 'absolute', top: '-12px', right: '20px', background: '#bb86fc', color: '#000', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '10px', textTransform: 'uppercase'}}>Più Popolare</span>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Gem size={18} color="#bb86fc" /> Pro 500</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold'}}>€69<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#bb86fc"/> 500 Immagini incluse/mese</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#bb86fc"/> Server Prioritario</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#bb86fc"/> Ricariche Extra a 0.15€</li>
                                </ul>
                            </div>
                        </label>
                    </div>

                    <div style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', textAlign: 'center'}}>
                        <button type="submit" style={{background: 'linear-gradient(135deg, #0085FF 0%, #00C6FF 100%)', color: '#fff', border: 'none', padding: '18px 40px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '30px', cursor: 'pointer', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0, 133, 255, 0.3)', transition: 'transform 0.2s'}}>
                            Piazza Ordine Sicuro
                        </button>
                        <p style={{color: '#666', fontSize: '0.8rem', marginTop: '15px'}}>
                            Cliccando accetti i Terms of Service. L'addebito simulato configurerà istantaneamente il tuo negozio.
                        </p>
                    </div>

                </form>
            </div>
            {/* CSS GLOBALE PER LE RADIO */}
            <style dangerouslySetInnerHTML={{__html: `
                .radio-card { border: 2px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); }
                input[value="starter"]:checked + .radio-card { border-color: #03dac6 !important; background: rgba(3,218,198,0.05) !important; }
                input[value="pro"]:checked + .radio-card { border-color: #bb86fc !important; background: rgba(187,134,252,0.05) !important; }
            `}} />
        </div>
    );
}
