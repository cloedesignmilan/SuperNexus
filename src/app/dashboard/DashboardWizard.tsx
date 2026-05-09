'use client'

import React, { useState, useRef, useEffect } from 'react'
import { dashboardWizardDictionary, DashboardWizardLocale } from '@/lib/i18n/dashboardWizardDictionary'
import { Upload, Loader2, Wand2, Plus, Sparkles, ChevronLeft, ChevronRight, Settings, Info, CheckCircle2, Lock, ArrowRight, Zap, Image as ImageIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

type Snippet = any;


export default function DashboardWizard({ snippets, isAdmin, activeCategories = [], activeBusinessModes = [], activeSubcategories = [] }: { snippets: Snippet[], isAdmin?: boolean, activeCategories?: any[], activeBusinessModes?: any[], activeSubcategories?: any[] }) {
  const [step, setStep] = useState<number>(0)
  
  // Localization State
  const [uiLang, setUiLang] = useState<DashboardWizardLocale>('en');
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language.toLowerCase();
      setUiLang(lang.startsWith('it') ? 'it' : 'en');
    }
  }, []);
  const t = dashboardWizardDictionary[uiLang];
  
  // Upload State
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Outfit State (Swimwear Mix&Match)
  const [outfitUrls, setOutfitUrls] = useState<string[]>([])
  const [isUploadingOutfitPart, setIsUploadingOutfitPart] = useState(false)
  const outfitFileInputRef = useRef<HTMLInputElement>(null)
  
  // Back Upload State
  const [uploadedBackUrl, setUploadedBackUrl] = useState<string | null>(null)
  const [isUploadingBack, setIsUploadingBack] = useState(false)
  const backFileInputRef = useRef<HTMLInputElement>(null)
  
  // Selections
  const [selections, setSelections] = useState<Record<string, Snippet | any>>({
    CLIENT_TYPE: null, IMAGE_GOAL: null, IMAGE_TYPE: null, PRODUCT_TYPE: null, MODEL_OPTION: null, SCENE: null, FORMAT: null, QUANTITY: null
  })
  const [modelAge, setModelAge] = useState<number>(25)

  // Final Prompts
  const [finalPrompt, setFinalPrompt] = useState<string>('')
  const [negativePrompt, setNegativePrompt] = useState<string>('')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [outputValidationId, setOutputValidationId] = useState<string | null>(null)
  
  // AI Analysis State
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [availableShots, setAvailableShots] = useState<any[]>([])

  // Print Location State
  const [printLocation, setPrintLocation] = useState<string>('front')
  const [showPrintConfirm, setShowPrintConfirm] = useState<boolean>(false)

  // Dynamic Gender Covers State
  const [genderCovers, setGenderCovers] = useState<{manImage: string|null, womanImage: string|null}>({ manImage: null, womanImage: null })

  // Dynamic Progress State
  const [generationProgress, setGenerationProgress] = useState(0)

  // POSE SELECTION STATE
  const [selectedShotNumber, setSelectedShotNumber] = useState<number | null>(null);
  const [isPoseLoading, setIsPoseLoading] = useState(false);

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

  // Fetch dynamic gender covers for step 2.5
  useEffect(() => {
    if (step === 2 || step === 2.5) {
      const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
      const mode = selections['IMAGE_TYPE']?.label || '';
      
      if (detectedCat && mode) {
        fetch('/api/web/get-gender-covers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categorySlug: detectedCat, modeSlug: mode, presentationSlug: selections['MODEL_OPTION']?.label })
        })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setGenderCovers({
              manImage: data.manImage,
              womanImage: data.womanImage
            });
          }
        })
        .catch(console.error);
      }
    }
  }, [step, analysisData, selections]);

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

  const handleUpdateCover = async (e: React.MouseEvent, type: string, snip: Snippet | any) => {
    e.stopPropagation();
    const newUrl = window.prompt(`Paste new image URL for ${snip.label || snip.display}:`);
    if (!newUrl) return;

    try {
        const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
        const modeName = selections['IMAGE_TYPE']?.label || '';
        const body = {
            type,
            categorySlug: detectedCat,
            modeName: type === 'IMAGE_TYPE' ? snip.label : modeName,
            subName: type === 'CLIENT_TYPE' && selections['MODEL_OPTION'] ? selections['MODEL_OPTION'].label : (snip.label || snip.display),
            imageUrl: newUrl,
            clientGender: snip.label // for CLIENT_TYPE
        };

        const res = await fetch('/api/admin/update-button-cover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            // Optimistic update
            if (type === 'CLIENT_TYPE') {
                setGenderCovers(prev => ({
                    ...prev,
                    [snip.label.toLowerCase() === 'man' ? 'manImage' : 'womanImage']: newUrl
                }));
            } else {
                // For other types, reloading the page or forcing a re-fetch is best, but we can just reload for simplicity
                window.location.reload();
            }
        } else {
            alert('Failed to update cover');
        }
    } catch (err) {
        console.error(err);
        alert('Error updating cover');
    }
  };

  const handleOutfitFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setIsUploadingOutfitPart(true)
      try {
        const formData = new FormData()
        formData.append('file', selected)
        const res = await fetch('/api/web/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) {
          setOutfitUrls(prev => [...prev, data.url])
        } else {
          setError(data.error || 'Upload failed')
        }
      } catch (err) {
        setError('Network error during upload')
      } finally {
        setIsUploadingOutfitPart(false)
      }
    }
  }

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
              if (pLoc === 'front' || pLoc === 'back') {
                 setPrintLocation(pLoc);
                 setShowPrintConfirm(true);
              }

              if (analysisRes.analysis.confidence >= 0.8 && analysisRes.analysis.detectedProductType) {
                const matchMap: Record<string, string> = {
                  'swimwear': 'Swimwear',
                  'women_clothing': 'Everyday / Apparel',
                  'men_clothing': 'Everyday / Apparel',
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
    if (type.includes('everyday') || type.includes('apparel')) return 'everyday';
    if (type.includes('tshirt') || type.includes('hoodie') || type.includes('top') || type.includes('sweat') || type.includes('shirt')) return 't-shirt';
    if (type.includes('women') || type.includes('ceremony') || type.includes('dress') || type.includes('gown') || type.includes('suit') || type.includes('blazer') || type.includes('tuxedo') || type.includes('formal') || type.includes('jacket') || type.includes('men')) return 'dress';
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
        'everyday_apparel': 'Everyday / Apparel',
        'tshirt_hoodie': 'T-shirt',
        'shoes': 'Shoes',
        'bags': 'Bags',
        'jewelry': 'Jewelry',
        'dress_elegant': 'Dress / Elegant'
      };
      
      setAnalysisData((prev: any) => ({
        ...prev,
        detectedProductType: Object.keys(typeMap).find(k => typeMap[k] === snip.label) || 'unknown'
      }));
      setSelections(newSelections);
      setTimeout(() => setStep(1), 100);
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
              
              if (modelSnip.label !== 'No Model' && modelSnip.label !== 'STILL LIFE PACK' && !modelSnip.label.toLowerCase().includes('ugc creator pack')) {
                 setTimeout(() => setStep(2.5), 100);
              } else {
                 setTimeout(() => setStep(3), 100); // Vai a FORMAT_QUANTITY
              }
              return;
           }
        }
        
        // Go to MODEL_OPTION
        setTimeout(() => setStep(2), 100);
        return;
      }

      setSelections(newSelections);
      
      if (type === 'MODEL_OPTION') {
         if (snip.label !== 'No Model' && snip.label !== 'STILL LIFE PACK' && !snip.label.toLowerCase().includes('ugc creator pack')) {
            setTimeout(() => setStep(2.5), 50);
            return;
         }
         setTimeout(() => setStep(3), 50);
         return;
      }

      if (type === 'CLIENT_TYPE') {
         setTimeout(() => setStep(3), 50);
         return;
      }

      setTimeout(() => {
        setStep(stepIndex + 1);
      }, 100);
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
       const ugcRules = "[UGC REALISM MODE (HARD): This must NOT look like a professional photoshoot, BUT the model must be a beautiful Instagram Influencer. Simulate a real iPhone photo. Rules: imperfect framing, slight motion blur allowed, uneven natural lighting, casual pose (not posed, not fashion runway), handheld feeling, slightly tilted horizon allowed, depth of field must be flat (like smartphone). Camera simulation: iPhone camera, no cinematic blur, no professional lens look. IMPORTANT: This must feel like an influencer taking a casual lifestyle photo at home for social media, NOT a fashion brand campaign. Do not add accessories unless explicitly requested.] ";
       syncFPrompt = "iPhone style, natural lighting, candid, " + ugcRules + syncFPrompt;
       syncNPrompt = "studio lighting, DSLR, perfect skin, CGI, render, airbrushed, professional photoshoot, cinematic blur, depth of field, posed model, perfect framing, added accessories, sunglasses, bag, hat, jewelry, props, " + syncNPrompt;
    }

    if (analysisData?.detectedProductType === 'swimwear') {
       const swimwearRules = "[ABSOLUTE PRODUCT FIDELITY] The AI must treat the uploaded product image as the absolute source of truth. Preserve the exact print placement, exact pattern scale, exact color tones, exact trim, exact straps, ties, rings, stitching and cut. Do NOT simplify the product. Do NOT reinterpret the design. The model must clearly be wearing this exact bikini suitable for beach or pool environments. ";
       syncFPrompt = swimwearRules + syncFPrompt;
       syncNPrompt = "changed pattern, smaller pattern, larger pattern, simplified print, missing ring, changed trim, changed straps, changed ties, added accessories, sunglasses, bag, hat, jewelry, props, studio fashion looks, winter, heavy clothing, modified product, different color, different shape, " + syncNPrompt;
    }

    if (analysisData?.detectedProductType === 'shoes' && selections['IMAGE_TYPE']?.label?.includes('Catalog')) {
       const shoesCatalogRules = "[CLEAN CATALOG MODE – SHOES (STRICT ECOMMERCE)] The uploaded shoe is the ONLY reference. CRITICAL: The shoe must be reproduced EXACTLY as in the original image. No changes allowed. PRODUCT LOCK (VERY STRICT): exact shape and proportions, exact colors and materials, exact stitching and seams, exact logo placement, exact sole structure, exact laces style and color. DO NOT: redesign, simplify, smooth details, change textures, modify branding. If the product differs → INVALID. SHOOTING STYLE: professional ecommerce packshot, clean studio background (pure white or light grey), softbox lighting (diffused, shadow soft and minimal), ultra sharp focus, no reflections, no dramatic shadows. COMPOSITION: Each image must show a DIFFERENT angle (3/4 front view, side view, top view, pair front view, back view, sole bottom view, detail close-up). FRAMING: centered product, consistent scale across images, full product visible, no cropping. BACKGROUND: pure white (#ffffff) or soft grey, no environment, no props, no people. FINAL GOAL: This must look like a real ecommerce product listing from a premium brand. Consistency and accuracy are more important than aesthetics. DISABLE AI CREATIVITY: Do not add artistic interpretation. Do not improve the design. Do not stylize the product. This is a technical reproduction, not a creative image. ";
       syncFPrompt = shoesCatalogRules + syncFPrompt;
       syncNPrompt = "redesigned product, simplified product, smooth details, changed textures, modified branding, environment, props, people, lifestyle, reflection, dramatic shadows, " + syncNPrompt;
    }

    const syncGlobalNegative = "extra arms, extra limbs, multiple arms, mutated anatomy, deformed body, bad anatomy, extra fingers, missing limbs, disfigured, distorted proportions, internal labels, wash tags, care labels, size labels, tags, labels, logos, apple logo, brand marks, watermarks, text, typography, fonts, graphics, words, signatures, symbols, patches, icons, " + syncNPrompt;

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
        clientGender: clientGender || (selections['MODEL_OPTION']?.label?.toLowerCase().includes('woman') ? 'WOMAN' : selections['MODEL_OPTION']?.label?.toLowerCase().includes('man') ? 'MAN' : undefined),
        detectedProductType: analysisData?.detectedProductType,
        productColors: analysisData?.detectedAttributes?.colors || [],
        printLocation: printLocation,
        imageBackUrl: uploadedBackUrl,
        outfitUrls: outfitUrls
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
        
        if (isAdmin) {
          try {
             const { saveValidationFeedback } = await import('@/app/admin/actions');
             const imageUrls = data.results.map((r: any) => typeof r === 'string' ? r : r.url);
             const detectedCat = getMappedCategorySlug(selections['PRODUCT_TYPE']?.label || analysisData?.detectedProductType);
             const mode = selections['IMAGE_TYPE']?.label;
             const subName = selections['MODEL_OPTION']?.label;
             
             const realSubcategory = activeSubcategories.find(sub => 
                sub.name === subName && 
                sub.business_mode.name === mode && 
                sub.business_mode.category.slug === detectedCat
             );
             
             if (realSubcategory?.id) {
                 const taxonomyReadableGlobal = `${selections['PRODUCT_TYPE']?.label || analysisData?.detectedProductType} > ${mode} > ${subName}`;
                 const savedId = await saveValidationFeedback(
                    realSubcategory.id,
                    taxonomyReadableGlobal,
                    imageUrls,
                    "", 
                    uploadedUrl || 'N/A',
                    data.modelUsed,
                    selections['SPECIFIC_SHOT']?.shot_number || undefined,
                    clientGender || ''
                 );
                 setOutputValidationId(savedId);
             }
          } catch (e) {
             console.error("Auto-save feedback failed", e);
          }
        }
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
      const needsGender = analysisData?.needsGenderClarification && !selections['CLIENT_TYPE'] && 
      !(selections['MODEL_OPTION']?.label?.toLowerCase().includes('ugc creator pack'));
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
    const GLOBAL_FALLBACKS: Record<string, string> = {
      // PRODUCT TYPES
      'Men Clothing': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-LIFESTYLE-CANDID-1_1777731346455.jpg',
      'Women Clothing': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-LIFESTYLE-MODEL%20PHOTO-5_1777731069801.jpg',
      'Dress / Elegant': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-CLEAN%20CATALOG-NO%20MODEL-5_1777733203117.jpg',
      'T-Shirt / Streetwear': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
      'T-Shirt': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
      'Swimwear': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SWIMWEAR-LIFESTYLE-MODEL%20PHOTO-3_1777754104809.jpg',
      'Shoes / Sneakers': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-MODEL%20STUDIO-MODEL%20PHOTO-1_1777755760288.jpg',
      'Bags / Accessories': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-LIFESTYLE-MODEL%20PHOTO-1_1777790858986.jpg',
      'Jewelry': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-CLEAN%20CATALOG-NO%20MODEL-3_1777786292987.jpg',

      // BUSINESS MODES
      'Clean Catalog': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-CLEAN%20CATALOG-NO%20MODEL-4_1777788309332.jpg',
      'Model Studio': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-MODEL%20STUDIO-MODEL%20PHOTO-2_1777756275381.jpg',
      'Lifestyle': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-LIFESTYLE-CANDID-5_1777731346455.jpg',
      'UGC': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-UGC-CANDID-4_1777794363658.jpg',
      'Ads / Scroll Stopper': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-CLEAN%20CATALOG-NO%20MODEL-5_1777733203117.jpg',
      'Detail / Texture': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-CLEAN%20CATALOG-NO%20MODEL-5_1777733203117.jpg',

      // PRESENTATIONS
      'Candid': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-LIFESTYLE-CANDID-1_1777731346455.jpg',
      'Model Photo': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-MODEL%20STUDIO-MODEL%20PHOTO-2_1777756275381.jpg',
      'Flat Lay': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-CLEAN%20CATALOG-NO%20MODEL-4_1777788309332.jpg',
      'Ghost Mannequin': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-CLEAN%20CATALOG-NO%20MODEL-3_1777786292987.jpg',
      'No Model': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-CLEAN%20CATALOG-NO%20MODEL-5_1777733203117.jpg',
      'Editorial': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-LIFESTYLE-MODEL%20PHOTO-5_1777731069801.jpg',
      'Selfie': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-UGC-UGC%20IN%20HOME-1_1777706557354.jpg',
      'Streetwear Urban': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
      'Curvy': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-LIFESTYLE-MODEL%20PHOTO-5_1777731069801.jpg',
      'Macro Texture': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-CLEAN%20CATALOG-NO%20MODEL-5_1777733203117.jpg',

      // FORMATS
      '1:1 Square': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-CLEAN%20CATALOG-NO%20MODEL-3_1777786292987.jpg',
      '4:5 Portrait': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-UGC-UGC%20IN%20STORE-5_1777717367836.jpg',
      '9:16 Reel': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-CLEAN%20CATALOG-NO%20MODEL-5_1777733203117.jpg',
      
      // CLIENT TYPES (Gender)
      'Man': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
      'Woman': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-LIFESTYLE-MODEL%20PHOTO-5_1777731069801.jpg',
      
      // ENVIRONMENTS
      'Studio': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SHOES-MODEL%20STUDIO-MODEL%20PHOTO-1_1777755760288.jpg',
      'City Street': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/DRESS-LIFESTYLE-CANDID-5_1777731346455.jpg',
      'Cafe / Restaurant': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
      'Home / Indoor': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/T-SHIRT-LIFESTYLE-MODEL%20PHOTO-5_1777749534495.jpg',
      'Beach / Resort': 'https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SWIMWEAR-LIFESTYLE-MODEL%20PHOTO-3_1777754104809.jpg'
    };

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
             cover_image: bm.cover_image,
             fallback_image: activeSubcategories.find(s => s.business_mode_id === bm.id && s.preview_image)?.preview_image,
             prompt_fragment: '',
             negative_fragment: ''
          }
        });

      return (
        <div className="glass-grid">
          {customOptions.map(snip => {
            const isSelected = selections[type]?.id === snip.id;
            const IconComp = (Icons as any)[snip.icon || 'Box'] || Icons.Box;
            
            const dbImage = (snip as any).cover_image || (snip as any).fallback_image;
            const bgImage = null; // Forced icons by user request

            const isItalian = typeof window !== 'undefined' ? navigator.language.toLowerCase().startsWith('it') : false;
            const getTranslatedDescription = (label: string) => {
               const map: Record<string, {en: string, it: string}> = {
                  'Clean Catalog': { en: 'Clean background for eCommerce.', it: 'Sfondo pulito per eCommerce.' },
                  'Model Studio': { en: 'Professional photoshoot on model.', it: 'Shooting fotografico su modella/o.' },
                  'Lifestyle': { en: 'Product in realistic environments.', it: 'Prodotto in ambienti realistici.' },
                  'UGC': { en: 'Social media style content.', it: 'Contenuti stile social media.' },
                  'Ads / Scroll Stopper': { en: 'Creative setups for advertising.', it: 'Set creativi ad alto impatto per adv.' },
                  'Detail / Texture': { en: 'Close-up on materials and details.', it: 'Dettagli e materiali in primo piano.' },
                  'Dress / Elegant': { en: 'Elegant dresses and suits.', it: 'Abiti eleganti e completi.' },
                  'T-Shirt': { en: 'Casual tops and hoodies.', it: 'Magliette e felpe.' },
                  'Everyday / Apparel': { en: 'Casual and everyday clothing.', it: 'Abbigliamento casual e quotidiano.' },
                  'Swimwear': { en: 'Bikinis and beachwear.', it: 'Costumi da bagno e beachwear.' },
                  'Shoes': { en: 'Footwear and sneakers.', it: 'Scarpe e sneakers.' },
                  'Bags': { en: 'Handbags and accessories.', it: 'Borse e accessori.' },
                  'Jewelry': { en: 'Necklaces, rings, and earrings.', it: 'Collane, anelli e orecchini.' },
               };
               const res = map[label];
               if (!res) return snip.description || '';
               return isItalian ? res.it : res.en;
            };

            return (
              <button 
                key={snip.id} 
                onClick={() => handleSnippetSelect(type, snip, stepIndex)} 
                className={`glass-card visual-card-hover ${isSelected ? 'selected' : ''}`} 
                style={bgImage ? {
                   backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%), url('${bgImage}')`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   color: 'white',
                   minHeight: '180px',
                   display: 'flex',
                   flexDirection: 'column',
                   justifyContent: 'space-between',
                   alignItems: 'flex-start',
                   padding: '1.2rem',
                   border: isSelected ? '2px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                   overflow: 'hidden'
                } : {}}
              >
                {bgImage ? (
                  <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', padding: '8px', borderRadius: '50%', alignSelf: 'flex-end' }}>
                    <IconComp size={20} color="#fff" />
                  </div>
                ) : (
                  <IconComp size={38} className="card-icon" />
                )}
                <div className="card-title" style={bgImage ? { fontSize: '1.3rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)', textAlign: 'left', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' } : {}}>
                  {snip.label}
                </div>
                {!bgImage && getTranslatedDescription(snip.label) && (
                  <div className="snippet-desc" style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem', padding: '0 8px' }}>
                    {getTranslatedDescription(snip.label)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      );
    }

    let typeSnippets = snippets.filter(s => s.snippet_type === type);
    
    // STRICT TAXONOMY ENFORCEMENT
    if (type === 'PRODUCT_TYPE') {
      const activeCatSlugs = activeCategories.map(c => c.slug);
      typeSnippets = typeSnippets.filter(s => {
         const slug = getMappedCategorySlug(s.label);
         return activeCatSlugs.includes(slug);
      });
    }

    if (type === 'MODEL_OPTION') {
      const mode = selections['IMAGE_TYPE']?.label;
      const detectedCat = getMappedCategorySlug(selections['PRODUCT_TYPE']?.label || analysisData?.detectedProductType);
      
      const activeSubNames = activeSubcategories
        .filter(sub => sub.business_mode.category.slug === detectedCat && sub.business_mode.name === mode)
        .map(sub => sub.name);

      typeSnippets = typeSnippets.filter(s => activeSubNames.includes(s.label));
    }
    
    // FORMAT / QUANTITY MICROCOPY OVERRIDE
    if (type === 'FORMAT') {
      typeSnippets = typeSnippets.map(s => {
        let cloned = { ...s };
        if (cloned.label === '4:5') { cloned.description = 'Best for Instagram'; cloned.icon = 'Smartphone'; }
        if (cloned.label === '1:1') { cloned.description = 'Ecommerce'; cloned.icon = 'Square'; }
        if (cloned.label === '9:16') { cloned.description = 'TikTok / Reels'; cloned.icon = 'Crop'; }
        if (cloned.label === '16:9') { cloned.description = 'Website / banners'; cloned.icon = 'Monitor'; }
        return cloned;
      });
    }

    if (type === 'QUANTITY') {
      typeSnippets = typeSnippets.map(s => {
        let cloned = { ...s };
        if (cloned.label === '1') { cloned.description = 'Basic'; cloned.icon = 'Image'; }
        if (cloned.label === '3') { cloned.description = '⭐ Most popular'; cloned.icon = 'Images'; }
        if (cloned.label === '5') { cloned.description = '🔥 Better variety'; cloned.icon = 'Library'; }
        if (cloned.label === '10') { cloned.description = '⚡ Pro pack'; cloned.icon = 'Layers'; }
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
       const g = type === 'PRODUCT_TYPE' ? 'All Categories' : (s.sort_group || 'Other styles');
       if (!groups[g]) groups[g] = [];
       groups[g].push(s);
    });

    const order = type === 'PRODUCT_TYPE' ? ['All Categories'] : ['✨ AI Suggested', 'Recommended', 'Ecommerce', 'Social', 'Premium', 'Other styles'];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {order.map(groupName => {
          if (!groups[groupName] || groups[groupName].length === 0) return null;
          return (
            <div key={groupName} className="fade-up-enter">
              {groupName !== 'All Categories' && <h4 className="group-title">{groupName}</h4>}
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

                  let imageUrl: string | null = null;
                  
                  if (type === 'PRODUCT_TYPE') {
                     const catSlug = getMappedCategorySlug(snip.label);
                     // First try Category's own cover_image
                     const cat = activeBusinessModes.find(b => b.category.slug === catSlug)?.category;
                     if (cat?.cover_image) {
                         imageUrl = cat.cover_image;
                     } else {
                         // Fallback to the first child Subcategory's preview_image
                         const sub = activeSubcategories.find(s => s.business_mode.category.slug === catSlug && s.preview_image);
                         if (sub) imageUrl = sub.preview_image;
                     }
                  } else if (type === 'IMAGE_TYPE') {
                     const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
                     const bm = activeBusinessModes.find(b => b.category.slug === detectedCat && b.name === snip.label);
                     if (bm) {
                         if (bm.cover_image) {
                             imageUrl = bm.cover_image;
                         } else {
                             // Fallback to the first child Subcategory's preview_image
                             const sub = activeSubcategories.find(s => s.business_mode_id === bm.id && s.preview_image);
                             if (sub) imageUrl = sub.preview_image;
                         }
                     }
                  } else if (type === 'CLIENT_TYPE') {
                     // Removed full imagery to use Premium Icons
                     imageUrl = null;
                  } else if (type === 'MODEL_OPTION') {
                     const detectedCat = getMappedCategorySlug(analysisData?.detectedProductType);
                     const mode = selections['IMAGE_TYPE']?.label;
                     const sub = activeSubcategories.find(s => s.name === snip.label && s.business_mode.name === mode && s.business_mode.category.slug === detectedCat && s.preview_image);
                     if (sub) imageUrl = sub.preview_image;
                  }
                  const isPolaroid = false; // The user requested to remove images from all early steps and only use icons.
                  const IconComp = (Icons as any)[snip.icon || 'Box'] || Icons.Box;

                  return (
                    <button 
                      key={snip.id} 
                      onClick={() => handleSnippetSelect(type, snip, stepIndex)} 
                      className={isPolaroid ? "" : `glass-card visual-card-hover ${isSelected ? 'selected' : ''} ${isWarning && !isSelected ? 'warning' : ''}`} 
                      style={(() => {
                         if (isPolaroid) return {
                             display: 'flex',
                             flexDirection: 'column',
                             alignItems: 'center',
                             background: 'transparent',
                             border: 'none',
                             padding: 0,
                             cursor: 'pointer',
                             outline: 'none',
                             opacity: isSelected ? 1 : 0.6,
                             transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                             transition: 'all 0.2s ease-in-out',
                             position: 'relative'
                         };
                         const bgImage = null; // Forced icons by user request
                         
                         const isItalian = typeof window !== 'undefined' ? navigator.language.toLowerCase().startsWith('it') : false;

                         if (bgImage) {
                            return {
                               backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%), url('${bgImage}')`,
                               backgroundSize: 'cover',
                               backgroundPosition: 'center',
                               color: 'white',
                               minHeight: '180px',
                               display: 'flex',
                               flexDirection: 'column',
                               justifyContent: 'space-between',
                               alignItems: 'flex-start',
                               padding: '1.2rem',
                               border: isSelected ? '2px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                               overflow: 'hidden'
                            };
                         }
                         return {};
                      })()}
                    >
                      {isPolaroid ? (
                          <>
                            <div 
                                className={`glass-card ${isSelected ? 'selected' : ''}`}
                                style={{ 
                                    width: '100%', 
                                    aspectRatio: '1 / 1', 
                                    padding: imageUrl ? '0' : '1.5rem 1rem', 
                                    overflow: 'hidden', 
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                            >
                                {isAdmin && (
                                   <div 
                                      onClick={(e) => handleUpdateCover(e, type, snip)}
                                      style={{ position: 'absolute', top: 8, left: 8, zIndex: 20, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}
                                   >
                                      <Icons.Edit2 size={14} color="#fff" />
                                   </div>
                                )}
                                {snip.is_recommended && <Sparkles className="sparkle-icon" size={14} style={{ zIndex: 10, position: 'absolute', top: 10, right: 10 }} />}
                                {imageUrl ? (
                                    <img src={imageUrl} alt={snip.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <IconComp size={38} className="card-icon" />
                                )}
                            </div>
                            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: isSelected ? '#00d2ff' : '#fff', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {snip.label}
                            </div>
                            {isWarning && (
                               <div className="conflict-warning" style={{ zIndex: 10, position: 'absolute', bottom: -25 }}>
                                 <Info size={14} /> Might conflict
                               </div>
                            )}
                          </>
                      ) : (
                          <>
                            {(() => {
                               const bgImage = null; // Forced icons by user request

                               const getTranslatedDescription = (label: string) => {
                                  const map: Record<string, {en: string, it: string}> = {
                                     'Model Photo': { en: 'Classic fashion posing.', it: 'Posa fashion classica.' },
                                     'Candid': { en: 'Natural and spontaneous look.', it: 'Look naturale e spontaneo.' },
                                     'Flat Lay': { en: 'Arranged beautifully from above.', it: 'Composizione vista dall\'alto.' },
                                     'Ghost Mannequin': { en: 'Product only, 3D effect.', it: 'Solo prodotto, effetto 3D.' },
                                     'No Model': { en: 'Standalone product display.', it: 'Prodotto esposto senza modello.' },
                                     'Editorial': { en: 'High fashion magazine style.', it: 'Stile alta moda editoriale.' },
                                     'Selfie': { en: 'Casual mirror or front camera shot.', it: 'Scatto casual allo specchio o selfie.' },
                                     'Streetwear Urban': { en: 'Urban street aesthetic.', it: 'Estetica urbana e street.' },
                                     'Curvy': { en: 'Plus size modeling.', it: 'Modella curvy.' },
                                     'Macro Texture': { en: 'Extreme close up of fabric.', it: 'Dettaglio estremo del tessuto.' },
                                     'Clean Catalog': { en: 'Clean background for eCommerce.', it: 'Sfondo pulito per eCommerce.' },
                                     'Dress / Elegant': { en: 'Elegant dresses and suits.', it: 'Abiti eleganti e completi.' },
                                     'T-Shirt': { en: 'Casual tops and hoodies.', it: 'Magliette e felpe.' },
                                     'Everyday / Apparel': { en: 'Casual and everyday clothing.', it: 'Abbigliamento casual e quotidiano.' },
                                     'Swimwear': { en: 'Bikinis and beachwear.', it: 'Costumi da bagno e beachwear.' },
                                     'Shoes': { en: 'Footwear and sneakers.', it: 'Scarpe e sneakers.' },
                                     'Bags': { en: 'Handbags and accessories.', it: 'Borse e accessori.' },
                                     'Jewelry': { en: 'Necklaces, rings, and earrings.', it: 'Collane, anelli e orecchini.' },
                                  };
                                  const res = map[label];
                                  if (!res) return snip.description || '';
                                  return (typeof window !== 'undefined' ? navigator.language.toLowerCase().startsWith('it') : false) ? res.it : res.en;
                               };

                               if (bgImage) {
                                  return (
                                     <>
                                        <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', padding: '8px', borderRadius: '50%', alignSelf: 'flex-end', zIndex: 2 }}>
                                          <IconComp size={20} color="#fff" />
                                        </div>
                                        <div className="card-title" style={{ fontSize: '1.3rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)', textAlign: 'left', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px', zIndex: 2 }}>
                                          {snip.label}
                                        </div>
                                     </>
                                  );
                               }

                               return (
                                  <>
                                     {snip.is_recommended && <Sparkles className="sparkle-icon" size={14} />}
                                     <IconComp size={38} className="card-icon" />
                                     <div className="card-title">{snip.label}</div>
                                     {getTranslatedDescription(snip.label) && (
                                       <div className="snippet-desc" style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem', padding: '0 8px' }}>
                                         {getTranslatedDescription(snip.label)}
                                       </div>
                                     )}
                                  </>
                               );
                            })()}
                            
                            {isWarning && (
                               <div className="conflict-warning" style={{ zIndex: 2 }}>
                                 <Info size={14} /> Might conflict
                               </div>
                            )}
                          </>
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
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .glass-card {
          background: rgba(44, 44, 46, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.2rem 0.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          color: #fff;
          aspect-ratio: 1 / 1;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .glass-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          background: rgba(58, 58, 60, 0.8);
        }

        .glass-card:hover::before {
          opacity: 1;
        }

        .glass-card:active {
          transform: translateY(0) scale(0.96);
          transition: all 0.1s;
        }

        .glass-card.selected {
          background: linear-gradient(135deg, rgba(0, 210, 255, 0.15) 0%, rgba(3, 218, 198, 0.15) 100%);
          border-color: #00d2ff;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 210, 255, 0.3), inset 0 0 20px rgba(0, 210, 255, 0.1);
        }

        .glass-card.warning { opacity: 0.5; }

        .sparkle-icon { position: absolute; top: 0.8rem; right: 0.8rem; color: #00d2ff; }
        .glass-card.selected .sparkle-icon { color: #fff; filter: drop-shadow(0 0 4px #00d2ff); }
        
        .card-icon { margin-bottom: 0.75rem; color: #8e8e93; transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
        .glass-card:hover .card-icon { color: #fff; transform: translateY(-2px); }
        .glass-card.selected .card-icon { color: #00d2ff; transform: scale(1.1) translateY(-2px); filter: drop-shadow(0 0 8px rgba(0,210,255,0.6)); }

        .card-title { font-size: 0.85rem; font-weight: 700; margin-bottom: 0; line-height: 1.2; padding: 0 4px; letter-spacing: 0.3px; }
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
            display: grid;
            grid-template-columns: 40px 1fr 40px;
            align-items: center;
            padding: 1rem;
            background: rgba(10, 10, 12, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            position: sticky;
            top: 0;
            z-index: 50;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }

          .mobile-back-button {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          
          .mobile-back-button:active {
            transform: scale(0.92);
            background: rgba(255, 255, 255, 0.12);
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
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{uiLang === 'it' ? 'Prodotto Caricato' : 'Product Uploaded'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize', marginTop: '2px', fontWeight: 500 }}>
                        {analysisData ? analysisData.detectedProductType?.replace('_', ' ') : 'Ready'}
                      </div>
                    </div>
                  </div>
                  <button className="desktop-change-btn" onClick={() => { setStep(0); setUploadedUrl(null); setOutfitUrls([]); }}>
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
            {!isGenerating ? (
              <button className="mobile-back-button" onClick={handleBack}>
                <ChevronLeft size={20} />
              </button>
            ) : <div />}
            <div style={{ fontSize: '1rem', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {step === 0.25 ? t.aiDetection : step === 0.75 ? t.selectProductType : step === 3.5 ? t.selectSpecificShot : step === 4 ? t.configReviewTitle : step === 5 ? t.generationComplete : stepsData[Math.floor(step)-1]?.title || t.options}
            </div>
            <div />
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Scrollable Steps */}
      <div className="studio-right">
        
        <div className="scroll-container">

          {step > 0 && step < 9 && !isGenerating && (
              <button className="back-button desktop-back-button" onClick={handleBack}>
                <ChevronLeft size={20} /> <span>{t.back}</span>
              </button>
          )}

          {/* Error Banner */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center', fontWeight: 600 }}>
              {error === 'Insufficient credits' ? (
                 <div>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.3rem' }}>Generazioni Omaggio Terminate! 🚀</h3>
                    <p style={{ color: '#ccc', marginBottom: '1.5rem', fontWeight: 400 }}>Sblocca tutto il potenziale del nostro motore AI definitivo acquistando un pacchetto:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '350px', margin: '0 auto' }}>
                       <a href="/checkout?plan=starter_pack" className="btn-secondary" style={{ background: 'linear-gradient(135deg, #ff0ab3 0%, #aa0077 100%)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{fontWeight: 700}}>STARTER PACK (100 Img)</span><span style={{fontWeight: 900}}>$29</span>
                       </a>
                       <a href="/checkout?plan=retail_pack" className="btn-secondary" style={{ background: 'linear-gradient(135deg, #00ffff 0%, #008888 100%)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{fontWeight: 700}}>RETAIL PACK (300 Img)</span><span style={{fontWeight: 900}}>$69</span>
                       </a>
                       <a href="/checkout?plan=retail_monthly" className="btn-secondary" style={{ background: 'linear-gradient(135deg, #ccff00 0%, #88aa00 100%)', color: '#000', border: 'none', padding: '1rem', borderRadius: '12px', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{fontWeight: 700}}>RETAIL MONTHLY (300 Img/mese)</span><span style={{fontWeight: 900}}>$59</span>
                       </a>
                    </div>
                 </div>
              ) : (
                 error
              )}
            </div>
          )}

          {/* STEP 0: UPLOAD */}
          {step === 0 && (
            <div className="fade-up-enter">
              <h1 className="step-header">{t.uploadProduct}</h1>
              
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
                  <><Loader2 className="animate-spin" size={48} color="#00d2ff" style={{ margin: '0 auto 1rem auto' }} /> <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t.uploading}</div></>
                ) : (
                  <>
                    <Upload size={48} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 1rem auto' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t.dragAndDrop.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>{t.uploadFormats}</div>
                  </>
                )}
              </div>

              <div style={{ background: '#1c1c1e', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>{t.tipsTitle}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={16} color="#00d2ff" /> {t.tip1}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={16} color="#00d2ff" /> {t.tip2}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={16} color="#00d2ff" /> {t.tip3}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle2 size={16} color="#00d2ff" /> {t.tip4}</div>
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
                  <h2 className="step-header">{t.analyzingProduct}</h2>
                  <p className="step-desc">{t.analyzingDesc}</p>
                </>
              ) : analysisData ? (
                <>
                  <div style={{ background: '#2c2c2e', border: 'none', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#34c759', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} /> {t.aiDetectionComplete}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                      {analysisData.detectedProductType?.replace('_', ' ') || t.unknownProduct}
                    </div>
                    {analysisData.detectedAttributes?.recommendedScenes && (
                       <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                         {t.recommended} {analysisData.detectedAttributes.recommendedScenes.slice(0, 3).join(', ')}
                       </div>
                    )}
                    {analysisData.confidence < 0.8 && (
                      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                        {t.detectedWarning}
                      </div>
                    )}
                  </div>

                  {showPrintConfirm && (
                     <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ fontWeight: 600, marginBottom: '1.2rem', textAlign: 'center', fontSize: '1.05rem', color: '#fff' }}>{t.printDetected.replace('{location}', printLocation.toUpperCase())}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <button onClick={() => setPrintLocation('front')} style={{ padding: '0.8rem', borderRadius: '14px', border: '1px solid', borderColor: printLocation === 'front' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255,255,255,0.1)', background: printLocation === 'front' ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))' : 'rgba(255,255,255,0.02)', color: printLocation === 'front' ? '#fff' : '#8e8e93', fontWeight: printLocation === 'front' ? 700 : 500, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: printLocation === 'front' ? '0 0 15px rgba(59,130,246,0.3)' : 'none' }}>
                            {t.frontPrint}
                          </button>
                          <button onClick={() => setPrintLocation('back')} style={{ padding: '0.8rem', borderRadius: '14px', border: '1px solid', borderColor: printLocation === 'back' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255,255,255,0.1)', background: printLocation === 'back' ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))' : 'rgba(255,255,255,0.02)', color: printLocation === 'back' ? '#fff' : '#8e8e93', fontWeight: printLocation === 'back' ? 700 : 500, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: printLocation === 'back' ? '0 0 15px rgba(59,130,246,0.3)' : 'none' }}>
                            {t.backPrint}
                          </button>
                        </div>
                     </div>
                  )}

                  {!uploadedBackUrl && (
                     <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '24px', padding: '1.8rem 1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'; }}>
                        <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 1.5 }}>{t.backViewPrompt}</div>
                        <input type="file" ref={backFileInputRef} onChange={handleBackFileChange} accept="image/*" style={{ display: 'none' }} />
                        <button onClick={() => backFileInputRef.current?.click()} disabled={isUploadingBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.9rem 1.5rem', borderRadius: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                           {isUploadingBack ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                           {isUploadingBack ? t.uploading : t.addBackView}
                        </button>
                     </div>
                  )}
                  {uploadedBackUrl && (
                     <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                           <img src={uploadedBackUrl} alt="Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                           <div style={{ fontWeight: 600, color: '#10b981' }}>{t.backViewUploaded}</div>
                           <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{t.backViewDesc}</div>
                        </div>
                     </div>
                  )}

                  {analysisData.detectedProductType && (
                     <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                           {analysisData.detectedProductType === 'swimwear' ? (
                             <>
                               Costumi Spaiati o Accessori? (Opzionale)<br/>
                               {t.swimwearOutfitOptional.split('\n')[1]}
                             </>
                           ) : (
                             <>
                               Componi l'Outfit (Opzionale)<br/>
                               {t.outfitOptional.split('\n')[1]}
                             </>
                           )}
                        </div>
                        
                        {outfitUrls.length > 0 && (
                           <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              {outfitUrls.map((url, i) => (
                                 <div key={i} style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <img src={url} alt={`Accessory ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                 </div>
                              ))}
                           </div>
                        )}

                        <input type="file" ref={outfitFileInputRef} onChange={handleOutfitFileChange} accept="image/*" style={{ display: 'none' }} />
                        <button onClick={() => outfitFileInputRef.current?.click()} disabled={isUploadingOutfitPart} style={{ background: '#2c2c2e', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#3a3a3c'} onMouseOut={(e) => e.currentTarget.style.background = '#2c2c2e'}>
                           {isUploadingOutfitPart ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                           {isUploadingOutfitPart ? t.uploading : (analysisData.detectedProductType === 'swimwear' ? t.addSwimwearPiece : t.addOutfitPiece)}
                        </button>
                     </div>
                  )}

                  <div className="sticky-bottom-action">
                    <button onClick={() => setStep(1)} className="btn-magic">
                      {t.looksGood} <ArrowRight size={18} />
                    </button>
                    <button onClick={() => { setStep(0.75); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', color: '#ffffff', fontSize: '1rem', padding: '1.1rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 600, width: '100%' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      {t.changeType}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="step-header">{t.analysisSkipped}</h2>
                  <button onClick={() => setStep(0.75)} className="btn-giant">{t.continueBtn} <ArrowRight size={18} /></button>
                </>
              )}
            </div>
          )}

          {/* STEP 0.75: MANUAL PRODUCT TYPE SELECTION */}
          {step === 0.75 && (
            <div className="fade-up-enter">
              <h2 className="step-header">{t.productTypeTitle}</h2>
              <p className="step-desc">{t.productTypeDesc}</p>
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
                                     presentationSlug: selections['MODEL_OPTION']?.label || '',
                                     clientGender: selections['CLIENT_TYPE']?.label || ''
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
                    {t.reviewConfigBtn} <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2.5: MANUAL GENDER SELECTION (AI DOUBT OR TSHIRT SAFETY) */}
          {step === 2.5 && (
            <div className="fade-up-enter">
              <h2 className="step-header">{t.whoIsWearingTitle}</h2>
              <p className="step-desc">{t.whoIsWearingDesc}</p>
              
              <div className="glass-grid gender-grid" style={{ marginTop: '2rem' }}>
                 {[
                   { label: 'MAN', display: 'MAN', id: 'gender-man', prompt: 'male fashion model, handsome man, handsome guys', negative: 'female, woman, girl, breasts, feminine features' },
                   { label: 'WOMAN', display: 'WOMAN', id: 'gender-woman', prompt: 'female fashion model, beautiful woman, beautiful girls', negative: 'male, man, boy, facial hair, masculine features' }
                 ].map(gender => {
                    const isSelected = selections['CLIENT_TYPE']?.id === gender.id;
                    
                    const searchToken = gender.label.toLowerCase();
                    let imageUrl = null; // Removed full imagery to use Premium Icons

                    return (
                      <button 
                        key={gender.id}
                        onClick={() => handleSnippetSelect('CLIENT_TYPE', { id: gender.id, label: gender.label, snippet_type: 'CLIENT_TYPE', prompt_fragment: gender.prompt, negative_fragment: gender.negative, intensity_level: 'strong' }, 2.5)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            outline: 'none',
                            opacity: isSelected ? 1 : 0.6,
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease-in-out',
                            position: 'relative'
                        }}
                      >
                          <div 
                              className={`glass-card ${isSelected ? 'selected' : ''}`}
                              style={{ 
                                  width: '100%', 
                                  aspectRatio: '1 / 1', 
                                  padding: imageUrl ? '0' : '1.5rem 1rem', 
                                  overflow: 'hidden', 
                                  borderRadius: '12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative'
                              }}
                          >
                              {isAdmin && (
                                 <div 
                                    onClick={(e) => handleUpdateCover(e, 'CLIENT_TYPE', gender)}
                                    style={{ position: 'absolute', top: 8, left: 8, zIndex: 20, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}
                                 >
                                    <Icons.Edit2 size={14} color="#fff" />
                                 </div>
                              )}
                              {imageUrl ? (
                                  <img src={imageUrl} alt={gender.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                  gender.id === 'gender-man' ? (
                                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#00d2ff" : "rgba(255,255,255,0.7)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isSelected ? 'drop-shadow(0 0 10px rgba(0,210,255,0.8))' : 'none', transition: 'all 0.3s ease' }}>
                                      <path d="M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                                      <path d="M6 14c0-3 2.5-4 6-4s6 1 6 4v5h-2v4H8v-4H6v-5Z" />
                                    </svg>
                                  ) : (
                                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#ff00d2" : "rgba(255,255,255,0.7)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isSelected ? 'drop-shadow(0 0 10px rgba(255,0,210,0.8))' : 'none', transition: 'all 0.3s ease' }}>
                                      <path d="M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                                      <path d="M12 10c-3 0-5 2-4 5l2 8h4l2-8c1-3-1-5-4-5Z" />
                                    </svg>
                                  )
                              )}
                          </div>
                          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: isSelected ? (gender.id === 'gender-man' ? '#00d2ff' : '#ff00d2') : '#fff', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {gender.display}
                          </div>
                      </button>
                    )
                 })}
              </div>
            </div>
          )}

          {/* STEP 3.5: SPECIFIC SHOT SELECTION (ONLY IF QUANTITY = 1) */}
          {step === 3.5 && (
            <div className="fade-up-enter">
              <h2 className="step-header">{t.selectSpecificShotTitle}</h2>
              <p className="step-desc">{t.selectSpecificShotDesc}</p>
              
              <div className="glass-grid gender-grid" style={{ marginTop: '2rem' }}>
                 {availableShots.map(shot => {
                    const isSelected = selections['SPECIFIC_SHOT']?.shot_number === shot.shot_number;
                    return (
                      <div key={shot.shot_number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '100%', aspectRatio: '1/1' }}>
                          <button 
                            className={`glass-card ${isSelected ? 'selected' : ''}`}
                            style={{ boxSizing: 'border-box', margin: 0, width: '100%', height: '100%', padding: shot.image_url ? '0.25rem' : '1.5rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                            onClick={() => {
                                setSelections({ ...selections, SPECIFIC_SHOT: shot });
                                setTimeout(() => setStep(4), 50);
                            }}
                          >
                            {shot.image_url ? (
                              <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                                {isAdmin && (
                                   <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newUrl = window.prompt(`Paste new image URL for shot ${shot.shot_number}:`);
                                        if (newUrl) {
                                            fetch('/api/admin/update-button-cover', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    type: 'SPECIFIC_SHOT',
                                                    categorySlug: getMappedCategorySlug(analysisData?.detectedProductType),
                                                    modeName: selections['IMAGE_TYPE']?.label || '',
                                                    subName: selections['MODEL_OPTION']?.label || '',
                                                    imageUrl: newUrl,
                                                    clientGender: selections['CLIENT_TYPE']?.label || '',
                                                    specificShotNumber: shot.shot_number
                                                })
                                            }).then(res => {
                                                if(res.ok) window.location.reload();
                                            });
                                        }
                                      }}
                                      style={{ position: 'absolute', top: 8, left: 8, zIndex: 20, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}
                                   >
                                      <Icons.Edit2 size={14} color="#fff" />
                                   </div>
                                )}
                                <img src={shot.image_url} alt={shot.shot_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isAdmin && (
                                   <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newUrl = window.prompt(`Paste new image URL for shot ${shot.shot_number}:`);
                                        if (newUrl) {
                                            fetch('/api/admin/update-button-cover', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    type: 'SPECIFIC_SHOT',
                                                    categorySlug: getMappedCategorySlug(analysisData?.detectedProductType),
                                                    modeName: selections['IMAGE_TYPE']?.label || '',
                                                    subName: selections['MODEL_OPTION']?.label || '',
                                                    imageUrl: newUrl,
                                                    clientGender: selections['CLIENT_TYPE']?.label || '',
                                                    specificShotNumber: shot.shot_number
                                                })
                                            }).then(res => {
                                                if(res.ok) window.location.reload();
                                            });
                                        }
                                      }}
                                      style={{ position: 'absolute', top: 8, left: 8, zIndex: 20, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}
                                   >
                                      <Icons.Edit2 size={14} color="#fff" />
                                   </div>
                                )}
                                <Icons.Camera size={38} className="card-icon" />
                              </div>
                            )}
                          </button>
                        </div>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                          <div className="card-title" style={{ fontSize: '0.85rem', margin: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{shot.shot_name}</div>
                          <div className="snippet-desc" style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0' }}>Shot {shot.shot_number}</div>
                        </div>
                      </div>
                    )
                 })}
                 
                 {/* Fallback Option */}
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: '100%', aspectRatio: '1/1' }}>
                     <button 
                        className={`glass-card ${!selections['SPECIFIC_SHOT'] ? 'selected' : ''}`}
                        style={{ boxSizing: 'border-box', margin: 0, width: '100%', height: '100%', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                        onClick={() => {
                            setSelections({ ...selections, SPECIFIC_SHOT: null });
                            setTimeout(() => setStep(4), 50);
                        }}
                      >
                        <Icons.Wand2 size={38} className="card-icon" />
                      </button>
                    </div>
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <div className="card-title" style={{ fontSize: '0.85rem', margin: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>Any / Random</div>
                      <div className="snippet-desc" style={{ fontSize: '0.75rem', opacity: 0, margin: '0' }}>placeholder</div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* FINAL STEP 4: SUMMARY & GENERATE */}
          {step === 4 && !isGenerating && (
            <div className="fade-up-enter">
              <h2 className="step-header">{t.configReviewTitle}</h2>
              <p className="step-desc">{t.configReviewDesc}</p>
              
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
                <h2 className="step-header" style={{ marginBottom: '0.5rem' }}>{t.imagesReadyTitle}</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>We've created {results.length} stunning images for your product.</p>
                
                <button 
                   id="btn-download-zip"
                   onClick={async () => {
                      try {
                          const btn = document.getElementById('btn-download-zip');
                          if (btn) btn.innerHTML = 'Creando Archivio ZIP...';
                          
                          const JSZip = (await import('jszip')).default;
                          const zip = new JSZip();
                          
                          const taxonomyPath = `${selections['PRODUCT_TYPE']?.label || ''}_${selections['IMAGE_TYPE']?.label || ''}_${selections['MODEL_OPTION']?.label || ''}`.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '_');
                          const originalName = file?.name ? file.name.replace(/\.[^/.]+$/, "") : "Prodotto_SuperNexus";
                          const folderName = `${taxonomyPath}_${originalName}`;
                          const folder = zip.folder(folderName);
                          if (!folder) return;

                          for (let i = 0; i < results.length; i++) {
                              const resItem = results[i];
                              const url = typeof resItem === 'string' ? resItem : resItem.url;
                              const shotName = resItem.shotName || `Shot_${resItem.shotNumber || i+1}`;
                              const downloadFilename = `${taxonomyPath}_${shotName}_${originalName}.jpeg`;
                              
                              const fetchUrl = url.startsWith('http') || url.startsWith('data:') ? url : `data:image/jpeg;base64,${url}`;
                              const res = await fetch(fetchUrl);
                              const blob = await res.blob();
                              folder.file(downloadFilename, blob);
                          }

                          const content = await zip.generateAsync({ type: 'blob' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(content);
                          link.download = `${folderName}.zip`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Scarica Tutte in un File ZIP';
                      } catch (err) {
                          console.error(err);
                          alert('Errore durante la creazione del file ZIP.');
                          const btn = document.getElementById('btn-download-zip');
                          if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Scarica Tutte in un File ZIP';
                      }
                   }}
                   style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #00d2ff, #03dac6)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                   <Icons.Download size={18} /> Scarica Tutte in un File ZIP
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {results.map((resItem, i) => {
                  const url = typeof resItem === 'string' ? resItem : resItem.url;
                  const shotNum = resItem.shotNumber ? `Shot ${resItem.shotNumber}` : `Image ${i+1}`;
                  let shotName = resItem.shotName || shotNum;

                  // Estrai il nome del file originale senza estensione
                  const originalName = file?.name ? file.name.replace(/\.[^/.]+$/, "") : "Prodotto_SuperNexus";
                  
                  // Genera il filename finale con il percorso esatto
                  const taxonomyPath = `${selections['PRODUCT_TYPE']?.label || ''}_${selections['IMAGE_TYPE']?.label || ''}_${selections['MODEL_OPTION']?.label || ''}`.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '_');
                  const taxonomyReadable = `${selections['PRODUCT_TYPE']?.label || ''} > ${selections['IMAGE_TYPE']?.label || ''} > ${selections['MODEL_OPTION']?.label || ''}`;
                  const downloadFilename = `${taxonomyPath}_${shotName}_${originalName}.jpeg`;
                  
                  
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {isAdmin && (
                        <div style={{ fontSize: '0.8rem', color: '#03dac6', fontWeight: 600, background: 'rgba(3,218,198,0.1)', padding: '6px 10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(3,218,198,0.2)' }}>
                          {taxonomyReadable}
                        </div>
                      )}
                      
                      <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: '#000', position: 'relative' }}>
                        <img src={url.startsWith('http') || url.startsWith('data:') ? url : `data:image/jpeg;base64,${url}`} alt={`Result ${i}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '8px' }}>
                          {isAdmin && selections['MODEL_OPTION']?.id && (
                             <button 
                               onClick={async (e) => {
                                  const btn = e.currentTarget;
                                  btn.style.opacity = '0.5';
                                  try {
                                     const { saveReferenceImage } = await import('@/app/admin/actions');
                                     
                                     const detectedCat = getMappedCategorySlug(selections['PRODUCT_TYPE']?.label || analysisData?.detectedProductType);
                                     const mode = selections['IMAGE_TYPE']?.label;
                                     const subName = selections['MODEL_OPTION']?.label;
                                     const realSubcategory = activeSubcategories.find(sub => 
                                        sub.name === subName && 
                                        sub.business_mode.name === mode && 
                                        sub.business_mode.category.slug === detectedCat
                                     );
                                     
                                     if (!realSubcategory?.id) {
                                        alert("Errore: Impossibile trovare l'ID della Sottocategoria nel database.");
                                        btn.style.opacity = '1';
                                        return;
                                     }

                                     await saveReferenceImage(realSubcategory.id, url, taxonomyPath);
                                     alert('Immagine salvata nel CRM come Referenza!');
                                  } catch (err) {
                                     alert('Errore salvataggio nel CRM.');
                                  } finally {
                                     btn.style.opacity = '1';
                                  }
                               }}
                               style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#03dac6', cursor: 'pointer', transition: 'all 0.2s' }}
                               title="Salva nel CRM come Referenza"
                               onMouseOver={(e) => e.currentTarget.style.background = 'rgba(3,218,198,0.3)'}
                               onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                             >
                               <Icons.Database size={20} />
                             </button>
                          )}
                          <button 
                            onClick={() => handleDownloadImage(url.startsWith('http') || url.startsWith('data:') ? url : `data:image/jpeg;base64,${url}`, downloadFilename)}
                            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                            title="Save to Camera Roll / Download"
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,210,255,0.8)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          </button>
                        </div>
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

                      {isAdmin && (
                        <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px' }}>
                           <textarea 
                              placeholder="Scrivi qui gli errori per Antigravity (es. pelle di plastica, luci errate, mani deformate...)"
                              id={`feedback-${i}`}
                              style={{ width: '100%', minHeight: '70px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', padding: '10px', borderRadius: '8px', resize: 'vertical' }}
                           />
                           <button
                              onClick={() => {
                                 const note = (document.getElementById(`feedback-${i}`) as HTMLTextAreaElement).value;
                                 const textToCopy = `PATH TESTATO:\n[ ${taxonomyReadable} ]\n\nFEEDBACK PER ANTIGRAVITY:\n${note || 'Nessuna nota specifica, ma la immagine ha problemi.'}`;
                                 navigator.clipboard.writeText(textToCopy);
                                 alert('Feedback copiato in memoria! Ora incollalo nella chat di Gemini.');
                              }}
                              style={{ marginTop: '10px', width: '100%', padding: '10px', background: 'linear-gradient(90deg, #e62ebf, #00d2ff)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                           >
                              <Icons.Copy size={16} /> Copia Appunti per la Chat
                           </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isAdmin && (
                <div style={{ marginBottom: '3rem', padding: '1.5rem', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '16px' }}>
                   <h3 style={{ color: '#00d2ff', margin: '0 0 0.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <Icons.MessageSquare size={20} />
                     Revisione Globale per l'intera Sottocategoria
                   </h3>
                   <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', lineHeight: '1.4' }}>
                     Se vuoi dare una direttiva generale ad Antigravity per <strong>TUTTA</strong> questa sezione (es. <em>"Voglio che per tutti i Candid le case siano sempre super ordinate"</em>), scrivila qui. Verrà applicata permanentemente a questa sottocategoria.
                   </p>
                   <textarea 
                      placeholder="Es: 'Per tutte le immagini UGC Candid voglio le case sempre super ordinate...'"
                      id="global-feedback"
                      style={{ width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', padding: '12px', borderRadius: '8px', resize: 'vertical', outline: 'none' }}
                   />
                   <button
                      onClick={async (e) => {
                         const taxonomyReadableGlobal = `${selections['PRODUCT_TYPE']?.label || ''} > ${selections['IMAGE_TYPE']?.label || ''} > ${selections['MODEL_OPTION']?.label || ''}`;
                         const note = (document.getElementById('global-feedback') as HTMLTextAreaElement).value;
                         const textToCopy = `REVISIONE GLOBALE SOTTOCATEGORIA:\n[ ${taxonomyReadableGlobal} ]\n\nDIRETTIVA PER ANTIGRAVITY:\n${note || 'Nessuna direttiva inserita.'}`;
                         
                         const btn = e.currentTarget;
                         const originalText = btn.innerHTML;
                         btn.innerHTML = 'Salvataggio in corso...';
                         
                         try {
                            const { saveValidationFeedback } = await import('@/app/admin/actions');
                            const imageUrls = results.map((r: any) => typeof r === 'string' ? r : r.url);
                            
                            const detectedCat = getMappedCategorySlug(selections['PRODUCT_TYPE']?.label || analysisData?.detectedProductType);
                            const mode = selections['IMAGE_TYPE']?.label;
                            const subName = selections['MODEL_OPTION']?.label;
                            const realSubcategory = activeSubcategories.find(sub => 
                               sub.name === subName && 
                               sub.business_mode.name === mode && 
                               sub.business_mode.category.slug === detectedCat
                            );
                            
                            if (!realSubcategory?.id) {
                               alert("Errore: Impossibile trovare l'ID della Sottocategoria nel database.");
                               btn.innerHTML = originalText;
                               return;
                            }

                            if (outputValidationId) {
                               const { updateValidationFeedback } = await import('@/app/admin/actions');
                               const formData = new FormData();
                               formData.append('notes', note);
                               await updateValidationFeedback(outputValidationId, formData);
                            } else {
                               const { saveValidationFeedback } = await import('@/app/admin/actions');
                               await saveValidationFeedback(
                                  realSubcategory.id,
                                  taxonomyReadableGlobal,
                                  imageUrls,
                                  note,
                                  uploadedUrl || 'N/A',
                                  undefined,
                                  selections['SPECIFIC_SHOT']?.shot_number || undefined,
                                  selections['CLIENT_TYPE']?.id === 'gender-man' ? 'MAN' : (selections['CLIENT_TYPE']?.id === 'gender-woman' ? 'WOMAN' : undefined)
                               );
                            }
                            navigator.clipboard.writeText(textToCopy);
                            alert('Analisi salvata nel CRM e Appunti copiati in memoria!');
                         } catch (err) {
                            console.error(err);
                            alert('Errore durante il salvataggio nel CRM.');
                         } finally {
                            btn.innerHTML = originalText;
                         }
                      }}
                      style={{ marginTop: '12px', width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00d2ff, #03dac6)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                   >
                      <Icons.Database size={18} /> Salva Analisi nel CRM (e Copia Testo)
                   </button>
                </div>
              )}

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
