"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ShoppingCart, Camera, Star, TrendingUp } from 'lucide-react';

const SHOWCASE_DATA = [
  {
    id: "tshirt",
    category: "T-Shirt & Knitwear",
    subcategory: "E-Commerce Clean",
    useCases: ["Amazon", "Etsy", "Shopify"],
    desc: "Smetti di scattare su manichini rigidi! Trasforma le foto in piano in immagini catalogo ad altissima conversione per il tuo e-commerce.",
    before: "/prove/Tshirt/Ecommerce Clean/prima.jpeg",
    afters: [
      "/prove/Tshirt/Ecommerce Clean/627D75E3-D637-42B7-94EB-1672B1AB8C88.jpeg",
      "/prove/Tshirt/Ecommerce Clean/977B8826-3409-4E4A-A402-9DD039F7A315.jpeg",
      "/prove/Tshirt/Ecommerce Clean/1029E5FF-14DC-4352-9C9C-3E3538BAD5D3.jpeg",
      "/prove/Tshirt/UCG/A31F09FA-E905-4EB4-8741-233184C8503F.jpeg"
    ]
  },
  {
    id: "donna",
    category: "Women's Fashion",
    subcategory: "Outfit Coordination & Lifestyle",
    useCases: ["Instagram", "Pinterest", "FB Ads"],
    desc: "Fai indossare i tuoi capi a modelle digitali iper-realistiche in ville lussuose o strade eleganti. Il tuo feed Instagram non è mai stato così vivo.",
    before: "/prove/Donna/Outfit Coordination/prima1.jpeg",
    afters: [
      "/prove/Donna/Outfit Coordination/7EAF8589-60C2-4290-9459-7D26543DAA81.jpeg",
      "/prove/Donna/Instagram Lifestyle/9D7AAA55-49BF-44F2-AAEE-0C4A60F1ED95.jpeg",
      "/prove/Donna/Luxury Villa Shoot/7061528C-C8DD-499C-8F24-BD14A9A9F02D.jpeg",
      "/prove/Donna/Mature Sophistication/AC6DA985-67EA-4FE3-8362-C339D3172ED3.jpeg"
    ]
  },
  {
    id: "uomo",
    category: "Men's Apparel",
    subcategory: "Executive & Silver Fox",
    useCases: ["LinkedIn", "Luxury Magazines", "Boutique"],
    desc: "Mostra i tuoi abiti nel loro habitat naturale. Eleva istantaneamente il valore percepito della tua collezione sartoriale maschile.",
    before: "/prove/Uomo/Silver Fox Luxury/prima.jpeg",
    afters: [
      "/prove/Uomo/Silver Fox Luxury/2EB5B578-EDA2-4462-B395-8EE87E11B6AF.jpeg",
      "/prove/Uomo/Silver Fox Luxury/DF20CD71-C09D-4B2C-BC95-206D1DA03D26.jpeg",
      "/prove/Uomo/Executive Lifestyle/8D4AB822-2200-4992-9328-0A9E6A4F03C8.jpeg",
      "/prove/Uomo/Street Style/645279D9-CA01-4423-A621-611C6AD6FC44.jpeg"
    ]
  },
  {
    id: "calzature",
    category: "Footwear & Sneakers",
    subcategory: "Product Clean & Urban",
    useCases: ["Zalando", "Asos", "E-commerce"],
    desc: "Eliminazione totale dei difetti o degli sfondi rovinati. I tuoi scatti in magazzino diventano still-life perfetti per la vendita online.",
    before: "/prove/Calzature/Product Clean/prima.jpeg",
    afters: [
      "/prove/Calzature/Product Clean/F5D64049-913B-41C3-82BB-B4E9E29AE392.jpeg",
      "/prove/Calzature/sneakers-donna/D725FEDD-7A1B-4FEE-9D5E-630B7864FEA0.jpeg",
      "/prove/Calzature/sneakers-donna/731A739F-C5D5-4571-AE59-21E6F359204A.jpeg",
      "/prove/Calzature/Tacchi/C2819FD4-7DEE-4166-8DDF-8190AE44F58A.jpeg"
    ]
  },
  {
    id: "bambino",
    category: "Kids Collection",
    subcategory: "Playful Lifestyle",
    useCases: ["Parenting Groups", "IG Posts", "TikTok"],
    desc: "Scatti lifestyle dolci e coinvolgenti, perfetti per catturare l'attenzione dei genitori sui social media.",
    before: "/prove/Bambino/Playful Lifestyle/prima.jpeg",
    afters: [
      "/prove/Bambino/Playful Lifestyle/38636DEF-3EB4-4A2F-929B-85CF31391D2F.jpeg",
      "/prove/Bambino/Playful Lifestyle/E7B6508A-8284-4E4E-9984-0D8AA49DB668.jpeg",
      "/prove/Bambino/Playful Lifestyle/2624A391-1824-4FD0-9F0F-728060B61F75.jpeg",
      "/prove/Bambino/Elegant Event/0CC85BF4-2349-4DBD-A4E0-3218BD7376C9.jpeg"
    ]
  }
];

export default function DynamicShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = SHOWCASE_DATA.map((_, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      );
      
      if (sectionRefs.current[index]) {
        observer.observe(sectionRefs.current[index]!);
      }
      return observer;
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  return (
    <div className="dynamic-showcase-container">
      <div className="ds-sticky-sidebar hide-mobile">
        {SHOWCASE_DATA.map((item, idx) => (
          <div 
            key={item.id} 
            className={`ds-sidebar-item ${activeIndex === idx ? 'active' : ''}`}
          >
            <div className="ds-category">{item.category}</div>
            <h3 className="ds-subcategory">{item.subcategory}</h3>
            <p className="ds-desc">{item.desc}</p>
            
            <div className="ds-usecases">
              {item.useCases.map(uc => (
                <span key={uc} className="ds-badge">
                  {uc.toLowerCase().includes('amazon') || uc.toLowerCase().includes('shop') ? <ShoppingCart size={14} /> : 
                   uc.toLowerCase().includes('insta') || uc.toLowerCase().includes('fb') ? <Camera size={14} /> : 
                   <TrendingUp size={14} />}
                  {uc}
                </span>
              ))}
            </div>
            
            <div className="ds-before-preview">
              <div className="ds-before-label">FOTO ORIGINALE IN MAGAZZINO</div>
              <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <Image src={item.before} alt="Prima" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 300px" quality={60} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ds-scroll-content">
        {SHOWCASE_DATA.map((item, idx) => (
          <div 
            key={`content-${item.id}`} 
            ref={(el) => { sectionRefs.current[idx] = el; }} 
            className="ds-section"
          >
             <div className="ds-mobile-header show-mobile">
                <div className="ds-category">{item.category}</div>
                <h3 className="ds-subcategory">{item.subcategory}</h3>
                <div className="ds-usecases" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {item.useCases.map(uc => <span key={uc} className="ds-badge">{uc}</span>)}
                </div>
                <div className="ds-before-preview" style={{ marginBottom: '2rem' }}>
                  <div className="ds-before-label">FOTO ORIGINALE</div>
                  <div style={{ position: 'relative', width: '150px', height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Image src={item.before} alt="Prima" fill style={{ objectFit: 'cover' }} quality={60} />
                  </div>
                </div>
             </div>

             <div className="ds-after-grid">
               {item.afters.map((afterImg, i) => (
                 <div key={i} className={`ds-after-card ${i === 0 ? 'ds-card-large' : ''}`}>
                    <div className="ds-after-label">
                      <Sparkles size={12} /> RISULTATO IA
                    </div>
                    <Image src={afterImg} alt={`Risultato ${i}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 600px" quality={80} />
                 </div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
