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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
      {clients.map(client => {
        const isExhausted = client.images_generated >= client.images_allowance;
        const progressPercentage = Math.min((client.images_generated / (client.images_allowance || 1)) * 100, 100);
        
        return (
          <div key={client.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
            
            {/* INTESTAZIONE CARD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     {client.email || 'Cliente Senza Nome'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                     Membro dal {new Date(client.createdAt).toLocaleDateString('it-IT')}
                  </div>
               </div>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <div style={{ 
                    padding: '4px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', 
                    background: client.subscription_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: client.subscription_active ? '#22c55e' : '#ef4444',
                    border: `1px solid ${client.subscription_active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                 }}>
                   {client.subscription_active ? 'ATTIVO' : 'SOSPESO'}
                 </div>
               </div>
            </div>

            {/* SEZIONE CHIAVE ACCESSO */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PIN Segreto Bot</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccff00', letterSpacing: '2px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                 <Key size={16} /> {client.bot_pin || '---'}
               </div>
            </div>

            {/* PROGRESSO PLAFOND */}
            <div style={{ marginTop: '5px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>Consumo Crediti (<strong style={{color: 'white'}}>{client.images_generated}</strong> di <strong style={{color: 'white'}}>{client.images_allowance}</strong>)</span>
                  <span style={{ color: isExhausted ? '#ef4444' : 'var(--color-primary)' }}>{Math.round(progressPercentage)}%</span>
               </div>
               <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                 <div style={{ 
                   height: '100%', 
                   width: `${progressPercentage}%`,
                   background: isExhausted ? '#ef4444' : 'var(--color-primary)',
                   transition: 'width 0.5s ease-out'
                 }}></div>
               </div>
               {isExhausted && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '6px', fontWeight: 'bold' }}>⚠️ Plafond Completamente Esaurito</div>}
            </div>

            {/* BOX STATISTICHE GENERAZIONI */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <div style={{ flex: 1, background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                   <CheckCircle size={20} color="#22c55e" style={{ margin: '0 auto 4px auto' }} />
                   <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{client.successfulJobs}</div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Riuscite</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                   <XCircle size={20} color="#ef4444" style={{ margin: '0 auto 4px auto' }} />
                   <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{client.failedJobs}</div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fallite</div>
                </div>
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '5px 0' }} />

            {/* AZIONI E RICARICA */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
               
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleToggle(client.id, client.subscription_active)} 
                    className={`action-btn ${client.subscription_active ? 'delete' : 'success'}`}
                    title={client.subscription_active ? "Sospendi Abbonamento" : "Riattiva Abbonamento"}
                    style={{ padding: '8px', borderRadius: '8px' }}
                  >
                     {client.subscription_active ? <PowerOff size={18} /> : <Power size={18} />}
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="action-btn delete" title="Elimina Permanentemente" style={{ padding: '8px', borderRadius: '8px' }}>
                     <Trash2 size={18} />
                  </button>
               </div>

               {/* COMPONENTE RICARICA RAPIDA */}
               <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ padding: '0 8px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>+</div>
                  <input 
                     type="number" 
                     placeholder="Q.tà" 
                     style={{ width: '45px', background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                     value={topupAmount[client.id] || ""}
                     onChange={e => setTopupAmount(prev => ({ ...prev, [client.id]: e.target.value }))}
                  />
                  <button 
                    onClick={() => handleTopup(client.id)}
                    style={{ background: 'var(--color-primary)', color: 'black', border: 'none', padding: '0 12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Aggiungi Credito"
                  >
                    <BatteryCharging size={14} /> Add
                  </button>
               </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
