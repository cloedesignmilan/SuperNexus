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

    // For poses, we want strict sequence for the first 3 to guarantee the campaign variety
    const strictPoses = [...poseModifiers];
    
    // STYLE LOCK: Pick ONE lighting style and ONE magical seed base for the ENTIRE BATCH
    const lockedLighting = lightingModifiers[Math.floor(Math.random() * lightingModifiers.length)];

    const promises = [];

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
            
            variantPrompt = userPrompt + `\n\n[CONTROLLED VARIATION SYSTEM: The environment, lighting, and model MUST remain identical across all generations. This is a single photoshoot. Do NOT change location, lighting direction/intensity, outfit, or model identity. Allowed variations ONLY in: camera angle, framing, and pose.]\n[MICRO VARIATION SYSTEM: Introduce subtle natural variations between shots: slight differences in facial expression, micro changes in body posture, minimal variation in hand positioning, and subtle shifts in gaze direction. These must feel natural and human, not staged.]\n\n[SEED/VARIANTE: Generazione nr. ${i+1}.\nSTRICT CAMERA/POSE DIRECTIVE (YOU MUST FOLLOW THIS): ${currentPose}\nLOCKED LIGHTING/AESTHETIC: ${currentLighting}\nMantieni il VISO PERFETTAMENTE A FUOCO e la FORMA/COLORE del capo identici all'originale.${negativeDirective}]`;
            
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

        promises.push(
            (async () => {
                // Sfasa le chiamate di 12 secondi per evitare i 429 di Google
                await new Promise(r => setTimeout(r, i * 12000));
                
                let attempt = 0;
                let success = false;
                let retryResult: any = null;

                while (!success && attempt < 3) {
                    attempt++;
                    try {
                        retryResult = await ai.models.generateContent({
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
                        if (attempt >= 3) throw err;
                        await new Promise(r => setTimeout(r, 6000)); // Retry backoff
                    }
                }
                return retryResult;
            })()
        );
    }

    const responses = await Promise.allSettled(promises);
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let generatedBase64s: string[] = [];
    let errorMessages: string[] = [];

    for (const outcome of responses) {
        if (outcome.status === 'fulfilled') {
            const result = outcome.value;
            if (result?.usageMetadata) {
                totalTokensIn += result.usageMetadata.promptTokenCount || 0;
                totalTokensOut += result.usageMetadata.candidatesTokenCount || 0;
            }
            if (result?.candidates && result.candidates.length > 0) {
                for (const candidate of result.candidates) {
                    if (candidate.content && candidate.content.parts) {
                        for (const part of candidate.content.parts) {
                            if (part.inlineData && part.inlineData.data) {
                                generatedBase64s.push(part.inlineData.data);
                            }
                        }
                    }
                }
            }
        } else {
            console.error('Una delle generazioni multiple ha fallito definitivamente:', outcome.reason);
            errorMessages.push(outcome.reason?.message || outcome.reason?.toString() || "Unknown error");
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
