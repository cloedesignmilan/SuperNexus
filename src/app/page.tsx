import React from 'react';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Camera, Zap, Smartphone, TrendingUp, CheckCircle2, Sparkles, Store, Shirt, Footprints, Heart, Briefcase, Baby, Star } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import nextDynamic from 'next/dynamic';
import PhoneMockup from '@/components/PhoneMockup';
import InfiniteShowcase from '@/components/InfiniteShowcase';
import VisualStorytelling from '@/components/VisualStorytelling';
import AgeLockSystem from '@/components/AgeLockSystem';

const AnimatedTelegramMockup = nextDynamic(() => import('@/components/AnimatedTelegramMockup'));
const SocialPostMockup = nextDynamic(() => import('@/components/SocialPostMockup'));
const TargetAudience = nextDynamic(() => import('@/components/TargetAudience'));
const GuestTryOut = nextDynamic(() => import('@/components/GuestTryOut'));
const GalleryMockup = nextDynamic(() => import('@/components/GalleryMockup'));
const Testimonials = nextDynamic(() => import('@/components/Testimonials'));
const DimensionsGuide = nextDynamic(() => import('@/components/DimensionsGuide'));
const PlatformShowcase = nextDynamic(() => import('@/components/PlatformShowcase'));
import ChatBot from '@/components/ChatBot';
import { PRICING_CONFIG } from '@/lib/pricingConfig';
import QuoteCTA from '@/components/QuoteCTA';
import TrackedLink from '@/components/TrackedLink';
import { getShowcaseData } from '@/lib/getShowcaseData';
import PremiumCreazioniShowcase from '@/components/PremiumCreazioniShowcase';
import { getCreazioniTree } from '@/lib/getCreazioniData';
import TshirtEcommerceLanding from '@/components/TshirtEcommerceLanding';
import SwimwearEcommerceLanding from '@/components/SwimwearEcommerceLanding';
import DressEcommerceLanding from '@/components/DressEcommerceLanding';
import ShoesEcommerceLanding from '@/components/ShoesEcommerceLanding';
function getDynamicMetrics() {
  const launchDate = new Date('2026-04-20T00:00:00Z');
  const now = new Date();
  const diffTime = now.getTime() - launchDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  let images = 9987;
  let stores = 89;

  for (let i = 0; i < diffDays; i++) {
    const seed = i + 1;
    // Images: +30 to +100
    const randImages = Math.sin(seed * 1.1) * 10000;
    images += 30 + Math.floor((randImages - Math.floor(randImages)) * 71);

    // Stores: -3 to +4
    const randStores = Math.sin(seed * 1.2) * 10000;
    stores += -3 + Math.floor((randStores - Math.floor(randStores)) * 8);
    if (stores < 80) stores = 80 + Math.floor((randStores - Math.floor(randStores)) * 10);
  }

  return { images, stores };
}

import { cookies } from 'next/headers';
import { dictionaries, Locale } from '@/lib/i18n/dictionaries';
import LanguageDetector from '@/components/LanguageDetector';
import LanguageToggle from '@/components/LanguageToggle';

export default async function LandingPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const hasCookie = !!localeCookie;
  const lang: Locale = (localeCookie?.value as Locale) === 'it' ? 'it' : 'en';
  const t = dictionaries[lang];

  const showcaseData = await getShowcaseData();
  const metrics = getDynamicMetrics();
  const creazioniTree = getCreazioniTree('Creazioni');

  return (
    <div className="landing-container">
      <LanguageDetector hasCookie={hasCookie} />
      <ChatBot />
      {/* HEADER */}
      <header className="landing-header" id="top">
        <style dangerouslySetInnerHTML={{__html: `
          .header-brand-wow {
            font-weight: 900;
            letter-spacing: -1px;
            background: linear-gradient(90deg, #ffffff 0%, #00ffff 33%, #ff0ab3 66%, #ffffff 100%);
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: brandGlowPan 6s ease-in-out infinite;
            transition: transform 0.3s ease;
            display: inline-block;
          }
          .header-brand-wow:hover {
            transform: scale(1.05);
            animation-duration: 2s;
          }
        `}} />
        <a href="/" className="landing-logo header-brand-wow" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          SuperNexus.AI
        </a>
        <nav className="mobile-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <LanguageToggle currentLocale={lang} />
          {/* Conversion Focus */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }} className="desktop-only-nav">
             <a href="#infinite-showcase-section" className="glow-link stagger-anim" style={{ '--glow-color': '#ccff00', animationDelay: '0.1s' } as React.CSSProperties}><Shirt size={14} color="#ffffff" className="glow-icon" /> {t.nav.categories.tshirts}</a>
             <a href="#infinite-showcase-section" className="glow-link stagger-anim" style={{ '--glow-color': '#00ffff', animationDelay: '0.15s' } as React.CSSProperties}><Sparkles size={14} color="#ffffff" className="glow-icon" /> {t.nav.categories.swimwear}</a>
             <a href="#infinite-showcase-section" className="glow-link stagger-anim" style={{ '--glow-color': '#ff5470', animationDelay: '0.2s' } as React.CSSProperties}><Star size={14} color="#ffffff" className="glow-icon" /> {t.nav.categories.ceremony}</a>
             <a href="#infinite-showcase-section" className="glow-link stagger-anim" style={{ '--glow-color': '#bb86fc', animationDelay: '0.3s' } as React.CSSProperties}><Heart size={14} color="#ffffff" className="glow-icon" /> {t.nav.categories.everyday}</a>
             <a href="#infinite-showcase-section" className="glow-link stagger-anim" style={{ '--glow-color': '#03dac6', animationDelay: '0.4s' } as React.CSSProperties}><Footprints size={14} color="#ffffff" className="glow-icon" /> {t.nav.categories.footwear}</a>
          </div>

          <div className="mobile-nav-group" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="/auth" className="stagger-anim mobile-nav-login" style={{ 
              color: '#ffffff', 
              textDecoration: 'none', 
              fontSize: '0.95rem', 
              fontWeight: 600,
              animationDelay: '0.75s',
              opacity: 0.9
            }}>
              {t.nav.login}
            </a>
            <a href="#pricing" className="stagger-anim btn-animated-gradient" style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.9rem', 
              fontWeight: 800,
              borderRadius: '30px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(0, 133, 255, 0.4)',
              animationDelay: '0.8s'
            }}>
              {t.nav.tryFree}
            </a>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes popIn {
              0% { opacity: 0; transform: scale(0.8) translateY(-10px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .stagger-anim {
              opacity: 0;
              animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            .glow-icon {
              color: var(--glow-color, #ffffff) !important;
              stroke: var(--glow-color, #ffffff) !important;
              filter: drop-shadow(0 0 4px var(--glow-color, rgba(255,255,255,0.3)));
              transition: all 0.3s ease;
            }
            .glow-link:hover {
              background: rgba(255, 255, 255, 0.15);
              transform: translateY(-2px);
              box-shadow: 0 4px 15px var(--glow-color, rgba(255,255,255,0.1));
            }
            .glow-link:hover .glow-icon {
              filter: drop-shadow(0 0 10px var(--glow-color, rgba(255,255,255,0.8)));
              transform: scale(1.15);
            }
            @media (max-width: 1024px) {
              .desktop-only-nav {
                display: none !important;
              }
            }
            @media (max-width: 480px) {
              .landing-logo { font-size: 1.25rem !important; }
              .mobile-nav { gap: 0.5rem !important; }
              .mobile-nav-group { gap: 0.75rem !important; }
              .mobile-nav-group .btn-animated-gradient {
                padding: 0.5rem 0.75rem !important;
                font-size: 0.8rem !important;
                white-space: nowrap;
              }
              .mobile-nav-login {
                font-size: 0.85rem !important;
              }
            }
            
            /* Animated AI Border */
            .animated-ai-border {
              background: #fff;
            }
            .animated-ai-border::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: conic-gradient(transparent, transparent, transparent, #ccff00, #ff0ab3, transparent);
              animation: spin-border 4s linear infinite;
              z-index: -2;
            }
            .animated-ai-border::after {
              content: '';
              position: absolute;
              inset: 3px;
              background: #ffffff;
              border-radius: 14px;
              z-index: -1;
            }
            @keyframes spin-border {
              100% { transform: rotate(360deg); }
            }
            .laser-border-red, .laser-border-green {
              position: relative;
              overflow: hidden;
            }
            .laser-border-red::before {
              content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
              background: conic-gradient(transparent, transparent, transparent, #ff5470);
              animation: spin-border 3s linear infinite; z-index: 0;
            }
            .laser-border-red::after {
              content: ''; position: absolute; inset: 1px; background: #0d0d0d; border-radius: 23px; z-index: 1;
            }
            .laser-border-green::before {
              content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
              background: conic-gradient(transparent, transparent, transparent, #ccff00);
              animation: spin-border 3s linear infinite; z-index: 0;
            }
            .laser-border-green::after {
              content: ''; position: absolute; inset: 1px; background: #0d0d0d; border-radius: 23px; z-index: 1;
            }
            .hero-buttons {
              display: flex;
              gap: 1rem;
              justify-content: center;
            }
            @media (max-width: 600px) {
              .hero-buttons {
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                padding: 0 1rem;
              }
              .hero-buttons > * {
                width: 100%;
                text-align: center;
              }
            }
          `}} />
        </nav>
      </header>

      {/* SPECTACULAR HERO SECTION */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        
        {/* Dynamic Video Fast Carousel Background */}
        <div className="dynamic-video-carousel-container">
          <div className="video-carousel-track">
            {/* Desktop Video */}
            <video 
              src="/Video/hero-compresso.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              preload="auto"
              className="carousel-video desktop-video" 
            />
            {/* Mobile Video */}
            <video 
              src="/Video/hero-compresso-mobile.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              preload="auto"
              className="carousel-video mobile-video" 
            />
          </div>
          
          {/* Fade to Black Overlay at the Bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '35%',
            background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)',
            zIndex: 5,
            pointerEvents: 'none'
          }} />
        </div>

        {/* Dynamic Glowing Orbs Background */}
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>

        <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
          
          {/* Floating 3D Cards */}
          <div className="floating-glass-card float-card-1 hide-mobile">
            <span style={{ fontSize: '1.5rem' }}>✨</span> AI Processing
          </div>
          <div className="floating-glass-card float-card-2 hide-mobile">
            <span style={{ fontSize: '1.5rem' }}>🚀</span> +300% Sales
          </div>

          <h1 className="hero-title fade-up-enter delay-1">
            {t.hero.title1}<br />
            <span className="animated-gradient-text">{t.hero.title2}</span>
          </h1>
          <p className="hero-subtitle fade-up-enter delay-2" style={{ fontSize: '1.25rem', color: '#eaeaea', fontWeight: '500' }}>
            {t.hero.subtitle}
          </p>
          <p className="hero-subtitle fade-up-enter delay-3" style={{ fontSize: '1.1rem', color: '#888', marginTop: '-1rem' }}>
            {t.hero.subtitle2}
          </p>
          
          <div className="hero-buttons fade-up-enter delay-4" style={{ alignItems: 'flex-start' }}>
            <div style={{ width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
              <a href="#guest-try-out" className="btn-secondary" style={{ width: '100%', padding: '1.4rem', fontWeight: '900', background: '#ccff00', color: '#000', border: 'none', textAlign: 'center', display: 'block', fontSize: '1.1rem', borderRadius: '100px', cursor: 'pointer', boxShadow: '0 0 20px rgba(204,255,0,0.4)', textDecoration: 'none' }}>{t.hero.tryItFree}</a>
              <span style={{ color: '#888', fontSize: '0.85rem', fontWeight: '600' }}>{t.hero.trusted}</span>
            </div>
            <a href="#showcase" className="btn-secondary" style={{ padding: '1.4rem 3rem', background: '#FFFFFF', color: '#000', whiteSpace: 'nowrap', height: 'fit-content', borderRadius: '100px', textDecoration: 'none', fontWeight: '800' }}>
              {t.hero.seeResults}
            </a>
          </div>
        </div>
      </section>

      {/* METRICHE SOCIAL PROOF */}
      <section style={{ padding: '3rem 5%', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: 'clamp(3rem, 15vw, 7.5rem)', fontWeight: '900', color: '#eaeaea', margin: 0, lineHeight: '1' }}>
                <AnimatedCounter endValue={metrics.images} duration={2500} />
              </h3>
            </div>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800' }}>{t.metrics.images}</p>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} className="hide-mobile"></div>
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: 'clamp(3rem, 15vw, 7.5rem)', fontWeight: '900', color: '#eaeaea', margin: 0, lineHeight: '1' }}>
                <AnimatedCounter endValue={metrics.stores} duration={2000} />
              </h3>
            </div>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800' }}>{t.metrics.stores}</p>
          </div>
        </div>
      </section>

      {/* PAIN, SOLUTION & ECONOMICS SECTIONS */}
      <section style={{ padding: '8rem 5%', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8rem' }}>
          
          {/* PROBLEM SECTION */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '3rem', color: '#fff', lineHeight: 1.1 }}>
              {t.problem.title} <span style={{ color: '#ff5470' }}>{t.problem.titleHighlight}</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', textAlign: 'left' }}>
              {t.problem.pains.map((pain, i) => (
                <div key={i} className="laser-border-red" style={{ borderRadius: '24px', boxShadow: '0 0 25px rgba(255,84,112,0.1)' }}>
                  <div style={{ position: 'relative', zIndex: 2, padding: '2rem', height: '100%', boxShadow: 'inset 0 0 15px rgba(255,84,112,0.05)', borderRadius: '23px' }}>
                    <div style={{ color: '#ff5470', fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.5rem' }}>✕ {pain.title}</div>
                    <p style={{ color: '#aaa', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>{pain.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SOLUTION SECTION */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)', borderRadius: '100px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', color: '#ccff00' }}>
              THE SOLUTION
            </div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff', lineHeight: 1.1 }}>
              {t.solution.title} <br/><span style={{ color: '#a0a0a0' }}>{t.solution.titleHighlight}</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
              {t.solution.subtitle}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left' }}>
              {t.solution.benefits.map((benefit, i) => (
                <div key={i} className="laser-border-green" style={{ borderRadius: '24px', boxShadow: '0 0 25px rgba(204,255,0,0.1)' }}>
                  <div style={{ position: 'relative', zIndex: 2, padding: '2rem', height: '100%', boxShadow: 'inset 0 0 15px rgba(204,255,0,0.05)', borderRadius: '23px' }}>
                    <div style={{ color: '#ccff00', fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.5rem' }}>✓ {benefit.title}</div>
                    <p style={{ color: '#ddd', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ECONOMICS SECTION */}
          <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', padding: '4rem 2rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '1.5rem', color: '#fff' }}>
              {t.economics.title}
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#aaa', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
              {t.economics.text1}<br/>{t.economics.text1Sub}<br/><br/>
              {t.economics.text2}<br/><br/>
              <strong>{t.economics.text3}</strong>
            </p>
            <div style={{ display: 'inline-block', padding: '1rem 2rem', background: 'rgba(204,255,0,0.1)', borderRadius: '16px', border: '1px solid rgba(204,255,0,0.4)' }}>
              <span style={{ display: 'block', color: '#ccff00', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{t.economics.savings}</span>
              <span style={{ display: 'block', color: '#fff', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.05em' }}>{t.economics.savingsValue}</span>
            </div>
          </div>

        </div>
      </section>

      {/* VISUAL STORYTELLING (Magic Scene Variance) */}
      <VisualStorytelling />

      {/* AGE LOCK SYSTEM (Demographic Control) */}
      <AgeLockSystem lang={lang} />

      {/* TARGET AUDIENCE MAP */}
      <TargetAudience lang={lang} />

      {/* T-SHIRT ECOMMERCE SPECIAL SECTION */}
      <TshirtEcommerceLanding lang={lang} />

      {/* SWIMWEAR ECOMMERCE SPECIAL SECTION */}
      <SwimwearEcommerceLanding lang={lang} />

      {/* DRESS ECOMMERCE SPECIAL SECTION */}
      <DressEcommerceLanding lang={lang} />

      {/* SHOES ECOMMERCE SPECIAL SECTION */}
      <ShoesEcommerceLanding lang={lang} />

      {/* SHOWCASE DA ZERO */}
      <section id="showcase" style={{ paddingBottom: '8rem' }}>
        <InfiniteShowcase showcaseData={showcaseData} lang={lang} />
        <GuestTryOut lang={lang} />
      </section>

      {/* DIMENSIONI E FORMATI */}
      <DimensionsGuide lang={lang} />

      {/* CREAZIONI SHOWCASE (PREMIUM) - TEMPORANEAMENTE NASCOSTO SU RICHIESTA */}
      {/* 
      <section style={{ padding: '8rem 5%', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '50%', background: 'radial-gradient(ellipse at top, rgba(204,255,0,0.05), transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-1px', color: '#fff', margin: 0, lineHeight: 1.1 }}>
              {t.creazioniShowcase.title}<span className="animated-gradient-text" style={{ color: '#00ffff' }}>{t.creazioniShowcase.titleHighlight}</span>
            </h2>
            <p style={{ color: '#888', fontSize: '1.2rem', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto 0' }}>
              {t.creazioniShowcase.subtitle}
            </p>
          </div>
          <PremiumCreazioniShowcase initialTree={creazioniTree} lang={lang} />
        </div>
      </section>
      */}

      {/* PIATTAFORME */}
      <PlatformShowcase lang={lang} />

      {/* BENTO GRID FEATURES (Shortened) HIDDEN BY REQUEST */}
      {/* TESTIMONIALS */}
      <Testimonials lang={lang} />

      {/* PRICING */}
      <section id="pricing" className="bento-section" style={{ marginBottom: '8rem', marginTop: '4rem' }}>
        <h2 className="section-title">{t.pricing.title}</h2>
        <div className="pricing-grid">
          
          {/* FREE TRIAL HORIZONTAL BANNERR */}
          <div className="pricing-card" style={{ 
            gridColumn: '1 / -1', 
            border: '2px solid #ff0ab3', 
            background: 'linear-gradient(135deg, rgba(255,10,179,0.08) 0%, rgba(0,0,0,0) 100%)',
            boxShadow: '0 0 20px rgba(255,10,179,0.15)',
            display: 'none',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            padding: '3rem',
            marginBottom: '1rem',
            borderRadius: '16px'
          }}>
            <div style={{ flex: '1 1 300px' }}>
                <h3 className="bento-title" style={{ fontSize: '2.2rem', margin: '0' }}>Start for <span style={{ color: '#ff0ab3', textShadow: '0 0 10px rgba(255,10,179,0.2)' }}>Free</span></h3>
                <p style={{ color: '#888', fontSize: '1.1rem', marginTop: '0.5rem', lineHeight: '1.5' }}>Experience the magic risk-free for 14 days. Instant setup, no credit card required.</p>
            </div>
            
            <ul className="bento-list" style={{ flex: '1 1 200px', margin: 0, padding: 0 }}>
              <li><CheckCircle2 size={24} color="#ff0ab3" /> <strong style={{ fontSize: '1.1rem' }}>10 Free AI Generations</strong></li>
              <li><CheckCircle2 size={24} color="#ff0ab3" /> <span>Instant Web App Setup</span></li>
            </ul>

            <div style={{ flex: '0 0 auto', minWidth: '250px' }}>
                <a href="/auth" className="btn-secondary" style={{ width: '100%', padding: '1.4rem', fontWeight: '900', background: '#ccff00', color: '#000', border: 'none', textAlign: 'center', display: 'block', fontSize: '1.1rem', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 20px rgba(204,255,0,0.4)', textDecoration: 'none' }}>
                  Generate Images That Sell
                </a>
            </div>
          </div>
          
          {/* Starter Pack */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(255,10,179,0.3)' }}>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#fff' }}>STARTER PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>{t.pricing.starter.tag}</p>
            <div className="pricing-price" style={{ color: 'white' }}>${PRICING_CONFIG.starter_pack.price}<span style={{ color: '#888' }}>{t.pricing.starter.per}</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> <strong>{PRICING_CONFIG.starter_pack.images} {t.pricing.starter.features[0]}</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> {t.pricing.starter.features[1]}</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> {t.pricing.starter.features[2]}</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              {t.pricing.starter.features[3]}
            </div>
            <a href="/checkout?plan=starter_pack" className="btn-secondary" style={{ display: 'block', width: '100%', padding: '1.2rem', fontWeight: '800', background: '#ff0ab3', color: '#fff', border: 'none', textAlign: 'center', textDecoration: 'none', borderRadius: '12px' }}>{t.pricing.starter.button}</a>
          </div>

          {/* Retail Pack */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(0,255,255,0.3)' }}>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#fff' }}>RETAIL PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>{t.pricing.retail.tag}</p>
            <div className="pricing-price" style={{ color: 'white' }}>${PRICING_CONFIG.retail_pack.price}<span style={{ color: '#888' }}>{t.pricing.retail.per}</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> <strong>{PRICING_CONFIG.retail_pack.images} {t.pricing.retail.features[0]}</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> Nano Pro absolute fidelity</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> Priority GPU Ultra Bot</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              {t.pricing.retail.features[3]}
            </div>
            <a href="/checkout?plan=retail_pack" className="btn-secondary" style={{ display: 'block', padding: '1.2rem', fontWeight: '800', background: '#00ffff', color: '#000', border: 'none', width: '100%', textAlign: 'center', textDecoration: 'none', borderRadius: '12px' }}>{t.pricing.retail.button}</a>
          </div>

          {/* Retail Subscription */}
          <div className="pricing-card popular" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '2px solid #ccff00', position: 'relative', boxShadow: '0 0 30px rgba(204,255,0,0.15)' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#ccff00', color: '#000', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>
              {t.pricing.subscription.badge}
            </div>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#ccff00' }}>RETAIL MONTHLY</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>{t.pricing.subscription.tag}</p>
            <div className="pricing-price" style={{ color: 'white' }}>${PRICING_CONFIG.retail_monthly.price}<span>{t.pricing.subscription.per}</span></div>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', fontWeight: 'bold', marginTop: '-32px', marginBottom: '1.5rem', position: 'relative', zIndex: 1, opacity: 0 }}>Spacer</div>
            
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> <strong>{PRICING_CONFIG.retail_monthly.images} {t.pricing.subscription.features[0]}</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Nano Pro absolute fidelity</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Priority GPU Ultra Bot</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> All niches unlocked</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', textAlign: 'center', marginBottom: '1.5rem', opacity: 0.8 }}>
              {t.pricing.subscription.extraLabel} <strong>+{PRICING_CONFIG.top_up.images} {t.pricing.subscription.extraDesc} ${PRICING_CONFIG.top_up.price}</strong>
            </div>
            <a href="/checkout?plan=retail_monthly" className="btn-secondary" style={{ display: 'block', padding: '1.2rem', fontWeight: '800', background: '#ccff00', color: '#000', border: 'none', width: '100%', textAlign: 'center', textDecoration: 'none', borderRadius: '12px' }}>{t.pricing.subscription.button}</a>
          </div>

          {/* CUSTOM CATEGORIES HORIZONTAL BANNER */}
          <div className="pricing-card animated-ai-border" style={{ 
            gridColumn: '1 / -1', 
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            padding: '3rem',
            marginTop: '1rem',
            borderRadius: '16px',
            overflow: 'hidden',
            zIndex: 1,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ flex: '1 1 300px', zIndex: 2 }}>
                <h3 className="bento-title" style={{ fontSize: '2.2rem', margin: '0', color: '#000' }}>{t.pricing.custom.title1} <span style={{ color: '#888', textShadow: 'none' }}>{t.pricing.custom.title2}</span></h3>
                <p style={{ color: '#555', fontSize: '1.1rem', marginTop: '0.5rem', lineHeight: '1.5' }}>{t.pricing.custom.subtitle}</p>
            </div>
            
            <ul className="bento-list" style={{ flex: '1 1 200px', margin: 0, padding: 0, zIndex: 2 }}>
              <li><CheckCircle2 size={24} color="#000" /> <strong style={{ fontSize: '1.1rem', color: '#000' }}>{t.pricing.custom.features[0]}</strong></li>
              <li><CheckCircle2 size={24} color="#000" /> <span style={{ fontSize: '1.1rem', color: '#000' }}>{t.pricing.custom.features[1]}</span></li>
            </ul>

            <div style={{ flex: '0 0 auto', minWidth: '250px', zIndex: 2 }}>
                <QuoteCTA lang={lang} />
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#888', fontSize: '0.95rem', fontWeight: '500' }}>
            <span style={{color: '#03dac6', marginRight: '6px'}}>✓</span> {t.pricing.cancelAnytime}
        </div>
      </section>
      <footer style={{ 
        position: 'relative',
        background: '#030303', 
        color: '#fff', 
        padding: '6rem 2rem 3rem', 
        overflow: 'hidden',
        marginTop: '6rem'
      }}>
        {/* Glow effect at the top center */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '500px', height: '1px', background: 'linear-gradient(90deg, transparent, #00ffff, #ff0ab3, transparent)', opacity: 0.8, boxShadow: '0 0 30px 3px rgba(255,10,179,0.4)' }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes brandGlowPan {
                0% { background-position: 0% 50%; filter: drop-shadow(0 0 15px rgba(0,255,255,0.4)); }
                50% { background-position: 100% 50%; filter: drop-shadow(0 0 25px rgba(255,10,179,0.7)); }
                100% { background-position: 0% 50%; filter: drop-shadow(0 0 15px rgba(0,255,255,0.4)); }
              }
              .footer-brand-wow {
                font-size: 3.5rem;
                font-weight: 900;
                letter-spacing: -2px;
                margin-bottom: 1rem;
                background: linear-gradient(90deg, #ffffff 0%, #00ffff 33%, #ff0ab3 66%, #ffffff 100%);
                background-size: 300% 300%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: brandGlowPan 6s ease-in-out infinite;
                transition: transform 0.3s ease;
                cursor: default;
              }
              .footer-brand-wow:hover {
                transform: scale(1.05);
                animation-duration: 2s;
              }
            `}} />
            <h2 className="footer-brand-wow">
                SuperNexus.AI
            </h2>
            <p style={{ maxWidth: '450px', color: '#888', fontSize: '1rem', lineHeight: '1.6', marginBottom: '3rem' }}>
                {t.footer.desc}
            </p>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="mailto:info@supernexusai.com" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}>{t.footer.contact}</a>
                <span style={{ color: '#222' }}>•</span>
                <Link href="#" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}>{t.footer.terms}</Link>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '2rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#444' }}>
                <p>{t.footer.rights}</p>
                <p>{t.footer.slogan}</p>
            </div>
        </div>
      </footer>

    </div>
  );
}
 
