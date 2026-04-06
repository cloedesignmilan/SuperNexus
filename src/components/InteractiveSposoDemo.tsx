"use client";

import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2, AlertCircle } from 'lucide-react';

export default function InteractiveSposoDemo() {
  const [reference, setReference] = useState<{ url: string, mime: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setReference({ url: event.target?.result as string, mime: file.type });
      setResultImg(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!reference) return;
    setGenerating(true);
    setError(null);
    setResultImg(null);

    // Scegliamo uno scenario a caso tra quelli super suggestivi del repository Sposo-Google-AI
    const SCENARIOS = [
      "Groom riding a vintage Vespa outside a church, bride behind smiling",
      "Groom holding a glass during elegant indoor reception dinner",
      "Groom walking out of a church with confetti moment"
    ];
    const randomScene = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

    try {
      const res = await fetch('/api/sposo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceImageBase64: reference.url,
          referenceMimeType: reference.mime,
          sceneEn: randomScene
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Network error');
      setResultImg(data.imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="interactive-demo-container" style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* UPLOAD BOX */}
      <div className="demo-box hover-zoom" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '24px', padding: '1.5rem', width: '280px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <h4 style={{ color: '#fff', textAlign: 'center', marginBottom: '1.2rem', fontSize: '1rem', fontWeight: 600 }}>1. Carica Abito</h4>
        <div 
          onClick={() => fileRef.current?.click()}
          style={{ width: '100%', aspectRatio: '3/4', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.3s' }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
        >
          {reference ? (
             <img src={reference.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Reference" />
          ) : (
             <div style={{ textAlign: 'center', color: '#888' }}><Upload size={28} style={{ margin: '0 auto 12px' }} /> <span style={{ fontSize: '0.85rem' }}>Clicca o Trascina<br/>JPG / PNG</span></div>
          )}
        </div>
        <input type="file" ref={fileRef} className="hidden" accept="image/jpeg, image/png" onChange={handleFile} style={{ display: 'none' }} />
        
        <button 
          onClick={handleGenerate} 
          disabled={!reference || generating}
          style={{ width: '100%', marginTop: '1.5rem', background: reference && !generating ? '#fff' : 'rgba(255,255,255,0.1)', color: reference && !generating ? '#000' : '#888', border: 'none', padding: '1rem', borderRadius: '12px', cursor: reference && !generating ? 'pointer' : 'not-allowed', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }}
        >
          {generating ? <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : '⚡ Genera Magia'}
        </button>
      </div>

      {/* RESULT BOX */}
      <div className="demo-box hover-zoom" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '24px', padding: '1.5rem', width: '280px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <h4 style={{ color: '#fff', textAlign: 'center', marginBottom: '1.2rem', fontSize: '1rem', fontWeight: 600 }}>2. Risultato AI</h4>
        <div style={{ width: '100%', aspectRatio: '3/4', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          {generating ? (
            <div style={{ color: '#ffb300', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <Loader2 size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
               <span style={{ fontSize: '0.85rem', marginTop: '15px', fontWeight: 500, color: '#aaa' }}>L'AI sta generando...</span>
            </div>
          ) : error ? (
            <div style={{ color: '#ff5f56', textAlign: 'center', padding: '1.5rem' }}><AlertCircle size={28} style={{ margin: '0 auto 10px' }} /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>
          ) : resultImg ? (
             <img src={resultImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Result" />
          ) : (
             <div style={{ textAlign: 'center', color: '#444' }}><ImageIcon size={28} style={{ margin: '0 auto 12px' }} /> <span style={{ fontSize: '0.85rem' }}>Genera per vedere<br/>il risultato</span></div>
          )}
        </div>
      </div>
      
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
