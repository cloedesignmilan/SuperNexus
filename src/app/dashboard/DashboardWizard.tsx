'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, Wand2, Plus, Sparkles, ChevronLeft, ChevronRight, Settings, Info, CheckCircle2, Lock, ArrowRight, Zap, Image as ImageIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

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
  
  // AI Analysis State
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
          
          // Trigger AI Analysis
          setIsAnalyzing(true)
          setStep(0.25)
          
          fetch('/api/web/analyze-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: data.url })
          })
          .then(res => res.json())
          .then(analysisRes => {
            if (analysisRes.success && analysisRes.analysis) {
              setAnalysisData(analysisRes.analysis)
              
              if (analysisRes.analysis.confidence >= 0.8 && analysisRes.analysis.detectedProductType) {
                const matchMap: Record<string, string> = {
                  'swimwear': 'Swimwear / Beachwear',
                  'women_clothing': 'Clothing / Fashion',
                  'men_clothing': 'Clothing / Fashion',
                  'tshirt_hoodie': 'T-Shirts / Hoodies',
                  'shoes': 'Sneakers / Shoes Focus',
                  'bags': 'Bags / Accessories',
                  'jewelry': 'Jewelry / Watches',
                  'ceremony_elegant': 'Ceremony / Elegant',
                  'accessories': 'Bags / Accessories'
                }
                const label = matchMap[analysisRes.analysis.detectedProductType];
                if (label) {
                  const snip = snippets.find(s => s.snippet_type === 'PRODUCT_TYPE' && s.label === label);
                  if (snip) {
                    setSelections(prev => ({ ...prev, PRODUCT_TYPE: snip }));
                  }
                }
              }
            }
          })
          .catch(e => console.error("Analysis failed:", e))
          .finally(() => {
            setIsAnalyzing(false)
          })

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
    if (!newSel.PRODUCT_TYPE) {
      setStep(4);
    } else {
      setStep(8);
    }
  }

  const handleSnippetSelect = (type: string, snip: Snippet, stepIndex: number) => {
    setSelections({...selections, [type]: snip});
    
    // Auto-advance logic
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
    let typeSnippets = snippets.filter(s => s.snippet_type === type);
    
    // SMART FILTERING BASED ON AI ANALYSIS
    if (analysisData && analysisData.detectedAttributes) {
      typeSnippets = typeSnippets.map(s => {
        let cloned = { ...s };
        const label = cloned.label.toLowerCase();
        
        let isRecommended = false;
        let isLowPriority = false;
        
        // Match Recommendations
        if (analysisData.detectedAttributes.recommendedScenes && type === 'SCENE') {
          if (analysisData.detectedAttributes.recommendedScenes.some((rs: string) => label.includes(rs.toLowerCase().split(' ')[0]))) {
            isRecommended = true;
          }
        }
        if (analysisData.detectedAttributes.recommendedModelOptions && type === 'MODEL_OPTION') {
          if (analysisData.detectedAttributes.recommendedModelOptions.some((rm: string) => label.includes(rm.toLowerCase().split(' ')[0]))) {
            isRecommended = true;
          }
        }

        // Match Blocked
        if (analysisData.detectedAttributes.blockedOrLowPriorityOptions) {
          if (analysisData.detectedAttributes.blockedOrLowPriorityOptions.some((bo: string) => label.includes(bo.toLowerCase().split(' ')[0]))) {
            isLowPriority = true;
          }
        }
        
        // Gender Rules
        if (type === 'MODEL_OPTION' || type === 'SCENE') {
          const gender = analysisData.detectedAttributes.genderTarget;
          if (gender === 'woman' && (label.includes('man') || label.includes('uomo') || label.includes('male') || label.includes('boy'))) isLowPriority = true;
          if (gender === 'man' && (label.includes('woman') || label.includes('donna') || label.includes('female') || label.includes('girl'))) isLowPriority = true;
        }

        if (isRecommended) cloned.sort_group = '✨ AI Suggested';
        if (isLowPriority) cloned.sort_group = 'Other styles';

        return cloned;
      });
    }

    const groups: Record<string, Snippet[]> = {};
    typeSnippets.forEach(s => {
       const g = s.sort_group || 'Other styles';
       if (!groups[g]) groups[g] = [];
       groups[g].push(s);
    });

    const order = ['✨ AI Suggested', 'Recommended', 'Ecommerce', 'Social', 'Premium', 'Other styles'];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {order.map(groupName => {
          if (!groups[groupName] || groups[groupName].length === 0) return null;
          return (
            <div key={groupName} className="fade-up-enter">
              <h4 className="group-title">{groupName}</h4>
              <div className="glass-grid">
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
                      onClick={() => handleSnippetSelect(type, snip, stepIndex)} 
                      className={`glass-card ${isSelected ? 'selected' : ''} ${isWarning && !isSelected ? 'warning' : ''}`} 
                    >
                      {snip.is_recommended && <Sparkles className="sparkle-icon" size={16} />}
                      <IconComp size={28} className="card-icon" />
                      <div className="card-title">{snip.label}</div>
                      {snip.description && <div className="card-desc">{snip.description}</div>}
                      
                      {isWarning && (
                         <div className="conflict-warning">
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
    { num: 1, type: 'CLIENT_TYPE', title: 'Who are you?', desc: 'Adapt the photographic engine to your business model.' },
    { num: 2, type: 'IMAGE_GOAL', title: 'What is the goal?', desc: 'Select the primary objective of your imagery.' },
    { num: 3, type: 'IMAGE_TYPE', title: 'Visual Style', desc: 'Choose Catalog for clean shots, UGC for natural realism, or Premium for luxury.' },
    { num: 4, type: 'PRODUCT_TYPE', title: 'Product Type', desc: 'What exactly are we photographing?' },
    { num: 5, type: 'MODEL_OPTION', title: 'Model Option', desc: 'Who is presenting your product?' },
    { num: 6, type: 'SCENE', title: 'Scene & Setting', desc: 'Define the background and environmental context.' },
    { num: 7, type: 'FORMAT', title: 'Format & Layout', desc: 'Choose the aspect ratio and generation volume.' },
  ];

  return (
    <div className="studio-layout">
      
      <style dangerouslySetInnerHTML={{__html: `
        .studio-layout {
          display: flex;
          flex: 1;
          width: 100%;
          min-height: 0;
          background: #000;
          color: #fff;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* Ambient Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          z-index: 0;
          pointer-events: none;
        }
        .orb-1 { width: 500px; height: 500px; background: #3b82f6; top: -100px; left: -100px; animation: float 10s infinite alternate; }
        .orb-2 { width: 400px; height: 400px; background: #8b5cf6; bottom: -100px; right: -100px; animation: float 15s infinite alternate-reverse; }

        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        /* Split Screen */
        .studio-left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 2rem;
          background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%);
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .studio-right {
          flex: 1.2;
          overflow-y: auto;
          min-height: 0;
          position: relative;
          z-index: 10;
          background: rgba(5,5,5,0.6);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }

        .scroll-container {
          padding: 4rem 10%;
          max-width: 900px;
          margin: 0 auto;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Image Frame */
        .image-frame {
          width: 100%;
          max-width: 450px;
          aspect-ratio: 4/5;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1);
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .image-frame.empty {
          border: 1px dashed rgba(255,255,255,0.2);
          background: transparent;
          box-shadow: none;
        }

        /* UI Elements */
        .step-header {
          font-size: 3.5rem;
          font-weight: 300;
          letter-spacing: -0.04em;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .step-desc {
          color: rgba(255,255,255,0.5);
          font-size: 1.25rem;
          margin-bottom: 4rem;
          font-weight: 400;
        }

        .group-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .glass-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .glass-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: left;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: #fff;
        }

        .glass-card:hover {
          background: rgba(255,255,255,0.05);
          transform: translateY(-4px);
        }

        .glass-card.selected {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1);
          transform: translateY(-4px);
        }

        .glass-card.warning { opacity: 0.5; }

        .sparkle-icon { position: absolute; top: 1rem; right: 1rem; color: #3b82f6; }
        .card-icon { margin-bottom: 1.5rem; color: rgba(255,255,255,0.6); transition: color 0.3s ease; }
        .glass-card.selected .card-icon { color: #3b82f6; }

        .card-title { font-size: 1.15rem; font-weight: 600; margin-bottom: 0.5rem; }
        .card-desc { font-size: 0.85rem; color: rgba(255,255,255,0.4); line-height: 1.5; }

        .conflict-warning {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: #fbbf24;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Buttons */
        .btn-giant {
          background: #fff;
          color: #000;
          border: none;
          padding: 1.5rem 3rem;
          border-radius: 99px;
          font-size: 1.25rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .btn-giant:hover { transform: scale(1.02); box-shadow: 0 20px 40px rgba(255,255,255,0.2); }

        .btn-magic {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          border: none;
          padding: 1.5rem 4rem;
          border-radius: 99px;
          font-size: 1.4rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4);
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          justify-content: center;
        }
        .btn-magic:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 30px 60px rgba(8b, 92, 246, 0.6); }

        /* Navigation Dots */
        .nav-dots {
          position: absolute;
          top: 3rem;
          right: 4rem;
          display: flex;
          gap: 8px;
          z-index: 50;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .dot.active { background: #fff; transform: scale(1.5); }
        .dot.completed { background: rgba(255,255,255,0.6); }

        .back-button {
          position: absolute;
          top: 3rem;
          left: 4rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 50;
        }
        .back-button:hover { background: rgba(255,255,255,0.1); }

        .fade-up-enter {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Input overrides for God Mode */
        .admin-textarea {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 1rem;
          border-radius: 12px;
          font-family: monospace;
          font-size: 0.9rem;
          resize: vertical;
          margin-bottom: 1rem;
        }

        @media (max-width: 1024px) {
          .studio-layout { flex-direction: column; overflow: hidden; }
          .studio-left { flex: none; height: 35dvh; padding: 1rem; border-right: none; position: relative; background: #000; z-index: 50; transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          
          .studio-left.collapsed { 
            height: 72px; 
            min-height: 72px; 
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            background: rgba(10,10,10,0.95);
            backdrop-filter: blur(20px);
            z-index: 100;
          }
          
          .studio-right { flex: 1; overflow-y: auto; min-height: 0; margin-top: -20px; border-radius: 24px 24px 0 0; background: rgba(10,10,10,0.85); z-index: 20; -webkit-overflow-scrolling: touch; }
          .studio-left.collapsed ~ .studio-right { margin-top: 0; border-radius: 0; }
          
          .image-frame { height: 100%; max-width: 250px; margin: 0 auto; aspect-ratio: auto; }
          .studio-left.collapsed .image-frame { height: 48px; width: 48px; border-radius: 8px; margin: 0; padding: 0; border: none; flex-shrink: 0; }
          .studio-left.collapsed .image-frame img { border-radius: 8px; object-fit: cover; width: 100%; height: 100%; }

          .mobile-header-content { display: none; }
          .studio-left.collapsed .mobile-header-content { display: flex; flex: 1; justify-content: space-between; align-items: center; margin-left: 1rem; }

          .scroll-container { padding: 3rem 1.5rem 8rem 1.5rem; min-height: max-content; }
          .studio-left.collapsed ~ .studio-right .scroll-container { padding-top: 5rem; }
          
          .nav-dots { top: 1.5rem; right: 1.5rem; }
          .back-button { top: 1.5rem; left: 1.5rem; width: 40px; height: 40px; }
          .studio-left.collapsed ~ .studio-right .nav-dots { top: 1.5rem; right: 1.5rem; }
          .studio-left.collapsed ~ .studio-right .back-button { top: 1.2rem; left: 1.5rem; }

          .step-header { font-size: 2.2rem; }

          /* Cards Mobile Optimization */
          .glass-grid { grid-template-columns: 1fr; gap: 1rem; }
          .glass-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; height: auto; }
          .glass-card .card-icon { margin-bottom: 0; }
          .glass-card .card-title { font-size: 1.1rem; margin-bottom: 0; }
          .glass-card .card-desc { display: none; }
          .glass-card .sparkle-icon { position: static; margin-left: auto; }
          .glass-card .conflict-warning { display: none; }
          
          .glass-card.selected {
             background: rgba(59, 130, 246, 0.15);
             border: 2px solid rgba(59, 130, 246, 0.8);
             transform: translateY(0) scale(1.01);
          }
        }
      `}} />

      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* LEFT PANEL: Always shows the image */}
      <div className={`studio-left ${step > 0 && step < 9 && uploadedUrl ? 'collapsed' : ''}`}>
        <div className={`image-frame ${!uploadedUrl ? 'empty' : ''}`}>
          {uploadedUrl ? (
            <img src={uploadedUrl} alt="Uploaded product" />
          ) : (
            <ImageIcon size={64} color="rgba(255,255,255,0.1)" />
          )}
        </div>

        {/* Mobile Compact Header Content */}
        {step > 0 && step < 9 && uploadedUrl && (
          <div className="mobile-header-content">
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Product Uploaded</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{analysisData ? analysisData.detectedProductType?.replace('_', ' ').toUpperCase() : 'Ready'}</div>
            </div>
            <button onClick={() => { setStep(0); setUploadedUrl(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
              Change
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Scrollable Steps */}
      <div className="studio-right">
        
        {step > 0 && step < 9 && !isGenerating && (
          <>
            <button className="back-button" onClick={() => setStep(Math.max(0, step - 1))}>
              <ChevronLeft size={24} />
            </button>
            <div className="nav-dots">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`} />
              ))}
            </div>
          </>
        )}

        <div className="scroll-container">

          {/* Error Banner */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* STEP 0: UPLOAD */}
          {step === 0 && (
            <div className="fade-up-enter">
              <h1 className="step-header">Virtual Studio</h1>
              <p className="step-desc" style={{ maxWidth: '600px' }}>Upload your raw product photo. We'll transform it into high-end editorial imagery without touching the original product.</p>
              
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-giant">
                {isUploading ? <><Loader2 className="animate-spin" /> Uploading...</> : <><Upload size={24} /> Upload Image</>}
              </button>

              <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Pixel-perfect product preservation. Colors and patterns remain exactly as uploaded.</span>
              </div>
            </div>
          )}

          {/* STEP 0.25: AI ANALYSIS */}
          {step === 0.25 && (
            <div className="fade-up-enter" style={{ textAlign: 'center' }}>
              {isAnalyzing ? (
                <>
                  <div style={{ width: '80px', height: '80px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                    <Wand2 size={32} color="#3b82f6" className="animate-pulse" />
                  </div>
                  <h2 className="step-header">Analyzing Product...</h2>
                  <p className="step-desc">AI is detecting materials, style, and structure.</p>
                </>
              ) : analysisData ? (
                <>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', padding: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '1rem', fontWeight: 600 }}>
                      <CheckCircle2 size={24} /> AI Detection Complete
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                      {analysisData.detectedProductType?.replace('_', ' ') || 'Unknown'}
                    </div>
                    {analysisData.detectedAttributes?.recommendedScenes && (
                       <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                         Recommended: {analysisData.detectedAttributes.recommendedScenes.slice(0, 3).join(', ')}
                       </div>
                    )}
                    {analysisData.confidence < 0.8 && (
                      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                        We detected this product, but you can change it if incorrect.
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => setStep(0.5)} className="btn-magic">
                      Looks Good <ArrowRight size={18} />
                    </button>
                    <button onClick={() => { setSelections(prev => ({...prev, PRODUCT_TYPE: null})); setStep(0.5); }} className="btn-giant" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.9rem', padding: '0 1.5rem' }}>
                      Change Type
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="step-header">Analysis Skipped</h2>
                  <button onClick={() => setStep(0.5)} className="btn-giant">Continue <ArrowRight size={18} /></button>
                </>
              )}
            </div>
          )}

          {/* STEP 0.5: PRESETS OR CUSTOM */}
          {step === 0.5 && (
            <div className="fade-up-enter">
              <h2 className="step-header">Quick Start</h2>
              <p className="step-desc">Select a curated workflow or customize everything.</p>

              <div className="glass-grid" style={{ marginBottom: '4rem' }}>
                {PRESETS.map(p => {
                  const IconC = (Icons as any)[p.icon] || Icons.Zap;
                  return (
                    <button key={p.id} onClick={() => applyPreset(p)} className="glass-card" style={{ padding: '2rem' }}>
                      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: p.badgeColor, color: '#fff', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 800, textTransform: 'uppercase' }}>
                        {p.badge}
                      </div>
                      <IconC size={32} style={{ marginBottom: '1.5rem', color: '#fff' }} />
                      <div className="card-title" style={{ fontSize: '1.4rem' }}>{p.label}</div>
                      <div className="card-desc">Auto-fill AI settings</div>
                    </button>
                  )
                })}
              </div>

              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setStep(1)} className="btn-giant" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Start Custom Workflow <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* DYNAMIC STEPS 1-7 */}
          {step >= 1 && step <= 7 && (
            <div className="fade-up-enter">
              <h2 className="step-header">{stepsData[step-1].title}</h2>
              <p className="step-desc">{stepsData[step-1].desc}</p>
              
              {renderSnippetGrid(stepsData[step-1].type, step)}
              
              {/* Only show NEXT button if it's the FORMAT step */}
              {step === 7 && (
                <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setStep(8)} disabled={!selections['FORMAT']} className="btn-giant">
                    Review Configuration <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FINAL STEP 8: SUMMARY & EDITOR */}
          {step === 8 && (
            <div className="fade-up-enter">
              <h2 className="step-header">Ready</h2>
              <p className="step-desc">Your configuration is complete.</p>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2.5rem', marginBottom: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
                  {stepsData.map(st => {
                    const sel = selections[st.type];
                    if (!sel) return null;
                    return (
                      <div key={st.type}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>{st.title.split('?')[0]}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{sel.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button onClick={handleGenerate} className="btn-magic">
                <Sparkles size={24} /> Generate {selections['QUANTITY']?.label || '1'} {selections['QUANTITY']?.label === '1' ? 'Image' : 'Images'}
              </button>

              {isAdmin && (
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', fontWeight: 700 }}>
                    <Lock size={16} /> Admin God Mode
                  </div>
                  
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Positive Prompt</label>
                  <textarea value={finalPrompt} onChange={e => setFinalPrompt(e.target.value)} className="admin-textarea" rows={4} />

                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Negative Prompt</label>
                  <textarea value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} className="admin-textarea" rows={3} />
                </div>
              )}
            </div>
          )}

          {/* GENERATING STATE */}
          {isGenerating && (
            <div className="fade-up-enter" style={{ textAlign: 'center' }}>
              <div style={{ width: '120px', height: '120px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3rem auto', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 0 50px rgba(59, 130, 246, 0.2)' }}>
                <Loader2 size={48} color="#3b82f6" className="animate-spin" />
              </div>
              <h2 className="step-header" style={{ fontSize: '3rem' }}>Rendering...</h2>
              <p className="step-desc">Applying photorealistic materials and lighting.</p>
            </div>
          )}

          {/* RESULTS STEP */}
          {step === 9 && results.length > 0 && (
            <div className="fade-up-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                  <h2 className="step-header" style={{ marginBottom: 0 }}>Results</h2>
                </div>
                <button onClick={() => { setStep(0.5); setResults([]); }} className="btn-giant" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem 2rem', color: '#fff', fontSize: '1rem' }}>
                  Generate More
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {results.map((url, i) => (
                  <div key={i} style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
                    <img src={url.startsWith('http') || url.startsWith('data:') ? url : `data:image/jpeg;base64,${url}`} alt={`Result ${i}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
