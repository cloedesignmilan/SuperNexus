"use client"

import { useState, useTransition } from "react";
import { toggleSaveGenerationOutputs } from "./actions";

export default function SaveOutputsToggle({ initialValue }: { initialValue: boolean }) {
    const [isEnabled, setIsEnabled] = useState(initialValue);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        startTransition(() => {
            toggleSaveGenerationOutputs(newValue);
        });
    };

    return (
        <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: isEnabled ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
            border: isEnabled ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.2s',
            userSelect: 'none'
        }}>
            <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: isEnabled ? '#38bdf8' : 'var(--color-text-muted)' 
            }}>
                Salvataggio Outputs ({isEnabled ? 'ATTIVO' : 'DISATTIVO'})
            </span>
            <div style={{
                width: '36px',
                height: '20px',
                background: isEnabled ? '#38bdf8' : 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                position: 'relative',
                transition: 'all 0.3s'
            }}>
                <div style={{
                    width: '16px',
                    height: '16px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: isEnabled ? '18px' : '2px',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
            </div>
            
            <input 
                type="checkbox" 
                checked={isEnabled} 
                onChange={handleToggle}
                disabled={isPending}
                style={{ display: 'none' }}
            />
        </label>
    );
}
