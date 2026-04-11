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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
      {clients.map(client => {
        const isExhausted = client.images_generated >= client.images_allowance;
        const progressPercentage = Math.min((client.images_generated / (client.images_allowance || 1)) * 100, 100);
        
        return (
          <div key={client.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            
            {/* Header: Email e Stato */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
               <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', margin: '0 0 6px 0' }}>
                     {client.email || 'Cliente Guest'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     Da {new Date(client.createdAt).toLocaleDateString('it-IT')}
                     {client.subscription_active ? (
                        <span style={{ color: '#34d399', fontWeight: 600 }}>• Attivo</span>
                     ) : (
                        <span style={{ color: '#f87171', fontWeight: 600 }}>• Sospeso</span>
                     )}
                  </div>
               </div>
            </div>

            {/* SEZIONE PROGRESSO AL TOP */}
            <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px', color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <span>Plafond Utilizzato</span>
                  <span style={{ color: isExhausted ? '#f87171' : 'white' }}>{Math.round(progressPercentage)}%</span>
               </div>
               <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                 <div style={{ 
                   height: '100%', 
                   width: `${progressPercentage}%`,
                   background: isExhausted ? 'linear-gradient(90deg, #f87171, #ef4444)' : 'linear-gradient(90deg, #e62ebf, #00d2ff)',
                   boxShadow: isExhausted ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
                   transition: 'width 0.5s ease-out'
                 }}></div>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '8px', color: 'white' }}>
                  <span style={{ fontWeight: 600 }}>{client.images_generated} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>immagini</span></span>
                  <span style={{ fontWeight: 600 }}>{client.images_allowance} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>max</span></span>
               </div>
               {isExhausted && <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '8px', fontWeight: 600 }}>⚠️ Ricarica necessaria per continuare sbloccare il bot.</div>}
            </div>

            {/* BOX STATISTICHE GENERAZIONI & PIN */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, background: 'rgba(52, 211, 153, 0.05)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                     <CheckCircle size={16} />
                   </div>
                   <div>
                       <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{client.successfulJobs}</div>
                       <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Riuscite</div>
                   </div>
                </div>
                
                <div style={{ flex: 1, background: 'rgba(67, 56, 202, 0.1)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(67, 56, 202, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(67, 56, 202, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                     <Key size={16} />
                   </div>
                   <div>
                       <div style={{ fontSize: '1rem', fontWeight: 800, color: '#e0e7ff', letterSpacing: '1px' }}>{client.bot_pin || '---'}</div>
                       <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Codice PIN</div>
                   </div>
                </div>
            </div>

            {/* CONTROLLI INFERIORI ALLINEATI */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               
               {/* MODULO RICARICA */}
               <div style={{ display: 'flex', flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <input 
                     type="number" 
                     placeholder="+ Q.tà" 
                     style={{ flex: 1, minWidth: '40px', padding: '8px 10px', background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                     value={topupAmount[client.id] || ""}
                     onChange={e => setTopupAmount(prev => ({ ...prev, [client.id]: e.target.value }))}
                  />
                  <button 
                    onClick={() => handleTopup(client.id)}
                    style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0 12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center' }}
                    title="Aggiungi Crediti e Ricarica"
                  >
                    Add
                  </button>
               </div>

               {/* BOTTONI SYSTEM */}
               <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => handleToggle(client.id, client.subscription_active)} 
                    style={{ 
                       padding: '8px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                       background: client.subscription_active ? 'rgba(255,255,255,0.05)' : 'rgba(52, 211, 153, 0.1)',
                       color: client.subscription_active ? 'var(--color-text-muted)' : '#34d399'
                    }}
                    title={client.subscription_active ? "Sospendi Abbonamento" : "Riattiva Abbonamento"}
                  >
                     {client.subscription_active ? <PowerOff size={16} /> : <Power size={16} />}
                  </button>
                  <button 
                     onClick={() => handleDelete(client.id)} 
                     style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }} 
                     title="Elimina Utente"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
