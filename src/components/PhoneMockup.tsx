"use client";
import React, { useState, useEffect } from 'react';

interface PhoneMockupProps {
  imgSrc: string | string[];
  label?: string;
  className?: string;
}

export default function PhoneMockup({ imgSrc, label, className = '' }: PhoneMockupProps) {
  const images = Array.isArray(imgSrc) ? imgSrc : [imgSrc];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={`phone-mockup ${className}`}>
      {label && <div className="mockup-floating-label">{label}</div>}
      <div className="phone-hardware">
        <div className="phone-notch"></div>
        <div className="phone-screen" style={{ position: 'relative' }}>
          {images.map((src, idx) => (
            <img 
              key={src}
              src={src} 
              alt={`Mockup screen ${idx + 1}`} 
              className="phone-image"
              style={{
                position: images.length > 1 ? 'absolute' : 'relative',
                top: 0, left: 0,
                opacity: currentIndex === idx ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                zIndex: currentIndex === idx ? 2 : 1
              }} 
            />
          ))}
          
          {/* Overlay text in English for the native iOS popup on seq1.jpg */}
          {images.length > 1 && currentIndex === 0 && images[0].includes('seq1') && (
            <div style={{
              position: 'absolute',
              bottom: '22%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#f1f1f1',
              color: 'black',
              padding: '1.5rem',
              borderRadius: '24px',
              width: '80%',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              fontSize: '0.95rem',
              fontWeight: 500
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span>🖼️</span> Photo Library
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span>📷</span> Take Photo
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span>📁</span> Choose File
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
