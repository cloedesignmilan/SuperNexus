"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Footprints, Shirt, Heart, Smartphone, PartyPopper, ChevronRight, Scissors } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import SocialPostMockup from './SocialPostMockup';

const CATEGORIES = [
  { 
    id: 'donna', 
    label: 'Donna', 
    icon: <Shirt size={28} strokeWidth={1.5} />, 
    title: 'Abbigliamento Donna', 
    desc: 'Basta grucce tristi! Fai indossare i tuoi capi a modelle digitali dal look iper-reale. Esponi la tua collezione al suo massimo potenziale.',
    imgSrc: '/showcase/donna/prima.webp', phoneLabel: 'PRIMA (NEGOZIO)', 
    post1Src: '/showcase/donna/1.webp', post1Label: 'LIFESTYLE', 
    post2Src: '/showcase/donna/2.webp', post2Label: 'REEL COVER', 
    account: 'donna_fashion', likes: '3.400'
  },
  { 
    id: 'uomo', 
    label: 'Uomo', 
    icon: <Briefcase size={28} strokeWidth={1.5} />, 
    title: 'Abbigliamento Uomo & Business', 
    desc: 'Mostra i tuoi completi nel loro habitat naturale: uffici di lusso, strade metropolitane o eventi mondani. Eleva istantaneamente il valore dei tuoi abiti.',
    imgSrc: '/showcase/uomo/prima.jpg', phoneLabel: 'PRIMA (VETRINA)', 
    post1Src: '/showcase/uomo/1.webp', post1Label: 'LOOKBOOK CITY', 
    post2Src: '/showcase/uomo/2.webp', post2Label: 'STREET ADS', 
    account: 'uomo_style', likes: '2.100'
  },
  { 
    id: 'tshirt', 
    label: 'T-Shirt', 
    isNew: true,
    icon: <Scissors size={28} strokeWidth={1.5} />, 
    title: 'T-Shirt & Maglieria', 
    desc: 'Basta scatti su manichini rigidi! Le tue t-shirt prenderanno vita su modelli dinamici, creando un look in stile street super accattivante.',
    imgSrc: '/showcase/tshirt/prima.webp', phoneLabel: 'PRIMA (TAVOLO)', 
    post1Src: '/showcase/tshirt/1.webp', post1Label: 'STREETWEAR', 
    post2Src: '/showcase/tshirt/2.webp', post2Label: 'CATALOGO', 
    account: 'street_apparel', likes: '5.200'
  },
  { 
    id: 'cerimonia', 
    label: 'Cerimonia', 
    icon: <Heart size={28} strokeWidth={1.5} />, 
    title: 'Abiti da Cerimonia & Sposi', 
    desc: 'Dall\'abito anonimo appeso nell\'armadio dell\'Atelier a cataloghi sontuosi, palazzi antichi e navate storiche che incantano i clienti.',
    imgSrc: '/showcase/cerimonia/sposa-prima.webp', phoneLabel: 'PRIMA (ATELIER)', 
    post1Src: '/showcase/cerimonia/sposa-dopo.webp', post1Label: 'SPOSA', 
    post2Src: '/showcase/cerimonia/sposo-dopo.webp', post2Label: 'SPOSO', 
    account: 'atelier_cerimonia', likes: '8.450'
  },
  { 
    id: 'festa', 
    label: 'Feste & 18°', 
    icon: <PartyPopper size={28} strokeWidth={1.5} />, 
    title: 'Festa 18° e Abiti da Sera', 
    desc: 'Mostra l\'attrazione ipnotica dei tuoi capi serali con sfondi di locali chic e luci vibranti notturne. Le tue Stories schizzeranno al vertice.',
    imgSrc: '/showcase/festa/prima.jpg', phoneLabel: 'PRIMA (NEGOZIO)', 
    post1Src: '/showcase/festa/dopo1.jpg', post1Label: 'IG STORY', 
    post2Src: '/showcase/festa/dopo2.jpg', post2Label: 'TIKTOK COVER', 
    account: 'party_dress_store', likes: '6.890'
  },
  { 
    id: 'calzature', 
    label: 'Calzature', 
    icon: <Footprints size={28} strokeWidth={1.5} />, 
    title: 'Calzature & Sneaker', 
    desc: 'Eliminazione totale di difetti, mani o sfondi rovinati. I tuoi scatti in magazzino diventano still-life perfetti, pronti per lo store.',
    imgSrc: '/showcase/scarpe/prima.webp', phoneLabel: 'PRIMA (NEGOZIO)', 
    post1Src: '/showcase/scarpe/dopo1.jpg', post1Label: 'E-COMMERCE', 
    post2Src: '/showcase/scarpe/dopo2.jpg', post2Label: 'IG POST', 
    account: 'calzature_boutique', likes: '1.240'
  },
  { 
    id: 'vendita', 
    label: 'Vendita Online', 
    icon: <Smartphone size={28} strokeWidth={1.5} />, 
    title: 'Composizioni per Vendita Rapida', 
    desc: 'Trasforma velocemente le eccedenze e gli outlet in post irresistibili per svuotare il magazzino su Amazon, Ebay, Vinted o Depop.',
    imgSrc: '/showcase/invitati/prima.jpg', phoneLabel: 'SCATTO MAGAZZINO', 
    post1Src: '/showcase/invitati/dopo1.jpg', post1Label: 'MARKETPLACE', 
    post2Src: '/showcase/invitati/dopo2.jpg', post2Label: 'VETRINA FB', 
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
      <div className={`hand-drawn-arrow ${showArrow ? 'visible' : 'hidden'}`}>
        <span style={{ fontFamily: 'var(--font-primary), sans-serif', fontSize: '1rem', fontWeight: 'bold', marginBottom: '-5px', transform: 'rotate(-5deg)', color: '#ccff00' }}>Scorri</span>
        <svg style={{ flexShrink: 0, minHeight: '30px' }} width="60" height="30" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20 Q 50 10, 100 20" stroke="#ccff00" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M85 10 L 105 20 L 85 30" stroke="#ccff00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
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
                 <li><ChevronRight size={16} /> Ottimizzato per Social Ads</li>
                 <li><ChevronRight size={16} /> Ultra-realismo garantito</li>
                 <li><ChevronRight size={16} /> Pronto in 30 secondi</li>
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
