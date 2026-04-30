'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Home, Image as ImageIcon, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardHeader({ email, remaining, isAdmin = false }: { email: string, remaining: number, isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-header {
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem;
          position: sticky;
          top: 1rem;
          z-index: 100;
          gap: 1rem;
        }
        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .email-pill {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.02);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: row;
            padding: 0.5rem 1rem;
            margin: 0;
            top: 0;
            border-radius: 0;
            background: rgba(10,10,10,0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            gap: 0.5rem;
          }
          .title-gradient { font-size: 1.1rem !important; }
          
          .header-left { gap: 0.75rem; }
          .header-left nav { gap: 0.75rem !important; }
          .nav-text { display: none; } /* Hide 'Studio', 'My Gallery' */
          
          .email-pill { display: none; } /* Hide email entirely on mobile */
          .header-right { gap: 0.5rem; }
          
          .credits-pill { padding: 0.3rem 0.6rem !important; border-radius: 8px !important; }
          .credits-label { display: none; } /* Hide 'God Mode:' text */
          
          .hide-on-mobile { display: none !important; }
        }
      `}} />
      <header className="glass-panel dashboard-header">
        <div className="header-left">
          <h1 className="title-gradient" style={{ fontSize: '1.5rem', margin: 0, color: '#D4AF37' }}>SuperNexus</h1>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/dashboard" style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              color: pathname === '/dashboard' ? '#D4AF37' : 'var(--color-text-muted)', 
              textDecoration: 'none', fontWeight: 600,
              borderBottom: pathname === '/dashboard' ? '2px solid #D4AF37' : '2px solid transparent',
              paddingBottom: '0.25rem', transition: 'all 0.2s'
            }}>
              <Home size={18} /> <span className="nav-text">Studio</span>
            </Link>
            <Link href="/dashboard/gallery" style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              color: pathname === '/dashboard/gallery' ? '#D4AF37' : 'var(--color-text-muted)', 
              textDecoration: 'none', fontWeight: 600,
              borderBottom: pathname === '/dashboard/gallery' ? '2px solid #D4AF37' : '2px solid transparent',
              paddingBottom: '0.25rem', transition: 'all 0.2s'
            }}>
              <ImageIcon size={18} /> <span className="nav-text">My Gallery</span>
            </Link>
          </nav>
        </div>

        <div className="header-right">
          <div className="email-pill">
             {isAdmin ? <span title="SuperAdmin" style={{ cursor: 'help' }}>👑</span> : <User size={14} style={{ flexShrink: 0 }} />} 
             <span className="email-text">
               {email.toLowerCase() === 'immobiliarecalcagnile@gmail.com' ? 'jane.doe@vogue.com' : email}
             </span>
          </div>

          <div className="credits-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isAdmin ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', whiteSpace: 'nowrap', border: isAdmin ? '1px solid rgba(212, 175, 55, 0.3)' : 'none' }}>
             <span className="credits-label" style={{ fontSize: '0.8rem', color: isAdmin ? '#D4AF37' : 'var(--color-text-muted)' }}>{isAdmin ? 'God Mode:' : 'Credits:'}</span>
             <span style={{ fontWeight: 800, color: isAdmin ? '#D4AF37' : '#D4AF37', fontSize: isAdmin ? '1.2rem' : '1rem' }}>{isAdmin ? '∞' : remaining}</span>
          </div>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
            <LogOut size={18} /> <span style={{ display: 'inline-block' }} className="hide-on-mobile">Exit</span>
          </button>
        </div>
      </header>
    </>
  )
}
