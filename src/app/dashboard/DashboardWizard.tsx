'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, Wand2, Plus, Sparkles, ChevronLeft, ChevronRight, Settings, Info, CheckCircle2, Lock } from 'lucide-react'
import * as Icons from 'lucide-react'
import "../admin.css"

type Snippet = any;

const PRESETS = [
  { id: 'shopify', badge: 'Best for Shopify', badgeColor: '#10b981', label: 'Shopify Product Page', icon: 'ShoppingBag', steps: { CLIENT_TYPE: 'E-commerce', IMAGE_GOAL: 'Sell Online', IMAGE_TYPE: 'Ecommerce Clean', SCENE: 'Studio Softbox', FORMAT: '4:5', QUANTITY: '3' } },
  { id: 'amazon', badge: 'Best for Amazon', badgeColor: '#f59e0b', label: 'Amazon Listing Pack', icon: 'Package', steps: { CLIENT_TYPE: 'Amazon/Marketplace Seller', IMAGE_GOAL: 'Sell Online', IMAGE_TYPE: 'Amazon Hero Shot', SCENE: 'Ghost Mannequin', FORMAT: '1:1', QUANTITY: '1' } },
  { id: 'etsy_ugc', badge: 'Natural UGC', badgeColor: '#8b5cf6', label: 'Etsy T-Shirt Seller', icon: 'Smartphone', steps: { CLIENT_TYPE: 'Content Creator', IMAGE_GOAL: 'Social Media Engagement', IMAGE_TYPE: 'UGC Natural (iPhone POV)', PRODUCT_TYPE: 'T-Shirts / Hoodies', SCENE: 'Mirror Selfie Context', FORMAT: '9:16', QUANTITY: '3' } },
  { id: 'physical_boutique', badge: 'Premium Look', badgeColor: '#ec4899', label: 'Store / Boutique', icon: 'Store', steps: { CLIENT_TYPE: 'Physical Store', IMAGE_GOAL: 'Promote / Ads', IMAGE_TYPE: 'High-Fashion Ad', SCENE: 'Luxury Boutique Interior', FORMAT: '4:5', QUANTITY: '3' } },
  { id: 'ceremony_campaign', badge: 'High Fashion', badgeColor: '#0f172a', label: 'Premium Ceremony', icon: 'Star', steps: { CLIENT_TYPE: 'Physical Store', IMAGE_GOAL: 'Promote / Ads', IMAGE_TYPE: 'High-Fashion Ad', PRODUCT_TYPE: 'Ceremony / Elegant', SCENE: 'Grand Event / Ballroom', FORMAT: '4:5', QUANTITY: '3' } },
  { id: 'shoes_ecommerce', badge: 'High Conversion', badgeColor: '#3b82f6', label: 'Shoes Ecommerce', icon: 'Activity', steps: { CLIENT_TYPE: 'E-commerce', IMAGE_GOAL: 'Sell Online', IMAGE_TYPE: 'Ecommerce Clean', PRODUCT_TYPE: 'Sneakers / Shoes Focus', SCENE: 'E-Commerce Flat Lay', FORMAT: '1:1', QUANTITY: '3' } },
  { id: 'swimwear_summer', badge: 'Natural UGC', badgeColor: '#eab308', label: 'Swimwear Summer', icon: 'Sun', steps: { CLIENT_TYPE: 'Content Creator', IMAGE_GOAL: 'Social Media Engagement', IMAGE_TYPE: 'UGC Natural (iPhone POV)', PRODUCT_TYPE: 'Swimwear / Beachwear', SCENE: 'Tropical Beach', FORMAT: '9:16', QUANTITY: '3' } },
  { id: 'bags_premium', badge: 'Premium Look', badgeColor: '#6366f1', label: 'Bags Premium Pack', icon: 'ShoppingBag', steps: { CLIENT_TYPE: 'Physical Store', IMAGE_GOAL: 'Promote / Ads', IMAGE_TYPE: 'High-Fashion Ad', PRODUCT_TYPE: 'Bags / Accessories', SCENE: 'Luxury Boutique Interior', FORMAT: '4:5', QUANTITY: '3' } },
  { id: 'jewelry_detail', badge: 'High Conversion', badgeColor: '#14b8a6', label: 'Jewelry Detail Pack', icon: 'Watch', steps: { CLIENT_TYPE: 'E-commerce', IMAGE_GOAL: 'Sell Online', IMAGE_TYPE: 'Ecommerce Clean', PRODUCT_TYPE: 'Jewelry / Watches', SCENE: 'Studio Softbox', FORMAT: '1:1', QUANTITY: '3' } },
]

export default function DashboardWizard({ snippets, isAdmin }: { snippets: Snippet[], isAdmin?: boolean }) {
  const [step, setStep] = useState<number>(0)
  
  // Upload State
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Selections
  const [selections, setSelections] = useState<Record<string, Snippet | null>>({
    CLIENT_TYPE: null, IMAGE_GOAL: null, IMAGE_TYPE: null, PRODUCT_TYPE: null, MODEL_OPTION: null, SCENE: null, FORMAT: null, QUANTITY: null
  })

  // Final Prompts
  const [finalPrompt, setFinalPrompt] = useState<string>('')
  const [negativePrompt, setNegativePrompt] = useState<string>('')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calcola il prompt quando arriviamo allo step finale
  useEffect(() => {
    if (step === 8) {
      let fPrompt = "";
      let nPrompt = "";

      const selectedSnippets = Object.values(selections).filter(Boolean) as Snippet[];
      
      selectedSnippets.sort((a, b) => {
         const intensityScore = (val: string) => val === 'strong' ? 3 : val === 'medium' ? 2 : 1;
         if (intensityScore(b.intensity_level) !== intensityScore(a.intensity_level)) {
             return intensityScore(b.intensity_level) - intensityScore(a.intensity_level);
         }
         return a.priority_order - b.priority_order;
      });

      selectedSnippets.forEach(s => {
         if (s.prompt_fragment) {
            let frag = s.prompt_fragment.trim();
            if (s.intensity_level === 'strong') frag = `((${frag}))`;
            fPrompt += frag + ", ";
         }
         if (s.negative_fragment) {
            nPrompt += s.negative_fragment.trim() + ", ";
         }
      });

      setFinalPrompt(fPrompt.replace(/, $/, ''));
      setNegativePrompt(nPrompt.replace(/, $/, ''));
    }
  }, [step, selections]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', selected)
        const res = await fetch('/api/web/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) {
          setUploadedUrl(data.url)
          setStep(0.5)
        } else {
          setError(data.error || 'Upload failed')
        }
      } catch (err) {
        setError('Network error during upload')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const applyPreset = (preset: any) => {
    const newSel = { ...selections };
    Object.keys(preset.steps).forEach(type => {
      const snip = snippets.find(s => s.snippet_type === type && s.label === preset.steps[type]);
      if (snip) newSel[type] = snip;
    });
    
    // Ensure missing required values aren't left behind from previous runs if any
    setSelections(newSel);
    if (!newSel.PRODUCT_TYPE) {
      setStep(4);
    } else {
      setStep(8);
    }
  }

  const handleSnippetSelect = (type: string, snip: Snippet, stepIndex: number) => {
    setSelections({...selections, [type]: snip});
    
    // Auto-advance logic (delay for micro-animation visual feedback)
    if (type !== 'QUANTITY' && stepIndex < 7) {
      setTimeout(() => {
        setStep(stepIndex + 1);
      }, 350);
    }
  }

  const handleGenerate = async () => {
    if (!uploadedUrl) return;
    setIsGenerating(true)
    setError(null)
    setResults([])

    try {
      const qtySnippet = selections['QUANTITY'];
      const aspectRatioSnippet = selections['FORMAT'];
      
      const payload = {
        imageUrl: uploadedUrl,
        finalPrompt,
        negativePrompt,
        qty: qtySnippet ? parseInt(qtySnippet.label, 10) : 1,
        aspectRatio: aspectRatioSnippet ? aspectRatioSnippet.label : '4:5',
        selectedSnippetIds: Object.values(selections).filter(Boolean).map(s => s.id)
      }

      const res = await fetch('/api/web/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      if (data.results) {
        setResults(data.results)
        setStep(9)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const renderSnippetGrid = (type: string, stepIndex: number) => {
    const typeSnippets = snippets.filter(s => s.snippet_type === type);
    
    const groups: Record<string, Snippet[]> = {};
    typeSnippets.forEach(s => {
       const g = s.sort_group || 'Other styles';
       if (!groups[g]) groups[g] = [];
       groups[g].push(s);
    });

    const order = ['Recommended', 'Ecommerce', 'Social', 'Premium', 'Other styles'];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {order.map(groupName => {
          if (!groups[groupName] || groups[groupName].length === 0) return null;
          return (
            <div key={groupName} className="fade-up-enter">
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)', marginBottom: '1.2rem', paddingBottom: '0.5rem', fontWeight: 700 }}>
                {groupName}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {groups[groupName].map(snip => {
                  const isSelected = selections[type]?.id === snip.id;
                  
                  let isWarning = false;
                  if (snip.incompatibilities) {
                     const incompats = snip.incompatibilities.toLowerCase();
                     Object.values(selections).forEach(sel => {
                        if (sel && incompats.includes(sel.label.toLowerCase())) isWarning = true;
                     });
                  }

                  const IconComp = (Icons as any)[snip.icon || 'Box'] || Icons.Box;

                  // Premium card styling
                  const cardStyle: any = {
                    padding: '1.5rem', 
                    textAlign: 'left', 
                    position: 'relative', 
                    opacity: isWarning && !isSelected ? 0.6 : 1,
                    background: isSelected ? 'rgba(255,255,255,0.05)' : 'rgba(10, 15, 25, 0.4)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.2)' : '0 10px 30px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                  };

                  return (
                    <button 
                      key={snip.id} 
                      onClick={() => handleSnippetSelect(type, snip, stepIndex)} 
                      className={`hover-scale ${isSelected ? 'active-glow' : ''}`} 
                      style={cardStyle}
                    >
                      {snip.is_recommended && <Sparkles size={16} color="var(--color-primary)" style={{ position: 'absolute', top: 12, right: 12 }} />}
                      <IconComp size={28} color={isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)'} style={{ marginBottom: '1.25rem' }} />
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: isSelected ? '#fff' : 'var(--color-text)' }}>{snip.label}</div>
                      {snip.description && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{snip.description}</div>}
                      
                      {isWarning && (
                         <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                           <Info size={14} /> Might conflict
                         </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const stepsData = [
    { num: 1, type: 'CLIENT_TYPE', title: 'Who are you?', desc: 'Adattiamo il motore fotografico al tuo business model.' },
    { num: 2, type: 'IMAGE_GOAL', title: 'What is the goal?', desc: 'Scegli l\'obiettivo primario dell\'immagine.' },
    { num: 3, type: 'IMAGE_TYPE', title: 'Visual Style', desc: 'Scegli Catalog per pulizia, UGC per realismo spontaneo, o Premium per lusso.' },
    { num: 4, type: 'PRODUCT_TYPE', title: 'Product Type', desc: 'Cosa stiamo fotografando?' },
    { num: 5, type: 'MODEL_OPTION', title: 'Model Option', desc: 'Seleziona chi presenterà il tuo prodotto, o mantienilo "No Model" per scatti tecnici.' },
    { num: 6, type: 'SCENE', title: 'Scene & Setting', desc: 'Definisci il background e il contesto ambientale.' },
    { num: 7, type: 'FORMAT', title: 'Format & Layout', desc: 'Scegli l\'aspect ratio e quante variazioni vuoi generare.' },
  ];

  return (
    <div className="wizard-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .active-glow {
          box-shadow: 0 0 0 1px var(--color-primary), 0 0 20px rgba(59, 130, 246, 0.3) !important;
          transform: translateY(-2px);
        }
        .btn-premium {
          background: linear-gradient(135deg, var(--color-primary), #2563eb);
          color: white;
          border: none;
          padding: 1rem 3rem;
          font-size: 1.15rem;
          font-weight: 800;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px rgba(37, 99, 235, 0.4);
        }
      `}} />

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Progress Bar */}
      {step > 0 && step < 9 && !isGenerating && (
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
             <button onClick={() => setStep(Math.max(0.5, step - 1))} disabled={step === 0.5} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
               <ChevronLeft size={18} style={{ marginRight: '4px' }} /> Back
             </button>
             <span style={{ fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                Step {Math.floor(step)} of 8
             </span>
             <button onClick={() => setStep(step === 7 ? 8 : step + 1)} disabled={step < 1 || !selections[stepsData[step-1]?.type]} style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
               Next <ChevronRight size={18} style={{ marginLeft: '4px' }} />
             </button>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(step / 8) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', transition: 'width 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)' }} />
          </div>
        </div>
      )}

      {/* STEP 0: UPLOAD */}
      {step === 0 && (
        <div className="fade-up-enter" style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(10,15,25,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: '2.8rem', marginBottom: '1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Create product images that look real — without changing your product.</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '3.5rem', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3.5rem auto' }}>Carica la foto del tuo prodotto scattata sul manichino, su un appendino o flat lay.</p>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-premium" style={{ margin: '0 auto 2rem auto', padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
            {isUploading ? <><Loader2 className="animate-spin" /> Uploading...</> : <><Upload /> Upload Product Image</>}
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem 1.5rem', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600 }}>
             <CheckCircle2 size={18} />
             <span>Il tuo prodotto rimane fedele al 100%. L'AI preserva pattern, loghi e cuciture inalterati.</span>
          </div>
        </div>
      )}

      {/* STEP 0.5: PRESETS OR CUSTOM */}
      {step === 0.5 && (
        <div className="fade-up-enter">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', fontWeight: 800 }}>Quick Start Presets</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Scegli un pacchetto pre-configurato o crea il tuo workflow manuale.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {PRESETS.map(p => {
               const IconC = (Icons as any)[p.icon] || Icons.Zap;
               return (
                  <button key={p.id} onClick={() => applyPreset(p)} className="hover-scale" style={{ padding: '2rem 1.5rem', textAlign: 'left', position: 'relative', background: 'rgba(10,15,25,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                     <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: p.badgeColor, color: '#fff', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 800, textTransform: 'uppercase', boxShadow: `0 4px 10px ${p.badgeColor}40` }}>
                        {p.badge}
                     </div>
                     <IconC size={36} color="var(--color-primary)" style={{ marginBottom: '1.25rem' }} />
                     <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{p.label}</h4>
                     <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, fontWeight: 500 }}>Auto-fill AI settings</p>
                  </button>
               )
            })}
          </div>

          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem' }}>
             <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '30px', fontWeight: 700 }}>
                Start Custom Workflow <ChevronRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '8px' }} />
             </button>
          </div>
        </div>
      )}

      {/* DYNAMIC STEPS 1-7 */}
      {step >= 1 && step <= 7 && (
        <div className="fade-up-enter">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', fontWeight: 800 }}>{stepsData[step-1].title}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>{stepsData[step-1].desc}</p>
          </div>

          {renderSnippetGrid(stepsData[step-1].type, step)}
        </div>
      )}

      {/* FINAL STEP 8: SUMMARY & EDITOR */}
      {step === 8 && (
        <div className="fade-up-enter">
           <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Ready to Generate</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Review your configuration before creating the magic.</p>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'minmax(300px, 1fr) 2fr' : '1fr', gap: '2.5rem' }}>
              
              {/* Premium Summary View for Users */}
              <div style={{ background: 'rgba(10,15,25,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                 
                 {/* Left: Image Thumbnail */}
                 <div style={{ flex: '0 0 200px' }}>
                    <div style={{ width: '100%', aspectRatio: '4/5', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                       {uploadedUrl && <img src={uploadedUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Uploaded product" />}
                    </div>
                 </div>

                 {/* Right: Choices & CTA */}
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                       {stepsData.map(st => {
                          const sel = selections[st.type];
                          if (!sel) return null;
                          return (
                             <div key={st.type} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{st.title.split('?')[0]}</span>
                                <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>{sel.label}</span>
                             </div>
                          )
                       })}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.5rem', borderRadius: '16px' }}>
                       <div>
                          <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '0.25rem' }}>{selections['QUANTITY']?.label || '1'} {selections['QUANTITY']?.label === '1' ? 'Image' : 'Images'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Format: {selections['FORMAT']?.label || '4:5'}</div>
                       </div>
                       <button onClick={handleGenerate} className="btn-premium">
                          Generate Images ✨
                       </button>
                    </div>
                 </div>
              </div>

              {/* ADMIN GOD MODE: Advanced Editor */}
              {isAdmin && (
                <div style={{ background: 'rgba(10,15,25,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: '2rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={16} /> Admin God Mode
                      </h4>
                      <Settings size={20} color="var(--color-text-muted)" />
                   </div>

                   <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                     These are the raw prompts assembled from your snippets. They are hidden from standard users. You can edit them manually before sending to Replicate.
                   </p>
                   
                   <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Positive Prompt</label>
                   <textarea value={finalPrompt} onChange={e => setFinalPrompt(e.target.value)} className="input-glass" rows={4} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}></textarea>

                   <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Negative Prompt</label>
                   <textarea value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} className="input-glass" rows={3} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}></textarea>
                </div>
              )}
           </div>
        </div>
      )}

      {/* GENERATING STATE */}
      {isGenerating && (
        <div className="fade-up-enter" style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(10,15,25,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <Wand2 size={72} color="var(--color-primary)" className="animate-pulse" style={{ margin: '0 auto 2rem auto' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #fff, var(--color-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Creating the magic...
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Hang tight! Our AI is rendering your photorealistic images.</p>
        </div>
      )}

      {/* RESULTS STEP */}
      {step === 9 && results.length > 0 && (
        <div className="fade-up-enter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>Results</h3>
            <button onClick={() => { setStep(0.5); setResults([]); }} className="btn-secondary" style={{ borderRadius: '30px', padding: '0.75rem 2rem', fontWeight: 700 }}>Generate More</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {results.map((url, i) => (
              <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img src={url} alt={`Result ${i}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
