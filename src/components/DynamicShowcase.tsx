"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ShoppingCart, Camera, Star, TrendingUp } from 'lucide-react';

const SHOWCASE_DATA = [
  {
    id: "tshirt-flatlay",
    category: "T-Shirt & Knitwear",
    subcategory: "Streetwear FlatLay",
    useCases: ["Instagram", "Pinterest", "Hypebeast"],
    desc: "Transform simple flat lays into hype streetwear shots with dynamic backgrounds and modern aesthetics.",
    before: "/prove/Tshirt/Tshirt- FlatLay/prima.jpeg",
    afters: [
      "/prove/Tshirt/Tshirt- FlatLay/IMG_1806.JPG",
      "/prove/Tshirt/Tshirt- FlatLay/IMG_1807.JPG",
      "/prove/Tshirt/Tshirt- FlatLay/IMG_1808.JPG",
      "/prove/Tshirt/Tshirt- FlatLay/IMG_1809.JPG"
    ]
  },
  {
    id: "tshirt-ecommerce",
    category: "T-Shirt & Knitwear",
    subcategory: "E-Commerce Clean",
    useCases: ["Amazon", "Etsy", "Shopify"],
    desc: "Stop shooting on rigid mannequins! Transform flat lays into highly converting e-commerce catalog photos.",
    before: "/prove/Tshirt/Ecommerce Clean/prima.jpeg",
    afters: [
      "/prove/Tshirt/Ecommerce Clean/627D75E3-D637-42B7-94EB-1672B1AB8C88.jpeg",
      "/prove/Tshirt/Ecommerce Clean/977B8826-3409-4E4A-A402-9DD039F7A315.jpeg",
      "/prove/Tshirt/Ecommerce Clean/1029E5FF-14DC-4352-9C9C-3E3538BAD5D3.jpeg",
      "/prove/Tshirt/Ecommerce Clean/285EF91B-511E-4866-8E52-00DCF520370B.jpeg"
    ]
  },
  {
    id: "tshirt-ugc",
    category: "T-Shirt & Knitwear",
    subcategory: "UGC (User Generated Content)",
    useCases: ["TikTok", "IG Reels", "FB Ads"],
    desc: "Create relatable, everyday lifestyle shots that look like genuine customer photos for high-converting ads.",
    before: "/prove/Tshirt/UCG/prima.png",
    afters: [
      "/prove/Tshirt/UCG/A31F09FA-E905-4EB4-8741-233184C8503F.jpeg",
      "/prove/Tshirt/UCG/5AD87520-5730-481F-9D98-89E55C69521C.jpeg",
      "/prove/Tshirt/UCG/15AC4616-9783-4ECB-9F56-D058138327BE.jpeg",
      "/prove/Tshirt/UCG/3AFDA8DC-7D1E-4D9C-B6BB-27DA807B0E70.jpeg"
    ]
  },
  {
    id: "donna",
    category: "Women's Fashion",
    subcategory: "Outfit Coordination & Lifestyle",
    useCases: ["Instagram", "Pinterest", "FB Ads"],
    desc: "Have your garments worn by hyper-realistic digital models in luxury villas or elegant streets. Your Instagram feed has never been so alive.",
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
    desc: "Showcase your suits in their natural habitat. Instantly elevate the perceived value of your menswear collection.",
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
    desc: "Total elimination of defects or ruined backgrounds. Your warehouse shots become perfect still-lifes ready for online sales.",
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
    desc: "Sweet and engaging lifestyle shots perfect for capturing the attention of parents on social media.",
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
              <div className="ds-before-label">ORIGINAL WAREHOUSE PHOTO</div>
              <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <Image src={item.before} alt="Before" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 300px" quality={60} />
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
                  <div className="ds-before-label">ORIGINAL PHOTO</div>
                  <div style={{ position: 'relative', width: '150px', height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Image src={item.before} alt="Before" fill style={{ objectFit: 'cover' }} quality={60} />
                  </div>
                </div>
             </div>

             <div className="ds-after-grid">
               {item.afters.map((afterImg, i) => (
                 <div key={i} className={`ds-after-card ${i === 0 ? 'ds-card-large' : ''}`}>
                    <div className="ds-after-label">
                      <Sparkles size={12} /> AI RESULT
                    </div>
                    <Image src={afterImg} alt={`Result ${i}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 600px" quality={80} />
                 </div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
