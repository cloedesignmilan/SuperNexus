import React from 'react';
import { prisma } from '@/lib/prisma';
import { Sparkles } from 'lucide-react';
import DressInteractiveClient from './DressInteractiveClient';

export default async function DressEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  async function fetchLatestImagesForMode(modeName: string) {
    const jobs = await prisma.generationJob.findMany({
      where: {
        category: { slug: 'dress' },
        business_mode: { name: modeName },
        status: 'completed',
        results_count: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: { images: { orderBy: { image_order: 'asc' } } }
    });
    
    let allImages: string[] = [];
    for (const job of jobs) {
        if (job.images) {
            allImages = allImages.concat(job.images.map((img: any) => img.image_url));
        }
    }
    return allImages;
  }

  const cleanCatalogImages = await fetchLatestImagesForMode('Clean Catalog');
  const modelStudioImages = await fetchLatestImagesForMode('Model Studio');
  const lifestyleImages = await fetchLatestImagesForMode('Lifestyle');
  const ugcImages = await fetchLatestImagesForMode('UGC');

  const fallbackImages = [
    'https://placehold.co/400x500/111/fff?text=Shot+1',
    'https://placehold.co/400x500/111/fff?text=Shot+2',
    'https://placehold.co/400x500/111/fff?text=Shot+3',
    'https://placehold.co/400x500/111/fff?text=Shot+4',
    'https://placehold.co/400x500/111/fff?text=Shot+5',
  ];

  function padWithFallbacks(images: string[]) {
      if (images.length === 0) return fallbackImages;
      return images;
  }

  const imagesByMode = {
      'Clean Catalog': padWithFallbacks(cleanCatalogImages),
      'Model Studio': padWithFallbacks(modelStudioImages),
      'Lifestyle': padWithFallbacks(lifestyleImages),
      'UGC': padWithFallbacks(ugcImages),
  };

  const t = {
    title: lang === 'it' ? 'Costruito per la Cerimonia e gli Abiti' : 'Built for Ceremony and Dresses',
    subtitle: lang === 'it' ? 'L\'eleganza perfetta in ogni contesto. Tutto partendo da una singola foto.' : 'Perfect elegance in every context. All starting from a single photo.'
  };

  return (
    <section style={{ padding: '8rem 5%', background: '#0a0a0c', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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

        <DressInteractiveClient lang={lang} imagesByMode={imagesByMode} />

      </div>
    </section>
  );
}
