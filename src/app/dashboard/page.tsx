import { prisma } from '@/lib/prisma'
import DashboardWizard from './DashboardWizard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Fetch full active taxonomy to pass to the client component
  const taxonomy = await prisma.category.findMany({
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
  })

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Virtual Studio</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Welcome to your professional generation studio. Upload your product to begin.
        </p>
      </div>

      <DashboardWizard taxonomy={taxonomy} />
    </div>
  )
}
