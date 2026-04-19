import React from 'react';
import { Store, ShoppingBag, Globe, Camera, CheckCircle2, CornerDownRight } from 'lucide-react';
import { Caveat } from 'next/font/google';

const caveat = Caveat({ subsets: ['latin'], weight: '700' });

export default function TargetAudience() {
  const audiences = [
    {
      title: "Clothing Stores",
      description: "Upload your entire new collection to your website in a fraction of the time and eliminate studio photography costs.",
      icon: <Store size={32} />,
      color: "#a3cc00", // Darker neon yellow for white bg visibility
      handwrittenTip: "Perfect for T-Shirts & Apparel"
    },
    {
      title: "Outlet Stores, eBay, Etsy",
      description: "Clear out excess inventory quickly while looking hyper-professional as a seller on marketplaces.",
      icon: <ShoppingBag size={32} />,
      color: "#ff5470", // Neon Pink
      handwrittenTip: "Perfect for Footwear & Accessories"
    },
    {
      title: "Fashion E-commerce",
      description: "Skyrocket your conversion rates with consistent, premium, and fully-branded imagery.",
      icon: <Globe size={32} />,
      color: "#00b3a6", // Darker cyan for visibility
      handwrittenTip: "Perfect for Combined Outfits"
    },
    {
      title: "Instagram Sellers",
      description: "Stop your followers' scrolling with beautiful editorial shots that inspire immediate purchases.",
      icon: <Camera size={32} />,
      color: "#9933ff", // Darker purple for visibility
      handwrittenTip: "Perfect for UGC Content"
    }
  ];

  return (
    <section style={{ padding: '6rem 5%', background: '#fff', color: '#111' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '1rem', color: '#111' }}>
            Perfect for:
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Tailor-made for fashion entrepreneurs and professionals who want to scale their online sales without expensive external agencies.
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
              padding: '2.5rem 2rem 1.5rem',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }} className="target-card">
              
              <div style={{ 
                width: '60px', height: '60px', 
                background: '#111', 
                borderRadius: '16px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.color,
                marginBottom: '1.5rem',
                boxShadow: `0 8px 25px ${item.color}40`,
                border: `1px solid ${item.color}80`
              }}>
                {item.icon}
              </div>
              
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.8rem', letterSpacing: '-0.01em' }}>
                {item.title}
              </h3>
              
              <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: '1.5', margin: 0, flex: 1 }}>
                {item.description}
              </p>

              {/* Hand-drawn section */}
              <div style={{ 
                marginTop: '2rem', 
                paddingTop: '1rem', 
                borderTop: '2px dashed rgba(0,0,0,0.06)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px' 
              }}>
                <CornerDownRight size={20} color={item.color} style={{ opacity: 0.8 }} />
                <span className={caveat.className} style={{ 
                  fontSize: '1.6rem', 
                  color: '#444', 
                  transform: 'rotate(-3deg)',
                  display: 'inline-block',
                  lineHeight: '1'
                }}>
                  {item.handwrittenTip}
                </span>
              </div>

              <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.05, pointerEvents: 'none' }}>
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
