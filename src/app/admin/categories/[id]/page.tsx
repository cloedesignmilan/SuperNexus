import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateCategory } from "../actions";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CategoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const category = await prisma.category.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!category) {
    return notFound();
  }

  return (
    <div>
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/categories" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '1.5rem' }}>
          ←
        </Link>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>{category.name}</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Impostazioni e Regole Globali della Macrocategoria</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
        
        <div className="glass-card" style={{ padding: '2rem', background: '#1c1c1e', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <form action={updateCategory.bind(null, category.id)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Nome Categoria</label>
                  <input type="text" name="name" defaultValue={category.name} required className="input-glass" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>URL Immagine Copertina</label>
                  <input type="text" name="cover_image" defaultValue={category.cover_image || ''} className="input-glass" style={{ width: '100%' }} />
                </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Descrizione</label>
              <textarea name="description" defaultValue={category.description || ''} className="input-glass" rows={2} style={{ width: '100%' }}></textarea>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '1rem 0' }}></div>

            <div>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#00d2ff', fontSize: '1.25rem' }}>🧠 Regole Globali AI Engine</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Queste regole verranno applicate a <strong>tutte</strong> le generazioni (Clean, Lifestyle, UGC, ecc.) all'interno di questa categoria. Usa questo spazio per definire il "Core System" (es. per le magliette: niente pieghe, stiro perfetto).</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Global Positive Prompt (System Lock)</label>
              <textarea name="global_positive_prompt" defaultValue={category.global_positive_prompt || ''} className="input-glass" rows={5} style={{ width: '100%', fontFamily: 'monospace' }} placeholder="Es. [T-SHIRT FABRIC RULE: The t-shirt MUST look perfectly ironed, smooth...]"></textarea>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Global Negative Prompt</label>
              <textarea name="global_negative_prompt" defaultValue={category.global_negative_prompt || ''} className="input-glass" rows={3} style={{ width: '100%', fontFamily: 'monospace' }} placeholder="Es. wrinkles, heavy creases, messy fabric, crumpled, unironed"></textarea>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Global Hard Rules (Strict Instructions)</label>
              <textarea name="global_hard_rules" defaultValue={category.global_hard_rules || ''} className="input-glass" rows={3} style={{ width: '100%', fontFamily: 'monospace' }} placeholder="Es. YOU MUST MAINTAIN PERFECT ANATOMY..."></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" style={{ background: '#00d2ff', color: '#1c1c1e', padding: '1rem 2rem', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>
                    Salva Impostazioni
                </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
