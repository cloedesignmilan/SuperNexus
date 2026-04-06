"use client";

import React, { useState } from 'react';
import { Briefcase, Footprints, Shirt, Heart, Users, PartyPopper, Flame, ChevronRight } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import SocialPostMockup from './SocialPostMockup';

const CATEGORIES = [
  { 
    id: 'business', 
    label: 'Business Elegante', 
    icon: <Briefcase size={28} strokeWidth={1.5} />, 
    title: 'Abbigliamento Business Elegante', 
    desc: 'Smetti di stendere gli abiti eleganti sui manichini. Presentali indossati da modelli ultra-realistici, in pose spontanee che ne valorizzano i dettagli e il fit sartoriale.',
    imgSrc: '/showcase/business/prima.jpg', phoneLabel: 'SCATTO NEGOZIO', 
    post1Src: '/showcase/business/dopo1.jpg', post1Label: 'POST INSTAGRAM', 
    post2Src: '/showcase/business/dopo2.jpg', post2Label: 'CATALOGO E-COMMERCE', 
    account: 'supernexus_ai', likes: '8.423'
  },
  { 
    id: 'studio', 
    label: 'Calzature', 
    icon: <Footprints size={28} strokeWidth={1.5} />, 
    title: 'Calzature & Sneaker in Studio', 
    desc: 'Punta il telefono sulla mattonella. Ottieni Still-Life chirurgici con sfondo purissimo (#FFFFFF). Eliminazione totale di difetti, mani o tavoli.',
    imgSrc: '/showcase/scarpe/prima.png', phoneLabel: 'SCATTO VETRINA', 
    post1Src: '/showcase/scarpe/dopo1.jpg', post1Label: 'PER LO SHOP', 
    post2Src: '/showcase/scarpe/dopo2.jpg', post2Label: 'CATALOGO', 
    account: 'supernexus_ai', likes: '12.044'
  },
  { 
    id: 'ambientata', 
    label: 'Casual Adulti', 
    icon: <Shirt size={28} strokeWidth={1.5} />, 
    title: 'Completi e Casual per Adulti', 
    desc: 'I tuoi look di tutti i giorni immersi nel contesto cittadino. Il cliente vede il capo vivere nel suo habitat naturale per un fortissimo impatto commerciale.',
    imgSrc: '/showcase/scarpe-ambientata/prima.png', phoneLabel: 'SCATTO VETRINA', 
    post1Src: '/showcase/scarpe-ambientata/dopo1.jpg', post1Label: 'LIFESTYLE ADS', 
    post2Src: '/showcase/scarpe-ambientata/dopo2.jpg', post2Label: 'STREET WEAR', 
    account: 'supernexus_ai', likes: '15.300'
  },
  { 
    id: 'sposa', 
    label: 'Sposa & Sposo', 
    icon: <Heart size={28} strokeWidth={1.5} />, 
    title: 'Categorie Sposa, Sposo e Cerimonia', 
    desc: 'Dall\'abito anonimo appeso nell\'armadio dell\'Atelier a cataloghi sontuosi, palazzi antichi e navate storiche che incantano i futuri sposi.',
    imgSrc: '/showcase/sposa/prima.jpg', phoneLabel: 'SCATTO ATELIER', 
    post1Src: '/showcase/sposa/dopo1.jpg', post1Label: 'LOOKBOOK', 
    post2Src: '/showcase/sposa/dopo2.jpg', post2Label: 'SOCIAL POST', 
    account: 'supernexus_ai', likes: '24k'
  },
  { 
    id: 'invitati', 
    label: 'Invitati', 
    icon: <Users size={28} strokeWidth={1.5} />, 
    title: 'Invitati & Cerimonia', 
    desc: 'Cattura subito l\'attenzione di chi cerca l\'abito per partecipare a un matrimonio. Vesti testimoni e invitati in splendidi giardini estivi fioriti.',
    imgSrc: '/showcase/invitati/prima.jpg', phoneLabel: 'SCATTO NEGOZIO', 
    post1Src: '/showcase/invitati/dopo1.jpg', post1Label: 'CAROSELLO FB', 
    post2Src: '/showcase/invitati/dopo2.jpg', post2Label: 'IG STORY', 
    account: 'supernexus_ai', likes: '9.102'
  },
  { 
    id: 'festa', 
    label: 'Festa 18°', 
    icon: <PartyPopper size={28} strokeWidth={1.5} />, 
    title: 'Festa 18° e Abiti da Sera', 
    desc: 'Mostra l\'attrazione ipnotica dei tuoi capi serali con sfondi di locali chic e luci vibranti notturne. Le tue Stories schizzeranno al vertice.',
    imgSrc: '/showcase/festa/prima.jpg', phoneLabel: 'SCATTO SULLA GRUCCIA', 
    post1Src: '/showcase/festa/dopo1.jpg', post1Label: 'IG STORY', 
    post2Src: '/showcase/festa/dopo2.jpg', post2Label: 'TIKTOK COVER', 
    account: 'supernexus_ai', likes: '6.890'
  },
  { 
    id: 'street', 
    label: 'Teenager', 
    icon: <Flame size={28} strokeWidth={1.5} />, 
    title: 'Abbigliamento Teenager', 
    desc: 'Dimentica outfit piatti. Trasforma i capi pensati per la Gen Z in scatti dall\'energia pura, con Pose dinamiche ed esposizioni Street.',
    imgSrc: '/showcase/ragazzo/prima.jpg', phoneLabel: 'SCATTO A TERRA', 
    post1Src: '/showcase/ragazzo/dopo1.jpg', post1Label: 'HYPE DROP', 
    post2Src: '/showcase/ragazzo/dopo2.jpg', post2Label: 'REEL COVER', 
    account: 'supernexus_ai', likes: '15k'
  }
];

export default function ShowcaseTabs() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);

  const activeCategory = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  return (
    <div className="showcase-tabs-container">
      
      {/* TABS ROW */}
      <div className="tabs-row">
        {CATEGORIES.map((cat) => (
          <button 
            key={cat.id} 
            className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            <div className="tab-icon-wrapper">{cat.icon}</div>
            <span className="tab-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* MAC OS WINDOW INTERATTIVA */}
      <div className="mac-window">
         {/* HEADER MAC */}
         <div className="mac-header">
           <div className="mac-dots">
             <div className="mac-dot" style={{ backgroundColor: '#ff5f56' }}></div>
             <div className="mac-dot" style={{ backgroundColor: '#ffbd2e' }}></div>
             <div className="mac-dot" style={{ backgroundColor: '#27c93f' }}></div>
           </div>
           <div className="mac-title">SuperNexus Dashboard / {activeCategory.label}</div>
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
