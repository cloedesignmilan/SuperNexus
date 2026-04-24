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
          

        </div>
      </div>
    </div>
  );
}
