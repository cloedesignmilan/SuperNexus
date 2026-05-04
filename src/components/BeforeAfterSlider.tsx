"use client";
import React, { useState, useRef } from 'react';

export default function BeforeAfterSlider({ beforeImage, afterImage }: { beforeImage: string, afterImage: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: 'ew-resize',
        userSelect: 'none'
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Before Image (Background) */}
      <img 
        src={beforeImage} 
        alt="Before" 
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          pointerEvents: 'none'
        }} 
      />

      {/* After Image (Foreground, clipped) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: `${sliderPosition}%`,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <img 
          src={afterImage} 
          alt="After" 
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            maxWidth: 'none',
            pointerEvents: 'none'
          }} 
        />
      </div>

      {/* Slider Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${sliderPosition}%`,
        width: '4px',
        backgroundColor: '#fff',
        transform: 'translateX(-50%)',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}>
          <div style={{ width: '2px', height: '14px', backgroundColor: '#aaa', margin: '0 2px' }} />
          <div style={{ width: '2px', height: '14px', backgroundColor: '#aaa', margin: '0 2px' }} />
        </div>
      </div>
      
      {/* Labels */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', pointerEvents: 'none' }}>ORIGINAL</div>
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(204,255,0,0.8)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', pointerEvents: 'none' }}>GENERATED</div>
    </div>
  );
}
