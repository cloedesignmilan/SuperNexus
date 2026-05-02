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
  
  const totalImagesAggr = await prisma.generationJob.aggregate({ _sum: { results_count: true } });
  const totalImagesCount = totalImagesAggr._sum?.results_count || 0;

  const proTotalAggr = await prisma.generationJob.aggregate({ where: { model_used: { contains: "pro" } }, _sum: { results_count: true } });
  const proTotalCount = proTotalAggr._sum?.results_count || 0;
  const flashTotalCount = totalImagesCount - proTotalCount;

  // 2. Today's & Month's Metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const imagesTodayAggr = await prisma.generationJob.aggregate({ 
     where: { createdAt: { gte: today } },
     _sum: { results_count: true }
  });
  const imagesTodayCount = imagesTodayAggr._sum?.results_count || 0;

  const proTodayAggr = await prisma.generationJob.aggregate({ 
     where: { createdAt: { gte: today }, model_used: { contains: "pro" } },
     _sum: { results_count: true }
  });
  const proTodayCount = proTodayAggr._sum?.results_count || 0;
  const flashTodayCount = imagesTodayCount - proTodayCount;

  const imagesMonthAggr = await prisma.generationJob.aggregate({ 
     where: { createdAt: { gte: startOfMonth } },
     _sum: { results_count: true }
  });
  const imagesMonthCount = imagesMonthAggr._sum?.results_count || 0;

  const proMonthAggr = await prisma.generationJob.aggregate({ 
     where: { createdAt: { gte: startOfMonth }, model_used: { contains: "pro" } },
     _sum: { results_count: true }
  });
  const proMonthCount = proMonthAggr._sum?.results_count || 0;
  const flashMonthCount = imagesMonthCount - proMonthCount;

  const costsTodayAggr = await (prisma as any).apiCostLog.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { cost_eur: true }
  });

  const costsMonthAggr = await (prisma as any).apiCostLog.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { cost_eur: true }
  });
  
  const costsTotalAggr = await (prisma as any).apiCostLog.aggregate({
      _sum: { cost_eur: true }
  });

  const costToday = costsTodayAggr._sum.cost_eur || 0.000;
  const costMonth = costsMonthAggr._sum.cost_eur || 0.000;
  const costTotal = costsTotalAggr._sum.cost_eur || 0.000;

  // 3. Last 7 Days Activity (for Recharts)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentJobs = await prisma.generationJob.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, results_count: true }
  });

  const recentCosts = await (prisma as any).apiCostLog.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, cost_eur: true }
  });

  // Aggregate by day
  const chartDataMap: Record<string, { date: string, images: number, cost: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    chartDataMap[dateStr] = { date: dateStr, images: 0, cost: 0 };
  }

  recentJobs.forEach(job => {
    const d = new Date(job.createdAt);
    const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    if (chartDataMap[dateStr]) chartDataMap[dateStr].images += (job.results_count || 0);
  });

  recentCosts.forEach((cost: any) => {
    const d = new Date(cost.createdAt);
    const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    if (chartDataMap[dateStr]) chartDataMap[dateStr].cost += (cost.cost_eur || 0);
  });

  const chartData = Object.values(chartDataMap);

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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.8rem' }}>
             <p style={{ fontSize: '0.85rem', color: '#10b981', margin: 0, fontWeight: 500 }}>
                 +{imagesTodayCount} today <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>({flashTodayCount} Flash | {proTodayCount} Pro)</span>
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
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
             <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>€{costToday.toFixed(2)} today</p>
             <p style={{ fontSize: '0.85rem', color: '#00d2ff', margin: 0 }}>€{costMonth.toFixed(2)} this month</p>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* CHART WIDGET */}
        <div style={{ background: '#1c1c1e', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#00d2ff" /> 7-Day Activity
            </h2>
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
    </div>
  );
}
