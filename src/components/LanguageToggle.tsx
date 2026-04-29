"use client";

import { useRouter } from 'next/navigation';
import { setLocale } from '@/app/actions/i18n';
import { Locale } from '@/lib/i18n/dictionaries';

export default function LanguageToggle({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();

  const handleToggle = async (loc: Locale) => {
    if (loc === currentLocale) return;
    await setLocale(loc);
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '20px' }}>
      <button 
        onClick={() => handleToggle('en')}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', 
          color: currentLocale === 'en' ? '#ccff00' : '#888',
          fontWeight: currentLocale === 'en' ? '800' : '500',
          fontSize: '0.9rem', padding: '0.2rem 0.4rem',
          transition: 'color 0.2s'
        }}>
        EN
      </button>
      <span style={{ color: '#555' }}>|</span>
      <button 
        onClick={() => handleToggle('it')}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', 
          color: currentLocale === 'it' ? '#ccff00' : '#888',
          fontWeight: currentLocale === 'it' ? '800' : '500',
          fontSize: '0.9rem', padding: '0.2rem 0.4rem',
          transition: 'color 0.2s'
        }}>
        IT
      </button>
    </div>
  );
}
