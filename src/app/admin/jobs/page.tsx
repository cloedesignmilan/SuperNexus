import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
    const jobs = await prisma.generationJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            user: true,
            category: true,
            subcategory: true
        }
    });

    return (
        <div className="admin-container">
            <header className="page-header">
                <div>
                    <h1 className="title-gradient">Generazioni AI</h1>
                    <p className="page-subtitle">Cronologia degli ultimi 50 rendering eseguiti dal motore su Telegram.</p>
                </div>
            </header>

            <div className="card glass-card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-accent)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Data</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Utente</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Stile</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Dettaglio Task</th>
                                <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 600 }}>Originale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(job.createdAt).toLocaleString('it-IT')}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {job.user?.email ? job.user.email.replace('telegram_', '').replace('@supernexus.ai', '') : 'Sconosciuto'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {job.subcategory?.name || 'VTON Base'} <br/>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>({job.category?.name})</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ 
                                                display: 'inline-block',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                color: job.status === 'completed' ? '#000' : '#fff',
                                                backgroundColor: job.status === 'completed' ? '#22c55e' : '#f59e0b',
                                                width: 'fit-content'
                                            }}>
                                                {job.status.toUpperCase()}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {job.provider_response || 'Nessuna risposta'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {job.original_product_image_url ? (
                                            <a href={job.original_product_image_url} target="_blank" rel="noreferrer" style={{ 
                                                color: 'var(--color-primary)',
                                                textDecoration: 'none',
                                                fontWeight: 500,
                                                padding: '0.4rem 0.8rem',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(255,255,255,0.05)'
                                            }}>
                                                Vedi Foto
                                            </a>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-dim)' }}>
                                        Nessuna generazione ancora registrata in Database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
