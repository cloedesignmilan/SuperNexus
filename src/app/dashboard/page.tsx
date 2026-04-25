import { prisma } from '@/lib/prisma'
import DashboardWizard from './DashboardWizard'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  noStore()
  // Fetch all active snippets to pass to the client wizard
  const snippets = await prisma.promptSnippet.findMany({
    where: { is_active: true },
    orderBy: [
      { priority_order: 'asc' }
    ]
  })

  let isAdmin = false;
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } })
      isAdmin = dbUser?.role === 'admin'
    }
  } catch (err) {
    console.error('Failed to get user role', err)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        html, body { overflow: hidden !important; background-color: #000 !important; height: 100dvh !important; overscroll-behavior: none; position: fixed; width: 100%; }
        div[style*="min-height: 100vh"] { height: 100dvh !important; min-height: 100dvh !important; }
        main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; display: flex; flex-direction: column; overflow: hidden; flex: 1; height: 100%; }
      `}} />
      <DashboardWizard snippets={snippets} isAdmin={isAdmin} />
    </>
  )
}
