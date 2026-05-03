"use client";

import { useState } from "react";
import { updateShot } from "./actions";

export default function PromptConfigShotEditor({ shots }: { shots: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!shots || shots.length === 0) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Nessuno scatto JSON configurato per questa sottocategoria. Usa il database per popolarli.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {shots.map(shot => (
        <div key={shot.id} style={{ background: '#1c1c1e', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#00d2ff' }}>Scatto {shot.shotNumber}: {shot.shotName}</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variant: {shot.presentation}</span>
            </div>
            <button 
              onClick={() => setEditingId(editingId === shot.id ? null : shot.id)}
              style={{ background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
              {editingId === shot.id ? 'Annulla' : 'Modifica'}
            </button>
          </div>
          
          {editingId === shot.id ? (
            <form action={updateShot.bind(null, shot.id)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Nome Scatto</label>
                <input type="text" name="shotName" defaultValue={shot.shotName} className="input-glass" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Positive Prompt</label>
                <textarea name="positivePrompt" defaultValue={shot.positivePrompt} className="input-glass" rows={4} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Negative Prompt</label>
                <textarea name="negativePrompt" defaultValue={shot.negativePrompt} className="input-glass" rows={2} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Hard Rules</label>
                <textarea name="hardRules" defaultValue={shot.hardRules} className="input-glass" rows={2} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Output Goal</label>
                <input type="text" name="outputGoal" defaultValue={shot.outputGoal || ''} className="input-glass" style={{ width: '100%' }} />
              </div>
              <button type="submit" onClick={() => setTimeout(() => setEditingId(null), 500)} style={{ background: '#00d2ff', color: '#1c1c1e', padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Salva Scatto
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {shot.imageUrl && (
                <div style={{ width: '120px', height: '160px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={shot.imageUrl} alt={`Shot ${shot.shotNumber}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0', flex: 1 }}>
                <p><strong>Positive:</strong> {shot.positivePrompt}</p>
                <p><strong>Hard Rules:</strong> <span style={{ color: '#ef4444' }}>{shot.hardRules}</span></p>
                {shot.outputGoal && <p><strong>Output Goal:</strong> {shot.outputGoal}</p>}
                {!shot.imageUrl && <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>Nessuna immagine associata a questo scatto.</p>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
