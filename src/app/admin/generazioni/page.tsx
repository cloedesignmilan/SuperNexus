import { prisma } from "@/lib/prisma";
import { Images, Box } from 'lucide-react';
import PrintButton from './PrintButton';

export const revalidate = 0;

export default async function GenerazioniPage() {
  const stores = await prisma.store.findMany({
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { images: true } } },
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem'}} className="print-hide">
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <Images size={40} color="#bb86fc" />
            <div>
                <h2 className="page-title" style={{marginBottom: 0}}>Resoconti Negozi (Fatturazione)</h2>
                <p className="page-subtitle" style={{marginBottom: 0}}>Elenco raggruppato delle operazioni per singolo Tenant.</p>
            </div>
          </div>
          <PrintButton />
      </div>

      <div className="print-only" style={{display: 'none', marginBottom: '2rem'}}>
          <h1>Estratto Conto Operazioni AI</h1>
          <p>Generato dal sistema centrale in data {new Date().toLocaleDateString('it-IT')}</p>
      </div>

      {stores.map(store => {
          if (store.jobs.length === 0) return null; // Nascondiamo i negozi vuoti
          
          const totalImages = store.jobs.reduce((acc, job) => acc + (job.status === "completato" ? job.results_count : 0), 0);
          
          return (
              <div key={store.id} className="print-card" style={{background: 'rgba(10,10,10,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', marginBottom: '3rem', pageBreakInside: 'avoid'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                      <h3 style={{fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff'}}>
                          <Box size={24} color="#bb86fc" className="print-icon" /> {store.name}
                      </h3>
                      <div className="print-totals" style={{textAlign: 'right', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)'}}>
                          <span style={{fontSize: '0.8rem', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '1px'}}>Immagini Fatturabili</span><br/>
                          <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#03dac6'}}>{totalImages}</span>
                      </div>
                  </div>
                  
                  <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID Identificativo</th>
                      <th>Esito Sistema</th>
                      <th>Data di Richiesta</th>
                      <th>Consumo (Output)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.jobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <span style={{ fontSize: "0.85rem", color: "#888", fontFamily: "monospace" }}>
                            {job.id}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${job.status.replace(' ', '')}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>{job.createdAt.toLocaleString("it-IT")}</td>
                        <td><span style={{color: '#a0a0a0'}}> {job._count.images} di <span className="print-dark-text" style={{color:'#fff', fontWeight: 'bold'}}>{job.results_count}</span> erogate</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )
      })}
    </>
  );
}
