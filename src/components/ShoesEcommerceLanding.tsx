import React from 'react';
import { Footprints } from 'lucide-react';
import DressInteractiveClient from './DressInteractiveClient';
import { getCuratedLandingData } from '@/lib/getCuratedLandingData';

export default async function ShoesEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  const groupedImages = await getCuratedLandingData('shoes');

  const t = {
    title: lang === 'it' ? 'Costruito per le Scarpe e Sneakers' : 'Built for Shoes and Sneakers',
    subtitle: lang === 'it' ? 'Dettagli perfetti in ogni angolazione. Tutto partendo da una singola foto.' : 'Perfect detail in every angle. All starting from a single photo.'
  };

  return (
    <section style={{ 
      position: 'relative',
      padding: '8rem 5%', 
      backgroundColor: '#050505', 
      borderTop: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden'
    }}>
      <img 
        src="/vetrina-landing/shoes/shoes_bg.webp" 
        alt="Shoes Texture"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: 0,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
        }}
      />
      <div style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(204, 255, 0, 0.1)', border: '1px solid rgba(204, 255, 0, 0.3)', borderRadius: '100px', color: '#ccff00', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            <Footprints size={16} /> Shoes Focus
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1, marginBottom: '1rem' }}>
            {t.title}
          </h2>
          <p style={{ color: '#888', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            {t.subtitle}
          </p>
        </div>

        <DressInteractiveClient lang={lang} imagesByMode={groupedImages as any} />

      </div>
    </section>
  );
}
