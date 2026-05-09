'use client'

import { useState, useEffect } from 'react'

export function GalleryHeader() {
  const [uiLang, setUiLang] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('it')) {
        setUiLang('it');
      }
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        {uiLang === 'it' ? 'La Mia Galleria' : 'My Gallery'}
      </h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
        {uiLang === 'it' ? 'I tuoi output IA delle ultime 24 ore. Salva le foto che desideri mantenere sul tuo dispositivo prima che vengano eliminate.' : 'Your generated AI outputs from the last 24 hours. Save the shots you want to keep on your device before they are deleted.'}
      </p>
    </div>
  )
}

export function GalleryEmptyState() {
  const [uiLang, setUiLang] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('it')) {
        setUiLang('it');
      }
    }
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.1)' }}>
      <p style={{ color: 'var(--color-text-muted)' }}>
        {uiLang === 'it' ? 'Nessuna immagine generata nelle ultime 24 ore. Vai allo Studio per crearne alcune!' : 'No images generated in the last 24 hours. Head to the Studio to create some!'}
      </p>
    </div>
  )
}
