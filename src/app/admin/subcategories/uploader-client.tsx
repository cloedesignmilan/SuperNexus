"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadReferenceImage, deleteReferenceImage } from "./actions";

type RefImage = {
  id: string;
  image_url: string;
  storage_path: string | null;
};

export function UploaderBase({ subcategoryId, images }: { subcategoryId: string, images: RefImage[] }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    if (images.length >= 10) {
      alert("Massimo 10 reference consentite. Rimuovine qualcuna per aggiungerne di nuove.");
      return;
    }

    setIsUploading(true);
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subcategory_id", subcategoryId);

    try {
      await uploadReferenceImage(formData);
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

  return (
    <div>
      <div className="reference-grid">
        {images.map((img) => (
          <div key={img.id} className="ref-item">
            <Image 
              src={img.image_url} 
              alt="Reference" 
              fill 
              unoptimized 
            />
            <div className="ref-overlay">
              <button 
                onClick={() => handleDelete(img.id, img.storage_path)}
                className="btn-delete"
                title="Elimina"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        ))}
        
        {images.length < 10 && (
          <label className="ref-item upload-box" style={isUploading ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
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
            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} disabled={isUploading} />
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
