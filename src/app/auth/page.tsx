import AuthButtons from './AuthButtons'
import { Suspense } from 'react'
import "../admin.css" // Reusing glass styles

export default function AuthPage() {
  return (
    <div className="login-container">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="login-box">
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
          {/* Back to Home Link (Pure CSS) */}
          <style dangerouslySetInnerHTML={{__html: `
            .auth-back-link {
              display: flex; align-items: center; justify-content: center;
              width: 40px; height: 40px;
              color: var(--color-text-muted); text-decoration: none;
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(10px);
              border-radius: 50%;
              border: 1px solid rgba(255, 255, 255, 0.08);
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            .auth-back-link:hover {
              color: #ffffff;
              background: rgba(255, 255, 255, 0.1);
              border-color: rgba(255, 255, 255, 0.2);
              transform: scale(1.08);
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
            }
            .auth-back-link svg {
              transition: transform 0.3s ease;
            }
            .auth-back-link:hover svg {
              transform: scale(1.1);
            }
          `}} />
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
            <a href="/" className="auth-back-link" aria-label="Torna alla Home">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </a>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              SuperNexus
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Client Dashboard Access
            </p>
          </div>

          <Suspense fallback={<div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>Loading secure login...</div>}>
            <AuthButtons />
          </Suspense>
          
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  )
}
