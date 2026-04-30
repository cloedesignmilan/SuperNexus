'use client';

import React from 'react';
import { Smartphone, Monitor, Square, Layers, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function DimensionsGuide() {
  const dimensions = [
    {
      ratio: "9:16",
      name: "Social Verticale",
      icon: <Smartphone size={24} color="#ccff00" />,
      desc: "Ideale per Reels, TikTok, Shorts e Storie. Massimo impatto mobile.",
      images: "4 Immagini generate",
      borderColor: "#ccff00",
      layoutClass: "ratio-9-16",
      exampleImg: "/immagini/IMG_2058.webp", // Vert shape example
      aspect: "9/16"
    },
    {
      ratio: "1:1",
      name: "Quadrato Perfetto",
      icon: <Square size={24} color="#00ffff" />,
      desc: "Il formato classico per Post Instagram, Caroselli e Cataloghi E-commerce.",
      images: "4 Immagini generate",
      borderColor: "#00ffff",
      layoutClass: "ratio-1-1",
      exampleImg: "/immagini/IMG_2060.webp", // Square-ish example
      aspect: "1/1"
    },
    {
      ratio: "4:5",
      name: "Ritratto Premium",
      icon: <Layers size={24} color="#ff0ab3" />,
      desc: "Il formato che occupa più spazio nel feed dei Social. Perfetto per l'alta moda.",
      images: "4 Immagini generate",
      borderColor: "#ff0ab3",
      layoutClass: "ratio-4-5",
      exampleImg: "/immagini/IMG_2052.webp", 
      aspect: "4/5"
    },
    {
      ratio: "16:9",
      name: "Desktop & Landscape",
      icon: <Monitor size={24} color="#bb86fc" />,
      desc: "Orientamento orizzontale per YouTube, Copertine e Banner per Siti Web.",
      images: "4 Immagini generate",
      borderColor: "#bb86fc",
      layoutClass: "ratio-16-9",
      exampleImg: "/immagini/IMG_2067.webp", // Wide-ish example
      aspect: "16/9"
    }
  ];

  return (
    <section className="dimensions-section" style={{ padding: '8rem 5%', background: '#050505', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Sparkles size={16} color="#00ffff" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e0e0e0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Flessibilità Totale</span>
        </div>
        
        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff', lineHeight: 1.1 }}>
          Scegli il Formato. <br/><span style={{ color: '#00ffff' }}>Noi Creiamo la Magia.</span>
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '650px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
          Non sei limitato a un solo stile. Seleziona le dimensioni esatte per la tua destinazione d'uso. Generiamo automaticamente 4 variazioni ad altissima risoluzione per offrirti la massima scelta.
        </p>

        <div className="dimensions-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          {dimensions.map((dim, i) => (
            <div key={i} className="dimension-card" style={{
              background: '#111111',
              borderRadius: '24px',
              padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              textAlign: 'left'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.borderColor = dim.borderColor;
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${dim.borderColor}22`;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
            }}
            >
              {/* Image Preview Area */}
              <div style={{
                width: '100%',
                height: '240px',
                background: '#1a1a1a',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                 <div style={{
                     position: 'relative',
                     width: 'auto',
                     height: '80%',
                     aspectRatio: dim.aspect,
                     borderRadius: '8px',
                     overflow: 'hidden',
                     border: `2px solid ${dim.borderColor}`,
                     boxShadow: `0 0 20px ${dim.borderColor}44`
                 }}>
                     <Image 
                        src={dim.exampleImg} 
                        alt={dim.name}
                        fill
                        style={{ objectFit: 'cover' }}
                     />
                 </div>
                 
                 {/* Decorative Ratio Label */}
                 <div style={{
                     position: 'absolute',
                     top: '12px',
                     right: '12px',
                     background: 'rgba(0,0,0,0.7)',
                     backdropFilter: 'blur(10px)',
                     padding: '4px 10px',
                     borderRadius: '100px',
                     fontSize: '0.8rem',
                     fontWeight: '700',
                     color: '#fff',
                     border: `1px solid ${dim.borderColor}`
                 }}>
                     {dim.ratio}
                 </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}>
                      {dim.icon}
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>{dim.name}</h3>
              </div>
              
              <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                  {dim.desc}
              </p>
              
              <div style={{ 
                marginTop: 'auto', 
                background: 'rgba(255,255,255,0.03)', 
                padding: '0.8rem', 
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#aaa',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {dim.images}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
