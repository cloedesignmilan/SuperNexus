import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, TrendingUp, CheckCircle2 } from 'lucide-react';
import AnimatedTelegramMockup from '@/components/AnimatedTelegramMockup';
import PhoneMockup from '@/components/PhoneMockup';
import SocialPostMockup from '@/components/SocialPostMockup';

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
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Meno Grucce Tristi.<br />
            <span>Più Vendite Online.</span>
          </h1>
          <p className="hero-subtitle">
            Il software AI indispensabile per Boutique e Negozi di abbigliamento. Scatta una foto col telefono al capo in magazzino e ottieni subito uno shooting iper-realistico perfetto per Facebook, Instagram e il tuo Sito E-Commerce.
          </p>
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

      {/* SHOWCASE DA ZERO */}
      <section id="showcase" className="bento-section" style={{ padding: '4rem 5%', background: '#080808', color: '#fff', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
        <h2 className="section-title" style={{ color: '#fff' }}>Indispensabile per il tuo Negozio.</h2>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          Dalla scatola al web in 30 secondi. Guarda come le foto scattate velocemente nei nostri negozi affiliati si trasformano in immagini perfette per le Campagne Facebook, i Post Instagram e il catalogo del Sito.
        </p>

        <div className="showcase-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8rem', maxWidth: '1200px', margin: '0 auto', overflowX: 'hidden', padding: '2rem 0' }}>
          
          {/* BUSINESS UOMO */}
          <div className="showcase-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '4rem', alignItems: 'center' }}>
            <div className="showcase-text reveal-left">
               <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0085FF' }}>Abbigliamento Business</h3>
               <p style={{ color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>Smetti di stendere gli abiti eleganti sui manichini. Presentali indossati da modelli ultra-realistici, in pose spontanee che ne valorizzano il fit.</p>
            </div>
            <div className="collage-container" style={{ direction: 'ltr' }}>
               <div className="collage-pack">
                  <PhoneMockup imgSrc="/showcase/business/prima.jpg" label="SCATTO DAL NEGOZIO" className="collage-phone" />
                  <div className="collage-social-group">
                     <SocialPostMockup imgSrc="/showcase/business/dopo1.jpg" accountName="tailor_milano" likes="8.423" label="PER INSTAGRAM" className="collage-social-top" />
                     <SocialPostMockup imgSrc="/showcase/business/dopo2.jpg" accountName="tailor_milano" likes="5.190" label="SITO E-COMMERCE" className="collage-social-bottom" />
                  </div>
               </div>
            </div>
          </div>

          {/* SNEAKERS & CALZATURE STUDIO */}
          <div className="showcase-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr minmax(300px, 1fr)', gap: '4rem', alignItems: 'center', direction: 'rtl' }}>
             <div className="collage-container" style={{ direction: 'ltr' }}>
               <div className="collage-pack">
                  <PhoneMockup imgSrc="/showcase/scarpe/prima.png" label="PIASTRELLA VETRINA" className="collage-phone" />
                  <div className="collage-social-group">
                     <SocialPostMockup imgSrc="/showcase/scarpe/dopo1.jpg" accountName="sneakers_hub" likes="12.044" label="STILL LIFE SHOP" className="collage-social-top" />
                     <SocialPostMockup imgSrc="/showcase/scarpe/dopo2.jpg" accountName="sneakers_hub" likes="9.812" label="CATALOGO" className="collage-social-bottom" />
                  </div>
               </div>
             </div>
            <div className="showcase-text reveal-right" style={{ direction: 'ltr' }}>
               <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#ffb300' }}>Calzature: Still Life Assoluto</h3>
               <p style={{ color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>Punta il telefono. Ottieni Still-Life chirurgici con sfondo purissimo (#FFFFFF). L'eliminazione totale di cartellini e tavoli per l'E-Commerce perfetto.</p>
            </div>
          </div>

          {/* WEDDING & SPOSA */}
          <div className="showcase-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '4rem', alignItems: 'center' }}>
            <div className="showcase-text reveal-left">
               <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#ff5470' }}>Abiti Sposa & Cerimonia</h3>
               <p style={{ color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>Dall'abito anonimo appeso nell'armadio a cataloghi sontuosi, palazzi antichi e navate storiche che incantano le spose sulle tue Ads social.</p>
            </div>
            <div className="collage-container" style={{ direction: 'ltr' }}>
               <div className="collage-pack">
                  <PhoneMockup imgSrc="/showcase/sposa/prima.jpg" label="MAGAZZINO ATELIER" className="collage-phone" />
                  <div className="collage-social-group">
                     <SocialPostMockup imgSrc="/showcase/sposa/dopo1.jpg" accountName="luxury_bridal" likes="24k" label="LOOKBOOK 1" className="collage-social-top" />
                     <SocialPostMockup imgSrc="/showcase/sposa/dopo2.jpg" accountName="luxury_bridal" likes="18k" label="LOOKBOOK 2" className="collage-social-bottom" />
                  </div>
               </div>
            </div>
          </div>

          {/* FESTA E CASUAL */}
          <div className="showcase-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr minmax(300px, 1fr)', gap: '4rem', alignItems: 'center', direction: 'rtl' }}>
             <div className="collage-container" style={{ direction: 'ltr' }}>
               <div className="collage-pack">
                  <PhoneMockup imgSrc="/showcase/festa/prima.jpg" label="APPESO IN NEGOZIO" className="collage-phone" />
                  <div className="collage-social-group">
                     <SocialPostMockup imgSrc="/showcase/festa/dopo1.jpg" accountName="party_milano" likes="4.321" label="IG STORY" className="collage-social-top" />
                     <SocialPostMockup imgSrc="/showcase/festa/dopo2.jpg" accountName="party_milano" likes="6.890" label="SOCIAL ADS" className="collage-social-bottom" />
                  </div>
               </div>
             </div>
            <div className="showcase-text reveal-right" style={{ direction: 'ltr' }}>
               <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#bb86fc' }}>Casual & Abiti da Sera</h3>
               <p style={{ color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>Mostra l'attrazione ipnotica dei tuoi capi serali con sfondi di locali lussuosi e luci vibranti notturne. Le Instagram Stories schizzeranno al vertice.</p>
            </div>
          </div>

          {/* STREETWEAR RAGAZZO */}
          <div className="showcase-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '4rem', alignItems: 'center' }}>
            <div className="showcase-text reveal-left">
               <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#4caf50' }}>Streetwear & Urban</h3>
               <p style={{ color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>Magliette stirate a terra? Trasformale in scatti hype nei quartieri metropolitani, skatepark e graffit-wall per attirare subito la GenZ.</p>
            </div>
            <div className="collage-container" style={{ direction: 'ltr' }}>
               <div className="collage-pack">
                  <PhoneMockup imgSrc="/showcase/ragazzo/prima.jpg" label="SCATTO SUL TAVOLO" className="collage-phone" />
                  <div className="collage-social-group">
                     <SocialPostMockup imgSrc="/showcase/ragazzo/dopo1.jpg" accountName="hype_street" likes="15k" label="REEL COVER" className="collage-social-top" />
                     <SocialPostMockup imgSrc="/showcase/ragazzo/dopo2.jpg" accountName="hype_street" likes="12k" label="DROP ANNUNCIO" className="collage-social-bottom" />
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* BENTO GRID FEATURES (Shortened) */}
      <section id="features" className="bento-section" style={{ marginTop: '8rem' }}>
        <h2 className="section-title">Zero attrito. Massimo risultato.</h2>
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
          <div className="bento-card bento-half" style={{ background: '#111111', color: 'white' }}>
            <div className="bento-icon" style={{ background: '#222' }}><TrendingUp color="#ff5470" /></div>
            <h3 className="bento-title" style={{ color: 'white' }}>Taglia i costi<br/>Shooting.</h3>
            <p className="bento-subtitle" style={{ color: '#aaa' }}>Elimina definitivamente il budget mensile per modelle, trucco, fotografi e sale di posa.</p>
            <ul className="bento-list">
              <li style={{ color: 'white' }}>❌ Nessuna modella da pagare</li>
              <li style={{ color: 'white' }}>❌ Nessun orario da rispettare</li>
              <li style={{ color: 'white' }}>✅ Libera il magazzino sui Social in 1 min</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bento-section" style={{ marginBottom: '8rem', marginTop: '8rem' }}>
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
