import { attemptLogin } from "./actions";
import "../admin.css";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="login-container">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="login-box">
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              SuperNexus AI
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Accesso Security System</p>
          </div>

          {resolvedParams?.error && (
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Password errata. Riprova.
            </div>
          )}

          <form action={attemptLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Passkey Integrata</label>
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••"
                className="input-glass"
              />
            </div>
            <button type="submit" className="btn-primary">
              Sblocca Terminale
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
