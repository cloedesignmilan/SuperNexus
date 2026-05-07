'use client';

import React from 'react';
import { Sparkles, Layers, Plus, ArrowDown } from 'lucide-react';
import { dictionaries, Locale } from '@/lib/i18n/dictionaries';

export default function SwimwearMixMatch({ lang }: { lang: Locale }) {
  const t = dictionaries[lang].mixMatch;

  return (
    <section style={{ padding: '4rem 1rem 6rem 1rem', background: '#fdfaab'.replace('#fdfaab', '#fdf8f9'), color: '#09090b', overflow: 'hidden', borderTop: '1px solid rgba(255,84,112,0.1)', borderBottom: '1px solid rgba(255,84,112,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
        
        {/* TEXT CONTENT */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 84, 112, 0.1)', border: '1px solid rgba(255, 84, 112, 0.3)', padding: '0.5rem 1rem', borderRadius: '100px', color: '#ff5470', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
            <Layers size={14} />
            {t.tag}
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: '#09090b' }}>
            {t.title1} <br/>
            <span style={{ color: '#ff5470' }}>{t.title2}</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#52525b', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '500px', fontWeight: 500 }}>
            {t.desc}
          </p>
          <a href="#guest-try-out" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ff5470', color: '#fff', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 10px 25px rgba(255, 84, 112, 0.3)' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 84, 112, 0.4)' }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 84, 112, 0.3)' }}>
            <Sparkles size={18} />
            Try the Magic
          </a>
        </div>

        {/* VISUAL SHOWCASE */}
        <div style={{ position: 'relative' }}>
          {/* Decorative Glows */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(255,84,112,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0, filter: 'blur(40px)' }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 1 }}>
            
            {/* INPUTS BOX */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(255,84,112,0.15)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', textAlign: 'center' }}>
                {t.inputs}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', background: '#f4f4f5', padding: '0.5rem', flexShrink: 0 }}>
                  <img src="/vetrina-landing/mixmatch2/bra.png" alt="Bra" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <Plus size={20} color="rgba(0,0,0,0.2)" style={{ flexShrink: 0 }} />
                <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', background: '#f4f4f5', padding: '0.5rem', flexShrink: 0 }}>
                  <img src="/vetrina-landing/mixmatch2/slip.png" alt="Slip" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <Plus size={20} color="rgba(0,0,0,0.2)" style={{ flexShrink: 0 }} />
                <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', background: '#f4f4f5', padding: '0.5rem', flexShrink: 0 }}>
                  <img src="/vetrina-landing/mixmatch2/pareo.png" alt="Pareo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <Plus size={20} color="rgba(0,0,0,0.2)" style={{ flexShrink: 0 }} />
                <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', background: '#f4f4f5', padding: '0.5rem', flexShrink: 0 }}>
                  <img src="/vetrina-landing/mixmatch2/bag.png" alt="Bag" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            </div>

            {/* ARROW */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-1rem 0', zIndex: 2 }}>
              <div style={{ background: '#ffffff', border: '1px solid rgba(255,84,112,0.2)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(255,84,112,0.15)' }}>
                <ArrowDown size={24} color="#ff5470" />
              </div>
            </div>

            {/* OUTPUT BOX */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(255,84,112,0.2)', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(255,84,112,0.15)' }}>
              {/* IMAGE */}
              <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
                <img src="/vetrina-landing/mixmatch2/result.png" alt="Result Outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                
                {/* OVERLAYS */}
                <div style={{ position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,84,112,0.2)', padding: '0.6rem 1.5rem', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                   <div style={{ fontSize: '0.85rem', color: '#09090b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                    <Sparkles size={16} color="#ff5470" /> {t.output}
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                  <CheckCircle2 size={16} color="#34c759" /> 100% Pattern Match
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

// Needed because I used a lucide-react icon not imported at top
import { CheckCircle2 } from 'lucide-react';
