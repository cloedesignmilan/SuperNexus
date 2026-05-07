"use client";
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function FlipCardWow({ beforeImage, afterImage, lang = 'en' }: { beforeImage: string, afterImage: string, lang?: 'it' | 'en' }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const upperPath = afterImage.toUpperCase();
  const isMan = upperPath.includes('/MAN/') || upperPath.includes('/UOMO/');
  
  // Default to Woman since most catalog is female, unless it's explicitly marked as man
  let hoverText = lang === 'it' ? 'PASSA SOPRA PER DONNA' : 'HOVER FOR WOMAN';
  if (isMan) hoverText = lang === 'it' ? 'PASSA SOPRA PER UOMO' : 'HOVER FOR MAN';

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        perspective: '1000px',
        cursor: 'pointer'
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setIsFlipped(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setIsFlipped(false);
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transition: 'transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1)',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        
        {/* Front (Original) */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          backgroundColor: '#111'
        }}>
          <img 
            src={beforeImage} 
            alt="Original" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ 
            position: 'absolute', 
            bottom: '15px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)', 
            color: '#fff', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '600',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}>
            {hoverText}
          </div>
        </div>

        {/* Back (Generated) */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          backgroundColor: '#111',
          transform: 'rotateY(180deg)'
        }}>
          <img 
            src={afterImage} 
            alt="Generated" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          
          {/* Glowing Border on Back */}
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid #ccff00',
            borderRadius: '12px',
            boxShadow: 'inset 0 0 20px rgba(204,255,0,0.3), 0 0 20px rgba(204,255,0,0.3)',
            pointerEvents: 'none'
          }} />

          <div style={{ 
            position: 'absolute', 
            bottom: '15px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            background: 'rgba(204,255,0,0.9)', 
            color: '#000', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(204,255,0,0.4)'
          }}>
            <Sparkles size={14} /> WOW EFFECT
          </div>
        </div>
      </div>
    </div>
  );
}
