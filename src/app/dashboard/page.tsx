import { prisma } from '@/lib/prisma'
import DashboardWizard from './DashboardWizard'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  noStore()
  const snippets = await prisma.promptSnippet.findMany({
    where: { is_active: true },
    orderBy: [
      { priority_order: 'asc' }
    ]
  })

  // Fetch active taxonomy from CRM to enforce visibility in the app
  const activeCategories = await prisma.category.findMany({
    where: { is_active: true }
  });

  const activeBusinessModes = await prisma.businessMode.findMany({
    where: { 
      is_active: true,
      category: { is_active: true }
    },
    include: { category: true }
  });

  const activeSubcategories = await prisma.subcategory.findMany({
    where: { 
      is_active: true,
      business_mode: { 
        is_active: true,
        category: { is_active: true }
      }
    },
    include: { business_mode: { include: { category: true } } }
  });

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
        html, body { margin: 0; padding: 0; height: 100dvh; overflow: hidden; background-color: #000; overscroll-behavior: none; }
        #dashboard-root { height: 100dvh !important; display: flex; flex-direction: column; overflow: hidden; }
        main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; display: flex; flex-direction: column; overflow: hidden; flex: 1; min-height: 0; }
      `}} />
      <DashboardWizard snippets={snippets} isAdmin={isAdmin} activeCategories={activeCategories} activeBusinessModes={activeBusinessModes} activeSubcategories={activeSubcategories} />
    </>
  )
}
