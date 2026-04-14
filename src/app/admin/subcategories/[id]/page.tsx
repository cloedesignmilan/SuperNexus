import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UploaderBase } from "../uploader-client";
import { AnalyzeButton } from "../analyze-btn";

export const dynamic = 'force-dynamic';

export default async function SubcategoryDetailPage({ params }: { params: { id: string } }) {
  const subcat = await prisma.subcategory.findUnique({
    where: { id: params.id },
    include: {
      business_mode: { include: { category: true } },
      reference_images: { orderBy: { image_order: 'asc' } },
      prompt_settings: true,
      validation_checks: { orderBy: { last_checked_at: 'desc' }, include: { subcategory: true } }
    }
  });

  if (!subcat) return <div>Sottocategoria non trovata.</div>;

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Header Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          <Link href="/admin/subcategories" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Sottocategorie</Link> / {subcat.business_mode.name} / {subcat.name}
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {subcat.name}
          <span className={`badge ${subcat.is_active ? 'badge-online' : 'badge-offline'}`} style={{ fontSize: '0.9rem' }}>
            {subcat.is_active ? 'Active' : 'Inactive'}
          </span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Dettaglio completo, galleria Reference e controllo Output Gemini.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
        
        {/* Sinistra: Configurazione e Stato AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
             {subcat.preview_image ? (
                <img src={subcat.preview_image} alt="Preview" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
             ) : (
                <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>Manca Immagine Preview</div>
             )}
             <div style={{ padding: '1.5rem' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Configurazione Parametrica</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                 <div>
                   <strong style={{ color: 'var(--color-text-muted)', display: 'block' }}>Style Type:</strong>
                   {subcat.style_type || '-'}
                 </div>
                 <div>
                   <strong style={{ color: 'var(--color-text-muted)', display: 'block' }}>Output Goal:</strong>
                   {subcat.output_goal || '-'}
                 </div>
                 <div>
                   <strong style={{ color: 'var(--color-text-muted)', display: 'block' }}>Business Context:</strong>
                   {subcat.business_context || '-'}
                 </div>
                 <div>
                   <strong style={{ color: 'var(--color-text-muted)', display: 'block' }}>Max Images Allowed:</strong>
                   {subcat.max_images_allowed}
                 </div>
               </div>
             </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Semaforo Addestramento AI</h3>
            {subcat.reference_images.length > 0 && !subcat.prompt_settings?.base_prompt_prefix && (
                <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 500 }}>⚠️ Array generativo non addestrato.</span>
                  <AnalyzeButton subcategoryId={subcat.id} />
                </div>
            )}
            {subcat.prompt_settings?.base_prompt_prefix && (
                <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }}></div> 
                        Modulo Master Prompt Attivo
                      </span>
                      <AnalyzeButton subcategoryId={subcat.id} isUpdate={true} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(52,211,153,0.8)', fontStyle: 'italic', borderLeft: '2px solid rgba(52,211,153,0.5)', paddingLeft: '0.5rem', margin: '0.5rem 0 0 0', lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto' }}>
                    "{subcat.prompt_settings.base_prompt_prefix}"
                  </p>
                </div>
            )}
          </div>

        </div>

        {/* Destra: Reference e Expected Output Module */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="admin-card">
             <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span style={{ color: 'var(--color-primary)' }}>◩</span> Reference Images Gallery ({subcat.reference_images.length})
             </h2>
             <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 1.5rem 0' }}>La IA analizzerà queste foto per generare il Master Prompt.</p>
             <UploaderBase subcategoryId={subcat.id} images={subcat.reference_images} />
          </div>

          <div className="admin-card" style={{ border: '1px solid var(--color-primary)' }}>
             <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               💣 Expected Output Check
             </h2>
             <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1.5rem 0' }}>
               Confronto diretto Side-By-Side tra Input Reference e Output Generato. L'unico strumento per confermare la qualità AI.
             </p>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {subcat.validation_checks.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                   Nessun Check Log presente sulla rete.
                 </div>
               ) : (
                 subcat.validation_checks.map(check => {
                    const statusColor = check.comparison_status === 'match' ? '#10b981' : check.comparison_status === 'incorrect' ? '#ef4444' : check.comparison_status === 'partial' ? '#f59e0b' : 'gray';
                    return (
                     <div key={check.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                       <div style={{ display: 'flex' }}>
                         {/* Split Compare Side-by-Side */}
                         <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                           <div style={{ fontSize: '0.65rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target (Reference)</div>
                           <div style={{ height: '200px' }}>
                             <img src={check.reference_image_url} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                           </div>
                         </div>
                         <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '0.65rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Output (Generato)</div>
                           <div style={{ height: '200px' }}>
                             <img src={check.generated_sample_image} alt="Generated" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                           </div>
                         </div>
                       </div>
                       
                       {/* Box Risultato */}
                       <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                         <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Review Notes</div>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>
                              "{check.review_notes || "Nessuna nota aggiunta."}"
                            </p>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                              Verificato il: {new Date(check.last_checked_at).toLocaleString()}
                            </div>
                         </div>
                         <div style={{ background: \`\${statusColor}22\`, border: \`1px solid \${statusColor}\`, color: statusColor, padding: '0.5rem 1.5rem', borderRadius: '30px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'center' }}>
                            {check.comparison_status}
                         </div>
                       </div>
                     </div>
                    );
                 })
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
