'use client';

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AssetsClientGrid({ categories, shots }: { categories: any[], shots: any[] }) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.slug || '');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Selected asset config state to know what we are uploading for
  const [pendingUpload, setPendingUpload] = useState<any>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUpload) return;

    setUploadingId(pendingUpload.id);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', pendingUpload.type);
      formData.append('categorySlug', pendingUpload.categorySlug);
      formData.append('modeName', pendingUpload.modeName || '');
      formData.append('subName', pendingUpload.subName || '');
      if (pendingUpload.specificShotNumber) {
        formData.append('specificShotNumber', pendingUpload.specificShotNumber.toString());
      }
      if (pendingUpload.clientGender) {
        formData.append('clientGender', pendingUpload.clientGender);
      }

      const res = await fetch('/api/admin/upload-button-cover', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        router.refresh(); // Reload data from DB
      } else {
        const err = await res.json();
        alert('Errore caricamento: ' + err.error);
      }
    } catch (err: any) {
      alert('Errore caricamento: ' + err.message);
    } finally {
      setUploadingId(null);
      setPendingUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteUrl = async (config: any) => {
    const newUrl = window.prompt("Incolla qui l'URL della nuova immagine di copertina:");
    if (!newUrl) return;

    setUploadingId(config.id);
    try {
      const res = await fetch('/api/admin/update-button-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.type,
          categorySlug: config.categorySlug,
          modeName: config.modeName || '',
          subName: config.subName || '',
          imageUrl: newUrl,
          clientGender: config.clientGender || '',
          specificShotNumber: config.specificShotNumber
        })
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert('Errore salvataggio URL: ' + err.error);
      }
    } catch (err: any) {
      alert('Errore salvataggio URL: ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const currentCategory = categories.find(c => c.slug === activeCategory);

  if (!currentCategory) return <div>Nessuna macrocategoria trovata.</div>;

  // Filter shots for this category
  const catShots = shots.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());

  // Component to render an individual asset card
  const AssetCard = ({ title, subtitle, imageUrl, config }: { title: string, subtitle: string, imageUrl: string | null, config: any }) => {
    const isUploading = uploadingId === config.id;
    return (
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', background: '#1c1c1e', borderRadius: '16px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ aspectRatio: '1/1', position: 'relative', background: 'var(--color-bg)' }}>
          {imageUrl ? (
            <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              <ImageIcon size={32} opacity={0.3} />
            </div>
          )}

          {isUploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d2ff', fontWeight: 'bold' }}>
              Caricamento...
            </div>
          )}
        </div>
        
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{title}</h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{subtitle}</p>
          
          <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => handlePasteUrl(config)}
              disabled={isUploading}
              style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem' }}
            >
              <LinkIcon size={14} /> URL
            </button>
            <button 
              onClick={() => { setPendingUpload(config); fileInputRef.current?.click(); }}
              disabled={isUploading}
              style={{ flex: 1, padding: '8px', background: 'rgba(0,210,255,0.1)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600 }}
            >
              <Upload size={14} /> Carica
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} />

      {/* Tabs Macrocategorie */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button 
            key={c.slug} 
            onClick={() => setActiveCategory(c.slug)}
            style={{ 
              padding: '0.6rem 1.2rem', borderRadius: '20px', 
              background: activeCategory === c.slug ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', 
              color: activeCategory === c.slug ? '#0f172a' : 'var(--color-text-muted)', 
              fontSize: '0.85rem', fontWeight: activeCategory === c.slug ? 700 : 500, border: 'none', cursor: 'pointer' 
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {currentCategory.business_modes.map((bm: any) => {
          
          // Trova tutti gli shot associati a questo Business Mode per tutte le Sottocategorie
          let modeNorm = bm.name.toLowerCase();
          if (modeNorm.includes('ads') || modeNorm.includes('scroll stopper')) modeNorm = 'ads';
          else if (modeNorm.includes('detail') || modeNorm.includes('texture')) modeNorm = 'detail';
          else modeNorm = modeNorm.replace(/\s+/g, '-');

          const modeShots = catShots.filter(s => s.mode === modeNorm || (modeNorm === 'ugc' && (s.mode === 'ugc-home' || s.mode === 'ugc-store')));

          return (
            <div key={bm.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, color: '#00d2ff', fontSize: '1.5rem', fontWeight: 800 }}>{bm.name}</h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Business Mode (Livello 1)</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Il pulsante del Business Mode stesso */}
                <AssetCard 
                  title={bm.name} 
                  subtitle="Cover Categoria" 
                  imageUrl={bm.cover_image} 
                  config={{
                    id: `bm-${bm.id}`,
                    type: 'IMAGE_TYPE',
                    categorySlug: activeCategory,
                    modeName: bm.name
                  }} 
                />
              </div>

              {bm.subcategories.length > 0 && (
                <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'white', margin: '0 0 1.5rem 0' }}>Sottocategorie (Livello 2) & Shot Specifici (Livello 3)</h3>
                  
                  {bm.subcategories.map((sub: any) => {
                    
                    // Trova gli shot per questa sottocategoria
                    let basePres = sub.name.toLowerCase().trim();
                    let expectedMode = modeNorm; // Default to the parent mode

                    if (basePres.includes('ugc in home')) { basePres = 'candid'; expectedMode = 'ugc-home'; }
                    else if (basePres.includes('ugc in store')) { basePres = 'candid'; expectedMode = 'ugc-store'; }
                    else if (basePres.includes('candid')) basePres = 'candid';
                    else if (basePres === 'model photo') basePres = 'model-photo';
                    else if (basePres.includes('curvy') || basePres.includes('plus-size')) basePres = 'curvy';
                    else if (basePres.includes('still life')) basePres = 'still-life-pack';
                    else if (basePres.includes('ugc creator')) basePres = 'ugc-creator-pack';
                    else if (basePres === 'no model') basePres = 'no-model';
                    else basePres = basePres.replace(/\s+/g, '-');

                    // Filter shots that match BOTH the expected mode and presentation base
                    const subShots = modeShots.filter(s => {
                      if (expectedMode !== modeNorm && s.mode !== expectedMode) return false;
                      const sBase = s.presentation.replace(/-woman|-man/, '');
                      return sBase === basePres || s.presentation.includes(basePres);
                    });

                    // Group by gender
                    const womanShots = subShots.filter(s => s.presentation.endsWith('-woman') || (!s.presentation.endsWith('-man') && !s.presentation.endsWith('-woman')));
                    const manShots = subShots.filter(s => s.presentation.endsWith('-man'));

                    return (
                      <div key={sub.id} style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ width: '8px', height: '8px', background: '#e62ebf', borderRadius: '50%' }}></div>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{sub.name}</h4>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                          {/* Il pulsante della Subcategory stessa */}
                          <AssetCard 
                            title={sub.name} 
                            subtitle="Cover Sottocategoria" 
                            imageUrl={sub.preview_image} 
                            config={{
                              id: `sub-${sub.id}`,
                              type: 'MODEL_OPTION',
                              categorySlug: activeCategory,
                              modeName: bm.name,
                              subName: sub.name
                            }} 
                          />
                        </div>

                        {/* WOMAN SHOTS */}
                        {womanShots.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Specific Shots (Woman / Default)</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                              {womanShots.slice(0, 5).map(shot => (
                                <AssetCard 
                                  key={shot.id}
                                  title={shot.shotName || `Shot ${shot.shotNumber}`} 
                                  subtitle={`Shot Specifico ${shot.shotNumber}`} 
                                  imageUrl={shot.imageUrl} 
                                  config={{
                                    id: `shot-${shot.id}`,
                                    type: 'SPECIFIC_SHOT',
                                    categorySlug: activeCategory,
                                    modeName: bm.name,
                                    subName: sub.name,
                                    clientGender: 'Woman',
                                    specificShotNumber: shot.shotNumber
                                  }} 
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* MAN SHOTS */}
                        {manShots.length > 0 && (
                          <div style={{ marginTop: '1.5rem' }}>
                            <h5 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Specific Shots (Man)</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                              {manShots.slice(0, 5).map(shot => (
                                <AssetCard 
                                  key={shot.id}
                                  title={shot.shotName || `Shot ${shot.shotNumber}`} 
                                  subtitle={`Shot Specifico ${shot.shotNumber}`} 
                                  imageUrl={shot.imageUrl} 
                                  config={{
                                    id: `shot-${shot.id}`,
                                    type: 'SPECIFIC_SHOT',
                                    categorySlug: activeCategory,
                                    modeName: bm.name,
                                    subName: sub.name,
                                    clientGender: 'Man',
                                    specificShotNumber: shot.shotNumber
                                  }} 
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
