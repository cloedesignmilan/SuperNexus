"use client"

import { useState } from 'react';

export default function JobTableRow({ job }: { job: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isTimeout = job.status === 'pending' && (new Date().getTime() - new Date(job.createdAt).getTime() > 120 * 1000);
    const displayStatus = isTimeout ? 'timeout' : job.status;
    const hasOutputs = job.images && job.images.length > 0;
    const hasInput = !!job.original_product_image_url;
    
    // Mostriamo bottone se abbiamo input o output
    const canExpand = hasInput || hasOutputs;

    return (
        <>
            <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.02)', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}>
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
                            color: displayStatus === 'completed' ? '#34d399' : displayStatus === 'pending' ? '#fbbf24' : '#f87171',
                            background: displayStatus === 'completed' ? 'rgba(52, 211, 153, 0.1)' : displayStatus === 'pending' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                            border: `1px solid ${displayStatus === 'completed' ? 'rgba(52, 211, 153, 0.2)' : displayStatus === 'pending' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                            width: 'fit-content'
                        }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: displayStatus === 'completed' ? '#34d399' : displayStatus === 'pending' ? '#fbbf24' : '#f87171' }}></div>
                            {displayStatus === 'completed' ? 'SUCCESS' : displayStatus === 'pending' ? 'PENDING...' : displayStatus === 'timeout' ? 'TIMEOUT (0 Addebiti)' : 'FAILED'}
                        </span>
                        
                        {job.status !== 'completed' && job.status !== 'pending' && job.provider_response && (
                            <span style={{ fontSize: '0.7rem', color: '#fca5a5', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.provider_response}>
                                {job.provider_response}
                            </span>
                        )}
                    </div>
                </td>
                
                {/* COSTO */}
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    € {job.total_cost_eur?.toFixed(4) || '0.000'}
                </td>
                
                {/* ACTION ASSET */}
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    {canExpand ? (
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: isExpanded ? 'rgba(255,255,255,0.1)' : 'rgba(230, 46, 191, 0.15)',
                                color: isExpanded ? 'white' : 'var(--color-primary)',
                                border: `1px solid ${isExpanded ? 'rgba(255,255,255,0.2)' : 'rgba(230, 46, 191, 0.3)'}`,
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isExpanded ? 'Chiudi' : '👀 Visualizza Galleria'}
                        </button>
                    ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Nessun Asset</span>
                    )}
                </td>
            </tr>

            {/* EXPANDED GALLERY ROW */}
            {isExpanded && canExpand && (
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td colSpan={6} style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            gap: '24px', 
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '16px', 
                            borderRadius: '12px',
                            overflowX: 'auto',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            {/* INPUT COLUMN */}
                            {hasInput && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>INPUT UTENTE</div>
                                    <a href={job.original_product_image_url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                                        <img 
                                            src={job.original_product_image_url} 
                                            alt="Input" 
                                            style={{ 
                                                width: '120px', 
                                                height: '160px', 
                                                objectFit: 'cover', 
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                transition: 'transform 0.2s'
                                            }} 
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </a>
                                </div>
                            )}

                            {/* DIVIDER se ci sono entrambi */}
                            {hasInput && hasOutputs && (
                                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
                            )}

                            {/* OUTPUTS COLUMN */}
                            {hasOutputs && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>OUTPUT GENERATI ({job.images.length})</div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {job.images.map((img: any, idx: number) => (
                                            <div key={img.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <a href={img.image_url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                                                    <img 
                                                        src={img.image_url} 
                                                        alt={`Output ${idx+1}`} 
                                                        style={{ 
                                                            width: '120px', 
                                                            height: '160px', 
                                                            objectFit: 'cover', 
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(56, 189, 248, 0.3)',
                                                            transition: 'transform 0.2s'
                                                        }} 
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    />
                                                </a>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>Out {idx+1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
