'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor, Send, Zap, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function PlatformShowcase() {
  const [activePlatform, setActivePlatform] = useState(0);

  const platforms = [
    {
      id: "mobile",
      title: "App Mobile",
      icon: <Smartphone size={24} />,
      color: "#ccff00",
      desc: "Genera in movimento. L'interfaccia intuitiva della nostra Web App Mobile ti permette di scattare, caricare e trasformare i tuoi capi direttamente dal tuo smartphone, ovunque ti trovi.",
      image: "/immagini/IMG_2048.webp", // Use a suitable mobile mockup or generated image
      features: ["Interfaccia Touch Ottimizzata", "Caricamento Diretto da Fotocamera", "Notifiche Push (in arrivo)"]
    },
    {
      id: "desktop",
      title: "App Desktop",
      icon: <Monitor size={24} />,
      color: "#00ffff",
      desc: "Massima produttività. La dashboard Desktop offre una visione completa dei tuoi crediti, storico generazioni e strumenti avanzati di gestione per i tuoi cataloghi.",
      image: "/immagini/IMG_2065.webp", // Desktop-oriented image
      features: ["Gestione Cataloghi Estesa", "Scarica in Batch", "Pannello CRM Avanzato"]
    },
    {
      id: "telegram",
      title: "Telegram Bot",
      icon: <Send size={24} />,
      color: "#2AABEE", // Telegram blue
      desc: "Veloce e istantaneo. Invia una foto al nostro Bot Telegram ufficiale e ricevi le immagini processate direttamente in chat. Ideale per generazioni rapide.",
      image: "/immagini/IMG_2059.webp", // Something vertical or conversational
      features: ["Nessun Login Richiesto", "Generazione in 3 Secondi", "Accesso Rapido"]
    }
  ];

  return (
    <section className="platform-section" style={{ padding: '8rem 5%', background: '#0a0a0a', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1 }}>
            Lavora Dove Vuoi.<br/><span style={{ color: '#ff5470' }}>Senza Confini.</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', margin: '1.5rem auto 0', lineHeight: 1.6 }}>
            SuperNexus è progettato per adattarsi al tuo workflow. Scegli la piattaforma che preferisci per generare i tuoi contenuti.
            </p>
        </div>

        <div className="platform-container" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '3rem',
            background: '#111',
            borderRadius: '32px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            
            {/* Platform Selector Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                {platforms.map((plat, idx) => (
                    <button 
                        key={plat.id}
                        onClick={() => setActivePlatform(idx)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '1rem 2rem',
                            borderRadius: '100px',
                            background: activePlatform === idx ? `${plat.color}15` : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${activePlatform === idx ? plat.color : 'rgba(255,255,255,0.1)'}`,
                            color: activePlatform === idx ? plat.color : '#888',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontWeight: '600',
                            fontSize: '1.1rem'
                        }}
                    >
                        {React.cloneElement(plat.icon as React.ReactElement<any>, { color: activePlatform === idx ? plat.color : '#888' })}
                        {plat.title}
                    </button>
                ))}
            </div>

            {/* Platform Content Area */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '4rem',
                alignItems: 'center',
                padding: '2rem 1rem'
            }}>
                
                {/* Text Content */}
                <div style={{ animation: 'fadeIn 0.5s ease-out' }} key={`text-${activePlatform}`}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', background: `${platforms[activePlatform].color}22`, borderRadius: '100px', marginBottom: '1.5rem', color: platforms[activePlatform].color, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Zap size={14} /> Piattaforma Selezionata
                    </div>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>
                        {platforms[activePlatform].title}
                    </h3>
                    <p style={{ fontSize: '1.1rem', color: '#aaa', lineHeight: 1.6, marginBottom: '2rem' }}>
                        {platforms[activePlatform].desc}
                    </p>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
                        {platforms[activePlatform].features.map((feat, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '1rem', fontWeight: '500' }}>
                                <div style={{ background: platforms[activePlatform].color, borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ChevronRight size={14} color="#000" />
                                </div>
                                {feat}
                            </li>
                        ))}
                    </ul>
                    
                    <a href={platforms[activePlatform].id === 'telegram' ? 'https://t.me/SuperNexusBot' : '/auth'} target={platforms[activePlatform].id === 'telegram' ? '_blank' : '_self'} rel="noreferrer" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.2rem 2.5rem',
                        background: platforms[activePlatform].color,
                        color: '#000',
                        fontWeight: '800',
                        borderRadius: '100px',
                        textDecoration: 'none',
                        boxShadow: `0 10px 20px ${platforms[activePlatform].color}44`,
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Prova su {platforms[activePlatform].title}
                    </a>
                </div>

                {/* Visual Content (Mockup/Image) */}
                <div style={{ position: 'relative', width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s ease-out' }} key={`img-${activePlatform}`}>
                    {/* Glowing background ring */}
                    <div style={{ position: 'absolute', width: '300px', height: '300px', background: platforms[activePlatform].color, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }} />
                    
                    {/* Device Frame */}
                    <div style={{
                        position: 'relative',
                        width: platforms[activePlatform].id === 'mobile' || platforms[activePlatform].id === 'telegram' ? '280px' : '100%',
                        height: platforms[activePlatform].id === 'mobile' || platforms[activePlatform].id === 'telegram' ? '560px' : '350px',
                        background: '#000',
                        borderRadius: platforms[activePlatform].id === 'mobile' || platforms[activePlatform].id === 'telegram' ? '40px' : '16px',
                        border: `8px solid #222`,
                        overflow: 'hidden',
                        boxShadow: `0 30px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)`,
                        zIndex: 2
                    }}>
                        {/* Notch for mobile */}
                        {(platforms[activePlatform].id === 'mobile' || platforms[activePlatform].id === 'telegram') && (
                            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '25px', background: '#222', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }} />
                        )}
                        <Image 
                            src={platforms[activePlatform].image} 
                            alt={platforms[activePlatform].title}
                            fill
                            style={{ objectFit: 'cover', opacity: 0.9 }}
                        />
                    </div>
                </div>

            </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
            .platform-container { padding: 1rem !important; }
        }
      `}} />
    </section>
  );
}
