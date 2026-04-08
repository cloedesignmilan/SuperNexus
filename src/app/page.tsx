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

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* HEADER */}
      <header className="landing-header">
        <div className="landing-logo">
          SuperNexus <span>AI</span>
        </div>
        <nav>
          <a href="/admin" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            Accedi
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
            Meno Grucce Tristi.<br />
            <span>Più Vendite Online.</span>
          </h1>
          <p className="hero-subtitle">
            Il software AI indispensabile per Boutique e Negozi di abbigliamento. Scatta una foto col telefono al capo in magazzino e ottieni subito uno shooting iper-realistico perfetto per Facebook, Instagram e il tuo Sito E-Commerce.
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
              ✨ Crea Foto che vendono davvero
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#showcase" className="btn-primary">
              Guarda i Risultati
            </a>
            <a href="#pricing" className="btn-secondary" style={{ padding: '1.2rem 3rem', background: '#FFFFFF' }}>
              Scopri i Piani
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
            <p style={{ color: '#888', fontSize: '1.2rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Immagini Create</p>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} className="hide-mobile"></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
              <Store size={40} color="#03dac6" />
              <h3 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#03dac6', margin: 0, lineHeight: '1' }}>
                <AnimatedCounter endValue={89} duration={2000} />
              </h3>
            </div>
            <p style={{ color: '#888', fontSize: '1.2rem', margin: '0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Negozi Attivi</p>
          </div>
        </div>
      </section>

      {/* VISUAL STORYTELLING */}
      <VisualStorytelling />

      {/* TARGET AUDIENCE */}
      <TargetAudience />

      {/* SHOWCASE DA ZERO */}
      <section id="showcase" className="bento-section" style={{ padding: '4rem 5%', background: '#080808', color: '#fff', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
        <h2 className="section-title" style={{ color: '#fff' }}>Indispensabile per il tuo Negozio.</h2>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          Dalla scatola al web in 30 secondi. Guarda come le foto scattate velocemente nei nostri negozi affiliati si trasformano in immagini perfette per le Campagne Facebook, i Post Instagram e il catalogo del Sito.
        </p>
        <ShowcaseTabs />
      </section>

      {/* BENTO GRID FEATURES (Shortened) */}
      <section id="features" className="bento-section" style={{ marginTop: '8rem' }}>
        <h2 className="section-title">Nessun set fotografico.<br/>Nessuna App da installare.</h2>
        <div className="bento-grid" style={{ marginTop: '4rem' }}>
          
          {/* BENTO 1 */}
          <div className="bento-card bento-half">
            <div className="bento-icon"><Smartphone /></div>
            <h3 className="bento-title">Tutto via chat.</h3>
            <p className="bento-subtitle">Mandi la foto su Telegram, ricevi le versioni perfette. Nessun sito complicato da imparare ad usare e nessuna app da installare.</p>
            <div className="bento-visual-center">
              <AnimatedTelegramMockup />
            </div>
          </div>

          {/* BENTO 2 */}
          <div className="bento-card bento-half" style={{ background: '#111111', color: 'white', display: 'flex', flexDirection: 'column' }}>
            <div className="bento-icon" style={{ background: '#222' }}><TrendingUp color="#ff5470" /></div>
            <h3 className="bento-title" style={{ color: 'white' }}>Taglia i costi<br/>Shooting.</h3>
            <p className="bento-subtitle" style={{ color: '#aaa' }}>Elimina definitivamente il budget mensile per modelle, trucco, fotografi e sale di posa. Tutte le tue creazioni rimangono sempre disponibili nel cloud di Telegram, a portata di tap.</p>
            <ul className="bento-list">
              <li style={{ color: 'white' }}>❌ Nessuna modella da pagare</li>
              <li style={{ color: 'white' }}>❌ Nessun orario da rispettare</li>
              <li style={{ color: 'white' }}>✅ Libreria Media accessibile 24/7</li>
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
        <h2 className="section-title">Inizia a convertire.</h2>
        <div className="pricing-grid">
          
          {/* Starter */}
          <div className="pricing-card">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0' }}>STARTER</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Perfetto per testare l'acqua.</p>
            <div className="pricing-price">€29<span>/mese</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#ff5e00" /> 50 generazioni / mese</li>
              <li><CheckCircle2 size={20} color="#ff5e00" /> Accesso Bot Telegram</li>
              <li><CheckCircle2 size={20} color="#ff5e00" /> Setup veloce</li>
              <li><CheckCircle2 size={20} color="#ff5e00" /> Tutte le nicchie sbloccate</li>
            </ul>
            <button disabled className="btn-secondary" style={{ marginTop: '2rem', opacity: 0.5, cursor: 'not-allowed', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>In Aggiornamento</button>
          </div>

          {/* Retail */}
          <div className="pricing-card popular">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: 'white' }}>RETAIL</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Per scalare i volumi social.</p>
            <div className="pricing-price">€79<span>/mese</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#00ffff" /> <strong>300 generazioni / mese</strong></li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Fedeltà assoluta Nano Pro</li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Priorità Bot GPU Ultra</li>
              <li><CheckCircle2 size={20} color="#00ffff" /> Tutte le nicchie sbloccate</li>
            </ul>
            <button disabled className="btn-secondary" style={{ marginTop: '2rem', padding: '1.2rem', fontWeight: '800', opacity: 0.5, cursor: 'not-allowed', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>In Aggiornamento</button>
          </div>

          {/* Retail Annuale */}
          <div className="pricing-card" style={{ background: 'linear-gradient(180deg, #151515 0%, #0a0a0a 100%)', border: '1px solid #ccff00', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#ccff00', color: '#000', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>
              OFFERTA SPECIALE
            </div>
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: '#ccff00' }}>RETAIL ANNUALE</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Massimo risparmio.</p>
            <div className="pricing-price" style={{ color: 'white' }}>€49<span>/mese</span></div>
            <div style={{ fontSize: '0.85rem', color: '#ccff00', fontWeight: 'bold', marginTop: '-32px', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>Addebito annuale di 588€</div>
            
            <ul className="bento-list" style={{ flex: 1 }}>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> <strong>Tutto il piano Retail</strong></li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Risparmi 360€ all'anno</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Supporto prioritario</li>
              <li style={{ color: '#fff' }}><CheckCircle2 size={20} color="#ccff00" /> Prezzo bloccato 12 Mesi</li>
            </ul>
            <button disabled className="btn-secondary" style={{ marginTop: '2rem', padding: '1.2rem', fontWeight: '800', background: '#333', color: '#888', border: 'none', opacity: 0.5, cursor: 'not-allowed', width: '100%' }}>In Aggiornamento</button>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#888', fontSize: '0.95rem', fontWeight: '500' }}>
            <span style={{color: '#03dac6', marginRight: '6px'}}>✓</span> Puoi disdire in qualsiasi momento. Il piano resterà attivo fino alla scadenza o fino all’utilizzo completo delle immagini.
        </div>
      </section>
      
      <footer style={{ textAlign: 'center', padding: '3rem', color: '#888', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        © 2026 SuperNexus AI. Tutti i diritti riservati.
      </footer>

    </div>
  );
}
