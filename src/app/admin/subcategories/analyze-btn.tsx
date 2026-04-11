"use client";

import { useState } from "react";
import { runVisionAnalysis } from "./actions";

export function AnalyzeButton({ subcategoryId }: { subcategoryId: string }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await runVisionAnalysis(subcategoryId);
    } catch (err: any) {
      alert(`Errore Analisi: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <button 
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      className="btn-action-amber" 
      style={{ 
        padding: '0.5rem 1rem', 
        background: isAnalyzing ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.2)', 
        color: isAnalyzing ? '#fff' : '#fbbf24', 
        border: '1px solid rgba(245,158,11,0.3)', 
        borderRadius: '6px', 
        fontSize: '0.7rem', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em', 
        cursor: isAnalyzing ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      {isAnalyzing ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }}></div>
          Estrazione Modello in Corso...
        </span>
      ) : (
        "Attiva Motore Vision"
      )}
    </button>
  );
}
