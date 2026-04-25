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
    <div style={{ margin: '-3rem', minHeight: '100vh', background: '#000' }}>
      <DashboardWizard snippets={snippets} isAdmin={isAdmin} />
    </div>
  )
}
