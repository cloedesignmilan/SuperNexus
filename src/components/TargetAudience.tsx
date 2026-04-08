import React from 'react';
import { Store, ShoppingBag, Globe, Camera, CheckCircle2 } from 'lucide-react';

export default function TargetAudience() {
  const audiences = [
    {
      title: "Negozi di abbigliamento",
      description: "Carica l'intera nuova collezione sul tuo sito in una frazione del tempo e azzera i costi della sala di posa.",
      icon: <Store size={32} />
    },
    {
      title: "Negozi Outlet, Ebay, Etsy, Amazon",
      description: "Smaltisci le giacenze velocemente risultando iper-professionale anche come venditore su Amazon, Ebay o Etsy.",
      icon: <ShoppingBag size={32} />
    },
    {
      title: "Ecommerce di Moda",
      description: "Aumenta vertiginosamente il conversion rate con immagini coerenti, premium e brandizzate.",
      icon: <Globe size={32} />
    },
    {
      title: "Vendita su Instagram",
      description: "Ferma lo scroll dei tuoi follower con scatti editoriali bellissimi che ispirano l'acquisto immediato.",
      icon: <Camera size={32} />
    }
  ];

  return (
    <section style={{ padding: '6rem 5%', background: '#fff', color: '#111' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '1rem', color: '#111' }}>
            Perfetto per:
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Pensato su misura per imprenditori e professionisti della moda che vogliono scalare le vendite online, senza agenzie esterne.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem' 
        }}>
          {audiences.map((item, index) => (
            <div key={index} style={{
              background: '#f9f9f9',
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden'
            }} className="target-card">
              
              <div style={{ 
                width: '60px', height: '60px', 
                background: '#fff', 
                borderRadius: '16px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#111',
                marginBottom: '1.5rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
              }}>
                {item.icon}
              </div>
              
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.8rem', letterSpacing: '-0.01em' }}>
                {item.title}
              </h3>
              
              <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: '1.5', margin: 0 }}>
                {item.description}
              </p>

              <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1 }}>
                <CheckCircle2 size={100} style={{ transform: 'translate(40%, -40%)' }} />
              </div>
            </div>
          ))}
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .target-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.08) !important;
            background: #ffffff !important;
          }
        `}} />
      </div>
    </section>
  );
}
