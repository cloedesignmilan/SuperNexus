import { GoogleGenAI } from "@google/genai";
import { getRandomSceneForSubcategory } from "@/app/api/telegram/webhook/sceneDictionary";

export interface GenerateImagesOptions {
    qty: number;
    subcat: any; // Subcategory with business_mode, category, reference_images
    publicUrls: string[];
    userClarification: string;
    isOutfit: boolean;
    varianceEnabled: boolean;
    generationModel: string;
}

export async function generateImagesWithAI({
    qty,
    subcat,
    publicUrls,
    userClarification,
    isOutfit,
    varianceEnabled,
    generationModel
}: GenerateImagesOptions) {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
    
    // 1. Fetch input images and convert to base64
    let base64OutfitParts: any[] = [];
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
4. RIMOZIONE CARTELLINI: Se l'immagine originale contiene un cartellino del negozio, etichette o talloncini con il prezzo appesi al capo d'abbigliamento, essi DEVONO essere categoricamente ignorati ed eliminati nell'immagine generata.
5. FOCUS SUL CAPO ORIGINALE (NO EXTRA LAYERS): Se l'immagine in input ritrae un abito da donna, una t-shirt, top o altro indumento, E' ASSOLUTAMENTE VIETATO aggiungere o coprirlo parzialmente con cappotti, giacche, felpe, maglie o scialli non presenti nella foto originale. L'indumento inserito dal cliente deve essere esaltato e mostrato per intero senza coperture spurie.
6. VARIETA' (Batch): Genera pose naturali e diverse tra loro ispirate al dataset fotografico dello Stile.
7. NO ATTREZZATURA: È ASSOLUTAMENTE VIETATO includere luci da set, softbox, cavalletti, macchine fotografiche o ring light nell'immagine. L'ambiente deve essere puro e senza backstage visibile.
${userClarification === 'UGC_MAN' ? `8. CLARIFICATION FROM THE USER: The user has explicitly requested a MALE model for this shot. YOU MUST STRICTLY USE A HANDSOME 20-25 YEAR OLD BOY. ABSOLUTELY NO FEMALE MODELS. You MUST adapt the fit of the t-shirt to a male body.` : (userClarification !== 'X' ? `8. CLARIFICATION FROM THE USER: The user was asked a question about the garment and explicitly responded with: "${userClarification}". YOU MUST STRICTLY RESPECT THIS INFORMATION AND BUILD THE IMAGE ACCORDINGLY.` : '')}
${isOutfit ? `9. CRITICAL OUTFIT COORDINATION: The user has provided MULTIPLE reference images for this job. YOU MUST COMBINE THEM! Do not generate them separately. Dress the model or arrange the scene with ALL the provided items simultaneously, creating a perfectly coordinated outfit.` : ''}`;

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
        let isTshirtClean = userPrompt.toLowerCase().includes('clean catalog');
        let isTshirtUGC = userPrompt.toLowerCase().includes('ugc');
        let isTshirtAds = userPrompt.toLowerCase().includes('ads') || userPrompt.toLowerCase().includes('scroll stopper');
        let isTshirtBackPrint = userPrompt.toLowerCase().includes('back print') || userPrompt.toLowerCase().includes('back design');
        let isTshirtNoModel = userPrompt.toLowerCase().includes('no model');
        let isTshirtColorVariants = userPrompt.toLowerCase().includes('color variants') || userPrompt.toLowerCase().includes('different colors');
        let isTshirtPremium = userPrompt.toLowerCase().includes('premium brand') || userPrompt.toLowerCase().includes('luxury');

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
        } else if (isTshirtClean) {
            strictPoses = [
                "[IMAGE 1 — FRONT VIEW] Model or garment facing the camera directly. Centered composition. Full t-shirt clearly visible.",
                "[IMAGE 2 — BACK VIEW (MANDATORY)] The t-shirt must be rotated 180°. Show only the back side. Front print must NOT be visible.",
                "[IMAGE 3 — SIDE ANGLE (MANDATORY DIFFERENT)] The t-shirt must be rotated clearly (minimum 45°). It must NOT look like a front view. The side shape and silhouette must be visible.",
                "[IMAGE 4 — FLAT LAY (STRICT 90°)] Top-down 90° camera. T-shirt placed flat on surface. ABSOLUTE RULES: No perspective, no angle, no floating, no shadows from standing position. Must look like real ecommerce flat lay.",
                "[IMAGE 5 — CLOSE-UP DETAIL] Zoom on print or fabric. High detail, sharp focus."
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
    let errorMessages: string[] = [];

    for (let i = 0; i < qty; i++) {
        const currentPose = strictPoses[i % strictPoses.length];
        let currentLighting = lockedLighting;

        let variantPrompt = "";
        let aiParts = [];
        
        let currentRefInline = null;
        if (referenceBuffers.length > 0) {
            currentRefInline = referenceBuffers[i % referenceBuffers.length];
        }

        // Strict vs Dynamic Branching
        if (subcat.strict_reference_mode) {
            variantPrompt = userPrompt + `\n\n[STRICT REFERENCE CLONE MODE ACTIVATED: Generazione nr. ${i+1}.\nATTENTION: Because Strict Mode is ON, you MUST absolutely CLONE the exact POSTURE, CAMERA ANGLE, LIGHTING, and SCENE from the INSPIRATION image provided. Do NOT invent random poses. Do NOT change the background structure from the reference. The output MUST visually map 1:1 to the Inspiration image, except for the Garment which is swapped.]`;
            
            if (isOutfit) {
                aiParts.push({ text: "SUBJECT GARMENTS TO OUTFIT COORDINATE (Use ALL items together in the same image):" });
                aiParts.push(...base64OutfitParts);
            } else {
                aiParts.push({ text: "SUBJECT GARMENT TO STRICTLY CLONE (Do NOT change details on this specific item):" });
                aiParts.push(...base64OutfitParts);
            }
            
            if (currentRefInline) {
                aiParts.push({ text: "[MANDATORY CLONE DIRECTIVE]: CRITICAL INSPIRATION. YOU MUST EMULATE THE SHOT ANGLE, LIGHTING, AND BODY POSITION OF THIS EXACT IMAGE:" });
                aiParts.push({ inlineData: currentRefInline });
            }
            aiParts.push({ text: variantPrompt });
        } else {
            if (varianceEnabled) {
                const magicalScene = getRandomSceneForSubcategory(subcat.business_mode?.category?.slug + " " + subcat.business_mode?.slug + " " + subcat.slug);
                currentLighting += " " + magicalScene;
            }
            
            const negativeDirective = subcat.negative_prompt ? `\nCRITICAL NEGATIVE PROMPT (AVOID THESE AT ALL COSTS): ${subcat.negative_prompt}` : "";
            
            const isNoModel = userPrompt.toLowerCase().includes('no model');
            const modelIdentityLock = isNoModel ? "" : `\n[MODEL IDENTITY LOCK SYSTEM: The same exact woman must appear in every image. Her facial features, bone structure, eye shape, nose, lips, skin tone, hair color, hairstyle, and body proportions must remain identical. Do NOT generate different women. Do NOT reinterpret the model identity. This is the SAME person photographed multiple times during the same photoshoot. If the face changes, the result is invalid. Maintain absolute identity consistency across all images.]`;

            const shoeSpecificRules = isShoeCatalog ? `\n[ANGLE CONTROL SYSTEM (STRICT): Each image MUST represent a UNIQUE predefined angle. If an angle is duplicated → INVALID. If an angle is missing → INVALID.]\n[CONSISTENCY RULE: same distance from camera, same zoom level, same product size in frame, same framing margins. All images must look like part of the SAME catalog set.]\n[DIVERSITY ENFORCEMENT: Each image must be visually and technically different. Do NOT repeat similar angles or compositions.]` : "";

            let tshirtSpecificRules = "";
            if (isTshirtClean) {
                tshirtSpecificRules = `\n[T-SHIRT ECOMMERCE STRUCTURED SYSTEM] STRICT PRODUCT RULE: The t-shirt must be an EXACT 1:1 replica of the reference image. No changes in color, design, proportions or print. GENERATE EXACTLY 5 IMAGES. Each image MUST follow a specific role. IMPORTANT RULES: Each image MUST be completely different. Do NOT repeat the same framing. Do NOT generate similar compositions. Each image has a different purpose. If any required shot is missing or incorrect, the result is invalid. Do not replace missing shots with similar images. LIGHTING: Soft studio lighting, clean ecommerce style. This is a structured ecommerce photoshoot. Follow the shot list strictly. Do not improvise. FORBIDDEN: Floating t-shirts. Tilted compositions. Creative angles for ecommerce shots. This is a strict ecommerce product set. Do NOT generate artistic or creative shots for required images. Follow the shot list exactly.`;
            } else if (isTshirt) {
                tshirtSpecificRules = `\n[T-SHIRT CORE SYSTEM] STRICT PRODUCT RULE: The t-shirt must be an EXACT 1:1 replica of the reference image. No changes in: color, fabric, fit, graphics, proportions. The garment must remain perfectly identical. NO WRINKLES. NO DISTORTION. NO DESIGN CHANGES. MODEL RULES: Realistic human, Natural skin texture (no plastic/AI look), Correct anatomy, No deformed hands. DIVERSITY RULE: Each image must vary pose, camera angle, framing, composition. OUTPUT QUALITY: Photorealistic, high-end fashion photography.`;
            }

            variantPrompt = userPrompt + `\n\n[CRITICAL PRODUCT LOCK SYSTEM: The uploaded product image is the ONLY source of truth. The AI must NOT reinterpret, redesign, or approximate the product. It must replicate: exact structure (shape, cuts, stitching, elasticity), exact top construction (including ruched/elastic areas), exact strap positions and thickness, exact pattern placement and scale, exact fabric behavior, exact color tones. STRICT RULES: Do NOT simplify the design. Do NOT smooth or clean details. Do NOT change construction. Do NOT invent new elements (like bows, knots, rings). Do NOT modify pattern density or distribution. Disable creative reinterpretation for the product. Apply creativity ONLY to: pose, background, camera. For this bikini: the top MUST have the same ruched elastic structure, the straps MUST match exactly, the bottom pattern MUST remain identical, all seams and proportions must match the original image. If the product differs from the reference, the result is INVALID. PRIORITY: Product accuracy > model > scene > aesthetics.]\n[CONTROLLED VARIATION SYSTEM: The environment, lighting, and model MUST remain identical across all generations. This is a single photoshoot. Do NOT change location, lighting direction/intensity, outfit, or model identity. Allowed variations ONLY in: camera angle, framing, and pose.]${modelIdentityLock}${shoeSpecificRules}${tshirtSpecificRules}\n[MICRO VARIATION SYSTEM: Introduce subtle natural variations between shots: slight differences in facial expression, micro changes in body posture, minimal variation in hand positioning, and subtle shifts in gaze direction. These must feel natural and human, not staged.]\n[SHOOTING REALISM RULE: This must feel like a real photoshoot sequence. Avoid perfect symmetry. Avoid identical posture repetition. Avoid robotic consistency. Each image should feel like a different moment captured during the same shooting session.]\n[CAMERA VARIATION RULE: Each image MUST have a clearly different framing. For example, Image 1: full body (head to toe), strong presence; Image 2: mid shot (waist-up), natural and relatable; Image 3: close-up (torso or detail), emotional and aesthetic. Do NOT repeat the same framing. Each image must feel intentionally different in composition.]\n\n[SEED/VARIANTE: Generazione nr. ${i+1}.\nSTRICT CAMERA/POSE DIRECTIVE (YOU MUST FOLLOW THIS): ${currentPose}\nLOCKED LIGHTING/AESTHETIC: ${currentLighting}\nMantieni il VISO PERFETTAMENTE A FUOCO e la FORMA/COLORE del capo identici all'originale.${negativeDirective}]`;
            
            if (isOutfit) {
                aiParts.push({ text: "SUBJECT GARMENTS TO OUTFIT COORDINATE (Use ALL items together in the same image):" });
                aiParts.push(...base64OutfitParts);
            } else {
                aiParts.push({ text: "SUBJECT GARMENT TO STRICTLY CLONE (Do NOT change details on this specific item):" });
                aiParts.push(...base64OutfitParts);
            }

            if (currentRefInline) {
                aiParts.push({ text: "INSPIRATION / MOODBOARD PHOTOGRAPHY (Use ONLY for lighting, pose, and background aesthetic. DO NOT copy the clothes from this image):" });
                aiParts.push({ inlineData: currentRefInline });
            }
            aiParts.push({ text: variantPrompt });
        }

        // TRUE IDENTITY LOCK INJECTION
        // If this is image 2+ (i > 0) AND we successfully captured the identity from image 1
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
                        imageConfig: { aspectRatio: "3:4" }
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
                                // Set the identity reference from the FIRST generated image
                                if (i === 0 && !identityReferenceBase64) {
                                    identityReferenceBase64 = part.inlineData.data;
                                }
                                foundImageInThisBatch = true;
                            }
                        }
                    }
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
        totalTokensIn,
        totalTokensOut,
        errorMessages
    };
}
