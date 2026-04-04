import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* HEADER */}
      <header className="landing-header">
        <div className="landing-logo">SuperNexus</div>
        <nav>
          <Link href="/admin" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            Accedi Admin
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Dal manichino allo shooting editoriale. <br />
            <span>In 30 secondi.</span>
          </h1>
          <p className="hero-subtitle">
            Il primo assistente IA su Telegram progettato per Boutique e Negozianti. 
            Invia la foto di un capo piatto o su gruccia, e ricevi istantaneamente spettacolari scatti 
            editoriali fotorealistici pronti per distruggere i record di conversione sui tuoi Social.
          </p>
          <a href="#pricing" className="btn-primary">
            Sblocca la Magia
          </a>
        </div>
      </section>

      {/* BEFORE / AFTER VISUALS */}
      <section className="comparison-section">
        <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>La fine delle foto sul letto.</h2>
        <div className="comparison-grid">
          {/* PRIMA */}
          <div className="comparison-card">
            <span className="comparison-label">PRIMA: Il tuo scatto</span>
            <img 
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200" 
              alt="Maglietta piatta" 
            />
          </div>
          {/* DOPO */}
          <div className="comparison-card">
            <span className="comparison-label label-after">DOPO: Intelligenza Artificiale</span>
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" 
              alt="Modella che indossa abito" 
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="pricing-section" style={{ paddingBottom: '2rem' }}>
        <h2 className="section-title">Zero attrito. Massimo Risultato.</h2>
        <div className="card-grid" style={{ gap: '2rem' }}>
          <div className="stats-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Smartphone size={32} color="#03dac6" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Usa solo Telegram</h3>
            <p style={{ fontSize: '1rem', color: '#a0a0a0', fontWeight: '400' }}>Nessun software difficile o noiosi login. Fai una foto in negozio e inviala al nostro comodissimo Bot Telegram.</p>
          </div>
          <div className="stats-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Sparkles size={32} color="#bb86fc" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Clone Matematico 1:1</h3>
            <p style={{ fontSize: '1rem', color: '#a0a0a0', fontWeight: '400' }}>Rispettiamo l'integrità del tuo capo a livello di texture e taglio preservandone ogni minima cucitura originale.</p>
          </div>
          <div className="stats-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Zap size={32} color="#03dac6" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Abbattimento dei Costi</h3>
            <p style={{ fontSize: '1rem', color: '#a0a0a0', fontWeight: '400' }}>Sostituisci migliaia di euro in fotografi, modelle e location fisiche. Genera set mozzafiato con un click.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section">
        <h2 className="section-title">Inizia a Convertire Oggi</h2>
        <div className="pricing-grid">
          
          {/* Starter */}
          <div className="pricing-card">
            <h3 className="pricing-name">Starter</h3>
            <div className="pricing-price">€29<span>/mese</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} /> 50 Generazioni Mensili</li>
              <li><CheckCircle2 size={18} /> Bot Telegram Base</li>
              <li><CheckCircle2 size={18} /> Qualità Standard</li>
              <li style={{ color: '#555' }}><CheckCircle2 size={18} color="#555" /> <s>Modelle Personalizzate</s></li>
            </ul>
            <a href="#" className="btn-secondary">Scegli Starter</a>
          </div>

          {/* Boutique */}
          <div className="pricing-card popular">
            <span className="pricing-popular-badge">Il più Votato</span>
            <h3 className="pricing-name">Boutique</h3>
            <div className="pricing-price">€79<span>/mese</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} /> 300 Generazioni Mensili</li>
              <li><CheckCircle2 size={18} /> Accesso Telegram Prioritario</li>
              <li><CheckCircle2 size={18} /> Fedeltà 1:1 UltraHD (Nano Pro)</li>
              <li><CheckCircle2 size={18} /> Tutte le categorie Fashion esterne</li>
            </ul>
            <a href="#" className="btn-secondary">Attiva Boutique</a>
          </div>

          {/* Enterprise */}
          <div className="pricing-card">
            <h3 className="pricing-name">Enterprise</h3>
            <div className="pricing-price">€199<span>/mese</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} /> Generazioni Illimitate</li>
              <li><CheckCircle2 size={18} /> Modelli Fisici Esclusivi</li>
              <li><CheckCircle2 size={18} /> Rimozione Automatica Filigrane</li>
              <li><CheckCircle2 size={18} /> Setup e Assistenza Dedicata</li>
            </ul>
            <a href="#" className="btn-secondary">Contattaci</a>
          </div>

        </div>
      </section>

    </div>
  );
}
