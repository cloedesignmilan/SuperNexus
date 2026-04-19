"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Sparkles, ShoppingCart, Camera, Star, TrendingUp } from 'lucide-react';

const SHOWCASE_DATA = 
[
  {
    "id": "t-shirt & knitwear-streetwear-flatlay",
    "category": "T-Shirt & Knitwear",
    "subcategory": "Streetwear FlatLay",
    "useCases": [
      "Instagram",
      "Pinterest",
      "Hypebeast"
    ],
    "desc": "Transform simple flat lays into hype streetwear shots with dynamic backgrounds and modern aesthetics.",
    "before": "/prove/Tshirt/Tshirt- FlatLay/prima.jpeg",
    "afters": [
      "/prove/Tshirt/Tshirt- FlatLay/1.JPG",
      "/prove/Tshirt/Tshirt- FlatLay/ChatGPT Image 19 apr 2026, 16_13_47.jpeg",
      "/prove/Tshirt/Tshirt- FlatLay/IMG_1810.JPG",
      "/prove/Tshirt/Tshirt- FlatLay/IMG_1809.JPG",
      "/prove/Tshirt/Tshirt- FlatLay/IMG_1808.JPG",
      "/prove/Tshirt/Tshirt- FlatLay/IMG_1807.JPG"
    ]
  },
  {
    "id": "t-shirt & knitwear-e-commerce-clean",
    "category": "T-Shirt & Knitwear",
    "subcategory": "E-Commerce Clean",
    "useCases": [
      "Amazon",
      "Etsy",
      "Shopify"
    ],
    "desc": "Stop shooting on rigid mannequins! Transform flat lays into highly converting e-commerce catalog photos.",
    "before": "/prove/Tshirt/Ecommerce Clean/prima.jpeg",
    "afters": [
      "/prove/Tshirt/Ecommerce Clean/627D75E3-D637-42B7-94EB-1672B1AB8C88.jpeg",
      "/prove/Tshirt/Ecommerce Clean/977B8826-3409-4E4A-A402-9DD039F7A315.jpeg",
      "/prove/Tshirt/Ecommerce Clean/1029E5FF-14DC-4352-9C9C-3E3538BAD5D3.jpeg",
      "/prove/Tshirt/Ecommerce Clean/285EF91B-511E-4866-8E52-00DCF520370B.jpeg"
    ]
  },
  {
    "id": "t-shirt & knitwear-ugc-(user-generated-content)",
    "category": "T-Shirt & Knitwear",
    "subcategory": "UGC (User Generated Content)",
    "useCases": [
      "TikTok",
      "IG Reels",
      "FB Ads"
    ],
    "desc": "Create relatable, everyday lifestyle shots that look like genuine customer photos for high-converting ads.",
    "before": "/prove/Tshirt/UCG/prima.jpeg",
    "afters": [
      "/prove/Tshirt/UCG/A31F09FA-E905-4EB4-8741-233184C8503F.jpeg",
      "/prove/Tshirt/UCG/5AD87520-5730-481F-9D98-89E55C69521C.jpeg",
      "/prove/Tshirt/UCG/15AC4616-9783-4ECB-9F56-D058138327BE.jpeg",
      "/prove/Tshirt/UCG/3AFDA8DC-7D1E-4D9C-B6BB-27DA807B0E70.jpeg"
    ]
  },
  {
    "id": "footwear & sneakers-product-clean",
    "category": "Footwear & Sneakers",
    "subcategory": "Product Clean",
    "useCases": [
      "Amazon",
      "Shopify"
    ],
    "desc": "Total elimination of defects. Your warehouse shots become perfect still-lifes ready for online sales.",
    "before": "/prove/Calzature/Product Clean/prima.jpeg",
    "afters": [
      "/prove/Calzature/Product Clean/F5D64049-913B-41C3-82BB-B4E9E29AE392.jpeg",
      "/prove/Calzature/Product Clean/6263372A-FD3D-4E70-B5F6-A77489858AC2.jpeg",
      "/prove/Calzature/Product Clean/IMG_1823.JPG",
      "/prove/Calzature/Product Clean/IMG_1824.JPG"
    ]
  },
  {
    "id": "women's fashion-mannequin-display",
    "category": "Women's Fashion",
    "subcategory": "Mannequin Display",
    "useCases": [
      "Boutique",
      "Catalog"
    ],
    "desc": "Turn standard store mannequins into lifelike models wearing your latest collections.",
    "before": "/prove/Donna/Mannequin Display/prima.jpeg",
    "afters": [
      "/prove/Donna/Mannequin Display/IMG_1829.JPG",
      "/prove/Donna/Mannequin Display/IMG_1830.JPG",
      "/prove/Donna/Mannequin Display/IMG_1832.JPG",
      "/prove/Donna/Mannequin Display/IMG_1833.JPG"
    ]
  },
  {
    "id": "women's fashion-runway-editorial",
    "category": "Women's Fashion",
    "subcategory": "Runway Editorial",
    "useCases": [
      "High Fashion",
      "Magazines"
    ],
    "desc": "Place your garments in professional runway environments with perfect lighting.",
    "before": "/prove/Donna/Runway Editorial/prima.jpeg",
    "afters": [
      "/prove/Donna/Runway Editorial/EDF71B0F-088A-433A-8751-8307C34466F4.jpeg",
      "/prove/Donna/Runway Editorial/CC447C81-AA50-483E-9538-710DCF982751.jpeg",
      "/prove/Donna/Runway Editorial/563EAD8C-4CB9-44CF-9EBF-B9945A787677.jpeg"
    ]
  },
  {
    "id": "women's fashion-luxury-villa-shoot",
    "category": "Women's Fashion",
    "subcategory": "Luxury Villa Shoot",
    "useCases": [
      "Instagram",
      "Luxury",
      "FB Ads"
    ],
    "desc": "Have your garments worn by hyper-realistic digital models in luxury villas.",
    "before": "/prove/Donna/Luxury Villa Shoot/prima.jpeg",
    "afters": [
      "/prove/Donna/Luxury Villa Shoot/195E2086-E0B9-4CBD-B2BB-DDA2D3913BA0.jpeg",
      "/prove/Donna/Luxury Villa Shoot/1F1B70DF-D52A-47FD-B820-42B502F12340.jpeg",
      "/prove/Donna/Luxury Villa Shoot/51B1E9B9-ABCD-4E6A-AC79-E178B0C9F5CB.jpeg",
      "/prove/Donna/Luxury Villa Shoot/65A60FA9-9CEC-4B9F-B6D9-EB7478FC8FBB.jpeg"
    ]
  },
  {
    "id": "women's fashion-instagram-lifestyle",
    "category": "Women's Fashion",
    "subcategory": "Instagram Lifestyle",
    "useCases": [
      "Influencer",
      "TikTok",
      "IG Reels"
    ],
    "desc": "Create vibrant, trendy lifestyle shots that perfectly match the Instagram aesthetic.",
    "before": "/prove/Donna/Instagram Lifestyle/prima.jpeg",
    "afters": [
      "/prove/Donna/Instagram Lifestyle/B8DF2811-7EFF-4CB6-AC32-6C841B0407BF.jpeg",
      "/prove/Donna/Instagram Lifestyle/9D7AAA55-49BF-44F2-AAEE-0C4A60F1ED95.jpeg",
      "/prove/Donna/Instagram Lifestyle/csdssd.jpeg"
    ]
  },
  {
    "id": "women's fashion-mature-sophistication",
    "category": "Women's Fashion",
    "subcategory": "Mature Sophistication",
    "useCases": [
      "LinkedIn",
      "Catalog",
      "Classic"
    ],
    "desc": "Elegant and sophisticated shots targeting a mature, classy demographic.",
    "before": "/prove/Donna/Mature Sophistication/prima.jpeg",
    "afters": [
      "/prove/Donna/Mature Sophistication/AC6DA985-67EA-4FE3-8362-C339D3172ED3.jpeg",
      "/prove/Donna/Mature Sophistication/F7B4BC3E-7094-419E-88DF-2B8508E8FF0A.jpeg",
      "/prove/Donna/Mature Sophistication/A37390F8-AB17-4435-B6E9-B848293196EF.jpeg"
    ]
  },
  {
    "id": "women's fashion-gym-&-fitness",
    "category": "Women's Fashion",
    "subcategory": "Gym & Fitness",
    "useCases": [
      "Activewear",
      "TikTok",
      "Instagram"
    ],
    "desc": "Dynamic, high-energy shots perfect for showcasing athletic wear in action.",
    "before": "/prove/Donna/Gym & Fitness/prima.jpg",
    "afters": [
      "/prove/Donna/Gym & Fitness/E29A3BA2-793E-41BE-989E-22AE1A7F3288.jpeg",
      "/prove/Donna/Gym & Fitness/FED0DBA2-A8CC-4589-B8CF-2A6FE38CD6FD.jpeg",
      "/prove/Donna/Gym & Fitness/ssss.jpeg"
    ]
  },
  {
    "id": "women's fashion-outfit-coordination",
    "category": "Women's Fashion",
    "subcategory": "Outfit Coordination",
    "useCases": [
      "Pinterest",
      "Lookbook"
    ],
    "desc": "Show how different pieces match together in realistic, coordinated street looks.",
    "before": "/prove/Donna/Outfit Coordination/prima1.jpeg",
    "afters": [
      "/prove/Donna/Outfit Coordination/7EAF8589-60C2-4290-9459-7D26543DAA81.jpeg",
      "/prove/Donna/Outfit Coordination/E2C6ECCA-79C6-4521-85D1-08C7391602CF.jpeg",
      "/prove/Donna/Outfit Coordination/4DE4C0AE-7127-40B5-AD16-9782A058EF00.jpeg"
    ]
  },
  {
    "id": "bridal-bridal-collection",
    "category": "Bridal",
    "subcategory": "Bridal Collection",
    "useCases": [
      "Atelier",
      "Wedding",
      "Pinterest"
    ],
    "desc": "Transform an anonymous dress hanging in the Atelier into sumptuous catalogs that enchant brides.",
    "before": "/prove/Sposa/prima.jpeg",
    "afters": [
      "/prove/Sposa/7B9D7519-83A0-4912-A5BD-C99401EBB01A.jpeg",
      "/prove/Sposa/913E3851-9066-48EC-B2F8-0D2424052379.jpeg",
      "/prove/Sposa/2E96FBCB-C57A-4CE2-963C-B490DC8F536B.jpeg",
      "/prove/Sposa/F9A12A66-4AE0-477C-8753-60DB9267714D.jpeg"
    ]
  },
  {
    "id": "groom & formal-groom-collection",
    "category": "Groom & Formal",
    "subcategory": "Groom Collection",
    "useCases": [
      "Tailoring",
      "Wedding",
      "Magazine"
    ],
    "desc": "Elegant formal wear presented in stunning, romantic locations.",
    "before": "/prove/Sposo/prima.jpeg",
    "afters": [
      "/prove/Sposo/41138CB3-9781-4372-9A2F-CAB40746BE58.jpeg",
      "/prove/Sposo/50893A5E-4586-4D83-8D77-F1C767804D17.jpeg",
      "/prove/Sposo/dsdsds.jpeg",
      "/prove/Sposo/B127FC8B-E1B6-4CD7-A0BE-927BCAEA0631.jpeg"
    ]
  },
  {
    "id": "men's apparel-silver-fox-luxury",
    "category": "Men's Apparel",
    "subcategory": "Silver Fox Luxury",
    "useCases": [
      "Luxury",
      "Boutique"
    ],
    "desc": "Target premium customers with sophisticated, mature male models.",
    "before": "/prove/Uomo/Silver Fox Luxury/prima.jpeg",
    "afters": [
      "/prove/Uomo/Silver Fox Luxury/2EB5B578-EDA2-4462-B395-8EE87E11B6AF.jpeg",
      "/prove/Uomo/Silver Fox Luxury/DF20CD71-C09D-4B2C-BC95-206D1DA03D26.jpeg",
      "/prove/Uomo/Silver Fox Luxury/45E2522D-17C4-4EE7-81E6-06C4FD35C874.jpeg"
    ]
  },
  {
    "id": "men's apparel-executive-lifestyle",
    "category": "Men's Apparel",
    "subcategory": "Executive Lifestyle",
    "useCases": [
      "LinkedIn",
      "Business",
      "Magazine"
    ],
    "desc": "Showcase your suits in their natural habitat: modern offices and business environments.",
    "before": "/prove/Uomo/Executive Lifestyle/prima.jpeg",
    "afters": [
      "/prove/Uomo/Executive Lifestyle/8D4AB822-2200-4992-9328-0A9E6A4F03C8.jpeg",
      "/prove/Uomo/Executive Lifestyle/C0FC56BB-2F07-4D5A-BE4E-FB0C0C1BFC14.jpeg",
      "/prove/Uomo/Executive Lifestyle/D4C9B25F-423D-4C2A-B5F8-E03748BAFDD0.jpeg"
    ]
  },
  {
    "id": "kids collection-elegant-event",
    "category": "Kids Collection",
    "subcategory": "Elegant Event",
    "useCases": [
      "Ceremony",
      "Catalog"
    ],
    "desc": "Adorable, high-quality shots for kids' formal wear and special occasions.",
    "before": "/prove/Bambino/Elegant Event/prima.jpeg",
    "afters": [
      "/prove/Bambino/Elegant Event/0CC85BF4-2349-4DBD-A4E0-3218BD7376C9.jpeg",
      "/prove/Bambino/Elegant Event/722FDB9F-0B65-4671-BEA0-E02088969C51.jpeg"
    ]
  },
  {
    "id": "kids collection-playful-lifestyle",
    "category": "Kids Collection",
    "subcategory": "Playful Lifestyle",
    "useCases": [
      "Parenting Groups",
      "IG Posts",
      "TikTok"
    ],
    "desc": "Sweet and engaging lifestyle shots perfect for capturing the attention of parents.",
    "before": "/prove/Bambino/Playful Lifestyle/prima.jpeg",
    "afters": [
      "/prove/Bambino/Playful Lifestyle/38636DEF-3EB4-4A2F-929B-85CF31391D2F.jpeg",
      "/prove/Bambino/Playful Lifestyle/E7B6508A-8284-4E4E-9984-0D8AA49DB668.jpeg",
      "/prove/Bambino/Playful Lifestyle/2624A391-1824-4FD0-9F0F-728060B61F75.jpeg"
    ]
  }
];


export default function DynamicShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);


  // Hide main header on mobile when entering showcase
  useEffect(() => {
    const showcaseContainer = document.querySelector('.dynamic-showcase-container');
    const header = document.querySelector('.landing-header') as HTMLElement;
    
    if (!showcaseContainer || !header) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (window.innerWidth <= 900) {
        if (entry.isIntersecting) {
          header.style.transform = 'translateY(-100%)';
          header.style.transition = 'transform 0.3s ease';
        } else {
          header.style.transform = 'translateY(0)';
        }
      }
    }, { rootMargin: '-10% 0px -10% 0px', threshold: 0 });

    observer.observe(showcaseContainer);
    return () => {
      observer.disconnect();
      if (header) header.style.transform = 'translateY(0)';
    };
  }, []);

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
             <div className="show-mobile" style={{
                  position: 'sticky',
                  top: '-1px',
                  zIndex: 30,
                  background: 'rgba(8, 8, 8, 0.95)',
                  backdropFilter: 'blur(10px)',
                  padding: '1rem 0',
                  margin: '0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div className="ds-category">{item.category}</div>
                  <h3 className="ds-subcategory" style={{ margin: 0, fontSize: '1.5rem' }}>{item.subcategory}</h3>
             </div>

             <div className="ds-mobile-header show-mobile" style={{ marginTop: '1rem' }}>
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
