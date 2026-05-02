import { prisma } from "@/lib/prisma";
import { Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function AnalysesPage() {
    const checks = await prisma.outputValidationCheck.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            subcategory: {
                include: {
                    business_mode: {
                        include: { category: true }
                    }
                }
            }
        }
    });

    // Grouping by taxonomy path
    const grouped = checks.reduce((acc, check) => {
        let path = "Percorso Sconosciuto";
        try {
            const parsed = JSON.parse(check.generated_sample_image);
            path = parsed.path || "Percorso Sconosciuto";
        } catch (e) {
            path = check.subcategory?.name || "Percorso Sconosciuto";
        }
        
        if (!acc[path]) acc[path] = [];
        acc[path].push(check);
        return acc;
    }, {} as Record<string, typeof checks>);

    // Handle delete action inside the server component via a Server Action
    async function deleteCheck(id: string) {
        "use server";
        await prisma.outputValidationCheck.delete({ where: { id } });
        revalidatePath('/admin/analyses');
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', color: '#fff' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#00d2ff', fontWeight: 800 }}>Pannello Analisi e Feedback</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Lo storico visivo di tutte le direttive inviate ad Antigravity dalla Sandbox. Ogni riga rappresenta un test completo.
            </p>
            
            {Object.keys(grouped).length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>Nessuna analisi salvata. Utilizza la Sandbox per collaudare e salvare feedback.</p>
                </div>
            )}

            {Object.entries(grouped).map(([path, items]) => (
                <div key={path} style={{ marginBottom: '4rem' }}>
                    <div style={{ background: 'linear-gradient(90deg, rgba(0, 210, 255, 0.1), transparent)', borderLeft: '4px solid #00d2ff', padding: '1rem 2rem', marginBottom: '2rem', borderRadius: '0 12px 12px 0' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>
                            {path}
                        </h2>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#03dac6', textTransform: 'uppercase', fontWeight: 600 }}>
                            Storico Cronologico (Dal più recente)
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {items.map((check) => {
                            let urls: string[] = [];
                            try {
                                const parsed = JSON.parse(check.generated_sample_image);
                                urls = parsed.urls || [];
                            } catch (e) {
                                urls = [check.generated_sample_image]; // Legacy single image
                            }

                            return (
                                <div key={check.id} style={{ display: 'flex', gap: '2rem', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                    
                                    {/* Uploaded Reference Image */}
                                    <div style={{ width: '140px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#03dac6', fontWeight: 700, letterSpacing: '0.5px' }}>Upload Cliente</div>
                                        {check.reference_image_url && check.reference_image_url !== 'N/A' && !check.reference_image_url.includes('>') ? (
                                            <div style={{ width: '140px', height: '186px', borderRadius: '12px', overflow: 'hidden', background: '#222', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <img src={check.reference_image_url} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        ) : (
                                            <div style={{ width: '140px', height: '186px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '10px' }}>
                                                Nessun<br/>Upload
                                            </div>
                                        )}
                                    </div>

                                    {/* Generated Images Row */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#00d2ff', fontWeight: 700, letterSpacing: '0.5px' }}>Risultato Test (Generazione)</div>
                                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
                                                {new Date(check.createdAt).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                                            {urls.map((url, i) => (
                                                <div key={i} style={{ width: '140px', height: '186px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#111' }}>
                                                    <img src={url.startsWith('http') || url.startsWith('data:') ? url : `data:image/jpeg;base64,${url}`} alt={`Gen ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                            {urls.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontStyle: 'italic', padding: '1rem 0' }}>Nessuna immagine salvata nel payload.</div>}
                                        </div>
                                    </div>

                                    {/* Feedback Notes */}
                                    <div style={{ width: '380px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#e62ebf', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.5px' }}>Appunti e Direttiva per Antigravity</div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '12px', fontSize: '0.95rem', color: '#fff', flex: 1, whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.05)', lineHeight: '1.5' }}>
                                            {check.review_notes || <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Nessuna nota specifica inserita. L'immagine potrebbe essere già validata.</span>}
                                        </div>

                                        <form action={deleteCheck.bind(null, check.id)} style={{ marginTop: '1.5rem', alignSelf: 'flex-end' }}>
                                            <button type="submit" style={{ background: 'transparent', border: '1px solid rgba(255, 75, 75, 0.3)', color: '#ff4b4b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s', fontWeight: 600 }}>
                                                <Trash2 size={16} /> Rimuovi
                                            </button>
                                        </form>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
