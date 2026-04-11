import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory, toggleCategoryStatus, updateCategory } from "./actions";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: 'asc' },
    include: {
      _count: {
        select: { subcategories: true }
      }
    }
  });

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Macrocategorie</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Classificazioni primarie del catalogo (es. Donna, Uomo, Cerimonia).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
        
        {/* Form Categoria */}
        <div>
          <div className="admin-card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>Nuovo Nodo</h2>
            <form action={createCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Identificativo Globale</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="Es. Donna, Uomo, Scarpe"
                  className="input-glass"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Brief Descrizione</label>
                <textarea 
                  name="description" 
                  rows={3}
                  className="input-glass"
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>
              <button type="submit" className="btn-primary btn-action-purple" style={{ marginTop: '0.5rem' }}>
                Crea Macrocategoria
              </button>
            </form>
          </div>
        </div>

        {/* Lista Categorie */}
        <div>
          <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="glass-table">
              <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                <tr>
                  <th>Identificativo</th>
                  <th>Figli</th>
                  <th>Rete</th>
                  <th style={{ textAlign: 'right' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      Nessun nodo registrato. Inizia creandolo da sinistra.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat: any) => (
                    <tr key={cat.id}>
                      <td>
                        <details style={{ background: 'transparent' }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 700, outline: 'none' }}>
                            {cat.name} ✏️
                          </summary>
                          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                             <form action={updateCategory.bind(null, cat.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                               <input type="text" name="name" defaultValue={cat.name} required className="input-glass" />
                               <textarea name="description" defaultValue={cat.description || ''} className="input-glass" rows={2}></textarea>
                               <button type="submit" className="btn-action-amber" style={{ padding: '0.3rem', fontSize: '0.7rem' }}>Salva Modifiche</button>
                             </form>
                          </div>
                        </details>
                        {cat.description && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{cat.description}</div>}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {cat._count.subcategories} refs
                      </td>
                      <td>
                        <form action={toggleCategoryStatus.bind(null, cat.id, cat.is_active)}>
                          <button type="submit" className={`badge ${cat.is_active ? 'badge-online' : 'badge-offline'}`} style={{ cursor: 'pointer' }}>
                            {cat.is_active ? 'Online' : 'Offline'}
                          </button>
                        </form>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <form action={deleteCategory.bind(null, cat.id)}>
                          <button 
                            type="submit" 
                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                          >
                            Purge
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
