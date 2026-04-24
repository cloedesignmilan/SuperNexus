'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Home, Image as ImageIcon, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardHeader({ email, remaining }: { email: string, remaining: number }) {
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
            flex-direction: column;
            padding: 1rem;
            margin: 0.5rem;
          }
          .header-left {
            width: 100%;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }
          .header-right {
            width: 100%;
            justify-content: space-between;
            gap: 0.5rem;
          }
          .email-pill {
            max-width: 140px;
            padding: 0.5rem;
          }
          .email-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `}} />
      <header className="glass-panel dashboard-header">
        <div className="header-left">
          <h1 className="title-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>SuperNexus</h1>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/dashboard" style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              color: pathname === '/dashboard' ? 'var(--color-primary)' : 'var(--color-text-muted)', 
              textDecoration: 'none', fontWeight: 600,
              borderBottom: pathname === '/dashboard' ? '2px solid var(--color-primary)' : '2px solid transparent',
              paddingBottom: '0.25rem', transition: 'all 0.2s'
            }}>
              <Home size={18} /> Studio
            </Link>
            <Link href="/dashboard/gallery" style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              color: pathname === '/dashboard/gallery' ? 'var(--color-primary)' : 'var(--color-text-muted)', 
              textDecoration: 'none', fontWeight: 600,
              borderBottom: pathname === '/dashboard/gallery' ? '2px solid var(--color-primary)' : '2px solid transparent',
              paddingBottom: '0.25rem', transition: 'all 0.2s'
            }}>
              <ImageIcon size={18} /> My Gallery
            </Link>
          </nav>
        </div>

        <div className="header-right">
          <div className="email-pill">
             <User size={14} style={{ flexShrink: 0 }} /> <span className="email-text">{email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>
             <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Credits:</span>
             <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{remaining}</span>
          </div>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
            <LogOut size={18} /> <span style={{ display: 'inline-block' }} className="hide-on-mobile">Exit</span>
          </button>
        </div>
      </header>
    </>
  )
}
