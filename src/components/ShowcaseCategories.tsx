"use client";

import React, { useState } from 'react';
import { 
  Shirt, Footprints, Sparkles, Heart, Briefcase, Baby, 
  Camera, ShoppingBag, Smartphone, Image as ImageIcon,
  Sun, UserCheck, Star, Building, Trees, MapPin
} from 'lucide-react';

const CATEGORY_STRUCTURE = [
  {
    name: "T-Shirt & Knitwear",
    shortName: "T-Shirts",
    icon: <Shirt size={20} className="text-blue-400" />,
    color: "rgba(59, 130, 246, 0.5)",
    border: "rgba(59, 130, 246, 0.8)",
    bgImage: "/prove/Tshirt/Ecommerce Clean/627D75E3-D637-42B7-94EB-1672B1AB8C88.jpeg",
    subcategories: [
      { name: "Streetwear FlatLay", showcaseId: "t-shirt & knitwear-streetwear-flatlay", icon: <Camera size={12} /> },
      { name: "E-Commerce Clean", showcaseId: "t-shirt & knitwear-e-commerce-clean", icon: <ShoppingBag size={12} /> },
      { name: "UGC Content", showcaseId: "t-shirt & knitwear-ugc-(user-generated-content)", icon: <Smartphone size={12} /> },
    ]
  },
  {
    name: "Footwear & Sneakers",
    shortName: "Footwear",
    icon: <Footprints size={20} className="text-orange-400" />,
    color: "rgba(249, 115, 22, 0.5)",
    border: "rgba(249, 115, 22, 0.8)",
    bgImage: "/prove/Donna/Instagram Lifestyle/9D7AAA55-49BF-44F2-AAEE-0C4A60F1ED95.jpeg",
    subcategories: [
      { name: "Women's Sneakers", icon: <Star size={12} /> },
      { name: "Product Clean", showcaseId: "footwear & sneakers-product-clean", icon: <ShoppingBag size={12} /> },
      { name: "Elegant Heels", icon: <Sparkles size={12} /> },
      { name: "On Feet Urban", icon: <MapPin size={12} /> },
    ]
  },
  {
    name: "Women's Fashion",
    shortName: "Women",
    icon: <Sparkles size={20} className="text-purple-400" />,
    color: "rgba(168, 85, 247, 0.5)",
    border: "rgba(168, 85, 247, 0.8)",
    bgImage: "/prove/Donna/Luxury Villa Shoot/195E2086-E0B9-4CBD-B2BB-DDA2D3913BA0.jpeg",
    subcategories: [
      { name: "Mannequin Display", showcaseId: "women's fashion-mannequin-display", icon: <UserCheck size={12} /> },
      { name: "Runway Editorial", showcaseId: "women's fashion-runway-editorial", icon: <Star size={12} /> },
      { name: "Luxury Villa", showcaseId: "women's fashion-luxury-villa-shoot", icon: <Building size={12} /> },
      { name: "Instagram Style", showcaseId: "women's fashion-instagram-lifestyle", icon: <Smartphone size={12} /> },
      { name: "Mature Sophistication", showcaseId: "women's fashion-mature-sophistication", icon: <Heart size={12} /> },
      { name: "Gym & Fitness", showcaseId: "women's fashion-gym-&-fitness", icon: <Sun size={12} /> },
      { name: "Outfit Coordination", showcaseId: "women's fashion-outfit-coordination", icon: <ImageIcon size={12} /> },
      { name: "Curvy", icon: <Star size={12} /> },
    ]
  },
  {
    name: "Men's Apparel",
    shortName: "Men",
    icon: <Briefcase size={20} className="text-emerald-400" />,
    color: "rgba(16, 185, 129, 0.5)",
    border: "rgba(16, 185, 129, 0.8)",
    bgImage: "/prove/Uomo/Street Style/BE25B3F8-3623-4189-988E-AF4258A61ADA.jpeg",
    subcategories: [
      { name: "Ecommerce Studio", icon: <ShoppingBag size={12} /> },
      { name: "Street Style", icon: <MapPin size={12} /> },
      { name: "Silver Fox Luxury", showcaseId: "men's apparel-silver-fox-luxury", icon: <Star size={12} /> },
      { name: "Executive Lifestyle", showcaseId: "men's apparel-executive-lifestyle", icon: <Building size={12} /> },
    ]
  },
  {
    name: "Bridal & Groom",
    shortName: "Bridal",
    icon: <Heart size={20} className="text-rose-400" />,
    color: "rgba(244, 63, 94, 0.5)",
    border: "rgba(244, 63, 94, 0.8)",
    bgImage: "/prove/Sposa/Romantic Venue/7B9D7519-83A0-4912-A5BD-C99401EBB01A.jpeg",
    subcategories: [
      { name: "Bridal Collection", showcaseId: "bridal-bridal-collection", icon: <Sparkles size={12} /> },
      { name: "Groom Collection", showcaseId: "groom & formal-groom-collection", icon: <UserCheck size={12} /> },
      { name: "Bridal Story", icon: <ImageIcon size={12} /> },
      { name: "Groom Story", icon: <Camera size={12} /> },
    ]
  },
  {
    name: "Kids Collection",
    shortName: "Kids",
    icon: <Baby size={20} className="text-yellow-400" />,
    color: "rgba(234, 179, 8, 0.5)",
    border: "rgba(234, 179, 8, 0.8)",
    bgImage: "/prove/Bambino/Elegant Event/1.jpeg",
    subcategories: [
      { name: "Elegant Event", showcaseId: "kids collection-elegant-event", icon: <Star size={12} /> },
      { name: "Playful Lifestyle", showcaseId: "kids collection-playful-lifestyle", icon: <Trees size={12} /> },
      { name: "Back to School", icon: <Building size={12} /> },
      { name: "First Communion", icon: <Sparkles size={12} /> },
      { name: "Holiday Season", icon: <Heart size={12} /> },
    ]
  },
];

export default function ShowcaseCategories({ showcaseData = [] }: { showcaseData?: any[] }) {
  const displayOrder = [2, 3, 0, 1, 4, 5]; // Women(2), Men(3), T-Shirts(0), Footwear(1), Bridal(4), Kids(5)
  const [activeExample, setActiveExample] = useState<{catIndex: number, subName: string, showcaseId?: string} | null>(null);

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto 4rem auto',
      padding: '0 5%'
    }}>
      <style>{`
        .category-block {
          margin-bottom: 5rem;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s forwards cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .macro-header {
          position: relative;
          height: 280px;
          border-radius: 32px;
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          transition: transform 0.4s ease;
        }
        .macro-header:hover {
          transform: scale(1.01);
        }
        .subcategory-card {
          background: #151515;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.2rem;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .subcategory-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% -20%, rgba(255,255,255,0.05), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .subcategory-card:hover::before {
          opacity: 1;
        }
        .subcategory-card:hover {
          transform: translateY(-5px);
          background: #1a1a1a;
        }
      `}</style>

      {/* INTRO HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Explore AI Business Modes
        </h2>
        <p style={{ color: '#888', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover exactly how SuperNexus adapts to every fashion category. Each mode is powered by tailored prompts, specialized lighting, and custom environments.
        </p>
      </div>

      {/* CATEGORY BLOCKS */}
      {displayOrder.map((catIdx, index) => {
        const cat = CATEGORY_STRUCTURE[catIdx];
        return (
          <div key={cat.name} className="category-block" style={{ animationDelay: `${index * 0.1}s` }}>
            
            {/* MACRO HEADER */}
            <div className="macro-header">
              <div style={{ 
                backgroundImage: `url('${cat.bgImage}')`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center 30%', 
                position: 'absolute', 
                inset: 0, 
                opacity: 0.6,
                filter: 'saturate(1.2)'
              }} />
              <div style={{ 
                background: 'linear-gradient(90deg, rgba(12,12,12,0.95) 0%, rgba(12,12,12,0.8) 40%, transparent 100%)', 
                position: 'absolute', 
                inset: 0 
              }} />
              
              <div style={{ 
                position: 'relative', 
                zIndex: 10, 
                padding: '0 4rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '2.5rem', 
                height: '100%' 
              }}>
                <div style={{ 
                  padding: '1.2rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '24px', 
                  border: `1px solid ${cat.border}`, 
                  boxShadow: `0 0 40px ${cat.color.replace('0.5', '0.4')}`
                }}>
                  {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 48 })}
                </div>
                <div>
                  <h3 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 4px 20px rgba(0,0,0,0.5)', letterSpacing: '-0.02em' }}>
                    {cat.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.8rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.border, boxShadow: `0 0 10px ${cat.border}` }} />
                    <span style={{ color: '#ccc', fontSize: '1.2rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {cat.subcategories.length} Business Modes Available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBCATEGORIES GRID */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {cat.subcategories.map(sub => (
                <div key={sub.name} className="subcategory-card" style={{ 
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3)` 
                }}
                onClick={() => {
                  if (activeExample?.subName === sub.name) {
                    setActiveExample(null); // Toggle off
                  } else {
                    setActiveExample({ catIndex: index, subName: sub.name, showcaseId: sub.showcaseId });
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = cat.border;
                  e.currentTarget.style.boxShadow = `0 10px 30px ${cat.color.replace('0.5', '0.2')}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                }}>
                  <div style={{ 
                    background: cat.color.replace('0.5', '0.15'), 
                    padding: '0.9rem', 
                    borderRadius: '16px', 
                    color: '#fff',
                    border: `1px solid ${cat.color.replace('0.5', '0.3')}`
                  }}>
                    {React.cloneElement(sub.icon as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                      {sub.name}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 500, marginTop: '2px' }}>
                      AI Generative Mode
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* INLINE EXAMPLE REVEAL */}
            {activeExample?.catIndex === index && (
              <div style={{
                marginTop: '2rem',
                background: '#111',
                border: `1px solid ${cat.border}`,
                borderRadius: '24px',
                padding: '2rem',
                animation: 'fadeUp 0.5s ease forwards',
                boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 30px ${cat.color.replace('0.5', '0.1')}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                    <span style={{ color: cat.border }}>{activeExample.subName}</span> Example
                  </h4>
                  <button 
                    onClick={() => setActiveExample(null)}
                    style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}
                  >
                    ×
                  </button>
                </div>
                
                {(() => {
                  const exampleData = showcaseData.find(d => (activeExample.showcaseId && d.id === activeExample.showcaseId) || d.subcategory === activeExample.subName || d.category === activeExample.subName);
                  if (!exampleData) return <p style={{ color: '#888' }}>Example coming soon for this specific mode...</p>;
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <p style={{ color: '#ccc', fontStyle: 'italic', margin: 0, fontSize: '1rem', borderLeft: `3px solid ${cat.border}`, paddingLeft: '1rem' }}>"{exampleData.desc}"</p>
                      
                      {/* BEFORE IMAGES */}
                      <div>
                        <p style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>ORIGINAL WAREHOUSE PHOTO{exampleData.before.length > 1 ? 'S' : ''}</p>
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                          {exampleData.before.map((bImg: string, i: number) => (
                            <img key={i} src={bImg} alt={`Before ${i+1}`} style={{ width: '180px', borderRadius: '12px', objectFit: 'cover', height: '240px', opacity: 0.8, boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }} />
                          ))}
                        </div>
                      </div>

                      {/* AFTER IMAGES */}
                      <div>
                        <p style={{ color: cat.border, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: cat.border, boxShadow: `0 0 10px ${cat.border}` }} />
                           AI RESULTS
                        </p>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                          gap: '1rem' 
                        }}>
                          {exampleData.afters.map((aImg: string, i: number) => (
                            <div key={i} style={{ position: 'relative', width: '100%', height: i === 0 ? 'auto' : '250px', gridColumn: i === 0 ? '1 / -1' : 'auto', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', background: '#050505' }}>
                               <img src={aImg} alt={`Result ${i+1}`} style={{ width: '100%', height: i === 0 ? 'auto' : '100%', objectFit: 'cover', display: 'block' }} />
                               <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', border: `1px solid ${cat.color.replace('0.5', '0.3')}` }}>AI Generation {i+1}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
