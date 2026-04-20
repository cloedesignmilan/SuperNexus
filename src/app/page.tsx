import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, TrendingUp, CheckCircle2, Sparkles, Store, Shirt, Footprints, Heart, Briefcase, Baby, Star } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import AnimatedTelegramMockup from '@/components/AnimatedTelegramMockup';
import PhoneMockup from '@/components/PhoneMockup';
import SocialPostMockup from '@/components/SocialPostMockup';
import DynamicShowcase from '@/components/DynamicShowcase';
import ShowcaseCategories from '@/components/ShowcaseCategories';
import VisualStorytelling from '@/components/VisualStorytelling';
import TargetAudience from '@/components/TargetAudience';
import GalleryMockup from '@/components/GalleryMockup';
import Testimonials from '@/components/Testimonials';
import ChatBot from '@/components/ChatBot';
import QuoteCTA from '@/components/QuoteCTA';
import TrackedLink from '@/components/TrackedLink';
import { getShowcaseData } from '@/lib/getShowcaseData';

export default async function LandingPage() {
  const showcaseData = await getShowcaseData();

  return (
    <div className="landing-container">
      <ChatBot />
      {/* HEADER */}
      <header className="landing-header" id="top">
        <a href="#" className="landing-logo" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          SuperNexus <span>AI</span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Conversion Focus */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }} className="desktop-only-nav">
             <a href="#t-shirt-and-knitwear-e-commerce-clean" className="glow-link stagger-anim" style={{ '--glow-color': '#ccff00', animationDelay: '0.1s' } as React.CSSProperties}><Shirt size={16} color="#000000" className="glow-icon" /> T-Shirts</a>
             <a href="#footwear-and-sneakers-product-clean" className="glow-link stagger-anim" style={{ '--glow-color': '#03dac6', animationDelay: '0.2s' } as React.CSSProperties}><Footprints size={16} color="#000000" className="glow-icon" /> Footwear</a>
             <a href="#women's-fashion-outfit-coordination" className="glow-link stagger-anim" style={{ '--glow-color': '#ff5470', animationDelay: '0.3s' } as React.CSSProperties}><Sparkles size={16} color="#000000" className="glow-icon" /> Outfits</a>
             <a href="#bridal-bridal-collection" className="glow-link stagger-anim" style={{ '--glow-color': '#bb86fc', animationDelay: '0.4s' } as React.CSSProperties}><Heart size={16} color="#000000" className="glow-icon" /> Bridal</a>
             <a href="#men's-apparel-executive-lifestyle" className="glow-link stagger-anim" style={{ '--glow-color': '#4d94ff', animationDelay: '0.5s' } as React.CSSProperties}><Briefcase size={16} color="#000000" className="glow-icon" /> Men's Suits</a>
             <a href="#kids-collection-elegant-event" className="glow-link stagger-anim" style={{ '--glow-color': '#ffaa00', animationDelay: '0.6s' } as React.CSSProperties}><Baby size={16} color="#000000" className="glow-icon" /> Kids</a>
             <a href="#women's-fashion-runway-editorial" className="glow-link stagger-anim" style={{ '--glow-color': '#ff0055', animationDelay: '0.7s' } as React.CSSProperties}><Star size={16} color="#000000" className="glow-icon" /> Runway</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <a href="#pricing" className="stagger-anim" style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.9rem', 
              fontWeight: 800,
              background: '#ccff00', 
              color: '#000',
              borderRadius: '30px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(204,255,0,0.3)',
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
              padding: 6px 14px;
              border-radius: 30px;
              background: #ffffff; /* White background like Try it Free */
              border: 1px solid #eeeeee;
              transition: all 0.3s ease;
              color: #000000 !important; /* Black text */
              display: flex;
              align-items: center;
              gap: 8px;
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
              stroke: #0085FF;
              filter: drop-shadow(0 0 8px rgba(0, 133, 255, 0.6));
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

      {/* HERO SECTION */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', minWidth: '1000px', height: '100%', zIndex: 0, opacity: 0.08, mixBlendMode: 'multiply', pointerEvents: 'none' }}>
           <img src="/hero-bg.png" alt="Magical Flow" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>

        <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
          <h1 className="hero-title">
            Fewer boring hangers.<br />
            <span>More online sales.</span>
          </h1>
          <p className="hero-subtitle">
            The indispensable AI software for Boutiques and Clothing Stores. Snap a quick photo of the garment in your warehouse and instantly get a hyper-realistic shooting perfect for Facebook, Instagram, and your E-Commerce.
          </p>
          <div style={{ 
            background: 'linear-gradient(135deg, #111, #222)', 
            display: 'inline-block', 
            padding: '0.8rem 1.8rem', 
            borderRadius: '50px', 
            marginBottom: '3rem', 
            border: '1px solid rgba(0,0,0,0.8)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }}>
            <p style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              ✨ Create Photos that actually sell
            </p>
          </div>
          <div className="hero-buttons">
            <TrackedLink href="/registrazione?plan=free_trial" className="btn-primary" style={{ background: '#0085FF', color: '#fff', fontWeight: '800', whiteSpace: 'nowrap' }} eventName="InitiateCheckout">
              Start 10-Image Free Trial
            </TrackedLink>
            <a href="#showcase" className="btn-secondary" style={{ padding: '1.2rem 3rem', background: '#FFFFFF', color: '#000', whiteSpace: 'nowrap' }}>
              See the Results
            </a>
          </div>
        </div>
      </section>

      {/* METRICHE SOCIAL PROOF */}
      <section style={{ padding: '3rem 5%', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '5rem', fontWeight: '900', color: '#ccff00', margin: 0, lineHeight: '1' }}>
                <AnimatedCounter endValue={9987} duration={2500} />
              </h3>
            </div>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800' }}>Images Created</p>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} className="hide-mobile"></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '5rem', fontWeight: '900', color: '#03dac6', margin: 0, lineHeight: '1' }}>
                <AnimatedCounter endValue={89} duration={2000} />
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
      <section id="showcase" style={{ padding: '4rem 0', background: '#080808', color: '#fff', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
        <h2 className="section-title" style={{ color: '#fff', textAlign: 'center' }}>Indispensable for your Store.</h2>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '3rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem' }}>
          From the box to the web: 1 photo in less than 30 seconds, and 5 photos in about 120 seconds. Watch how quickly taken photos from our affiliated stores are transformed into perfect images for Facebook Campaigns, Instagram Posts, and Website catalogs.
        </p>

        <ShowcaseCategories />

        <div style={{ textAlign: 'center', marginTop: '6rem', marginBottom: '4rem', padding: '0 20px' }}>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: 800, 
            letterSpacing: '-0.03em', 
            background: 'linear-gradient(to right, #fff, #888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Endless Possibilities
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#888', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Explore a few examples of how we transform simple product photos into stunning editorial campaigns and lifestyle scenes.
          </p>
        </div>

        <DynamicShowcase showcaseData={showcaseData} />
      </section>

      {/* BENTO GRID FEATURES (Shortened) */}
      <section id="features" className="bento-section" style={{ marginTop: '8rem' }}>
        <h2 className="section-title">No photo sets.<br/>No Apps to install.</h2>
        <div className="bento-grid" style={{ marginTop: '4rem' }}>
          
          {/* BENTO 1 */}
          <div className="bento-card bento-half">
            <div className="bento-icon"><Smartphone /></div>
            <h3 className="bento-title">Everything via chat.</h3>
            <p className="bento-subtitle">Send the photo on Telegram, get perfect versions back. No complicated website to learn and no app to install on your device.</p>
            <div className="bento-visual-center">
              <AnimatedTelegramMockup />
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
              <GalleryMockup />
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
              <li><CheckCircle2 size={24} color="#ff0ab3" /> <span>1-Click Telegram Setup</span></li>
            </ul>

            <div style={{ flex: '0 0 auto', minWidth: '250px' }}>
                <Link href="/registrazione?plan=free_trial" className="btn-secondary hover-scale" style={{ width: '100%', padding: '1.4rem', fontWeight: '900', background: '#ff0ab3', color: '#000', border: 'none', textAlign: 'center', display: 'block', transition: 'all 0.2s', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(255,10,179,0.4)', borderRadius: '12px' }}>Start Free Trial Now</Link>
            </div>
          </div>
          
          {/* Starter Pack */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(255,10,179,0.3)' }}>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#fff' }}>STARTER PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Perfect for testing without subscription.</p>
            <div className="pricing-price" style={{ color: 'white' }}>$29<span style={{ color: '#888' }}>/one-time</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> <strong>100 images</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> Telegram Bot Access</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> Instant Setup</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ff0ab3" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              No expiration date
            </div>
            <Link href="/registrazione?plan=starter_pack" className="btn-secondary hover-scale" style={{ width: '100%', padding: '1.2rem', fontWeight: '800', background: '#ff0ab3', color: '#fff', border: 'none', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Get Starter Pack</Link>
          </div>

          {/* Retail Pack */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid rgba(0,255,255,0.3)' }}>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#fff' }}>RETAIL PACK</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your volumes without a subscription.</p>
            <div className="pricing-price" style={{ color: 'white' }}>$69<span style={{ color: '#888' }}>/one-time</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> <strong>300 images</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> Nano Pro absolute fidelity</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> Priority GPU Ultra Bot</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#00ffff" /> No recurring fees</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              No expiration date
            </div>
            <Link href="/registrazione?plan=retail_pack" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#00ffff', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Get Retail Pack</Link>
          </div>

          {/* Retail Subscription */}
          <div className="pricing-card popular" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '2px solid #ccff00', position: 'relative', boxShadow: '0 0 30px rgba(204,255,0,0.15)' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#ccff00', color: '#000', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>
              POPULAR
            </div>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#ccff00' }}>RETAIL MONTHLY</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your social volumes.</p>
            <div className="pricing-price" style={{ color: 'white' }}>$59<span>/month</span></div>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', fontWeight: 'bold', marginTop: '-32px', marginBottom: '1.5rem', position: 'relative', zIndex: 1, opacity: 0 }}>Spacer</div>
            
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> <strong>300 images unlocked monthly</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Nano Pro absolute fidelity</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Priority GPU Ultra Bot</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> All niches unlocked</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', textAlign: 'center', marginBottom: '1.5rem', opacity: 0.8 }}>
              Extra Top-up: <strong>+300 images for $49</strong>
            </div>
            <Link href="/registrazione?plan=retail_monthly" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#ccff00', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Subscribe Now</Link>
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
                <Link href="/registrazione?plan=free_trial" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}>Start Free Trial</Link>
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
