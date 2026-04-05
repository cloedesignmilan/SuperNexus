import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { PlusCircle, FileEdit, Trash2 } from 'lucide-react';
import styles from "../page.module.css"; 

export const dynamic = "force-dynamic";

export default async function AdminCategoriesDashboard() {
    // 1. Fetch Dati Prisma
    const categories = await prisma.category.findMany({
        include: { 
            _count: { select: { scenes: true } }
        },
        orderBy: { sort_order: 'asc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>SUPERNEXUS</h1>
                    <p style={{color: '#888', marginTop: '5px'}}>Gestione Categorie & Architettura Prompt</p>
                </div>
                <div style={{display: 'flex', gap: '15px'}}>
                    <Link href="/admin" className={styles.secondaryBtn} style={{textDecoration: 'none'}}>
                        Torna ai Clienti
                    </Link>
                    <Link href="/admin/categorie/nuova" className={styles.primaryBtn} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <PlusCircle size={18} /> Nuova Categoria
                    </Link>
                </div>
            </header>

            <section className={styles.tableSection} style={{marginTop: '40px'}}>
                <h2 className={styles.sectionTitle}>Categorie Configurate</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.clientTable}>
                        <thead>
                            <tr>
                                <th>Ordine</th>
                                <th>Nome Categoria</th>
                                <th>Stato</th>
                                <th>Scene / Blocchi</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{textAlign: 'center', padding: '30px'}}>Nessuna Categoria trovata. Telegram non ha opzioni!</td>
                                </tr>
                            )}
                            {categories.map((cat: any) => (
                                <tr key={cat.id}>
                                    <td style={{color: '#888'}}>{cat.sort_order}</td>
                                    <td style={{fontWeight: 'bold'}}>{cat.name}</td>
                                    <td>
                                        <div className={styles.statusWrapper}>
                                            <div className={`${styles.statusDot} ${cat.is_active ? styles.statusActive : styles.statusSuspended}`}></div>
                                            <span style={{fontSize: '0.85rem', color: '#888'}}>
                                                {cat.is_active ? 'ATTIVO' : 'DISABILITATO'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{color: '#03dac6'}}>{cat._count?.scenes || 0} scene caricate</td>
                                    <td>
                                        <div style={{display: 'flex', gap: '10px'}}>
                                            <Link href={`/admin/categorie/${cat.id}`} style={{color: '#bb86fc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                <FileEdit size={16} /> Modifica Master & Scene
                                            </Link>
                                        </div>
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
