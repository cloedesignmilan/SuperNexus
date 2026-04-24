import AuthButtons from './AuthButtons'
import "../admin.css" // Reusing glass styles

export default function AuthPage() {
  return (
    <div className="login-container">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="login-box">
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              SuperNexus
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Client Dashboard Access
            </p>
          </div>

          <AuthButtons />
          
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  )
}
