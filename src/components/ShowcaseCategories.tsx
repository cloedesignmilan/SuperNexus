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
  {
    name: "Swimwear Collection",
    shortName: "Swimwear",
    icon: <Sun size={20} className="text-cyan-400" />,
    color: "rgba(34, 211, 238, 0.5)",
    border: "rgba(34, 211, 238, 0.8)",
    bgImage: "/prove/Donna/Costumi/In spiaggia/1.jpeg",
    subcategories: [
      { name: "E-Commerce Clean", icon: <ShoppingBag size={12} /> },
      { name: "Poolside Lifestyle", showcaseId: "swimwear-poolside-lifestyle", icon: <Sun size={12} /> },
      { name: "Fitting Room UGC", showcaseId: "swimwear-fitting-room-ugc", icon: <Smartphone size={12} /> },
    ]
  }
];

export default function ShowcaseCategories({ showcaseData = [] }: { showcaseData?: any[] }) {
  const displayOrder = [2, 3, 0, 1, 6, 4, 5]; // Women(2), Men(3), T-Shirts(0), Footwear(1), Swim(6), Bridal(4), Kids(5)
  const [activeExample, setActiveExample] = useState<{catIndex: number, subName: string, showcaseId?: string} | null>(null);

  const renderExampleReveal = (cat: any, index: number) => {
    if (activeExample?.catIndex !== index) return null;
    
    return (
      <div id={`reveal-${activeExample.subName.replace(/\s+/g, '-')}`} className="example-reveal" style={{
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
          const exampleData = showcaseData.find((d: any) => (activeExample.showcaseId && d.id === activeExample.showcaseId) || d.subcategory === activeExample.subName || d.category === activeExample.subName);
          if (!exampleData) return <p style={{ color: '#888' }}>Example coming soon for this specific mode...</p>;
          
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <p style={{ color: '#ccc', fontStyle: 'italic', margin: 0, fontSize: '1rem', borderLeft: `3px solid ${cat.border}`, paddingLeft: '1rem' }}>"{exampleData.desc}"</p>
              
              {/* SIDE BY SIDE COMPARISON */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
                
                {/* LEFT: FIRST BEFORE IMAGE */}
                {exampleData.before.length > 0 && (
                  <div style={{ flex: '1 1 calc(50% - 0.75rem)', minWidth: '280px', position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', background: '#050505' }}>
                     <p style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                       ORIGINAL WAREHOUSE PHOTO
                     </p>
                     <img src={exampleData.before[0]} alt="Original" style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}

                {/* RIGHT: FIRST AFTER IMAGE */}
                {exampleData.afters.length > 0 && (
                  <div style={{ flex: '1 1 calc(50% - 0.75rem)', minWidth: '280px', position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', background: '#050505' }}>
                     <p style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: cat.border, border: `1px solid ${cat.border}` }}>
                       AI RESULT
                     </p>
                     <img src={exampleData.afters[0]} alt="Result 1" style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
              </div>

              {/* OTHER IMAGES GRID */}
              {(exampleData.before.length > 1 || exampleData.afters.length > 1) && (
                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ color: cat.border, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.8rem' }}>MORE VARIATIONS</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {exampleData.before.slice(1).map((bImg: string, i: number) => (
                      <div key={`b-${i}`} style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                         <p style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.6rem', color: '#fff' }}>ORIGINAL {i+2}</p>
                         <img src={bImg} alt={`Before ${i+2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                      </div>
                    ))}
                    {exampleData.afters.slice(1).map((aImg: string, i: number) => (
                      <div key={`a-${i}`} style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                         <p style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.6rem', color: '#fff' }}>AI RESULT {i+2}</p>
                         <img src={aImg} alt={`Result ${i+2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })()}
      </div>
    );
  };
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
        @keyframes glowPulse {
          0% { transform: scale(1); filter: brightness(1); }
          100% { transform: scale(1.1); filter: brightness(1.3); }
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
        .intro-2col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4rem;
          margin-bottom: 6rem;
          align-items: flex-start;
        }
        .intro-col-2 {
          text-align: left;
          padding-left: 2rem;
          border-left: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 768px) {
          .intro-2col {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .intro-col-2 {
            padding-left: 0;
            border-left: none;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 3rem;
          }
          .desktop-reveal { display: none; }
          .mobile-reveal { display: block; grid-column: 1 / -1; }
        }
        @media (min-width: 769px) {
          .desktop-reveal { display: block; }
          .mobile-reveal { display: none; }
        }
      `}</style>

      {/* INTRO HEADER (2 COLUMNS) */}
      <div className="intro-2col">
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            From Box to Web<br/>in Seconds.
          </h2>
          <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Transform raw snapshots into high-end editorial campaigns instantly. Generate 1 professional photo in under 30 seconds, or a full batch of 5 in just two minutes. The ultimate workflow for e-commerce catalogs, Instagram styling, and high-converting Facebook ads.
          </p>
        </div>
        
        <div className="intro-col-2">
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Explore AI<br/>Generative Modes
          </h2>
          <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: 1.6 }}>
            See exactly how SuperNexus adapts to every fashion category. Each mode is engineered with hyper-tailored prompts, specialized studio lighting, and realistic 3D environments.
          </p>
        </div>
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
                padding: '0 clamp(1.5rem, 5vw, 4rem)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(1rem, 3vw, 2.5rem)', 
                height: '100%' 
              }}>
                <div style={{ 
                  padding: 'clamp(0.8rem, 2vw, 1.2rem)', 
                  background: 'rgba(255,255,255,0.05)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '24px', 
                  border: `1px solid ${cat.border}`, 
                  boxShadow: `0 0 40px ${cat.color.replace('0.5', '0.4')}`,
                  flexShrink: 0
                }}>
                  {React.cloneElement(cat.icon as React.ReactElement<any>, { 
                    style: { width: 'clamp(32px, 8vw, 48px)', height: 'clamp(32px, 8vw, 48px)' } 
                  })}
                </div>
                <div style={{ minWidth: 0, wordBreak: 'break-word' }}>
                  <h3 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 4px 20px rgba(0,0,0,0.5)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {cat.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.border, boxShadow: `0 0 10px ${cat.border}`, flexShrink: 0 }} />
                    <span style={{ color: '#ccc', fontSize: 'clamp(0.85rem, 3vw, 1.2rem)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
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
              {cat.subcategories.map(sub => {
                const hasExample = !!sub.showcaseId;
                const isActive = activeExample?.subName === sub.name;
                return (
                  <React.Fragment key={sub.name}>
                    <div className="subcategory-card" style={{ 
                  boxShadow: isActive ? `0 10px 30px ${cat.color.replace('0.5', '0.3')}` : `0 4px 20px rgba(0,0,0,0.3)`,
                  borderColor: isActive ? cat.border : 'rgba(255,255,255,0.08)',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  background: isActive ? '#1a1a1a' : '#151515'
                }}
                onClick={(e) => {
                  if (isActive) {
                    setActiveExample(null);
                  } else {
                    // Record the card's current absolute position
                    const rect = e.currentTarget.getBoundingClientRect();
                    const absoluteY = rect.top + window.scrollY;
                    
                    setActiveExample({ catIndex: index, subName: sub.name, showcaseId: sub.showcaseId });
                    
                    // After React renders the new expanded layout, smoothly anchor the card
                    setTimeout(() => {
                       window.scrollTo({
                         top: absoluteY - 120, // Leave some breathing room for fixed headers
                         behavior: 'smooth'
                       });
                    }, 50);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = hasExample ? cat.border : 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.boxShadow = hasExample ? `0 10px 30px ${cat.color.replace('0.5', '0.2')}` : `0 8px 25px rgba(0,0,0,0.4)`;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                    e.currentTarget.style.transform = 'none';
                  }
                }}>
                  <div style={{ 
                    background: hasExample ? cat.color.replace('0.5', '0.2') : 'rgba(255,255,255,0.05)', 
                    padding: '0.9rem', 
                    borderRadius: '16px', 
                    color: hasExample ? '#fff' : '#888',
                    border: `1px solid ${hasExample ? cat.color.replace('0.5', '0.4') : 'rgba(255,255,255,0.1)'}`
                  }}>
                    {React.cloneElement(sub.icon as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ color: hasExample ? '#fff' : '#aaa', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                      {sub.name}
                    </span>
                    <span style={{ color: hasExample ? cat.border : '#555', fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>
                      {hasExample ? 'View AI Example ✨' : 'Coming Soon'}
                    </span>
                  </div>
                  
                  {/* WOW EFFECT BADGE for linked examples */}
                  {hasExample && (
                     <div style={{
                       background: `linear-gradient(135deg, ${cat.border}, transparent)`,
                       width: '32px',
                       height: '32px',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       boxShadow: `0 0 15px ${cat.color.replace('0.5', '0.5')}`,
                       animation: isActive ? 'none' : 'glowPulse 2s infinite alternate'
                     }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
                           <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                     </div>
                  )}
                </div>
                {/* MOBILE REVEAL */}
                {isActive && (
                  <div className="mobile-reveal">
                    {renderExampleReveal(cat, index)}
                  </div>
                )}
              </React.Fragment>
              )})}
            </div>

                        {/* INLINE EXAMPLE REVEAL */}
            <div className="desktop-reveal">
              {renderExampleReveal(cat, index)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
