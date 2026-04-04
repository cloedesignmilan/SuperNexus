import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    // 1. Dati Prisma
    const stores = await prisma.store.findMany({
        include: {
            _count: {
                select: { jobs: true, templates: true, users: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const jobs = await prisma.generationJob.findMany({
        select: {
            id: true,
            results_count: true,
            status: true,
            store_id: true
        }
    });

    // 2. Calcoli Finanziari
    const totalImages = jobs.reduce((acc, job) => acc + (job.status === "completato" ? job.results_count : 0), 0);
    const COST_PER_IMAGE_ESTIMATE = 0.03; // Costo medio stima Imagen3 / Gemini Flash
    const totalApiCost = totalImages * COST_PER_IMAGE_ESTIMATE;

    const mrr = stores.reduce((acc, store) => acc + (store.is_active ? store.monthly_fee : 0), 0);
    const netProfit = mrr - totalApiCost;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>SUPERNEXUS</h1>
                <button className={styles.primaryBtn}>+ Registra Cliente</button>
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
                                <th>Fee Mensile</th>
                                <th>Lookbook Generati</th>
                                <th>Dipendenti Attivi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{textAlign: 'center'}}>Nessun cliente registrato a sistema.</td>
                                </tr>
                            )}
                            {stores.map(store => (
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
                                        {store.telegram_bot_token ? `${store.telegram_bot_token.slice(0,18)}...` : 'Nessun Bot Assegnato'}
                                    </td>
                                    <td>€{store.monthly_fee.toFixed(2)}</td>
                                    <td>{store._count.jobs} sessioni</td>
                                    <td>{store._count.users} user</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
