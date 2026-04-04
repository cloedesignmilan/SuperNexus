import { prisma } from "@/lib/prisma";
import PrintButton from '@/app/admin/generazioni/PrintButton';
import { notFound } from 'next/navigation';
import { Box, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '../../../page.module.css';

export default async function StoreReportPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    
    const store = await prisma.store.findUnique({
        where: { id: resolvedParams.id },
        include: {
            jobs: {
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { images: true } } }
            }
        }
    });

    if (!store) return notFound();

    const totalImages = store.jobs.reduce((acc, job) => acc + (job.status === "completato" ? job.results_count : 0), 0);
    const invoiceDate = new Date().toLocaleDateString('it-IT');

    return (
        <div className={styles.container} style={{background: '#fff', color: '#000', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif'}}>
            
            {/* Header / Azioni Admin (Nascoste in stampa) */}
            <div className="print-hide" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
                <Link href="/admin" style={{display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#bb86fc', fontWeight: 'bold'}}>
                    <ArrowLeft size={18} /> Torna alla Dashboard
                </Link>
                <PrintButton />
            </div>

            {/* FOGLIO A4 STAMPABILE */}
            <div style={{maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', padding: '40px', borderRadius: '8px'}} className="print-card-only">
                
                {/* Intestazione Fattura / Report */}
                <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px'}}>
                    <div>
                        <h1 style={{margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#000'}}>
                            <Box size={28} /> {store.name}
                        </h1>
                        <p style={{margin: '5px 0 0 0', color: '#555', fontSize: '0.9rem'}}>Report Operazioni Intelligenza Artificiale</p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                        <p style={{fontWeight: 'bold', fontSize: '1.2rem', margin: 0, color: '#000'}}>ESTRATTO CONTO</p>
                        <p style={{margin: '5px 0 0 0', color: '#555'}}>Data: {invoiceDate}</p>
                    </div>
                </div>

                {/* Totali */}
                <div style={{display: 'flex', justifyContent: 'space-between', background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px'}}>
                    <div>
                        <p style={{margin: 0, fontSize: '0.85rem', color: '#555', textTransform: 'uppercase'}}>Stato Abbonamento</p>
                        <p style={{margin: '5px 0 0 0', fontWeight: 'bold', color: store.is_active ? 'green' : 'red'}}>{store.is_active ? 'ATTIVO' : 'SOSPESO'}</p>
                    </div>
                    <div>
                        <p style={{margin: 0, fontSize: '0.85rem', color: '#555', textTransform: 'uppercase'}}>Fee Mensile</p>
                        <p style={{margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1.2rem'}}>€ {store.monthly_fee.toFixed(2)}</p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                        <p style={{margin: 0, fontSize: '0.85rem', color: '#555', textTransform: 'uppercase'}}>Volume Immagini Rilasciate</p>
                        <p style={{margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1.2rem'}}>{totalImages} foto</p>
                    </div>
                </div>

                {/* Tabella Operazioni */}
                <h3 style={{fontSize: '1.1rem', color: '#000', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px'}}>Dettaglio Generazioni AI</h3>
                
                {store.jobs.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#888', padding: '40px 0'}}>Nessuna transazione o operazione AI registrata in questo periodo.</p>
                ) : (
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#000'}}>
                        <thead>
                            <tr style={{borderBottom: '2px solid #000'}}>
                                <th style={{textAlign: 'left', padding: '12px 8px'}}>ID Univoco</th>
                                <th style={{textAlign: 'left', padding: '12px 8px'}}>Data / Ora</th>
                                <th style={{textAlign: 'left', padding: '12px 8px'}}>Volume Consumato</th>
                                <th style={{textAlign: 'left', padding: '12px 8px'}}>Stato</th>
                            </tr>
                        </thead>
                        <tbody>
                            {store.jobs.map(job => (
                                <tr key={job.id} style={{borderBottom: '1px solid #eee'}}>
                                    <td style={{padding: '12px 8px', color: '#555', fontFamily: 'monospace'}}>{job.id.slice(0,12)}</td>
                                    <td style={{padding: '12px 8px'}}>{job.createdAt.toLocaleString('it-IT')}</td>
                                    <td style={{padding: '12px 8px'}}>{job._count.images} di {job.results_count}</td>
                                    <td style={{padding: '12px 8px'}}>
                                        <span style={{color: job.status === 'completato' ? 'green' : (job.status === 'errore' ? 'red' : 'orange')}}>
                                            {job.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
