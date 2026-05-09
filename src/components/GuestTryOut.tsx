'use client';

import React, { useState, useRef, useEffect } from 'react';
import { dictionaries, Locale } from '@/lib/i18n/dictionaries';
import { Upload, Loader2, Sparkles, AlertCircle, Lock, Camera, Image as ImageIcon, Box, Shirt, User, Star, X, Check, RefreshCw, Waves, Footprints, MonitorPlay, Smartphone, Search, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CAT_ICONS: Record<string, React.ElementType> = {
  'T-shirt': Shirt,
  'Everyday': Shirt,
  'Dress': Star,
  'Swimwear': Waves,
  'Shoes': Footprints
};

const MODE_ICONS: Record<string, React.ElementType> = {
  'Clean Catalog': Sparkles,
  'Model Studio': Camera,
  'Lifestyle': Users,
  'UGC': Smartphone,
  'Ads': MonitorPlay,
  'Detail': Search
};

const TAXONOMY_TREE: Record<string, Record<string, string[]>> = {
  'T-shirt': {
    'Clean Catalog': ['No Model', 'Still Life Pack'],
    'Model Studio': ['Model Photo'],
    'Lifestyle': ['Model Photo', 'Candid Real Woman', 'Candid Real Man'],
    'UGC': ['Candid Real Woman', 'Candid Real Man', 'UGC Creator Pack'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  },
  'Everyday': {
    'Clean Catalog': ['No Model'],
    'Model Studio': ['Model Photo'],
    'Lifestyle': ['Model Photo', 'Candid Real Woman', 'Candid Real Man'],
    'UGC': ['Candid Real Woman', 'Candid Real Man'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  },
  'Dress': {
    'Clean Catalog': ['No Model'],
    'Model Studio': ['Model Photo'],
    'Lifestyle': ['Model Photo', 'Candid Real Woman', 'Candid Real Man'],
    'UGC': ['Candid Real Woman', 'Candid Real Man'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  },
  'Swimwear': {
    'Clean Catalog': ['No Model'],
    'Model Studio': ['Model Photo'],
    'Lifestyle': ['Model Photo'],
    'UGC': ['Candid Real Woman'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  },
  'Shoes': {
    'Clean Catalog': ['No Model'],
    'Model Studio': ['Model Photo'],
    'Lifestyle': ['Model Photo', 'Candid Real Woman', 'Candid Real Man'],
    'UGC': ['Candid Real Woman', 'Candid Real Man'],
    'Ads': ['Model Photo', 'No Model'],
    'Detail': ['Model Photo', 'No Model']
  }
};

export default function GuestTryOut({ lang = 'en' }: { lang?: Locale }) {
  const t = dictionaries[lang].guestTryOut;
  const [file, setFile] = useState<File | null>(null);
  
  const tCat = (cat: string) => {
    if (lang === 'en') return cat;
    const itCats: Record<string, string> = { 'T-shirt': 'T-shirt', 'Dress': 'Abiti', 'Swimwear': 'Costumi', 'Shoes': 'Scarpe' };
    return itCats[cat] || cat;
  };
  const tMode = (mode: string) => {
    if (lang === 'en') return mode;
    const itModes: Record<string, string> = { 'Clean Catalog': 'Catalogo Pulito', 'Model Studio': 'Modello Studio', 'Lifestyle': 'Lifestyle', 'UGC': 'UGC', 'Ads': 'Pubblicità / Ads', 'Detail': 'Dettagli' };
    return itModes[mode] || mode;
  };
  const tSub = (sub: string) => {
    if (lang === 'en') return sub;
    const itSubs: Record<string, string> = { 'No Model': 'Senza Modello', 'Still Life Pack': 'Still Life Pack', 'Model Photo': 'Foto Modello', 'Candid Real Woman': 'Donna Reale (Candid)', 'Candid Real Man': 'Uomo Reale (Candid)', 'UGC Creator Pack': 'UGC Creator Pack' };
    return itSubs[sub] || sub;
  };
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [trialUsesCount, setTrialUsesCount] = useState<number>(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  // Email Lead States
  const [email, setEmail] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  
  // Selection States
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check uses count on load
    const uses = parseInt(localStorage.getItem('supernexus_guest_uses') || '0', 10);
    setTrialUsesCount(uses);
    
    // Check if email was already provided via Supabase Session or localStorage
    const checkSession = async () => {
      if (localStorage.getItem('supernexus_guest_email_submitted') === 'true') {
        setIsEmailSubmitted(true);
        return;
      }
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsEmailSubmitted(true);
      }
    };
    checkSession();
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

  const handleGoogleLogin = async () => {
    setIsSubmittingEmail(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/?login=success`,
        },
      });

      if (error) {
        setError(error.message);
        setIsSubmittingEmail(false);
      }
    } catch (err: any) {
      setError("Connection error. Please try again.");
      setIsSubmittingEmail(false);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    if (trialUsesCount >= 1) {
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
        else if (type === 'ceremony_elegant') setSelectedCat('Dress');
        else if (type === 'women_clothing' || type === 'men_clothing') setSelectedCat('Everyday');
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
      if (!genRes.ok) {
        if (genRes.status === 403 || genData.error === 'IP_LIMIT_REACHED') {
          localStorage.setItem('supernexus_guest_uses', '1');
          setTrialUsesCount(1);
          throw new Error('IP Limit Reached. Free trials exhausted on this connection.');
        }
        throw new Error(genData.error || 'Generation failed');
      }

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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes borderSpin {
          100% { transform: rotate(360deg); }
        }
        .wow-border-card {
          position: relative;
          background: rgba(255,255,255,0.02);
          border-radius: 18px;
          text-align: center;
          overflow: hidden;
          padding: 2px;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .wow-border-card::before {
          content: "";
          position: absolute;
          top: -50%; left: -50%; right: -50%; bottom: -50%;
          background: conic-gradient(transparent, transparent, transparent, #ccff00);
          animation: borderSpin 3s linear infinite;
        }
        .wow-border-inner {
          position: relative;
          background: #0f0f0f;
          border-radius: 16px;
          padding: 3rem 2rem;
          height: 100%;
          z-index: 1;
        }
        @media (max-width: 768px) {
          .guest-try-out {
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 3rem 1rem !important;
          }
        }
      `}} />
      <div id="guest-try-out" className="guest-try-out" style={{
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
        {t.title}
        <span 
          style={{ cursor: 'default' }}
          onDoubleClick={() => {
            localStorage.removeItem('supernexus_guest_uses');
            setTrialUsesCount(0);
            setResultUrls([]);
            alert('Admin Override: Free Trials Reset!');
          }}
        >.</span>
      </h3>
      <p style={{ color: '#aaaaaa', textAlign: 'center', maxWidth: '600px', marginBottom: '3rem', fontSize: '1.1rem' }}>
        {t.subtitle}
      </p>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255, 50, 50, 0.1)', color: '#ff6b6b', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {trialUsesCount >= 1 && resultUrls.length === 0 && !isGenerating && (
        <div className="wow-border-card" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="wow-border-inner">
            <Lock size={48} color="#ccff00" style={{ margin: '0 auto 1.5rem auto' }} />
            <h4 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem' }}>{t.freeTrialExhausted}</h4>
            <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1.1rem' }}>{t.exhaustedDesc}</p>
            <a href="/auth" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#ccff00', color: '#000', fontWeight: 700, borderRadius: '12px', textDecoration: 'none', fontSize: '1.1rem' }}>
              {t.registerBtn}
            </a>
          </div>
        </div>
      )}

      {/* Email Capture / Upload Zone */}
      {resultUrls.length === 0 && trialUsesCount < 1 && (
        <div style={{ width: '100%', maxWidth: '900px' }}>
          {!isEmailSubmitted ? (
            <div className="wow-border-card" style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
              <div className="wow-border-inner" style={{ padding: '4rem 2rem' }}>
              <h4 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>{t.unlockTrialsTitle}</h4>
              <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1rem' }}>
                {t.unlockTrialsDesc}
              </p>
              
              <button
                onClick={handleGoogleLogin}
                disabled={isSubmittingEmail}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  backgroundColor: '#ffffff', color: '#000000', padding: '1rem 1.5rem',
                  borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '1.1rem',
                  cursor: isSubmittingEmail ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  marginBottom: '1rem'
                }}
              >
                {isSubmittingEmail ? <Loader2 className="animate-spin" color="#000" /> : (
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                )}
                {t.unlockBtn}
              </button>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>
                {t.noCreditCard}
              </div>
              </div>
            </div>
          ) : !previewUrl ? (
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
              <p style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 600 }}>{t.clickOrDrag}</p>
              <p style={{ color: '#666', fontSize: '1rem', marginTop: '0.5rem' }}>{t.jpegOrPng}</p>
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
                      <p style={{ fontWeight: 600 }}>{t.uploadingAnalyzing}</p>
                    </div>
                  )}

                  {!uploadedImageUrl && !isAnalyzing && (
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setPreviewUrl(null); setFile(null); }} style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid #333', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>{t.cancelBtn}</button>
                      <button onClick={handleUploadAndAnalyze} style={{ flex: 2, padding: '0.8rem', background: '#ccff00', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>{t.startConfigBtn}</button>
                    </div>
                  )}
                </div>

                {/* Right side: Taxonomy UI */}
                {uploadedImageUrl && (
                  <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Category Selection */}
                    <div>
                      <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>1. {t.selectCat}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.8rem' }}>
                        {Object.keys(TAXONOMY_TREE).map(cat => {
                          const Icon = CAT_ICONS[cat] || Box;
                          const isSel = selectedCat === cat;
                          return (
                          <button
                            key={cat}
                            onClick={() => { setSelectedCat(cat); setSelectedMode(null); setSelectedSubcat(null); }}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              padding: '1rem 0.5rem',
                              background: isSel ? 'rgba(204,255,0,0.1)' : 'rgba(255,255,255,0.03)',
                              color: isSel ? '#ccff00' : '#888',
                              border: '1px solid',
                              borderColor: isSel ? '#ccff00' : 'rgba(255,255,255,0.05)',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              gap: '0.5rem'
                            }}
                          >
                            <Icon size={24} color={isSel ? '#ccff00' : '#888'} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{tCat(cat)}</span>
                          </button>
                        )})}
                      </div>
                    </div>

                    {/* Mode Selection */}
                    {selectedCat && (
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>2. {t.selectMode}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.8rem' }}>
                          {Object.keys(TAXONOMY_TREE[selectedCat]).map(mode => {
                            const Icon = MODE_ICONS[mode] || Box;
                            const isSel = selectedMode === mode;
                            return (
                            <button
                              key={mode}
                              onClick={() => { setSelectedMode(mode); setSelectedSubcat(null); }}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                padding: '1rem 0.5rem',
                                background: isSel ? 'rgba(204,255,0,0.1)' : 'rgba(255,255,255,0.03)',
                                color: isSel ? '#ccff00' : '#888',
                                border: '1px solid',
                                borderColor: isSel ? '#ccff00' : 'rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                gap: '0.5rem'
                              }}
                            >
                              <Icon size={24} color={isSel ? '#ccff00' : '#888'} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>{tMode(mode)}</span>
                            </button>
                          )})}
                        </div>
                      </div>
                    )}

                    {/* Subcat Selection */}
                    {selectedCat && selectedMode && (
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>3. {t.selectSubcat}</h4>
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
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                              }}
                            >
                              {tSub(subcat)}
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
                          borderRadius: '12px',
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
                          <><Loader2 className="animate-spin" /> {t.generatingMagic}</>
                        ) : (
                          <><Sparkles /> {t.generateBtnImages || 'Generate 5 Images'}</>
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
            <Sparkles /> {resultUrls.length} {t.imagesGenerated}
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
            {trialUsesCount < 1 ? (
              <>
                <h4 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>{t.oneTrialRemaining}</h4>
                <button onClick={resetForNextTrial} style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <RefreshCw size={20} /> {t.tryAnotherStyle}
                </button>
              </>
            ) : (
              <>
                <h4 style={{ color: '#ccff00', fontSize: '1.8rem', marginBottom: '1rem' }}>{t.impressedTitle}</h4>
                <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '1.1rem' }}>{t.impressedDesc}</p>
                <a href="/auth" style={{ display: 'inline-block', padding: '1.2rem 3rem', background: '#ccff00', color: '#000', fontWeight: 700, fontSize: '1.2rem', borderRadius: '12px', textDecoration: 'none' }}>
                  {t.createAccountBtn}
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
