import { prisma } from "@/lib/prisma";
import { createSubcategory, deleteSubcategory, toggleSubcategoryStatus, updateSubcategory } from "./actions";
import { UploaderBase } from "./uploader-client";
import { AnalyzeButton } from "./analyze-btn";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SubcategoriesPage() {
  const modes = await prisma.businessMode.findMany({
    orderBy: { sort_order: 'asc' },
    include: { category: true }
  });

  const subcats = await prisma.subcategory.findMany({
    orderBy: [{ business_mode_id: 'asc' }, { sort_order: 'asc' }],
    include: {
      business_mode: { include: { category: true } },
      reference_images: { orderBy: { image_order: 'asc' } },
      prompt_settings: true,
      validation_checks: { orderBy: { last_checked_at: 'desc' }, take: 1 }
    }
  });

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Sottocategorie (Variazioni)</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Gestione dei Look finali e validazione del sistema fotografico.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
        
        {/* Form Creazione */}
        <div>
          <div className="admin-card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>Nuovo Stile</h2>
            <form action={createSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Business Mode Appartenenza</label>
                <select name="business_mode_id" required className="input-glass" style={{ width: '100%' }}>
                  <option value="">Seleziona...</option>
                  {modes.map(m => <option key={m.id} value={m.id}>[{m.category.name}] {m.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Nome Variazione</label>
                <input type="text" name="name" required placeholder="Es. Mannequin, Flat Lay..." className="input-glass" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Preview Image URL</label>
                <input type="text" name="preview_image" placeholder="/images/preview.jpg" className="input-glass" />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Style Type</label>
                  <input type="text" name="style_type" placeholder="Es. retail, casual..." className="input-glass" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Output Goal</label>
                  <input type="text" name="output_goal" placeholder="Es. ecommerce..." className="input-glass" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Business Context</label>
                <input type="text" name="business_context" placeholder="Es. boutique-women" className="input-glass" />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--color-secondary)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                Inizializza Stile
              </button>
            </form>
          </div>
        </div>

        {/* Griglia Sottocategorie */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
          {subcats.length === 0 ? (
            <div className="admin-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
              Nessuno stile d'addestramento trovato.
            </div>
          ) : (
            subcats.map((sub: any) => {
              const latestCheck = sub.validation_checks?.[0];
              const statusColor = latestCheck?.comparison_status === 'match' ? '#10b981' : latestCheck?.comparison_status === 'incorrect' ? '#ef4444' : latestCheck?.comparison_status === 'partial' ? '#f59e0b' : 'gray';

              return (
              <div key={sub.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Copertina Principale */}
                <div style={{ height: '180px', background: 'var(--color-bg)', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {sub.preview_image ? (
                    <img src={sub.preview_image} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '2rem' }}>
                      📸
                    </div>
                  )}
                  {/* Badge Status Validation */}
                  {latestCheck && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '20px', border: \`1px solid \${statusColor}\`, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }}></span>
                      {latestCheck.comparison_status}
                    </div>
                  )}
                  {/* Online Badge */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <form action={toggleSubcategoryStatus.bind(null, sub.id, sub.is_active)}>
                      <button type="submit" className={`badge ${sub.is_active ? 'badge-online' : 'badge-offline'}`} style={{ cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        {sub.is_active ? 'Online' : 'Offline'}
                      </button>
                    </form>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Breadcrumb Hierarchy */}
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                    {sub.business_mode.category.name} / {sub.business_mode.name}
                  </div>
                  
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>{sub.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     {sub.style_type && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>Style: {sub.style_type}</span>}
                     {sub.output_goal && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>Goal: {sub.output_goal}</span>}
                  </div>

                  {/* Azioni Rapide a Scomparsa */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <details style={{ flex: 1, position: 'relative' }}>
                      <summary className="btn-action-amber" style={{ display: 'block', textAlign: 'center', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', listStyle: 'none' }}>
                        ✏️ Edit Rapido
                      </summary>
                      <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, width: '280px', background: '#1e293b', padding: '1rem', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <form action={updateSubcategory.bind(null, sub.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <select name="business_mode_id" required className="input-glass" defaultValue={sub.business_mode_id}>
                             {modes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                          <input type="text" name="name" defaultValue={sub.name} required className="input-glass" />
                          <input type="text" name="preview_image" defaultValue={sub.preview_image || ''} placeholder="URL Immagine Preview" className="input-glass" />
                          <input type="text" name="style_type" defaultValue={sub.style_type || ''} placeholder="Style Type" className="input-glass" />
                          <button type="submit" className="btn-action-emerald" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>Salva</button>
                        </form>
                      </div>
                    </details>
                    <form action={deleteSubcategory.bind(null, sub.id)} style={{ flex: 1 }}>
                      <button type="submit" className="btn-action-amber" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        🗑️ Delete
                      </button>
                    </form>
                  </div>
                  
                  {/* Tasto Dettaglio Output Check & Reference */}
                  <div style={{ marginTop: '0.75rem' }}>
                     <Link href={`/admin/subcategories/${sub.id}`} className="btn-primary" style={{ width: '100%', textAlign: 'center', fontSize: '0.8rem', padding: '0.6rem' }}>
                        Apri Dettaglio & Output Check
                     </Link>
                  </div>

                </div>
              </div>
            )})}
          )}
        </div>
      </div>
    </div>
  );
}
