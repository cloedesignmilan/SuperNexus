"use client";

import React, { useState } from 'react';
import { Briefcase, Camera, MapPin, Heart, Users, Music, Flame, ChevronRight, Zap } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import SocialPostMockup from './SocialPostMockup';
import InteractiveSposoDemo from './InteractiveSposoDemo';

const CATEGORIES = [
  { 
    id: 'business', 
    label: 'Business', 
    icon: <Briefcase size={28} strokeWidth={1.5} />, 
    title: 'Abbigliamento Business Uomo', 
    desc: 'Smetti di stendere gli abiti eleganti sui manichini. Presentali indossati da modelli ultra-realistici, in pose spontanee che ne valorizzano i dettagli e il fit aziendale.',
    imgSrc: '/showcase/business/prima.jpg', phoneLabel: 'SCATTO NEGOZIO', 
    post1Src: '/showcase/business/dopo1.jpg', post1Label: 'POST INSTAGRAM', 
    post2Src: '/showcase/business/dopo2.jpg', post2Label: 'CATALOGO E-COMMERCE', 
    account: 'tailor_milano', likes: '8.423'
  },
  { 
    id: 'studio', 
    label: 'Still Life', 
    icon: <Camera size={28} strokeWidth={1.5} />, 
    title: 'Calzature: Still Life Assoluto', 
    desc: 'Punta il telefono sulla mattonella. Ottieni Still-Life chirurgici con sfondo purissimo (#FFFFFF). Eliminazione totale di difetti, mani o tavoli.',
    imgSrc: '/showcase/scarpe/prima.png', phoneLabel: 'SCATTO VETRINA', 
    post1Src: '/showcase/scarpe/dopo1.jpg', post1Label: 'PER LO SHOP', 
    post2Src: '/showcase/scarpe/dopo2.jpg', post2Label: 'CATALOGO', 
    account: 'sneakers_hub', likes: '12.044'
  },
  { 
    id: 'ambientata', 
    label: 'Lifestyle', 
    icon: <MapPin size={28} strokeWidth={1.5} />, 
    title: 'Sneakers: Vetrina Ambientata', 
    desc: 'Le tue sneakers immerse nel cemento cittadino, campi da basket o asfalto bagnato. Il cliente vede la scarpa respirare nel suo habitat naturale.',
    imgSrc: '/showcase/scarpe-ambientata/prima.png', phoneLabel: 'SCATTO VETRINA', 
    post1Src: '/showcase/scarpe-ambientata/dopo1.jpg', post1Label: 'LIFESTYLE ADS', 
    post2Src: '/showcase/scarpe-ambientata/dopo2.jpg', post2Label: 'STREET WEAR', 
    account: 'sneakers_hub', likes: '15.300'
  },
  { 
    id: 'sposa', 
    label: 'Spose', 
    icon: <Heart size={28} strokeWidth={1.5} />, 
    title: 'Abiti da Sposa & Cerimonia', 
    desc: 'Dall\'abito anonimo appeso nell\'armadio dell\'Atelier a cataloghi sontuosi, palazzi antichi e navate storiche che incantano le future spose.',
    imgSrc: '/showcase/sposa/prima.jpg', phoneLabel: 'SCATTO ATELIER', 
    post1Src: '/showcase/sposa/dopo1.jpg', post1Label: 'LOOKBOOK', 
    post2Src: '/showcase/sposa/dopo2.jpg', post2Label: 'SOCIAL POST', 
    account: 'luxury_bridal', likes: '24k'
  },
  { 
    id: 'invitati', 
    label: 'Invitati', 
    icon: <Users size={28} strokeWidth={1.5} />, 
    title: 'Invitati a Nozze & Damigelle', 
    desc: 'Cattura subito l\'attenzione di chi cerca l\'abito per partecipare a un matrimonio. Vesti testimoni e damigelle in splendidi giardini estivi fioriti.',
    imgSrc: '/showcase/invitati/prima.jpg', phoneLabel: 'SCATTO NEGOZIO', 
    post1Src: '/showcase/invitati/dopo1.jpg', post1Label: 'CAROSELLO FB', 
    post2Src: '/showcase/invitati/dopo2.jpg', post2Label: 'IG STORY', 
    account: 'cerimonia_perfetta', likes: '9.102'
  },
  { 
    id: 'festa', 
    label: 'Party', 
    icon: <Music size={28} strokeWidth={1.5} />, 
    title: 'Abiti da Sera & Nightlife', 
    desc: 'Mostra l\'attrazione ipnotica dei tuoi capi serali con sfondi di locali lussuosi e luci vibranti notturne. Le Stories schizzeranno al vertice.',
    imgSrc: '/showcase/festa/prima.jpg', phoneLabel: 'SCATTO SULLA GRUCCIA', 
    post1Src: '/showcase/festa/dopo1.jpg', post1Label: 'IG STORY', 
    post2Src: '/showcase/festa/dopo2.jpg', post2Label: 'TIKTOK COVER', 
    account: 'party_milano', likes: '6.890'
  },
  { 
    id: 'street', 
    label: 'Streetwear', 
    icon: <Flame size={28} strokeWidth={1.5} />, 
    title: 'Urban Vibes per Gen Z', 
    imgSrc: '/showcase/ragazzo/prima.jpg', phoneLabel: 'SCATTO A TERRA', 
    post1Src: '/showcase/ragazzo/dopo1.jpg', post1Label: 'HYPE DROP', 
    post2Src: '/showcase/ragazzo/dopo2.jpg', post2Label: 'REEL COVER', 
    account: 'hype_street', likes: '15k'
  },
  { 
    id: 'demo', 
    label: 'PROVA LIVE ⚡', 
    icon: <Zap size={28} strokeWidth={1.5} />, 
    title: 'Generazione Live: Sposo', 
    desc: 'Vuoi vedere la magia con i tuoi occhi? Carica una foto del tuo abito da sposo (o cerimonia) e osserva l\'intelligenza artificiale creare foto fotorealistiche in tempo reale, direttamente qui!',
    imgSrc: '', phoneLabel: '', post1Src: '', post1Label: '', post2Src: '', post2Label: '', account: '', likes: ''
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
               {activeTab === 'demo' ? (
                 <InteractiveSposoDemo />
               ) : (
                 <div className="collage-container" style={{ margin: '0' }}>
                   <div className="collage-pack">
                      <PhoneMockup imgSrc={activeCategory.imgSrc} label={activeCategory.phoneLabel} className="collage-phone" />
                      <div className="collage-social-group">
                         <SocialPostMockup imgSrc={activeCategory.post1Src} accountName={activeCategory.account} likes={activeCategory.likes} label={activeCategory.post1Label} className="collage-social-top" />
                         <SocialPostMockup imgSrc={activeCategory.post2Src} accountName={activeCategory.account} likes={activeCategory.likes} label={activeCategory.post2Label} className="collage-social-bottom" />
                      </div>
                   </div>
                 </div>
               )}
            </div>

         </div>
      </div>

    </div>
  );
}
