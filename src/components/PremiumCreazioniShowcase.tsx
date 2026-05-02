'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CreazioniNode } from '@/lib/getCreazioniData';
import { Image as ImageIcon, Sparkles, Wand2, Eye, Lock, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { Locale, dictionaries } from '@/lib/i18n/dictionaries';

interface Props {
  initialTree: CreazioniNode[];
  lang?: Locale;
}

export default function PremiumCreazioniShowcase({ initialTree, lang = 'en' }: Props) {
  const t = dictionaries[lang];
  
  // Find store covers
  const storeImages = useMemo(() => {
    const images: CreazioniNode[] = [];
    const traverse = (node: CreazioniNode) => {
      if (!node.isDirectory && node.name.toLowerCase().includes('negozio')) {
        images.push(node);
      }
      if (node.isDirectory) {
        node.children?.forEach(traverse);
      }
    };
    initialTree.forEach(traverse);
    return images;
  }, [initialTree]);

  // Parse leaf directories into a structured accordion: Category -> Leaf
  const accordionData = useMemo(() => {
    const data: Record<string, { path: string, name: string, node: CreazioniNode }[]> = {};
    
    const traverse = (node: CreazioniNode, currentPath: string[]) => {
      if (!node.isDirectory) return;
      
      const hasImages = node.children?.some(c => !c.isDirectory && !c.name.toLowerCase().includes('negozio'));
      const hasSubDirs = node.children?.some(c => c.isDirectory);
      
      if (hasImages && !hasSubDirs) {
        // Parse name from fullPath. E.g. "T-shirt > Clean Catalog > STILL LIFE PACK"
        // or just node.name if it's nested like "UGC" -> "MAN".
        const fullPath = [...currentPath, node.name];
        
        let category = 'Variations';
        let leafName = node.name;

        // Try to infer Category and Leaf from path
        // Example: ["TSHIRT", "T-shirt > Clean Catalog > STILL LIFE PACK"]
        // Let's analyze the node's name or its path string.
        let rawPathString = node.name; 
        if (node.name.includes('>')) {
            rawPathString = node.name;
        } else if (currentPath.length > 0) {
            // E.g. node.name is "MAN", parent is "T-shirt > UGC"
            const parentWithArrows = currentPath.find(p => p.includes('>'));
            if (parentWithArrows) {
                rawPathString = parentWithArrows + ' > ' + node.name;
            }
        }

        if (rawPathString.includes('>')) {
            const parts = rawPathString.split('>').map(p => p.trim());
            if (parts.length >= 3) {
                category = parts[parts.length - 2];
                leafName = parts[parts.length - 1];
            } else if (parts.length === 2) {
                category = parts[0];
                leafName = parts[1];
            }
        }

        if (!data[category]) {
            data[category] = [];
        }
        data[category].push({ path: fullPath.join('/'), name: leafName, node });

      } else {
        node.children?.forEach(c => traverse(c, [...currentPath, node.name]));
      }
    };

    initialTree.forEach(rootNode => traverse(rootNode, []));
    
    return data;
  }, [initialTree]);

  const categories = Object.keys(accordionData);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach(c => initial[c] = true); // Open all by default
    return initial;
  });

  // Select the very first leaf by default
  const firstLeaf = categories.length > 0 && accordionData[categories[0]].length > 0 ? accordionData[categories[0]][0] : null;
  const [selectedLeafPath, setSelectedLeafPath] = useState<string | null>(firstLeaf?.path || null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (firstLeaf && !selectedLeafPath) {
      setSelectedLeafPath(firstLeaf.path);
    }
  }, [firstLeaf, selectedLeafPath]);

  // Find active leaf to show images
  let activeLeaf: { path: string, name: string, node: CreazioniNode } | null = null;
  let activeCategoryName = '';
  for (const cat of categories) {
    const found = accordionData[cat].find(l => l.path === selectedLeafPath);
    if (found) {
        activeLeaf = found;
        activeCategoryName = cat;
        break;
    }
  }

  const galleryImages = activeLeaf ? activeLeaf.node.children?.filter(c => !c.isDirectory && !c.name.toLowerCase().includes('negozio')) || [] : [];

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div style={{ position: 'relative', zIndex: 10, width: '100%', fontFamily: 'Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .hero-store-cover {
          position: relative;
          width: 100%;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.5s ease;
          cursor: pointer;
        }
        .hero-store-cover:hover {
          border-color: #ff0ab3;
          box-shadow: 0 20px 60px rgba(255, 10, 179, 0.3);
        }
        .hero-store-cover::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%);
          pointer-events: none;
        }
        .acc-category {
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fff;
          font-weight: 600;
          transition: background 0.2s;
        }
        .acc-category:hover {
          background: rgba(255,255,255,0.05);
        }
        .acc-leaf {
          padding: 1rem 1.5rem 1rem 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          color: #aaa;
          font-weight: 500;
          font-size: 0.95rem;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          transition: all 0.2s;
          position: relative;
        }
        .acc-leaf:hover {
          background: rgba(255,255,255,0.03);
          color: #fff;
        }
        .acc-leaf.active {
          background: rgba(0, 255, 255, 0.08);
          color: #00ffff;
        }
        .acc-leaf.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #00ffff;
          box-shadow: 0 0 10px #00ffff;
        }
        .premium-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-gallery-card {
          border-radius: 16px;
          overflow: hidden;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          position: relative;
          aspect-ratio: 3/4;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .premium-gallery-card:hover .premium-gallery-img {
          transform: scale(1.08);
        }
      `}} />

      {/* Hero Store Covers */}
      {storeImages.length > 0 && (
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <Sparkles size={24} color="#ff0ab3" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{t.creazioniShowcase.scenariosTitle}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: storeImages.length > 1 ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr', gap: '3rem', maxWidth: storeImages.length > 1 ? '100%' : '800px', margin: '0 auto' }}>
            {storeImages.map(img => (
              <div key={img.path} className="hero-store-cover" onClick={() => setSelectedImage(img.path)}>
                <img src={img.path} alt={img.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', zIndex: 2 }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '2rem', fontWeight: 900, textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>{img.name.replace('.webp', '').replace('immagine negozio ', '').toUpperCase()}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', color: '#ccff00', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <Wand2 size={16} /> {t.creazioniShowcase.clickToEnlarge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar + Gallery Layout */}
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Accordion Sidebar */}
        <div style={{ 
          flex: '1 1 300px', 
          maxWidth: '400px',
          background: '#111', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#00ffff' }}>●</span> T-shirt
             </h3>
          </div>
          
          {categories.map(cat => (
            <div key={cat}>
              <div className="acc-category" onClick={() => toggleCategory(cat)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {openCategories[cat] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  {cat}
                </div>
                <div style={{ display: 'flex', gap: '8px', color: '#ff0ab3' }}>
                   <Eye size={16} />
                   <Lock size={16} />
                </div>
              </div>
              
              {openCategories[cat] && accordionData[cat].map(leaf => (
                <div 
                  key={leaf.path} 
                  className={`acc-leaf ${selectedLeafPath === leaf.path ? 'active' : ''}`}
                  onClick={() => setSelectedLeafPath(leaf.path)}
                >
                  {leaf.name}
                  <div style={{ display: 'flex', gap: '8px', color: selectedLeafPath === leaf.path ? '#00ffff' : '#ff0ab3', opacity: selectedLeafPath === leaf.path ? 1 : 0.7 }}>
                   {selectedLeafPath === leaf.path ? <Check size={16} /> : <Eye size={16} />}
                   <Lock size={16} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Gallery Area */}
        <div style={{ flex: '2 1 500px', minHeight: '400px' }}>
          {activeLeaf && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '1px' }}>
                  <span style={{ color: '#888' }}>{activeCategoryName} /</span> {activeLeaf.name}
                </h2>
              </div>
              
              {galleryImages.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {galleryImages.map(img => (
                    <div key={img.path} className="premium-gallery-card" onClick={() => setSelectedImage(img.path)}>
                      <img src={img.path} alt={img.name} className="premium-gallery-img" />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#888', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                   Nessuna immagine trovata in questa cartella.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out', backdropFilter: 'blur(10px)' }}
        >
          <img src={selectedImage} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }} />
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
            {t.creazioniShowcase.closeFullscreen}
          </div>
        </div>
      )}
    </div>
  );
}
