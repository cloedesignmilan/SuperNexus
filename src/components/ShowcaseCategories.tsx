"use client";

import React, { useRef, useState, MouseEvent } from 'react';
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
    color: "rgba(59, 130, 246, 0.5)", // Brighter core colors
    border: "rgba(59, 130, 246, 0.8)",
    bgImage: "/prove/Tshirt/Ecommerce Clean/627D75E3-D637-42B7-94EB-1672B1AB8C88.jpeg",
    subcategories: [
      { name: "Streetwear FlatLay", icon: <Camera size={12} /> },
      { name: "E-Commerce Clean", icon: <ShoppingBag size={12} /> },
      { name: "UGC Content", icon: <Smartphone size={12} /> },
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
      { name: "Product Clean", icon: <ShoppingBag size={12} /> },
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
      { name: "Mannequin Display", icon: <UserCheck size={12} /> },
      { name: "Runway Editorial", icon: <Star size={12} /> },
      { name: "Luxury Villa", icon: <Building size={12} /> },
      { name: "Instagram Style", icon: <Smartphone size={12} /> },
      { name: "Mature Sophistication", icon: <Heart size={12} /> },
      { name: "Gym & Fitness", icon: <Sun size={12} /> },
      { name: "Outfit Coordination", icon: <ImageIcon size={12} /> },
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
      { name: "Silver Fox Luxury", icon: <Star size={12} /> },
      { name: "Executive Lifestyle", icon: <Building size={12} /> },
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
      { name: "Bridal Collection", icon: <Sparkles size={12} /> },
      { name: "Groom Collection", icon: <UserCheck size={12} /> },
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
      { name: "Elegant Event", icon: <Star size={12} /> },
      { name: "Playful Lifestyle", icon: <Trees size={12} /> },
    ]
  },
];

// --- ADVANCED 3D TILT CATEGORY CARD ---
function CategoryCard({ cat, id }: { cat: any, id?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    const tiltX = (50 - y) * 0.25;
    const tiltY = (x - 50) * 0.25;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setMousePos({ x: 50, y: 50 });
  };

  return (
    <div 
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        flex: '0 0 auto',
        width: '320px',
        height: '420px',
        position: 'relative',
        perspective: '1200px',
        cursor: 'pointer'
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        background: '#111',
        borderRadius: '24px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: isHovered ? 'none' : 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: isHovered ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03, 1.03, 1.03)` : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        boxShadow: isHovered 
          ? `0 30px 60px rgba(0,0,0,0.6), 0 0 40px ${cat.color.replace('0.5', '0.3')}`
          : '0 15px 35px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: `1px solid ${isHovered ? cat.border : 'rgba(255,255,255,0.15)'}`,
      }}>
        
        {/* PARALLAX VIBRANT BACKGROUND IMAGE */}
        <div style={{
          position: 'absolute',
          inset: '-20px',
          backgroundImage: `url('${cat.bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isHovered ? 1 : 0.9,
          filter: isHovered ? 'brightness(1.1) contrast(1.1) saturate(1.2)' : 'brightness(1) contrast(1.05) saturate(1.1)',
          transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
          transform: isHovered ? `translateX(${tilt.y * -1.5}px) translateY(${tilt.x * 1.5}px) translateZ(-40px) scale(1.05)` : 'translateZ(0) scale(1)',
          borderRadius: '32px',
          pointerEvents: 'none'
        }} />

        {/* SUBTLE LIGHT GRADIENT TOP-DOWN (for brightness) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 50%)',
          borderRadius: '24px',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        {/* SPOTLIGHT GLOW ON HOVER */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isHovered 
            ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.2) 0%, transparent 50%)` 
            : 'none',
          borderRadius: '24px',
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
          zIndex: 3,
          transition: 'opacity 0.3s ease',
          opacity: isHovered ? 1 : 0
        }} />

        {/* CONTENT LAYER (Elevated in 3D, always bright) */}
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          left: '12px', 
          right: '12px', 
          padding: '20px', 
          zIndex: 4, 
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(10, 10, 10, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
          transform: isHovered ? 'translateZ(40px)' : 'translateZ(0)',
          transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
        }}>
          {/* Macro Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: cat.color.replace('0.5', '0.25'),
              border: `1px solid ${cat.border}`,
              boxShadow: `0 4px 15px ${cat.color.replace('0.5', '0.4')}`
            }}>
              {cat.icon}
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.35rem', 
              fontWeight: 800, 
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              {cat.name}
            </h3>
          </div>

          {/* Subcategories Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {cat.subcategories.map((sub: any, i: number) => (
              <span key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                <span style={{ opacity: 0.9 }}>{sub.icon}</span>
                {sub.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShowcaseCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseAutoScrollRef = useRef<boolean>(false);

  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    
    let autoScrollTimer: NodeJS.Timeout;
    let resumeTimeout: NodeJS.Timeout;

    const startAutoScroll = () => {
      clearInterval(autoScrollTimer);
      autoScrollTimer = setInterval(() => {
        if (!isDown && scrollContainer && !pauseAutoScrollRef.current) {
          scrollContainer.scrollLeft += 1;
          if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
            scrollContainer.scrollLeft = 0; // Reset
          }
        }
      }, 30);
    };

    const pauseAutoScroll = () => {
      isDown = true;
      clearInterval(autoScrollTimer);
      clearTimeout(resumeTimeout);
    };

    const scheduleResume = () => {
      isDown = false;
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        startAutoScroll();
      }, 3000);
    };

    // Start initially
    startAutoScroll();

    const onMouseDown = (e: globalThis.MouseEvent) => {
      pauseAutoScroll();
      scrollContainer.style.cursor = 'grabbing';
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    };
    const onMouseLeave = () => {
      scheduleResume();
      scrollContainer.style.cursor = 'grab';
    };
    const onMouseUp = () => {
      scheduleResume();
      scrollContainer.style.cursor = 'grab';
    };
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainer.scrollLeft = scrollLeft - walk;
    };

    const onTouchStart = () => pauseAutoScroll();
    const onTouchEnd = () => scheduleResume();

    scrollContainer.addEventListener('mousedown', onMouseDown);
    scrollContainer.addEventListener('mouseleave', onMouseLeave);
    scrollContainer.addEventListener('mouseup', onMouseUp);
    scrollContainer.addEventListener('mousemove', onMouseMove);
    
    scrollContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    scrollContainer.addEventListener('touchend', onTouchEnd);
    scrollContainer.addEventListener('touchcancel', onTouchEnd);

    return () => {
      clearInterval(autoScrollTimer);
      clearTimeout(resumeTimeout);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mousedown', onMouseDown);
        scrollContainer.removeEventListener('mouseleave', onMouseLeave);
        scrollContainer.removeEventListener('mouseup', onMouseUp);
        scrollContainer.removeEventListener('mousemove', onMouseMove);
        
        scrollContainer.removeEventListener('touchstart', onTouchStart);
        scrollContainer.removeEventListener('touchend', onTouchEnd);
        scrollContainer.removeEventListener('touchcancel', onTouchEnd);
      }
    };
  }, []);

  return (
    <div style={{
      width: '100%',
      margin: '0 auto 4rem auto',
      padding: '0'
    }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .macro-cat-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        .macro-cat-icon:hover {
          transform: translateY(-5px);
        }
        .icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transition: all 0.3s ease;
          position: relative;
        }
        .icon-circle::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          box-shadow: inset 0 0 20px rgba(255,255,255,0.02);
        }
        .macro-cat-icon:hover .icon-circle {
          border-color: var(--accent);
          box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 25px var(--accent);
          background: #1a1a1a;
        }
        .macro-cat-icon span {
          color: #666;
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        .macro-cat-icon:hover span {
          color: #fff;
        }
      `}</style>

      {/* MACRO CATEGORIES PREMIUM ICONS */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '4rem', 
        marginBottom: '3rem',
        flexWrap: 'wrap'
      }}>
        {CATEGORY_STRUCTURE.map((cat, idx) => {
          // Reorder to match header order: Women(2), Men(3), T-Shirts(0), Footwear(1), Bridal(4), Kids(5)
          const displayOrder = [2, 3, 0, 1, 4, 5];
          const actualCatIdx = displayOrder[idx];
          const actualCat = CATEGORY_STRUCTURE[actualCatIdx];

          const scrollToCard = () => {
            if (scrollRef.current) {
              pauseAutoScrollRef.current = true; // Pause auto scroll
              
              const card = document.getElementById(`category-card-${actualCatIdx}`);
              if (card) {
                card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }
        
              // Resume after a few seconds
              setTimeout(() => {
                pauseAutoScrollRef.current = false;
              }, 4000);
            }
          };

          return (
            <div key={actualCatIdx} className="macro-cat-icon" onClick={scrollToCard}>
              <div className="icon-circle" style={{ '--accent': actualCat.border } as React.CSSProperties}>
                {React.cloneElement(actualCat.icon as React.ReactElement, { size: 32, className: '' })}
              </div>
              <span>{actualCat.shortName}</span>
            </div>
          );
        })}
      </div>

      <div 
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: '64px', // Increased gap to separate cards significantly
          overflowX: 'auto',
          padding: '40px 5%',
          scrollBehavior: 'auto',
          cursor: 'grab',
          WebkitOverflowScrolling: 'touch',
          perspective: '1200px' // For the 3D cards
        }}
      >
        {[...CATEGORY_STRUCTURE, ...CATEGORY_STRUCTURE].map((cat, idx) => (
          <CategoryCard key={idx} id={`category-card-${idx}`} cat={cat} />
        ))}
      </div>
    </div>
  );
}
