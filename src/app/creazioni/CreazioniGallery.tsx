'use client';

import React, { useState, useMemo } from 'react';
import { CreazioniNode } from './getCreazioniData';
import { ChevronRight, Folder, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface Props {
  initialTree: CreazioniNode[];
}

export default function CreazioniGallery({ initialTree }: Props) {
  const [currentPath, setCurrentPath] = useState<CreazioniNode[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // The current directory nodes we are viewing
  const currentNodes = useMemo(() => {
    if (currentPath.length === 0) return initialTree;
    return currentPath[currentPath.length - 1].children || [];
  }, [currentPath, initialTree]);

  // Find store images ("immagine negozio") in the current directory
  const storeImages = currentNodes.filter(n => !n.isDirectory && n.name.toLowerCase().includes('negozio'));
  
  // Find regular images
  const galleryImages = currentNodes.filter(n => !n.isDirectory && !n.name.toLowerCase().includes('negozio'));
  
  // Find subdirectories
  const directories = currentNodes.filter(n => n.isDirectory);

  const handleNavigate = (node: CreazioniNode) => {
    setCurrentPath([...currentPath, node]);
  };

  const handleGoBack = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={() => handleGoBack(-1)}
          style={{ background: 'none', border: 'none', color: currentPath.length === 0 ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {currentPath.length > 0 && <ArrowLeft size={16} />}
          Root
        </button>
        {currentPath.map((node, i) => (
          <React.Fragment key={node.path}>
            <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
            <button 
              onClick={() => handleGoBack(i)}
              style={{ background: 'none', border: 'none', color: i === currentPath.length - 1 ? '#00d2ff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1rem', fontWeight: i === currentPath.length - 1 ? 700 : 500 }}
            >
              {node.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Store Images Hero Section */}
      {storeImages.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Copertina Negozio</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {storeImages.map(img => (
              <div key={img.path} style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#111', cursor: 'pointer' }} onClick={() => setSelectedImage(img.path)}>
                <img src={img.path} alt={img.name} style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.3s' }} 
                     onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                     onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{img.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directories Grid */}
      {directories.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Esplora Categorie</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {directories.map(dir => (
              <div 
                key={dir.path} 
                onClick={() => handleNavigate(dir)}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = '#00d2ff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '12px', borderRadius: '12px', color: '#00d2ff' }}>
                  <Folder size={24} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>{dir.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {galleryImages.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Risultati Esempi</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {galleryImages.map(img => (
              <div key={img.path} style={{ borderRadius: '16px', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', aspectRatio: '3/4' }} onClick={() => setSelectedImage(img.path)}>
                <img src={img.path} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} 
                     onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                     onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {storeImages.length === 0 && directories.length === 0 && galleryImages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <ImageIcon size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem' }}>Nessun elemento trovato in questa cartella.</p>
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }}
        >
          <img src={selectedImage} alt="Fullscreen" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </div>
  );
}
