import { prisma } from "@/lib/prisma";
import AssetsClientGrid from "./AssetsClientGrid";

export const dynamic = 'force-dynamic';

export default async function ButtonAssetsPage() {
  const categories = await prisma.category.findMany({
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

  const shots = await prisma.promptConfigShot.findMany({
    where: { isActive: true },
    orderBy: [{ priority: 'desc' }, { shotNumber: 'asc' }]
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Asset Pulsanti (UI)</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Gestione centralizzata delle immagini di copertina per i pulsanti della Web App.</p>
      </div>

      <AssetsClientGrid categories={categories} shots={shots} />
    </div>
  );
}
