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

  // Calcolo Spesa API Reale in base al DB
  const costsTodayAggr = await prisma.apiCostLog.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { cost_eur: true }
  });
  
  const costsTotalAggr = await prisma.apiCostLog.aggregate({
      _sum: { cost_eur: true }
  });

  const costToday = costsTodayAggr._sum.cost_eur || 0.000;
  const costTotal = costsTotalAggr._sum.cost_eur || 0.000;

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: 'white' }}>Visore Centrale</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Panoramica dello stato di salute dell'intelligenza artificiale.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        
        {/* Gradient Card Purple */}
        <div className="admin-card card-gradient-purple" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0, opacity: 0.9 }}>Database Nodi</h3>
            <span style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '10px' }}>❖</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>Macro</p>
              <p style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>{categoriesCount}</p>
            </div>
            <div>
               <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>Reference</p>
               <p style={{ fontSize: '1.5rem', fontWeight: '600', margin: 'auto 0 0 0', display: 'flex', alignItems: 'flex-end', height: '100%', paddingBottom: '4px' }}>{subcatsCount}</p>
            </div>
          </div>
        </div>

        {/* Gradient Card Cyan */}
        <div className="admin-card card-gradient-cyan" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0, opacity: 0.9 }}>Generazioni Oggi</h3>
            <span style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '10px' }}>⚡</span>
          </div>
          <div>
             <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>{imagesTodayCount}</p>
             <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: '0.5rem 0 0 0' }}>Job totali in vita: {jobsCount}</p>
          </div>
        </div>

        {/* Dark Card */}
        <div className="admin-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', margin: 0 }}>Spesa Odierna API</h3>
            <span style={{ color: 'var(--color-primary)', background: 'rgba(230, 46, 191, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>€</span>
          </div>
          <p className="stat-value" style={{ fontSize: '2rem', marginTop: 'auto', paddingTop: '20px' }}>€{costToday.toFixed(3)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>{visionTodayCount} Analisi Vision + {imagesTodayCount} Foto</p>
        </div>

        {/* Dark Card */}
        <div className="admin-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', margin: 0 }}>Spesa Totale Vita</h3>
            <span style={{ color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '10px' }}>📈</span>
          </div>
          <p className="stat-value" style={{ fontSize: '2rem', marginTop: 'auto', paddingTop: '20px' }}>€{costTotal.toFixed(2)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>Da inizio progetto</p>
        </div>
      </div>
      
      {/* Bot Status */}
      <div className="admin-card" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Stato Motore AI
        </h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '15px 20px', borderRadius: '12px' }}>
           <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Provider Visione</span>
              <span style={{ color: 'white', fontWeight: 600 }}>Gemini 2.5 Flash</span>
           </div>
           <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '30px' }}></div>
           <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Connection Status</span>
              <span style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 10px var(--color-success)' }}></div>
                 Operativo
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}
