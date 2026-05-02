import { prisma } from '@/lib/prisma'
import { unstable_noStore as noStore } from 'next/cache'
import DashboardWizard from '@/app/dashboard/DashboardWizard'
import SandboxSidebar from './SandboxSidebar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SandboxPage() {
  noStore()
  
  // Fetch everything regardless of is_active so admin can toggle them
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: 'asc' },
    include: {
      business_modes: {
        orderBy: { sort_order: 'asc' },
        include: {
          subcategories: {
            orderBy: { sort_order: 'asc' }
          }
        }
      }
    }
  });

  const snippets = await prisma.promptSnippet.findMany({
    where: { is_active: true }, // We only care about active snippets for generation
    orderBy: [{ priority_order: 'asc' }]
  });

  // For the DashboardWizard, we pass only ACTIVE ones so the admin can test exactly what the user sees.
  const activeCategories = await prisma.category.findMany({
    where: { is_active: true }
  });

  const allBusinessModes = await prisma.businessMode.findMany({
    where: { 
      is_active: true,
      category: { is_active: true }
    },
    include: { category: true }
  });

  const allSubcategories = await prisma.subcategory.findMany({
    where: { 
      is_active: true,
      business_mode: { 
        is_active: true,
        category: { is_active: true }
      }
    },
    include: { business_mode: { include: { category: true } } }
  });

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <div style={{ width: '380px', background: '#111', borderRight: '1px solid #333', overflowY: 'auto', height: '100vh', padding: '1.5rem' }}>
         <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#03dac6' }}>Controllo Tassonomia</h2>
         <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '2rem' }}>
            Attiva/Nascondi le categorie per gli utenti, o 🔒 Blinda quelle completate.
         </p>
         <SandboxSidebar categories={categories} />
      </div>
      
      <div style={{ flex: 1, position: 'relative', height: '100vh', overflow: 'hidden', background: '#050505' }}>
         <style dangerouslySetInnerHTML={{__html: `
            html, body { margin: 0; padding: 0; height: 100dvh; overflow: hidden; background-color: #000; overscroll-behavior: none; }
            .admin-main { padding: 0 !important; display: flex; flex-direction: row; }
            #dashboard-root { height: 100dvh !important; display: flex; flex-direction: column; overflow: hidden; }
            .studio-layout { position: relative !important; top: 0 !important; left: 0 !important; z-index: 1 !important; height: 100% !important; width: 100% !important; }
         `}} />
         {/* Pass isAdmin=true to enable edit cover features if needed */}
         <DashboardWizard 
            snippets={snippets} 
            isAdmin={true} 
            activeCategories={activeCategories}
            activeBusinessModes={allBusinessModes} 
            activeSubcategories={allSubcategories} 
         />
      </div>
    </div>
  )
}
