'use client';

import React, { useState } from 'react';

export default function DataSyncPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage("Seleziona prima un file CSV.");
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/data/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`Errore: ${data.error || 'Import fallito'}`);
      } else {
        setMessage(`Successo! Aggiornate ${data.updatedCount} righe.`);
      }
    } catch (error: any) {
      setMessage(`Errore: ${error.message}`);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'white' }}>Data Sync</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Importa o esporta l'intera struttura tramite Google Sheets (CSV).</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Export Card */}
        <div className="admin-card card-gradient-cyan" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Esporta Dati</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '2rem' }}>
            Scarica l'intera struttura del database (Categorie, Business Mode, Sottocategorie e Prompt) in un file CSV.
          </p>
          <a 
            href="/api/admin/data/export" 
            download="supernexus_data.csv"
            style={{ 
              marginTop: 'auto',
              padding: '0.8rem 1.5rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
          >
            Scarica CSV Attuale
          </a>
        </div>

        {/* Import Card */}
        <div className="admin-card card-gradient-purple" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Importa Dati</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '2rem' }}>
            Carica un file CSV modificato per aggiornare o creare in massa categorie, modalità e prompt.
          </p>
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              style={{
                padding: '0.5rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            
            <button 
              onClick={handleImport}
              disabled={isUploading || !file}
              style={{ 
                padding: '0.8rem 1.5rem',
                background: isUploading ? 'gray' : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (isUploading || !file) ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {isUploading ? 'Importazione...' : 'Carica e Sincronizza'}
            </button>
            
            {message && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.9rem' }}>
                {message}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
