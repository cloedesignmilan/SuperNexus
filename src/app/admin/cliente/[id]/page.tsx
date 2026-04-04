import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { updateStoreAction, deleteStoreAction } from './actions';
import styles from '../../page.module.css';
import { Store as StoreIcon, Bot, Euro, Power, Trash2, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    
    const storeObj = await prisma.store.findUnique({
        where: { id: resolvedParams.id }
    });

    if (!storeObj) return notFound();

    const updateActionWithId = updateStoreAction.bind(null, storeObj.id);
    const deleteActionWithId = deleteStoreAction.bind(null, storeObj.id);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                  <h1 className={styles.title} style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <StoreIcon size={32} color="#03dac6" /> Gestione {storeObj.name}
                  </h1>
                  <p style={{color: '#a0a0a0', marginTop: '10px'}}>Dashboard di Amministrazione Singolo Tenant</p>
                </div>
                <Link href="/admin" className={styles.primaryBtn} style={{background: 'rgba(255,255,255,0.05)', boxShadow: 'none', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <ArrowLeft size={16} /> Torna a Dashboard
                </Link>
            </header>

            <form action={updateActionWithId} className={styles.glassCard} style={{maxWidth: '700px', margin: '40px auto'}}>
                <div style={{marginBottom: '25px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        <StoreIcon size={16} /> Nome Brand / Boutique
                    </label>
                    <input name="name" type="text" required defaultValue={storeObj.name}
                           style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
                </div>

                <div style={{marginBottom: '25px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        <Bot size={16} /> Telegram Bot Token
                    </label>
                    <input name="telegram_bot_token" type="text" defaultValue={storeObj.telegram_bot_token || ''}
                           style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#bb86fc', fontFamily: 'monospace', fontSize: '1rem'}} />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px'}}>
                    <div>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                            <Euro size={16} /> Canone Mensile
                        </label>
                        <input name="monthly_fee" type="number" step="0.01" defaultValue={storeObj.monthly_fee} required 
                               style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
                    </div>

                    <div>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                            <Power size={16} /> Stato Licenza
                        </label>
                        <select name="is_active" defaultValue={storeObj.is_active ? "true" : "false"}
                                style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}}>
                            <option value="true">🟢 Attivo</option>
                            <option value="false">🔴 Sospeso (Blocca Accesso)</option>
                        </select>
                    </div>
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                    <button type="submit" className={styles.primaryBtn} style={{flex: 1, padding: '18px', fontSize: '1.1rem', letterSpacing: '1px'}}>
                        Aggiorna Dati e Licenza
                    </button>
                    
                    <button formAction={deleteActionWithId} style={{background: 'rgba(255, 84, 112, 0.1)', color: '#ff5470', border: '1px solid #ff5470', padding: '0 25px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <Trash2 size={20} /> Elimina
                    </button>
                </div>
            </form>
        </div>
    )
}
