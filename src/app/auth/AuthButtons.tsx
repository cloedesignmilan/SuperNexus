'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { getLoginDataByPin } from '@/app/admin/clients/actions'

export default function AuthButtons() {
  const [loading, setLoading] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  
  const supabase = createClient()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const errorParam = searchParams.get('error')

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback${plan ? `?plan=${plan}` : ''}`,
      },
    })
    
    if (error) {
      console.error('Error logging in:', error.message)
      setLoading(false)
    }
  }

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    
    setLoading(true);
    setPinError('');
    
    // Recupera l'email associata a questo PIN dal database
    const res = await getLoginDataByPin(pin);
    if (!res.success || !res.email) {
      setPinError(res.error || 'Codice non valido. Riprova.');
      setLoading(false);
      return;
    }
    
    // Effettua il login in background con Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: res.email,
      password: pin.toUpperCase(),
    });
    
    if (error) {
      console.error('Error logging in with PIN:', error.message);
      setPinError('Accesso negato. Riprova o contatta il supporto.');
      setLoading(false);
    } else {
      // Login effettuato! Reindirizzamento alla dashboard.
      // Se c'è un piano da acquistare (flusso guest) passiamo dal callback per il redirect.
      if (plan) {
        window.location.href = `/auth/callback?plan=${plan}`;
      } else {
        window.location.href = `/dashboard`;
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>

      {errorParam && (
        <div style={{ color: '#ff4444', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
          Authentication failed. Please try again.
        </div>
      )}

      <form onSubmit={handlePinLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Inserisci il Codice Accesso (PIN)"
          value={pin}
          onChange={(e) => setPin(e.target.value.toUpperCase())}
          disabled={loading}
          required
          maxLength={6}
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: '#ffffff',
            fontSize: '1.2rem',
            letterSpacing: '2px',
            textAlign: 'center',
            fontWeight: 'bold',
            outline: 'none',
            transition: 'border-color 0.2s',
            textTransform: 'uppercase'
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
        {pinError && (
          <div style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '-0.5rem', marginBottom: '0.25rem', textAlign: 'center' }}>
            {pinError}
          </div>
        )}
        <button 
          type="submit"
          disabled={loading || !pin}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '0.875rem 1.5rem',
            borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.2)', fontWeight: 600, fontSize: '1rem',
            cursor: (loading || !pin) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            if (!loading && pin) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          {loading ? 'Verifica in corso...' : 'Entra'}
        </button>
      </form>

      <div style={{ 
        display: 'flex', alignItems: 'center', margin: '0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' 
      }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        <span style={{ padding: '0 1rem' }}>oppure</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
      </div>

      <button 
        type="button"
        onClick={() => handleOAuthLogin('google')}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          backgroundColor: '#ffffff', color: '#000000', padding: '0.875rem 1.5rem',
          borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
          </g>
        </svg>
        Sign in with Google
      </button>

      {/* Placeholder for Apple - Requires Apple Developer Account ($99/yr) to configure */}
    </div>
  )
}
