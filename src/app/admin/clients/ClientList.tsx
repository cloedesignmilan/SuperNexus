"use client";

import { useState } from "react";
import { PlusCircle, Power, PowerOff, BatteryCharging, Trash2, Key } from "lucide-react";
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

  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Cliente / Riferimento</th>
            <th>Status / Accesso PIN</th>
            <th>Generazioni (Succ./Err.)</th>
            <th>Consumo Plafond</th>
            <th>Azioni Rapide</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => {
            const isExhausted = client.images_generated >= client.images_allowance;
            
            return (
              <tr key={client.id}>
                <td>
                  <strong>{client.email || 'Cliente senza referenza'}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                    Creato: {new Date(client.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     {client.subscription_active ? 
                        <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>ATTIVO</span> : 
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>SOSP.</span>}
                  </div>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', width: 'fit-content' }}>
                    <Key size={12} color="#ccff00" /> <strong style={{ color: '#ccff00', letterSpacing: '1px' }}>{client.bot_pin || 'N/A'}</strong>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.9rem' }}>✅ {client.successfulJobs} completate</div>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>❌ {client.failedJobs} fallite</div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>{client.images_generated} usati</span>
                      <span>{client.images_allowance} max</span>
                    </div>
                    <div style={{ height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${Math.min((client.images_generated / (client.images_allowance || 1)) * 100, 100)}%`,
                        background: isExhausted ? '#ef4444' : 'var(--color-success)'
                      }}></div>
                    </div>
                    {isExhausted && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>Plafond esaurito!</span>}
                  </div>
                </td>
                <td>
                   <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleToggle(client.id, client.subscription_active)} 
                        className={`action-btn ${client.subscription_active ? 'delete' : 'success'}`}
                        title={client.subscription_active ? "Disattiva Cliente" : "Attiva Cliente"}
                      >
                         {client.subscription_active ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                      
                      <div style={{ display: 'flex', background: '#222', borderRadius: '6px', overflow: 'hidden', border: '1px solid #444' }}>
                        <input 
                           type="number" 
                           placeholder="+50" 
                           style={{ width: '50px', background: 'transparent', border: 'none', color: 'white', padding: '0 8px', fontSize: '0.8rem' }}
                           value={topupAmount[client.id] || ""}
                           onChange={e => setTopupAmount(prev => ({ ...prev, [client.id]: e.target.value }))}
                        />
                        <button 
                          onClick={() => handleTopup(client.id)}
                          style={{ background: '#ccff00', color: 'black', border: 'none', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}
                          title="Ricarica Plafond"
                        >
                          <BatteryCharging size={14} />
                        </button>
                      </div>

                      <button onClick={() => handleDelete(client.id)} className="action-btn delete" title="Elimina">
                        <Trash2 size={16} />
                      </button>
                   </div>
                </td>
              </tr>
            );
          })}
          
          {clients.length === 0 && (
             <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                   Nessun cliente registrato nel CRM. Creane uno nuovo per iniziare!
                </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
