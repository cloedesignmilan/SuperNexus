import { prisma } from "@/lib/prisma";
import { createSubcategory, deleteSubcategory, toggleSubcategoryStatus } from "./actions";
import { UploaderBase } from "./uploader-client";
import { AnalyzeButton } from "./analyze-btn";

export default async function SubcategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: 'asc' },
    where: { is_active: true }
  });

  const subcats = await prisma.subcategory.findMany({
    orderBy: [{ category_id: 'asc' }, { sort_order: 'asc' }],
    include: {
      category: true,
      reference_images: { orderBy: { image_order: 'asc' } },
      prompt_settings: true
    }
  });

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Reference Styles</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Addestra l'AI fornendo i campioni visivi esatti per il look desiderato.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
        {/* Form Creazione */}
        <div>
          <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>Nuovo Look (Sub-cat)</h2>
            <form action={createSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Macrocategoria Padre</label>
                <select name="category_id" required className="input-glass" style={{ cursor: 'pointer' }}>
                  <option value="" style={{ color: 'var(--color-text-muted)' }}>Seleziona nodo...</option>
                  {categories.map(c => <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Identificativo Stile</label>
                <input type="text" name="name" required placeholder="Es. Cyberpunk Night" className="input-glass" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Brief Direttiva (Opzionale)</label>
                <textarea name="visual_direction_notes" rows={3} placeholder="Es. Luci al neon, notte..." className="input-glass" style={{ resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--color-secondary)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                Inizializza Stile
              </button>
            </form>
          </div>
        </div>

        {/* Griglia Sottocategorie */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {subcats.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              Nessuno stile d'addestramento trovato.
            </div>
          ) : (
            subcats.map((sub) => (
              <div key={sub.id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--color-card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      {sub.category.name}
                    </span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{sub.name}</h3>
                    {sub.visual_direction_notes && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{sub.visual_direction_notes}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <form action={toggleSubcategoryStatus.bind(null, sub.id, sub.is_active)}>
                      <button type="submit" className={`badge ${sub.is_active ? 'badge-online' : 'badge-offline'}`} style={{ cursor: 'pointer' }}>
                        {sub.is_active ? 'Online' : 'Offline'}
                      </button>
                    </form>
                    <form action={deleteSubcategory.bind(null, sub.id)}>
                      <button type="submit" className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
                        Purge
                      </button>
                    </form>
                  </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--color-secondary)' }}>◩</span> Reference Visive ({sub.reference_images.length}/10)
                    </h4>
                  </div>
                  
                  <UploaderBase subcategoryId={sub.id} images={sub.reference_images} />
                  
                  {sub.reference_images.length > 0 && !sub.prompt_settings?.base_prompt_prefix && (
                     <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 500 }}>⚠️ Array generativo non addestrato.</span>
                       <AnalyzeButton subcategoryId={sub.id} />
                     </div>
                  )}
                  {sub.prompt_settings?.base_prompt_prefix && (
                     <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }}></div> 
                             Modello Addestrato
                          </span>
                       </div>
                       <p style={{ fontSize: '0.8rem', color: 'rgba(52,211,153,0.8)', fontStyle: 'italic', borderLeft: '2px solid rgba(52,211,153,0.5)', paddingLeft: '0.5rem', margin: 0, lineHeight: 1.5 }}>
                         "{sub.prompt_settings.base_prompt_prefix.substring(0, 150)}..."
                       </p>
                     </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
