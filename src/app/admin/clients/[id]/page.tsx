import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, Euro, Image as ImageIcon } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ClientDetail({ params }: { params: { id: string } }) {
  const { id } = params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return <div style={{ color: 'white', padding: '2rem' }}>Cliente non trovato</div>;
  }

  // Fetch jobs for this user
  const jobs = await prisma.generationJob.findMany({
    where: { user_id: id },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { image_order: 'asc' } }
    }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/clients" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '10px', color: '#00d2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'white' }}>{user.email || 'Guest User'}</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.85rem' }}>Cronologia Generazioni (pulizia automatica a 24h) • {jobs.length} task trovati</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ImageIcon size={48} style={{ color: 'rgba(0,210,255,0.3)', margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: 'white' }}>Nessuna Generazione</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Il cliente non ha lavori recenti (o sono già stati puliti dal cron di 24h).</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {jobs.map(job => (
            <div key={job.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#1c1c1e', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {job.category?.name || 'Outfit'}
                </span>
                <span style={{ 
                  fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600,
                  background: job.status === 'completato' ? 'rgba(16, 185, 129, 0.1)' : job.status === 'errore' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,210,255,0.1)',
                  color: job.status === 'completato' ? '#10b981' : job.status === 'errore' ? '#ef4444' : '#00d2ff'
                }}>
                  {job.status.toUpperCase()}
                </span>
              </div>

              {job.images && job.images.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: job.images.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: '8px' }}>
                  {job.images.map(img => (
                    <div key={img.id} style={{ aspectRatio: '4/5', borderRadius: '12px', overflow: 'hidden', background: '#111' }}>
                      <img src={img.image_url} alt="Gen" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ aspectRatio: '4/5', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', flexDirection: 'column', gap: '0.5rem' }}>
                  <ImageIcon size={24} />
                  <span style={{ fontSize: '0.8rem' }}>No Image Output</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                  <Clock size={14} />
                  {new Date(job.createdAt).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00d2ff', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Euro size={14} />
                  {job.total_cost_eur.toFixed(4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
