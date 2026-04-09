import { prisma } from "@/lib/prisma";
import { ArrowLeft, GitCommit, FileJson, Image as ImageIcon, Box, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import RatingPanel from './RatingPanel';

export const revalidate = 0;

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<any>;
};

export default async function JobAuditPage(props: PageProps) {
    const params = await props.params;
    const id = params?.id;

    if (!id) return <div>Invalid Job ID</div>;

    const job = await (prisma as any).generationJob.findUnique({
        where: { id },
        include: { store: true, images: true }
    });

    if (!job) return <div>Job Not Found</div>;

    let meta: any = {};
    if (job.metadata) {
        meta = typeof job.metadata === 'string' ? JSON.parse(job.metadata) : job.metadata;
    }

    // Inspector Data fallback
    const inspectorData = meta.inspectorData || {};
    const finalPrompts = meta.finalPrompts || [];
    const configSnapshot = meta.adminConfigSnapshot || null;

    return (
        <div style={{ paddingBottom: '50px' }}>
            <Link href="/admin/generazioni" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#bb86fc', textDecoration: 'none', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Torna alle Generazioni
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                   <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Audit Job: {job.id.slice(-8)}</h1>
                   <p style={{ color: '#888' }}>Richiesto da <b>{job.store?.name || 'Sconosciuto'}</b> il {job.createdAt.toLocaleString('it-IT')}</p>
                   <span className={`status-badge status-${job.status.replace(' ', '')}`} style={{ marginTop: '10px', display: 'inline-block' }}>
                        {job.status}
                   </span>
                </div>
                <div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#333', color: '#fff', border: '1px solid #555', padding: '10px 15px', borderRadius: '8px', cursor: 'wait', opacity: 0.5 }} disabled title="Prossimamente">
                        <RefreshCw size={16} /> Replay Job (Prossimamente)
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#666', textAlign: 'right', marginTop: '5px' }}>Dati salvati e pronti per il replay</p>
                </div>
            </div>

            <RatingPanel jobId={job.id} currentRating={meta.quality_rating} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                {/* COLONNA SINISTRA: Input e Inspector */}
                <div>
                    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#bb86fc' }}>
                            <ImageIcon size={20} /> Input Originale
                        </h3>
                        {meta.fileUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={meta.fileUrl} alt="Sorgente" style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />
                        ) : (
                            <p style={{color: '#666'}}>Nessuna URL immagine salvata</p>
                        )}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                            <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '6px' }}>
                                <span style={{ color: '#888', display: 'block', fontSize: '0.8rem' }}>Categoria Confermata UI</span>
                                <b>{meta.confirmedCategory || 'N/A'}</b>
                            </div>
                            <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '6px' }}>
                                <span style={{ color: '#888', display: 'block', fontSize: '0.8rem' }}>Ambiente Confermato UI</span>
                                <b>{meta.confirmedEnvironment || 'N/A'}</b>
                            </div>
                            <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '6px' }}>
                                <span style={{ color: '#888', display: 'block', fontSize: '0.8rem' }}>Genere/Target UI</span>
                                <b>{meta.confirmedGender || 'N/A'}</b>
                            </div>
                            <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '6px' }}>
                                <span style={{ color: '#888', display: 'block', fontSize: '0.8rem' }}>Bottom Specifico UI</span>
                                <b>{meta.confirmedBottom || 'N/A'}</b>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#03dac6' }}>
                            <FileJson size={20} /> Inspector Decision Data
                        </h3>
                        <pre style={{ background: '#0a0a0a', padding: '15px', borderRadius: '8px', fontSize: '0.8rem', color: '#a0a0a0', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(inspectorData, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* COLONNA DESTRA: Output, Prompt e Config */}
                <div>
                     <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#ffb86c' }}>
                            <GitCommit size={20} /> Prompt Finali Generati (Modular Builder)
                        </h3>
                        {finalPrompts.length > 0 ? (
                            finalPrompts.map((prompt: string, i: number) => (
                                <div key={i} style={{ marginBottom: '15px' }}>
                                    <h4 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Immagine #{i + 1}</h4>
                                    <pre style={{ background: '#0a0a0a', padding: '15px', borderRadius: '8px', fontSize: '0.8rem', color: '#4ade80', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                        {prompt}
                                    </pre>
                                </div>
                            ))
                        ) : (
                            <p style={{color: '#666'}}>Nessun prompt tracciato (Job antecedente all'Update Step 6).</p>
                        )}
                    </div>

                    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#f1fa8c' }}>
                            <Box size={20} /> Configurazione Admin (Snapshot)
                        </h3>
                        {configSnapshot ? (
                            <pre style={{ background: '#0a0a0a', padding: '15px', borderRadius: '8px', fontSize: '0.8rem', color: '#dbdbdb', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(configSnapshot, null, 2)}
                            </pre>
                        ) : (
                            <p style={{color: '#666'}}>Snapshot non disponibile. Il generatore era nel vecchio fallback Mode.</p>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
}
