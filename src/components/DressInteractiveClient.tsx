"use client";

import React, { useState } from 'react';
import { Camera, Smartphone, Box, User, Ghost, PackageOpen, Heart, Sun, Home, ShoppingBag, Sparkles } from 'lucide-react';
import FlipCardWow from './FlipCardWow';

interface Props {
  lang: 'it' | 'en';
  imagesByMode: Record<string, Record<string, string[]>>;
}

export default function DressInteractiveClient({ lang, imagesByMode }: Props) {
  const [selectedMode, setSelectedMode] = useState('Clean Catalog');
  const [selectedSub, setSelectedSub] = useState<Record<string, string>>({
      'Clean Catalog': 'No Model',
      'Model Studio': 'Model Photo',
      'Lifestyle': 'Model Photo',
      'UGC': 'UGC in Home'
  });

  const modes = [
    { 
        name: 'Clean Catalog', icon: Box, desc: lang === 'it' ? 'Abiti scontornati' : 'Clean cutout dresses',
        subs: [
            { name: 'No Model', icon: Ghost },
            { name: 'STILL LIFE PACK', icon: PackageOpen }
        ]
    },
    { 
        name: 'Model Studio', icon: User, desc: lang === 'it' ? 'Modelli in studio pulito' : 'Models in clean studio',
        subs: [
            { name: 'Model Photo', icon: User },
            { name: 'Curvy / Plus Size', icon: Heart }
        ]
    },
    { 
        name: 'Lifestyle', icon: Camera, desc: lang === 'it' ? 'Contesti urbani e reali' : 'Urban and real contexts',
        subs: [
            { name: 'Model Photo', icon: Camera },
            { name: 'Candid', icon: Sun }
        ]
    },
    { 
        name: 'UGC', icon: Smartphone, desc: lang === 'it' ? 'Stile influencer e selfie' : 'Influencer & selfie style',
        subs: [
            { name: 'UGC in Home', icon: Home },
            { name: 'UGC in Store', icon: ShoppingBag },
            { name: 'Candid', icon: Smartphone }
        ]
    },
    {
        name: 'Ads / Scroll Stopper', icon: Sparkles, desc: lang === 'it' ? 'Pubblicità d\'impatto' : 'High impact ads',
        subs: [
            { name: 'Model Photo', icon: User },
            { name: 'No Model', icon: Ghost }
        ]
    },
    {
        name: 'Detail / Texture', icon: Camera, desc: lang === 'it' ? 'Dettagli e tessuti' : 'Details and fabrics',
        subs: [
            { name: 'Model Photo', icon: User },
            { name: 'No Model', icon: Ghost }
        ]
    }
  ];

  const activeModes = modes.filter(mode => mode.subs.some(sub => (imagesByMode[mode.name]?.[sub.name]?.length || 0) > 0));

  if (activeModes.length === 0) {
      return null; // Hide the whole section if no images exist at all
  }

  const validSelectedMode = activeModes.find(m => m.name === selectedMode) ? selectedMode : activeModes[0].name;
  const activeModeObj = activeModes.find(m => m.name === validSelectedMode)!;
  const activeSubs = activeModeObj.subs.filter(sub => (imagesByMode[validSelectedMode]?.[sub.name]?.length || 0) > 0);

  const currentActiveSub = selectedSub[validSelectedMode] && activeSubs.find(s => s.name === selectedSub[validSelectedMode])
      ? selectedSub[validSelectedMode]
      : activeSubs[0].name;

  const currentImages = imagesByMode[validSelectedMode]?.[currentActiveSub]?.slice(0, 10) || [];

  return (
    <>
      <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem' }}>
          {lang === 'it' ? 'Esplora tutti gli stili' : 'Explore all styles'}
      </h3>
      
      {/* MACROCATEGORY CHOICES */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {activeModes.map((mode, i) => (
              <button 
                  key={i} 
                  onClick={() => setSelectedMode(mode.name)}
                  style={{ 
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '90px',
                      height: '90px',
                      background: validSelectedMode === mode.name ? 'linear-gradient(135deg, rgba(204,255,0,0.15) 0%, rgba(204,255,0,0.05) 100%)' : 'rgba(255,255,255,0.02)', 
                      border: validSelectedMode === mode.name ? '1px solid rgba(204,255,0,0.4)' : '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: '16px', 
                      padding: '0.5rem',
                      textAlign: 'center', 
                      transition: 'all 0.3s ease', 
                      cursor: 'pointer',
                      boxShadow: validSelectedMode === mode.name ? '0 5px 15px rgba(204, 255, 0, 0.15)' : 'none'
                  }} 
                  className={validSelectedMode !== mode.name ? "hover-scale" : ""}
              >
                  <mode.icon size={24} style={{ marginBottom: '8px' }} color={validSelectedMode === mode.name ? "#ccff00" : "#888"} />
                  <span style={{ color: validSelectedMode === mode.name ? '#ccff00' : '#888', fontSize: '0.75rem', fontWeight: validSelectedMode === mode.name ? '700' : '500', transition: 'color 0.3s ease', lineHeight: 1.1 }}>{mode.name}</span>
              </button>
          ))}

          {/* DIVIDER */}
          {activeModeObj && activeSubs.length > 0 && (
              <div style={{ flexShrink: 0, width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }}></div>
          )}

          {/* SUB-STYLE CHOICES (Merged into same row) */}
          {activeModeObj && activeSubs.map((sub, i) => {
              const isActive = currentActiveSub === sub.name;
              return (
                  <button
                      key={`sub-${i}`}
                      onClick={() => setSelectedSub(prev => ({ ...prev, [validSelectedMode]: sub.name }))}
                      style={{
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '90px',
                          height: '90px',
                          borderRadius: '14px',
                          background: isActive ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)' : 'rgba(255,255,255,0.02)',
                          color: isActive ? '#fff' : '#888',
                          border: isActive ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: isActive ? '0 5px 15px rgba(255, 255, 255, 0.1)' : 'none'
                      }}
                      className={!isActive ? "hover-sub-icon" : ""}
                  >
                      <sub.icon size={22} style={{ marginBottom: '6px' }} color={isActive ? '#fff' : '#888'} />
                      <span style={{ fontSize: '0.7rem', fontWeight: isActive ? '700' : '500', textAlign: 'center', lineHeight: 1.1 }}>{sub.name}</span>
                  </button>
              );
          })}
      </div>

      {/* RECENT GENERATIONS SHOWCASE */}
      <div style={{ background: '#111', borderRadius: '24px', padding: '2rem', border: '1px solid #222', marginBottom: '4rem', transition: 'all 0.3s ease' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ccff00', boxShadow: '0 0 10px #ccff00' }}></span>
              Live Generations: {validSelectedMode} &gt; {currentActiveSub}
          </h3>
          
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin', scrollbarColor: '#333 #111' }}>
              {currentImages.length >= 10 ? (
                  // Se abbiamo almeno 10 immagini, presumiamo che 1-5 siano gli originali e 6-10 siano i generati per l'effetto WOW
                  Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx + validSelectedMode + currentActiveSub} className="fade-in-image" style={{ flexShrink: 0, width: '280px', height: '373px', borderRadius: '12px', overflow: 'visible', position: 'relative' }}>
                          <FlipCardWow beforeImage={currentImages[idx]} afterImage={currentImages[idx + 5]} lang={lang} />
                      </div>
                  ))
              ) : (
                  // Fallback normale se ci sono meno di 10 immagini
                  currentImages.map((img, idx) => (
                      <div key={idx + validSelectedMode + currentActiveSub} className="fade-in-image" style={{ flexShrink: 0, width: '280px', height: '373px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Shot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              Shot {idx + 1}
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
        }
        .hover-scale:hover {
            transform: translateY(-5px);
            border-color: rgba(255,255,255,0.3) !important;
        }
        .hover-sub-icon:hover {
            background: rgba(255,255,255,0.06) !important;
            border-color: rgba(255,255,255,0.2) !important;
            color: #ddd !important;
        }
        .fade-in-image {
            animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0.3; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </>
  );
}
