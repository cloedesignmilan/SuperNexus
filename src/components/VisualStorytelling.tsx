import React from 'react';
import { ArrowRight, Sparkles, Smartphone } from 'lucide-react';

export default function VisualStorytelling() {
  return (
    <section style={{ 
      padding: '100px 5%', 
      background: 'linear-gradient(to bottom, #ffffff, #f7f9fa)', 
      color: '#080808',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          marginBottom: '4rem' 
        }}>
          {/* CARD 1: Come funziona? */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '20px', 
            padding: '2.5rem 2rem', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.02)',
            textAlign: 'center'
          }}>
            <div style={{ 
               width: '60px', height: '60px', borderRadius: '16px', 
               background: 'linear-gradient(135deg, #111, #222)', color: 'white',
               display: 'flex', alignItems: 'center', justifyContent: 'center', 
               margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
            }}>
              <Sparkles size={28} />
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em', color: '#111' }}>
              Come funziona?
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#555', margin: '0', lineHeight: '1.5' }}>
              Il trucco per vendere di più online non è abbassare i prezzi,<br /> ma alzare la qualità visiva.
            </p>
          </div>

          {/* CARD 2: Cosa serve? */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '20px', 
            padding: '2.5rem 2rem', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.02)',
            textAlign: 'center'
          }}>
            <div style={{ 
               width: '60px', height: '60px', borderRadius: '16px', 
               background: 'linear-gradient(135deg, #111, #222)', color: 'white',
               display: 'flex', alignItems: 'center', justifyContent: 'center', 
               margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
            }}>
              <Smartphone size={28} />
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em', color: '#111' }}>
              Cosa serve?
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#555', margin: '0', lineHeight: '1.5' }}>
              Solo un semplice cellulare con installato Telegram.
            </p>
          </div>
        </div>

        <div className="story-grid" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* STEP 1 */}
          <div className="story-step" style={{ textAlign: 'left', position: 'relative' }}>
            <div className="story-img-container" style={{ overflow: 'hidden', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <img src="/story-1.jpg" alt="Scatti foto" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} className="story-img" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.3rem' }}>Scatti foto così?</h3>
            <p style={{ fontSize: '1rem', color: '#555', margin: 0 }}>Foto reali… ma non vendono.</p>
            <ArrowRight className="story-arrow" style={{ position: 'absolute', right: '-1.8rem', top: '35%', color: '#ccc', width: '24px', height: '24px' }} />
          </div>

          {/* STEP 2 */}
          <div className="story-step" style={{ textAlign: 'left', position: 'relative' }}>
            <div className="story-img-container" style={{ overflow: 'hidden', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <img src="/story-2.jpg" alt="L'AI le trasforma" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} className="story-img" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.3rem' }}>L’AI le trasforma</h3>
            <p style={{ fontSize: '1rem', color: '#555', margin: 0 }}>Stesso prodotto. Risultato completamente diverso.</p>
            <ArrowRight className="story-arrow" style={{ position: 'absolute', right: '-1.8rem', top: '35%', color: '#ccc', width: '24px', height: '24px' }} />
          </div>

          {/* STEP 3 */}
          <div className="story-step" style={{ textAlign: 'left', position: 'relative' }}>
            <div className="story-img-container" style={{ overflow: 'hidden', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <img src="/story-3.jpg" alt="Pubblica in un attimo" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} className="story-img" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.3rem' }}>Pubblica in un attimo</h3>
            <p style={{ fontSize: '1rem', color: '#555', margin: 0 }}>Pronto per Instagram e il tuo shop.</p>
            <ArrowRight className="story-arrow" style={{ position: 'absolute', right: '-1.8rem', top: '35%', color: '#ccc', width: '24px', height: '24px' }} />
          </div>

          {/* STEP 4 */}
          <div className="story-step" style={{ textAlign: 'left' }}>
            <div className="story-img-container" style={{ overflow: 'hidden', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <img src="/story-4.jpg" alt="E i clienti comprano" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} className="story-img" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.3rem' }}>E i clienti comprano</h3>
            <p style={{ fontSize: '1rem', color: '#555', margin: 0 }}>Da foto a vendita, in pochi secondi.</p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .story-img:hover {
            transform: scale(1.03) !important;
          }
          @media (max-width: 900px) {
            .story-grid {
              grid-template-columns: 1fr !important;
            }
            .story-arrow {
              display: none !important;
            }
            .story-img {
              aspect-ratio: auto !important;
            }
          }
        `}} />
      </div>
    </section>
  );
}
