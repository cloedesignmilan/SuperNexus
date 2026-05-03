"use client"

import { useState } from 'react';
import { updateValidationStatus, updateValidationNotes } from './actions';
import { useRouter } from 'next/navigation';

export function ValidationCheckCard({ check, index }: { check: any, index: number }) {
    const router = useRouter();
    const [notes, setNotes] = useState(check.review_notes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleStatusChange = async (status: string) => {
        setIsSaving(true);
        await updateValidationStatus(check.id, status);
        setIsSaving(false);
        router.refresh();
    };

    const handleNotesSave = async () => {
        setIsSaving(true);
        await updateValidationNotes(check.id, notes);
        setIsSaving(false);
        alert('Note aggiornate!');
        router.refresh();
    };

    const statusColor = check.comparison_status === 'match' ? '#10b981' : check.comparison_status === 'incorrect' ? '#ef4444' : check.comparison_status === 'partial' ? '#f59e0b' : 'gray';

    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex' }}>
                {/* Split Compare Side-by-Side */}
                <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.65rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target (Reference)</div>
                    <div style={{ height: '250px' }}>
                        <img src={check.reference_image_url} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Output (Generato)</div>
                    <div style={{ height: '250px' }}>
                        <img src={check.generated_sample_image} alt="Generated" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                    </div>
                </div>
            </div>
            
            {/* Box Risultato Interattivo */}
            <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Esito Check #{index + 1}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => handleStatusChange('match')}
                            className="btn-glass"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', background: check.comparison_status === 'match' ? '#10b981' : 'transparent', color: check.comparison_status === 'match' ? 'white' : '#10b981', border: '1px solid #10b981' }}
                            disabled={isSaving}
                        >
                            PERFECT MATCH
                        </button>
                        <button 
                            onClick={() => handleStatusChange('partial')}
                            className="btn-glass"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', background: check.comparison_status === 'partial' ? '#f59e0b' : 'transparent', color: check.comparison_status === 'partial' ? 'white' : '#f59e0b', border: '1px solid #f59e0b' }}
                            disabled={isSaving}
                        >
                            PARTIAL
                        </button>
                        <button 
                            onClick={() => handleStatusChange('incorrect')}
                            className="btn-glass"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', background: check.comparison_status === 'incorrect' ? '#ef4444' : 'transparent', color: check.comparison_status === 'incorrect' ? 'white' : '#ef4444', border: '1px solid #ef4444' }}
                            disabled={isSaving}
                        >
                            INCORRECT
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <textarea 
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Inserisci note su difetti, alterazioni o anomalie riscontrate nell'output rispetto alla reference originale."
                        className="input-glass"
                        style={{ flex: 1, minHeight: '80px', fontSize: '0.85rem' }}
                    />
                    <button onClick={handleNotesSave} disabled={isSaving} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        Salva Note
                    </button>
                </div>
                
                <div suppressHydrationWarning style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    Verificato il: {new Date(check.last_checked_at).toLocaleString('it-IT')} | Stato Corrente: <strong style={{ color: statusColor, textTransform: 'uppercase' }}>{check.comparison_status}</strong>
                </div>

            </div>
        </div>
    );
}
