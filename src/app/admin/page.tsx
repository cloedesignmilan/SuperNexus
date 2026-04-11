import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const categoriesCount = await prisma.category.count();
  const subcatsCount = await prisma.subcategory.count();
  const jobsCount = await prisma.generationJob.count();

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Visore Centrale</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Panoramica dello stato di salute dell'intelligenza artificiale.</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', margin: 0 }}>Macrocategorie</h3>
            <span style={{ color: '#c084fc', background: 'rgba(168,85,247,0.1)', padding: '0.5rem', borderRadius: '10px' }}>❖</span>
          </div>
          <p className="stat-value">{categoriesCount}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', margin: 0 }}>Reference Styles</h3>
            <span style={{ color: 'var(--color-secondary)', background: 'rgba(236,72,153,0.1)', padding: '0.5rem', borderRadius: '10px' }}>◩</span>
          </div>
          <p className="stat-value">{subcatsCount}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', margin: 0 }}>Total Generations</h3>
            <span style={{ color: 'var(--color-success)', background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '10px' }}>⚡</span>
          </div>
          <p className="stat-value">{jobsCount}</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{ marginTop: '3rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--color-primary)' }}>●</span> Stato Motore AI
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Provider Gemini 2.5 Flash</span>
          <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 10px var(--color-success)' }}></div>
            Operativo
          </span>
        </div>
      </div>
    </div>
  );
}
