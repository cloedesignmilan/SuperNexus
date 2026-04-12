import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, TrendingUp, CheckCircle2, Sparkles, Store } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import AnimatedTelegramMockup from '@/components/AnimatedTelegramMockup';
import PhoneMockup from '@/components/PhoneMockup';
import SocialPostMockup from '@/components/SocialPostMockup';
import ShowcaseTabs from '@/components/ShowcaseTabs';
import VisualStorytelling from '@/components/VisualStorytelling';
import TargetAudience from '@/components/TargetAudience';
import GalleryMockup from '@/components/GalleryMockup';
import Testimonials from '@/components/Testimonials';
import ChatBot from '@/components/ChatBot';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <ChatBot />
      {/* HEADER */}
      <header className="landing-header">
        <div className="landing-logo">
          SuperNexus <span>AI</span>
        </div>
        <nav>
          <a href="/admin" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            Login
          </a>
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
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/registrazione" className="btn-primary" style={{ background: '#0085FF', color: '#fff', fontWeight: '800' }}>
              Start 10-Image Free Trial
            </Link>
            <a href="#showcase" className="btn-secondary" style={{ padding: '1.2rem 3rem', background: '#FFFFFF', color: '#000' }}>
              See the Results
            </a>
          </div>
        </div>
      </section>

      {/* METRICHE SOCIAL PROOF */}
      <section style={{ padding: '3rem 5%', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
              <Sparkles size={40} color="#ccff00" />
              <h3 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#ccff00', margin: 0, lineHeight: '1' }}>
                <AnimatedCounter endValue={9987} duration={2500} />
              </h3>
            </div>
            <p style={{ color: '#888', fontSize: '1.2rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Images Created</p>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} className="hide-mobile"></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
              <Store size={40} color="#03dac6" />
              <h3 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#03dac6', margin: 0, lineHeight: '1' }}>
                <AnimatedCounter endValue={89} duration={2000} />
              </h3>
            </div>
            <p style={{ color: '#888', fontSize: '1.2rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Active Stores</p>
          </div>
        </div>
      </section>

      {/* VISUAL STORYTELLING */}
      <VisualStorytelling />

      {/* TARGET AUDIENCE */}
      <TargetAudience />

      {/* SHOWCASE DA ZERO */}
      <section id="showcase" className="bento-section" style={{ padding: '4rem 5%', background: '#080808', color: '#fff', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
        <h2 className="section-title" style={{ color: '#fff' }}>Indispensable for your Store.</h2>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          From the box to the web in 30 seconds. Watch how quickly taken photos from our affiliated stores are transformed into perfect images for Facebook Campaigns, Instagram Posts, and Website catalogs.
        </p>
        <ShowcaseTabs />
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
                <Link href="/registrazione" className="btn-secondary hover-scale" style={{ width: '100%', padding: '1.4rem', fontWeight: '900', background: '#ff0ab3', color: '#000', border: 'none', textAlign: 'center', display: 'block', transition: 'all 0.2s', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(255,10,179,0.4)', borderRadius: '12px' }}>Start Free Trial Now</Link>
            </div>
          </div>
          
          {/* Starter */}
          <div className="pricing-card">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0' }}>STARTER</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Perfect for testing the first sales.</p>
            <div className="pricing-price">$29<span>/month</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> <strong>100 images / month</strong></li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> Telegram Bot Access</li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> Instant Setup</li>
              <li><CheckCircle2 size={20} color="#ff0ab3" /> All niches unlocked</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              Extra Top-up: <strong>+100 images for $19</strong>
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ width: '100%', padding: '1.2rem', fontWeight: '800', background: '#ff0ab3', color: '#fff', border: 'none', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Get Started</Link>
          </div>

          {/* Retail */}
          <div className="pricing-card popular">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: 'white' }}>RETAIL</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Scale your social volumes.</p>
            <div className="pricing-price">$69<span>/month</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#00ffff" /> <strong>300 images / month</strong></li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Nano Pro absolute fidelity</li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Priority GPU Ultra Bot</li>
              <li><CheckCircle2 size={20} color="#00ffff" /> All niches unlocked</li>
            </ul>
            <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
              Extra Top-up: <strong>+300 images for $49</strong>
            </div>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#00ffff', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Choose Retail</Link>
          </div>

          {/* Retail Annuale */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid #ccff00', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#ccff00', color: '#000', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>
              SPECIAL OFFER
            </div>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#ccff00' }}>RETAIL ANNUAL</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Maximum savings.</p>
            <div className="pricing-price" style={{ color: 'white' }}>$49<span>/month</span></div>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', fontWeight: 'bold', marginTop: '-32px', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>Billed annually at $588</div>
            
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> <strong>300 images unlocked monthly</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Save $240 per year</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Priority Support</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Access to extra top-ups ($49)</li>
            </ul>
            <Link href="/registrazione" className="btn-secondary hover-scale" style={{ padding: '1.2rem', fontWeight: '800', background: '#ccff00', color: '#000', border: 'none', width: '100%', textAlign: 'center', display: 'block', transition: 'transform 0.2s' }}>Claim Offer</Link>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#888', fontSize: '0.95rem', fontWeight: '500' }}>
            <span style={{color: '#03dac6', marginRight: '6px'}}>✓</span> Cancel anytime. Your plan will remain active until expiration or until all images are fully utilized.
        </div>
      </section>
      
      <footer style={{ textAlign: 'center', padding: '3rem', color: '#888', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Support and Assistance: <a href="mailto:info@supernexusai.com" style={{ color: '#ff0ab3', textDecoration: 'none', fontWeight: 'bold' }}>info@supernexusai.com</a></p>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          © 2026 SuperNexus AI. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
