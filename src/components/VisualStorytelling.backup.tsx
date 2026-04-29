"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const STORY_SLIDES = [
  {
    image: '/story-wow/001.webp',
    title: 'Take pictures like this?',
    description: 'Real photos... but they don\'t sell.',
  },
  {
    image: '/story-wow/002.webp',
    title: 'AI transforms them',
    description: 'Same product. Completely different result.',
  },
  {
    image: '/story-wow/003.webp',
    title: 'Publish in a snap',
    description: 'Ready for Instagram and your shop.',
  },
  {
    image: '/story-wow/004.webp',
    title: 'And customers buy',
    description: 'From photo to sale, in seconds.',
  }
];

export default function VisualStorytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const scrollableDistance = height - windowHeight;
      let currentProgress = -top / scrollableDistance;
      
      currentProgress = Math.max(0, Math.min(1, currentProgress));
      setProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const segmentLength = 1 / (STORY_SLIDES.length - 1);

  return (
    <section ref={containerRef} style={{ height: '300vh', position: 'relative', background: '#000' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        
        {STORY_SLIDES.map((slide, index) => {
          const slideTargetProgress = index * segmentLength;
          const distance = Math.abs(progress - slideTargetProgress);
          
          let opacity = 1 - (distance / (segmentLength * 0.8));
          opacity = Math.max(0, Math.min(1, opacity));
          
          const scale = 1 + (0.05 * distance);
          const translateY = distance * 40;

          return (
            <div 
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: opacity,
                pointerEvents: opacity > 0.1 ? 'auto' : 'none',
                zIndex: opacity > 0 ? 10 : 0,
                transition: 'opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                transform: `scale(${scale})`, 
                transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                willChange: 'transform'
              }}>
                <Image 
                  src={slide.image} 
                  alt={slide.title} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  priority={index === 0}
                />
              </div>
              
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.4) 100%)',
              }} />
              
              <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '5%',
                right: '5%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transform: `translateY(${translateY}px)`,
                transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              }}>
                <div style={{
                  background: 'rgba(10, 10, 10, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  padding: '2rem 3rem',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  maxWidth: '800px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                  <h2 style={{ 
                    fontSize: 'clamp(2rem, 5vw, 4rem)', 
                    fontWeight: 900, 
                    color: '#fff', 
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em',
                    textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                  }}>
                    {slide.title}
                  </h2>
                  <p style={{ 
                    fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', 
                    color: '#ddd', 
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div style={{
          position: 'absolute',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 20
        }}>
          {STORY_SLIDES.map((_, index) => {
            const slideTargetProgress = index * segmentLength;
            const distance = Math.abs(progress - slideTargetProgress);
            const isActive = distance < (segmentLength / 2);
            
            return (
              <div 
                key={index} 
                style={{
                  width: '4px',
                  height: isActive ? '32px' : '12px',
                  background: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
