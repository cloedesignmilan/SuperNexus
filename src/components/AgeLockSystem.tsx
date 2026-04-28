'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';

export default function AgeLockSystem() {
  const [activeIndex, setActiveIndex] = useState(0);

  const frames = [
    { age: 20, ext: 'png' }, { age: 30, ext: 'png' }, { age: 40, ext: 'png' }, { age: 50, ext: 'png' }, { age: 60, ext: 'jpg' },
    { age: 50, ext: 'png' }, { age: 40, ext: 'png' }, { age: 30, ext: 'png' }
  ];

  useEffect(() => {
    // Crossfade every 2.5 seconds for fluidity
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % frames.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

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
            <UserCheck size={16} /> True Identity Lock
          </div>
          <h2 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-1px'
          }}>
            Absolute Demographic Control. <br />
            <span style={{ color: '#aaa' }}>Age 18 to 60+.</span>
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#888',
            lineHeight: 1.6
          }}>
            Stop settling for generic "flawless 20-something" AI models. Our proprietary Age Lock System lets you target your exact buyer persona with breathtaking, realistic aging—from mature skin textures to natural expression lines.
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
          
          {/* Man Card */}
          <div className="age-card">
            {frames.map((frame, idx) => (
              <img 
                key={`man-${idx}`}
                src={`/age-system/v2/man_${frame.age}.${frame.ext}`} 
                alt={`Man Age ${frame.age}`} 
                className="mezzo-busto"
                style={{
                  opacity: activeIndex === idx ? 1 : 0,
                  transition: 'opacity 1s ease-in-out'
                }}
              />
            ))}
            <div className="age-label">
              <span className="live-dot" />
              Male, Age {frames[activeIndex].age}
            </div>
          </div>

          {/* Woman Card */}
          <div className="age-card">
            {frames.map((frame, idx) => (
              <img 
                key={`woman-${idx}`}
                src={`/age-system/v2/woman_${frame.age}.${frame.ext}`} 
                alt={`Woman Age ${frame.age}`} 
                className="mezzo-busto"
                style={{
                  opacity: activeIndex === idx ? 1 : 0,
                  transition: 'opacity 1s ease-in-out'
                }}
              />
            ))}
            <div className="age-label">
              <span className="live-dot" />
              Female, Age {frames[activeIndex].age}
            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .age-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 3/4;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
          border: 1px solid rgba(255,255,255,0.1);
          background: #111;
        }
        .age-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(204,255,0,0.2);
          z-index: 10;
        }
        .mezzo-busto {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 8%; /* Crop to upper body/face */
          transform: scale(1.6); /* Zoom in for mezzo-busto */
          transform-origin: top center;
          transition: transform 0.5s ease, opacity 1s ease-in-out;
        }
        .age-card:hover .mezzo-busto {
          transform: scale(1.65); /* Slight zoom on hover while maintaining the crop */
        }
        .age-label {
          position: absolute;
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
          .age-card {
            aspect-ratio: auto;
            height: 500px;
          }
        }
      `}} />
    </section>
  );
}
