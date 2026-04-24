import { prisma } from "@/lib/prisma";
import { Users, Plus } from "lucide-react";
import ClientList from "./ClientList";
import { createClient } from "./actions";

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      jobs: {
        select: { status: true }
      }
    }
  });

  const costAggregate = await prisma.apiCostLog.groupBy({
    by: ['user_id'],
    _sum: { cost_eur: true }
  });

  const enrichedClients = users.map(user => {
    const successfulJobs = user.jobs.filter(j => j.status === 'completed').length;
    const failedJobs = user.jobs.filter(j => j.status === 'failed' || j.status === 'error').length;
    const userCost = costAggregate.find(c => c.user_id === user.id)?._sum.cost_eur || 0;
    return { ...user, successfulJobs, failedJobs, totalCost: userCost };
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h2><Users className="inline-icon" /> Gestione Clienti & CRM</h2>
          <p>Crea accessi privati per i tuoi clienti, imposta il plafond immagini e monitora i consumi.</p>
        </div>
      </header>

      <section className="admin-card" style={{ marginBottom: '30px', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
         <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'white', margin: '0 0 4px 0' }}>Registra Nuovo Cliente</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>Crea un profilo per generare un PIN protetto e assegnare plafond alle sue generazioni.</p>
         </div>
         
         <form action={createClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome o Email</label>
              <input type="text" name="email" required placeholder="Es. mario@supernexus.ai" style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }} className="admin-input-premium" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Piano Mensile</label>
              <div style={{ position: 'relative' }}>
                <select name="plan" required style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none', appearance: 'none' }} className="admin-input-premium">
                   <option value="100">Starter Pack (100 Immagini)</option>
                   <option value="300">Retail Pack (300 Immagini)</option>
                </select>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary)', fontSize: '1rem', fontWeight: 'bold' }}>✦</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extra Omaggiati</label>
              <div style={{ position: 'relative' }}>
                <input type="number" name="extra" required placeholder="0" defaultValue="0" style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }} className="admin-input-premium" />
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary)', fontSize: '1rem', fontWeight: 'bold' }}>+</span>
              </div>
            </div>
            
            <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.85rem 1.5rem', background: 'linear-gradient(135deg, var(--color-primary), #00d2ff)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', height: 'fit-content', boxShadow: '0 4px 15px rgba(230, 46, 191, 0.3)' }} className="admin-btn-premium">
               <Plus size={18} /> Genera Account
            </button>
         </form>
      </section>

      <section className="admin-card">
        <ClientList clients={enrichedClients} />
      </section>
    </div>
  );
}
