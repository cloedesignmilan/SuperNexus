"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, CheckCircle, Sparkles, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface GalleryClientProps {
  jobId: string;
  originalImage: string;
  generatedImages: any[];
  styleName: string;
  categoryName: string;
}

export default function GalleryClient({ jobId, originalImage, generatedImages, styleName, categoryName }: GalleryClientProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleDownload = async (url: string, id: string) => {
    setDownloading(id);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `supernexus-ai-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Error downloading image:", e);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#fff', paddingBottom: '6rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 50, 
        backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)', 
        padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', cursor: 'pointer' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a0a0a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SuperNexus AI
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#a0a0a0' }}>
              <CheckCircle size={16} color="#00f0ff" />
              <span className="hide-mobile">Ready to use</span>
            </div>
            <a href="/" style={{ padding: '0.5rem 1.25rem', borderRadius: '99px', backgroundColor: '#fff', color: '#000', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
              Generate More
            </a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
        
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', backgroundColor: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)', color: '#00f0ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>Premium Output</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
            Your New <br/>
            <span style={{ background: 'linear-gradient(90deg, #00f0ff, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
               AI Product Campaign
            </span>
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            High-converting imagery generated specifically for {categoryName} using our {styleName} style.
          </p>
        </div>

        {/* Gallery Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Sidebar: Original Image */}
          <div style={{ flex: '1 1 300px', maxWidth: '100%' }}>
            <div style={{ position: 'sticky', top: '100px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontWeight: 500, marginBottom: '1rem' }}>
                <ImageIcon size={18} />
                Original Photo
              </div>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Image 
                  src={originalImage} 
                  alt="Original Product" 
                  fill 
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#a0a0a0' }}>Category</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{categoryName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#a0a0a0' }}>Style</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{styleName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#a0a0a0' }}>Photos</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{generatedImages.length}</span>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(0,240,255,0.8)', lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: '#00f0ff', fontWeight: 600 }}>Note:</strong> These images will only be available for a few hours. Please use the free download option if you wish to keep them.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content: Masonry/Grid of Generated Images */}
          <div style={{ flex: '3 1 600px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {generatedImages.map((img) => (
                <div 
                  key={img.id} 
                  style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    const overlay = e.currentTarget.querySelector('.img-overlay') as HTMLElement;
                    if(overlay) overlay.style.opacity = '1';
                    const innerImg = e.currentTarget.querySelector('img');
                    if(innerImg) innerImg.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    const overlay = e.currentTarget.querySelector('.img-overlay') as HTMLElement;
                    if(overlay) overlay.style.opacity = '0';
                    const innerImg = e.currentTarget.querySelector('img');
                    if(innerImg) innerImg.style.transform = 'scale(1)';
                  }}
                >
                  <Image 
                    src={img.image_url} 
                    alt="AI Generated" 
                    fill 
                    style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                  
                  {/* Overlay */}
                  <div 
                    className="img-overlay"
                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%)', opacity: 0, transition: 'opacity 0.3s ease', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button 
                        onClick={() => setFullscreenImage(img.image_url)}
                        style={{ fontSize: '0.85rem', fontWeight: 500, color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        View Full
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(img.image_url, img.id); }}
                        disabled={downloading === img.id}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: downloading === img.id ? 'default' : 'pointer', opacity: downloading === img.id ? 0.5 : 1 }}
                      >
                        {downloading === img.id ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Download size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setFullscreenImage(null)}
        >
           <button 
             onClick={() => setFullscreenImage(null)}
             style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 110 }}
           >
             <X size={24} />
           </button>
           <div 
             style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '90vh', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
             onClick={(e) => e.stopPropagation()}
           >
              <Image 
                src={fullscreenImage} 
                alt="Fullscreen Preview" 
                fill 
                style={{ objectFit: 'contain' }}
              />
           </div>
        </div>
      )}

    </div>
  );
}
