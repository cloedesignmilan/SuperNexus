import React from 'react';
import { Waves } from 'lucide-react';
import SwimwearInteractiveClient from './SwimwearInteractiveClient';
import { getCuratedLandingData } from '@/lib/getCuratedLandingData';

export default async function SwimwearEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  const groupedImages = await getCuratedLandingData('swimwear');

  const t = {
    title: lang === 'it' ? 'Costruito per i Brand di Costumi' : 'Built for Swimwear Brands',
    subtitle: lang === 'it' ? 'Dallo still life all\'indossato in spiaggia. Tutto da una singola foto.' : 'From still life to beach wear. All from a single photo.'
  };

  return (
    <section style={{ 
      position: 'relative',
      padding: '8rem 5% 2rem 5%', 
      backgroundColor: '#0a0a0c', 
      borderTop: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden'
    }}>
      <img 
        src="/vetrina-landing/swimwear/swimwear_bg.webp" 
        alt="Swimwear Texture"
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(3, 218, 198, 0.1)', border: '1px solid rgba(3, 218, 198, 0.3)', borderRadius: '100px', color: '#03dac6', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            <Waves size={16} /> Swimwear Focus
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1, marginBottom: '1rem' }}>
            {t.title}
          </h2>
          <p style={{ color: '#888', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            {t.subtitle}
          </p>
        </div>

        <SwimwearInteractiveClient lang={lang} imagesByMode={groupedImages as any} />

      </div>
    </section>
  );
}
