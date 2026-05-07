import { prisma } from "@/lib/prisma";
import { getActiveAiModel, getAiSceneVariance } from "./actions";
import ModelToggle from "./ModelToggle";
import AiSceneToggle from "./AiSceneToggle";
import AdminDashboardClient from "./AdminDashboardClient";
import { Zap, Image as ImageIcon, Users, Euro, Activity } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // 1. Core Counts
  const usersCount = await prisma.user.count();
  const premiumUsersCount = await prisma.user.count({ where: { subscription_active: true } });
  
  const jobsCount = await prisma.generationJob.count();
  
  // 2. Today's & Month's Metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // We derive images directly from ApiCostLog to bypass Cron Job deletions of GenerationJobs
  const costsTodayAggr = await (prisma as any).apiCostLog.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { cost_eur: true }
  });

  const proCostsTodayAggr = await (prisma as any).apiCostLog.aggregate({
      where: { createdAt: { gte: today }, model_used: { contains: "pro" } },
      _sum: { cost_eur: true }
  });

  const costsMonthAggr = await (prisma as any).apiCostLog.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { cost_eur: true }
  });
  
  const proCostsMonthAggr = await (prisma as any).apiCostLog.aggregate({
      where: { createdAt: { gte: startOfMonth }, model_used: { contains: "pro" } },
      _sum: { cost_eur: true }
  });
  
  const costsTotalAggr = await (prisma as any).apiCostLog.aggregate({
      _sum: { cost_eur: true }
  });

  const proCostsTotalAggr = await (prisma as any).apiCostLog.aggregate({
      where: { model_used: { contains: "pro" } },
      _sum: { cost_eur: true }
  });

  const costToday = costsTodayAggr._sum.cost_eur || 0.000;
  const proTodayCost = proCostsTodayAggr._sum.cost_eur || 0.000;
  const flashTodayCost = costToday - proTodayCost;

  const costMonth = costsMonthAggr._sum.cost_eur || 0.000;
  const proMonthCost = proCostsMonthAggr._sum.cost_eur || 0.000;
  const flashMonthCost = costMonth - proMonthCost;
  
  const costTotal = costsTotalAggr._sum.cost_eur || 0.000;
  const proTotalCost = proCostsTotalAggr._sum.cost_eur || 0.000;
  const flashTotalCost = costTotal - proTotalCost;

  const flashTodayCount = Math.round(flashTodayCost / 0.0581);
  const proTodayCount = Math.round(proTodayCost / 0.1159);
  const imagesTodayCount = flashTodayCount + proTodayCount;

  const flashMonthCount = Math.round(flashMonthCost / 0.0581);
  const proMonthCount = Math.round(proMonthCost / 0.1159);
  const imagesMonthCount = flashMonthCount + proMonthCount;

  const flashTotalCount = Math.round(flashTotalCost / 0.0581);
  const proTotalCount = Math.round(proTotalCost / 0.1159);
  const totalImagesCount = flashTotalCount + proTotalCount;

  // 3. Current Month Activity (for Recharts & Table)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const monthlyCosts = await (prisma as any).apiCostLog.findMany({
    where: { createdAt: { gte: startOfMonth } },
    select: { createdAt: true, cost_eur: true, model_used: true }
  });

  // Aggregate by day
  const chartDataMap: Record<string, { 
    date: string, 
    flashImages: number, 
    proImages: number, 
    flashCost: number, 
    proCost: number,
    totalImages: number,
    totalCost: number
  }> = {};
  
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(startOfMonth);
    d.setDate(i);
    const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    chartDataMap[dateStr] = { date: dateStr, flashImages: 0, proImages: 0, flashCost: 0, proCost: 0, totalImages: 0, totalCost: 0 };
  }

  monthlyCosts.forEach((cost: any) => {
    const d = new Date(cost.createdAt);
    const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    if (chartDataMap[dateStr]) {
      const isPro = cost.model_used && cost.model_used.includes('pro');
      if (isPro) {
        chartDataMap[dateStr].proCost += (cost.cost_eur || 0);
      } else {
        chartDataMap[dateStr].flashCost += (cost.cost_eur || 0);
      }
      chartDataMap[dateStr].totalCost += (cost.cost_eur || 0);
    }
  });

  // Derive images from cost totals
  Object.values(chartDataMap).forEach(day => {
      day.flashImages = Math.round(day.flashCost / 0.0581);
      day.proImages = Math.round(day.proCost / 0.1159);
      day.totalImages = day.flashImages + day.proImages;
  });

  const chartData = Object.values(chartDataMap);

  // Quick Weekly KPI (Last 7 days strictly)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  let weeklyFlashCost = 0;
  let weeklyProCost = 0;

  monthlyCosts.forEach((cost: any) => {
      if(new Date(cost.createdAt) >= sevenDaysAgo) {
          const isPro = cost.model_used && cost.model_used.includes('pro');
          if (isPro) weeklyProCost += (cost.cost_eur || 0);
          else weeklyFlashCost += (cost.cost_eur || 0);
      }
  });

  const weeklyFlashImages = Math.round(weeklyFlashCost / 0.0581);
  const weeklyProImages = Math.round(weeklyProCost / 0.1159);

  // 4. Live Feed (Last 10 Jobs)
  const liveJobs = await prisma.generationJob.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, telegram_chat_id: true } },
      category: { select: { name: true } },
      images: { take: 1, select: { image_url: true } }
    }
  });

  const activeModel = await getActiveAiModel();
  const sceneVariance = await getAiSceneVariance();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: 'white' }}>Mission Control</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>SuperNexus AI real-time performance & metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
            <ModelToggle initialModel={activeModel} />
          </div>
          <div style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
            <AiSceneToggle initialEnabled={sceneVariance} />
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Users Card */}
        <div style={{ background: '#1c1c1e', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</h3>
            <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '8px', borderRadius: '10px', color: '#00d2ff' }}><Users size={20} /></div>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{usersCount}</p>
          <p style={{ fontSize: '0.85rem', color: '#00d2ff', margin: '0.5rem 0 0 0', fontWeight: 500 }}>{premiumUsersCount} Premium Subscriptions</p>
        </div>

        {/* Images Card */}
        <div style={{ background: '#1c1c1e', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Images Generated</h3>
            <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '8px', borderRadius: '10px', color: '#00d2ff' }}><ImageIcon size={20} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
             <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{totalImagesCount}</p>
             <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>({flashTotalCount} Flash | {proTotalCount} Pro)</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.8rem' }}>
             <p style={{ fontSize: '0.85rem', color: '#10b981', margin: 0, fontWeight: 500 }}>
                 +{imagesTodayCount} today <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>({flashTodayCount} Flash | {proTodayCount} Pro)</span>
             </p>
             <p style={{ fontSize: '0.85rem', color: '#eab308', margin: 0, fontWeight: 500 }}>
                 +{weeklyFlashImages + weeklyProImages} this week <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>({weeklyFlashImages} Flash | {weeklyProImages} Pro)</span>
             </p>
             <p style={{ fontSize: '0.85rem', color: '#00d2ff', margin: 0, fontWeight: 500 }}>
                 +{imagesMonthCount} this month <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>({flashMonthCount} Flash | {proMonthCount} Pro)</span>
             </p>
          </div>
        </div>

        {/* Cost Card */}
        <div style={{ background: '#1c1c1e', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Spending</h3>
            <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '8px', borderRadius: '10px', color: '#00d2ff' }}><Euro size={20} /></div>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>€{costTotal.toFixed(2)}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.8rem' }}>
             <p style={{ fontSize: '0.85rem', color: '#10b981', margin: 0, fontWeight: 500 }}>
                 +€{costToday.toFixed(2)} today
             </p>
             <p style={{ fontSize: '0.85rem', color: '#eab308', margin: 0, fontWeight: 500 }}>
                 +€{(weeklyFlashCost + weeklyProCost).toFixed(2)} this week <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>(€{weeklyFlashCost.toFixed(2)} Flash | €{weeklyProCost.toFixed(2)} Pro)</span>
             </p>
             <p style={{ fontSize: '0.85rem', color: '#00d2ff', margin: 0, fontWeight: 500 }}>
                 +€{costMonth.toFixed(2)} this month <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>(€{flashMonthCost.toFixed(2)} Flash | €{proMonthCost.toFixed(2)} Pro)</span>
             </p>
          </div>
        </div>

      </div>

      {/* QUICK COST REMINDER */}
      <div style={{ background: '#1c1c1e', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
         <div>
            <h4 style={{ color: '#00d2ff', margin: '0 0 0.5rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📦 Pack da 100 Immagini</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
               <li>Se generate con <strong style={{color: '#fff'}}>Gemini Flash</strong> (0,0581€ l'una): <strong>~ 5,81 €</strong> di costo netto.</li>
               <li>Se generate con <strong style={{color: '#fff'}}>Gemini Pro</strong> (0,1159€ l'una): <strong>~ 11,59 €</strong> di costo netto.</li>
            </ul>
         </div>
         <div>
            <h4 style={{ color: '#a855f7', margin: '0 0 0.5rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📦 Pack da 300 Immagini</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
               <li>Se generate con <strong style={{color: '#fff'}}>Gemini Flash</strong> (0,0581€ l'una): <strong>~ 17,43 €</strong> di costo netto.</li>
               <li>Se generate con <strong style={{color: '#fff'}}>Gemini Pro</strong> (0,1159€ l'una): <strong>~ 34,77 €</strong> di costo netto.</li>
            </ul>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* CHART WIDGET */}
        <div style={{ background: '#1c1c1e', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#00d2ff" /> Monthly Activity Overview
            </h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: '12px', height: '12px', background: '#00d2ff', borderRadius: '3px' }}></div> Flash Img</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: '12px', height: '12px', background: '#a855f7', borderRadius: '3px' }}></div> Pro Img</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: '12px', height: '2px', background: '#eab308' }}></div> Cost (€)</span>
            </div>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <AdminDashboardClient chartData={chartData} />
          </div>
        </div>

        {/* LIVE FEED WIDGET */}
        <div style={{ background: '#1c1c1e', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="#00d2ff" /> Live Feed
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
            {liveJobs.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No recent activity.</p>}
            
            {liveJobs.map(job => (
              <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {job.images && job.images[0] ? (
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                    <img src={job.images[0].image_url} alt="Job output" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(0,210,255,0.1)', color: '#00d2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ImageIcon size={20} />
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {job.user.email || 'Telegram User'}
                  </p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {job.category?.name || 'Custom'} • {job.results_count} imgs
                  </p>
                </div>
                
                <div style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: 600, 
                    background: job.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : job.status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 210, 255, 0.1)',
                    color: job.status === 'completed' ? '#10b981' : job.status === 'error' ? '#ef4444' : '#00d2ff'
                }}>
                  {job.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: '#1c1c1e', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', marginTop: '1.5rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="#00d2ff" /> Current Month Breakdown
        </h2>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Flash Images</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Pro Images</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Total Images</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Flash Cost</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Pro Cost</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Avg Cost / Flash Img</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Avg Cost / Pro Img</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#eab308' }}>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {chartData.slice().reverse().map((day, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: '#fff' }}>{day.date}</td>
                <td style={{ padding: '1rem', color: '#00d2ff' }}>{day.flashImages}</td>
                <td style={{ padding: '1rem', color: '#a855f7' }}>{day.proImages}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{day.totalImages}</td>
                <td style={{ padding: '1rem', color: '#00d2ff' }}>€{day.flashCost.toFixed(2)}</td>
                <td style={{ padding: '1rem', color: '#a855f7' }}>€{day.proCost.toFixed(2)}</td>
                <td style={{ padding: '1rem', color: '#00d2ff', fontSize: '0.8rem' }}>{day.flashImages > 0 ? `€${(day.flashCost / day.flashImages).toFixed(3)}` : '-'}</td>
                <td style={{ padding: '1rem', color: '#a855f7', fontSize: '0.8rem' }}>{day.proImages > 0 ? `€${(day.proCost / day.proImages).toFixed(3)}` : '-'}</td>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#eab308' }}>€{day.totalCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
