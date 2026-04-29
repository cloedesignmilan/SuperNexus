'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, Wand2, Plus, Sparkles, ChevronLeft, ChevronRight, Settings, Info, CheckCircle2, Lock, ArrowRight, Zap, Image as ImageIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

type Snippet = any;


export default function DashboardWizard({ snippets, isAdmin, activeBusinessModes = [], activeSubcategories = [] }: { snippets: Snippet[], isAdmin?: boolean, activeBusinessModes?: any[], activeSubcategories?: any[] }) {
  const [step, setStep] = useState<number>(0)
  
  // Upload State
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Back Upload State
  const [uploadedBackUrl, setUploadedBackUrl] = useState<string | null>(null)
  const [isUploadingBack, setIsUploadingBack] = useState(false)
  const backFileInputRef = useRef<HTMLInputElement>(null)
  
  // Selections
  const [selections, setSelections] = useState<Record<string, Snippet | null>>({
    CLIENT_TYPE: null, IMAGE_GOAL: null, IMAGE_TYPE: null, PRODUCT_TYPE: null, MODEL_OPTION: null, SCENE: null, FORMAT: null, QUANTITY: null
  })
  const [modelAge, setModelAge] = useState<number>(25)

  // Final Prompts
  const [finalPrompt, setFinalPrompt] = useState<string>('')
  const [negativePrompt, setNegativePrompt] = useState<string>('')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // AI Analysis State
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [availableShots, setAvailableShots] = useState<any[]>([])

  // Print Location State
  const [printLocation, setPrintLocation] = useState<string>('front')
  const [showPrintConfirm, setShowPrintConfirm] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Il prompt viene ora calcolato in modo sincrono dentro handleGenerate

  const handleBackFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setIsUploadingBack(true)
      try {
        const formData = new FormData()
        formData.append('file', selected)
        const res = await fetch('/api/web/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) {
          setUploadedBackUrl(data.url)
        } else {
          setError(data.error || 'Upload failed')
        }
      } catch (err) {
        setError('Network error during upload')
      } finally {
        setIsUploadingBack(false)
      }
    }
  }

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
              
              const pLoc = analysisRes.analysis.detectedAttributes?.printLocation;
              if (analysisRes.analysis.detectedProductType === 'tshirt_hoodie' && (pLoc === 'front' || pLoc === 'back')) {
                 setPrintLocation(pLoc);
                 setShowPrintConfirm(true);
              }

              if (analysisRes.analysis.confidence >= 0.8 && analysisRes.analysis.detectedProductType) {
                const matchMap: Record<string, string> = {
                  'swimwear': 'Swimwear',
                  'women_clothing': 'Dress / Elegant',
                  'men_clothing': 'Dress / Elegant',
                  'tshirt_hoodie': 'T-shirt',
                  'shoes': 'Shoes',
                  'bags': 'Bags',
                  'jewelry': 'Jewelry',
                  'ceremony_elegant': 'Dress / Elegant',
                  'accessories': 'Bags'
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


  const getMappedCategorySlug = (aiType?: string) => {
    if (!aiType) return 't-shirt';
    const type = aiType.toLowerCase();
    if (type.includes('tshirt') || type.includes('hoodie') || type.includes('top') || type.includes('sweat') || type.includes('shirt')) return 't-shirt';
    if (type.includes('women') || type.includes('ceremony') || type.includes('dress') || type.includes('gown') || type.includes('suit') || type.includes('blazer') || type.includes('tuxedo') || type.includes('formal') || type.includes('jacket')) return 'dress';
    if (type.includes('bag')) return 'bags';
    if (type.includes('jewel') || type.includes('accessories')) return 'jewelry';
    if (type.includes('shoe') || type.includes('sneaker') || type.includes('boot')) return 'shoes';
    if (type.includes('swim') || type.includes('beach') || type.includes('bikini')) return 'swimwear';
    return 't-shirt'; // Default fallback
  };

  const handleSnippetSelect = (type: string, snip: Snippet, stepIndex: number) => {
    const newSelections = { ...selections, [type]: snip };
    
    if (stepIndex === 0.75 && type === 'PRODUCT_TYPE') {
      // Manual override of AI detection
      const typeMap: Record<string, string> = {
        'swimwear': 'Swimwear',
        'women_clothing': 'Dress / Elegant',
        'tshirt_hoodie': 'T-shirt',
        'shoes': 'Shoes',
        'bags': 'Bags',
        'jewelry': 'Jewelry'
      };
      
      setAnalysisData((prev: any) => ({
        ...prev,
        detectedProductType: Object.keys(typeMap).find(k => typeMap[k] === snip.label) || 'unknown'
      }));
      setSelections(newSelections);
      setTimeout(() => setStep(1), 350);
      return;
    }

    // Auto-advance logic for standard steps
    if (type !== 'QUANTITY' && type !== 'FORMAT') {
      
      if (type === 'IMAGE_TYPE') {
        setSelections(newSelections);
        // Find if this BusinessMode has only 1 subcategory
        const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
        const activeSubNames = activeSubcategories
           .filter(sub => sub.business_mode.category.slug === detectedCat && sub.business_mode.name === snip.label)
           .map(sub => sub.name);
        
        if (activeSubNames.length === 1) {
           const modelSnip = snippets.find(s => s.snippet_type === 'MODEL_OPTION' && s.label === activeSubNames[0]);
           if (modelSnip) {
              newSelections['MODEL_OPTION'] = modelSnip;
              setSelections(newSelections);
              
              if (modelSnip.label !== 'No Model' && modelSnip.label !== 'STILL LIFE PACK') {
                 setTimeout(() => setStep(2.5), 350);
              } else {
                 setTimeout(() => setStep(3), 350); // Vai a FORMAT_QUANTITY
              }
              return;
           }
        }
        
        // Go to MODEL_OPTION
        setTimeout(() => setStep(2), 350);
        return;
      }

      setSelections(newSelections);
      
      if (type === 'MODEL_OPTION') {
         if (snip.label !== 'No Model' && snip.label !== 'STILL LIFE PACK') {
            setTimeout(() => setStep(2.5), 350);
            return;
         }
         setTimeout(() => setStep(3), 350);
         return;
      }

      if (type === 'CLIENT_TYPE') {
         setTimeout(() => setStep(3), 350);
         return;
      }

      setTimeout(() => {
        setStep(stepIndex + 1);
      }, 350);
    } else {
      setSelections(newSelections);
    }
  }

  const handleGenerate = async () => {
    if (!uploadedUrl) return;
    setIsGenerating(true)
    setError(null)
    setResults([])

    // CALCOLO SINCRONO DEL PROMPT PRIMA DEL FETCH
    let syncFPrompt = "";
    let syncNPrompt = "";

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
          syncFPrompt += frag + ", ";
       }
       if (s.negative_fragment) {
          syncNPrompt += s.negative_fragment.trim() + ", ";
       }
    });

    if (selections['MODEL_OPTION'] && selections['MODEL_OPTION'].label !== 'No Model' && selections['MODEL_OPTION'].label !== 'STILL LIFE PACK') {
       syncFPrompt = `${modelAge} years old model, ` + syncFPrompt;
    }

    const isUGC = selections['IMAGE_TYPE']?.label?.includes('UGC') || selections['MODEL_OPTION']?.label?.includes('UGC') || selections['MODEL_OPTION']?.label?.includes('Candid');
    if (isUGC) {
       const ugcRules = "[UGC REALISM MODE (HARD): This must NOT look like a professional photoshoot. Simulate a real iPhone photo taken by a normal person. Rules: imperfect framing (slightly off-center), slight motion blur allowed, uneven natural lighting (no studio light), realistic skin texture (pores, small imperfections), casual pose (not posed, not model-like), handheld feeling (not tripod), slightly tilted horizon allowed, background not perfectly clean, depth of field must be flat (like smartphone). Camera simulation: iPhone camera, no cinematic blur, no professional lens look, natural exposure, slightly over or under exposed allowed. IMPORTANT: This must feel like 'a real girl on vacation took this photo quickly' NOT 'a fashion brand campaign'. Natural style is allowed, but product accuracy has priority over lifestyle creativity. Do not add accessories unless explicitly requested.] ";
       syncFPrompt = "iPhone style, natural lighting, candid, imperfect realism, " + ugcRules + syncFPrompt;
       syncNPrompt = "studio lighting, DSLR, perfect skin, CGI, render, airbrushed, professional photoshoot, cinematic blur, depth of field, posed model, perfect framing, added accessories, sunglasses, bag, hat, jewelry, props, " + syncNPrompt;
    }

    if (analysisData?.detectedProductType === 'swimwear') {
       const swimwearRules = "[ABSOLUTE PRODUCT FIDELITY] The AI must treat the uploaded product image as the absolute source of truth. Preserve the exact print placement, exact pattern scale, exact color tones, exact trim, exact straps, ties, rings, stitching and cut. Do NOT simplify the product. Do NOT reinterpret the design. For this reference: The bikini has brown and white gingham panels, brown polka-dot trim, thin straps, side ties, and a central metal ring. These details must remain visible and consistent in every generated image. The model must clearly be wearing this exact bikini suitable for beach or pool environments. ";
       syncFPrompt = swimwearRules + syncFPrompt;
       syncNPrompt = "changed pattern, smaller pattern, larger pattern, simplified print, missing ring, changed trim, changed straps, changed ties, added accessories, sunglasses, bag, hat, jewelry, props, studio fashion looks, winter, heavy clothing, modified product, different color, different shape, " + syncNPrompt;
    }

    if (analysisData?.detectedProductType === 'shoes' && selections['IMAGE_TYPE']?.label?.includes('Catalog')) {
       const shoesCatalogRules = "[CLEAN CATALOG MODE – SHOES (STRICT ECOMMERCE)] The uploaded shoe is the ONLY reference. CRITICAL: The shoe must be reproduced EXACTLY as in the original image. No changes allowed. PRODUCT LOCK (VERY STRICT): exact shape and proportions, exact colors and materials, exact stitching and seams, exact logo placement, exact sole structure, exact laces style and color. DO NOT: redesign, simplify, smooth details, change textures, modify branding. If the product differs → INVALID. SHOOTING STYLE: professional ecommerce packshot, clean studio background (pure white or light grey), softbox lighting (diffused, shadow soft and minimal), ultra sharp focus, no reflections, no dramatic shadows. COMPOSITION: Each image must show a DIFFERENT angle (3/4 front view, side view, top view, pair front view, back view, sole bottom view, detail close-up). FRAMING: centered product, consistent scale across images, full product visible, no cropping. BACKGROUND: pure white (#ffffff) or soft grey, no environment, no props, no people. FINAL GOAL: This must look like a real ecommerce product listing from a premium brand. Consistency and accuracy are more important than aesthetics. DISABLE AI CREATIVITY: Do not add artistic interpretation. Do not improve the design. Do not stylize the product. This is a technical reproduction, not a creative image. ";
       syncFPrompt = shoesCatalogRules + syncFPrompt;
       syncNPrompt = "redesigned product, simplified product, smooth details, changed textures, modified branding, environment, props, people, lifestyle, reflection, dramatic shadows, " + syncNPrompt;
    }

    const syncGlobalNegative = "logos, apple logo, brand marks, watermarks, text, typography, fonts, graphics, words, signatures, symbols, patches, icons, " + syncNPrompt;

    const finalComputedPrompt = syncFPrompt.replace(/, $/, '');
    const finalComputedNegative = syncGlobalNegative.replace(/, $/, '');
    
    setFinalPrompt(finalComputedPrompt);
    setNegativePrompt(finalComputedNegative);

    try {
      const qtySnippet = selections['QUANTITY'];
      const aspectRatioSnippet = selections['FORMAT'];
      
      const clientTypeSnip = selections['CLIENT_TYPE'];
      const clientGender = clientTypeSnip?.id === 'gender-man' ? 'MAN' : (clientTypeSnip?.id === 'gender-woman' ? 'WOMAN' : null);

      let taxonomyModeMapped = selections['IMAGE_TYPE']?.label || null;
      if (taxonomyModeMapped) {
        if (taxonomyModeMapped.includes('UGC')) taxonomyModeMapped = 'UGC';
        else if (taxonomyModeMapped.includes('Catalog') || taxonomyModeMapped.includes('Ecommerce') || taxonomyModeMapped.includes('Clean')) taxonomyModeMapped = 'Clean Catalog';
        else if (taxonomyModeMapped.includes('Ad') || taxonomyModeMapped.includes('Scroll')) taxonomyModeMapped = 'Ads / Scroll Stopper';
        else if (taxonomyModeMapped.includes('Detail') || taxonomyModeMapped.includes('Texture')) taxonomyModeMapped = 'Detail / Texture';
        else if (taxonomyModeMapped.includes('Model') || taxonomyModeMapped.includes('Studio')) taxonomyModeMapped = 'Model Studio';
        else taxonomyModeMapped = 'Lifestyle';
      }

      const payload = {
        imageUrl: uploadedUrl,
        finalPrompt: finalComputedPrompt || "Taxonomy Auto Prompt",
        negativePrompt: finalComputedNegative,
        qty: qtySnippet ? parseInt(qtySnippet.label, 10) : 1,
        aspectRatio: aspectRatioSnippet ? aspectRatioSnippet.label : '4:5',
        selectedSnippetIds: Object.values(selections).filter(Boolean).map(s => s.id),
        taxonomyCat: getMappedCategorySlug(selections['PRODUCT_TYPE']?.label || analysisData?.detectedProductType),
        taxonomyMode: taxonomyModeMapped,
        taxonomySubcat: selections['MODEL_OPTION']?.label || null,
        specificShotNumber: selections['SPECIFIC_SHOT']?.shot_number || undefined,
        clientGender,
        detectedProductType: analysisData?.detectedProductType,
        printLocation: printLocation,
        imageBackUrl: uploadedBackUrl
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
        setStep(6)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    if (step === 3) {
      // Check if we skipped step 2
      const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
      const activeSubNames = activeSubcategories
           .filter(sub => sub.business_mode.category.slug === detectedCat && sub.business_mode.name === selections['IMAGE_TYPE']?.label)
           .map(sub => sub.name);
      if (activeSubNames.length === 1) return setStep(1); // Go back to IMAGE_TYPE
      return setStep(2);
    }
    setStep(Math.max(0, step === 2.5 ? 2 : step === 0.75 ? 0 : step - 1));
  };

  const renderSnippetGridInternal = (type: string, stepIndex: number) => {
    if (type === 'IMAGE_TYPE') {
      const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
      const customOptions = activeBusinessModes
        .filter(bm => bm.category.slug === detectedCat)
        .map(bm => {
          let icon = 'Box';
          if (bm.name === 'Clean Catalog') icon = 'ShoppingBag';
          else if (bm.name === 'Model Studio') icon = 'User';
          else if (bm.name === 'Lifestyle') icon = 'Camera';
          else if (bm.name === 'UGC') icon = 'Smartphone';
          else if (bm.name === 'Ads / Scroll Stopper') icon = 'Zap';
          else if (bm.name === 'Detail / Texture') icon = 'Search';
          
          return {
             id: bm.id,
             label: bm.name,
             description: bm.description,
             icon,
             prompt_fragment: '',
             negative_fragment: ''
          }
        });

      return (
        <div className="glass-grid">
          {customOptions.map(snip => {
            const isSelected = selections[type]?.id === snip.id;
            const IconComp = (Icons as any)[snip.icon || 'Box'] || Icons.Box;
            return (
              <button 
                key={snip.id} 
                onClick={() => handleSnippetSelect(type, snip, stepIndex)} 
                className={`glass-card ${isSelected ? 'selected' : ''}`} 
              >
                <IconComp size={28} className="card-icon" />
                <div className="card-title">{snip.label}</div>
                <div className="card-desc">{snip.description}</div>
              </button>
            )
          })}
        </div>
      );
    }

    let typeSnippets = snippets.filter(s => s.snippet_type === type);
    
    // STRICT TAXONOMY ENFORCEMENT
    if (type === 'MODEL_OPTION') {
      const mode = selections['IMAGE_TYPE']?.label;
      const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
      
      const activeSubNames = activeSubcategories
        .filter(sub => sub.business_mode.category.slug === detectedCat && sub.business_mode.name === mode)
        .map(sub => sub.name);

      typeSnippets = typeSnippets.filter(s => activeSubNames.includes(s.label));
    }
    
    // FORMAT / QUANTITY MICROCOPY OVERRIDE
    if (type === 'FORMAT') {
      typeSnippets = typeSnippets.map(s => {
        let cloned = { ...s };
        if (cloned.label === '4:5') cloned.description = 'Best for Instagram';
        if (cloned.label === '1:1') cloned.description = 'Ecommerce';
        if (cloned.label === '9:16') cloned.description = 'TikTok / Reels';
        if (cloned.label === '16:9') cloned.description = 'Website / banners';
        return cloned;
      });
    }

    if (type === 'QUANTITY') {
      typeSnippets = typeSnippets.map(s => {
        let cloned = { ...s };
        if (cloned.label === '1') cloned.description = 'Basic';
        if (cloned.label === '3') cloned.description = '⭐ Most popular';
        if (cloned.label === '5') cloned.description = '🔥 Better variety';
        if (cloned.label === '10') cloned.description = '⚡ Pro pack';
        return cloned;
      });
    }

    // SMART FILTERING BASED ON AI ANALYSIS
    if (analysisData && analysisData.detectedProductType) {
      const pType = analysisData.detectedProductType;
      
      // Strict Swimwear Override
      if (pType === 'swimwear') {
        if (type === 'SCENE') {
          typeSnippets = [
            { id: 'sw_beach', label: 'Tropical Beach', description: 'Crystal clear water and white sand', icon: 'Sun', prompt_fragment: 'tropical beach background, white sand, crystal clear ocean water, sunny day', negative_fragment: 'indoor, dark', sort_group: '✨ AI Suggested' },
            { id: 'sw_pool', label: 'Pool', description: 'Luxury swimming pool setting', icon: 'Droplets', prompt_fragment: 'luxury swimming pool edge, clear blue water, sunny day reflections', negative_fragment: 'indoor, dirty', sort_group: '✨ AI Suggested' },
            { id: 'sw_resort', label: 'Resort / Vacation', description: 'Premium resort or tropical villa', icon: 'Palmtree', prompt_fragment: 'premium tropical resort background, palm trees, luxury villa', negative_fragment: 'cheap, urban, city', sort_group: '✨ AI Suggested' },
            { id: 'sw_summer', label: 'Summer Lifestyle', description: 'Natural summer vibe and aesthetics', icon: 'Camera', prompt_fragment: 'summer lifestyle background, natural outdoor lighting, sunny', negative_fragment: 'winter, snow, dark', sort_group: '✨ AI Suggested' }
          ];
          if (selections['IMAGE_TYPE']?.label?.includes('Catalog')) {
            typeSnippets.push({ id: 'sw_studio', label: 'Studio clean', description: 'Simple background for ecommerce', icon: 'Box', prompt_fragment: 'clean studio background, solid color, softbox lighting', negative_fragment: 'outdoor, messy, nature', sort_group: 'Other styles' });
          }
        }
      } else {
        typeSnippets = typeSnippets.map(s => {
          let cloned = { ...s };
          const label = cloned.label.toLowerCase();
          
          let isRecommended = false;
          let isLowPriority = false;
          
          if (pType === 'shoes') {
           if (type === 'IMAGE_GOAL' && label.includes('ecommerce')) isRecommended = true;
           if (type === 'MODEL_OPTION' && (label.includes('on-foot') || label.includes('sole') || label.includes('3/4') || label.includes('side'))) isRecommended = true;
           if (type === 'MODEL_OPTION' && label.includes('woman model')) isLowPriority = true;
           if (type === 'SCENE' && label.includes('beach')) isLowPriority = true;
        } else if (pType === 'tshirt_hoodie') {
           if (type === 'MODEL_OPTION' && (label.includes('wearing') || label.includes('selfie') || label.includes('flat'))) isRecommended = true;
           if (type === 'SCENE' && (label.includes('streetwear') || label.includes('urban'))) isRecommended = true;
        } else if (pType === 'women_clothing' || pType === 'ceremony_elegant') {
           if (type === 'MODEL_OPTION' && label.includes('woman')) isRecommended = true;
           if (type === 'SCENE' && (label.includes('premium') || label.includes('ceremony') || label.includes('studio'))) isRecommended = true;
        } else if (pType === 'bags' || pType === 'accessories') {
           if (type === 'MODEL_OPTION' && (label.includes('hand') || label.includes('detail') || label.includes('flat'))) isRecommended = true;
           if (type === 'SCENE' && (label.includes('boutique') || label.includes('luxury'))) isRecommended = true;
        } else if (pType === 'jewelry') {
           if (type === 'MODEL_OPTION' && (label.includes('macro') || label.includes('neck') || label.includes('ear') || label.includes('hand'))) isRecommended = true;
           if (type === 'SCENE' && (label.includes('studio') || label.includes('shine'))) isRecommended = true;
        }

          if (isRecommended) cloned.sort_group = '✨ AI Suggested';
          else if (isLowPriority) cloned.sort_group = 'Other styles';

          return cloned;
        });
      }
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

  const renderSnippetGrid = (type: string, stepIndex: number) => {
    if (type === 'FORMAT_QUANTITY') {
      const hasModel = selections['MODEL_OPTION'] && selections['MODEL_OPTION'].label !== 'No Model' && selections['MODEL_OPTION'].label !== 'STILL LIFE PACK';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {hasModel && (
            <div>
              <h3 style={{fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'}}>1. Model Age</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <input 
                    type="range" 
                    min="20" max="50" step="5"
                    value={modelAge} 
                    onChange={e => setModelAge(parseInt(e.target.value))} 
                    style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--color-primary)' }} 
                  />
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, minWidth: '60px', textAlign: 'right', color: 'var(--color-primary)' }}>{modelAge} yrs</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>
                  <span>20</span>
                  <span>25</span>
                  <span>30</span>
                  <span>35</span>
                  <span>40</span>
                  <span>45</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          )}
          <div>
            <h3 style={{fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'}}>{hasModel ? '2' : '1'}. Aspect Ratio</h3>
            {renderSnippetGridInternal('FORMAT', stepIndex)}
          </div>
          <div>
            <h3 style={{fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'}}>{hasModel ? '3' : '2'}. Quantity</h3>
            {renderSnippetGridInternal('QUANTITY', stepIndex)}
          </div>
        </div>
      );
    }
    return renderSnippetGridInternal(type, stepIndex);
  }

  const stepsData = [
    { num: 1, type: 'IMAGE_TYPE', title: 'What kind of image do you want?', desc: '' },
    { num: 2, type: 'MODEL_OPTION', title: 'Who wears it & how?', desc: '' },
    { num: 3, type: 'FORMAT_QUANTITY', title: 'Format and quantity', desc: '' },
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
        /* Overlay Badge */
        .desktop-overlay-badge {
           position: absolute;
           bottom: 16px;
           left: 16px;
           background: rgba(0, 0, 0, 0.4);
           backdrop-filter: blur(12px);
           -webkit-backdrop-filter: blur(12px);
           border: 1px solid rgba(255, 255, 255, 0.15);
           border-radius: 16px;
           padding: 10px 14px;
           display: flex;
           align-items: center;
           gap: 12px;
           z-index: 10;
           box-shadow: 0 8px 32px rgba(0,0,0,0.3);
           max-width: calc(100% - 32px);
           overflow: hidden;
        }

        .desktop-change-btn {
           position: absolute;
           top: 16px;
           right: 16px;
           background: rgba(0, 0, 0, 0.4);
           backdrop-filter: blur(12px);
           border: 1px solid rgba(255, 255, 255, 0.15);
           color: #fff;
           padding: 6px 12px;
           border-radius: 99px;
           font-size: 0.75rem;
           font-weight: 600;
           cursor: pointer;
           z-index: 10;
           transition: background 0.2s;
           display: flex;
           align-items: center;
           gap: 4px;
        }
        .desktop-change-btn:hover { background: rgba(255, 255, 255, 0.15); }

        .mobile-header-content { display: none; }

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
          .desktop-overlay-badge { display: none !important; }
          .desktop-change-btn { display: none !important; }

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
        <div className={`image-frame ${!uploadedUrl ? 'empty' : ''}`} style={{ position: 'relative' }}>
          {uploadedUrl ? (
            <>
              <img src={uploadedUrl} alt="Uploaded product" />
              {step > 0 && step < 9 && (
                <>
                  <div className="desktop-overlay-badge">
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }}>
                      <img src={uploadedUrl} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>Product Uploaded</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize', marginTop: '2px', fontWeight: 500 }}>
                        {analysisData ? analysisData.detectedProductType?.replace('_', ' ') : 'Ready'}
                      </div>
                    </div>
                  </div>
                  <button className="desktop-change-btn" onClick={() => { setStep(0); setUploadedUrl(null); }}>
                    Change Image
                  </button>
                </>
              )}
            </>
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
            <button className="back-button" onClick={handleBack}>
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

                  {showPrintConfirm && (
                     <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                        <div style={{ fontWeight: 600, marginBottom: '1rem' }}>AI detected a print on the: {printLocation.toUpperCase()}. Please confirm.</div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                          <button onClick={() => setPrintLocation('front')} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid', borderColor: printLocation === 'front' ? '#3b82f6' : 'rgba(255,255,255,0.2)', background: printLocation === 'front' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                            Front Print
                          </button>
                          <button onClick={() => setPrintLocation('back')} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid', borderColor: printLocation === 'back' ? '#3b82f6' : 'rgba(255,255,255,0.2)', background: printLocation === 'back' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                            Back Print
                          </button>
                        </div>
                     </div>
                  )}

                  {analysisData.detectedProductType === 'tshirt_hoodie' && !uploadedBackUrl && (
                     <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Do you also have an image of the back? Upload it to allow the AI to generate perfect front/back shots.</div>
                        <input type="file" ref={backFileInputRef} onChange={handleBackFileChange} accept="image/*" style={{ display: 'none' }} />
                        <button onClick={() => backFileInputRef.current?.click()} disabled={isUploadingBack} style={{ background: '#fff', color: '#000', padding: '0.6rem 1.5rem', borderRadius: '99px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           {isUploadingBack ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                           {isUploadingBack ? 'Uploading...' : 'Add Back View (Optional)'}
                        </button>
                     </div>
                  )}
                  {uploadedBackUrl && (
                     <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                           <img src={uploadedBackUrl} alt="Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                           <div style={{ fontWeight: 600, color: '#10b981' }}>Back View Uploaded</div>
                           <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>The AI will now generate mixed 360° shots</div>
                        </div>
                     </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => setStep(1)} className="btn-magic">
                      Looks Good <ArrowRight size={18} />
                    </button>
                    <button onClick={() => { setStep(0.75); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '100px', color: '#ffffff', fontSize: '0.9rem', padding: '0.8rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      Change Type
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="step-header">Analysis Skipped</h2>
                  <button onClick={() => setStep(0.75)} className="btn-giant">Continue <ArrowRight size={18} /></button>
                </>
              )}
            </div>
          )}

          {/* STEP 0.75: MANUAL PRODUCT TYPE SELECTION */}
          {step === 0.75 && (
            <div className="fade-up-enter">
              <h2 className="step-header">Product Type</h2>
              <p className="step-desc">What exactly are we photographing?</p>
              {renderSnippetGridInternal('PRODUCT_TYPE', 0.75)}
            </div>
          )}


          {/* DYNAMIC STEPS 1-3 */}
          {step >= 1 && step <= 3 && step !== 2.5 && (
            <div className="fade-up-enter">
              <h2 className="step-header">{stepsData[step-1].title}</h2>
              <p className="step-desc">{stepsData[step-1].desc}</p>
              
              {renderSnippetGrid(stepsData[step-1].type, step)}
              
              {/* Only show NEXT button if it's the FORMAT_QUANTITY step */}
              {step === 3 && (
                <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={async () => {
                     const qtyStr = selections['QUANTITY']?.label?.toString().trim();
                     if (qtyStr === '1' || qtyStr === '1 Image' || qtyStr === '1 Foto') {
                         try {
                             const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
                             const res = await fetch('/api/web/get-shots', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({
                                     categorySlug: detectedCat,
                                     modeSlug: selections['IMAGE_TYPE']?.label || '',
                                     presentationSlug: selections['MODEL_OPTION']?.label || ''
                                 })
                             });
                             if (res.ok) {
                                 const data = await res.json();
                                 if (data.shots && data.shots.length > 0) {
                                     setAvailableShots(data.shots);
                                     setStep(3.5);
                                     return;
                                 }
                             }
                         } catch (e) {
                             console.error("Error fetching shots:", e);
                         }
                     }
                     setStep(4);
                  }} disabled={!selections['FORMAT'] || !selections['QUANTITY']} className="btn-giant">
                    Review Configuration <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2.5: MANUAL GENDER SELECTION (AI DOUBT OR TSHIRT SAFETY) */}
          {step === 2.5 && (
            <div className="fade-up-enter">
              <h2 className="step-header">Who is wearing it?</h2>
              <p className="step-desc">Please confirm the target audience to ensure perfect modeling.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                 {[
                   { label: 'MAN', display: 'MAN', id: 'gender-man', prompt: 'male fashion model, handsome man', negative: 'female, woman, girl, breasts, feminine features' },
                   { label: 'WOMAN', display: 'WOMAN', id: 'gender-woman', prompt: 'female fashion model, beautiful woman', negative: 'male, man, boy, facial hair, masculine features' }
                 ].map(gender => (
                    <div 
                      key={gender.id}
                      className={`snippet-card ${selections['CLIENT_TYPE']?.id === gender.id ? 'active' : ''}`}
                      onClick={() => handleSnippetSelect('CLIENT_TYPE', { id: gender.id, label: gender.label, snippet_type: 'CLIENT_TYPE', prompt_fragment: gender.prompt, negative_fragment: gender.negative, intensity_level: 'strong' }, 2.5)}
                    >
                      <Icons.User size={24} style={{ color: selections['CLIENT_TYPE']?.id === gender.id ? '#60a5fa' : 'rgba(255,255,255,0.4)', marginBottom: '1rem' }} />
                      <div className="snippet-title">{gender.display}</div>
                      <div className="snippet-desc">Generate images using a {gender.label.toLowerCase()}</div>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* STEP 3.5: SPECIFIC SHOT SELECTION (ONLY IF QUANTITY = 1) */}
          {step === 3.5 && (
            <div className="fade-up-enter">
              <h2 className="step-header">Select Specific Shot</h2>
              <p className="step-desc">Since you selected 1 image, which specific shot do you want?</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                 {availableShots.map(shot => (
                    <div 
                      key={shot.shot_number}
                      className={`snippet-card ${selections['SPECIFIC_SHOT']?.shot_number === shot.shot_number ? 'active' : ''}`}
                      onClick={() => {
                          setSelections({ ...selections, SPECIFIC_SHOT: shot });
                          setTimeout(() => setStep(4), 350);
                      }}
                    >
                      <Icons.Camera size={24} style={{ color: selections['SPECIFIC_SHOT']?.shot_number === shot.shot_number ? '#60a5fa' : 'rgba(255,255,255,0.4)', marginBottom: '1rem' }} />
                      <div className="snippet-title">{shot.shot_name}</div>
                      <div className="snippet-desc" style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Shot {shot.shot_number}</div>
                    </div>
                 ))}
                 
                 {/* Fallback Option */}
                 <div 
                    className={`snippet-card ${!selections['SPECIFIC_SHOT'] ? 'active' : ''}`}
                    onClick={() => {
                        setSelections({ ...selections, SPECIFIC_SHOT: null });
                        setTimeout(() => setStep(4), 350);
                    }}
                  >
                    <Icons.Wand2 size={24} style={{ color: !selections['SPECIFIC_SHOT'] ? '#60a5fa' : 'rgba(255,255,255,0.4)', marginBottom: '1rem' }} />
                    <div className="snippet-title">Any / Random</div>
                    <div className="snippet-desc" style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Let AI decide</div>
                  </div>
              </div>
            </div>
          )}

          {/* FINAL STEP 4: SUMMARY & GENERATE */}
          {step === 4 && (
            <div className="fade-up-enter">
              <h2 className="step-header">Ready to Generate</h2>
              <p className="step-desc">Your product will stay 100% faithful to your original image.</p>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2.5rem', marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                {uploadedUrl && (
                  <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                    <img src={uploadedUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>Product</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 500, textTransform: 'capitalize' }}>{analysisData?.detectedProductType?.replace('_', ' ') || 'Custom'}</div>
                  </div>
                  {stepsData.map(st => {
                    if (st.type === 'FORMAT_QUANTITY') {
                      return (
                        <div key={st.type}>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>{st.title.split('?')[0]}</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{selections['FORMAT']?.label || '-'} / {selections['QUANTITY']?.label || '-'}</div>
                        </div>
                      )
                    }
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

               <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                 <button onClick={handleGenerate} className="btn-magic" style={{ maxWidth: '400px' }}>
                   Generate {selections['QUANTITY']?.label || '1'} {selections['QUANTITY']?.label === '1' ? 'Image' : 'Images'} <Wand2 size={24} />
                 </button>
               </div>
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
          {step === 6 && results.length > 0 && (
            <div className="fade-up-enter">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                  <h2 className="step-header" style={{ marginBottom: 0 }}>Results</h2>
                </div>
                <button onClick={() => { setStep(1); setResults([]); }} className="btn-giant" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem 2rem', color: '#fff', fontSize: '1rem' }}>
                  Generate More
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {results.map((resItem, i) => {
                  const url = typeof resItem === 'string' ? resItem : resItem.url;
                  const shotNum = resItem.shotNumber ? `Shot ${resItem.shotNumber}` : `Image ${i+1}`;
                  const shotName = resItem.shotName || '';
                  
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          {shotNum}
                        </span>
                        {shotName && (
                          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                            {shotName}
                          </span>
                        )}
                      </div>
                      <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
                        <img src={url.startsWith('http') || url.startsWith('data:') ? url : `data:image/jpeg;base64,${url}`} alt={`Result ${i}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
