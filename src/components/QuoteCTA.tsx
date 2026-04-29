"use client";

import React, { useState } from 'react';
import QuoteModal from './QuoteModal';
import { Locale, dictionaries } from '@/lib/i18n/dictionaries';

interface QuoteCTAProps {
  lang?: Locale;
}

export default function QuoteCTA({ lang = 'en' }: QuoteCTAProps) {
  const t = dictionaries[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="btn-secondary hover-scale" 
        style={{ 
          width: '100%', 
          padding: '1.4rem', 
          fontWeight: '900', 
          background: '#ccff00', 
          color: '#000', 
          border: 'none', 
          textAlign: 'center', 
          display: 'block', 
          transition: 'all 0.2s', 
          fontSize: '1.1rem', 
          boxShadow: '0 4px 15px rgba(204,255,0,0.4)', 
          borderRadius: '12px',
          cursor: 'pointer'
        }}
      >
        {t.pricing.custom.button}
      </button>

      <QuoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
