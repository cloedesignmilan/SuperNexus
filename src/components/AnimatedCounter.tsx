"use client";
import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({ 
  endValue, 
  duration = 2000, 
  prefix = '+',
  suffix = '',
  includeDot = true
}: { 
  endValue: number, 
  duration?: number,
  prefix?: string,
  suffix?: string,
  includeDot?: boolean
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setCount(endValue);
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let startTimestamp: number | null = null;
        
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          
          // Easing function outQuart
          const easeOut = 1 - Math.pow(1 - progress, 4);
          const currentCount = Math.floor(easeOut * endValue);
          
          setCount(currentCount);
          
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            setCount(endValue);
          }
        };
        
        window.requestAnimationFrame(step);
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [endValue, duration, hasAnimated]);

  const formattedCount = includeDot && count > 999 
    ? count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") 
    : count.toString();

  return <span ref={ref}>{prefix}{formattedCount}{suffix}</span>;
}
