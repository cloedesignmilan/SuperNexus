"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Footprints, Shirt, Heart, Smartphone, PartyPopper, ChevronRight, Scissors } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import SocialPostMockup from './SocialPostMockup';

const CATEGORIES = [
  { 
    id: 'donna', 
    label: 'Women', 
    icon: <Shirt size={28} strokeWidth={1.5} />, 
    title: 'Women\'s Apparel', 
    desc: 'No more sad hangers! Have your garments worn by hyper-realistic digital models. Showcase your collection at its maximum potential.',
    imgSrc: '/showcase/donna/prima.webp', phoneLabel: 'BEFORE (STORE)', 
    post1Src: '/showcase/donna/1.webp', post1Label: 'LIFESTYLE', 
    post2Src: '/showcase/donna/2.webp', post2Label: 'REEL COVER', 
    account: 'donna_fashion', likes: '3.400'
  },
  { 
    id: 'uomo', 
    label: 'Men', 
    icon: <Briefcase size={28} strokeWidth={1.5} />, 
    title: 'Men\'s Apparel & Business', 
    desc: 'Showcase your suits in their natural habitat: luxury offices, metropolitan streets, or social events. Instantly elevate the value of your menswear.',
    imgSrc: '/showcase/uomo/prima.jpg', phoneLabel: 'BEFORE (WINDOW)', 
    post1Src: '/showcase/uomo/1.webp', post1Label: 'CITY LOOKBOOK', 
    post2Src: '/showcase/uomo/2.webp', post2Label: 'STREET ADS', 
    account: 'uomo_style', likes: '2.100'
  },
  { 
    id: 'tshirt', 
    label: 'T-Shirts', 
    isNew: true,
    icon: <Scissors size={28} strokeWidth={1.5} />, 
    title: 'T-Shirts & Knitwear', 
    desc: 'Stop shooting on rigid mannequins! Your t-shirts will come to life on dynamic models, creating super catchy street-style looks.',
    imgSrc: '/showcase/tshirt/prima.webp', phoneLabel: 'BEFORE (FLAT)', 
    post1Src: '/showcase/tshirt/1.webp', post1Label: 'STREETWEAR', 
    post2Src: '/showcase/tshirt/2.webp', post2Label: 'CATALOG', 
    account: 'street_apparel', likes: '5.200'
  },
  { 
    id: 'cerimonia', 
    label: 'Ceremony', 
    icon: <Heart size={28} strokeWidth={1.5} />, 
    title: 'Formal Wear & Bridal', 
    desc: 'Transform an anonymous dress hanging in the Atelier into sumptuous catalogs, ancient palaces, and historic aisles that enchant customers.',
    imgSrc: '/showcase/cerimonia/sposa-prima.webp', phoneLabel: 'BEFORE (ATELIER)', 
    post1Src: '/showcase/cerimonia/sposa-dopo.webp', post1Label: 'BRIDE', 
    post2Src: '/showcase/cerimonia/sposo-dopo.webp', post2Label: 'GROOM', 
    account: 'atelier_cerimonia', likes: '8.450'
  },
  { 
    id: 'festa', 
    label: 'Parties', 
    icon: <PartyPopper size={28} strokeWidth={1.5} />, 
    title: '18th Birthday & Evening Gowns', 
    desc: 'Show the hypnotic attraction of your evening wear against backgrounds of chic clubs and vibrant night lights. Your Stories will skyrocket.',
    imgSrc: '/showcase/festa/prima.jpg', phoneLabel: 'BEFORE (STORE)', 
    post1Src: '/showcase/festa/dopo1.jpg', post1Label: 'IG STORY', 
    post2Src: '/showcase/festa/dopo2.jpg', post2Label: 'TIKTOK COVER', 
    account: 'party_dress_store', likes: '6.890'
  },
  { 
    id: 'calzature', 
    label: 'Footwear', 
    icon: <Footprints size={28} strokeWidth={1.5} />, 
    title: 'Footwear & Sneakers', 
    desc: 'Total elimination of defects, hands, or ruined backgrounds. Your warehouse shots become perfect still-lifes, ready for the store.',
    imgSrc: '/showcase/scarpe/prima.jpg', phoneLabel: 'BEFORE (STORE)', 
    post1Src: '/showcase/scarpe/negozio.jpg', post1Label: 'E-COMMERCE', 
    post2Src: '/showcase/scarpe/indossata.jpg', post2Label: 'IG POST', 
    account: 'footwear_boutique', likes: '1.240'
  },
  { 
    id: 'vendita', 
    label: 'Clearance', 
    icon: <Smartphone size={28} strokeWidth={1.5} />, 
    title: 'Compositions for Quick Sales', 
    desc: 'Quickly transform surplus and outlet items into irresistible posts to clear out inventory on Amazon, eBay, Vinted, or Depop.',
    imgSrc: '/showcase/invitati/prima.jpg', phoneLabel: 'WAREHOUSE SHOT', 
    post1Src: '/showcase/vendita/marketplace.webp', post1Label: 'MARKETPLACE', 
    post2Src: '/showcase/vendita/vetrina.webp', post2Label: 'FB SHOP', 
    account: 'outlet_store', likes: '902'
  }
];

export default function ShowcaseTabs() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const [showArrow, setShowArrow] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);

  // LOGICA SWIPE PER LA MAC WINDOW
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setShowArrow(false); // Nascondi la freccia dopo il primo swipe con successo
      const currentIndex = CATEGORIES.findIndex(c => c.id === activeTab);
      let nextIndex = currentIndex;
      if (isLeftSwipe) {
        nextIndex = (currentIndex + 1) % CATEGORIES.length;
      } else {
        nextIndex = (currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
      }
      setActiveTab(CATEGORIES[nextIndex].id);
    }
  };

  // GESTORE SCROLL DELLE CATEGORIE SUI DISPOSITIVI MOBILI
  const handleTabsScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      // Se l'utente è arrivato quasi alla fine (+/- 10px), nascondi la freccia
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        setShowArrow(false);
      } else {
        setShowArrow(true);
      }
    }
  };

  // Controlla alla prima apertura se serve la freccia (es. schermi molto piccoli)
  useEffect(() => {
    handleTabsScroll();
    // Aggiungiamo un event listener al resize per ricalcolare
    window.addEventListener('resize', handleTabsScroll);
    return () => window.removeEventListener('resize', handleTabsScroll);
  }, []);

  const activeCategory = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  return (
    <div className="showcase-tabs-container" style={{ position: 'relative' }}>
      
      {/* FRECCIA STICKY PREMIUM SU MOBILE (In flow nativo per supporto Safari/iOS) */}
      <div className="hand-drawn-arrow-wrapper">
        <div className={`hand-drawn-arrow ${showArrow ? 'visible' : 'hidden'}`}>
          <span style={{ fontFamily: 'var(--font-primary), sans-serif', fontSize: '1rem', fontWeight: 'bold', marginBottom: '-5px', transform: 'rotate(-5deg)', color: '#ccff00' }}>Swipe</span>
          <svg style={{ flexShrink: 0, minHeight: '30px' }} width="60" height="30" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20 Q 50 10, 100 20" stroke="#ccff00" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <path d="M85 10 L 105 20 L 85 30" stroke="#ccff00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* TABS ROW (Scorrevole orizzontalmente su mobile) */}
      <div 
        className="tabs-row-scrollable" 
        ref={tabsRef}
        onScroll={handleTabsScroll}
      >
        {CATEGORIES.map((cat) => (
          <button 
            key={cat.id} 
            className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
            style={{ position: 'relative', flexShrink: 0 }}
          >
            {(cat as any).isNew && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ccff00',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '12px',
                boxShadow: '0 4px 10px rgba(204,255,0,0.4)',
                letterSpacing: '0.5px',
                zIndex: 10
              }}>
                NEW
              </span>
            )}
            <div className="tab-icon-wrapper">{cat.icon}</div>
            <span className="tab-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* MAC OS WINDOW INTERATTIVA */}
      <div 
        className="mac-window"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ position: 'relative' }}
      >
         {/* HEADER MAC */}
         <div className="mac-header">
           <div className="mac-dots">
             <div className="mac-dot" style={{ backgroundColor: '#ff5f56' }}></div>
             <div className="mac-dot" style={{ backgroundColor: '#ffbd2e' }}></div>
             <div className="mac-dot" style={{ backgroundColor: '#27c93f' }}></div>
           </div>
           <div className="mac-title">
             <span className="hide-mobile">SuperNexus </span>Dashboard / {activeCategory.label}
           </div>
           <div style={{ width: '60px' }}></div> {/* Spacer */}
         </div>
         
         {/* IL CONTENUTO CHE CAMBIA */}
         <div className="mac-content" key={activeTab}> {/* La Key serve a forzare l'animazione al rientro */}
            
            <div className="mac-sidebar">
               <h3>{activeCategory.title}</h3>
               <p>{activeCategory.desc}</p>
               <ul className="mac-features">
                 <li><ChevronRight size={16} /> Optimized for Social Ads</li>
                 <li><ChevronRight size={16} /> Set of 3, 5, or 10 simultaneous shots</li>
                 <li><ChevronRight size={16} /> AI pre-check on garment details</li>
                 <li><ChevronRight size={16} /> Hyper-realism guaranteed</li>
                 <li><ChevronRight size={16} /> Ready in just 30 seconds</li>
               </ul>
            </div>
            
            <div className="mac-main-viewer">
                 <div className="collage-container" style={{ margin: '0' }}>
                   <div className="collage-pack">
                      <PhoneMockup imgSrc={activeCategory.imgSrc} label={activeCategory.phoneLabel} className="collage-phone" />
                      <div className="collage-social-group">
                         <SocialPostMockup imgSrc={activeCategory.post1Src} accountName={activeCategory.account} likes={activeCategory.likes} label={activeCategory.post1Label} className="collage-social-top" />
                         <SocialPostMockup imgSrc={activeCategory.post2Src} accountName={activeCategory.account} likes={activeCategory.likes} label={activeCategory.post2Label} className="collage-social-bottom" />
                      </div>
                   </div>
                 </div>
            </div>

         </div>
      </div>

    </div>
  );
}
