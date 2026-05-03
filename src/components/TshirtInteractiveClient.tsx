"use client";

import React, { useState } from 'react';
import { Camera, Smartphone, Box, User, Ghost, PackageOpen, Heart, Sun, Home, ShoppingBag } from 'lucide-react';

interface Props {
  lang: 'it' | 'en';
  imagesByMode: Record<string, Record<string, string[]>>;
}

export default function TshirtInteractiveClient({ lang, imagesByMode }: Props) {
  const [selectedMode, setSelectedMode] = useState('Clean Catalog');
  const [selectedSub, setSelectedSub] = useState<Record<string, string>>({
      'Clean Catalog': 'No Model',
      'Model Studio': 'Model Photo',
      'Lifestyle': 'Model Photo',
      'UGC': 'UGC in Home'
  });

  const modes = [
    { 
        name: 'Clean Catalog', icon: Box, desc: lang === 'it' ? 'Still Life & Ghost Mannequin' : 'Still Life & Ghost Mannequin',
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
        name: 'Ads / Scroll Stopper', icon: Zap, desc: lang === 'it' ? 'Pubblicità d\'impatto' : 'High impact ads',
        subs: [
            { name: 'Model Photo', icon: User },
            { name: 'No Model', icon: Ghost }
        ]
    },
    {
        name: 'Detail / Texture', icon: Search, desc: lang === 'it' ? 'Dettagli e tessuti' : 'Details and fabrics',
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

  const currentImages = imagesByMode[validSelectedMode]?.[currentActiveSub] || [];

  return (
    <>
      <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem' }}>
          {lang === 'it' ? 'Esplora tutti gli stili' : 'Explore all styles'}
      </h3>
      
      {/* MACROCATEGORY CHOICES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {activeModes.map((mode, i) => (
              <div 
                  key={i} 
                  onClick={() => setSelectedMode(mode.name)}
                  style={{ 
                      background: validSelectedMode === mode.name ? 'rgba(255, 84, 112, 0.1)' : 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', 
                      border: validSelectedMode === mode.name ? '1px solid #ff5470' : '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '16px', 
                      padding: '2rem 1.5rem', 
                      textAlign: 'center', 
                      transition: 'all 0.3s ease', 
                      cursor: 'pointer',
                      transform: validSelectedMode === mode.name ? 'translateY(-5px)' : 'none',
                      boxShadow: validSelectedMode === mode.name ? '0 10px 20px rgba(255, 84, 112, 0.1)' : 'none'
                  }} 
                  className={validSelectedMode !== mode.name ? "hover-scale" : ""}
              >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: validSelectedMode === mode.name ? 'rgba(255, 84, 112, 0.2)' : 'rgba(255,255,255,0.05)', marginBottom: '1.5rem', transition: 'all 0.3s ease' }}>
                      <mode.icon size={28} color={validSelectedMode === mode.name ? "#ff5470" : "#fff"} />
                  </div>
                  <h4 style={{ color: validSelectedMode === mode.name ? '#ff5470' : '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', transition: 'color 0.3s ease' }}>{mode.name}</h4>
                  <p style={{ color: validSelectedMode === mode.name ? '#aaa' : '#888', fontSize: '0.9rem', lineHeight: 1.5 }}>{mode.desc}</p>
              </div>
          ))}
      </div>

      {/* SUB-STYLE PREMIUM PILLS */}
      {activeModeObj && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '2rem' }}>
              {activeSubs.map((sub, i) => {
                  const isActive = currentActiveSub === sub.name;
                  return (
                      <button
                          key={i}
                          onClick={() => setSelectedSub(prev => ({ ...prev, [validSelectedMode]: sub.name }))}
                          style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '0.8rem 1.5rem',
                              borderRadius: '100px',
                              background: isActive ? '#ff5470' : 'rgba(255,255,255,0.05)',
                              color: isActive ? '#fff' : '#fff',
                              border: isActive ? '1px solid #ff5470' : '1px solid rgba(255,255,255,0.1)',
                              fontSize: '0.9rem',
                              fontWeight: isActive ? '700' : '500',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: isActive ? '0 5px 15px rgba(255, 84, 112, 0.3)' : 'none'
                          }}
                          className={!isActive ? "hover-sub-pill" : ""}
                      >
                          <sub.icon size={16} color={isActive ? '#fff' : '#ff5470'} />
                          {sub.name}
                      </button>
                  );
              })}
          </div>
      )}

      {/* RECENT GENERATIONS SHOWCASE */}
      <div style={{ background: '#111', borderRadius: '24px', padding: '2rem', border: '1px solid #222', marginBottom: '4rem', transition: 'all 0.3s ease' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ff5470', boxShadow: '0 0 10px #ff5470' }}></span>
              Live Generations: {validSelectedMode} &gt; {currentActiveSub}
          </h3>
          
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin', scrollbarColor: '#333 #111' }}>
              {currentImages.map((img, idx) => (
                  <div key={idx + validSelectedMode + currentActiveSub} className="fade-in-image" style={{ flexShrink: 0, width: '280px', height: '373px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Shot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Shot {idx + 1}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-scale:hover {
            transform: translateY(-5px);
            border-color: rgba(255,255,255,0.3) !important;
        }
        .hover-sub-pill:hover {
            background: rgba(255,255,255,0.1) !important;
            border-color: rgba(255,255,255,0.3) !important;
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
