import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Settings, FileText, PlusCircle } from 'lucide-react';
import styles from "./page.module.css";
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    // Pricing Ufficiale Vertex AI / Gemini (dal listino di fatturazione GCP)
    const COST_PER_IMAGE_GEN = 0.03; // Costo esatto per immagine generata (Imagen 3 / Gemini 3.1 Flash Image Output)
    const COST_PER_VISION_ANALYSIS = 0.0001315; // Costo esatto input immagine (Gemini 2.5 Flash Vision Image Input)

    // 1. Dati Prisma
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stores = await (prisma as any).store.findMany({
        include: {
            _count: {
                select: { templates: true, users: true }
            },
            jobs: {
                where: {
                    createdAt: { gte: startOfMonth }
                },
                select: { status: true, results_count: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Ottenere l'ultima attività (Last Active) globalmente tramite aggregazione 
    const latestJobs = await (prisma as any).generationJob.groupBy({
        by: ['store_id'],
        _max: { createdAt: true }
    });
    const latestJobsMap = new Map(latestJobs.map((j: any) => [j.store_id, j._max.createdAt]));

    // 2. Calcoli Finanziari Totali (Iterando sui clienti con perfezione API)
    const storesData = stores.map((store: any) => {
        let total_cost = 0;
        let storeImages = 0;

        for (const job of store.jobs) {
            total_cost += COST_PER_VISION_ANALYSIS;
            if (job.status === "completato") {
                storeImages += job.results_count;
                total_cost += (job.results_count * COST_PER_IMAGE_GEN);
            }
        }

        const net_profit = store.monthly_fee - total_cost;
        const jobs_count = store.jobs.length;
        
        const last_active_date = latestJobsMap.get(store.id) || null;

        // Strip heavy relations from payload for blazing fast hydration
        const { jobs, _count, ...lightStore } = store;

        return {
            ...lightStore,
            total_cost,
            net_profit,
            total_images: storeImages,
            jobs_count,
            last_active_date
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
