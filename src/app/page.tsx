import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import AnimatedTelegramMockup from '@/components/AnimatedTelegramMockup';
import GalleryMockup from '@/components/GalleryMockup';

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* HEADER */}
      <header className="landing-header">
        <div className="landing-logo">
          <Sparkles size={24} color="#0085FF" />
          SuperNexus <span>AI</span>
        </div>
        <nav>
          <a href="/admin" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            Accedi
          </a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Dal manichino allo shooting.<br />
            <span>In 30 secondi.</span>
          </h1>
          <p className="hero-subtitle">
            Il primo assistente IA su Telegram che trasforma fotocopie sbiadite e grucce tristi in editoriali di moda iperrealistici. Scatta, invia e pubblica.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#pricing" className="btn-primary">
              Inizia a Vendere
            </a>
            <a href="#features" className="btn-secondary" style={{ padding: '1.2rem 3rem', background: '#FFFFFF' }}>
              Scopri Come
            </a>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section id="features" className="bento-section">
        <h2 className="section-title">Zero attrito.<br />Massimo risultato.</h2>
        <div className="bento-grid" style={{ marginTop: '4rem' }}>
          
          {/* BENTO 1: Usa solo lo smartphone (HALF) */}
          <div className="bento-card bento-half">
            <div className="bento-icon"><Smartphone /></div>
            <h3 className="bento-title">Usa solo lo<br/>Smartphone.</h3>
            <p className="bento-subtitle">Niente computer, niente app lente da scaricare. Apri Telegram, mandi una foto, e in meno di un minuto ottieni uno shooting pronto per Instagram.</p>
            <div className="bento-visual-center">
              <AnimatedTelegramMockup />
            </div>
          </div>

          {/* BENTO 2: Galleria (HALF) */}
          <div className="bento-card bento-half">
            <div className="bento-icon"><Camera /></div>
            <h3 className="bento-title">Tutto salvato in<br/>Galleria.</h3>
            <p className="bento-subtitle">I tuoi abiti reimmaginati vengono inviati direttamente in Chat. Un tap e li salvi nella fotocamera del tuo cellulare, pronti per essere postati o inviati su WhatsApp.</p>
            <div className="bento-visual-center">
              <GalleryMockup />
            </div>
          </div>

          {/* BENTO 3: Fedeltà (TWO THIRDS) */}
          <div className="bento-card bento-two-thirds" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="bento-icon"><Zap color="#0085FF" /></div>
              <h3 className="bento-title">Fedeltà Matematica 1:1.</h3>
              <p className="bento-subtitle" style={{ maxWidth: '400px' }}>
                Grazie al protocollo Nano Banana Pro™ il nostro algoritmo genera modelle/i reali ma preserva esattamente le pieghe, le texture, la trama e la caduta dell'abito fotografato da te. Senza invenzioni.
              </p>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
               <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee' }}>
                  <span className="pill-badge" style={{ position: 'absolute', margin: '10px' }}>PRIMA</span>
                  <img src="/prima_nuovo.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Prima" />
               </div>
               <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee' }}>
                  <span className="pill-badge active" style={{ position: 'absolute', margin: '10px' }}>DOPO</span>
                  <img src="/dopo_nuovo.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Dopo" />
               </div>
            </div>
          </div>

          {/* BENTO 4: Risparmio (THIRD) */}
          <div className="bento-card bento-third" style={{ background: '#111111', color: 'white' }}>
            <div className="bento-icon" style={{ background: '#222' }}><TrendingUp color="#ff5470" /></div>
            <h3 className="bento-title" style={{ color: 'white' }}>Taglia i costi<br/>Shooting.</h3>
            <p className="bento-subtitle" style={{ color: '#aaa' }}>Elimina definitivamente il budget mensile per modelle, trucco, parrucco e sale di posa.</p>
            <ul className="bento-list">
              <li style={{ color: 'white' }}>❌ Basta Fotografi Freelance</li>
              <li style={{ color: 'white' }}>❌ Nessun orario da rispettare</li>
              <li style={{ color: 'white' }}>❌ Libera il magazzino in un tap</li>
            </ul>
          </div>
          
        </div>
      </section>

      {/* CATEGORY SHOWCASE (NICCHIE) */}
      <section className="bento-section" style={{ padding: '6rem 5%' }}>
        <h2 className="section-title">Pronto per ogni Nicchia.</h2>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          Il nostro motore comprende il prodotto in foto e imposta automaticamente illuminazione, location e cast per intercettare il tuo cliente ideale.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="cat-card-bento">
             <h3>Sposo & Cerimonia 🥂</h3>
             <p style={{ color: '#666', fontSize: '1rem', marginTop: '0.5rem' }}>Abiti appesi resi magnifici su altari, ville di lusso e shooting matrimoniali iperrealistici.</p>
          </div>

          <div className="cat-card-bento">
             <h3>Calzature 👟</h3>
             <p style={{ color: '#666', fontSize: '1rem', marginTop: '0.5rem' }}>Stop a piedi tagliati. Seleziona lo still life su bianco asettico o richiedi target specifici per ambientazioni.</p>
          </div>

          <div className="cat-card-bento">
             <h3>Kids & Bambini 🎈</h3>
             <p style={{ color: '#666', fontSize: '1rem', marginTop: '0.5rem' }}>Aggira liberatorie e contratti d'immagine costosi generando bambini digitali perfetti in esterna.</p>
          </div>

          <div className="cat-card-bento">
             <h3>Streetwear 🛹</h3>
             <p style={{ color: '#666', fontSize: '1rem', marginTop: '0.5rem' }}>T-shirt e felpe accartocciate sul tavolo riprendono forma con attitude urban su skateboard e metro.</p>
          </div>

        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bento-section" style={{ marginBottom: '8rem' }}>
        <h2 className="section-title">Inizia a convertire.</h2>
        <div className="pricing-grid">
          
          {/* Starter */}
          <div className="pricing-card">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0' }}>STARTER</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Perfetto per testare l'acqua.</p>
            <div className="pricing-price">€29<span>/mese</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#0085FF" /> 50 generazioni / mese</li>
              <li><CheckCircle2 size={20} color="#0085FF" /> Accesso Bot Telegram</li>
              <li><CheckCircle2 size={20} color="#0085FF" /> Setup veloce</li>
            </ul>
            <Link href="/registrazione" className="btn-secondary" style={{ marginTop: '2rem' }}>Inizia Ora</Link>
          </div>

          {/* Boutique */}
          <div className="pricing-card popular">
            <h3 className="bento-title" style={{ fontSize: '1.5rem', margin: '0', color: 'white' }}>BOUTIQUE</h3>
            <p style={{ color: '#A0A0A0', marginBottom: '2rem' }}>Per scalare i volumi social.</p>
            <div className="pricing-price">€79<span>/mese</span></div>
            <ul className="bento-list" style={{ flex: 1 }}>
              <li><CheckCircle2 size={20} color="#FFFFFF" /> <strong>300 generazioni / mese</strong></li>
              <li><CheckCircle2 size={20} color="#FFFFFF" /> Fedeltà assoluta Nano Pro</li>
              <li><CheckCircle2 size={20} color="#FFFFFF" /> Priorità Bot GPU Ultra</li>
              <li><CheckCircle2 size={20} color="#FFFFFF" /> Tutte le nicchie sbloccate</li>
            </ul>
            <Link href="/registrazione" className="btn-secondary" style={{ marginTop: '2rem', padding: '1.2rem', fontWeight: '800' }}>Attiva Boutique</Link>
          </div>

        </div>
      </section>
      
      <footer style={{ textAlign: 'center', padding: '3rem', color: '#888', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        © 2026 SuperNexus AI. Tutti i diritti riservati.
      </footer>

    </div>
  );
}
