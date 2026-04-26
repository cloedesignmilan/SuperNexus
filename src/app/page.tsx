import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, TrendingUp, CheckCircle2, Sparkles, Store, Shirt, Footprints, Heart, Briefcase, Baby, Star } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import AnimatedTelegramMockup from '@/components/AnimatedTelegramMockup';
import PhoneMockup from '@/components/PhoneMockup';
import SocialPostMockup from '@/components/SocialPostMockup';
import InfiniteShowcase from '@/components/InfiniteShowcase';
import VisualStorytelling from '@/components/VisualStorytelling';
import TargetAudience from '@/components/TargetAudience';
import GalleryMockup from '@/components/GalleryMockup';
import Testimonials from '@/components/Testimonials';
import ChatBot from '@/components/ChatBot';
import { PRICING_CONFIG } from '@/lib/pricingConfig';
import QuoteCTA from '@/components/QuoteCTA';
import TrackedLink from '@/components/TrackedLink';
import WaitlistButton from '@/components/WaitlistButton';
import { getShowcaseData } from '@/lib/getShowcaseData';

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

export default async function LandingPage() {
  const showcaseData = await getShowcaseData();
  const metrics = getDynamicMetrics();

  return (
    <div className="landing-container">
      <ChatBot />
      {/* HEADER */}
      <header className="landing-header" id="top">
        <a href="/" className="landing-logo" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          SuperNexus <span className="animated-gradient-text">AI</span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
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
             <a href="#category-t-shirts" className="glow-link stagger-anim" style={{ '--glow-color': '#ccff00', animationDelay: '0.1s' } as React.CSSProperties}><Shirt size={14} color="#000000" className="glow-icon" /> T-Shirts</a>
             <a href="#category-swimwear" className="glow-link stagger-anim" style={{ '--glow-color': '#00ffff', animationDelay: '0.15s' } as React.CSSProperties}><Sparkles size={14} color="#000000" className="glow-icon" /> Swimwear</a>
             <a href="#category-footwear" className="glow-link stagger-anim" style={{ '--glow-color': '#03dac6', animationDelay: '0.2s' } as React.CSSProperties}><Footprints size={14} color="#000000" className="glow-icon" /> Footwear</a>
             <a href="#category-women" className="glow-link stagger-anim" style={{ '--glow-color': '#ff5470', animationDelay: '0.3s' } as React.CSSProperties}><Heart size={14} color="#000000" className="glow-icon" /> Outfits</a>
             <a href="#category-bridal" className="glow-link stagger-anim" style={{ '--glow-color': '#bb86fc', animationDelay: '0.4s' } as React.CSSProperties}><Heart size={14} color="#000000" className="glow-icon" /> Bridal</a>
             <a href="#category-men" className="glow-link stagger-anim" style={{ '--glow-color': '#4d94ff', animationDelay: '0.5s' } as React.CSSProperties}><Briefcase size={14} color="#000000" className="glow-icon" /> Men's Suits</a>
             <a href="#category-kids" className="glow-link stagger-anim" style={{ '--glow-color': '#ffaa00', animationDelay: '0.6s' } as React.CSSProperties}><Baby size={14} color="#000000" className="glow-icon" /> Kids</a>
             <a href="#category-women" className="glow-link stagger-anim" style={{ '--glow-color': '#ff0055', animationDelay: '0.7s' } as React.CSSProperties}><Star size={14} color="#000000" className="glow-icon" /> Runway</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="/auth" className="stagger-anim" style={{ 
              color: '#ffffff', 
              textDecoration: 'none', 
              fontSize: '0.95rem', 
              fontWeight: 600,
              animationDelay: '0.75s',
              opacity: 0.9
            }}>
              Login
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
              Try it Free
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
            .glow-link {
              text-decoration: none;
              padding: 4px 10px;
              border-radius: 30px;
              background: #ffffff; /* White background like Try it Free */
              border: 1px solid #eeeeee;
              transition: all 0.3s ease;
              color: #000000 !important; /* Black text */
              display: flex;
              align-items: center;
              gap: 6px;
              font-weight: 600;
              box-shadow: 0 2px 10px rgba(255,255,255,0.1);
              white-space: nowrap;
            }
            .glow-icon {
              transition: all 0.3s ease;
            }
            .glow-link:hover {
              background: #f8f8f8;
              border-color: #ddd;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              transform: translateY(-2px);
            }
            .glow-link:hover .glow-icon {
              stroke: #ccff00;
              filter: drop-shadow(0 0 8px rgba(204, 255, 0, 0.6));
              transform: scale(1.1);
            }
            @media (max-width: 1024px) {
              .desktop-only-nav {
                display: none !important;
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
            Fewer boring hangers.<br />
            <span className="animated-gradient-text">More online sales.</span>
          </h1>
          <p className="hero-subtitle fade-up-enter delay-2">
            The indispensable AI software for Boutiques and Clothing Stores. Snap a quick photo of the garment in your warehouse and instantly get a hyper-realistic shooting perfect for Facebook, Instagram, and your E-Commerce.
          </p>
          <h2 className="fade-up-enter delay-3" style={{ 
            fontSize: '2rem', 
            fontWeight: '800', 
            marginBottom: '3rem', 
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#ffffff',
            display: 'inline-block'
          }}>
            ✨ Create Photos that actually sell
          </h2>
          <div className="hero-buttons fade-up-enter delay-4">
            <div style={{ width: '100%', maxWidth: '250px' }}>
              <WaitlistButton />
            </div>
            <a href="#showcase" className="btn-secondary" style={{ padding: '1.2rem 3rem', background: '#FFFFFF', color: '#000', whiteSpace: 'nowrap' }}>
              See the Results
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
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800' }}>Images Created</p>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} className="hide-mobile"></div>
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: 'clamp(3rem, 15vw, 7.5rem)', fontWeight: '900', color: '#eaeaea', margin: 0, lineHeight: '1' }}>
                <AnimatedCounter endValue={metrics.stores} duration={2000} />
              </h3>
            </div>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800' }}>Active Stores</p>
          </div>
        </div>
      </section>

      {/* VISUAL STORYTELLING */}
      <VisualStorytelling />

      {/* TARGET AUDIENCE */}
      <TargetAudience />

      {/* SHOWCASE DA ZERO */}
      <section id="showcase">
        <InfiniteShowcase showcaseData={showcaseData} />
      </section>

      {/* BENTO GRID FEATURES (Shortened) */}
      <section id="features" className="bento-section" style={{ marginTop: '8rem' }}>
        <h2 className="section-title">No photo sets.<br/>No Apps to install.</h2>
        <div className="bento-grid" style={{ marginTop: '4rem' }}>
          
          {/* BENTO 1 */}
          <div className="bento-card bento-half">
            <div className="bento-icon"><Smartphone /></div>
            <h3 className="bento-title">Everything via Web App.</h3>
            <p className="bento-subtitle">Upload the photo on the Dashboard, get perfect versions back. Secure and mobile-first, with no apps to install on your device.</p>
            <div className="bento-visual-center">
              <PhoneMockup imgSrc={['/immagini/seq01.png', '/immagini/seq02.png', '/immagini/seq03.jpg', '/immagini/seq04.jpg', '/immagini/seq05.jpg']} />
            </div>
          </div>

          {/* BENTO 2 */}
          <div className="bento-card bento-half" style={{ background: '#111111', color: 'white', display: 'flex', flexDirection: 'column' }}>
            <div className="bento-icon" style={{ background: '#222' }}><TrendingUp color="#ff5470" /></div>
            <h3 className="bento-title" style={{ color: 'white' }}>Cut Shooting Costs.</h3>
            <p className="bento-subtitle" style={{ color: '#aaa' }}>Eliminate the monthly budget for models, makeup artists, photographers, and studios once and for all. All your creations remain accessible 24/7 in your Telegram cloud.</p>
            <ul className="bento-list">
              <li style={{ color: 'white' }}>❌ No models to pay</li>
              <li style={{ color: 'white' }}>❌ No schedules to meet</li>
              <li style={{ color: 'white' }}>✅ Media library accessible 24/7</li>
            </ul>
            
            {/* GALLERIA MOCKUP ROOT */}
            <div className="bento-visual-center" style={{ marginBottom: '-250px' }}>
              <PhoneMockup imgSrc="/immagini/gallery-mockup.jpg" />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* PRICING */}
      <section id="pricing" className="bento-section" style={{ marginBottom: '8rem', marginTop: '4rem' }}>
        <h2 className="section-title">Start converting today.</h2>
        <div className="pricing-grid">
          
          {/* FREE TRIAL HORIZONTAL BANNERR */}
          <div className="pricing-card" style={{ 
            gridColumn: '1 / -1', 
            border: '2px solid #ff0ab3', 
            background: 'linear-gradient(135deg, rgba(255,10,179,0.08) 0%, rgba(0,0,0,0) 100%)',
            boxShadow: '0 0 20px rgba(255,10,179,0.15)',
            display: 'flex',
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
                <WaitlistButton />
            </div>
          </div>
          
          {/* Starter Pack */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(255,10,179,0.3)' }}>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#fff' }}>STARTER PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Perfect for testing without subscription.</p>
            <div className="pricing-price" style={{ color: 'white' }}>${PRICING_CONFIG.starter_pack.price}<span style={{ color: '#888' }}>/one-time</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> <strong>{PRICING_CONFIG.starter_pack.images} images</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> Web App Dashboard Access</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> Instant Setup</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              No expiration date
            </div>
            <button disabled className="btn-secondary" style={{ width: '100%', padding: '1.2rem', fontWeight: '800', background: '#ff0ab3', color: '#fff', border: 'none', textAlign: 'center', display: 'block', opacity: 0.5, cursor: 'not-allowed' }}>Currently Updating</button>
          </div>

          {/* Retail Pack */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(0,255,255,0.3)' }}>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#fff' }}>RETAIL PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your volumes without a subscription.</p>
            <div className="pricing-price" style={{ color: 'white' }}>${PRICING_CONFIG.retail_pack.price}<span style={{ color: '#888' }}>/one-time</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> <strong>{PRICING_CONFIG.retail_pack.images} images</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> Nano Pro absolute fidelity</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> Priority GPU Ultra Bot</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              No expiration date
            </div>
            <button disabled className="btn-secondary" style={{ padding: '1.2rem', fontWeight: '800', background: '#00ffff', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', opacity: 0.5, cursor: 'not-allowed' }}>Currently Updating</button>
          </div>

          {/* Retail Subscription */}
          <div className="pricing-card popular" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '2px solid #ccff00', position: 'relative', boxShadow: '0 0 30px rgba(204,255,0,0.15)' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#ccff00', color: '#000', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>
              POPULAR
            </div>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#ccff00' }}>RETAIL MONTHLY</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your social volumes.</p>
            <div className="pricing-price" style={{ color: 'white' }}>${PRICING_CONFIG.retail_monthly.price}<span>/month</span></div>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', fontWeight: 'bold', marginTop: '-32px', marginBottom: '1.5rem', position: 'relative', zIndex: 1, opacity: 0 }}>Spacer</div>
            
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> <strong>{PRICING_CONFIG.retail_monthly.images} images unlocked monthly</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Nano Pro absolute fidelity</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Priority GPU Ultra Bot</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> All niches unlocked</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', textAlign: 'center', marginBottom: '1.5rem', opacity: 0.8 }}>
              Extra Top-up: <strong>+{PRICING_CONFIG.top_up.images} images for ${PRICING_CONFIG.top_up.price}</strong>
            </div>
            <button disabled className="btn-secondary" style={{ padding: '1.2rem', fontWeight: '800', background: '#ccff00', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', opacity: 0.5, cursor: 'not-allowed' }}>Currently Updating</button>
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
                <h3 className="bento-title" style={{ fontSize: '2.2rem', margin: '0', color: '#000' }}>Custom <span style={{ color: '#888', textShadow: 'none' }}>AI Models</span></h3>
                <p style={{ color: '#555', fontSize: '1.1rem', marginTop: '0.5rem', lineHeight: '1.5' }}>Train the AI exactly on your brand's aesthetic. Perfect for unique niches and specialized catalogs.</p>
            </div>
            
            <ul className="bento-list" style={{ flex: '1 1 200px', margin: 0, padding: 0, zIndex: 2 }}>
              <li><CheckCircle2 size={24} color="#000" /> <strong style={{ fontSize: '1.1rem', color: '#000' }}>Bespoke Categories</strong></li>
              <li><CheckCircle2 size={24} color="#000" /> <span style={{ fontSize: '1.1rem', color: '#000' }}>Custom Subcategories</span></li>
            </ul>

            <div style={{ flex: '0 0 auto', minWidth: '250px', zIndex: 2 }}>
                <QuoteCTA />
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#888', fontSize: '0.95rem', fontWeight: '500' }}>
            <span style={{color: '#03dac6', marginRight: '6px'}}>✓</span> Cancel anytime. Your plan will remain active until expiration or until all images are fully utilized.
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
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #a0a0a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SuperNexus<span style={{color: '#ff0ab3', WebkitTextFillColor: '#ff0ab3'}}>.</span>AI
            </h2>
            <p style={{ maxWidth: '450px', color: '#888', fontSize: '1rem', lineHeight: '1.6', marginBottom: '3rem' }}>
                The ultimate AI generative engine built exclusively for fashion e-commerce. Scale your social volumes, reduce photography costs, and drive higher conversions.
            </p>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="mailto:info@supernexusai.com" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}>Contact Support</a>
                <span style={{ color: '#222' }}>•</span>
                <span style={{ color: '#555', fontSize: '0.9rem', fontWeight: '500' }}>Temporarily Paused</span>
                <span style={{ color: '#222' }}>•</span>
                <Link href="#" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}>Terms & Privacy</Link>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '2rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#444' }}>
                <p>© 2025 SuperNexus AI. All rights reserved.</p>
                <p>Engineered for High-Performance Generative Fashion.</p>
            </div>
        </div>
      </footer>

    </div>
  );
}
