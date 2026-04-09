import { prisma } from "@/lib/prisma";
import { ArrowLeft, Split, AlertTriangle, FileJson, ImageIcon, GitCommit, Search } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 0;

// Helper diff color logic: highlighting strings if they mismatch
const HighlightDiff = ({ str1, str2, isBaseline }: { str1?: string, str2?: string, isBaseline: boolean }) => {
    const s1 = str1 || '';
    const s2 = str2 || '';
    if (s1 === s2) return <span>{s1}</span>;
    // Difference detected
    return <span style={{ background: isBaseline ? 'rgba(255, 107, 107, 0.2)' : 'rgba(74, 222, 128, 0.2)', borderBottom: `2px solid ${isBaseline ? '#ff6b6b' : '#4ade80'}` }}>{isBaseline ? s1 : s2}</span>;
}

type CompareProps = {
    params: Promise<any>;
    searchParams: Promise<{ job1?: string, job2?: string }>;
};

export default async function ComparePage(props: CompareProps) {
    const searchParams = await props.searchParams;
    const { job1: searchJob1, job2: searchJob2 } = searchParams;
    
    if (!searchJob1 || !searchJob2) {
        return notFound();
    }

    const [job1, job2] = await Promise.all([
        (prisma as any).generationJob.findUnique({ where: { id: searchJob1 } }),
        (prisma as any).generationJob.findUnique({ where: { id: searchJob2 } })
    ]);

    if (!job1 || !job2) {
        return <div style={{padding: '50px', textAlign: 'center'}}>Uno o entrambi i job non esistono.</div>;
    }

    const m1 = typeof job1.metadata === 'string' ? JSON.parse(job1.metadata) : (job1.metadata || {});
    const m2 = typeof job2.metadata === 'string' ? JSON.parse(job2.metadata) : (job2.metadata || {});

    const renderColumn = (job: any, meta: any, otherMeta: any, isBaseline: boolean) => {
        return (
            <div style={{ background: '#111', borderRadius: '12px', padding: '20px', border: '1px solid #333' }}>
                <div style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', color: isBaseline ? '#ffb86c' : '#8be9fd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isBaseline ? 'Job A (Baseline)' : 'Job B (Compare)'}
                        <span style={{ fontSize: '0.7rem', color: '#888', background: '#222', padding: '3px 8px', borderRadius: '12px' }}>{job.id.slice(-8)}</span>
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{job.createdAt.toLocaleString('it-IT')}</p>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}><Search size={14}/> Settings UI Deducibili</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                         <div style={{ background: '#1a1a1a', padding: '8px', borderRadius: '4px' }}>
                             <span style={{color:'#666', display:'block'}}>Categoria</span>
                             <HighlightDiff str1={meta.confirmedCategory} str2={otherMeta.confirmedCategory} isBaseline={isBaseline} />
                         </div>
                         <div style={{ background: '#1a1a1a', padding: '8px', borderRadius: '4px' }}>
                             <span style={{color:'#666', display:'block'}}>Ambiente</span>
                             <HighlightDiff str1={meta.confirmedEnvironment} str2={otherMeta.confirmedEnvironment} isBaseline={isBaseline} />
                         </div>
                         <div style={{ background: '#1a1a1a', padding: '8px', borderRadius: '4px' }}>
                             <span style={{color:'#666', display:'block'}}>Genere</span>
                             <HighlightDiff str1={meta.confirmedGender} str2={otherMeta.confirmedGender} isBaseline={isBaseline} />
                         </div>
                         <div style={{ background: '#1a1a1a', padding: '8px', borderRadius: '4px' }}>
                             <span style={{color:'#666', display:'block'}}>Rating Q.A.</span>
                             <HighlightDiff str1={meta.quality_rating || 'N/A'} str2={otherMeta.quality_rating || 'N/A'} isBaseline={isBaseline} />
                         </div>
                    </div>
                </div>

                {meta.inspectorData && (
                     <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}><FileJson size={14}/> Inspector Raw (Summary)</h3>
                        <pre style={{ background: '#0a0a0a', padding: '10px', borderRadius: '4px', fontSize: '0.75rem', color: '#a0a0a0', overflowX: 'auto', maxHeight: '200px' }}>
                            {JSON.stringify(meta.inspectorData, null, 2)}
                        </pre>
                     </div>
                )}

                {meta.finalPrompts && meta.finalPrompts.length > 0 && (
                     <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}><GitCommit size={14}/> Prompt Variante 1 (Gemini)</h3>
                        <pre style={{ background: '#0a0a0a', padding: '10px', borderRadius: '4px', fontSize: '0.75rem', color: '#4ade80', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                            <HighlightDiff str1={meta.finalPrompts[0]} str2={otherMeta.finalPrompts?.[0]} isBaseline={isBaseline} />
                        </pre>
                     </div>
                )}
                
                {meta.adminConfigSnapshot && (
                     <div>
                        <h3 style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}><AlertTriangle size={14}/> Configurato con Fallback Legacy?</h3>
                        <span style={{background: meta.adminConfigSnapshot.PROMPT_CONFIG_SETTINGS?.use_modular_builder ? '#1b4a2e' : '#4a1b1b', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#fff'}}>
                            {meta.adminConfigSnapshot.PROMPT_CONFIG_SETTINGS?.use_modular_builder ? 'MODULAR BUILDER ATTIVO' : 'FALLBACK LEGACY'}
                        </span>
                     </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ paddingBottom: '50px' }}>
            <Link href="/admin/generazioni" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#bb86fc', textDecoration: 'none', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Torna a Tutte le Generazioni
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <Split size={32} color="#03dac6" />
                <div>
                   <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Diagnostic A/B Compare</h1>
                   <p style={{ color: '#888' }}>Confronta due stream generativi per analizzare l'impatto di nuove configurazioni.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {renderColumn(job1, m1, m2, true)}
                {renderColumn(job2, m2, m1, false)}
            </div>
        </div>
    );
}
