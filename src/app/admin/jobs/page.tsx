import { prisma } from "@/lib/prisma";
import SaveOutputsToggle from "./SaveOutputsToggle";
import JobTableRow from "./JobTableRow";

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
    const jobs = await prisma.generationJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            user: true,
            category: true,
            subcategory: true,
            images: true
        }
    });

    const setting = await (prisma as any).setting.findUnique({ where: { key: 'SAVE_GENERATION_OUTPUTS_ENABLED' }});
    const outputsEnabled = setting?.value === 'true';

    return (
        <div>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: 'white' }}>Generazioni AI</h1>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Cronologia in tempo reale degli ultimi rendering eseguiti su Telegram.</p>
                </div>
                <SaveOutputsToggle initialValue={outputsEnabled} />
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', background: '#1c1c1e', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>ID / Data</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Utente CRM</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Modello Allenato</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Esito Task</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Costo</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Asset</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <JobTableRow key={job.id} job={job} />
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        Il database è vuoto. I log AI appariranno qui in tempo reale.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
