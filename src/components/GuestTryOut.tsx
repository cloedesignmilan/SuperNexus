'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, Sparkles, AlertCircle, Lock, Camera, Image as ImageIcon, Box, Shirt, User, Star, X } from 'lucide-react';

export default function GuestTryOut() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [taxonomyOptions, setTaxonomyOptions] = useState<any[] | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if the user has already used the trial on this device
    const used = localStorage.getItem('supernexus_guest_used');
    if (used) {
      setHasUsedTrial(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const mapDetectedToTaxonomy = (analysis: any) => {
    const type = analysis.detectedProductType;
    let options = [];

    if (type === 'swimwear') {
      options = [
        { title: 'Lifestyle Model', icon: <ImageIcon size={36} color="#ccff00" strokeWidth={1.5} />, cat: 'Swimwear', mode: 'Lifestyle', subcat: 'Candid Photo' },
        { title: 'Clean Catalog', icon: <Box size={36} color="#ccff00" strokeWidth={1.5} />, cat: 'Swimwear', mode: 'Clean Catalog', subcat: 'No Model' }
      ];
    } else if (type === 'ceremony_elegant' || type === 'women_clothing') {
      options = [
        { title: 'Model Studio', icon: <Star size={36} color="#ccff00" strokeWidth={1.5} />, cat: 'Dress', mode: 'Model Studio', subcat: 'Model Photo' },
        { title: 'High-End Event', icon: <Camera size={36} color="#ccff00" strokeWidth={1.5} />, cat: 'Dress', mode: 'Lifestyle', subcat: 'Model Photo' }
      ];
    } else if (type === 'shoes') {
      options = [
        { title: 'On Model', icon: <User size={36} color="#ccff00" strokeWidth={1.5} />, cat: 'Shoes', mode: 'Model Studio', subcat: 'Model Photo' },
        { title: 'Clean Catalog', icon: <Box size={36} color="#ccff00" strokeWidth={1.5} />, cat: 'Shoes', mode: 'Clean Catalog', subcat: 'No Model' }
      ];
    } else {
      // Default fallback (T-Shirt/Hoodie/Men Clothing)
      options = [
        { title: 'On Model', icon: <User size={36} color="#ccff00" strokeWidth={1.5} />, cat: 'T-shirt', mode: 'Model Studio', subcat: 'Model Photo' },
        { title: 'Ghost Mannequin', icon: <Shirt size={36} color="#ccff00" strokeWidth={1.5} />, cat: 'T-shirt', mode: 'Clean Catalog', subcat: 'No Model' }
      ];
    }

    setDetectedCategory(type);
    return options;
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    if (hasUsedTrial) {
      setError("Hai già utilizzato la prova gratuita su questo dispositivo.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // 1. Upload to guest storage
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/web/guest-upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload fallito');

      const imageUrl = uploadData.url;
      setUploadedImageUrl(imageUrl);

      // 2. Analyze the product to auto-route
      const analyzeRes = await fetch('/api/web/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const analyzeData = await analyzeRes.json();
      let options = mapDetectedToTaxonomy({ detectedProductType: 'tshirt_hoodie' });
      
      if (analyzeData.success && analyzeData.analysis) {
        options = mapDetectedToTaxonomy(analyzeData.analysis);
      }

      setTaxonomyOptions(options);

    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante l'analisi.");
      setPreviewUrl(null);
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectOption = async (option: any) => {
    if (!uploadedImageUrl) return;
    setIsGenerating(true);
    setTaxonomyOptions(null);
    setError(null);

    try {
      // 3. Generate image
      const genRes = await fetch('/api/web/guest-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
          taxonomyCat: option.cat,
          taxonomyMode: option.mode,
          taxonomySubcat: option.subcat
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || 'Generazione fallita');

      if (genData.results && genData.results.length > 0) {
        setResultUrl(genData.results[0].url);
        localStorage.setItem('supernexus_guest_used', 'true');
        setHasUsedTrial(true);
      } else {
        throw new Error('Nessun risultato generato.');
      }

    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante la generazione.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="guest-try-out" style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(180deg, #111111 0%, #050505 100%)',
      borderRadius: '24px',
      border: '1px solid rgba(204,255,0,0.1)',
      marginTop: '2rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    }}>
      <h3 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
        Experience the Magic.
      </h3>
      <p style={{ color: '#aaaaaa', textAlign: 'center', maxWidth: '600px', marginBottom: '3rem', fontSize: '1.1rem' }}>
        Upload a raw photo and let our AI automatically detect the category and generate a premium lifestyle shot. No sign-up required for your first try.
      </p>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255, 50, 50, 0.1)', color: '#ff6b6b', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {hasUsedTrial && !resultUrl && !isGenerating && (
        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Lock size={40} color="#ccff00" style={{ margin: '0 auto 1rem auto' }} />
          <h4 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Free Trial Exhausted</h4>
          <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>You have already used your free generation on this device.</p>
          <a href="/auth" style={{ display: 'inline-block', padding: '1rem 2rem', background: '#ccff00', color: '#000', fontWeight: 700, borderRadius: '8px', textDecoration: 'none' }}>
            Register for Full Access
          </a>
        </div>
      )}

      {/* Upload Zone */}
      {!resultUrl && !hasUsedTrial && (
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(204, 255, 0, 0.3)',
                borderRadius: '16px',
                padding: '4rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(204, 255, 0, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <Upload size={48} color="#ccff00" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>Click or Drag to Upload</p>
              <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>JPEG or PNG, max 5MB</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png" 
                style={{ display: 'none' }} 
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {(isAnalyzing || isGenerating) && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ccff00'
                  }}>
                    <Loader2 size={48} className="animate-spin" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>
                      {isAnalyzing ? 'AI is analyzing product...' : 'AI is generating magic...'}
                    </p>
                    {isGenerating && detectedCategory && <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>Auto-detected: {detectedCategory}</p>}
                  </div>
                )}
              </div>
              
              {!isGenerating && !isAnalyzing && !taxonomyOptions && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => { setPreviewUrl(null); setFile(null); }}
                    style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <X size={20} /> Cancel
                  </button>
                  <button 
                    onClick={handleUploadAndAnalyze}
                    style={{ flex: 2, padding: '1rem', background: '#ccff00', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Sparkles size={20} /> Analyze & Start
                  </button>
                </div>
              )}

              {taxonomyOptions && !isGenerating && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <h4 style={{ color: '#fff', textAlign: 'center', margin: 0 }}>Choose your Vibe:</h4>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {taxonomyOptions.map((opt, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        style={{ 
                          flex: 1, 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(204,255,0,0.2)',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(204,255,0,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{opt.icon}</div>
                        <h5 style={{ color: '#ccff00', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{opt.title}</h5>
                        <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0 }}>{opt.cat} / {opt.mode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Result Zone (Anti-Screenshot/Anti-Download Protected) */}
      {resultUrl && (
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            color: '#ccff00', 
            fontWeight: 700, 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles /> Result Generated Successfully!
          </div>
          
          <div 
            className="protected-result-container result-container-animated"
            onContextMenu={(e) => e.preventDefault()}
            style={{
              width: '100%',
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              opacity: 0, // start invisible for animation
            }}
          >
            {/* The Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={resultUrl} 
              alt="Generated Result" 
              style={{
                width: '100%',
                display: 'block',
                pointerEvents: 'none', // Prevents drag and drop
              }}
              draggable={false}
            />

            {/* Glassmorphism gradient border effect */}
            <div style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid rgba(204,255,0,0.3)',
              borderRadius: '24px',
              pointerEvents: 'none',
              zIndex: 20
            }} />
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#aaa', marginBottom: '1rem' }}>Impressed? Sign up to generate without watermarks, choose your categories, and access the full API.</p>
            <a href="/auth" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#ccff00', color: '#000', fontWeight: 700, fontSize: '1.2rem', borderRadius: '12px', textDecoration: 'none' }}>
              Create Account
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
