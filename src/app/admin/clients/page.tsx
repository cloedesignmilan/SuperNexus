import { prisma } from "@/lib/prisma";
import { Users, Plus } from "lucide-react";
import ClientList from "./ClientList";
import { createClient } from "./actions";

export default async function ClientsPage() {
  const users = await prisma.user.findMany({
    where: { role: { not: "admin" } },
    orderBy: { createdAt: "desc" },
    include: {
      jobs: {
        select: { status: true }
      }
    }
  });

  const enrichedClients = users.map(user => {
    const successfulJobs = user.jobs.filter(j => j.status === 'completed').length;
    const failedJobs = user.jobs.filter(j => j.status === 'failed' || j.status === 'error').length;
    return { ...user, successfulJobs, failedJobs };
  });

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h2><Users className="inline-icon" /> Gestione Clienti & CRM</h2>
          <p>Crea accessi privati per i tuoi clienti, imposta il plafond immagini e monitora i consumi.</p>
        </div>
      </header>

      <section className="admin-card" style={{ marginBottom: '30px' }}>
         <h3 style={{ marginBottom: '15px', color: 'var(--color-primary)' }}>Nuovo Cliente</h3>
         <form action={createClient} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Identificativo (Nome / Email)</label>
              <input type="text" name="email" required placeholder="Es. Mario Rossi (mario@email.com)" className="admin-input" />
            </div>
            <div style={{ width: '150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Plafond Iniziale (Crediti)</label>
              <input type="number" name="allowance" required placeholder="Es. 100" defaultValue="100" className="admin-input" />
            </div>
            <button type="submit" className="admin-btn primary">
               <Plus size={18} /> Crea Account (Genera PIN)
            </button>
         </form>
      </section>

      <section className="admin-card">
        <ClientList clients={enrichedClients} />
      </section>
    </div>
  );
}
