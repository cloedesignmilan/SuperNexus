"use client";

import { useState } from "react";
import { updateSubcategorySceneVariance } from "./actions";

export default function SubcategorySceneToggle({ 
    subcategoryId, 
    initialValue 
}: { 
    subcategoryId: string; 
    initialValue: boolean | null;
}) {
    const [value, setValue] = useState<boolean | null>(initialValue);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = async (newValue: boolean | null) => {
        setIsSaving(true);
        setValue(newValue);
        try {
            await updateSubcategorySceneVariance(subcategoryId, newValue);
        } catch (e) {
            console.error("Error toggling scene variance:", e);
        }
        setIsSaving(false);
    };

    const isGlobal = value === null;
    const isForceOn = value === true;
    const isForceOff = value === false;

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#aaa', marginRight: '10px' }}>Magic Scene Variance:</span>
            
            <button 
                onClick={() => handleToggle(null)}
                disabled={isSaving || isGlobal}
                style={{
                    padding: '6px 12px', background: isGlobal ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', 
                    color: isGlobal ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: isGlobal ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                Globale (Default)
            </button>
            <button 
                onClick={() => handleToggle(true)}
                disabled={isSaving || isForceOn}
                style={{
                    padding: '6px 12px', background: isForceOn ? '#03dac6' : 'rgba(255,255,255,0.05)', 
                    color: isForceOn ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: isForceOn ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                Forza ON
            </button>
            <button 
                onClick={() => handleToggle(false)}
                disabled={isSaving || isForceOff}
                style={{
                    padding: '6px 12px', background: isForceOff ? '#ff5470' : 'rgba(255,255,255,0.05)', 
                    color: isForceOff ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: isForceOff ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                Forza OFF
            </button>
        </div>
    );
}
