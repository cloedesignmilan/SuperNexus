"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ShoppingCart, Camera, Star, TrendingUp } from 'lucide-react';

import { ShowcaseItem } from '@/lib/getShowcaseData';


export default function DynamicShowcase({ showcaseData }: { showcaseData: ShowcaseItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);


  // Hide main header on mobile when entering showcase
  useEffect(() => {
    const showcaseContainer = document.querySelector('.dynamic-showcase-container');
    const header = document.querySelector('.landing-header') as HTMLElement;
    
    if (!showcaseContainer || !header) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (window.innerWidth <= 900) {
        if (entry.isIntersecting) {
          header.style.transform = 'translateY(-100%)';
          header.style.transition = 'transform 0.3s ease';
        } else {
          header.style.transform = 'translateY(0)';
        }
      }
    }, { rootMargin: '-10% 0px -10% 0px', threshold: 0 });

    observer.observe(showcaseContainer);
    return () => {
      observer.disconnect();
      if (header) header.style.transform = 'translateY(0)';
    };
  }, []);

  useEffect(() => {
    const observers = showcaseData.map((_, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      );
      
      if (sectionRefs.current[index]) {
        observer.observe(sectionRefs.current[index]!);
      }
      return observer;
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  return (
    <div className="dynamic-showcase-container">
      <div className="ds-sticky-sidebar hide-mobile">
        {showcaseData.map((item, idx) => (
          <div 
            key={item.id} 
            className={`ds-sidebar-item ${activeIndex === idx ? 'active' : ''}`}
          >
            <div className="ds-category">{item.category}</div>
            <h3 className="ds-subcategory">{item.subcategory}</h3>
            <p className="ds-desc">{item.desc}</p>
            
            <div className="ds-usecases">
              {item.useCases.map(uc => (
                <span key={uc} className="ds-badge">
                  {uc.toLowerCase().includes('amazon') || uc.toLowerCase().includes('shop') ? <ShoppingCart size={14} /> : 
                   uc.toLowerCase().includes('insta') || uc.toLowerCase().includes('fb') ? <Camera size={14} /> : 
                   <TrendingUp size={14} />}
                  {uc}
                </span>
              ))}
            </div>
            
            <div className="ds-before-preview">
              <div className="ds-before-label">ORIGINAL WAREHOUSE PHOTO{item.before.length > 1 ? 'S' : ''}</div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: item.before.length > 1 ? '8px' : '0' }}>
                {item.before.map((b, i) => (
                  <div key={i} style={{ 
                    position: 'relative', 
                    width: item.before.length > 1 ? 'calc(50% - 4px)' : '100%', 
                    height: item.before.length > 1 ? '250px' : '450px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', 
                    flexShrink: 0 
                  }}>
                    <Image src={b} alt={`Before ${i+1}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 300px" quality={60} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ds-scroll-content">
        {showcaseData.map((item, idx) => (
          <div 
            key={`content-${item.id}`} 
            id={item.id.replace(/\s+/g, '-').replace(/&/g, 'and')}
            ref={(el) => { sectionRefs.current[idx] = el; }} 
            className={`ds-section ${activeIndex === idx ? 'active' : ''}`}
            style={{
              opacity: activeIndex === idx ? 1 : 0.25,
              filter: activeIndex === idx ? 'none' : 'grayscale(50%)',
              transform: activeIndex === idx ? 'scale(1) translateY(0) translateZ(0)' : 'scale(0.95) translateY(20px) translateZ(0)',
              transition: 'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
              transformOrigin: 'center center',
              willChange: 'transform, opacity, filter'
            }}
          >
             <div className="show-mobile" style={{
                  position: 'sticky',
                  top: '-1px',
                  zIndex: 30,
                  background: 'rgba(8, 8, 8, 0.95)',
                  backdropFilter: 'blur(10px)',
                  padding: '1rem 0',
                  margin: '0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div className="ds-category">{item.category}</div>
                  <h3 className="ds-subcategory" style={{ margin: 0, fontSize: '1.5rem' }}>{item.subcategory}</h3>
             </div>

             <div className="ds-mobile-header show-mobile" style={{ marginTop: '1rem' }}>
                <div className="ds-usecases" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {item.useCases.map(uc => <span key={uc} className="ds-badge">{uc}</span>)}
                </div>
                <div className="ds-before-preview" style={{ marginBottom: '2rem' }}>
                  <div className="ds-before-label">ORIGINAL PHOTO{item.before.length > 1 ? 'S' : ''}</div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {item.before.map((b, i) => (
                      <div key={i} style={{ position: 'relative', width: '150px', height: '200px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                        <Image src={b} alt={`Before ${i+1}`} fill style={{ objectFit: 'cover' }} quality={60} />
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="ds-after-grid">
               {item.afters.map((afterImg, i) => (
                 <div key={i} className={`ds-after-card ${i === 0 ? 'ds-card-large' : ''}`}>
                    <div className="ds-after-label">
                      <Sparkles size={12} /> AI RESULT
                    </div>
                    <Image src={afterImg} alt={`Result ${i}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 600px" quality={80} />
                 </div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
