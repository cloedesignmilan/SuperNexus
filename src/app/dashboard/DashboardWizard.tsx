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

  // Dynamic Progress State
  const [generationProgress, setGenerationProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dynamic Progress Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationProgress(0);
      const qtyLabel = selections['QUANTITY']?.label?.toString().trim() || '3';
      const qty = parseInt(qtyLabel.split(' ')[0]) || 3;
      const totalSeconds = qty * 30;
      const updateIntervalMs = 500;
      const totalSteps = (totalSeconds * 1000) / updateIntervalMs;
      const increment = 100 / totalSteps;
      
      interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 98) return prev; // Hold at 98% until actually done
          return prev + increment;
        });
      }, updateIntervalMs);
    }
    return () => clearInterval(interval);
  }, [isGenerating, selections]);

  // Default selections per Format e Quantity
  useEffect(() => {
    if (snippets && snippets.length > 0) {
      setSelections(prev => {
        let updated = { ...prev };
        let changed = false;
        if (!prev.FORMAT) {
          const defaultFormat = snippets.find(s => s.snippet_type === 'FORMAT' && s.label === '4:5');
          if (defaultFormat) {
            updated.FORMAT = defaultFormat;
            changed = true;
          }
        }
        if (!prev.QUANTITY) {
          const defaultQty = snippets.find(s => s.snippet_type === 'QUANTITY' && s.label?.toString().trim().startsWith('3'));
          if (defaultQty) {
            updated.QUANTITY = defaultQty;
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }
  }, [snippets]);

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

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      // Detect if user is on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

      // Web Share API per Mobile (Apre il menu nativo di iOS/Android con l'opzione "Salva Immagine")
      if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'SuperNexus AI',
          text: 'My stunning AI product imagery'
        });
        return;
      }

      // Fallback per Desktop: Download Diretto
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      console.error('Error downloading image:', error);
      
      // Ignora l'errore se l'utente annulla il menu di share o clicca due volte velocemente
      if (error.name === 'AbortError' || error.name === 'InvalidStateError') {
        return;
      }
      
      // Fallback finale: apri in nuova scheda
      window.open(url, '_blank');
    }
  };

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
    if (step === 4) {
       const qtyStr = selections['QUANTITY']?.label?.toString();
       if (qtyStr === '1' || qtyStr === '1 Image' || qtyStr === '1 Foto') return setStep(3.5);
       return setStep(3);
    }
    if (step === 3.5) return setStep(3);
    if (step === 3) {
      const needsGender = analysisData?.needsGenderClarification && !!selections['CLIENT_TYPE'];
      if (needsGender) return setStep(2.5);
      
      const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
      const activeSubNames = activeSubcategories
           .filter(sub => sub.business_mode.category.slug === detectedCat && sub.business_mode.name === selections['IMAGE_TYPE']?.label)
           .map(sub => sub.name);
      if (activeSubNames.length === 1) return setStep(1); 
      return setStep(2);
    }
    if (step === 2.5) {
      const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
      const activeSubNames = activeSubcategories
           .filter(sub => sub.business_mode.category.slug === detectedCat && sub.business_mode.name === selections['IMAGE_TYPE']?.label)
           .map(sub => sub.name);
      if (activeSubNames.length === 1) return setStep(1); 
      return setStep(2);
    }
    if (step === 2) return setStep(1);
    if (step === 1) return setStep(0.75); 
    if (step === 0.75) return setStep(0);
    setStep(0);
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
                <IconComp size={38} className="card-icon" />
                <div className="card-title">{snip.label}</div>
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
                      {snip.is_recommended && <Sparkles className="sparkle-icon" size={14} />}
                      <IconComp size={38} className="card-icon" />
                      <div className="card-title">{snip.label}</div>
                      
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#2c2c2e', padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <input 
                    type="range" 
                    min="20" max="50" step="5"
                    value={modelAge} 
                    onChange={e => setModelAge(parseInt(e.target.value))} 
                    style={{ flex: 1, cursor: 'pointer', accentColor: '#00d2ff' }} 
                  />
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, minWidth: '60px', textAlign: 'right', color: '#00d2ff' }}>{modelAge} yrs</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px', color: '#8e8e93', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
          overflow: hidden;
          position: fixed;
          top: 72px; /* Assuming header is ~72px */
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
        }

        /* Remove the orbs */
        .orb { display: none; }

        /* Split Screen - Desktop */
        .studio-left {
          flex: 1.5; /* Takes more space for the image */
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          position: relative;
          z-index: 10;
          padding: 2rem;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .studio-right {
          width: 450px;
          flex-shrink: 0;
          overflow-y: auto;
          background: #1c1c1e;
          position: relative;
          z-index: 10;
        }

        .scroll-container {
          padding: 2.5rem 2.5rem 6rem 2.5rem;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        /* Image Frame */
        .image-frame {
          width: 100%;
          height: 100%;
          max-height: 85vh;
          max-width: 85vh;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-frame img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .image-frame.empty { border: none; }

        /* UI Elements */
        .step-header {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          line-height: 1.1;
        }

        .step-desc {
          color: #8e8e93;
          font-size: 1rem;
          margin-bottom: 2.5rem;
          font-weight: 400;
        }

        .group-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #8e8e93;
          margin-bottom: 1rem;
          font-weight: 600;
          padding-left: 4px;
        }

        .glass-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }

        .glass-card {
          background: #2c2c2e;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 1rem 0.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          color: #fff;
          aspect-ratio: 1 / 1;
        }

        .glass-card:hover { background: #3a3a3c; }
        .glass-card:active { transform: scale(0.95); }

        .glass-card.selected {
          background: #00d2ff;
          border-color: #00d2ff;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 210, 255, 0.4);
          color: #000;
        }

        .glass-card.warning { opacity: 0.5; }

        .sparkle-icon { position: absolute; top: 0.5rem; right: 0.5rem; color: #00d2ff; }
        .glass-card.selected .sparkle-icon { color: rgba(255,255,255,0.8); }
        
        .card-icon { margin-bottom: 0.5rem; color: #8e8e93; transition: all 0.2s ease; }
        .glass-card:hover .card-icon { color: #fff; }
        .glass-card.selected .card-icon { color: #fff; transform: scale(1.05); }

        .card-title { font-size: 0.8rem; font-weight: 600; margin-bottom: 0; line-height: 1.2; padding: 0 4px; }
        .card-desc { display: none; }

        .conflict-warning { display: none; }
        /* Overlay Badge */
        .desktop-overlay-badge { display: none; }
        .desktop-change-btn { display: none; }
        .mobile-header-content { display: none; }

        .desktop-back-button {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          transition: all 0.2s ease;
        }
        .desktop-back-button:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
        }

        .btn-giant {
          background: #fff;
          color: #000;
          border: none;
          padding: 1.1rem 2rem;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          box-shadow: 0 4px 14px rgba(255,255,255,0.1);
        }
        .btn-giant:active { transform: scale(0.96); opacity: 0.9; }

        .btn-magic {
          background: #00d2ff;
          color: #000;
          border: none;
          padding: 1.1rem 2rem;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          box-shadow: 0 4px 14px rgba(0, 210, 255, 0.2);
        }
        .btn-magic:active { transform: scale(0.96); background: #B5952F; }
        
        .sticky-bottom-action {
          position: sticky;
          bottom: 0;
          padding: 1rem 1.5rem;
          background: rgba(28, 28, 30, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.1);
          margin: 2rem -1.5rem -4rem -1.5rem;
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Navigation Dots */
        .nav-dots { display: none; }

        .back-button {
          background: transparent;
          border: none;
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 1rem;
          cursor: pointer;
          padding: 0;
          margin-bottom: 1rem;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .back-button:hover { opacity: 0.8; }
        .back-button span { margin-top: -2px; }

        /* Step Slide Animation */
        .fade-up-enter {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
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
          .studio-layout { flex-direction: column; top: 60px; height: calc(100dvh - 60px); }
          
          /* The Image Stage takes top space */
          .studio-left { 
            flex: none; 
            height: 25dvh; 
            padding: 1rem; 
            border-right: none; 
            background: #000;
            z-index: 10;
          }
          
          .studio-left.collapsed {
            height: 20dvh;
            display: flex;
            background: #000;
            border-bottom: none;
            padding: 1rem;
          }

          .mobile-header-content {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            background: #000;
            position: sticky;
            top: 0;
            z-index: 50;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }

          .mobile-back-button {
            position: absolute;
            left: 1rem;
            background: transparent;
            border: none;
            color: #fff;
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 0.5rem;
          }

          .desktop-back-button { display: none; }

          /* The Controls Bottom Sheet */
          .studio-right { 
            flex: 1; 
            width: 100%;
            background: rgba(18, 18, 20, 0.95); 
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            box-shadow: none;
            z-index: 20; 
            margin-top: 0;
          }
          
          .sticky-bottom-action {
            position: sticky;
            bottom: 0;
            margin: 2rem -1rem 0 -1rem;
            padding: 1rem 1rem calc(1.5rem + env(safe-area-inset-bottom, 20px)) 1rem;
            background: rgba(18, 18, 20, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255,255,255,0.1);
            z-index: 50;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .scroll-container { padding: 1.5rem 1rem calc(8rem + env(safe-area-inset-bottom, 20px)) 1rem; }
          
          .step-header { font-size: 1.5rem; }
          .step-desc { font-size: 0.9rem; margin-bottom: 1.5rem; }

          /* Glass Grid for Mobile */
          .glass-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .gender-grid { grid-template-columns: repeat(2, 1fr) !important; }
          
          .glass-card { padding: 1rem 0.5rem; border-radius: 14px; }
          .glass-card .card-icon { transform: scale(0.9); margin-bottom: 0.25rem; }
          .glass-card .card-title { font-size: 0.75rem; }
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
            {!isGenerating && (
              <button className="mobile-back-button" onClick={handleBack}>
                <ChevronLeft size={24} />
              </button>
            )}
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
              {step === 0.25 ? 'AI Detection' : step === 0.75 ? 'Select Product Type' : step === 3.5 ? 'Select Specific Shot' : step === 4 ? 'Configuration Review' : step === 5 ? 'Generation Complete' : stepsData[Math.floor(step)-1]?.title || 'Options'}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Scrollable Steps */}
      <div className="studio-right">
        
        <div className="scroll-container">

          {step > 0 && step < 9 && !isGenerating && (
              <button className="back-button desktop-back-button" onClick={handleBack}>
                <ChevronLeft size={20} /> <span>Back</span>
              </button>
          )}

          {/* Error Banner */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* STEP 0: UPLOAD */}
          {step === 0 && (
            <div className="fade-up-enter">
              <h1 className="step-header">Upload Product</h1>
              
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              
              <div 
                onClick={() => fileInputRef.current?.click()} 
                style={{ 
                  border: '2px dashed rgba(255,255,255,0.15)', 
                  borderRadius: '24px', 
                  padding: '3rem 2rem', 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  background: 'rgba(255,255,255,0.02)',
                  marginBottom: '2rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              >
                {isUploading ? (
                  <><Loader2 className="animate-spin" size={48} color="#00d2ff" style={{ margin: '0 auto 1rem auto' }} /> <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Uploading...</div></>
                ) : (
                  <>
                    <Upload size={48} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 1rem auto' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Drag & drop your image here<br/>or tap to browse</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>JPG, PNG, WebP up to 50MB</div>
                  </>
                )}
              </div>

              <div style={{ background: '#1c1c1e', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Tips for best results</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={16} color="#00d2ff" /> Use a clear, well-lit photo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={16} color="#00d2ff" /> Plain background works best</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={16} color="#00d2ff" /> Show the entire product</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={16} color="#00d2ff" /> High resolution recommended</div>
                </div>
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
                  <div style={{ background: '#2c2c2e', border: 'none', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#34c759', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} /> AI Detection Complete
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
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', background: '#2c2c2e', padding: '4px', borderRadius: '12px' }}>
                          <button onClick={() => setPrintLocation('front')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: printLocation === 'front' ? '#3a3a3c' : 'transparent', color: printLocation === 'front' ? '#fff' : '#8e8e93', fontWeight: printLocation === 'front' ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', boxShadow: printLocation === 'front' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
                            Front Print
                          </button>
                          <button onClick={() => setPrintLocation('back')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: printLocation === 'back' ? '#3a3a3c' : 'transparent', color: printLocation === 'back' ? '#fff' : '#8e8e93', fontWeight: printLocation === 'back' ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', boxShadow: printLocation === 'back' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
                            Back Print
                          </button>
                        </div>
                     </div>
                  )}

                  {analysisData.detectedProductType === 'tshirt_hoodie' && !uploadedBackUrl && (
                     <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Do you also have an image of the back? Upload it to allow the AI to generate perfect front/back shots.</div>
                        <input type="file" ref={backFileInputRef} onChange={handleBackFileChange} accept="image/*" style={{ display: 'none' }} />
                        <button onClick={() => backFileInputRef.current?.click()} disabled={isUploadingBack} style={{ background: '#2c2c2e', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#3a3a3c'} onMouseOut={(e) => e.currentTarget.style.background = '#2c2c2e'}>
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

                  <div className="sticky-bottom-action">
                    <button onClick={() => setStep(1)} className="btn-magic">
                      Looks Good <ArrowRight size={18} />
                    </button>
                    <button onClick={() => { setStep(0.75); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', color: '#ffffff', fontSize: '1rem', padding: '1.1rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600, width: '100%' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
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
                <div className="sticky-bottom-action">
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
                  }} disabled={!selections['FORMAT'] || !selections['QUANTITY']} className="btn-magic">
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
              
              <div className="glass-grid gender-grid" style={{ marginTop: '2rem' }}>
                 {[
                   { label: 'MAN', display: 'MAN', id: 'gender-man', prompt: 'male fashion model, handsome man', negative: 'female, woman, girl, breasts, feminine features', icon: 'User' },
                   { label: 'WOMAN', display: 'WOMAN', id: 'gender-woman', prompt: 'female fashion model, beautiful woman', negative: 'male, man, boy, facial hair, masculine features', icon: 'User' }
                 ].map(gender => {
                    const isSelected = selections['CLIENT_TYPE']?.id === gender.id;
                    const IconComp = (Icons as any)[gender.icon];
                    return (
                      <button 
                        key={gender.id}
                        className={`glass-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSnippetSelect('CLIENT_TYPE', { id: gender.id, label: gender.label, snippet_type: 'CLIENT_TYPE', prompt_fragment: gender.prompt, negative_fragment: gender.negative, intensity_level: 'strong' }, 2.5)}
                      >
                        <IconComp size={38} className="card-icon" />
                        <div className="card-title">{gender.display}</div>
                      </button>
                    )
                 })}
              </div>
            </div>
          )}

          {/* STEP 3.5: SPECIFIC SHOT SELECTION (ONLY IF QUANTITY = 1) */}
          {step === 3.5 && (
            <div className="fade-up-enter">
              <h2 className="step-header">Select Specific Shot</h2>
              <p className="step-desc">Since you selected 1 image, which specific shot do you want?</p>
              
              <div className="glass-grid gender-grid" style={{ marginTop: '2rem' }}>
                 {availableShots.map(shot => {
                    const isSelected = selections['SPECIFIC_SHOT']?.shot_number === shot.shot_number;
                    return (
                      <button 
                        key={shot.shot_number}
                        className={`glass-card ${isSelected ? 'selected' : ''}`}
                        style={shot.image_url ? { padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' } : undefined}
                        onClick={() => {
                            setSelections({ ...selections, SPECIFIC_SHOT: shot });
                            setTimeout(() => setStep(4), 350);
                        }}
                      >
                        {shot.image_url ? (
                          <div style={{ width: '100%', height: '130px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                            <img src={shot.image_url} alt={shot.shot_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <Icons.Camera size={38} className="card-icon" />
                        )}
                        <div className="card-title" style={shot.image_url ? { fontSize: '0.85rem', marginTop: 0 } : undefined}>{shot.shot_name}</div>
                        <div className="snippet-desc" style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: shot.image_url ? '0' : '0.5rem', color: 'rgba(255,255,255,0.5)' }}>Shot {shot.shot_number}</div>
                      </button>
                    )
                 })}
                 
                 {/* Fallback Option */}
                 <button 
                    className={`glass-card ${!selections['SPECIFIC_SHOT'] ? 'selected' : ''}`}
                    onClick={() => {
                        setSelections({ ...selections, SPECIFIC_SHOT: null });
                        setTimeout(() => setStep(4), 350);
                    }}
                  >
                    <Icons.Wand2 size={38} className="card-icon" />
                    <div className="card-title">Any / Random</div>
                  </button>
              </div>
            </div>
          )}

          {/* FINAL STEP 4: SUMMARY & GENERATE */}
          {step === 4 && !isGenerating && (
            <div className="fade-up-enter">
              <h2 className="step-header">Configuration Review</h2>
              <p className="step-desc">Review your settings before we generate your premium imagery.</p>
              
              <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {uploadedUrl && (
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                      <img src={uploadedUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'capitalize' }}>{analysisData?.detectedProductType?.replace('_', ' ') || 'Custom Product'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category: {analysisData?.detectedProductType?.replace('_', ' ')}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                  {stepsData.map(st => {
                    const sel = selections[st.type];
                    if (!sel) return null;
                    if (st.type === 'FORMAT_QUANTITY') {
                      return (
                        <div key={st.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{st.title.split('?')[0]}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 500, color: '#fff' }}>{selections['FORMAT']?.label || '-'} / {selections['QUANTITY']?.label || '-'}</div>
                        </div>
                      )
                    }
                    return (
                      <div key={st.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{st.title.split('?')[0]}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 500, color: '#fff' }}>{sel.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

               <div className="sticky-bottom-action">
                 <button onClick={handleGenerate} className="btn-magic">
                   Looks Good <ArrowRight size={20} />
                 </button>
                 <button onClick={() => { setStep(3); }} style={{ background: 'transparent', border: 'none', color: '#8e8e93', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600, width: '100%', padding: '0.5rem' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#8e8e93'}>
                   Change Settings
                 </button>
               </div>
            </div>
          )}

          {/* GENERATING STATE */}
          {isGenerating && (
            <div className="fade-up-enter" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 3rem auto' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 210, 255, 0.1)" strokeWidth="4" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#00d2ff" strokeWidth="4" strokeDasharray="283" strokeDashoffset="70" style={{ animation: 'spin 2s linear infinite' }} />
                </svg>
              </div>
              <h2 className="step-header" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Analyzing Product...</h2>
              <p className="step-desc" style={{ marginBottom: '3rem' }}>AI is detecting materials, style, structure and details.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c1c1e', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>Image Analysis</span>
                  <CheckCircle2 size={20} color="#00d2ff" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c1c1e', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>Material Detection</span>
                  <CheckCircle2 size={20} color="#00d2ff" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c1c1e', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>Style Matching</span>
                  <CheckCircle2 size={20} color="#00d2ff" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', background: '#1c1c1e', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#00d2ff', fontWeight: 600 }}>Generating Magic</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#00d2ff', fontWeight: 600 }}>{Math.floor(generationProgress)}%</span>
                      <Loader2 size={16} color="#00d2ff" className="animate-spin" />
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${generationProgress}%`, height: '100%', background: '#00d2ff', transition: 'width 0.5s linear' }} />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '3rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                This may take {parseInt(selections['QUANTITY']?.label?.toString().split(' ')[0] || '3') * 30} seconds
              </div>
            </div>
          )}

          {/* RESULTS STEP */}
          {step === 6 && results.length > 0 && (
            <div className="fade-up-enter">
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.1)', color: '#00d2ff', marginBottom: '1.5rem', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="step-header" style={{ marginBottom: '0.5rem' }}>Your images are ready!</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>We've created {results.length} stunning images for your product.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {results.map((resItem, i) => {
                  const url = typeof resItem === 'string' ? resItem : resItem.url;
                  const shotNum = resItem.shotNumber ? `Shot ${resItem.shotNumber}` : `Image ${i+1}`;
                  let shotName = resItem.shotName || shotNum;

                  // Estrai il nome del file originale senza estensione
                  const originalName = file?.name ? file.name.replace(/\.[^/.]+$/, "") : "Prodotto_SuperNexus";
                  
                  // Genera il filename finale: "[Vista] [Nome Originale].jpeg"
                  const downloadFilename = `${shotName} ${originalName}.jpeg`;
                  
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: '#000', position: 'relative' }}>
                        <img src={url.startsWith('http') || url.startsWith('data:') ? url : `data:image/jpeg;base64,${url}`} alt={`Result ${i}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        <button 
                          onClick={() => handleDownloadImage(url.startsWith('http') || url.startsWith('data:') ? url : `data:image/jpeg;base64,${url}`, downloadFilename)}
                          style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                          title="Save to Camera Roll / Download"
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,210,255,0.8)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#00d2ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {shotNum}
                        </span>
                        {shotName && (
                          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                            {shotName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="sticky-bottom-action" style={{ background: 'transparent', backdropFilter: 'none', borderTop: 'none', margin: '0', padding: '0' }}>
                <button onClick={() => { window.location.href = '/dashboard/gallery'; }} className="btn-magic">
                  View All Images <ArrowRight size={20} />
                </button>
                <button onClick={() => { setStep(1); setResults([]); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600, width: '100%', padding: '1.1rem', borderRadius: '16px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  Create More
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
