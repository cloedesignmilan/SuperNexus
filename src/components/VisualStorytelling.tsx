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
              How it works?
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#555', margin: '0', lineHeight: '1.5' }}>
              The trick to selling more online is not lowering prices,<br /> but raising visual quality.
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
              What do you need?
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#555', margin: '0', lineHeight: '1.5' }}>
              Just a simple smartphone with Telegram installed.
            </p>
          </div>
        </div>

        <div className="story-grid" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* STEP 1 */}
          <div className="story-step" style={{ textAlign: 'left', position: 'relative', animationDelay: '0.1s' }}>
            <div className="story-img-container wow-container">
              <img src="/story-1.jpg" alt="Scatti foto" className="story-img zoom-img" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.4rem', color: '#111' }}>Take pictures like this?</h3>
            <p style={{ fontSize: '1.05rem', color: '#666', margin: 0, lineHeight: '1.4' }}>Real photos... but they don't sell.</p>
            <ArrowRight className="story-arrow animated-arrow" />
          </div>

          {/* STEP 2 */}
          <div className="story-step" style={{ textAlign: 'left', position: 'relative', animationDelay: '0.2s' }}>
            <div className="story-img-container wow-container">
              <img src="/story-2.jpg" alt="L'AI le trasforma" className="story-img zoom-img" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.4rem', color: '#111' }}>AI transforms them</h3>
            <p style={{ fontSize: '1.05rem', color: '#666', margin: 0, lineHeight: '1.4' }}>Same product. Completely different result.</p>
            <ArrowRight className="story-arrow animated-arrow" />
          </div>

          {/* STEP 3 */}
          <div className="story-step" style={{ textAlign: 'left', position: 'relative', animationDelay: '0.3s' }}>
            <div className="story-img-container wow-container">
              <img src="/story-3.jpg" alt="Pubblica in un attimo" className="story-img zoom-img" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.4rem', color: '#111' }}>Publish in a snap</h3>
            <p style={{ fontSize: '1.05rem', color: '#666', margin: 0, lineHeight: '1.4' }}>Ready for Instagram and your shop.</p>
            <ArrowRight className="story-arrow animated-arrow" />
          </div>

          {/* STEP 4 */}
          <div className="story-step" style={{ textAlign: 'left', animationDelay: '0.4s' }}>
            <div className="story-img-container wow-container">
              <img src="/story-4.jpg" alt="E i clienti comprano" className="story-img zoom-img" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.4rem', color: '#111' }}>And customers buy</h3>
            <p style={{ fontSize: '1.05rem', color: '#666', margin: 0, lineHeight: '1.4' }}>From photo to sale, in seconds.</p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .story-step {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeUpIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          @keyframes fadeUpIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .wow-container {
            position: relative;
            overflow: hidden;
            border-radius: 20px;
            margin-bottom: 1.8rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            background: #fff;
            border: 1px solid rgba(0,0,0,0.05);
            z-index: 1;
          }

          .story-img {
            width: 100%;
            aspect-ratio: 3/4;
            object-fit: cover;
            display: block;
            transition: transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
            position: relative;
            z-index: 1;
          }

          .zoom-img {
            /* Default zoom to see details better */
            transform: scale(1.45) !important;
            transform-origin: center center;
          }

          /* WOW HOVER EFFECTS */
          .wow-container:hover {
            transform: translateY(-12px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            border-color: rgba(0,0,0,0.1);
          }

          .wow-container:hover .zoom-img {
            transform: scale(1.55) !important;
          }

          /* ARROW ANIMATION */
          .animated-arrow {
            position: absolute;
            right: -2rem;
            top: 35%;
            color: #d1d5db;
            width: 28px;
            height: 28px;
            animation: bounceRight 2s infinite ease-in-out;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
          }

          @keyframes bounceRight {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(10px); color: #9ca3af; }
          }

          @media (max-width: 900px) {
            .story-grid {
              grid-template-columns: 1fr !important;
            }
            .animated-arrow {
              display: none !important;
            }
            .story-img {
              aspect-ratio: auto !important;
            }
            .zoom-img {
              transform: scale(1) !important;
            }
            .wow-container:hover {
              transform: translateY(-5px);
            }
            .wow-container:hover .zoom-img {
              transform: scale(1.05) !important;
            }
          }
        `}} />
      </div>
    </section>
  );
}
