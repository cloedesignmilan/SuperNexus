import { GoogleGenAI } from "@google/genai";
import { getRandomSceneForSubcategory } from "@/app/api/telegram/webhook/sceneDictionary";
import { getPromptsForSelection } from "../../prompt-configs";


export interface GenerateImagesOptions {
    qty: number;
    subcat: any; // Subcategory with business_mode, category, reference_images
    publicUrls: string[];
    userClarification: string;
    isOutfit: boolean;
    varianceEnabled: boolean;
    generationModel: string;
    taxonomyCat?: string;
    taxonomyMode?: string;
    taxonomySubcat?: string;
    specificShotNumber?: number;
    clientGender?: string;
    detectedProductType?: string;
    aspectRatio?: string;
    printLocation?: string;
    imageBackUrl?: string;
    productColors?: string[];
}

export async function generateDressImages({
    qty,
    subcat,
    publicUrls,
    userClarification,
    isOutfit,
    varianceEnabled,
    generationModel,
    taxonomyCat,
    taxonomyMode,
    taxonomySubcat,
    specificShotNumber,
    clientGender,
    detectedProductType,
    aspectRatio,
    printLocation,
    imageBackUrl,
    productColors
}: GenerateImagesOptions) {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
    
    // Mappa l'aspect ratio richiesto a uno supportato nativamente da Imagen 3
    let finalAspectRatio = "3:4"; // Default per portrait
    if (aspectRatio === "1:1") finalAspectRatio = "1:1";
    else if (aspectRatio === "9:16") finalAspectRatio = "9:16";
    else if (aspectRatio === "16:9") finalAspectRatio = "16:9";
    else if (aspectRatio === "4:3") finalAspectRatio = "4:3";
    else if (aspectRatio === "4:5") finalAspectRatio = "3:4"; // Imagen 3 non supporta 4:5, il 3:4 è il fallback corretto.
    
    // 1. Fetch input images and convert to base64
    let base64OutfitParts: any[] = [];
    let base64BackPart: any | null = null;
    
    for (const url of publicUrls) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                const ab = await res.arrayBuffer();
                base64OutfitParts.push({
                    inlineData: { data: Buffer.from(ab).toString('base64'), mimeType: res.headers.get('content-type') || 'image/jpeg' }
                });
            }
        } catch(e) {
            console.error("Error fetching publicUrl:", url, e);
        }
    }
    
    if (imageBackUrl) {
        try {
            const res = await fetch(imageBackUrl);
            if (res.ok) {
                const ab = await res.arrayBuffer();
                base64BackPart = {
                    inlineData: { data: Buffer.from(ab).toString('base64'), mimeType: res.headers.get('content-type') || 'image/jpeg' }
                };
            }
        } catch(e) {
            console.error("Error fetching imageBackUrl:", imageBackUrl, e);
        }
    }
    
    if (base64OutfitParts.length === 0) {
        throw new Error("Impossibile scaricare le immagini input.");
    }

    // 2. Fetch Reference Images if any
    const referenceImages = subcat.reference_images || [];
    let referenceBuffers: { data: string, mimeType: string }[] = [];
    
    for (const ref of referenceImages.slice(0, 10)) {
         try {
             const rRes = await fetch(ref.image_url);
             if(rRes.ok) {
                 const rBuf = await rRes.arrayBuffer();
                 const rB64 = Buffer.from(rBuf).toString('base64');
                 const rMime = rRes.headers.get('content-type') || 'image/jpeg';
                 referenceBuffers.push({ data: rB64, mimeType: rMime });
             }
         } catch(e) {}
    }

    // 3. Prompt Master Construction
    const basePrompt = subcat.base_prompt_prefix;
    const bContext = subcat.business_context ? `\n[BUSINESS CONTEXT: ${subcat.business_context}]` : "";
    const mStyle = subcat.style_type ? `\n[STYLE TYPE: ${subcat.style_type}]` : "";
    const oGoal = subcat.output_goal ? `\n[OUTPUT GOAL: ${subcat.output_goal}]` : "";
    const masterStyle = `${bContext}${mStyle}${oGoal}\n${basePrompt}`.trim();

    const userPrompt = `[CLINICAL VIRTUAL TRY-ON OPERATION] 
L'immagine allegata NON È UNA ISPIRAZIONE, è il SOGGETTO DEL RITRATTO (${subcat.business_mode?.category?.name || 'Prodotto'}). 
Devi vestire un modello o adattare l'ambiente a questa precisa veste nello STILE richiesto:

[STILE RICHIESTO]: ${masterStyle}

REGOLE ASSOLUTE E INVIOLABILI PER PRESERVARE L'ABITO:
1. PRESERVAZIONE STRUTTURALE AL 100%: E' SEVERAMENTE VIETATO modificare o immaginare diversamente la scollatura, le cuciture, i dettagli, la lunghezza dell'abito o delle maniche, cinture e bottoni. Il capo deve essere perfettamente identico.
2. PRESERVAZIONE MATERIALE AL 100%: Il colore ESATTO, il tipo di tessuto (seta, lana, cotone pesante, ecc) e la texturizzazione visiva devono essere identici all'originale. Non aggiungere pizzi, stampe, o increspature che non esistono nella foto.
3. ADATTAMENTO CORPOREO E VOLTI: Se lo stile richiede una modella/o, la persona DEVE avere un VISO e OCCHI A FUOCO, NITIDI. 
4. RIMOZIONE CARTELLINI E ETICHETTE INTERNE: Se l'immagine originale contiene un cartellino del negozio (price tag) o un'ETICHETTA INTERNA DEL BRAND (neck label, tag della taglia) visibile dentro il colletto, ESSI DEVONO SPARIRE. È ASSOLUTAMENTE VIETATO stampare l'etichetta del colletto all'esterno della maglietta o deformare il colletto per mostrarla. Il colletto deve essere pulito e naturale.
5. FOCUS SUL CAPO ORIGINALE (NO EXTRA LAYERS): Se l'immagine in input ritrae un abito da donna, una t-shirt, top o altro indumento, E' ASSOLUTAMENTE VIETATO aggiungere o coprirlo parzialmente con cappotti, giacche, felpe, maglie o scialli non presenti nella foto originale. L'indumento inserito dal cliente deve essere esaltato e mostrato per intero senza coperture spurie.
6. VARIETA' (Batch): Genera pose naturali e diverse tra loro ispirate al dataset fotografico dello Stile.
7. NO ATTREZZATURA: È ASSOLUTAMENTE VIETATO includere luci da set, softbox, cavalletti, macchine fotografiche o ring light nell'immagine. L'ambiente deve essere puro e senza backstage visibile.
8. FRONT PRINT EXCLUSIVITY: Se non hai ricevuto un'immagine specifica per il retro (BACK) e questo capo ha una stampa sul fronte, IL RETRO DEVE ESSERE COMPLETAMENTE BIANCO/VUOTO (tinta unita). È ASSOLUTAMENTE VIETATO copiare o far comparire la stampa frontale sul retro della maglietta nelle foto scattate da dietro.
${userClarification === 'UGC_MAN' ? `9. CLARIFICATION FROM THE USER: The user has explicitly requested a MALE model for this shot. YOU MUST STRICTLY USE A HANDSOME 20-25 YEAR OLD BOY. ABSOLUTELY NO FEMALE MODELS. You MUST adapt the fit of the t-shirt to a male body.` : (userClarification !== 'X' ? `9. CLARIFICATION FROM THE USER: The user was asked a question about the garment and explicitly responded with: "${userClarification}". YOU MUST STRICTLY RESPECT THIS INFORMATION AND BUILD THE IMAGE ACCORDINGLY.` : '')}
${isOutfit ? `10. CRITICAL OUTFIT COORDINATION: The user has provided MULTIPLE reference images for this job. YOU MUST COMBINE THEM! Do not generate them separately. Dress the model or arrange the scene with ALL the provided items simultaneously, creating a perfectly coordinated outfit.` : ''}
${taxonomySubcat?.toLowerCase().includes('model photo') ? `11. MODEL REALISM (NO PLASTIC): I modelli DEVONO essere esteticamente bellissimi, con lineamenti eleganti da alta moda. TUTTAVIA, DEVI GARANTIRE UN REALISMO ESTREMO FOTOGRAFICO. La pelle NON deve sembrare di plastica, lisciata, CGI o videogioco. Mostra la texture naturale della pelle, i pori e un'illuminazione fotografica reale. Le pose devono essere eleganti ma non rigide o finte come manichini.` : ''}
${(taxonomyCat?.toLowerCase().includes('dress') && taxonomyMode?.toLowerCase().includes('detail')) ? `12. CRITICAL DRESS DETAIL PRESERVATION (DOUBLE ANALYSIS): Esegui una DOPPIA ANALISI e procedi con ESTREMA CAUTELA sui piccoli dettagli strutturali dell'abito. È SEVERAMENTE VIETATO allucinare o inventare cinture che non esistono nell'originale. È SEVERAMENTE VIETATO ingrossare o modificare le spalline (se l'abito ha spalline sottili, DEVONO rimanere sottili). FAI ATTENZIONE a nastri o foulard appoggiati alla gruccia: sono elementi ESTERNI e INDIPENDENTI, NON fanno parte della struttura dell'abito e NON devono essere fusi nel design del vestito.` : ''}`;

    const poseModifiers = [
        // Image 1: Attention (scroll stopping) / Hero Shot
        "[COMMERCIAL INTENT: ATTENTION/SCROLL STOPPING] full body shot, walking or standing, clean composition, clear product visibility, fashion editorial posture, high impact",
        // Image 2: Trust (clean, clear product visibility) / Lifestyle
        "[COMMERCIAL INTENT: TRUST/CLEAR VISIBILITY] medium shot, relaxed pose, touching hair or looking away, natural candid moment, interacting with environment, builds trust",
        // Image 3: Desire (lifestyle/emotional connection) / Detail
        "[COMMERCIAL INTENT: DESIRE/LIFESTYLE] closer crop, torso or upper body focus, focus on product fit and details, highly editorial composition, emotional connection",
        // Image 4+: randomized variations
        "[COMMERCIAL INTENT: ATTENTION] low camera angle, looking towards the horizon, elegant fashion posture, dynamic",
        "[COMMERCIAL INTENT: DESIRE] high angle shot, adjusting garment, candid documentary style, looking away"
    ];

    const lightingModifiers = [
        "bright sunlight, clear day, strong direct lighting, summer outdoor lighting",
        "soft diffused lighting, overcast or gentle sunset, flattering and smooth",
        "golden hour warm lighting, cinematic rim light"
    ];

    const isShoeCatalog = userPrompt.includes('CLEAN CATALOG MODE – SHOES') || userPrompt.toLowerCase().includes('shoes');
    const isTshirt = userPrompt.toLowerCase().includes('t-shirt') || userPrompt.toLowerCase().includes('tshirt') || userPrompt.toLowerCase().includes('hoodie');

    let isTshirtClean = false;
    let isTshirtUGC = false;
    let isTshirtAds = false;
    let isTshirtBackPrint = false;
    let isTshirtNoModel = false;
    let isTshirtColorVariants = false;
    let isTshirtPremium = false;

    if (isTshirt) {
        isTshirtClean = userPrompt.toLowerCase().includes('clean catalog');
        isTshirtUGC = userPrompt.toLowerCase().includes('ugc');
        isTshirtAds = userPrompt.toLowerCase().includes('ads') || userPrompt.toLowerCase().includes('scroll stopper');
        isTshirtBackPrint = printLocation === 'back' || userPrompt.toLowerCase().includes('back print') || userPrompt.toLowerCase().includes('back design');
        isTshirtNoModel = userPrompt.toLowerCase().includes('no model');
        isTshirtColorVariants = userPrompt.toLowerCase().includes('color variants') || userPrompt.toLowerCase().includes('different colors');
        isTshirtPremium = userPrompt.toLowerCase().includes('premium brand') || userPrompt.toLowerCase().includes('luxury');
    }

    // For poses, we want strict sequence for the first 3 to guarantee the campaign variety
    let strictPoses = [...poseModifiers];
    
    if (isShoeCatalog) {
        strictPoses = [
            "[SHOES ANGLE 1] 3/4 front view (hero)",
            "[SHOES ANGLE 2] full side view (perfect profile)",
            "[SHOES ANGLE 3] top view (from above)",
            "[SHOES ANGLE 4] pair front view (both shoes aligned)",
            "[SHOES ANGLE 5] back view (heel focus)",
            "[SHOES ANGLE 6] sole bottom view",
            "[SHOES ANGLE 7] detail close-up (logo or texture)"
        ];
    } else if (isTshirt) {
        if (isTshirtBackPrint) {
            strictPoses = [
                "[T-SHIRT BACK PRINT 1] Show full back clearly, model turned away, design fully visible, no cropping",
                "[T-SHIRT BACK PRINT 2] Slightly rotated back view, natural relaxed pose, back print 100% visible",
                "[T-SHIRT BACK PRINT 3] Close-up on back print design, ultra sharp, clear details",
                "[T-SHIRT BACK PRINT 4] Over-the-shoulder look, back print fully visible",
                "[T-SHIRT BACK PRINT 5] Lifestyle back shot, model walking away, design clearly visible"
            ];
        } else if (isTshirtNoModel) {
            strictPoses = [
                "[T-SHIRT NO MODEL 1] Flat lay, clean studio background, perfect symmetry, perfect alignment, no wrinkles",
                "[T-SHIRT NO MODEL 2] Ghost mannequin shot, clean studio background, perfect symmetry",
                "[T-SHIRT NO MODEL 3] Hanger shot, clean background, focus on product shape and fit",
                "[T-SHIRT NO MODEL 4] Flat lay close-up on fabric/stitching, ultra sharp, no wrinkles",
                "[T-SHIRT NO MODEL 5] Ghost mannequin side angle, clean studio background"
            ];
        } else if (isTshirtColorVariants) {
            strictPoses = [
                "[T-SHIRT COLOR VARIANT 1] Front view, change ONLY base color, keep design identical, maintain same lighting and framing",
                "[T-SHIRT COLOR VARIANT 2] Front view, change ONLY base color, keep design identical, maintain same lighting and framing",
                "[T-SHIRT COLOR VARIANT 3] Front view, change ONLY base color, keep design identical, maintain same lighting and framing",
                "[T-SHIRT COLOR VARIANT 4] Front view, change ONLY base color, keep design identical, maintain same lighting and framing",
                "[T-SHIRT COLOR VARIANT 5] Front view, change ONLY base color, keep design identical, maintain same lighting and framing"
            ];
        } else if (isTshirtPremium) {
            strictPoses = [
                "[T-SHIRT PREMIUM 1] High-end minimal environment, luxury fashion editorial, confident minimal pose, soft cinematic light",
                "[T-SHIRT PREMIUM 2] Elevated branding feel, soft cinematic light, product-focused",
                "[T-SHIRT PREMIUM 3] Editorial close-up, luxury lighting, premium texture focus",
                "[T-SHIRT PREMIUM 4] Minimal studio, high fashion posture, cinematic shadows",
                "[T-SHIRT PREMIUM 5] Aspirative luxury environment, confident relaxed pose"
            ];
        } else if (isTshirtUGC) {
            strictPoses = [
                "[T-SHIRT UGC 1] Mirror selfie, bedroom environment, real person vibe, authentic not polished",
                "[T-SHIRT UGC 2] Street casual, iPhone style, handheld feeling, slight motion blur",
                "[T-SHIRT UGC 3] Home environment, natural light only, slightly imperfect framing",
                "[T-SHIRT UGC 4] FIT FOCUS (UGC): Mid torso crop, real life setting. Show fit on chest and sleeves naturally.",
                "[T-SHIRT UGC 5] DETAIL (UGC): Casual close-up on fabric/print, real shadows, slight grain, not professional."
            ];
        } else if (isTshirtAds) {
            strictPoses = [
                "[T-SHIRT SCROLL STOPPER 1] Bold pose, close camera, large in frame, strong contrast, eye-catching",
                "[T-SHIRT SCROLL STOPPER 2] Movement (walking, turning), dramatic framing, high attention",
                "[T-SHIRT SCROLL STOPPER 3] High contrast or golden hour light, scroll stopping mood",
                "[T-SHIRT SCROLL STOPPER 4] FIT FOCUS (ADS): Mid torso crop, dynamic angle, bold lighting on chest and fit.",
                "[T-SHIRT SCROLL STOPPER 5] LIFESTYLE SCROLL STOPPER: Urban street, strong visual impact, aspirational real brand feeling."
            ];
        } else {
            // Default T-shirt Set (Lifestyle / General)
            strictPoses = [
                "[T-SHIRT LIFESTYLE 1] Urban street or coffee shop, young realistic person, natural walking pose, soft shadows, modern aspirational",
                "[T-SHIRT LIFESTYLE 2] FRONT MODEL SHOT: Model facing camera, neutral pose, casual environment",
                "[T-SHIRT LIFESTYLE 3] FIT FOCUS: Mid torso crop, showing how it fits on body (chest, sleeves, length)",
                "[T-SHIRT LIFESTYLE 4] BACK MODEL SHOT: Show full back of t-shirt clearly",
                "[T-SHIRT LIFESTYLE 5] DETAIL CLOSE-UP: Macro shot on print, texture, or fabric. Ultra sharp.",
                "[T-SHIRT LIFESTYLE 6] Casual outdoor, relaxed candid posture, natural light",
                "[T-SHIRT LIFESTYLE 7] FLAT LAY: Top-down, clean background, no people"
            ];
        }
    }
    
    // STYLE LOCK: Pick ONE lighting style and ONE magical seed base for the ENTIRE BATCH
    const lockedLighting = lightingModifiers[Math.floor(Math.random() * lightingModifiers.length)];

    // NEW ARCHITECTURE: Sequential Generation Loop for True Identity Lock
    let identityReferenceBase64: string | null = null;
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let generatedBase64s: string[] = [];
    let generatedMetadata: { shotNumber: number | null, shotName: string | null }[] = [];
    let errorMessages: string[] = [];

    // Tenta prima la Taxonomy esplicita dal Wizard, altrimenti fallback su Subcat DB
    const categorySlug = taxonomyCat ? taxonomyCat.toLowerCase().replace(/[^a-z0-9]+/g, '-') : (subcat.business_mode?.category?.slug || "");
    const modeSlug = taxonomyMode ? taxonomyMode.toLowerCase().replace(/[^a-z0-9]+/g, '-') : (subcat.business_mode?.slug || "");
    const presentationSlug = taxonomySubcat ? taxonomySubcat.toLowerCase().replace(/[^a-z0-9]+/g, '-') : (subcat.slug || "");
    
    // Extract requested model age from userPrompt
    const ageMatch = userPrompt.match(/(\d+) years old model/);
    const extractedAge = ageMatch ? parseInt(ageMatch[1]) : null;
    let ageLockDirective = "";
    let ageNegativeDirective = "";
    
    if (extractedAge) {
        if (extractedAge < 25) {
            ageLockDirective = `[AGE LOCK: The person MUST BE strictly ${extractedAge} years old. Emphasize extreme youth, teenage or very early 20s facial features, youthful skin. DO NOT generate an older person.] `;
            ageNegativeDirective = "older, mature, wrinkles, middle-aged, 30s, 40s, 50s, signs of aging, ";
        } else if (extractedAge >= 40) {
            ageLockDirective = `[AGE LOCK: The person MUST BE strictly ${extractedAge} years old. You MUST show realistic and undeniable signs of aging: mature skin texture, visible wrinkles, expression lines, older facial structure. DO NOT generate a young, flawless 20s model. This is a strict demographic requirement for a mature person.] `;
            ageNegativeDirective = "young, youth, 20s, 30s, flawless skin, teenage, baby face, unblemished, young fashion model, ";
        } else {
            ageLockDirective = `[AGE LOCK: The person MUST BE strictly ${extractedAge} years old. Show accurate, realistic facial features for this exact age.] `;
        }
    }

    const configShots = await getPromptsForSelection({
        categorySlug,
        modeSlug,
        presentationSlug,
        quantity: qty,
        specificShotNumber,
        gender: clientGender
    });
    
    console.log("DEBUG: configShots loaded for", { categorySlug, modeSlug, presentationSlug, gender: clientGender });
    console.log("DEBUG: configShots length:", configShots ? configShots.length : "NULL");
    if (configShots && configShots.length > 0) {
        console.log("DEBUG: First shot name:", configShots[0].shot_name);
    }

    for (let i = 0; i < qty; i++) {
        const currentPose = strictPoses[i % strictPoses.length];
        let currentLighting = lockedLighting;

        let variantPrompt = "";
        let aiParts = [];
        
        let currentRefInline = null;
        if (referenceBuffers.length > 0) {
            currentRefInline = referenceBuffers[i % referenceBuffers.length];
        }

        let currentShotName: string | null = null;
        let currentShotNumber: number | null = null;

        // Strict vs Dynamic Branching
        const hasValidStrictReference = subcat.strict_reference_mode && currentRefInline;

        if (hasValidStrictReference) {
            currentShotName = "Strict Reference Clone";
            currentShotNumber = i + 1;
            variantPrompt = userPrompt + `\n\n[STRICT REFERENCE CLONE MODE ACTIVATED: Generazione nr. ${i+1}.\nATTENTION: Because Strict Mode is ON, you MUST absolutely CLONE the exact POSTURE, CAMERA ANGLE, LIGHTING, and SCENE from the INSPIRATION image provided. Do NOT invent random poses. Do NOT change the background structure from the reference. The output MUST visually map 1:1 to the Inspiration image, except for the Garment which is swapped.]`;
            
            if (base64BackPart) {
                aiParts.push({ text: "SUBJECT GARMENT - FRONT VIEW (To be mapped on front-facing parts of the pose):" });
                aiParts.push(...base64OutfitParts);
                aiParts.push({ text: "SUBJECT GARMENT - BACK VIEW (To be mapped on back-facing parts of the pose):" });
                aiParts.push(base64BackPart);
            } else if (isOutfit) {
                aiParts.push({ text: "SUBJECT GARMENTS TO OUTFIT COORDINATE (Use ALL items together in the same image):" });
                aiParts.push(...base64OutfitParts);
            } else {
                aiParts.push({ text: "SUBJECT GARMENT TO STRICTLY CLONE (Do NOT change details on this specific item. CRITICAL: DO NOT CLONE ITS BACKGROUND!):" });
                aiParts.push(...base64OutfitParts);
            }
            
            aiParts.push({ text: "[MANDATORY CLONE DIRECTIVE]: CRITICAL INSPIRATION. YOU MUST EMULATE THE SHOT ANGLE, LIGHTING, AND BODY POSITION OF THIS EXACT IMAGE:" });
            aiParts.push({ inlineData: currentRefInline });
            
            aiParts.push({ text: variantPrompt });
            
        } else if (configShots && i < configShots.length) {
            const shotInfo = configShots[i];
            currentShotName = (shotInfo as any).shotName || shotInfo.shot_name;
            currentShotNumber = (shotInfo as any).shotNumber || shotInfo.shot_number;
            
            let ecommerceBlockPositive = "";
            let ecommerceBlockNegative = "";
            if (modeSlug === "clean-catalog" && presentationSlug === "no-model") {
                ecommerceBlockPositive = "single product, centered, clean background, ";
                ecommerceBlockNegative = "human, model, hands, props, lifestyle, storytelling, devices, tablet, phone, ";
            }

            let genderLockPositive = ageLockDirective;
            let genderLockNegative = ageNegativeDirective;
            if (clientGender === 'MAN') {
                genderLockPositive = `[GENDER LOCK: MALE] MUST BE A REALISTIC MALE PERSON. ABSOLUTELY NO FEMALES. ${ageLockDirective}`;
                genderLockNegative = `female, woman, girl, breasts, feminine features, ${ageNegativeDirective}`;
            } else if (clientGender === 'WOMAN') {
                genderLockPositive = `[GENDER LOCK: FEMALE] MUST BE A REALISTIC FEMALE PERSON. ABSOLUTELY NO MALES. ${ageLockDirective}`;
                genderLockNegative = `male, man, boy, facial hair, masculine features, ${ageNegativeDirective}`;
            }

            const isBackShotPrompt = shotInfo.positive_prompt?.toLowerCase().includes("from behind") || shotInfo.positive_prompt?.toLowerCase().includes("back view") || shotInfo.positive_prompt?.toLowerCase().includes("walking away");
            const isBackShotNoPrint = shotInfo.hard_rules?.includes("NO PRINT") || shotInfo.positive_prompt?.includes("NO PRINT") || (isBackShotPrompt && !imageBackUrl && printLocation !== 'back');
            
            let backShotOverride = "";
            if (base64BackPart) {
                backShotOverride = `\n\n[CRITICAL DUAL-REFERENCE RULE]: The user uploaded BOTH the Front View and Back View of the garment. If the shot shows the front of the model, strictly replicate the FRONT VIEW graphic. If the shot shows the back of the model, strictly replicate the BACK VIEW graphic. NEVER mix them. NEVER assume the back is blank unless the Back View image is blank.`;
            } else if (printLocation === 'back') {
                backShotOverride = `\n\n[CRITICAL PRINT OVERRIDE]: The reference image shows the BACK PRINT of the t-shirt. You MUST generate ALL images showing the BACK of the model/garment. If this is a flat-lay, folded stack, or hanger shot, you MUST arrange the garment FACE-DOWN so the BACK is fully visible to the camera. The front collar/tag MUST be hidden. You MUST replicate the uploaded design perfectly on the BACK of the shirt. Do NOT assume the back is blank.`;
            } else if (isBackShotNoPrint) {
                backShotOverride = `\n\n[CRITICAL OVERRIDE FOR BACK VIEW]: The reference image shows the FRONT of the garment with a print/graphic. HOWEVER, THIS IS A BACK SHOT. YOU MUST ASSUME THE BACK OF THE GARMENT IS COMPLETELY BLANK. DO NOT REPLICATE THE FRONT PRINT ON THE BACK. DO NOT ADD ANY LOGOS, GRAPHICS, OR DESIGNS ON THE BACK OF THE SHIRT. IT MUST BE A SOLID COLOR.`;
            }

            // Replace dynamic placeholders
            const productNoun = categorySlug === 'swimwear' ? 'swimsuit' : categorySlug.replace('-', ' ');
            const genderNoun = clientGender === 'MAN' ? 'man' : (clientGender === 'WOMAN' ? 'woman' : 'model');
            
            let finalPositive = shotInfo.positive_prompt?.replace(/\{product\}/g, productNoun).replace(/\{gender\}/g, genderNoun) || "";
            if (clientGender === 'MAN') {
                finalPositive = finalPositive.replace(/\b([Mm])odel\b/g, '$1ale model');
            } else if (clientGender === 'WOMAN') {
                finalPositive = finalPositive.replace(/\b([Mm])odel\b/g, '$1emale model');
            }
            let finalNegative = "plastic skin, fake CGI, 3D render, smooth airbrushed skin, ugly, " + (shotInfo.negative_prompt?.replace(/\{product\}/g, productNoun).replace(/\{gender\}/g, genderNoun) || "");
            
            if (isTshirt) {
                finalNegative += ", wrinkles, heavy creases, messy fabric, crumpled, unironed, messy folds, baggy wrinkles";
            }

            
            const dbGlobalPositive = subcat?.business_mode?.category?.global_positive_prompt || "";
            const dbGlobalNegative = subcat?.business_mode?.category?.global_negative_prompt || "";
            const dbGlobalHardRules = subcat?.business_mode?.category?.global_hard_rules || "";
            
            const fallbackNegative = "plastic skin, fake CGI, 3D render, smooth airbrushed skin, ugly, " + dbGlobalNegative + (subcat.negative_prompt || "");
            const negativeDirective = "\nCRITICAL NEGATIVE PROMPT: " + fallbackNegative;
    
            
            const isNoModel = userPrompt.toLowerCase().includes('no model') || presentationSlug === 'no-model' || modeSlug === 'clean-catalog';
            const identityNoun = clientGender === 'MAN' ? 'man' : (clientGender === 'WOMAN' ? 'woman' : 'person');
            const identityPronoun = clientGender === 'MAN' ? 'His' : (clientGender === 'WOMAN' ? 'Her' : 'Their');
            const modelIdentityLock = isNoModel ? "" : `\n[MODEL IDENTITY LOCK SYSTEM: The same exact ${identityNoun} must appear in every image. ${identityPronoun} facial features, bone structure, eye shape, nose, lips, skin tone, hair color, hairstyle, and body proportions must remain identical. Do NOT generate different people. Do NOT reinterpret the model identity. This is the SAME person photographed multiple times during the same photoshoot. If the face changes, the result is invalid. Maintain absolute identity consistency across all images.]`;

            const shoeSpecificRules = isShoeCatalog ? `\n[ANGLE CONTROL SYSTEM (STRICT): Each image MUST represent a UNIQUE predefined angle. If an angle is duplicated → INVALID. If an angle is missing → INVALID.]\n[CONSISTENCY RULE: same distance from camera, same zoom level, same product size in frame, same framing margins. All images must look like part of the SAME catalog set.]\n[DIVERSITY ENFORCEMENT: Each image must be visually and technically different. Do NOT repeat similar angles or compositions.]` : "";

            let tshirtSpecificRules = "";
            if (isTshirt) {
                tshirtSpecificRules = `\n[T-SHIRT CORE SYSTEM] STRICT PRODUCT RULE: The t-shirt must be an EXACT 1:1 replica of the reference image. No changes in: color, fabric, fit, graphics, proportions. The garment must remain perfectly identical. NO WRINKLES. NO DISTORTION. NO DESIGN CHANGES. MODEL RULES: Realistic human, Natural skin texture (no plastic/AI look), Correct anatomy, No deformed hands. DIVERSITY RULE: Each image must vary pose, camera angle, framing, composition. OUTPUT QUALITY: Photorealistic, high-end fashion photography.`;
            }

            
            const productLockSystem = "\n" + dbGlobalPositive;
            const wearDirective = isNoModel ? "\n[DIRECTIVE: The product must be displayed ALONE, flat lay or ghost mannequin. NO HUMAN MODEL.]" : "\n[DIRECTIVE: You MUST generate a REALISTIC HUMAN MODEL wearing the product. If the input is a flat-lay, you must perfectly map it onto the model's 3D body.]";
            const categoryHardRules = "\n" + dbGlobalHardRules;
    

            const isBottom = detectedProductType && /pant|trouser|jean|short|skirt|bottom|legging/i.test(detectedProductType);
            const stylingDirective = "\n[STYLING RULE: Whenever you generate complementary clothing items (like shoes, or a top for pants, or pants for a t-shirt), you MUST ensure the colors, fabrics, and footwear are highly fashionable, coherent, and match the aesthetic of the main product perfectly.]";
            const bottomsDirective = isBottom ? "\n[CRITICAL DIRECTIVE: The uploaded product is a BOTTOM garment (pants/skirt/shorts). You MUST render the model wearing it on their LOWER BODY (legs/waist). Do NOT wear it on the upper body. Generate a complementary top (shirt/sweater) that matches the style perfectly. Ensure shoes match the outfit.]" : "";

            variantPrompt = userPrompt + `\n\n${productLockSystem}${wearDirective}${bottomsDirective}${stylingDirective}\n[CONTROLLED VARIATION SYSTEM: The environment, lighting, and model MUST remain identical across all generations. This is a single photoshoot. Do NOT change location, lighting direction/intensity, outfit, or model identity. Allowed variations ONLY in: camera angle, framing, and pose.]${modelIdentityLock}${categoryHardRules}\n[MICRO VARIATION SYSTEM: Introduce subtle natural variations between shots: slight differences in facial expression, micro changes in body posture, minimal variation in hand positioning, and subtle shifts in gaze direction. These must feel natural and human, not staged.]\n[SHOOTING REALISM RULE: This must feel like a real photoshoot sequence. Avoid perfect symmetry. Avoid identical posture repetition. Avoid robotic consistency. Each image should feel like a different moment captured during the same shooting session.]\n[CAMERA VARIATION RULE: Each image MUST have a clearly different framing. For example, Image 1: full body (head to toe), strong presence; Image 2: mid shot (waist-up), natural and relatable; Image 3: close-up (torso or detail), emotional and aesthetic. Do NOT repeat the same framing. Each image must feel intentionally different in composition.]\n\n[SEED/VARIANTE: Generazione nr. ${i+1}.\nSTRICT CAMERA/POSE DIRECTIVE (YOU MUST FOLLOW THIS): ${genderLockPositive}${currentPose}\nLOCKED LIGHTING/AESTHETIC: ${currentLighting}\nMantieni il VISO PERFETTAMENTE A FUOCO e la FORMA/COLORE del capo identici all'originale.${negativeDirective}]`;
            
            if (base64BackPart) {
                aiParts.push({ text: "SUBJECT GARMENT - FRONT VIEW (To be mapped on front-facing parts of the pose):" });
                aiParts.push(...base64OutfitParts);
                aiParts.push({ text: "SUBJECT GARMENT - BACK VIEW (To be mapped on back-facing parts of the pose):" });
                aiParts.push(base64BackPart);
            } else if (isOutfit) {
                aiParts.push({ text: "SUBJECT GARMENTS TO OUTFIT COORDINATE (Use ALL items together in the same image):" });
                aiParts.push(...base64OutfitParts);
            } else {
                aiParts.push({ text: "SUBJECT GARMENT TO STRICTLY CLONE (Do NOT change details on this specific item. CRITICAL: DO NOT CLONE ITS BACKGROUND!):" });
                aiParts.push(...base64OutfitParts);
            }


            aiParts.push({ text: variantPrompt });
        }

        // TRUE IDENTITY LOCK INJECTION (TEMPORARILY DISABLED)
        // BUG FIX: Injecting the first generated image as a strict reference causes Gemini Flash 
        // to suffer from "Latent Collapse" (outputting perfectly identical clones of Image 1 and ignoring poses).
        /*
        if (i > 0 && identityReferenceBase64) {
            const identityPart = {
                text: "\n[IDENTITY REFERENCE SYSTEM: Use the provided reference image directly below as the SAME person. Do NOT change facial identity. Maintain identical face, bone structure, proportions, and skin tone. Only change pose, camera angle, and framing.]\n"
            };
            const identityImagePart = {
                inlineData: {
                    data: identityReferenceBase64,
                    mimeType: "image/jpeg"
                }
            };
            // Unshift to put it strongly at the beginning of the context
            aiParts.unshift(identityImagePart);
            aiParts.unshift(identityPart);
        }
        */

        let attempt = 0;
        let success = false;
        let result: any = null;

        while (!success && attempt < 3) {
            attempt++;
            try {
                result = await ai.models.generateContent({
                    model: generationModel,
                    contents: [
                        {
                            role: 'user',
                            parts: aiParts
                        }
                    ],
                    config: {
                        // @ts-ignore
                        imageConfig: { aspectRatio: finalAspectRatio }
                    }
                });
                success = true;
            } catch (err: any) {
                console.error(`Tentativo ${attempt} AI Engine fallito (Scena ${i+1}):`, err?.message);
                if (attempt >= 3) {
                    errorMessages.push(err?.message || err?.toString() || "Unknown error");
                }
                await new Promise(r => setTimeout(r, 6000)); // Retry backoff
            }
        }

        if (success && result) {
            if (result.usageMetadata) {
                totalTokensIn += result.usageMetadata.promptTokenCount || 0;
                totalTokensOut += result.usageMetadata.candidatesTokenCount || 0;
            }
            if (result.candidates && result.candidates.length > 0) {
                let foundImageInThisBatch = false;
                for (const candidate of result.candidates) {
                    if (candidate.content && candidate.content.parts) {
                        for (const part of candidate.content.parts) {
                            if (part.inlineData && part.inlineData.data) {
                                generatedBase64s.push(part.inlineData.data);
                                generatedMetadata.push({ shotNumber: currentShotNumber, shotName: currentShotName });
                                // Set the identity reference from the FIRST generated image
                                if (i === 0 && !identityReferenceBase64) {
                                    identityReferenceBase64 = part.inlineData.data;
                                }
                                foundImageInThisBatch = true;
                                break; // FIX: Prendi solo 1 immagine per ogni Shot
                            }
                        }
                    }
                    if (foundImageInThisBatch) break; // FIX: Esci dal ciclo candidati se hai trovato l'immagine
                }
                if (!foundImageInThisBatch) {
                    errorMessages.push(`Nessuna immagine base64 trovata nella risposta per la scena ${i+1}`);
                }
            } else {
                errorMessages.push(`Nessun candidato ritornato dall'API per la scena ${i+1}`);
            }
        }
    }

    // Ensure exact quantity output
    if (generatedBase64s.length > qty) {
        generatedBase64s = generatedBase64s.slice(0, qty);
    }

    return {
        generatedBase64s,
        generatedMetadata,
        errorMessages,
        totalTokensIn,
        totalTokensOut
    };
}
