import React from 'react';
import { prisma } from '@/lib/prisma';
import { Sparkles } from 'lucide-react';
import DressInteractiveClient from './DressInteractiveClient';

export default async function DressEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  async function fetchAllImagesGrouped() {
    const jobs = await prisma.generationJob.findMany({
      where: {
        category: { slug: 'dress' },
        status: 'completed',
        results_count: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { 
          business_mode: true,
          subcategory: true,
          images: { orderBy: { image_order: 'asc' } } 
      }
    });

    const grouped: Record<string, Record<string, string[]>> = {};

    for (const job of jobs) {
        if (!job.business_mode || !job.subcategory) continue;
        const mode = job.business_mode.name;
        const sub = job.subcategory.name;
        
        if (!grouped[mode]) grouped[mode] = {};
        if (!grouped[mode][sub]) grouped[mode][sub] = [];
        
        if (grouped[mode][sub].length < 10) {
            const urls = job.images.map((img: any) => img.image_url);
            grouped[mode][sub] = grouped[mode][sub].concat(urls);
        }
    }

    return grouped;
  }

  const groupedImages = await fetchAllImagesGrouped();

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

        <DressInteractiveClient lang={lang} imagesByMode={groupedImages as any} />

      </div>
    </section>
  );
}
