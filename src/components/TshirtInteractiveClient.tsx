"use client";

import React, { useState } from 'react';
import { Camera, Smartphone, Box, Zap, User } from 'lucide-react';

interface Props {
  lang: 'it' | 'en';
  imagesByMode: Record<string, string[]>;
}

export default function TshirtInteractiveClient({ lang, imagesByMode }: Props) {
  const [selectedMode, setSelectedMode] = useState('Clean Catalog');

  const modes = [
    { name: 'Clean Catalog', icon: Box, desc: lang === 'it' ? 'Still Life & Ghost Mannequin' : 'Still Life & Ghost Mannequin' },
    { name: 'Model Studio', icon: User, desc: lang === 'it' ? 'Modelli in studio pulito' : 'Models in clean studio' },
    { name: 'Lifestyle', icon: Camera, desc: lang === 'it' ? 'Contesti urbani e reali' : 'Urban and real contexts' },
    { name: 'UGC', icon: Smartphone, desc: lang === 'it' ? 'Stile influencer e selfie' : 'Influencer & selfie style' },
  ];

  const currentImages = imagesByMode[selectedMode] || imagesByMode['Clean Catalog'];

  return (
    <>
      {/* RECENT GENERATIONS SHOWCASE */}
      <div style={{ background: '#111', borderRadius: '24px', padding: '2rem', border: '1px solid #222', marginBottom: '4rem', transition: 'all 0.3s ease' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#03dac6', boxShadow: '0 0 10px #03dac6' }}></span>
              Live Generations: {selectedMode}
          </h3>
          
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin', scrollbarColor: '#333 #111' }}>
              {currentImages.map((img, idx) => (
                  <div key={idx + selectedMode} className="fade-in-image" style={{ flexShrink: 0, width: '280px', height: '373px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Shot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Shot {idx + 1}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* MACROCATEGORY CHOICES */}
      <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem' }}>
          {lang === 'it' ? 'Esplora tutti gli stili' : 'Explore all styles'}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {modes.map((mode, i) => (
              <div 
                  key={i} 
                  onClick={() => setSelectedMode(mode.name)}
                  style={{ 
                      background: selectedMode === mode.name ? 'rgba(3, 218, 198, 0.1)' : 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', 
                      border: selectedMode === mode.name ? '1px solid #03dac6' : '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '16px', 
                      padding: '2rem 1.5rem', 
                      textAlign: 'center', 
                      transition: 'all 0.3s ease', 
                      cursor: 'pointer',
                      transform: selectedMode === mode.name ? 'translateY(-5px)' : 'none',
                      boxShadow: selectedMode === mode.name ? '0 10px 20px rgba(3, 218, 198, 0.1)' : 'none'
                  }} 
                  className={selectedMode !== mode.name ? "hover-scale" : ""}
              >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: selectedMode === mode.name ? 'rgba(3, 218, 198, 0.2)' : 'rgba(255,255,255,0.05)', marginBottom: '1.5rem', transition: 'all 0.3s ease' }}>
                      <mode.icon size={28} color={selectedMode === mode.name ? "#03dac6" : "#fff"} />
                  </div>
                  <h4 style={{ color: selectedMode === mode.name ? '#03dac6' : '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', transition: 'color 0.3s ease' }}>{mode.name}</h4>
                  <p style={{ color: selectedMode === mode.name ? '#aaa' : '#888', fontSize: '0.9rem', lineHeight: 1.5 }}>{mode.desc}</p>
              </div>
          ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-scale:hover {
            transform: translateY(-5px);
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
