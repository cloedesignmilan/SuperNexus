import React from 'react';
import { Sparkles } from 'lucide-react';
import DressInteractiveClient from './DressInteractiveClient';
import { getCuratedLandingData } from '@/lib/getCuratedLandingData';

export default async function DressEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  const groupedImages = await getCuratedLandingData('dress');

  const t = {
    title: lang === 'it' ? 'Costruito per la Cerimonia e gli Abiti' : 'Built for Ceremony and Dresses',
    subtitle: lang === 'it' ? 'L\'eleganza perfetta in ogni contesto. Tutto partendo da una singola foto.' : 'Perfect elegance in every context. All starting from a single photo.'
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
        src="/vetrina-landing/dress/Detail%20-%20Texture/No%20Model/Woman/shoot4.webp" 
        alt="Dress Texture"
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
            <Sparkles size={16} /> Ceremony Focus
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
