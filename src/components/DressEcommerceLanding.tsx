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
    <section style={{ padding: '8rem 5% 2rem 5%', background: '#0a0a0c', borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
