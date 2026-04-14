"use client";

import { useTransition } from "react";
import { toggleStrictReferenceMode } from "./actions";

export default function StrictReferenceToggle({ subcategoryId, currentStatus }: { subcategoryId: string, currentStatus: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0.75rem 1rem', 
      background: currentStatus ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${currentStatus ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '8px', 
      marginBottom: '1rem',
      transition: 'all 0.3s ease'
    }}>
      <div>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: currentStatus ? '#f472b6' : 'var(--color-primary)' }}>
          Strict Reference Mode {currentStatus ? "🔒 ATTIVO" : "🦋 LIBERO"}
        </h4>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {currentStatus 
            ? "L'AI genererà pose identiche alla reference (1:1), ignorando variazioni di sistema." 
            : "L'AI mescolerà la scenografia della reference con pose fotografiche casuali (Dinamico)."}
        </p>
      </div>
      <button 
        disabled={isPending}
        onClick={() => startTransition(() => toggleStrictReferenceMode(subcategoryId, currentStatus))}
        style={{
          padding: '0.5rem',
          borderRadius: '20px',
          background: currentStatus ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)',
          color: '#fff',
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: isPending ? 0.7 : 1,
          boxShadow: currentStatus ? '0 0 10px rgba(236, 72, 153, 0.5)' : 'none'
        }}
      >
        <div style={{ 
          width: '40px', height: '20px', 
          background: currentStatus ? '#f472b6' : '#64748b', 
          borderRadius: '10px', 
          position: 'relative',
          transition: 'background 0.3s'
        }}>
          <div style={{
            position: 'absolute',
            top: '2px',
            left: currentStatus ? '22px' : '2px',
            width: '16px',
            height: '16px',
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.3s'
          }}></div>
        </div>
      </button>
    </div>
  );
}
