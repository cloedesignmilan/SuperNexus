import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, Sparkles, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';


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
      <section style={{ textAlign: 'center', padding: '0 5% 2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Basta foto sul letto. <span style={{ color: '#ff5470' }}>Basta manichini.</span></h2>
        <p style={{ fontSize: '1.3rem', color: '#bb86fc' }}>Da oggi ogni capo diventa uno shooting da rivista.</p>
      </section>

      {/* BEFORE / AFTER VISUALS (REAL UPLOADS CON EFFETTO) */}
      <section className="comparison-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '6rem' }}>
          
          {[1,2,3,4,5,6].map((num) => (
            <div key={num} className="transformation-block">
              <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: '#03dac6', textAlign: 'center' }}>
                ✧ Caso di Successo {num}
              </h3>
              <div className="spectacular-grid">
                
                {/* PRIMA */}
                <div className="spectacular-card spectacular-before">
                  <div className="spectacular-label-top">📸 PRIMA (Negozio)</div>
                  <img src={`/${num}-a.jpeg`} alt={`Prima ${num}`} className="spectacular-img" />
                </div>

                {/* ARROW */}
                <div className="spectacular-arrow-container">
                  <div className="neon-arrow">
                    <ArrowRight size={48} color="#bb86fc" />
                  </div>
                  <div className="arrow-text">30 SECONDI</div>
                </div>

                {/* DOPO */}
                <div className="spectacular-card spectacular-after">
                  <div className="spectacular-label-top label-after-color">🤖 DOPO (Shooting IA)</div>
                  <img src={`/${num}-b.jpeg`} alt={`Dopo ${num}`} className="spectacular-img" />
                </div>
                
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* VALUE PROPOSITION (Z-PATTERN) */}
      <section className="value-prop-section">
        <h2 className="section-title">Zero attrito. Massimo risultato.</h2>
        <p style={{ fontSize: '1.3rem', color: '#a0a0a0', marginBottom: '6rem', textAlign: 'center' }}>Tutto quello che ti serve... è Telegram.</p>
        
        {/* ROW 1 */}
        <div className="z-pattern-row">
          <div className="z-content">
            <div className="z-icon"><Smartphone size={32} color="#03dac6" /></div>
            <h3 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '1rem', fontWeight: '800' }}>Usa solo Telegram</h3>
            <p className="z-problem">Il problema: App complesse, software web lenti da imparare.</p>
            <p className="z-solution">La nostra IA risiede interamente in un Bot Telegram a te dedicato. Nessun login, nessuna interfaccia aliena.</p>
            <ul className="z-benefit-list">
              <li><CheckCircle2 color="#03dac6" size={20} /> Scatti col cellulare o scegli dalla galleria</li>
              <li><CheckCircle2 color="#03dac6" size={20} /> Invii al bot come in una chat normale</li>
              <li><CheckCircle2 color="#03dac6" size={20} /> Ricevi le foto finite dopo 30 secondi</li>
            </ul>
          </div>
          <div className="z-visual" style={{ background: 'transparent', padding: '0', border: 'none', boxShadow: 'none' }}>
            <img src="/telegram_iphone.png" alt="Telegram App UI SuperNexus su iPhone" style={{ maxHeight: '700px', objectFit: 'contain' }} />
          </div>
        </div>

        {/* ROW 2 */}
        <div className="z-pattern-row">
          <div className="z-content">
            <div className="z-icon violet"><Sparkles size={32} color="#bb86fc" /></div>
            <h3 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '1rem', fontWeight: '800' }}>Fedeltà Assoluta 1:1</h3>
            <p className="z-problem" style={{ color: '#ff5470' }}>Il problema: Alterazione dei dettagli, bottoni o trame inventate.</p>
            <p className="z-solution">Grazie al protocollo Nano Banana Pro™ ricreiamo i tuoi vestiti con precisione certosina in uno spaziotempo fotorealistico.</p>
            <ul className="z-benefit-list">
              <li><CheckCircle2 color="#bb86fc" size={20} /> Texture e tessuti realistici</li>
              <li><CheckCircle2 color="#bb86fc" size={20} /> Nessuna modifica: colore e taglio sono intatti</li>
              <li><CheckCircle2 color="#bb86fc" size={20} /> Rimozione magica dei cartellini del prezzo</li>
            </ul>
          </div>
          <div className="z-visual">
            <img src="/dopo_nuovo.png" alt="Fedeltà" />
          </div>
        </div>

        {/* ROW 3 */}
        <div className="z-pattern-row">
          <div className="z-content">
            <div className="z-icon red"><TrendingUp size={32} color="#ff5470" /></div>
            <h3 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '1rem', fontWeight: '800' }}>Stop ai Costi Inutili</h3>
            <p className="z-problem" style={{ color: '#ff5470' }}>Il problema: Budget folli per modelle, location, e logistica resi insostenibili per le uscite social giornaliere.</p>
            <p className="z-solution" style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ff5470' }}>Più immagini pubblichi, più vendi. Senza aumentare i costi.</p>
            <ul className="z-benefit-list">
              <li>❌ Basta Fotografi Freelance</li>
              <li>❌ Basta Costi Orari Modelle</li>
              <li>❌ Basta Studio Fotografico o Luce Flash costosa</li>
            </ul>
          </div>
          <div className="z-visual" style={{ background: 'linear-gradient(145deg, #2a0b11, #0a0a0a)', border: '1px solid rgba(255,84,112,0.2)' }}>
            <div style={{ textAlign: 'center', color: '#ff5470', fontSize: '1.5rem', fontWeight: '700' }}>Risparmio Massimo:<br />100% Budget Shooting</div>
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
