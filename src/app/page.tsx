import React from 'react';
import Link from 'next/link';
import { Camera, Zap, Smartphone, Sparkles, CheckCircle2, TrendingUp, ArrowRight, Heart, MessageCircle, Send, ThumbsUp, MessageSquare } from 'lucide-react';
import AnimatedTelegramMockup from '@/components/AnimatedTelegramMockup';
import GalleryMockup from '@/components/GalleryMockup';


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

      {/* BEFORE / AFTER VISUALS (CAMERA & SOCIAL MOCKUPS - MARQUEE CAROUSEL) */}
      <section className="comparison-section" style={{ overflow: 'hidden' }}>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            
            {/* Duplichiamo l'array due volte per l'effetto di loop infinito senza salti */}
            {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((num, idx) => {
              const isInsta = num % 2 !== 0; // Alterniamo Instagram/Facebook
              const socialClass = isInsta ? "social-mockup social-mockup-dark" : "social-mockup facebook-style";
              const boutiqueName = isInsta ? "Boutique Pura" : "Elegance Concept Store";

              return (
                <div key={idx} className="transformation-block" style={{ flexShrink: 0 }}>
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '2rem', color: '#03dac6', textAlign: 'center' }}>
                    ✧ Negozio {num}
                  </h3>
                  <div className="spectacular-grid">
                    
                    {/* PRIMA: FOTOCAMERA */}
                    <div className="camera-mockup">
                      <img src={`/${num}-a.jpeg`} alt={`Scatto fotocamera ${num}`} className="camera-image" />
                      <div className="camera-grid-overlay"></div>
                      <div className="camera-focus-box"></div>
                      <div className="camera-flash"></div>
                      <div className="camera-ui-bottom">
                        <div className="camera-ui-modes">
                          <span>VIDEO</span>
                          <span className="active">FOTO</span>
                          <span>RITRATTO</span>
                        </div>
                        <div className="camera-shutter-button"></div>
                      </div>
                    </div>

                    {/* ARROW */}
                    <div className="spectacular-arrow-container">
                      <div className="neon-arrow">
                        <ArrowRight size={48} color="#bb86fc" />
                      </div>
                      <div className="arrow-text">30 SECONDI</div>
                      <div style={{ fontSize: '0.75rem', color: '#a0a0a0', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '4px', letterSpacing: '0.5px' }}>
                        Genera 3, 5 o 10 foto
                      </div>
                    </div>

                    {/* DOPO: SOCIAL MEDIA */}
                    <div className={socialClass}>
                      <div className="social-header">
                        <div className="social-avatar">{isInsta ? "BP" : "EC"}</div>
                        <div className="social-username">{boutiqueName} {isInsta ? "" : <span style={{color: '#888', fontWeight: 'normal', fontSize: '0.8rem'}}>ha aggiornato il catalogo.</span>}</div>
                      </div>
                      
                      <div className="social-image-container">
                        <img src={`/${num}-b.jpeg`} alt={`Post Social ${num}`} className="social-image" />
                      </div>

                      <div className="social-footer">
                        {isInsta ? (
                          <>
                            <div className="social-actions">
                              <Heart size={24} className="social-action-icon heart-icon" />
                              <MessageCircle size={24} className="social-action-icon" />
                              <Send size={24} className="social-action-icon" />
                            </div>
                            <div className="social-likes">Piace a 412 persone</div>
                            <div className="social-caption">
                              <span>{boutiqueName}</span> Nuova collezione in store! ✨
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="social-actions" style={{ marginBottom: '8px' }}>
                              <div className="social-action-item" style={{color: '#1877F2'}}><ThumbsUp size={20} /> Mi piace</div>
                              <div className="social-action-item"><MessageSquare size={20} /> Commenta</div>
                              <div className="social-action-item"><Send size={20} /> Condividi</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                  </div>
                </div>
              );
            })}

          </div>
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
            <h3 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '1rem', fontWeight: '800' }}>Usa solo lo Smartphone e Instagram</h3>
            <p className="z-problem">Il problema: Servono computer potenti, macchine fotografiche, e software complessi.</p>
            <p className="z-solution">Abbiamo eliminato qualsiasi strato tecnico. Non serve attrezzatura. Scatti col cellulare, invii l'immagine al bot Telegram ovunque tu sia, e la pubblichi direttamente su Instagram e Facebook.</p>
            <ul className="z-benefit-list">
              <li><CheckCircle2 color="#03dac6" size={20} /> Zero computer: dal telefono al social in 1 min.</li>
              <li><CheckCircle2 color="#03dac6" size={20} /> Nessuna app lenta o sito web pesante da imparare</li>
              <li><CheckCircle2 color="#03dac6" size={20} /> Risultati fotorealistici elaborati nel Cloud</li>
            </ul>
          </div>
          <div className="telephones-container">
            <div className="z-visual" style={{ background: 'transparent', padding: '0', border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ color: '#bb86fc', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 10px rgba(187,134,252,0.5)' }}>1. Usa Telegram</div>
              <AnimatedTelegramMockup />
            </div>

            <div className="z-visual" style={{ background: 'transparent', padding: '0', border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ color: '#03dac6', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 10px rgba(3,218,198,0.5)', textAlign: 'center' }}>2. Scarica per sempre<br/>dalla tua Galleria Telegram</div>
              <GalleryMockup />
            </div>
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

      {/* CATEGORY SHOWCASE (NICCHIE) */}
      <section className="categories-showcase" style={{ padding: '6rem 5%', background: '#020202', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Pronto per la tua Nicchia</h2>
        <p style={{ fontSize: '1.2rem', color: '#a0a0a0', marginBottom: '4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          Non importa cosa vendi. Il nostro motore capisce il capo e adatta lo stile fotografico e l'ambiente al tuo target di riferimento.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Card Sposi */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.5rem', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
             <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Sposo & Cerimonia 🥂</h3>
             <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#ff5470', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>IL PROBLEMA</span>
                <p style={{ color: '#a0a0a0', fontSize: '0.95rem', marginTop: '0.3rem' }}>Vendere abiti da sposo mostrandoli appesi a grucce tristi o su manichini freddi svaluta il pregio del prodotto.</p>
             </div>
             <div>
                <span style={{ color: '#03dac6', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>LA SOLUZIONE</span>
                <p style={{ color: '#e0e0e0', fontSize: '1.05rem', marginTop: '0.3rem', fontWeight: '500' }}>I capi rinascono addosso a modelli fotorealistici tra ville di lusso, altari e giardini da sogno.</p>
             </div>
          </div>

          {/* Card Streetwear */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.5rem', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
             <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Teenager & Street 🛹</h3>
             <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#ff5470', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>IL PROBLEMA</span>
                <p style={{ color: '#a0a0a0', fontSize: '0.95rem', marginTop: '0.3rem' }}>Felpe destrutturate e pantaloni larghi sembrano stracci fuori forma se fotografati piatti sul tavolo.</p>
             </div>
             <div>
                <span style={{ color: '#03dac6', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>LA SOLUZIONE</span>
                <p style={{ color: '#e0e0e0', fontSize: '1.05rem', marginTop: '0.3rem', fontWeight: '500' }}>Pura "attitude" urban. Generazioni in skatepark, metropolitane e spensierato lifestyle cittadino.</p>
             </div>
          </div>

          {/* Card Kids */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.5rem', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
             <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Kids & Bambini 🎈</h3>
             <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#ff5470', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>IL PROBLEMA</span>
                <p style={{ color: '#a0a0a0', fontSize: '0.95rem', marginTop: '0.3rem' }}>Assumere modelli bimbi costa caro ed implica costanti rotture burocratiche per la privacy genitoriale.</p>
             </div>
             <div>
                <span style={{ color: '#03dac6', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>LA SOLUZIONE</span>
                <p style={{ color: '#e0e0e0', fontSize: '1.05rem', marginTop: '0.3rem', fontWeight: '500' }}>Bimbi artificiali fotorealistici e giocosi. Aggiri del tutto i contratti e le liberatorie per l'immagine.</p>
             </div>
          </div>

          {/* Card Calzature */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.5rem', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
             <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Calzature & Scarpe 👟</h3>
             <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#ff5470', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>IL PROBLEMA</span>
                <p style={{ color: '#a0a0a0', fontSize: '0.95rem', marginTop: '0.3rem' }}>L'IA standard per e-commerce è incapace: inquadra sempre a mezzo busto tagliando costantemente i piedi.</p>
             </div>
             <div>
                <span style={{ color: '#bb86fc', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>LA SOLUZIONE NANO-PRO</span>
                <p style={{ color: '#e0e0e0', fontSize: '1.05rem', marginTop: '0.3rem', fontWeight: '500' }}>Motore "Still-Life" integrato. Sfondo bianco da studio su 4 inquadrature specifiche (Top, Dietro, Lato) attivate con un tap.</p>
             </div>
          </div>

          {/* Card Executive */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.5rem', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
             <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Business & Corporate 💼</h3>
             <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#ff5470', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>IL PROBLEMA</span>
                <p style={{ color: '#a0a0a0', fontSize: '0.95rem', marginTop: '0.3rem' }}>Il target executive altospendente scappa quando vede presentazioni amatoriali e di basso taglio.</p>
             </div>
             <div>
                <span style={{ color: '#03dac6', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>LA SOLUZIONE</span>
                <p style={{ color: '#e0e0e0', fontSize: '1.05rem', marginTop: '0.3rem', fontWeight: '500' }}>Look da copertina da rivista economica. I modelli posano in lounge aeroportuali, uffici top e skyline moderni.</p>
             </div>
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
