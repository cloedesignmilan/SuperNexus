import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Settings, FileText, PlusCircle } from 'lucide-react';
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const COST_PER_IMAGE_ESTIMATE = 0.03; // Costo medio stima Imagen3 / Gemini Flash

    // 1. Dati Prisma (Includendo i Jobs per ogni cliente per calcolarne i costi diretti)
    const stores = await prisma.store.findMany({
        include: {
            _count: {
                select: { templates: true, users: true }
            },
            jobs: {
                select: { status: true, results_count: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Calcoli Finanziari Totali (Iterando sui clienti)
    const storesData = stores.map((store: any) => {
        const storeImages = store.jobs.reduce((sum: number, job: any) => sum + (job.status === "completato" ? job.results_count : 0), 0);
        const total_cost = storeImages * COST_PER_IMAGE_ESTIMATE;
        const net_profit = store.monthly_fee - total_cost;

        return {
            ...store,
            total_cost,
            net_profit,
            total_images: storeImages
        };
    });

    let totalApiCost = storesData.reduce((acc, store) => acc + store.total_cost, 0);
    const mrr = storesData.reduce((acc, store) => acc + (store.is_active ? store.monthly_fee : 0), 0);
    const netProfit = mrr - totalApiCost;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>SUPERNEXUS</h1>
                <Link href="/admin/nuovo-cliente" className={styles.primaryBtn} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <PlusCircle size={18} /> Registra Cliente
                </Link>
            </header>

            <section className={styles.kpiGrid}>
                <div className={styles.glassCard}>
                    <div className={styles.kpiLabel}>MRR (Ricavi Mensili)</div>
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
                <h2 className={styles.sectionTitle}>Clienti & Negozi Attivi</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.clientTable}>
                        <thead>
                            <tr>
                                <th>Stato</th>
                                <th>Nominativo / Brand</th>
                                <th>Bot Token</th>
                                <th>Fee Mensile (Ricavo)</th>
                                <th>Costi Consumati (API)</th>
                                <th>Utile Netto (Guadagno)</th>
                                <th>Immagini Generate</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storesData.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{textAlign: 'center'}}>Nessun cliente registrato a sistema.</td>
                                </tr>
                            )}
                            {storesData.map((store: any) => (
                                <tr key={store.id}>
                                    <td>
                                        <div className={styles.statusWrapper}>
                                            <div className={`${styles.statusDot} ${store.is_active ? styles.statusActive : styles.statusSuspended}`}></div>
                                            <span style={{fontSize: '0.8rem', color: '#888'}}>
                                                {store.is_active ? 'ATTIVO' : 'SOSPESO'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles.storeName}>{store.name}</td>
                                    <td className={styles.tokenId}>
                                        {store.telegram_bot_token ? `${store.telegram_bot_token.slice(0,18)}...` : 'Test Interno'}
                                    </td>
                                    <td><span style={{color: '#fff', fontWeight: 600}}>€{store.monthly_fee.toFixed(2)}</span></td>
                                    <td><span style={{color: '#ff5470'}}>€{store.total_cost.toFixed(2)}</span></td>
                                    <td>
                                        <span style={{color: store.net_profit >= 0 ? '#03dac6' : '#ff5470', fontWeight: 'bold'}}>
                                            €{store.net_profit.toFixed(2)}
                                        </span>
                                    </td>
                                    <td>{store.total_images} foto / {store.jobs.length} lookbook</td>
                                    <td style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                        <Link href={`/admin/cliente/${store.id}`} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(187, 134, 252, 0.15)', border: '1px solid #bb86fc', color: '#bb86fc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}}>
                                            <Settings size={14} /> Gestisci
                                        </Link>
                                        <Link href={`/admin/cliente/${store.id}/report`} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#a0a0a0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}}>
                                            <FileText size={14} /> Fatture
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
