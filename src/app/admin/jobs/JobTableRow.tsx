"use client"

import { useState } from 'react';
import { getSubcategoryReferences, createValidationCheck } from './actions';

export default function JobTableRow({ job }: { job: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Modal state
    const [promotingImg, setPromotingImg] = useState<string | null>(null);
    const [references, setReferences] = useState<any[]>([]);
    const [isLoadingRefs, setIsLoadingRefs] = useState(false);
    const [selectedRef, setSelectedRef] = useState<string>('');

    const isTimeout = job.status === 'pending' && (new Date().getTime() - new Date(job.createdAt).getTime() > 120 * 1000);
    const displayStatus = isTimeout ? 'timeout' : job.status;
    const hasOutputs = job.images && job.images.length > 0;
    const hasInput = !!job.original_product_image_url;
    
    const canExpand = hasInput || hasOutputs;

    const handlePromoteClick = async (imgUrl: string) => {
        if (!job.subcategory_id) {
            alert("No subcategory linked to this job.");
            return;
        }
        setPromotingImg(imgUrl);
        setIsLoadingRefs(true);
        const res = await getSubcategoryReferences(job.subcategory_id);
        if (res.success && res.references) {
            setReferences(res.references);
        } else {
            alert("Errore nel caricamento delle references");
        }
        setIsLoadingRefs(false);
    };

    const submitPromotion = async () => {
        if (!promotingImg || !selectedRef) return;
        const res = await createValidationCheck({
            subcategory_id: job.subcategory_id,
            generated_sample_image: promotingImg,
            reference_image_url: selectedRef
        });
        if (res.success) {
            alert("Salvato in Output Check Module!");
            setPromotingImg(null);
        } else {
            alert("Errore nel salvataggio: " + res.error);
        }
    };

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
                    <div style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{job.subcategory?.name || 'VTON Engine'}</div>
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

                            {hasInput && hasOutputs && (
                                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
                            )}

                            {/* OUTPUTS COLUMN */}
                            {hasOutputs && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>OUTPUT GENERATI ({job.images.length})</div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {job.images.map((img: any, idx: number) => (
                                            <div key={img.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
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
                                                
                                                <button 
                                                    onClick={() => handlePromoteClick(img.image_url)}
                                                    style={{ 
                                                        fontSize: '0.65rem', 
                                                        padding: '4px 8px', 
                                                        background: 'rgba(56,189,248,0.1)', 
                                                        color: '#38bdf8', 
                                                        border: '1px solid rgba(56,189,248,0.3)',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}>
                                                    Test Qualità
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}

            {/* MODALE DI PROMOZIONE */}
            {promotingImg && (
                <tr style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <td colSpan={6} style={{ padding: '2rem' }}>
                        <div style={{ background: 'var(--color-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-primary)', maxWidth: '600px', margin: '0 auto' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'white' }}>Invia a Expected Output Check</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                                Seleziona l'immagine Reference (Target) che questa generazione intendeva replicare.
                            </p>
                            
                            {isLoadingRefs ? (
                                <div>Caricamento references...</div>
                            ) : references.length === 0 ? (
                                <div style={{ color: '#ef4444', marginBottom: '1rem' }}>Questa sottocategoria non ha immagini reference.</div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                    {references.map(ref => (
                                        <div 
                                            key={ref.id} 
                                            onClick={() => setSelectedRef(ref.image_url)}
                                            style={{ 
                                                border: selectedRef === ref.image_url ? '2px solid var(--color-primary)' : '2px solid transparent', 
                                                borderRadius: '8px', 
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                opacity: selectedRef && selectedRef !== ref.image_url ? 0.5 : 1
                                            }}
                                        >
                                            <img src={ref.image_url} style={{ width: '100%', height: '80px', objectFit: 'cover' }} alt="Ref" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setPromotingImg(null)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Annulla</button>
                                <button onClick={submitPromotion} disabled={!selectedRef} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', opacity: !selectedRef ? 0.5 : 1 }}>Conferma Salvataggio</button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
