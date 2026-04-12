"use client";

import { useState } from "react";
import { PlusCircle, Power, PowerOff, BatteryCharging, Trash2, Key, CheckCircle, XCircle } from "lucide-react";
import { toggleSubscription, updateAllowance, deleteClient } from "./actions";

export default function ClientList({ clients }: { clients: any[] }) {
  const [topupAmount, setTopupAmount] = useState<{ [key: string]: string }>({});

  const handleToggle = async (id: string, state: boolean) => {
    if(confirm(`Sei sicuro di voler ${state ? 'disattivare' : 'attivare'} questo cliente?`)) {
      await toggleSubscription(id, state);
    }
  };

  const handleTopup = async (id: string) => {
    const amount = parseInt(topupAmount[id], 10);
    if (!amount || amount <= 0) return alert("Inserisci un importo valido");
    if(confirm(`Aggiungere ${amount} crediti a questo utente?`)) {
      await updateAllowance(id, amount);
      setTopupAmount(prev => ({ ...prev, [id]: "" }));
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Eliminare DEFINITIVAMENTE questo cliente e tutta la sua cronologia?")) {
      await deleteClient(id);
    }
  };

  if (clients.length === 0) {
     return (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Nessun cliente registrato nel CRM. Inizia creando il tuo primo Account Cliente!</p>
        </div>
     );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '30px' }}>
      {clients.map(client => {
        const totalGenerated = client.images_generated;
        const baseLimit = client.base_allowance;
        const totalLimit = client.images_allowance;
        const extraLimit = Math.max(0, totalLimit - baseLimit);

        const monthlyGenerated = Math.min(totalGenerated, baseLimit);
        const extraGenerated = Math.max(0, totalGenerated - baseLimit);

        const monthlyProgress = baseLimit > 0 ? Math.min((monthlyGenerated / baseLimit) * 100, 100) : 0;
        const extraProgress = extraLimit > 0 ? Math.min((extraGenerated / extraLimit) * 100, 100) : 0;
        
        const isMonthlyExhausted = monthlyGenerated >= baseLimit;
        const isFullyExhausted = totalGenerated >= totalLimit;
        
        return (
          <div key={client.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.8rem', position: 'relative', overflow: 'hidden', minHeight: '380px' }}>
            
            {/* Header: Email e Stato */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.8rem' }}>
               <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>
                     {client.email || 'Cliente Guest'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                     <span>Iscritto: {new Date(client.createdAt).toLocaleDateString('it-IT')}</span>
                     {client.subscription_active ? (
                        <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Attivo</span>
                     ) : (
                        <span style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Sospeso</span>
                     )}
                     <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        {client.base_allowance === 100 ? 'Starter Pack' : client.base_allowance === 300 ? 'Retail Pack' : `Custom ${client.base_allowance}`}
                     </span>
                     <span style={{ background: 'linear-gradient(135deg, rgba(230, 46, 191, 0.15), rgba(0, 210, 255, 0.15))', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        Spesa API: €{client.totalCost?.toFixed(4) || '0.0000'}
                     </span>
                  </div>
               </div>
            </div>

            {/* SEZIONI PROGRESSO DIVISE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '1.8rem' }}>
                
                {/* 1. PROGRESSO MENSILE */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Piano Mensile</span>
                            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{baseLimit - monthlyGenerated} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>rimanenti</span></span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{monthlyGenerated} / {baseLimit}</span>
                        </div>
                    </div>
                    
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                            height: '100%', 
                            width: `${monthlyProgress}%`,
                            background: isMonthlyExhausted ? '#4b5563' : 'linear-gradient(90deg, #e62ebf, #ff0055)',
                            transition: 'width 0.5s ease-out'
                        }}></div>
                    </div>
                </div>

                {/* 2. PROGRESSO CREDITI EXTRA (Solo se ne ha) */}
                {extraLimit > 0 && (
                    <div style={{ background: 'rgba(0, 210, 255, 0.03)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0, 210, 255, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#00d2ff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Crediti Extra / Top-Up</span>
                                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{extraLimit - extraGenerated} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>rimanenti</span></span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{extraGenerated} / {extraLimit}</span>
                            </div>
                        </div>
                        
                        <div style={{ height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                                height: '100%', 
                                width: `${extraProgress}%`,
                                background: extraGenerated >= extraLimit ? '#4b5563' : 'linear-gradient(90deg, #00d2ff, #3b82f6)',
                                transition: 'width 0.5s ease-out'
                            }}></div>
                        </div>
                    </div>
                )}

                {isFullyExhausted && <div style={{ fontSize: '0.8rem', color: '#f87171', background: 'rgba(248, 113, 113, 0.05)', padding: '8px', borderRadius: '6px', textAlign: 'center', fontWeight: 600 }}>⚠️ Plafond Globale Esaurito. Le AI sono bloccate.</div>}
            </div>

            {/* BOX STATISTICHE GENERAZIONI & PIN */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, background: 'rgba(52, 211, 153, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                     <CheckCircle size={18} />
                   </div>
                   <div>
                       <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{client.successfulJobs}</div>
                       <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completate</div>
                   </div>
                </div>
                
                <div style={{ flex: 1, background: 'rgba(67, 56, 202, 0.1)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(67, 56, 202, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(67, 56, 202, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                     <Key size={18} />
                   </div>
                   <div>
                       <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e0e7ff', letterSpacing: '1.5px' }}>{client.bot_pin || '---'}</div>
                       <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Codice PIN</div>
                   </div>
                </div>
            </div>

            {/* CONTROLLI INFERIORI ALLINEATI */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               
               {/* MODULO RICARICA */}
               <div style={{ display: 'flex', flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <input 
                     type="number" 
                     placeholder="+ Add Extra" 
                     style={{ flex: 1, minWidth: '40px', padding: '10px 14px', background: 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                     value={topupAmount[client.id] || ""}
                     onChange={e => setTopupAmount(prev => ({ ...prev, [client.id]: e.target.value }))}
                  />
                  <button 
                    onClick={() => handleTopup(client.id)}
                    style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0 16px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                    title="Aggiungi Crediti e Ricarica"
                  >
                    Ricarica
                  </button>
               </div>

               {/* BOTTONI SYSTEM */}
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleToggle(client.id, client.subscription_active)} 
                    style={{ 
                       padding: '10px', borderRadius: '10px', cursor: 'pointer', border: 'none',
                       background: client.subscription_active ? 'rgba(255,255,255,0.05)' : 'rgba(52, 211, 153, 0.1)',
                       color: client.subscription_active ? 'var(--color-text-muted)' : '#34d399',
                       transition: 'all 0.2s'
                    }}
                    title={client.subscription_active ? "Sospendi Abbonamento" : "Riattiva Abbonamento"}
                  >
                     {client.subscription_active ? <PowerOff size={18} /> : <Power size={18} />}
                  </button>
                  <button 
                     onClick={() => handleDelete(client.id)} 
                     style={{ padding: '10px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', transition: 'all 0.2s' }} 
                     title="Elimina Utente"
                  >
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
