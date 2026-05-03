import React from 'react';
import { prisma } from '@/lib/prisma';
import { Shirt, Camera, Smartphone, Box, Zap, User } from 'lucide-react';

export default async function TshirtEcommerceLanding({ lang }: { lang: 'it' | 'en' }) {
  // Fetch latest still-life/clean catalog t-shirt images
  const latestTshirtJob = await prisma.generationJob.findFirst({
    where: { 
        subcategory: { name: 'STILL LIFE PACK' }
    },
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { image_order: 'asc' } } }
  });

  const recentImages: string[] = latestTshirtJob?.images.map((img: any) => img.image_url) || [
    'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
    'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
    'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
    'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
    'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
  ];

  const t = {
    title: lang === 'it' ? 'Costruito per i Brand di T-Shirt' : 'Built for T-Shirt Brands',
    subtitle: lang === 'it' ? 'Tutte le possibilità di scatto di cui il tuo e-commerce ha bisogno, partendo da una singola foto.' : 'Every shot possibility your e-commerce needs, starting from a single photo.',
    modes: [
      { name: 'Clean Catalog', icon: Box, desc: lang === 'it' ? 'Still Life & Ghost Mannequin' : 'Still Life & Ghost Mannequin' },
      { name: 'Model Studio', icon: User, desc: lang === 'it' ? 'Modelli in studio pulito' : 'Models in clean studio' },
      { name: 'Lifestyle', icon: Camera, desc: lang === 'it' ? 'Contesti urbani e reali' : 'Urban and real contexts' },
      { name: 'UGC', icon: Smartphone, desc: lang === 'it' ? 'Stile influencer e selfie' : 'Influencer & selfie style' },
      { name: 'Ads / Scroll Stopper', icon: Zap, desc: lang === 'it' ? 'Creatività per campagne' : 'Creatives for ad campaigns' },
    ]
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

        {/* RECENT GENERATIONS SHOWCASE */}
        <div style={{ background: '#111', borderRadius: '24px', padding: '2rem', border: '1px solid #222', marginBottom: '4rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#03dac6', boxShadow: '0 0 10px #03dac6' }}></span>
                Live Generations: Clean Catalog &gt; STILL LIFE PACK
            </h3>
            
            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin', scrollbarColor: '#333 #111' }}>
                {recentImages.slice(0, 5).map((img: string, idx: number) => (
                    <div key={idx} style={{ flexShrink: 0, width: '280px', height: '373px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Shot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Shot {idx + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* MACROCATEGORY CHOICES */}
        <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', textAlign: 'center', marginBottom: '2rem' }}>
            {lang === 'it' ? 'Esplora tutti gli stili' : 'Explore all styles'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {t.modes.map((mode, i) => (
                <div key={i} style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'center', transition: 'transform 0.3s ease, border-color 0.3s ease', cursor: 'pointer' }} className="hover-scale">
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                        <mode.icon size={28} color="#fff" />
                    </div>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>{mode.name}</h4>
                    <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.5 }}>{mode.desc}</p>
                </div>
            ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-scale:hover {
            transform: translateY(-5px);
            border-color: rgba(255,255,255,0.3) !important;
        }
      `}} />
    </section>
  );
}
