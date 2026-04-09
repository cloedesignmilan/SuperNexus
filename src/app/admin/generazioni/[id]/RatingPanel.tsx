'use client';

import { rateJob } from './actions';
import { useTransition } from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export default function RatingPanel({ jobId, currentRating }: { jobId: string, currentRating?: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ marginBottom: '15px', color: '#ccc' }}>Valutazione Qualitativa Job</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => startTransition(() => rateJob(jobId, 'buono'))}
                  disabled={isPending}
                  style={{ flex: 1, padding: '10px', background: currentRating === 'buono' ? '#1b4a2e' : '#111', color: '#4ade80', border: '1px solid #4ade80', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                    <ThumbsUp size={16} /> Eccellente
                </button>
                <button 
                  onClick={() => startTransition(() => rateJob(jobId, 'medio'))}
                  disabled={isPending}
                  style={{ flex: 1, padding: '10px', background: currentRating === 'medio' ? '#4a3f1b' : '#111', color: '#eab308', border: '1px solid #eab308', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                    <Minus size={16} /> Medio / Accettabile
                </button>
                <button 
                  onClick={() => startTransition(() => rateJob(jobId, 'scarto'))}
                  disabled={isPending}
                  style={{ flex: 1, padding: '10px', background: currentRating === 'scarto' ? '#4a1b1b' : '#111', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                    <ThumbsDown size={16} /> Scarto
                </button>
            </div>
            {currentRating && (
               <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>Attualmente valutato come: <b style={{textTransform: 'uppercase'}}>{currentRating}</b></p>
            )}
        </div>
    );
}
