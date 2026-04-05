import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { updateStoreAction, deleteStoreAction } from './actions';
import styles from '../../page.module.css';
import { Store as StoreIcon, Bot, Euro, Power, Trash2, ArrowLeft, Paintbrush, Key } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = "force-dynamic";

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    
    const storeObj = await (prisma as any).store.findUnique({
        where: { id: resolvedParams.id }
    });
    
    const templates = await (prisma as any).promptTemplate.findMany();

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

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
                    <div>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                            <Key size={16} /> Password Portale (Multi-Tenant)
                        </label>
                        <input name="password" type="text" defaultValue={storeObj.password || ''} placeholder="Es. Magazzini123"
                               style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}} />
                    </div>
                    <div>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#bb86fc', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                            <StoreIcon size={16} /> Piano Abbonamento
                        </label>
                        <input name="plan_name" type="text" defaultValue={storeObj.plan_name || 'Starter'} placeholder="Es. Starter, Pro, Enterprise" required
                               style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(187, 134, 252, 0.4)', background: 'rgba(187, 134, 252, 0.05)', color: '#fff', fontSize: '1.1rem'}} />
                    </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px'}}>
                    <div style={{background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                        <label style={{display: 'block', color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px'}}>Limite Generazioni Mensili</label>
                        <input name="generation_limit" type="number" defaultValue={storeObj.generation_limit} required
                               style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold'}} />
                    </div>
                    <div style={{background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                        <label style={{display: 'block', color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px'}}>Rimanenza Mese Attuale (Sub)</label>
                        <input name="subscription_credits" type="number" defaultValue={storeObj.subscription_credits} required
                               style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold'}} />
                    </div>
                    <div style={{background: 'rgba(3, 218, 198, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(3, 218, 198, 0.2)'}}>
                        <label style={{display: 'block', color: '#03dac6', fontSize: '0.85rem', marginBottom: '8px'}}>Ricariche Extra (Infinite)</label>
                        <input name="supplementary_credits" type="number" defaultValue={storeObj.supplementary_credits} required
                               style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(3, 218, 198, 0.4)', background: 'transparent', color: '#03dac6', fontSize: '1.2rem', fontWeight: 'bold'}} />
                    </div>
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

                <div style={{marginBottom: '35px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#03dac6', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        <Paintbrush size={16} /> Stile Fotografico AI (Default)
                    </label>
                    <select name="default_template_id" defaultValue={storeObj.default_template_id || ""}
                            style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem'}}>
                        <option value="">-- Seleziona uno stile fotografico (Default Globale) --</option>
                        {templates.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                        ))}
                    </select>
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
