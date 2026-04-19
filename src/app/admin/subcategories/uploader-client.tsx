"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadReferenceImage, deleteReferenceImage, reorderReferenceImages } from "./actions";

type RefImage = {
  id: string;
  image_url: string;
  storage_path: string | null;
};

export function UploaderBase({ subcategoryId, images }: { subcategoryId: string, images: RefImage[] }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const maxFiles = 10 - images.length;
    if (maxFiles <= 0) {
      alert("Massimo 10 reference consentite. Rimuovine qualcuna per aggiungerne di nuove.");
      return;
    }
    
    // Select only up to maxFiles
    const filesToUpload = Array.from(e.target.files).slice(0, maxFiles);

    setIsUploading(true);
    
    try {
      const uploadPromises = filesToUpload.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subcategory_id", subcategoryId);
        return uploadReferenceImage(formData);
      });
      await Promise.all(uploadPromises);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (imgId: string, storagePath: string | null) => {
    if (!confirm("Sicuro di voler rimuovere questa reference?")) return;
    try {
      await deleteReferenceImage(imgId, storagePath || '');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMove = async (index: number, direction: 'left' | 'right') => {
    if (isReordering) return;
    
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    setIsReordering(true);
    try {
      const newIds = [...images.map(img => img.id)];
      // Swap elements
      [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
      
      await reorderReferenceImages(subcategoryId, newIds);
    } catch (err: any) {
      alert("Errore durante il riordinamento: " + err.message);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div>
      <div className="reference-grid">
        {images.map((img, idx) => (
          <div key={img.id} className="ref-item" style={isReordering ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
            <Image 
              src={img.image_url} 
              alt="Reference" 
              fill 
              unoptimized 
            />
            <div className="ref-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {idx > 0 && (
                <button 
                  onClick={() => handleMove(idx, 'left')}
                  className="btn-delete"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                  title="Sposta a Sinistra"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
              )}
              
              <button 
                onClick={() => handleDelete(img.id, img.storage_path)}
                className="btn-delete"
                title="Elimina"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>

              {idx < images.length - 1 && (
                <button 
                  onClick={() => handleMove(idx, 'right')}
                  className="btn-delete"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                  title="Sposta a Destra"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              )}
            </div>
          </div>
        ))}
        
        {images.length < 10 && (
          <label className="ref-item upload-box" style={(isUploading || isReordering) ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
            {isUploading ? (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--color-secondary)', animation: 'spin 1s linear infinite' }}></div>
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" color="#a1a1aa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </div>
            )}
            <span className="upload-box-text">
              {isUploading ? "Uploading..." : "Aggiungi"}
            </span>
            <input type="file" style={{ display: 'none' }} accept="image/*" multiple onChange={handleFileChange} disabled={isUploading || isReordering} />
          </label>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
