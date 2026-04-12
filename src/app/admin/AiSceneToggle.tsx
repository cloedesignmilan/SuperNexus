"use client";

import { useState } from "react";
import { toggleAiSceneVariance } from "./actions";

export default function AiSceneToggle({ initialEnabled }: { initialEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = async (newState: boolean) => {
        setIsSaving(true);
        setEnabled(newState);
        try {
            await toggleAiSceneVariance(newState);
        } catch (e) {
            console.error("Error toggling scene variance:", e);
        }
        setIsSaving(false);
    };

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#aaa', marginRight: '10px' }}>Magic Scene Variance:</span>
            
            <button 
                onClick={() => handleToggle(false)}
                disabled={isSaving || !enabled}
                style={{
                    padding: '6px 12px', background: !enabled ? '#ff3333' : 'rgba(255,255,255,0.05)', 
                    color: !enabled ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: !enabled ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                OFF (Static)
            </button>
            <button 
                onClick={() => handleToggle(true)}
                disabled={isSaving || enabled}
                style={{
                    padding: '6px 12px', background: enabled ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', 
                    color: enabled ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: enabled ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                ON (Dynamic AI)
            </button>
        </div>
    );
}
