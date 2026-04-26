"use client";

import React from 'react';
import Image from 'next/image';
import Marquee from 'react-fast-marquee';

interface ShowcaseItem {
  id: string;
  category: string;
  subcategory: string;
  before: string[];
  afters: string[];
}

interface Props {
  showcaseData: ShowcaseItem[];
}

export default function InfiniteShowcase({ showcaseData }: Props) {
  return (
    <section className="infinite-showcase-wrapper">
      <div className="infinite-showcase-header">
        <h2 className="section-title">Infinite Possibilities</h2>
        <p className="section-subtitle">
          From a single warehouse photo to thousands of stunning, platform-ready lifestyle shots.
        </p>
      </div>

      <div className="infinite-marquee-container">
        {showcaseData.map((item, index) => {
          if (item.afters.length === 0) return null;
          
          const originalImage = item.before[0] ? {
            url: item.before[0],
            category: "ORIGINAL",
            useCase: "Warehouse Photo"
          } : null;

          const rowImages = item.afters.map(url => ({
            url,
            category: item.category,
            useCase: item.subcategory,
          }));
          
          // Alternate direction based on even/odd index
          const direction = index % 2 === 0 ? 'left' : 'right';
          // Make the 3rd or 4th row slightly slower to add parallax feeling
          const speed = index % 3 === 2 ? 30 : 45;
          
          return (
            <div key={item.id} className={`marquee-row-group ${index > 4 ? 'hide-mobile' : ''}`}>
              <h3 className="marquee-row-title">
                <span className="cat-name">{item.category}</span>
                <span className="separator"> / </span>
                <span className="subcat-name">{item.subcategory}</span>
              </h3>
              
              <div className="marquee-row-layout">
                {originalImage && (
                  <div className="marquee-static-before">
                    <MarqueeCard img={originalImage} />
                  </div>
                )}
                <div className="marquee-track-react">
                  <Marquee speed={speed} direction={direction as 'left' | 'right'} gradient={false} pauseOnHover={false} autoFill={true}>
                    {rowImages.map((img, i) => (
                      <div key={i} style={{ paddingRight: '1.5rem' }}>
                        <MarqueeCard img={img} />
                      </div>
                    ))}
                  </Marquee>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Subcomponent for individual card
function MarqueeCard({ img }: { img: { url: string; category: string; useCase: string } }) {
  return (
    <div className="marquee-card">
      <Image 
        src={img.url} 
        alt={img.category} 
        fill 
        style={{ objectFit: 'cover' }} 
        sizes="(max-width: 768px) 250px, 400px" 
        quality={75}
      />
      <div className="marquee-card-overlay">
        <div className="marquee-badge">
          <span style={{ width: '8px', height: '8px', background: '#ccff00', borderRadius: '50%', display: 'inline-block' }}></span>
          {img.useCase}
        </div>
        <div className="marquee-sub-badge">{img.category}</div>
      </div>
    </div>
  );
}
