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
                    <p style={{color: '#a0a0a0', fontSize: '1.1rem'}}>Seleziona il piano più adatto al tuo volume di vendite e inizia subito a vendere.</p>
                </div>

                <form action={processRegistration} style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px'}}>
                    
                    <div style={{marginBottom: '30px'}}>
                        <label style={{display: 'block', marginBottom: '10px', fontSize: '1.1rem', fontWeight: 600}}>Nome del tuo Negozio / Boutique</label>
                        <input type="text" name="storeName" required placeholder="Es. Armani Milano, Magazzini Emilio..."
                               style={{width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
                        <p style={{color: '#666', fontSize: '0.85rem', marginTop: '8px'}}>Questo nome verrà usato per configurare il tuo cruscotto aziendale e generare le tue chiavi di sicurezza.</p>
                    </div>

                    <h3 style={{marginBottom: '20px', fontSize: '1.2rem', color: '#ffffff'}}>Seleziona il tuo abbonamento mensile o annuale</h3>
                    
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px'}}>
                        {/* STARTER */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="starter" className="peer" style={{display: 'none'}} defaultChecked />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column'}} 
                                 className="radio-card starter-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18} color="#ff5e00" /> Starter</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold'}}>€29<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff5e00"/> 50 generazioni / mese</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff5e00"/> Accesso Bot Telegram</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff5e00"/> Setup veloce</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ff5e00"/> Tutte le nicchie sbloccate</li>
                                </ul>
                            </div>
                        </label>

                        {/* RETAIL */}
                        <label style={{cursor: 'pointer', display: 'block'}}>
                            <input type="radio" name="planName" value="retail" className="peer" style={{display: 'none'}} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'}}
                                 className="radio-card retail-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><Gem size={18} color="#00ffff" /> Retail</h4>
                                    <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#fff'}}>€79<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#a0a0a0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> <strong>300 generazioni / mese</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> Fedeltà assoluta Nano Pro</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> Priorità Bot GPU Ultra</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#00ffff"/> Tutte le nicchie sbloccate</li>
                                </ul>
                            </div>
                        </label>

                        {/* RETAIL ANNUALE */}
                        <label style={{cursor: 'pointer', display: 'block', gridColumn: '1 / -1'}}>
                            <input type="radio" name="planName" value="retail_annual" className="peer" style={{display: 'none'}} />
                            <div style={{borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'}}
                                 className="radio-card annual-card">
                                <span style={{position: 'absolute', top: '-12px', right: '10px', background: '#ccff00', color: '#000', fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '10px', textTransform: 'uppercase'}}>Offerta Speciale</span>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '1.2rem', margin: 0, color: '#ccff00', display: 'flex', alignItems: 'center', gap: '8px'}}>Retail Annuale</h4>
                                    <div style={{textAlign: 'right'}}>
                                        <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', display: 'block'}}>€49<span style={{fontSize: '0.9rem', color: '#888'}}>/mo</span></span>
                                        <span style={{fontSize: '0.7rem', color: '#ccff00'}}>Addebito da 588€</span>
                                    </div>
                                </div>
                                <ul style={{listStyle: 'none', padding: 0, margin: 0, color: '#e0e0e0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> <strong>Tutto il piano Retail</strong></li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> Risparmi 360€ all'anno</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> Supporto prioritario</li>
                                    <li style={{display: 'flex', gap: '8px'}}><CheckCircle2 size={16} color="#ccff00"/> Prezzo bloccato 12 Mesi</li>
                                </ul>
                            </div>
                        </label>
                    </div>

                    <div style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', textAlign: 'center'}}>
                        <button type="submit" disabled style={{background: 'linear-gradient(135deg, #333 0%, #444 100%)', color: '#888', border: 'none', padding: '18px 40px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '30px', cursor: 'not-allowed', width: '100%', maxWidth: '400px', boxShadow: 'none'}}>
                            Sistemi di Pagamento in Aggiornamento
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
                input[value="starter"]:checked + .radio-card { border-color: #ff5e00 !important; background: rgba(255,94,0,0.05) !important; }
                input[value="retail"]:checked + .radio-card { border-color: #00ffff !important; background: rgba(0,255,255,0.05) !important; }
                input[value="retail_annual"]:checked + .radio-card { border-color: #ccff00 !important; background: rgba(204,255,0,0.05) !important; }
            `}} />
        </div>
    );
}
