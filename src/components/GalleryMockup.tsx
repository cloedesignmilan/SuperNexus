import React from "react";
import "./AnimatedTelegramMockup.css"; // Reuse phone styling
import { LayoutGrid, Cloud } from "lucide-react";

export default function GalleryMockup() {
  return (
    <div className="phone-mockup" style={{ animation: "none", boxShadow: '0 0 0 8px #222, 0 30px 60px rgba(3, 218, 198, 0.15)' }}>
      <div className="phone-notch"></div>
      
      {/* Header Web App */}
      <div className="telegram-app-header" style={{ borderBottom: '1px solid rgba(3, 218, 198, 0.2)', paddingBottom: '10px' }}>
        <div className="header-back" style={{ color: '#888' }}><Cloud size={20} /></div>
        <div className="header-title">
          <span className="logo-text" style={{ color: '#03dac6', fontSize: '1rem' }}>Il tuo Cloud</span>
          <span className="bot-status">Sempre Disponibili</span>
        </div>
        <div className="header-avatar" style={{ background: 'transparent', color: '#fff' }}><LayoutGrid size={20} /></div>
      </div>

      {/* Grid Content */}
      <div className="chat-window" style={{ background: '#0a0a0a' }}>
        <div style={{ paddingTop: '100px', display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '100px 4px 0 4px', height: '100%', overflow: 'hidden' }}>
          
          <img src="/1-b.jpeg" alt="Gallery 1" style={{ width: '48%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
          <img src="/4-b.jpeg" alt="Gallery 4" style={{ width: '48%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
          <img src="/2-b.jpeg" alt="Gallery 2" style={{ width: '48%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
          <img src="/5-b.jpeg" alt="Gallery 5" style={{ width: '48%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
          <img src="/3-b.jpeg" alt="Gallery 3" style={{ width: '48%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
          <img src="/6-b.jpeg" alt="Gallery 6" style={{ width: '48%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />

        </div>
        
        {/* Overlay sfumato in basso */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(to bottom, transparent, #0a0a0a)', pointerEvents: 'none' }}></div>
      </div>
    </div>
  );
}
