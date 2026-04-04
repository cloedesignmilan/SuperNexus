import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

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
          <p className="hero-subtitle" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#e0e0e0' }}>
            Spesso non hai le foto ufficiali dei fornitori, oppure non puoi usarle liberamente. <br />
            Trasforma qualsiasi foto scattata in negozio in immagini professionali, fotorealistiche e pronte a vendere. 
          </p>
          <p style={{ fontSize: '1.05rem', color: '#a0a0a0', marginBottom: '3rem', fontWeight: '500' }}>
            Il primo assistente IA su Telegram pensato per Negozianti e Commercianti. <br />
            <span style={{ color: '#03dac6', marginTop: '10px', display: 'inline-block' }}>👉 Scatta. Invia. Pubblica. Vendi.</span>
          </p>
          <a href="#pricing" className="btn-primary">
            Inizia a convertire da oggi
          </a>
        </div>
      </section>

      {/* SUB-HOOK */}
      <section style={{ textAlign: 'center', padding: '0 5% 4rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Basta foto sul letto. <span style={{ color: '#ff5470' }}>Basta manichini.</span></h2>
        <p style={{ fontSize: '1.3rem', color: '#bb86fc' }}>Da oggi ogni capo diventa uno shooting da rivista.</p>
      </section>

      {/* BEFORE / AFTER VISUALS */}
      <section className="comparison-section">
        <div className="comparison-grid">
          {/* PRIMA */}
          <div className="comparison-card">
            <span className="comparison-label">📸 PRIMA: Foto veloce in negozio (gruccia, manichino o piatto)</span>
            <img 
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200" 
              alt="Prima" 
            />
          </div>
          {/* DOPO */}
          <div className="comparison-card">
            <span className="comparison-label label-after">🤖 DOPO: Immagini editoriali con modelli reali, pronte per social ed ecommerce</span>
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" 
              alt="Dopo" 
            />
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="pricing-section" style={{ paddingBottom: '2rem', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Zero attrito. Massimo risultato.</h2>
        <p style={{ fontSize: '1.3rem', color: '#a0a0a0', marginBottom: '4rem' }}>Tutto quello che ti serve... è Telegram.</p>
        
        <div className="card-grid" style={{ gap: '2rem' }}>
          
          {/* BLOCCO TELEGRAM */}
          <div className="stats-card" style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
            <Smartphone size={32} color="#03dac6" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '700' }}>Usa solo Telegram</h3>
            <ul style={{ listStyle: 'none', color: '#a0a0a0', marginBottom: '1.5rem', lineHeight: '1.8' }}>
              <li>Nessun software.</li>
              <li>Nessun login complicato.</li>
              <li>Nessuna perdita di tempo.</li>
            </ul>
            <p style={{ color: '#03dac6', fontWeight: '600' }}>👉 Scatti → invii → ricevi immagini perfette</p>
          </div>

          {/* TECNOLOGIA RISCRITTA */}
          <div className="stats-card" style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
            <Sparkles size={32} color="#bb86fc" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '700' }}>Fedeltà assoluta 1:1</h3>
            <p style={{ color: '#a0a0a0', marginBottom: '0.8rem' }}>Il tuo capo viene ricreato con precisione estrema:</p>
            <ul style={{ listStyle: 'none', color: '#a0a0a0', marginBottom: '1.5rem', lineHeight: '1.8' }}>
              <li>✓ tessuti realistici</li>
              <li>✓ colori identici</li>
              <li>✓ taglio perfetto</li>
              <li>✓ dettagli intatti</li>
            </ul>
            <p style={{ color: '#bb86fc', fontWeight: '600' }}>👉 Nessuna modifica. Solo valorizzazione.</p>
          </div>

          {/* RISPARMIO DIRETTO */}
          <div className="stats-card" style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
            <Zap size={32} color="#ff5470" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '700' }}>Stop ai costi inutili</h3>
            <p style={{ color: '#a0a0a0', marginBottom: '0.8rem' }}>Dimentica:</p>
            <ul style={{ listStyle: 'none', color: '#a0a0a0', marginBottom: '1.5rem', lineHeight: '1.8' }}>
              <li>❌ fotografi</li>
              <li>❌ modelle</li>
              <li>❌ location</li>
              <li>❌ shooting costosi</li>
            </ul>
            <p style={{ color: '#ff5470', fontWeight: '600' }}>👉 Ottieni risultati migliori... in pochi secondi</p>
          </div>

          {/* BENEFICIO FORTE */}
          <div className="stats-card" style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
            <TrendingUp size={32} color="#03dac6" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '700' }}>Più immagini = più vendite</h3>
            <p style={{ color: '#a0a0a0', marginBottom: '1.5rem', lineHeight: '1.8' }}>Più contenuti pubblichi, più vendi.</p>
            <ul style={{ listStyle: 'none', color: '#03dac6', marginBottom: '0', lineHeight: '1.8', fontWeight: '500' }}>
              <li>👉 Senza aumentare il lavoro</li>
              <li>👉 Senza aumentare i costi</li>
            </ul>
          </div>

        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section">
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Inizia a convertire da oggi</h2>
        <div className="pricing-grid" style={{ justifyContent: 'center', maxWidth: '800px', margin: '3rem auto 0' }}>
          
          {/* Starter */}
          <div className="pricing-card">
            <h3 className="pricing-name">STARTER</h3>
            <p style={{ color: '#a0a0a0', marginBottom: '1rem', fontStyle: 'italic' }}>Perfetto per iniziare</p>
            <div className="pricing-price">€29<span>/mese</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="#03dac6" /> 50 generazioni / mese</li>
              <li><CheckCircle2 size={18} color="#03dac6" /> Accesso Bot Telegram</li>
              <li><CheckCircle2 size={18} color="#03dac6" /> Qualità standard</li>
              <li><CheckCircle2 size={18} color="#03dac6" /> Setup immediato</li>
            </ul>
            <a href="#" className="btn-secondary">Inizia ora</a>
          </div>

          {/* Boutique */}
          <div className="pricing-card popular" style={{ transform: 'scale(1.08)' }}>
            <span className="pricing-popular-badge">Più scelto</span>
            <h3 className="pricing-name">BOUTIQUE</h3>
            <p style={{ color: '#cba4fd', marginBottom: '1rem', fontStyle: 'italic' }}>Per chi vuole vendere davvero</p>
            <div className="pricing-price">€79<span>/mese</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="#bb86fc" /> 300 generazioni / mese</li>
              <li><CheckCircle2 size={18} color="#bb86fc" /> Accesso prioritario Telegram</li>
              <li><CheckCircle2 size={18} color="#bb86fc" /> Fedeltà 1:1 UltraHD (Nano Pro)</li>
              <li><CheckCircle2 size={18} color="#bb86fc" /> Tutte le categorie fashion</li>
              <li><CheckCircle2 size={18} color="#bb86fc" /> Risultati premium</li>
            </ul>
            <a href="#" className="btn-secondary">Attiva Boutique</a>
          </div>

        </div>
      </section>

    </div>
  );
}
