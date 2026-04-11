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
        <div>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: 'white' }}>Generazioni AI</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Cronologia in tempo reale degli ultimi rendering eseguiti su Telegram.</p>
            </div>

            <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>ID / Data</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Utente CRM</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Modello Allenato</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Esito Task</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Asset</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    
                                    {/* DATA */}
                                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                        <div style={{ color: 'white', marginBottom: '4px' }}>{job.id.split('-')[0]}</div>
                                        <div style={{ fontSize: '0.75rem' }}>{new Date(job.createdAt).toLocaleString('it-IT')}</div>
                                    </td>
                                    
                                    {/* UTENTE */}
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                           <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                              {job.user?.email ? job.user.email.charAt(0).toUpperCase() : '?'}
                                           </div>
                                           <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{job.user?.email ? job.user.email.replace('telegram_', '').replace('@supernexus.ai', '') : 'Guest'}</span>
                                        </div>
                                    </td>
                                    
                                    {/* STILE */}
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{job.subcategory?.name || 'VTON Engine Engine'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{job.category?.name || 'Base'}</div>
                                    </td>
                                    
                                    {/* ESITO */}
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <span style={{ 
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                letterSpacing: '0.05em',
                                                color: job.status === 'completed' ? '#34d399' : '#f87171',
                                                background: job.status === 'completed' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                                border: `1px solid ${job.status === 'completed' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                                                width: 'fit-content'
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: job.status === 'completed' ? '#34d399' : '#f87171' }}></div>
                                                {job.status === 'completed' ? 'SUCCESS' : 'FAILED'}
                                            </span>
                                            {job.status !== 'completed' && job.provider_response && (
                                              <span style={{ fontSize: '0.7rem', color: '#fca5a5', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.provider_response}>
                                                  {job.provider_response}
                                              </span>
                                            )}
                                        </div>
                                    </td>
                                    
                                    {/* ASSET */}
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        {job.original_product_image_url ? (
                                            <a href={job.original_product_image_url} target="_blank" rel="noreferrer" style={{ 
                                                display: 'inline-block',
                                                color: 'var(--color-primary)',
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                                padding: '6px 12px',
                                                border: '1px solid currentColor',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                transition: 'all 0.2s',
                                                background: 'rgba(230, 46, 191, 0.1)'
                                            }}>
                                                Immagine
                                            </a>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        Il database è vuoto. I log AI appariranno qui in tempo reale.
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
