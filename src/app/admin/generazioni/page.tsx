import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export default async function GenerazioniPage() {
  const jobs = await prisma.generationJob.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { images: true } } },
    take: 50, // Limit for MVP
  });

  return (
    <>
      <h2 className="page-title">Generazioni Attive</h2>
      <p className="page-subtitle">Storico dei Job ricevuti via Telegram. Segui l'avanzamento qui.</p>

      {jobs.length === 0 ? (
        <div className="stats-card">
          <p style={{fontSize: "1rem", color: "var(--color-text-muted)"}}>Non ci sono ancora generazioni nel sistema. Invia una foto al bot Telegram per iniziare!</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Job</th>
              <th>Stato</th>
              <th>Data Richiesta</th>
              <th>Immagini Generate</th>
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
                <td>
                  <span className={`status-badge status-${job.status.replace(' ', '')}`}>
                    {job.status}
                  </span>
                </td>
                <td>{job.createdAt.toLocaleString("it-IT")}</td>
                <td>{job._count.images} / {job.results_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
