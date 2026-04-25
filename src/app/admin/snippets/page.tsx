import { prisma } from "@/lib/prisma";
import { createSnippet, deleteSnippet, toggleSnippetStatus, updateSnippet } from "./actions";

export const dynamic = 'force-dynamic';

export default async function SnippetsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedParams = await searchParams;
  const filterType = resolvedParams.type;

  const whereClause = filterType ? { snippet_type: filterType } : {};

  const snippets = await prisma.promptSnippet.findMany({
    where: whereClause,
    orderBy: [
      { snippet_type: 'asc' },
      { priority_order: 'asc' }
    ]
  });

  const snippetTypes = [
    'CLIENT_TYPE', 'IMAGE_GOAL', 'IMAGE_TYPE', 'PRODUCT_TYPE', 'MODEL_OPTION', 'SCENE', 'FORMAT', 'QUANTITY'
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Mattoncini Prompt</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Gestione dei frammenti dinamici per il God Mode dell'App 2.0.</p>
      </div>

      {/* FILTRI */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <a href="?" style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: !filterType ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: !filterType ? '#0f172a' : 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: !filterType ? 600 : 400 }}>Tutti</a>
        {snippetTypes.map(t => (
          <a key={t} href={`?type=\${t}`} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: filterType === t ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: filterType === t ? '#0f172a' : 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: filterType === t ? 600 : 400 }}>
            {t}
          </a>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
        
        {/* Form Creazione */}
        <div>
          <div className="admin-card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>Nuovo Mattoncino</h2>
            <form action={createSnippet as any} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Tipo Step</label>
                    <select name="snippet_type" required className="input-glass" style={{ width: '100%' }}>
                      {snippetTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Gruppo Ordinamento</label>
                    <select name="sort_group" required className="input-glass" style={{ width: '100%' }}>
                      <option value="Recommended">Recommended</option>
                      <option value="Ecommerce">Ecommerce</option>
                      <option value="Social">Social</option>
                      <option value="Premium">Premium</option>
                      <option value="Other styles">Other styles</option>
                    </select>
                  </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Etichetta UI (Label)</label>
                <input type="text" name="label" required placeholder="Es. Ecommerce Clean" className="input-glass" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Frammento di Prompt (Positivo)</label>
                <textarea name="prompt_fragment" rows={3} placeholder="clean background, 8k, professional studio lighting" className="input-glass" style={{ resize: 'vertical' }}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Frammento Negativo (Opzionale)</label>
                <input type="text" name="negative_fragment" placeholder="messy background, lifestyle" className="input-glass" />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Intensità</label>
                    <select name="intensity_level" required className="input-glass" style={{ width: '100%' }}>
                      <option value="soft">Soft</option>
                      <option value="medium">Medium</option>
                      <option value="strong">Strong</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Ordine (Priority)</label>
                    <input type="number" name="priority_order" defaultValue="0" className="input-glass" />
                  </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input type="checkbox" name="is_recommended" value="true" id="is_recommended" />
                  <label htmlFor="is_recommended" style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>Segna come "Consigliato" (Stella)</label>
              </div>

              <button type="submit" className="btn-primary btn-action-purple" style={{ marginTop: '1rem' }}>
                Crea Snippet
              </button>
            </form>
          </div>
        </div>

        {/* Lista Visuale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {snippets.length === 0 ? (
            <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              Nessun Mattoncino trovato in questa categoria.
            </div>
          ) : (
            snippets.map((snip: any) => (
              <div key={snip.id} className="admin-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: `4px solid \${snip.is_active ? 'var(--color-primary)' : '#475569'}` }}>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', background: '#334155', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>{snip.snippet_type}</span>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: snip.is_active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                              {snip.label} {snip.is_recommended && '⭐'}
                          </h3>
                      </div>
                      <form action={toggleSnippetStatus.bind(null, snip.id, snip.is_active)}>
                          <button type="submit" className={`badge \${snip.is_active ? 'badge-online' : 'badge-offline'}`} style={{ cursor: 'pointer' }}>
                          {snip.is_active ? 'Online' : 'Offline'}
                          </button>
                      </form>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      <span>Gruppo: <b>{snip.sort_group}</b></span>
                      <span>Intensità: <b>{snip.intensity_level}</b></span>
                      <span>Ordine: <b>{snip.priority_order}</b></span>
                  </div>

                  {snip.prompt_fragment && (
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#10b981', marginBottom: '0.25rem' }}>
                          + {snip.prompt_fragment}
                      </div>
                  )}
                  {snip.negative_fragment && (
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#ef4444' }}>
                          - {snip.negative_fragment}
                      </div>
                  )}

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Delete Button */}
                  <form action={deleteSnippet.bind(null, snip.id)}>
                    <button type="submit" className="btn-action-amber" style={{ padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                      🗑️
                    </button>
                  </form>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
