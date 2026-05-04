"use client";

import { useState } from "react";
import { updateSubcategoryModel } from "./actions";

export default function SubcategoryModelToggle({ 
    subcategoryId, 
    initialModel 
}: { 
    subcategoryId: string; 
    initialModel: string | null;
}) {
    const [model, setModel] = useState<string | null>(initialModel);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = async (newModel: string | null) => {
        setIsSaving(true);
        setModel(newModel);
        try {
            await updateSubcategoryModel(subcategoryId, newModel);
        } catch (e) {
            console.error("Error toggling model:", e);
        }
        setIsSaving(false);
    };

    const isGlobal = model === null;
    const isFlash = model === 'gemini-3.1-flash-image-preview';
    const isPro = model === 'gemini-3-pro-image-preview' || model === 'imagen-3.0-generate-001';

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#aaa', marginRight: '10px' }}>Active Model:</span>
            
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
                onClick={() => handleToggle('gemini-3.1-flash-image-preview')}
                disabled={isSaving || isFlash}
                style={{
                    padding: '6px 12px', background: isFlash ? '#3b82f6' : 'rgba(255,255,255,0.05)', 
                    color: isFlash ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: isFlash ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                Forza Flash
            </button>
            <button 
                onClick={() => handleToggle('gemini-3-pro-image-preview')}
                disabled={isSaving || isPro}
                style={{
                    padding: '6px 12px', background: isPro ? '#ff5e00' : 'rgba(255,255,255,0.05)', 
                    color: isPro ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: isPro ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                Forza Gemini Pro 3
            </button>
        </div>
    );
}
