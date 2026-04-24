import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import DashboardHeader from './DashboardHeader'
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
  const isAdmin = dbUser.role === 'admin';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <DashboardHeader email={dbUser.email || ''} remaining={remaining} isAdmin={isAdmin} />

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
