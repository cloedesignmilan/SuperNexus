'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CreazioniNode } from '@/lib/getCreazioniData';
import { Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { Locale, dictionaries } from '@/lib/i18n/dictionaries';

interface Props {
  initialTree: CreazioniNode[];
  lang?: Locale;
}

export default function PremiumCreazioniShowcase({ initialTree, lang = 'en' }: Props) {
  const t = dictionaries[lang];
  
  // Flatten tree to find leaf directories (directories that only contain images, or just all directories with images)
  const leafDirs = useMemo(() => {
    const leaves: { name: string; node: CreazioniNode; path: string }[] = [];
    
    const traverse = (node: CreazioniNode, currentPath: string[]) => {
      if (!node.isDirectory) return;
      
      const hasImages = node.children?.some(c => !c.isDirectory && !c.name.toLowerCase().includes('negozio'));
      const hasSubDirs = node.children?.some(c => c.isDirectory);
      
      if (hasImages && !hasSubDirs) {
        // Clean up name logic
        let cleanName = node.name;
        const fullPath = [...currentPath, node.name].join(' > ');
        
        if (fullPath.includes('Model Studio > Model Photo')) {
          cleanName = 'Studio Model';
        } else if (fullPath.includes('Lifestyle > Model Photo')) {
          cleanName = 'Lifestyle Model';
        } else if (fullPath.includes('Clean Catalog > NO MODEL')) {
          cleanName = 'Clean Catalog';
        } else if (fullPath.includes('UGC > MAN')) {
          cleanName = 'UGC Man';
        } else if (fullPath.includes('UGC > WOMAN')) {
          cleanName = 'UGC Woman';
        } else {
          // generic cleanup
          cleanName = cleanName.includes('>') ? cleanName.split('>').pop()?.trim() || cleanName : cleanName;
        }

        leaves.push({ name: cleanName, node, path: fullPath });
      } else {
        node.children?.forEach(c => traverse(c, [...currentPath, node.name]));
      }
    };

    initialTree.forEach(rootNode => traverse(rootNode, []));
    
    return leaves;
  }, [initialTree]);

  const [selectedLeafPath, setSelectedLeafPath] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Set first leaf as default if available
  useEffect(() => {
    if (leafDirs.length > 0 && !selectedLeafPath) {
      setSelectedLeafPath(leafDirs[0].path);
    }
  }, [leafDirs, selectedLeafPath]);

  // Find store covers (any image with 'negozio' anywhere in the tree under the current selection or globally)
  // To keep it simple and consistent with previous behavior, let's find the store images from the root or currently selected macro category.
  // Actually, previously it showed store images from `currentNodes`. If we are flattened, we should show store images globally.
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

  const activeLeaf = leafDirs.find(l => l.path === selectedLeafPath);
  const galleryImages = activeLeaf ? activeLeaf.node.children?.filter(c => !c.isDirectory && !c.name.toLowerCase().includes('negozio')) || [] : [];

  return (
    <div style={{ position: 'relative', zIndex: 10, width: '100%', fontFamily: 'Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .premium-nav-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.6rem 1.2rem;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .premium-nav-pill:hover {
          background: rgba(204, 255, 0, 0.1);
          border-color: #ccff00;
          color: #ccff00;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(204, 255, 0, 0.2);
        }
        .premium-icon-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px;
          padding: 8px 20px 8px 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .premium-icon-btn:hover {
          background: rgba(0, 255, 255, 0.08);
          border-color: #00ffff;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 255, 255, 0.15);
        }
        .premium-dir-icon-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
        }
        .premium-icon-btn:hover .premium-dir-icon-small {
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
        }
        .premium-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-gallery-card:hover .premium-gallery-img {
          transform: scale(1.08);
        }
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
      `}} />

      {/* Nav Breadcrumbs has been replaced by horizontal tabs for leaves */}

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

      {/* Tabs / Directory Icons */}
      {leafDirs.length > 0 && (
        <div style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', maxWidth: '1000px' }}>
            {leafDirs.map(leaf => {
              const isActive = leaf.path === selectedLeafPath;
              return (
                <div 
                  key={leaf.path} 
                  className="premium-icon-btn" 
                  onClick={() => setSelectedLeafPath(leaf.path)}
                  style={{ 
                    borderColor: isActive ? '#00ffff' : 'rgba(255,255,255,0.08)',
                    background: isActive ? 'rgba(0, 255, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                    boxShadow: isActive ? '0 5px 15px rgba(0, 255, 255, 0.15)' : 'none'
                  }}
                >
                  <div className="premium-dir-icon-small" style={{
                    background: isActive ? 'linear-gradient(135deg, #00ffff 0%, #0088ff 100%)' : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? '0 0 10px rgba(0, 255, 255, 0.4)' : 'none',
                    color: isActive ? '#000' : '#fff'
                  }}>
                    <Sparkles size={18} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isActive ? '#00ffff' : '#eaeaea', letterSpacing: '0.5px' }}>
                    {leaf.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Images Grid */}
      {galleryImages.length > 0 && (
        <div style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <ImageIcon size={24} color="#ccff00" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{activeLeaf?.name} {t.creazioniShowcase.resultsTitle}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {galleryImages.map(img => (
              <div key={img.path} className="premium-gallery-card" onClick={() => setSelectedImage(img.path)} style={{ borderRadius: '20px', overflow: 'hidden', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <img src={img.path} alt={img.name} className="premium-gallery-img" />
              </div>
            ))}
          </div>
        </div>
      )}

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
