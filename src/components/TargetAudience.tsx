import React from 'react';
import { Store, ShoppingBag, Globe, Camera, ArrowUpRight } from 'lucide-react';
import { Caveat } from 'next/font/google';

const caveat = Caveat({ subsets: ['latin'], weight: '700' });

export default function TargetAudience() {
  const audiences = [
    {
      title: "Clothing Stores",
      description: "Upload your entire new collection to your website in a fraction of the time and eliminate studio photography costs.",
      icon: <Store size={28} />,
      color: "#a3cc00", // Neon yellow/green
      handwrittenTip: "Perfect for T-Shirts!"
    },
    {
      title: "Marketplace Sellers",
      description: "Clear out excess inventory quickly while looking hyper-professional as a seller on eBay, Etsy, and Outlet stores.",
      icon: <ShoppingBag size={28} />,
      color: "#ff5470", // Neon Pink
      handwrittenTip: "Perfect for Footwear!"
    },
    {
      title: "Fashion E-commerce",
      description: "Skyrocket your conversion rates with consistent, premium, and fully-branded editorial imagery.",
      icon: <Globe size={28} />,
      color: "#00b3a6", // Neon cyan
      handwrittenTip: "Perfect for Combined Outfits!"
    },
    {
      title: "Instagram Creators",
      description: "Stop your followers' scrolling with beautiful editorial shots that inspire immediate engagement and purchases.",
      icon: <Camera size={28} />,
      color: "#9933ff", // Neon purple
      handwrittenTip: "Perfect for UGC Content!"
    }
  ];

  return (
    <section style={{ padding: '8rem 5%', background: '#151515', color: '#fff', position: 'relative', overflow: 'hidden', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
       {/* Background ambient glow */}
       <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
       <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(34,211,238,0.03) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

       <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
         {/* HEADER */}
         <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
           <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', color: '#aaa' }}>
              TAILOR-MADE FOR YOU
           </div>
           <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '1.5rem', lineHeight: 1.1 }}>
             An absolute game-changer<br/>
             <span style={{ color: '#666' }}>for fashion entrepreneurs.</span>
           </h2>
           <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
             Whether you run a local boutique or a global fashion empire, SuperNexus AI gives you the power of a high-end photography studio right on your smartphone.
           </p>
         </div>
         
         {/* 4-COLUMN WOW GRID */}
         <div className="wow-grid">
            {audiences.map((item, i) => (
               <div key={i} className="wow-card" style={{ '--theme-color': item.color } as React.CSSProperties}>
                  <div className="wow-card-inner">
                     {/* Floating Glowing Icon */}
                     <div className="icon-wrapper">
                        {item.icon}
                     </div>
                     
                     <h3 className="card-title">{item.title}</h3>
                     <p className="card-desc">{item.description}</p>
                     
                     {/* Elegant Pill Badge */}
                     <div className="badge-wrapper">
                        <div className={caveat.className} style={{ fontSize: '1.3rem', zIndex: 2, position: 'relative', lineHeight: 1 }}>
                           {item.handwrittenTip}
                        </div>
                     </div>
                     
                     {/* Corner Arrow */}
                     <div className="corner-arrow">
                        <ArrowUpRight size={28} strokeWidth={2.5} />
                     </div>
                  </div>
               </div>
            ))}
         </div>
       </div>

       <style dangerouslySetInnerHTML={{__html: `
         .wow-grid {
           display: grid;
           grid-template-columns: repeat(4, 1fr);
           gap: 1.5rem;
         }
         @media (max-width: 1024px) {
           .wow-grid {
             grid-template-columns: repeat(2, 1fr);
           }
         }
         @media (max-width: 640px) {
           .wow-grid {
             grid-template-columns: 1fr;
           }
         }

         .wow-card {
           position: relative;
           border-radius: 32px;
           padding: 1px; /* Very thin gradient border */
           background: rgba(255,255,255,0.05);
           cursor: pointer;
           transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
           isolation: isolate;
         }
         
         /* The animated gradient border */
         .wow-card::before {
           content: '';
           position: absolute;
           inset: 0;
           border-radius: 32px;
           padding: 1px;
           background: linear-gradient(135deg, var(--theme-color) 0%, transparent 50%, var(--theme-color) 100%);
           background-size: 200% 200%;
           -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
           -webkit-mask-composite: xor;
           mask-composite: exclude;
           opacity: 0;
           transition: opacity 0.5s ease;
           z-index: -1;
         }
         
         .wow-card:hover {
           transform: translateY(-10px) scale(1.02);
         }
         .wow-card:hover::before {
           opacity: 1;
           animation: borderDance 3s linear infinite;
         }
         
         @keyframes borderDance {
           0% { background-position: 0% 50%; }
           50% { background-position: 100% 50%; }
           100% { background-position: 0% 50%; }
         }

         .wow-card-inner {
           background: #1a1a1a;
           border-radius: 31px;
           height: 100%;
           min-height: 480px;
           padding: 2.5rem 1.8rem;
           position: relative;
           overflow: hidden;
           display: flex;
           flex-direction: column;
           z-index: 1;
         }
         
         /* Internal Glowing Orb */
         .wow-card-inner::after {
           content: '';
           position: absolute;
           top: -100px;
           right: -100px;
           width: 300px;
           height: 300px;
           background: var(--theme-color);
           filter: blur(100px);
           opacity: 0.03;
           transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
           border-radius: 50%;
           z-index: -1;
         }
         .wow-card:hover .wow-card-inner::after {
           opacity: 0.15;
           transform: scale(1.2) translate(-20px, 20px);
         }

         .icon-wrapper {
           width: 55px;
           height: 55px;
           border-radius: 16px;
           background: rgba(255,255,255,0.03);
           border: 1px solid rgba(255,255,255,0.05);
           display: flex;
           align-items: center;
           justify-content: center;
           color: var(--theme-color);
           margin-bottom: 2rem;
           transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
           box-shadow: 0 10px 30px rgba(0,0,0,0.5);
         }
         .wow-card:hover .icon-wrapper {
           background: var(--theme-color);
           color: #000;
           transform: scale(1.1) rotate(-5deg);
           box-shadow: 0 15px 40px var(--theme-color);
           border-color: transparent;
         }

         .card-title {
           font-size: 1.5rem;
           font-weight: 800;
           letter-spacing: -0.02em;
           margin-bottom: 1rem;
           color: #fff;
           transition: color 0.3s ease;
         }

         .card-desc {
           color: #888;
           font-size: 1rem;
           line-height: 1.5;
           margin-bottom: 2.5rem;
           flex: 1;
         }

         .badge-wrapper {
           display: inline-flex;
           align-items: center;
           padding: 0.6rem 1.2rem;
           background: rgba(255,255,255,0.03);
           border: 1px solid rgba(255,255,255,0.05);
           border-radius: 100px;
           align-self: flex-start;
           position: relative;
           overflow: hidden;
           color: #aaa;
           transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
         }
         .wow-card:hover .badge-wrapper {
           background: var(--theme-color);
           color: #000;
           border-color: transparent;
           transform: translateY(-5px) rotate(-2deg);
           box-shadow: 0 10px 30px rgba(0,0,0,0.5);
         }

         .corner-arrow {
           position: absolute;
           top: 2rem;
           right: 2rem;
           color: rgba(255,255,255,0.1);
           transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
           transform: scale(0.8);
         }
         .wow-card:hover .corner-arrow {
           color: var(--theme-color);
           transform: translate(10px, -10px) scale(1);
         }
       `}} />
    </section>
  );
}
