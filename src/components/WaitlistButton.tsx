'use client';

import React, { useState } from 'react';

export default function WaitlistButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    // Sostituire l'URL con quello del Webhook di Google Apps Script
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_WAITLIST_WEBHOOK_URL || '';
    
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, timestamp: new Date().toISOString() })
      });
      
      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        setEmail('');
      }, 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-secondary" 
        style={{ width: '100%', padding: '1.4rem', fontWeight: '900', background: '#ff0ab3', color: '#fff', border: 'none', textAlign: 'center', display: 'block', fontSize: '1.1rem', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,10,179,0.4)' }}
      >
        Join Waitlist
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#111',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '3rem',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Try it <span style={{ color: '#ff0ab3' }}>Free</span></h2>
            <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: '1.5' }}>
              SuperNexus AI is currently undergoing a massive update. Leave your email to get instant access to the free trial as soon as the update is complete.
            </p>
            
            {status === 'success' ? (
              <div style={{ padding: '1rem', background: 'rgba(204, 255, 0, 0.1)', border: '1px solid #ccff00', borderRadius: '12px', color: '#ccff00', textAlign: 'center', fontWeight: 'bold' }}>
                Thank you! You're on the list.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  required
                  style={{
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    fontSize: '1.1rem',
                    outline: 'none'
                  }}
                />
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  style={{
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: status === 'loading' ? '#555' : '#ff0ab3',
                    color: '#fff',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: status === 'loading' ? 'wait' : 'pointer'
                  }}
                >
                  {status === 'loading' ? 'Saving...' : 'Get Notified'}
                </button>
                {status === 'error' && (
                  <div style={{ color: '#ff5470', fontSize: '0.9rem', textAlign: 'center' }}>
                    Errore di rete. Assicurati di aver configurato il Webhook.
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
