'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, Wand2, Plus, Sparkles, ChevronLeft, ChevronRight, Settings, Info, CheckCircle2 } from 'lucide-react'
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

export default function DashboardWizard({ snippets }: { snippets: Snippet[] }) {
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
    setSelections(newSel);
    if (!newSel.PRODUCT_TYPE) setStep(4);
    else setStep(8);
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

  const renderSnippetGrid = (type: string) => {
    const typeSnippets = snippets.filter(s => s.snippet_type === type);
    
    const groups: Record<string, Snippet[]> = {};
    typeSnippets.forEach(s => {
       const g = s.sort_group || 'Other styles';
       if (!groups[g]) groups[g] = [];
       groups[g].push(s);
    });

    const order = ['Recommended', 'Ecommerce', 'Social', 'Premium', 'Other styles'];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {order.map(groupName => {
          if (!groups[groupName] || groups[groupName].length === 0) return null;
          return (
            <div key={groupName}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {groupName}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
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

                  return (
                    <button 
                      key={snip.id} 
                      onClick={() => setSelections({...selections, [type]: snip})} 
                      className={`glass-panel hover-scale ${isSelected ? 'active-border' : ''}`} 
                      style={{ padding: '1.5rem 1rem', textAlign: 'left', position: 'relative', opacity: isWarning && !isSelected ? 0.6 : 1 }}
                    >
                      {snip.is_recommended && <Sparkles size={16} color="var(--color-primary)" style={{ position: 'absolute', top: 10, right: 10 }} />}
                      <IconComp size={24} color={isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)'} style={{ marginBottom: '1rem' }} />
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{snip.label}</div>
                      {snip.description && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{snip.description}</div>}
                      
                      {isWarning && (
                         <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <Info size={12} /> May conflict with your choices
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
      
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Progress Bar */}
      {step > 0 && step < 9 && !isGenerating && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
             <button onClick={() => setStep(Math.max(0.5, step - 1))} disabled={step === 0.5} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
               <ChevronLeft size={16} /> Back
             </button>
             <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                Step {Math.floor(step)} di 8
             </span>
             <button onClick={() => setStep(step === 7 ? 8 : step + 1)} disabled={step < 1 || !selections[stepsData[step-1]?.type]} style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
               Next <ChevronRight size={16} />
             </button>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: \`\${(step / 8) * 100}%\`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* STEP 0: UPLOAD */}
      {step === 0 && (
        <div className="admin-card fade-up-enter" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>Create product images that look real — without changing your product.</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Carica la foto del tuo prodotto scattata sul manichino, su un appendino o flat lay.</p>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-primary" style={{ padding: '1.5rem 3rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', margin: '0 auto 1.5rem auto' }}>
            {isUploading ? <><Loader2 className="animate-spin" /> Upload in corso...</> : <><Upload /> Upload Product Image</>}
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>
             <CheckCircle2 size={16} />
             <span>Il tuo prodotto rimane fedele al 100%. L'AI preserva pattern, loghi e cuciture inalterati.</span>
          </div>
        </div>
      )}

      {/* STEP 0.5: PRESETS OR CUSTOM */}
      {step === 0.5 && (
        <div className="fade-up-enter">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>Quick Start Presets</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Scegli un pacchetto pre-configurato o crea il tuo workflow manuale.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {PRESETS.map(p => {
               const IconC = (Icons as any)[p.icon] || Icons.Zap;
               return (
                  <button key={p.id} onClick={() => applyPreset(p)} className="glass-panel hover-glow" style={{ padding: '2rem 1.5rem', textAlign: 'left', position: 'relative' }}>
                     <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: p.badgeColor, color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                        {p.badge}
                     </div>
                     <IconC size={32} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
                     <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{p.label}</h4>
                     <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Auto-fill AI settings</p>
                  </button>
               )
            })}
          </div>

          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem' }}>
             <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                Start Custom Workflow <ChevronRight size={18} style={{ display: 'inline', verticalAlign: 'middle' }} />
             </button>
          </div>
        </div>
      )}

      {/* DYNAMIC STEPS 1-7 */}
      {step >= 1 && step <= 7 && (
        <div className="fade-up-enter">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{stepsData[step-1].title}</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>{stepsData[step-1].desc}</p>
          </div>

          {renderSnippetGrid(stepsData[step-1].type)}
        </div>
      )}

      {/* FINAL STEP 8: SUMMARY & EDITOR */}
      {step === 8 && (
        <div className="fade-up-enter">
           <h3 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Final Summary</h3>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                 <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Le Tue Scelte</h4>
                 {stepsData.map(st => {
                    const sel = selections[st.type];
                    if (!sel) return null;
                    return (
                       <div key={st.type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>{st.title.split('?')[0]}</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-text)', textAlign: 'right', marginLeft: '1rem' }}>{sel.label}</span>
                       </div>
                    )
                 })}
              </div>

              <div className="admin-card" style={{ padding: '1.5rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', margin: 0 }}>Advanced Prompt Editor</h4>
                    <Settings size={18} color="var(--color-text-muted)" />
                 </div>

                 <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>I mattoncini che hai scelto hanno composto questo prompt ottimizzato. Il motore ha calibrato pesi e filtri negativi anti-CGI.</p>
                 
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>PROMPT POSITIVO</label>
                 <textarea value={finalPrompt} onChange={e => setFinalPrompt(e.target.value)} className="input-glass" rows={5} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid var(--color-primary)' }}></textarea>

                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>PROMPT NEGATIVO</label>
                 <textarea value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} className="input-glass" rows={3} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', borderColor: '#ef4444' }}></textarea>

                 <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <button onClick={handleGenerate} className="btn-primary btn-hero-glow" style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: 700 }}>
                       Generate Images ✨
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* GENERATING STATE */}
      {isGenerating && (
        <div className="admin-card fade-up-enter" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Wand2 size={64} color="var(--color-primary)" className="animate-pulse" style={{ margin: '0 auto 2rem auto' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(90deg, #fff, var(--color-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Generazione in corso...
          </h2>
        </div>
      )}

      {/* RESULTS STEP */}
      {step === 9 && results.length > 0 && (
        <div className="fade-up-enter">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>Risultati</h3>
            <button onClick={() => { setStep(0.5); setResults([]); }} className="btn-secondary">Genera Altro</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {results.map((url, i) => (
              <div key={i} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={url} alt={\`Result \${i}\`} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
