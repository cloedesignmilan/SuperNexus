import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { LogOut, Home, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import "../admin.css"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/auth')
  }

  // Fetch full user details from our DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email?.toLowerCase() }
  })

  if (!dbUser) {
    // Should have been created by callback, but if not, fail safe.
    redirect('/auth?error=db_sync_failed')
  }

  const remaining = Math.max(0, dbUser.images_allowance - dbUser.images_generated);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <header className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem', position: 'sticky', top: '1rem', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 className="title-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>SuperNexus</h1>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500 }}>
              <Home size={18} /> Studio
            </Link>
            <Link href="/dashboard/gallery" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 500 }}>
              <ImageIcon size={18} /> My Gallery
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
             <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Credits:</span>
             <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{remaining}</span>
          </div>

          <form action={async () => {
            'use server'
            const sClient = await createClient()
            await sClient.auth.signOut()
            redirect('/auth')
          }}>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
              <LogOut size={18} /> Exit
            </button>
          </form>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
