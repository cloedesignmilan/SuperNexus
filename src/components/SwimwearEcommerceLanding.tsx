import React from 'react';
import { prisma } from '@/lib/prisma';
import { Waves } from 'lucide-react';
import SwimwearInteractiveClient from './SwimwearInteractiveClient';

export default async function SwimwearEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  async function fetchAllImagesGrouped() {
    const jobs = await prisma.generationJob.findMany({
      where: {
        category: { slug: 'swimwear' },
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
    title: lang === 'it' ? 'Costruito per i Brand di Costumi' : 'Built for Swimwear Brands',
    subtitle: lang === 'it' ? 'Dallo still life all\'indossato in spiaggia. Tutto da una singola foto.' : 'From still life to beach wear. All from a single photo.'
  };

  return (
    <section style={{ padding: '8rem 5%', background: '#0a0a0c', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
