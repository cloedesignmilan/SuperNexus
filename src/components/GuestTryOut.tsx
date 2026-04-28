'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, Sparkles, AlertCircle, Lock, Camera, Image as ImageIcon, Box, Shirt, User, Star, X, Check, RefreshCw } from 'lucide-react';

const TAXONOMY_TREE: Record<string, Record<string, string[]>> = {
  'T-shirt': {
    'Clean Catalog': ['No Model', 'Still Life Pack'],
    'Model Studio': ['Model Photo', 'Curvy'],
    'Lifestyle': ['Model Photo', 'Candid Woman', 'Candid Man'],
    'UGC': ['Candid Woman', 'Candid Man', 'UGC Creator Pack'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  },
  'Dress': {
    'Clean Catalog': ['No Model'],
    'Model Studio': ['Model Photo', 'Curvy'],
    'Lifestyle': ['Model Photo', 'Candid Woman', 'Candid Man'],
    'UGC': ['Candid Woman', 'Candid Man'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  },
  'Swimwear': {
    'Clean Catalog': ['No Model'],
    'Model Studio': ['Model Photo', 'Curvy'],
    'Lifestyle': ['Model Photo'],
    'UGC': ['Candid Woman'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  },
  'Shoes': {
    'Clean Catalog': ['No Model'],
    'Model Studio': ['Model Photo', 'Curvy'],
    'Lifestyle': ['Model Photo', 'Candid Woman', 'Candid Man'],
    'UGC': ['Candid Woman', 'Candid Man'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  }
};

export default function GuestTryOut() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [trialUsesCount, setTrialUsesCount] = useState<number>(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  // Selection States
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check uses count on load
    const uses = parseInt(localStorage.getItem('supernexus_guest_uses') || '0', 10);
    setTrialUsesCount(uses);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
      setSelectedCat(null);
      setSelectedMode(null);
      setSelectedSubcat(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    if (trialUsesCount >= 2) {
      setError("Free Trial Exhausted");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/web/guest-upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      setUploadedImageUrl(uploadData.url);
      
      // Auto-detect to pre-select category
      const analyzeRes = await fetch('/api/web/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });
      const analyzeData = await analyzeRes.json();
      
      if (analyzeData.success && analyzeData.analysis) {
        const type = analyzeData.analysis.detectedProductType;
        if (type === 'swimwear') setSelectedCat('Swimwear');
        else if (type === 'ceremony_elegant' || type === 'women_clothing' || type === 'men_clothing') setSelectedCat('Dress');
        else if (type === 'shoes') setSelectedCat('Shoes');
        else setSelectedCat('T-shirt');
      }

    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
      setPreviewUrl(null);
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImageUrl || !selectedCat || !selectedMode || !selectedSubcat) return;
    setIsGenerating(true);
    setError(null);
    setResultUrls([]);

    try {
      const genRes = await fetch('/api/web/guest-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
          taxonomyCat: selectedCat,
          taxonomyMode: selectedMode,
          taxonomySubcat: selectedSubcat
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || 'Generation failed');

      if (genData.results && genData.results.length > 0) {
        const urls = genData.results.map((r: any) => r.url);
        setResultUrls(urls);
        const newCount = trialUsesCount + 1;
        localStorage.setItem('supernexus_guest_uses', newCount.toString());
        setTrialUsesCount(newCount);
      } else {
        throw new Error('No results generated.');
      }

    } catch (err: any) {
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForNextTrial = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrls([]);
    setUploadedImageUrl(null);
    setSelectedCat(null);
    setSelectedMode(null);
    setSelectedSubcat(null);
  };

  const isConfigComplete = selectedCat && selectedMode && selectedSubcat;

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
        Upload a raw photo and choose any style from our full taxonomy. Generate up to 2 times for free (3 images each).
      </p>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255, 50, 50, 0.1)', color: '#ff6b6b', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {trialUsesCount >= 2 && resultUrls.length === 0 && !isGenerating && (
        <div style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '600px', width: '100%' }}>
          <Lock size={48} color="#ccff00" style={{ margin: '0 auto 1.5rem auto' }} />
          <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem' }}>Free Trial Exhausted</h4>
          <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1.1rem' }}>You have reached the maximum limit of 2 free generations on this device. Create an account to unlock unlimited access, higher resolution, and commercial rights.</p>
          <a href="/auth" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#ccff00', color: '#000', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontSize: '1.1rem' }}>
            Register for Full Access
          </a>
        </div>
      )}

      {/* Upload Zone */}
      {resultUrls.length === 0 && trialUsesCount < 2 && (
        <div style={{ width: '100%', maxWidth: '900px' }}>
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(204, 255, 0, 0.3)',
                borderRadius: '16px',
                padding: '5rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(204, 255, 0, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <Upload size={48} color="#ccff00" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 600 }}>Click or Drag to Upload</p>
              <p style={{ color: '#666', fontSize: '1rem', marginTop: '0.5rem' }}>JPEG or PNG, max 5MB</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png" 
                style={{ display: 'none' }} 
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Left side: Image Preview */}
                <div style={{ flex: '1 1 300px', maxWidth: '400px', height: '450px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {isAnalyzing && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', color: '#ccff00'
                    }}>
                      <Loader2 size={48} className="animate-spin" style={{ marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 600 }}>Uploading & Analyzing...</p>
                    </div>
                  )}

                  {!uploadedImageUrl && !isAnalyzing && (
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setPreviewUrl(null); setFile(null); }} style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                      <button onClick={handleUploadAndAnalyze} style={{ flex: 2, padding: '0.8rem', background: '#ccff00', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Start Configuration</button>
                    </div>
                  )}
                </div>

                {/* Right side: Taxonomy UI */}
                {uploadedImageUrl && (
                  <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Category Selection */}
                    <div>
                      <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>1. Select Category</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {Object.keys(TAXONOMY_TREE).map(cat => (
                          <button
                            key={cat}
                            onClick={() => { setSelectedCat(cat); setSelectedMode(null); setSelectedSubcat(null); }}
                            style={{
                              padding: '0.8rem 1.2rem',
                              background: selectedCat === cat ? '#ccff00' : 'rgba(255,255,255,0.05)',
                              color: selectedCat === cat ? '#000' : '#fff',
                              border: '1px solid',
                              borderColor: selectedCat === cat ? '#ccff00' : 'rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              transition: 'all 0.2s'
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mode Selection */}
                    {selectedCat && (
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>2. Select Presentation Mode</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {Object.keys(TAXONOMY_TREE[selectedCat]).map(mode => (
                            <button
                              key={mode}
                              onClick={() => { setSelectedMode(mode); setSelectedSubcat(null); }}
                              style={{
                                padding: '0.8rem 1.2rem',
                                background: selectedMode === mode ? '#fff' : 'rgba(255,255,255,0.05)',
                                color: selectedMode === mode ? '#000' : '#fff',
                                border: '1px solid',
                                borderColor: selectedMode === mode ? '#fff' : 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                              }}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subcat Selection */}
                    {selectedCat && selectedMode && (
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>3. Select Shot Type</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {TAXONOMY_TREE[selectedCat][selectedMode].map(subcat => (
                            <button
                              key={subcat}
                              onClick={() => setSelectedSubcat(subcat)}
                              style={{
                                padding: '0.8rem 1.2rem',
                                background: selectedSubcat === subcat ? 'rgba(204,255,0,0.2)' : 'rgba(255,255,255,0.05)',
                                color: selectedSubcat === subcat ? '#ccff00' : '#aaa',
                                border: '1px solid',
                                borderColor: selectedSubcat === subcat ? '#ccff00' : 'rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                              }}
                            >
                              {subcat}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        onClick={handleGenerate}
                        disabled={!isConfigComplete || isGenerating}
                        style={{
                          width: '100%',
                          padding: '1.2rem',
                          background: isConfigComplete ? '#ccff00' : 'rgba(255,255,255,0.1)',
                          color: isConfigComplete ? '#000' : '#666',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isConfigComplete && !isGenerating ? 'pointer' : 'not-allowed',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.8rem',
                          transition: 'all 0.3s'
                        }}
                      >
                        {isGenerating ? (
                          <><Loader2 className="animate-spin" /> Generating Magic...</>
                        ) : (
                          <><Sparkles /> Generate 3 Images (Trial {trialUsesCount + 1}/2)</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Zone */}
      {resultUrls.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            color: '#ccff00', fontWeight: 700, fontSize: '1.5rem', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <Sparkles /> {resultUrls.length} Images Generated Successfully!
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1200px' }}>
            {resultUrls.map((url, idx) => (
              <div 
                key={idx}
                className="protected-result-container result-container-animated"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  position: 'relative', borderRadius: '24px', overflow: 'hidden',
                  userSelect: 'none', WebkitUserSelect: 'none', opacity: 0,
                  animationDelay: `${idx * 0.2}s`
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Result ${idx + 1}`} style={{ width: '100%', display: 'block', pointerEvents: 'none' }} draggable={false} />
                <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(204,255,0,0.2)', borderRadius: '24px', pointerEvents: 'none' }} />
                
                {/* Elegant Watermark */}
                <div style={{
                  position: 'absolute', 
                  bottom: '16px', 
                  right: '16px', 
                  background: 'rgba(0,0,0,0.5)', 
                  backdropFilter: 'blur(8px)', 
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '6px 12px', 
                  borderRadius: '12px', 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  letterSpacing: '1px', 
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <Sparkles size={12} color="#ccff00" /> SUPERNEXUS AI
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '3rem', borderRadius: '24px', width: '100%', maxWidth: '800px' }}>
            {trialUsesCount < 2 ? (
              <>
                <h4 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>You have 1 free trial remaining!</h4>
                <button onClick={resetForNextTrial} style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <RefreshCw size={20} /> Try Another Style
                </button>
              </>
            ) : (
              <>
                <h4 style={{ color: '#ccff00', fontSize: '1.8rem', marginBottom: '1rem' }}>Impressed by the results?</h4>
                <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1.1rem' }}>You have used both of your free trials. Sign up to generate without watermarks, unlock 4K resolution, and access our API.</p>
                <a href="/auth" style={{ display: 'inline-block', padding: '1.2rem 3rem', background: '#ccff00', color: '#000', fontWeight: 700, fontSize: '1.2rem', borderRadius: '12px', textDecoration: 'none' }}>
                  Create Account
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
