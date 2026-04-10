import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Settings, FileText, PlusCircle } from 'lucide-react';
import styles from "./page.module.css";
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const COST_PER_IMAGE_ESTIMATE = 0.03; // Costo medio stima Imagen3 / Gemini Flash

    // 1. Dati Prisma
    const stores = await (prisma as any).store.findMany({
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

    let totalApiCost = storesData.reduce((acc: number, store: any) => acc + store.total_cost, 0);
    const mrr = storesData.reduce((acc: number, store: any) => acc + (store.is_active ? store.monthly_fee : 0), 0);
    const netProfit = mrr - totalApiCost;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>SUPERNEXUS</h1>
                <div style={{display: 'flex', gap: '15px'}}>
                    <Link href="/admin/prompt-builder" className={styles.secondaryBtn} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <FileText size={18} /> Modular Prompt Builder
                    </Link>
                    <Link href="/admin/nuovo-cliente" className={styles.primaryBtn} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <PlusCircle size={18} /> Registra Cliente
                    </Link>
                </div>
            </header>

            <AdminDashboardClient 
                initialStores={storesData} 
                mrr={mrr} 
                totalApiCost={totalApiCost} 
                netProfit={netProfit} 
            />
        </div>
    );
}
