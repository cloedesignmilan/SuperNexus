'use client';

import React from 'react';
import { Smartphone, Monitor, Square, Layers, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { dictionaries, Locale } from '@/lib/i18n/dictionaries';

export default function DimensionsGuide({ lang = 'en' }: { lang?: Locale }) {
  const t = dictionaries[lang].dimensionsGuide;

  const dimensions = [
    {
      ratio: "9:16",
      name: t.card1.title,
      icon: <Smartphone size={24} color="#ccff00" />,
      desc: t.card1.desc,
      images: t.imagesGen,
      borderColor: "#ccff00",
      layoutClass: "ratio-9-16",
      exampleImg: "/immagini/9-16.webp", 
      aspect: "9/16"
    },
    {
      ratio: "1:1",
      name: t.card2.title,
      icon: <Square size={24} color="#00ffff" />,
      desc: t.card2.desc,
      images: t.imagesGen,
      borderColor: "#00ffff",
      layoutClass: "ratio-1-1",
      exampleImg: "/immagini/1-1.webp", 
      aspect: "1/1"
    },
    {
      ratio: "4:5",
      name: t.card3.title,
      icon: <Layers size={24} color="#ff0ab3" />,
      desc: t.card3.desc,
      images: t.imagesGen,
      borderColor: "#ff0ab3",
      layoutClass: "ratio-4-5",
      exampleImg: "/immagini/4-5.webp", 
      aspect: "4/5"
    },
    {
      ratio: "16:9",
      name: t.card4.title,
      icon: <Monitor size={24} color="#bb86fc" />,
      desc: t.card4.desc,
      images: t.imagesGen,
      borderColor: "#bb86fc",
      layoutClass: "ratio-16-9",
      exampleImg: "/immagini/16-9.webp", 
      aspect: "16/9"
    }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dimBorderSpin {
          100% { transform: rotate(360deg); }
        }
        .dim-wow-border {
          position: relative;
          border-radius: 26px;
          padding: 2px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          background: rgba(255,255,255,0.03);
        }
        .dim-wow-border::before {
          content: "";
          position: absolute;
          top: -50%; left: -50%; right: -50%; bottom: -50%;
          background: conic-gradient(transparent, transparent, transparent, var(--border-color));
          animation: dimBorderSpin 4s linear infinite;
        }
        .dim-wow-inner {
          position: relative;
          background: #111111;
          border-radius: 24px;
          height: 100%;
          z-index: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
        }
      `}} />
    <section className="dimensions-section" style={{ padding: '8rem 5%', background: '#050505', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Sparkles size={16} color="#00ffff" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e0e0e0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{t.badge}</span>
        </div>
        
        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff', lineHeight: 1.1 }}>
          {t.title1}<br/><span style={{ color: '#00ffff' }}>{t.title2}</span>
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '650px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
          {t.subtitle}
        </p>

        <div className="dimensions-grid">
          {dimensions.map((dim, i) => (
            <div key={i} className="dim-wow-border" style={{ 
              '--border-color': dim.borderColor 
            } as React.CSSProperties}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${dim.borderColor}33`;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
            }}
            >
              <div className="dim-wow-inner" style={{ padding: '1.5rem' }}>
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
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .dimensions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        @media (max-width: 768px) {
          .dimensions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </section>
  );
}
