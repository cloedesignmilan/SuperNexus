import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory, toggleCategoryStatus, updateCategory } from "./actions";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: 'asc' },
    include: {
      _count: {
        select: { business_modes: true }
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
          <div className="glass-card" style={{ position: 'sticky', top: '2rem', padding: '1.5rem', background: '#1c1c1e', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Cover Image URL (Opzionale)</label>
                <input 
                  type="text" 
                  name="cover_image" 
                  placeholder="/images/example.jpg"
                  className="input-glass"
                />
              </div>
              <button type="submit" style={{ marginTop: '0.5rem', background: '#D4AF37', color: '#1c1c1e', padding: '0.75rem', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Crea Macrocategoria
              </button>
            </form>
          </div>
        </div>

        {/* Lista Categorie Visuale */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
          {categories.length === 0 ? (
            <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
              Nessun nodo registrato. Inizia creandolo dal form di lato.
            </div>
          ) : (
            categories.map((cat: any) => (
              <div key={cat.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#1c1c1e', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                {/* Cover Image */}
                <div style={{ height: '140px', background: 'var(--color-bg)', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {cat.cover_image ? (
                    <img src={cat.cover_image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '2rem' }}>
                      🖼️
                    </div>
                  )}
                  {/* Badge Stato Overlay */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <form action={toggleCategoryStatus.bind(null, cat.id, cat.is_active)}>
                      <button type="submit" className={`badge ${cat.is_active ? 'badge-online' : 'badge-offline'}`} style={{ cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        {cat.is_active ? 'Online' : 'Offline'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'white' }}>{cat.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    {cat._count.business_modes} Categorie
                  </div>
                  
                  {cat.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cat.description}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
                    {/* Pulsante Modifica a tendina */}
                    <details style={{ flex: 1, position: 'relative' }}>
                      <summary style={{ display: 'block', textAlign: 'center', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', listStyle: 'none', background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)', fontWeight: 600 }}>
                        ✏️ Edit
                      </summary>
                      <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, width: '250px', background: '#1c1c1e', padding: '1.25rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 10, border: '1px solid rgba(212,175,55,0.2)' }}>
                        <form action={updateCategory.bind(null, cat.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input type="text" name="name" defaultValue={cat.name} required className="input-glass" />
                          <input type="text" name="cover_image" defaultValue={cat.cover_image || ''} placeholder="URL Immagine" className="input-glass" />
                          <textarea name="description" defaultValue={cat.description || ''} className="input-glass" rows={3}></textarea>
                          <button type="submit" style={{ padding: '0.75rem', fontSize: '0.75rem', background: '#D4AF37', color: '#1c1c1e', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>Salva</button>
                        </form>
                      </div>
                    </details>
                    
                    <form action={deleteCategory.bind(null, cat.id)} style={{ flex: 1 }}>
                      <button type="submit" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600 }}>
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
