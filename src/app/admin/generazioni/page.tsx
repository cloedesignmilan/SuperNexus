import { prisma } from "@/lib/prisma";
import { Images, Box, Search } from 'lucide-react';

export const revalidate = 0;

export default async function GenerazioniPage() {
  const jobs = await prisma.generationJob.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
        _count: { select: { images: true } },
        store: { select: { name: true } } 
    },
    take: 50,
  });

  return (
    <>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '0.5rem'}}>
        <Images size={40} color="#03dac6" />
        <h2 className="page-title" style={{marginBottom: 0}}>Operazioni Globali AI</h2>
      </div>
      <p className="page-subtitle">Visualizza in tempo reale le richieste di Lookbook inoltrate da tutta la rete di Boutique Clienti.</p>

      {jobs.length === 0 ? (
        <div className="stats-card">
          <p style={{fontSize: "1rem", color: "var(--color-text-muted)"}}>Non ci sono ancora generazioni nel sistema. Invia una foto al bot Telegram per iniziare!</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Job</th>
              <th>Boutique Cliente</th>
              <th>Stato</th>
              <th>Data Richiesta</th>
              <th>Foto Generate</th>
              <th>Analisi</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                    {job.id.slice(0, 8)}...
                  </span>
                </td>
                <td style={{fontWeight: 'bold', color: '#fff'}}><Box size={14} style={{display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom', color: '#bb86fc'}}/> {job.store?.name || "Test Interno"}</td>
                <td>
                  <span className={`status-badge status-${job.status.replace(' ', '')}`}>
                    {job.status}
                  </span>
                </td>
                <td>{job.createdAt.toLocaleString("it-IT")}</td>
                <td><span style={{color: '#a0a0a0'}}> {job._count.images} / <span style={{color:'#fff'}}>{job.results_count}</span> output </span></td>
                <td>
                    <button style={{background: 'rgba(187, 134, 252, 0.15)', border: '1px solid #bb86fc', color: '#bb86fc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <Search size={14} /> Log
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
