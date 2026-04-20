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
          align-items: center;
          gap: 0.1em;
        }
        .flap-digit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%);
          color: inherit;
          border: 1px solid #2a2a2a;
          border-radius: 0.15em;
          padding: 0 0.05em;
          width: 0.65em;
          height: 1.5em;
          position: relative;
          box-shadow: 0 0.15em 0.5em rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1);
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-weight: 900;
          line-height: 1;
        }
        .flap-digit span {
          transform: scaleY(1.3) scaleX(0.9);
        }
        .flap-digit::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 50%;
          background: rgba(255,255,255,0.05);
          z-index: 1;
        }
        .flap-digit::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: #000;
          box-shadow: 0 1px 0 rgba(255,255,255,0.15);
          z-index: 10;
          transform: translateY(-50%);
        }
        .flap-symbol {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.15em;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-weight: 900;
          line-height: 1;
          font-size: 0.5em;
        }
      `}} />
      <span ref={ref} className="split-flap-container">
        {fullText.split('').map((char, i) => {
          if (/[0-9]/.test(char)) {
            return <span key={i} className="flap-digit"><span>{char}</span></span>;
          }
          return <span key={i} className="flap-symbol">{char}</span>;
        })}
      </span>
    </>
  );
}
