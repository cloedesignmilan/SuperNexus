'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { Locale, dictionaries } from '@/lib/i18n/dictionaries';

interface AgeLockSystemProps {
  lang?: Locale;
}

export default function AgeLockSystem({ lang = 'en' }: AgeLockSystemProps) {
  const t = dictionaries[lang];
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayAge, setDisplayAge] = useState(20);

  // Both models now use a synchronized 2-frame morphing logic (20 -> 50)
  const frames = [{ age: 20 }, { age: 50 }];

  useEffect(() => {
    // Faster morphing crossfade between young and old
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % frames.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const targetAge = frames[activeIndex].age;
    if (displayAge === targetAge) return;

    const duration = 2000; // Match the 2s CSS transition
    const steps = Math.abs(targetAge - displayAge);
    const stepTime = Math.max(20, duration / steps); // Avoid dividing by zero if steps is 0 somehow

    let current = displayAge;
    const increment = targetAge > current ? 1 : -1;

    const timer = setInterval(() => {
      current += increment;
      setDisplayAge(current);
      if (current === targetAge) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  // We explicitly want to trigger this only when activeIndex changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <section style={{
      width: '100%',
      padding: '6rem 2rem',
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden'
    }} id="age-lock-system">
      
      {/* Background accents */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'rgba(204, 255, 0, 0.05)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'rgba(255, 10, 179, 0.05)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(204,255,0,0.1)',
            border: '1px solid rgba(204,255,0,0.2)',
            borderRadius: '30px',
            color: '#ccff00',
            fontWeight: 700,
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            <UserCheck size={16} /> {t.ageLock.tag}
          </div>
          <h2 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-1px'
          }}>
            {t.ageLock.title} <br />
            <span style={{ color: '#aaa' }}>{t.ageLock.subtitle}</span>
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#888',
            lineHeight: 1.6
          }}>
            {t.ageLock.desc1}<br/>
            {t.ageLock.desc2}
          </p>
        </div>

        {/* Image Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          width: '100%',
          maxWidth: '800px' // Restrict max width for just 2 cards
        }}>
          
          {/* Man Floating Model */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div className="model-container">
              {/* Wow Effect: HUD Target Scanner */}
              <div className="hud-glow"></div>
              <div className="hud-background">
                <div className="hud-text">AGE DETECT: LOCK</div>
                <div className="hud-scan-line"></div>
              </div>
              
              {frames.map((frame, idx) => (
                <img 
                  key={`man-${idx}`}
                  src={`/age-system/v2/original/man_${frame.age}.webp`} 
                  alt={`Man Age ${frame.age}`} 
                  className="mezzo-busto shadow-model"
                  style={{
                    opacity: activeIndex === idx ? 1 : 0,
                    transition: 'opacity 2s ease-in-out' /* Faster fade */
                  }}
                />
              ))}
            </div>
            <div className="age-label-floating">
              <span className="live-dot" />
              {t.ageLock.male} {displayAge}
            </div>
          </div>

          {/* Woman Floating Model */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div className="model-container">
              {/* Wow Effect: HUD Target Scanner */}
              <div className="hud-glow"></div>
              <div className="hud-background">
                <div className="hud-text">AGE DETECT: LOCK</div>
                <div className="hud-scan-line"></div>
              </div>

              {frames.map((frame, idx) => (
                <img 
                  key={`woman-${idx}`}
                  src={`/age-system/v2/original/woman_${frame.age}.webp`} 
                  alt={`Woman Age ${frame.age}`} 
                  className="mezzo-busto shadow-model"
                  style={{
                    opacity: activeIndex === idx ? 1 : 0,
                    transition: 'opacity 2s ease-in-out' /* Faster fade */
                  }}
                />
              ))}
            </div>
            <div className="age-label-floating">
              <span className="live-dot" />
              {t.ageLock.female} {displayAge}
            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .model-container {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: transparent;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 80%, transparent 100%), linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 80%, transparent 100%), linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%);
          mask-composite: intersect;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .model-container:hover {
          transform: translateY(-10px) scale(1.02);
          z-index: 10;
        }

        /* WOW Background: HUD Target Scanner */
        .hud-glow {
          position: absolute;
          top: 50%; left: 50%;
          width: 150%; aspect-ratio: 1;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(204, 255, 0, 0.05) 40%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }
        .hud-background {
          position: absolute;
          top: 15%; left: 10%;
          width: 80%; height: 70%;
          border-left: 2px solid rgba(204, 255, 0, 0.4);
          border-right: 2px solid rgba(204, 255, 0, 0.4);
          z-index: 0;
          pointer-events: none;
        }
        .hud-background::before, .hud-background::after {
          content: '';
          position: absolute;
          width: 30px; height: 2px;
          background: rgba(204, 255, 0, 0.8);
        }
        .hud-background::before { top: 0; left: 0; }
        .hud-background::after { bottom: 0; right: 0; }
        
        .hud-text {
          position: absolute;
          top: -25px; left: 0;
          color: rgba(204, 255, 0, 0.8);
          font-family: monospace;
          font-size: 12px;
          letter-spacing: 2px;
          text-shadow: 0 0 5px rgba(204, 255, 0, 0.5);
          animation: blink 2s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .hud-scan-line {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(to bottom, transparent 49%, rgba(204, 255, 0, 0.8) 50%, transparent 51%);
          background-size: 100% 200%;
          animation: hud-scan 3s ease-in-out infinite alternate;
          opacity: 0.6;
          mix-blend-mode: screen;
        }
        @keyframes hud-scan {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }

        .mezzo-busto {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 5%; /* Keep focus near the top/face */
          transform: scale(2.0); /* Even bigger characters */
          transform-origin: top center;
          transition: transform 0.5s ease, opacity 1s ease-in-out;
          z-index: 1; /* Above the aura */
        }
        .model-container:hover .mezzo-busto {
          transform: scale(2.05); /* Slight zoom on hover */
        }
        .shadow-model {
          filter: drop-shadow(0px 20px 30px rgba(0,0,0,0.8));
        }
        .age-label-floating {
          position: relative;
          margin-top: -3.5rem; /* Pull up into the faded area */
          z-index: 20;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 0.8rem 1.5rem;
          border-radius: 30px;
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255,255,255,0.2);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #ccff00;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 10px #ccff00;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(204, 255, 0, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(204, 255, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(204, 255, 0, 0); }
        }
        @media (max-width: 768px) {
          .model-container {
            aspect-ratio: auto;
            height: 400px;
          }
        }
      `}} />
    </section>
  );
}
