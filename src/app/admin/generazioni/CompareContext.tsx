'use client';

import React, { createContext, useContext, useState } from 'react';
import Link from 'next/link';

interface CompareContextType {
    selectedJobs: string[];
    toggleJob: (id: string) => void;
}

const CompareContext = createContext<CompareContextType>({
    selectedJobs: [],
    toggleJob: () => {}
});

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

    const toggleJob = (id: string) => {
        setSelectedJobs(prev => {
            if (prev.includes(id)) return prev.filter(j => j !== id);
            if (prev.length >= 2) return prev; // Limit to 2 max
            return [...prev, id];
        });
    };

    return (
        <CompareContext.Provider value={{ selectedJobs, toggleJob }}>
            {children}
            
            {selectedJobs.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1a1a1a',
                    border: '1px solid #bb86fc',
                    padding: '15px 25px',
                    borderRadius: '50px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    zIndex: 9999
                }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>
                        {selectedJobs.length} Jobs Selezionati
                        {selectedJobs.length === 1 ? ' (Selezionane un altro per comparazione)' : ''}
                    </span>
                    {selectedJobs.length === 2 && (
                        <Link 
                            href={`/admin/generazioni/compare?job1=${selectedJobs[0]}&job2=${selectedJobs[1]}`}
                            style={{
                                background: '#bb86fc',
                                color: '#000',
                                padding: '8px 20px',
                                borderRadius: '20px',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        >
                            Confronta A/B
                        </Link>
                    )}
                    <button 
                        onClick={() => setSelectedJobs([])} 
                        style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                        Annulla
                    </button>
                </div>
            )}
        </CompareContext.Provider>
    );
}

export function CompareCheckbox({ jobId }: { jobId: string }) {
    const { selectedJobs, toggleJob } = useContext(CompareContext);
    const isSelected = selectedJobs.includes(jobId);
    
    return (
        <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => toggleJob(jobId)}
            style={{ 
                width: '18px', 
                height: '18px', 
                cursor: 'pointer',
                accentColor: '#bb86fc'
            }} 
        />
    );
}
