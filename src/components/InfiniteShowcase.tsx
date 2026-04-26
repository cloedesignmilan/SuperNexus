"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Shirt, Sparkles, Waves, Footprints, Layers } from 'lucide-react';

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

const SLIDESHOW_CONFIG = [
  // The T-SHIRT CLEAN CATALOG lookup was removed because dynamic images were deleted.
  {
    displayCategory: 'CEREMONY ELEGANT',
    displaySubcategory: 'WOMAN → MODEL STUDIO',
    originalImage: '/prove nuove/Immagini originali/ChatGPT Image 26 apr 2026, 15_58_04.png',
    manualImages: [
      "/prove nuove/ceremony elegant/WOMAN/Model Studio/WOMAN/supernexus_image - 2026-04-26T144434.579.jpg",
      "/prove nuove/ceremony elegant/WOMAN/Model Studio/WOMAN/supernexus_image - 2026-04-26T144435.534.jpg",
      "/prove nuove/ceremony elegant/WOMAN/Model Studio/WOMAN/supernexus_image - 2026-04-26T144437.607.jpg",
      "/prove nuove/ceremony elegant/WOMAN/Model Studio/WOMAN/supernexus_image - 2026-04-26T144438.459.jpg"
    ]
  },
  {
    displayCategory: 'SWIMWEAR',
    displaySubcategory: 'E-COMMERCE → LIFESTYLE',
    originalImage: '/prove nuove/Immagini originali/10CDB780-50B9-4B50-8262-CA2EDA1AD623_1_105_c.jpeg',
    manualImages: [
      "/prove nuove/swimwear/Lifestyle/supernexus_image - 2026-04-26T143030.399.jpg",
      "/prove nuove/swimwear/Lifestyle/supernexus_image - 2026-04-26T143031.202.jpg",
      "/prove nuove/swimwear/Lifestyle/supernexus_image - 2026-04-26T143033.200.jpg",
      "/prove nuove/swimwear/Lifestyle/supernexus_image - 2026-04-26T143034.199.jpg"
    ]
  },
  {
    displayCategory: 'CEREMONY ELEGANT',
    displaySubcategory: 'WOMAN → CLEAN CATALOG',
    originalImage: '/prove nuove/Immagini originali/ChatGPT Image 26 apr 2026, 15_57_55.png',
    manualImages: [
      "/prove nuove/ceremony elegant/WOMAN/Clean Catalog/supernexus_image - 2026-04-26T143925.322.jpg",
      "/prove nuove/ceremony elegant/WOMAN/Clean Catalog/supernexus_image - 2026-04-26T143926.199.jpg",
      "/prove nuove/ceremony elegant/WOMAN/Clean Catalog/supernexus_image - 2026-04-26T143927.851.jpg",
      "/prove nuove/ceremony elegant/WOMAN/Clean Catalog/supernexus_image - 2026-04-26T143928.710.jpg"
    ]
  },
  {
    displayCategory: 'FOOTWEAR',
    displaySubcategory: 'SHOES → CLEAN CATALOG',
    originalImage: '/prove nuove/Immagini originali/A524FD31-E7B5-4BB7-BDA7-D287BBE82174_1_105_c.jpeg',
    manualImages: [
      "/prove nuove/SHOES/Clean Catalog/supernexus_image - 2026-04-26T162327.009.jpg",
      "/prove nuove/SHOES/Clean Catalog/supernexus_image - 2026-04-26T162331.765.jpg",
      "/prove nuove/SHOES/Clean Catalog/supernexus_image - 2026-04-26T162334.407.jpg",
      "/prove nuove/SHOES/Clean Catalog/supernexus_image - 2026-04-26T162335.355.jpg"
    ]
  },
  {
    displayCategory: 'T-SHIRT',
    displaySubcategory: 'MODEL STUDIO → MODEL PHOTO',
    originalImage: '/prove nuove/Immagini originali/ChatGPT Image 26 apr 2026, 15_58_07.png',
    manualImages: [
      "/prove nuove/T-SHIRT/T-SHIRT → MODEL STUDIO → MODEL PHOTO/supernexus_image (62) 2.jpg",
      "/prove nuove/T-SHIRT/T-SHIRT → MODEL STUDIO → MODEL PHOTO/supernexus_image (63).jpg",
      "/prove nuove/T-SHIRT/T-SHIRT → MODEL STUDIO → MODEL PHOTO/supernexus_image (64) 2.jpg",
      "/prove nuove/T-SHIRT/T-SHIRT → MODEL STUDIO → MODEL PHOTO/supernexus_image (65).jpg"
    ]
  },
  {
    displayCategory: 'T-SHIRT',
    displaySubcategory: 'UGC CREATOR PACK',
    originalImage: '/prove nuove/Immagini originali/ChatGPT Image 26 apr 2026, 18_59_01.png',
    manualImages: [
      "/prove nuove/T-SHIRT/UGC CREATOR PACK/supernexus_image (83).jpg",
      "/prove nuove/T-SHIRT/UGC CREATOR PACK/supernexus_image (84).jpg",
      "/prove nuove/T-SHIRT/UGC CREATOR PACK/supernexus_image (85).jpg",
      "/prove nuove/T-SHIRT/UGC CREATOR PACK/supernexus_image (86).jpg"
    ]
  },
  {
    displayCategory: 'SWIMWEAR',
    displaySubcategory: 'UGC CREATOR PACK',
    originalImage: '/prove nuove/Immagini originali/10CDB780-50B9-4B50-8262-CA2EDA1AD623_1_105_c.jpeg',
    manualImages: [
      "/prove nuove/swimwear/UGC/supernexus_image (88).jpg",
      "/prove nuove/swimwear/UGC/supernexus_image (89).jpg",
      "/prove nuove/swimwear/UGC/supernexus_image (90).jpg",
      "/prove nuove/swimwear/UGC/supernexus_image (91).jpg"
    ]
  },
  {
    displayCategory: 'CEREMONY ELEGANT',
    displaySubcategory: 'MAN → MODEL STUDIO',
    originalImage: '/prove nuove/Immagini originali/ChatGPT Image 26 apr 2026, 16_11_55.png',
    manualImages: [
      "/prove nuove/ceremony elegant/MAN/men clothing/Model Studio/supernexus_image - 2026-04-26T154306.446.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Model Studio/supernexus_image - 2026-04-26T154307.147.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Model Studio/supernexus_image - 2026-04-26T154309.410.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Model Studio/supernexus_image - 2026-04-26T154310.107.jpg"
    ]
  },
  {
    displayCategory: 'HOODIES',
    displaySubcategory: 'MAN → CASUAL',
    originalImage: '/prove nuove/Immagini originali/ChatGPT Image 26 apr 2026, 15_58_14.png',
    manualImages: [
      "/prove nuove/ceremony elegant/MAN/VARIE/FELPE/supernexus_image - 2026-04-26T155529.465.jpg",
      "/prove nuove/ceremony elegant/MAN/VARIE/FELPE/supernexus_image - 2026-04-26T155530.388.jpg",
      "/prove nuove/ceremony elegant/MAN/VARIE/FELPE/supernexus_image - 2026-04-26T155532.214.jpg",
      "/prove nuove/ceremony elegant/MAN/VARIE/FELPE/supernexus_image - 2026-04-26T155532.806.jpg"
    ]
  },
  {
    displayCategory: 'CEREMONY ELEGANT',
    displaySubcategory: 'MAN → LIFESTYLE',
    originalImage: '/prove nuove/Immagini originali/ChatGPT Image 26 apr 2026, 16_11_55.png',
    manualImages: [
      "/prove nuove/ceremony elegant/MAN/men clothing/Lifestyle/supernexus_image - 2026-04-26T154833.097.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Lifestyle/supernexus_image - 2026-04-26T154833.967.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Lifestyle/supernexus_image - 2026-04-26T154835.542.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Lifestyle/supernexus_image - 2026-04-26T154836.150.jpg"
    ]
  },
  {
    displayCategory: 'CEREMONY ELEGANT',
    displaySubcategory: 'MAN → CLEAN CATALOG',
    originalImage: '/prove nuove/Immagini originali/ChatGPT Image 26 apr 2026, 16_11_55.png',
    manualImages: [
      "/prove nuove/ceremony elegant/MAN/men clothing/Clean Catalog/supernexus_image - 2026-04-26T154011.096.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Clean Catalog/supernexus_image - 2026-04-26T154012.500.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Clean Catalog/supernexus_image - 2026-04-26T154013.255.jpg",
      "/prove nuove/ceremony elegant/MAN/men clothing/Clean Catalog/supernexus_image - 2026-04-26T155201.087.jpg"
    ]
  }
];

const UNIQUE_CATEGORIES = Array.from(new Set(SLIDESHOW_CONFIG.map(c => c.displayCategory)));

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'T-SHIRT': Shirt,
  'CEREMONY ELEGANT': Sparkles,
  'SWIMWEAR': Waves,
  'FOOTWEAR': Footprints,
  'HOODIES': Layers,
};

export default function InfiniteShowcase({ showcaseData }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Fallback: force visibility after 2 seconds in case observer fails completely
    const fallbackTimeout = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 2000);

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        setIsAnimating(true);
        observer.disconnect();
        clearTimeout(fallbackTimeout);
      }
    }, { threshold: 0 }); // abbassato a 0 per garantire l'innesco appena entra a schermo
    
    const el = document.getElementById('infinite-showcase-section');
    if (el) observer.observe(el);
    else clearTimeout(fallbackTimeout);
    
    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const slideDuration = 6000;
    const fadeOutDuration = 600;

    const interval = setInterval(() => {
      setIsVisible(false); // Trigger fade out
      
      setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % SLIDESHOW_CONFIG.length);
        // Allow React to mount new elements without 'visible' class first
        setTimeout(() => {
          setIsVisible(true); // Trigger fade in
        }, 50);
      }, fadeOutDuration);
      
    }, slideDuration);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const config = SLIDESHOW_CONFIG[activeIndex];
  
  let generatedImages: { url: string, category: string, useCase: string }[] = [];

  if (config.manualImages) {
    generatedImages = config.manualImages.map(url => ({
      url,
      category: config.displayCategory,
      useCase: config.displaySubcategory.split('→')[1]?.trim() || config.displaySubcategory,
    }));
  }

  // Se non ci sono immagini, evita errori distruttivi. 
  // Ritorna un div invisibile col corretto id per mantenere vivo l'observer e il setInterval.
  if (generatedImages.length === 0) {
    return <div id="infinite-showcase-section" style={{ opacity: 0, height: '1px' }}></div>;
  }

  const originalImage = {
    url: config.originalImage,
    category: "ORIGINAL",
    useCase: "Warehouse Photo"
  };

  // Ensure we have exactly 4 images for the layout
  while (generatedImages.length > 0 && generatedImages.length < 4) {
    generatedImages.push(generatedImages[0]);
  }

  const leftImages = generatedImages.slice(0, 2);
  const rightImages = generatedImages.slice(2, 4);

  return (
    <section id="infinite-showcase-section" className="infinite-showcase-wrapper" style={{ padding: '4rem 0 8rem 0', overflow: 'hidden' }}>
      <div className="infinite-showcase-header" style={{ color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="section-title" style={{ color: '#ffffff', textAlign: 'center' }}>One Shot.<br/>Infinite Possibilities.</h2>
        <p className="section-subtitle" style={{ color: '#aaaaaa', textAlign: 'center' }}>
          From a single warehouse photo to stunning, platform-ready lifestyle shots.
        </p>

        {/* CATEGORY ICONS */}
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(1rem, 3vw, 2.5rem)', 
          marginTop: '3rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '0 1rem'
        }}>
          {UNIQUE_CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || Sparkles;
            const isActive = config.displayCategory === cat;
            return (
              <div 
                key={cat}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.8rem',
                  opacity: isActive ? 1 : 0.4,
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  color: isActive ? '#ccff00' : '#ffffff',
                }}
              >
                <div style={{
                  padding: '1rem',
                  borderRadius: '50%',
                  background: isActive ? 'rgba(204, 255, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  boxShadow: isActive ? '0 0 25px rgba(204, 255, 0, 0.4)' : 'none',
                  border: isActive ? '1px solid rgba(204, 255, 0, 0.5)' : '1px solid transparent',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: isActive ? 700 : 500, 
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'all 0.5s ease'
                }}>
                  {cat}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="static-showcase-container" style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginTop: '4rem',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2vw',
      }}>
        {/* LEFT IMAGES */}
        {leftImages.map((img, i) => (
          <div key={`left-${activeIndex}-${i}`} className={`slide-up-card ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: `${0.1 + i * 0.15}s` }}>
            <MarqueeCard img={img} />
          </div>
        ))}

        {/* CENTER ORIGINAL */}
        <div key={`center-${activeIndex}`} className={`slide-up-card center-card ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '0s', zIndex: 10 }}>
          <MarqueeCard img={originalImage} isOriginal={true} />
        </div>

        {/* RIGHT IMAGES */}
        {rightImages.map((img, i) => (
          <div key={`right-${activeIndex}-${i}`} className={`slide-up-card ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: `${0.4 + i * 0.15}s` }}>
            <MarqueeCard img={img} />
          </div>
        ))}
      </div>

      {/* CATEGORY TITLE BELOW IMAGES */}
      <div key={`title-${activeIndex}`} className={`slide-up-title ${isVisible ? 'visible' : ''}`} style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '5rem', transitionDelay: '0.8s' }}>
        <h2 style={{ 
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
          fontWeight: '900', 
          lineHeight: '1.2',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'nowrap',
          whiteSpace: 'nowrap',
          gap: '15px'
        }}>
          <span style={{ color: '#ffffff' }}>{config.displayCategory}</span>
          <span style={{ color: '#444' }}>/</span>
          <span className="animated-gradient-text" style={{ whiteSpace: 'nowrap' }}>
            {config.displaySubcategory.includes('→') ? config.displaySubcategory.split('→').slice(1).join('→').trim() : config.displaySubcategory}
          </span>
        </h2>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .slide-up-title {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
        }
        .slide-up-title.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .slide-up-card {
          opacity: 0;
          transform: translateY(60px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          width: 18vw;
          min-width: 200px;
          max-width: 300px;
        }
        .slide-up-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .center-card {
          transform: translateY(60px) scale(1.15);
          width: 22vw;
          min-width: 250px;
          max-width: 350px;
          box-shadow: 0 0 50px rgba(204, 255, 0, 0.2);
          border-radius: 20px;
        }
        .center-card.visible {
          transform: translateY(0) scale(1.15);
        }

        .marquee-card-responsive {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        @media (max-width: 1024px) {
          .static-showcase-container {
            flex-direction: row !important;
            justify-content: flex-start !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            padding: 2rem 1.5rem !important;
            gap: 1rem !important;
            margin-left: 0 !important;
            width: 100% !important;
            -webkit-overflow-scrolling: touch;
          }
          .static-showcase-container::-webkit-scrollbar {
            display: none;
          }
          .slide-up-card {
            width: 80vw;
            max-width: 320px;
            flex-shrink: 0;
            scroll-snap-align: center;
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
          .center-card {
            transform: translateY(0) scale(1) !important;
            width: 80vw;
            max-width: 320px;
            flex-shrink: 0;
            scroll-snap-align: center;
            opacity: 1 !important;
          }
          .center-card.visible {
            transform: translateY(0) scale(1) !important;
          }
        }
      `}} />
    </section>
  );
}

// Subcomponent for individual card
function MarqueeCard({ img, isOriginal = false }: { img: { url: string; category: string; useCase: string }, isOriginal?: boolean }) {
  return (
    <div className="marquee-card-responsive" style={{ 
      border: isOriginal ? '2px solid #ccff00' : 'none',
    }}>
      <Image 
        src={img.url} 
        alt={img.category} 
        fill 
        style={{ objectFit: 'cover' }} 
        sizes="(max-width: 768px) 100vw, 25vw" 
        quality={75}
      />
      <div className="marquee-card-overlay" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: '2rem 1.5rem 1.5rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div className="marquee-badge" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          width: 'fit-content'
        }}>
          <span style={{ width: '8px', height: '8px', background: isOriginal ? '#fff' : '#ccff00', borderRadius: '50%', display: 'inline-block' }}></span>
          {isOriginal ? 'ORIGINAL PHOTO' : 'AI GENERATED'}
        </div>
        {!isOriginal && <div className="marquee-sub-badge" style={{ color: '#ccc', fontSize: '0.8rem', fontWeight: 500 }}>{img.useCase}</div>}
      </div>
    </div>
  );
}
