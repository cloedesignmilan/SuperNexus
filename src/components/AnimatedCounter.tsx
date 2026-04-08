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

  const fullText = `${prefix}${formattedCount}${suffix}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .split-flap-container {
          display: inline-flex;
          gap: 6px;
        }
        .flap-digit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #151515;
          color: inherit;
          border: 2px solid #2a2a2a;
          border-radius: 6px;
          padding: 0 12px;
          min-width: 1.5ch;
          position: relative;
          box-shadow: 0 8px 15px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.15);
          overflow: hidden;
          font-family: monospace;
          line-height: 1.2;
          font-weight: 800;
        }
        .flap-digit::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 3px;
          background: #000;
          box-shadow: 0 1px 0 rgba(255,255,255,0.1);
          z-index: 10;
          transform: translateY(-50%);
        }
        .flap-symbol {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 2px;
          font-family: inherit;
          font-weight: 900;
        }
      `}} />
      <span ref={ref} className="split-flap-container">
        {fullText.split('').map((char, i) => {
          if (/[0-9]/.test(char)) {
            return <span key={i} className="flap-digit">{char}</span>;
          }
          return <span key={i} className="flap-symbol">{char}</span>;
        })}
      </span>
    </>
  );
}
