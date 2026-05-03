import { prisma } from '@/lib/prisma'
import { unstable_noStore as noStore } from 'next/cache'
import MassTesterClient from './MassTesterClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MassTesterPage() {
  noStore()
  
  // Fetch only active categories and their active subcategories
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { sort_order: 'asc' },
    include: {
      business_modes: {
        where: { is_active: true },
        orderBy: { sort_order: 'asc' },
        include: {
          subcategories: {
            where: { is_active: true },
            orderBy: { sort_order: 'asc' }
          }
        }
      }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', background: '#050505', color: 'white', overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #222', background: '#111' }}>
         <h1 style={{ fontSize: '1.5rem', color: '#03dac6', margin: 0 }}>Taxonomy Mass Tester</h1>
         <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
            Carica le immagini di riferimento, seleziona una categoria e lancia il test per tutte le sottocategorie in automatico.
         </p>
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
         <MassTesterClient categories={categories} />
      </div>
    </div>
  )
}
