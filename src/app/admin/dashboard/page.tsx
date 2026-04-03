import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Force dynamic fetching for the dashboard

export default async function DashboardPage() {
  // Querying statistics from the DB
  const completedGenerations = await prisma.generationJob.count({ where: { status: "completato" } });
  const errorGenerations = await prisma.generationJob.count({ where: { status: "errore" } });
  const inProgressGenerations = await prisma.generationJob.count({ where: { status: "in lavorazione" } });
  const totalImages = await prisma.jobImage.count();

  return (
    <>
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">Statistiche e riepilogo in tempo reale delle creazioni di Magazzini Emilio.</p>

      <div className="card-grid">
        <div className="stats-card">
          <h3>Job in lavorazione</h3>
          <p style={{color: "var(--color-status-working)"}}>{inProgressGenerations}</p>
        </div>
        <div className="stats-card">
          <h3>Job Completati</h3>
          <p style={{color: "var(--color-status-done)"}}>{completedGenerations}</p>
        </div>
        <div className="stats-card">
          <h3>Totale Immagini Create</h3>
          <p>{totalImages}</p>
        </div>
        <div className="stats-card">
          <h3>Errori Processo</h3>
          <p style={{color: "var(--color-status-error)"}}>{errorGenerations}</p>
        </div>
      </div>
    </>
  );
}
