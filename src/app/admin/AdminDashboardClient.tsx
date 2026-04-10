"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Settings, FileText, Search, Copy, PauseCircle, PlayCircle, Zap, RefreshCw, Download } from 'lucide-react';
import styles from "./page.module.css";
import { toggleStoreStatus, addStoreCredits, resetStorePassword } from './actions';

export default function AdminDashboardClient({ initialStores, mrr, totalApiCost, netProfit }: any) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'suspended'
    const [stores, setStores] = useState(initialStores);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setStores(stores.map((s: any) => s.id === id ? { ...s, is_active: !currentStatus } : s));
        await toggleStoreStatus(id, currentStatus);
    };

    const handleCopyPwd = (pwd: string) => {
        navigator.clipboard.writeText(pwd || '');
        alert("Password copiata negli appunti!");
    };

    const handleRefill = async (id: string) => {
        const amountStr = prompt("Inserisci quanti crediti EXTRA assegnare a questo cliente:");
        if (!amountStr) return;
        const amount = parseInt(amountStr, 10);
        if (isNaN(amount) || amount <= 0) return alert("Inserisci un numero valido!");
        
        setStores(stores.map((s: any) => s.id === id ? { ...s, supplementary_credits: s.supplementary_credits + amount } : s));
        const res = await addStoreCredits(id, amount);
        if (!res.success) alert("Errore durante la ricarica: " + res.error);
    };

    const handleResetPwd = async (id: string) => {
        if (!confirm("Sei sicuro di invalidare l'accesso e generare un nuovo PIN per questo negozio?")) return;
        const res = await resetStorePassword(id);
        if (res.success) {
            setStores(stores.map((s: any) => s.id === id ? { ...s, password: res.newPassword } : s));
            alert("Nuovo PIN generato con successo!");
        } else {
            alert("Errore reset password.");
        }
    };

    const downloadCSV = () => {
        const headers = ["Brand", "Stato", "Piano", "Password", "Canone", "Capacita", "Crediti Extra", "Crediti Rimanenti", "Foto Generate", "Ultimo Accesso"];
        const rows = stores.map((s: any) => [
            s.name, s.is_active ? "Attivo" : "Sospeso", s.plan_name, s.password || "N/A", 
            s.monthly_fee.toFixed(2), s.generation_limit, s.supplementary_credits, 
            s.subscription_credits + s.supplementary_credits, s.total_images, 
            s.last_active_date ? new Date(s.last_active_date).toISOString().split('T')[0] : "Mai usato"
        ]);
        const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `report_supernexus_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return "Mai usato";
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `Attivo ${hours === 0 ? 'poco' : hours} ore fa`;
        const days = Math.floor(hours / 24);
        return `Fermo da ${days} giorn${days === 1 ? 'o' : 'i'}`;
    };

    const filteredStores = stores.filter((store: any) => {
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (store.password && store.password.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' ? true : 
                              statusFilter === 'active' ? store.is_active : !store.is_active;

        return matchesSearch && matchesStatus;
    });

    const getHealthColor = (used: number, total: number) => {
        if (total === 0) return '#ff5470';
        const percent = used / total;
        if (percent > 0.5) return '#03dac6'; // Safe > 50%
        if (percent > 0.15) return '#ffb86c'; // Warning 15-50%
        return '#ff5470'; // Danger < 15%
    };

    return (
        <>
            <section className={styles.kpiGrid}>
                <div className={styles.glassCard}>
                    <div className={styles.kpiLabel}>MRR (Ricavi Mensili Attivi)</div>
                    <div className={styles.kpiValue}>€{mrr.toFixed(2)}</div>
                </div>
                <div className={styles.glassCard}>
                    <div className={styles.kpiLabel}>Costi API (Gemini/Cloud)</div>
                    <div className={styles.kpiValue} style={{color: '#ff5470'}}>
                        €{totalApiCost.toFixed(2)}
                    </div>
                </div>
                <div className={styles.glassCard}>
                    <div className={styles.kpiLabel}>Margine Netto</div>
                    <div className={styles.kpiValue} style={{color: '#03dac6'}}>
                        €{netProfit.toFixed(2)}
                    </div>
                </div>
            </section>

            <section className={styles.tableSection}>
                <div className={styles.controlsRow}>
                    <div className={styles.tabGroup}>
                        <button className={`${styles.tabBtn} ${statusFilter === 'all' ? styles.active : ''}`} onClick={() => setStatusFilter('all')}>Tutti ({stores.length})</button>
                        <button className={`${styles.tabBtn} ${statusFilter === 'active' ? styles.active : ''}`} onClick={() => setStatusFilter('active')}>Attivi ({stores.filter((s:any) => s.is_active).length})</button>
                        <button className={`${styles.tabBtn} ${statusFilter === 'suspended' ? styles.active : ''}`} onClick={() => setStatusFilter('suspended')}>Sospesi ({stores.filter((s:any) => !s.is_active).length})</button>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', gap: '15px' }}>
                        <button onClick={downloadCSV} style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Download size={16} /> Esporta CSV
                        </button>
                        <div style={{position: 'relative'}}>
                            <Search size={18} style={{position: 'absolute', left: '12px', top: '12px', color: '#888'}} />
                            <input 
                                type="text" 
                                className={styles.searchInput} 
                                placeholder="Cerca per Nome o Password..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.clientTable}>
                        <thead>
                            <tr>
                                <th>Stato</th>
                                <th>Nominativo / Brand</th>
                                <th>Piano & Accesso</th>
                                <th>Fee Mensile</th>
                                <th>Consumo Crediti / Salute</th>
                                <th>Volumetria</th>
                                <th>Azioni Rapide</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStores.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{textAlign: 'center', padding: '40px'}}>Nessun cliente trovato per questi filtri.</td>
                                </tr>
                            )}
                            {filteredStores.map((store: any) => {
                                const totalCapacity = store.generation_limit + store.supplementary_credits;
                                const remaining = store.subscription_credits + store.supplementary_credits;
                                const healthColor = getHealthColor(remaining, totalCapacity);
                                const fillPercentage = totalCapacity > 0 ? (remaining / totalCapacity) * 100 : 0;

                                return (
                                <tr key={store.id} style={{ opacity: store.is_active ? 1 : 0.6 }}>
                                    <td>
                                        <div className={styles.statusWrapper}>
                                            <div className={`${styles.statusDot} ${store.is_active ? styles.statusActive : styles.statusSuspended}`}></div>
                                            <span style={{fontSize: '0.8rem', color: '#888'}}>
                                                {store.is_active ? 'ATTIVO' : 'SOSPESO'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.storeName}>{store.name}</td>
                                    <td>
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <span style={{color: '#bb86fc', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase'}}>{store.plan_name || 'Starter'}</span>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                <span style={{fontFamily: 'monospace', color: '#fff', fontSize: '0.9rem'}}>🔑 {store.password || 'N/A'}</span>
                                                <button onClick={() => handleCopyPwd(store.password)} className={styles.copyBtn} title="Copia Password"><Copy size={12} /></button>
                                                <button onClick={() => handleResetPwd(store.id)} className={styles.copyBtn} title="Rigenera Password Nuova"><RefreshCw size={12} /></button>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{color: '#fff', fontWeight: 600}}>€{store.monthly_fee.toFixed(2)}</span></td>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <div style={{display: 'flex', flexDirection: 'column', width: '130px'}}>
                                                <span style={{color: healthColor, fontWeight: 'bold', fontSize: '0.95rem'}}>
                                                    {remaining} / {totalCapacity}
                                                </span>
                                                <div className={styles.healthBarTrack}>
                                                    <div className={styles.healthBarFill} style={{ width: `${Math.min(100, fillPercentage)}%`, backgroundColor: healthColor }}></div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRefill(store.id)} style={{background: 'rgba(3, 218, 198, 0.1)', border: '1px solid #03dac6', color: '#03dac6', padding: '6px', borderRadius: '6px', cursor: 'pointer'}} title="Ricarica + Crediti">
                                                <Zap size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <span style={{fontSize: '0.9rem', color: '#fff'}}>{getTimeAgo(store.last_active_date)}</span>
                                            <span style={{fontSize: '0.75rem', color: '#888'}}>{store.jobs_count} righe storico</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.actionBtnGroup}>
                                            <button 
                                                onClick={() => handleToggleStatus(store.id, store.is_active)} 
                                                style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: store.is_active ? '#ffb86c' : '#03dac6', padding: '6px', borderRadius: '6px', cursor: 'pointer'}}
                                                title={store.is_active ? "Sospendi" : "Riattiva"}
                                            >
                                                {store.is_active ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                                            </button>
                                            <Link href={`/admin/cliente/${store.id}`} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(187, 134, 252, 0.15)', border: '1px solid #bb86fc', color: '#bb86fc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}}>
                                                <Settings size={14} /> Dettagli
                                            </Link>
                                            <Link href={`/admin/cliente/${store.id}/report`} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#a0a0a0', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}} title="Report Finanziario">
                                                <FileText size={14} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
