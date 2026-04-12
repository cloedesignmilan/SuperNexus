"use client";

import { useState } from "react";
import { toggleAiModel } from "./actions";

export default function ModelToggle({ initialModel }: { initialModel: string }) {
    const [model, setModel] = useState(initialModel);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = async (newModel: string) => {
        setIsSaving(true);
        setModel(newModel);
        try {
            await toggleAiModel(newModel);
        } catch (e) {
            console.error("Error toggling model:", e);
        }
        setIsSaving(false);
    };

    const isFlash = model === 'gemini-3.1-flash-image-preview';

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#aaa', marginRight: '10px' }}>Active Model:</span>
            
            <button 
                onClick={() => handleToggle('gemini-3.1-flash-image-preview')}
                disabled={isSaving || isFlash}
                style={{
                    padding: '6px 12px', background: isFlash ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', 
                    color: isFlash ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: isFlash ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                Flash (Veloce/Economico)
            </button>
            <button 
                onClick={() => handleToggle('gemini-3-pro-image-preview')}
                disabled={isSaving || !isFlash}
                style={{
                    padding: '6px 12px', background: !isFlash ? '#ff5e00' : 'rgba(255,255,255,0.05)', 
                    color: !isFlash ? '#fff' : '#aaa', border: 'none', borderRadius: '8px', cursor: isSaving ? 'wait' : 'pointer',
                    fontWeight: !isFlash ? 600 : 400, transition: 'all 0.2s', fontSize: '0.85rem'
                }}
            >
                Pro (Alta Fedeltà)
            </button>
        </div>
    );
}
