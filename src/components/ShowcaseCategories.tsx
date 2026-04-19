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
    icon: <Footprints size={20} className="text-orange-400" />,
    color: "rgba(249, 115, 22, 0.5)",
    border: "rgba(249, 115, 22, 0.8)",
    bgImage: "/prove/Donna/Instagram Lifestyle/9D7AAA55-49BF-44F2-AAEE-0C4A60F1ED95.jpeg",
    subcategories: [
      { name: "Sneakers Donna", icon: <Star size={12} /> },
      { name: "Product Clean", icon: <ShoppingBag size={12} /> },
      { name: "Tacchi Eleganti", icon: <Sparkles size={12} /> },
      { name: "On Feet Urban", icon: <MapPin size={12} /> },
    ]
  },
  {
    name: "Women's Fashion",
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
function CategoryCard({ cat }: { cat: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position as a percentage 0-100%
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    // Calculate tilt angles (max 15 degrees)
    const tiltX = (50 - y) * 0.3; // Up/down tilt
    const tiltY = (x - 50) * 0.3; // Left/right tilt
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setMousePos({ x: 50, y: 50 });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        flex: '0 0 auto',
        width: '320px',
        height: '420px',
        position: 'relative',
        perspective: '1000px', // Creates 3D space
        cursor: 'pointer'
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        background: '#050505',
        borderRadius: '24px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: isHovered ? 'none' : 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: isHovered ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.05, 1.05, 1.05)` : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        boxShadow: isHovered 
          ? `0 30px 60px rgba(0,0,0,0.8), 0 0 40px ${cat.color.replace('0.5', '0.2')}`
          : '0 10px 30px rgba(0,0,0,0.5)',
        border: `1px solid ${isHovered ? cat.border : 'rgba(255,255,255,0.05)'}`,
      }}>
        
        {/* PARALLAX BACKGROUND IMAGE */}
        <div style={{
          position: 'absolute',
          inset: '-20px', // Oversize the image so it can move without showing edges
          backgroundImage: `url('${cat.bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isHovered ? 0.8 : 0.4,
          filter: isHovered ? 'grayscale(0%) contrast(1.1) brightness(1.2)' : 'grayscale(50%) brightness(0.8)',
          transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
          transform: isHovered ? `translateX(${tilt.y * -1.5}px) translateY(${tilt.x * 1.5}px) translateZ(-50px) scale(1.05)` : 'translateZ(0) scale(1)',
          borderRadius: '32px',
          pointerEvents: 'none'
        }} />

        {/* SPOTLIGHT GRADIENT */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isHovered 
            ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)` 
            : 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)',
          borderRadius: '24px',
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
          zIndex: 2,
          transition: 'opacity 0.3s ease',
          opacity: isHovered ? 1 : 0
        }} />

        {/* BOTTOM VIGNETTE / DARK GRADIENT */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,0.6) 50%, #050505 100%)',
          borderRadius: '24px',
          zIndex: 3,
          pointerEvents: 'none',
        }} />

        {/* SHIMMER BORDER EFFECT (Animated) */}
        {isHovered && (
           <div style={{
             position: 'absolute',
             inset: '-1px',
             borderRadius: '25px',
             background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${cat.color.replace('0.5', '1')} 0%, transparent 40%)`,
             zIndex: 1,
             maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
             WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
             WebkitMaskComposite: 'xor',
             maskComposite: 'exclude',
             padding: '1px',
             pointerEvents: 'none'
           }} />
        )}

        {/* CONTENT LAYER (Elevated in 3D) */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '24px', 
          zIndex: 4, 
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          height: '100%',
          transform: isHovered ? 'translateZ(30px)' : 'translateZ(0)',
          transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
        }}>
          {/* Macro Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: isHovered ? cat.color.replace('0.5', '0.2') : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isHovered ? cat.border : 'rgba(255,255,255,0.1)'}`,
              boxShadow: isHovered ? `0 0 20px ${cat.color}` : 'none',
              transition: 'all 0.4s ease'
            }}>
              {cat.icon}
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              color: '#ffffff',
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px rgba(0,0,0,0.9)'
            }}>
              {cat.name}
            </h3>
          </div>

          {/* Subcategories Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {cat.subcategories.map((sub: any, i: number) => (
              <span key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: '1px solid',
                borderColor: isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '30px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: isHovered ? '#fff' : '#aaa',
                boxShadow: isHovered ? '0 4px 15px rgba(0,0,0,0.4)' : 'none',
                transition: 'all 0.4s ease',
                transitionDelay: `${i * 0.05}s` // staggered animation
              }}>
                <span style={{ opacity: isHovered ? 1 : 0.6 }}>{sub.icon}</span>
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
        if (!isDown && scrollContainer) {
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
      `}</style>
      <div 
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          padding: '40px 5%',
          scrollBehavior: 'auto',
          cursor: 'grab',
          WebkitOverflowScrolling: 'touch',
          perspective: '1200px' // For the 3D cards
        }}
      >
        {[...CATEGORY_STRUCTURE, ...CATEGORY_STRUCTURE].map((cat, idx) => (
          <CategoryCard key={idx} cat={cat} />
        ))}
      </div>
    </div>
  );
}
