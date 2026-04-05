"use client";

import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  title: string;
}

export default function ImageComparisonSlider({ beforeImage, afterImage, title }: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => handleMove(e.clientX);
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => handleMove(e.touches[0].clientX);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="slider-wrapper">
      <h3 className="slider-title">✧ {title}</h3>
      <div 
        ref={containerRef}
        className="slider-container"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseLeave={() => setIsDragging(false)}
        onMouseEnter={() => setIsDragging(false)}
        style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
      >
        {/* AFTER IMAGE (Sotto) */}
        <div className="slider-image-layer">
          <img src={afterImage} alt="Dopo" className="slider-img" draggable={false} />
          <div className="slider-label label-after">🤖 DOPO</div>
        </div>

        {/* BEFORE IMAGE (Sopra, tagliata dal clip path) */}
        <div 
          className="slider-image-layer slider-before-layer" 
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img src={beforeImage} alt="Prima" className="slider-img" draggable={false} />
          <div className="slider-label label-before">📸 PRIMA</div>
        </div>

        {/* DRAGGER HANDLE */}
        <div 
          className="slider-handle" 
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          <div className="slider-handle-line"></div>
          <div className="slider-handle-button">
            <ArrowLeftRight size={20} color="#000" />
          </div>
        </div>
      </div>
    </div>
  );
}
