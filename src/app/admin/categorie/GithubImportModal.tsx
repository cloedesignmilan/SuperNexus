"use client";

import React, { useState } from 'react';
import { DownloadCloud, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GithubImportModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleImport = async () => {
        if (!url || !url.includes('http')) {
            setError('Inserisci un URL GitHub (Raw) valido.');
            return;
        }

        setIsLoading(true);
        setError('');
        setStatusText('Avvio Estrazione IA da GitHub...');

        try {
            const res = await fetch('/api/admin/import-github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl: url })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Errore importazione');
            }

            setStatusText(`✅ Importata: ${data.categoryName} (${data.scenesCount} scene)`);
            setTimeout(() => {
                setIsOpen(false);
                setIsLoading(false);
                setUrl('');
                setStatusText('');
                router.refresh();
            }, 2500);

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
            setStatusText('');
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                style={{
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid #fff',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
                <DownloadCloud size={18} /> Importa da GitHub
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px', padding: '30px', width: '500px',
                        maxWidth: '90%', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        <button 
                            onClick={() => !isLoading && setIsOpen(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <DownloadCloud size={28} /> GitHub AI Importer
                        </h2>
                        <p style={{ color: '#888', marginBottom: '25px', fontSize: '0.95rem' }}>
                            Incolla l'URL crudo (Raw) del file React (.tsx / .jsx) per far estrarre automaticamente all'AI le scene.
                        </p>

                        <input 
                            type="text" 
                            placeholder="https://raw.githubusercontent.com/.../src/App.tsx"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                            style={{
                                width: '100%', padding: '15px', borderRadius: '10px',
                                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff', fontSize: '0.95rem', marginBottom: '15px', boxSizing: 'border-box'
                            }}
                        />

                        {error && <div style={{ color: '#ff5470', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
                        {statusText && <div style={{ color: '#03dac6', marginBottom: '15px', fontSize: '0.9rem' }}>{statusText}</div>}

                        <button 
                            onClick={handleImport}
                            disabled={isLoading || !url}
                            style={{
                                width: '100%', background: 'linear-gradient(90deg, #bb86fc 0%, #8758ff 100%)',
                                color: '#fff', border: 'none', borderRadius: '10px', padding: '15px',
                                fontSize: '1rem', fontWeight: 'bold', cursor: isLoading || !url ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                                opacity: isLoading || !url ? 0.7 : 1
                            }}
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <DownloadCloud size={20} />}
                            {isLoading ? 'Analisi AI in corso...' : 'Inizia Estrazione'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
