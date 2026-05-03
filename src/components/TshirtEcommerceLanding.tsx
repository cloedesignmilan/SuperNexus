import React from 'react';
import { prisma } from '@/lib/prisma';
import { Shirt } from 'lucide-react';
import TshirtInteractiveClient from './TshirtInteractiveClient';

export default async function TshirtEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  async function fetchLatestImagesForMode(modeName: string) {
    const job = await prisma.generationJob.findFirst({
      where: {
        category: { slug: 't-shirt' },
        business_mode: { name: modeName },
        status: 'completed',
        results_count: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { image_order: 'asc' } } }
    });
    return job?.images?.map((img: any) => img.image_url) || [];
  }

  const cleanCatalogImages = await fetchLatestImagesForMode('Clean Catalog');
  const modelStudioImages = await fetchLatestImagesForMode('Model Studio');
  const lifestyleImages = await fetchLatestImagesForMode('Lifestyle');
  const ugcImages = await fetchLatestImagesForMode('UGC');
  const adsImages = await fetchLatestImagesForMode('Ads / Scroll Stopper');

  const fallbackImages = [
    'https://placehold.co/400x500/111/fff?text=Shot+1',
    'https://placehold.co/400x500/111/fff?text=Shot+2',
    'https://placehold.co/400x500/111/fff?text=Shot+3',
    'https://placehold.co/400x500/111/fff?text=Shot+4',
    'https://placehold.co/400x500/111/fff?text=Shot+5',
  ];

  function padWithFallbacks(images: string[]) {
      if (images.length === 0) return fallbackImages;
      if (images.length >= 5) return images.slice(0, 5);
      const padded = [...images];
      while (padded.length < 5) {
          padded.push(fallbackImages[padded.length]);
      }
      return padded;
  }

  const imagesByMode = {
      'Clean Catalog': padWithFallbacks(cleanCatalogImages),
      'Model Studio': padWithFallbacks(modelStudioImages),
      'Lifestyle': padWithFallbacks(lifestyleImages),
      'UGC': padWithFallbacks(ugcImages),
      'Ads / Scroll Stopper': padWithFallbacks(adsImages),
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
