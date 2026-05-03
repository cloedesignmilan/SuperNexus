import React from 'react';
import { prisma } from '@/lib/prisma';
import { Shirt } from 'lucide-react';
import TshirtInteractiveClient from './TshirtInteractiveClient';

export default async function TshirtEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  // Fetch latest still-life/clean catalog t-shirt images
  const latestTshirtJob = await prisma.generationJob.findFirst({
    where: { 
        subcategory: { name: 'STILL LIFE PACK' },
        status: 'completed'
    },
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { image_order: 'asc' } } }
  });

  const recentImages: string[] = latestTshirtJob?.images?.map((img: any) => img.image_url) || [];

  const fallbackImages = [
    'https://placehold.co/400x500/111/fff?text=Shot+1',
    'https://placehold.co/400x500/111/fff?text=Shot+2',
    'https://placehold.co/400x500/111/fff?text=Shot+3',
    'https://placehold.co/400x500/111/fff?text=Shot+4',
    'https://placehold.co/400x500/111/fff?text=Shot+5',
  ];

  const imagesByMode = {
      'Clean Catalog': recentImages.length > 0 ? recentImages : fallbackImages,
      'Model Studio': fallbackImages,
      'Lifestyle': fallbackImages,
      'UGC': fallbackImages,
      'Ads / Scroll Stopper': fallbackImages,
  };

  const t = {
    title: lang === 'it' ? 'Costruito per i Brand di T-Shirt' : 'Built for T-Shirt Brands',
    subtitle: lang === 'it' ? 'Tutte le possibilità di scatto di cui il tuo e-commerce ha bisogno, partendo da una singola foto.' : 'Every shot possibility your e-commerce needs, starting from a single photo.'
  };

  return (
    <section style={{ padding: '8rem 5%', background: '#0a0a0c', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', background: 'rgba(255, 84, 112, 0.1)', border: '1px solid rgba(255, 84, 112, 0.3)', borderRadius: '100px', color: '#ff5470', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            <Shirt size={16} /> T-Shirt Focus
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1, marginBottom: '1rem' }}>
            {t.title}
          </h2>
          <p style={{ color: '#888', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            {t.subtitle}
          </p>
        </div>

        <TshirtInteractiveClient lang={lang} imagesByMode={imagesByMode} />

      </div>
    </section>
  );
}
