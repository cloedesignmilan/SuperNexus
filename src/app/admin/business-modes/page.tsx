import { prisma } from "@/lib/prisma";
import { createBusinessMode, deleteBusinessMode, toggleBusinessModeStatus, updateBusinessMode } from "./actions";

export const dynamic = 'force-dynamic';

export default async function BusinessModesPage() {
  const modes = await prisma.businessMode.findMany({
    orderBy: { sort_order: 'asc' },
    include: {
      category: true,
      _count: {
        select: { subcategories: true }
      }
    }
  });

  const categories = await prisma.category.findMany({
    orderBy: { sort_order: 'asc' }
  });

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Business Modes</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Gestione dei contesti di business (es. Boutique, Brand eCommerce, Negozio Vetrina).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
        
        {/* Form Creazione */}
        <div>
          <div className="admin-card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>Nuovo Modello</h2>
            <form action={createBusinessMode} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Macro Categoria Parent</label>
                <select name="category_id" required className="input-glass" style={{ width: '100%' }}>
                   <option value="">Seleziona...</option>
                   {categories.map(c => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                   ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Nome Modello D'uso</label>
                <input type="text" name="name" required placeholder="Es. T-Shirt Brand, Luxury Boutique" className="input-glass" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Brief Descrizione</label>
                <textarea name="description" rows={3} className="input-glass" style={{ resize: 'vertical' }}></textarea>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Cover Image URL</label>
                <input type="text" name="cover_image" placeholder="/images/example.jpg" className="input-glass" />
              </div>

              <button type="submit" className="btn-primary btn-action-purple" style={{ marginTop: '0.5rem' }}>
                Crea Modello
              </button>
            </form>
          </div>
        </div>

        {/* Lista Visuale a Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
          {modes.length === 0 ? (
            <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
              Nessun Business Mode registrato. Inizia creandolo dal form di lato.
            </div>
          ) : (
            modes.map((mode: any) => (
              <div key={mode.id} className="admin-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Image Cover */}
                <div style={{ height: '140px', background: 'var(--color-bg)', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {mode.cover_image ? (
                    <img src={mode.cover_image} alt={mode.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '2rem' }}>
                      💼
                    </div>
                  )}
                  {/* Badge Stato */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <form action={toggleBusinessModeStatus.bind(null, mode.id, mode.is_active)}>
                      <button type="submit" className={`badge ${mode.is_active ? 'badge-online' : 'badge-offline'}`} style={{ cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        {mode.is_active ? 'Online' : 'Offline'}
                      </button>
                    </form>
                  </div>
                  {/* Badge Parent */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                     {mode.category.name}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--color-text)' }}>{mode.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    {mode._count.subcategories} Variazioni Stile (Subcat)
                  </div>
                  
                  {mode.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {mode.description}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
                    
                    {/* Pulsante Modifica tendina */}
                    <details style={{ flex: 1, position: 'relative' }}>
                      <summary className="btn-action-amber" style={{ display: 'block', textAlign: 'center', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', listStyle: 'none' }}>
                        ✏️ Edit
                      </summary>
                      <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, width: '250px', background: '#1e293b', padding: '1rem', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <form action={updateBusinessMode.bind(null, mode.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <select name="category_id" required className="input-glass" defaultValue={mode.category_id}>
                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <input type="text" name="name" defaultValue={mode.name} required className="input-glass" />
                          <input type="text" name="cover_image" defaultValue={mode.cover_image || ''} placeholder="URL Immagine" className="input-glass" />
                          <textarea name="description" defaultValue={mode.description || ''} className="input-glass" rows={3}></textarea>
                          <button type="submit" className="btn-action-emerald" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>Salva</button>
                        </form>
                      </div>
                    </details>
                    
                    {/* Eliminate */}
                    <form action={deleteBusinessMode.bind(null, mode.id)} style={{ flex: 1 }}>
                      <button type="submit" className="btn-action-amber" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        🗑️ Delete
                      </button>
                    </form>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
