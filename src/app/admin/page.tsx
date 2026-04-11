import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const categoriesCount = await prisma.category.count();
  const subcatsCount = await prisma.subcategory.count();
  const jobsCount = await prisma.generationJob.count();
  const totalImagesAggr = await prisma.generationJob.aggregate({ _sum: { results_count: true } });
  const totalImagesCount = totalImagesAggr._sum.results_count || 0;
  const totalVisionCount = await prisma.promptTemplateSettings.count();

  // Calcoli odierni
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const imagesTodayAggr = await prisma.generationJob.aggregate({ 
     where: { createdAt: { gte: today } },
     _sum: { results_count: true }
  });
  const imagesTodayCount = imagesTodayAggr._sum.results_count || 0;
  const visionTodayCount = await prisma.promptTemplateSettings.count({ where: { updatedAt: { gte: today } } });

  // Costi Hardcoded in base al tariffario (modificabili qui)
  const COST_PER_VISION_ANALYSIS = 0.005; // ~0.005€ per chiamata a Gemini Pro
  const COST_PER_IMAGE_GENERATION = 0.03; // ~0.03€ per immagine da Imagen 3

  const costToday = (imagesTodayCount * COST_PER_IMAGE_GENERATION) + (visionTodayCount * COST_PER_VISION_ANALYSIS);
  const costTotal = (totalImagesCount * COST_PER_IMAGE_GENERATION) + (totalVisionCount * COST_PER_VISION_ANALYSIS);

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Visore Centrale</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Panoramica dello stato di salute dell'intelligenza artificiale.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', margin: 0 }}>Database Nodi</h3>
            <span style={{ color: '#c084fc', background: 'rgba(168,85,247,0.1)', padding: '0.5rem', borderRadius: '10px' }}>❖</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Macro</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{categoriesCount}</p>
            </div>
            <div>
               <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Reference</p>
               <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{subcatsCount}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', margin: 0 }}>Generazioni Oggi</h3>
            <span style={{ color: 'var(--color-success)', background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: '10px' }}>⚡</span>
          </div>
          <p className="stat-value">{imagesTodayCount}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>Job totali in vita: {jobsCount}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#38bdf8', margin: 0 }}>Spesa Odierna API</h3>
            <span style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>€</span>
          </div>
          <p className="stat-value" style={{ color: '#e0f2fe' }}>€{costToday.toFixed(3)}</p>
          <p style={{ fontSize: '0.8rem', color: '#7dd3fc', margin: '0.5rem 0 0 0' }}>{visionTodayCount} Analisi Vision + {imagesTodayCount} Foto</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', margin: 0 }}>Spesa Totale Vita</h3>
            <span style={{ color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '10px' }}>📈</span>
          </div>
          <p className="stat-value" style={{ fontSize: '2rem' }}>€{costTotal.toFixed(2)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>Da inizio progetto</p>
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
