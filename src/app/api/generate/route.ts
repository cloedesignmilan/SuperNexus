import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";
import { buildCreatorPrompt } from "@/lib/promptBuilder";
import { logApiCost } from "@/lib/gemini-cost";
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allows up to 5 mins on Vercel Pro
export async function POST(req: NextRequest) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

  let gJobId = null, gChatId = null, gStoreId = null;
  let totalJobCost = 0;

  try {
    const jsonBody = await req.json();
    gJobId = jsonBody.jobId;
    gChatId = jsonBody.chatId;
    gStoreId = jsonBody.storeId;
    
    const { jobId, fileUrl, chatId, storeId, confirmedCategory, subcategory_id, confirmedBottom, confirmedGender, confirmedScene, confirmedEnvironment, confirmedBrand, imgCount } = jsonBody;

    if (!jobId || !fileUrl || !storeId) {
      return NextResponse.json({ error: "jobId, fileUrl, and storeId are required" }, { status: 400 });
    }

    // FASE 1: Estrazione Dettagli (Vision)
    const imageResp = await fetch(fileUrl);
    const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
    
    // Passiamo il contesto già deciso all'IA affinché faccia focus sui dettagli
    const contextStr = confirmedBottom ? `(Nota: il cliente ha confermato che la parte inferiore è un/una ${confirmedBottom}).` : "";
    const analysisPrompt = `Sei un esperto ispettore di qualità e analista prodotto. Il capo in foto appartiene a una categoria selezionata. ${contextStr}

Analizza l'immagine fornita e restituisci ESATTAMENTE e SOLO un JSON valido, formattato rigorosamente secondo questo schema, senza markdown o testo aggiuntivo fuori dal blocco JSON.
Devi utilizzare ESCLUSIVAMENTE i valori consentiti indicati negli enum. Non inventare valori. Se l'informazione non è deducibile, usa null.

REGOLE AGGIUNTIVE TASSATIVE:
- IN 'suggested_ui_options': una categoria non può mai comparire sia in recommended_categories che in disabled_categories. recommended_categories può avere max 3 elementi. disabled_categories può avere max 4 elementi.
- IN 'ambiguity_flags': se 'requires_user_clarification' è false OPPURE 'clarification_type' è "none", 'suggested_question' in 'suggested_ui_options' DEVE ESSERE null. Se è true, 'suggested_question' deve essere una domanda breve coerente (in italiano).
- IN 'preservation_constraints.critical_details': Scrivi IN INGLESE. Usa MASSIMO 80-150 parole. Sii MANIACALE E CHIRURGICO. Se analizzi giacche, abiti da sposo o cerimonia, DEVI specificare i rever/baveri (peak lapels/punte, notch, shawl), tipo di abbottonatura (doppiopetto, monopetto, numero bottoni), tasche, cinture e taglio. DEVI obbligatoriamente estrarre e descrivere al millimetro ogni singolo accessorio per il collo o taschino (cravatte esatte, maglia/raso, foulard, papillon, pochette). SE ANALIZZI SCARPE/CALZATURE: Sii IPER-DETTAGLIATO. Descrivi l'altezza esatta della suola, il materiale esatto (pelle liscia, camoscio, tela, vernice), lacci o chiusure, loghi visibili, cuciture laterali, texture, forma della punta (squadrata, arrotondata, a punta) e spessore/forma del tacco. Includi SOLO descrizioni fisiche concrete, niente "This is an image of...".

{
  "technical_validation": {
    "is_usable": true,
    "lighting": "good" | "acceptable" | "poor",
    "sharpness": "good" | "acceptable" | "poor",
    "framing": "full" | "partial" | "unclear",
    "issues": ["too_dark", "blurred", "cluttered_background", "cropped_subject", "low_contrast", "multiple_items", "unclear_focus"] // o array vuoto
  },
  "product_classification": {
    "main_category": "tshirt" | "shirt" | "dress" | "outfit" | "shoes" | "trousers" | "skirt" | "jacket" | "unknown",
    "confidence": 0.95,
    "is_single_item": true,
    "gender_presentation": "male" | "female" | "unisex" | "unknown",
    "front_or_back": "front" | "back" | "unknown"
  },
  "preservation_constraints": {
    "must_preserve_color": true,
    "must_preserve_shape": true,
    "must_preserve_fit": true,
    "must_preserve_print": true,
    "must_preserve_logo": true,
    "critical_details": "HYPER-REALISTIC, MANIACAL 1:1 CLONING BLUEPRINT in English. Max 80-120 words. No fluff.",
    "main_color": "main color or null",
    "secondary_color": "secondary color or null",
    "fabric": "fabric material or null",
    "fit": "slim, loose, oversized, regular or null",
    "sleeve_length": "short, long, sleeveless, etc or null",
    "neckline": "v-neck, crew, etc or null",
    "print_description": "print details or null",
    "logo_description": "logo details or null",
    "length": "midi, maxi, cropped, etc or null",
    "closure_type": "zip, button, single-breasted, double-breasted, slip-on, etc or null",
    "lapel_style": "peak lapels, notch lapels, shawl collar, mandarin collar, etc or null",
    "pattern": "solid, pinstripe, checked, floral, geometric, etc or null",
    "accessories": "exact tie, bowtie, foulard, pocket square, lapel pins, or null"
  },
  "ambiguity_flags": {
    "multiple_items_detected": false,
    "unclear_garment_type": false,
    "requires_user_clarification": false,
    "clarification_type": "top_or_bottom" | "skirt_or_trousers" | "focus_item" | "gender_target" | "none"
  },
  "suggested_ui_options": {
    "recommended_categories": ["Donna", "Uomo", "T-Shirt", "Cerimonia", "Feste & 18°", "Calzature", "Vendita Online"], // Max 3, solo tra questi valori
    "disabled_categories": ["Donna", "Uomo", "T-Shirt", "Cerimonia", "Feste & 18°", "Calzature", "Vendita Online"], // Max 4, solo tra questi valori, mutuamente esclusivi dai recommended
    "should_ask_question": false,
    "suggested_question": "stringa domanda breve in italiano o null"
  },
  "legacy_creator_data": {
    "color": "MUST BE IN ENGLISH. Describe color and pattern exactly.",
    "type": "tshirt" | "shirt" | "dress" | "outfit" | "shoes" | "trousers" | "skirt" | "jacket" | "unknown",
    "short_description": "MUST BE IN ENGLISH. Short, stable and concise description max 1 line for legacy generative pipeline without fluff."
  }
}`;

    const visionResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [
            { text: analysisPrompt }, 
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/jpeg" } }
        ]}
      ]
    });

    if (visionResult.usageMetadata) {
        totalJobCost += await logApiCost("frontend_vision", "gemini-2.5-flash", visionResult.usageMetadata.promptTokenCount || 0, visionResult.usageMetadata.candidatesTokenCount || 0, null);
    }

    interface InspectorData {
        technical_validation?: { is_usable: boolean; };
        product_classification?: { main_category: string; confidence: string; };
        ambiguity_flags?: { requires_user_clarification: boolean; };
        suggested_ui_options?: { recommended_categories: string[]; };
        legacy_creator_data?: { short_description: string; color: string; type: string; };
        preservation_constraints?: { critical_details?: string; };
        [key: string]: any;
    }

    interface GarmentDetails {
        description: string;
        color: string;
        type: string;
    }

    let inspectorData: InspectorData | any = {};
    let garmentDetails: GarmentDetails;
    try {
        const cleaned = (visionResult.text || "{}").replace(/```json/g, "").replace(/```/g, "").trim();
        inspectorData = JSON.parse(cleaned);
        
        console.log("[DEBUG] Inspector JSON Strutturato:", JSON.stringify(inspectorData, null, 2));
        console.log(`[DEBUG SINTETICO] Usable: ${inspectorData.technical_validation?.is_usable} | Categoria: ${inspectorData.product_classification?.main_category} (${inspectorData.product_classification?.confidence}) | Chiarimenti: ${inspectorData.ambiguity_flags?.requires_user_clarification} | Consigliati: ${inspectorData.suggested_ui_options?.recommended_categories?.join(',')}`);

        garmentDetails = {
           description: inspectorData.legacy_creator_data?.short_description || inspectorData.preservation_constraints?.critical_details || "elegant high quality outfit",
           color: inspectorData.legacy_creator_data?.color || "original",
           type: inspectorData.legacy_creator_data?.type || inspectorData.product_classification?.main_category || "outfit"
        };
    } catch (e) {
        console.error("[CRITICO] Fallito parsing JSON dell'Inspector. Uso dati di fallback.", e);
        garmentDetails = { description: "elegant high quality outfit", type: "outfit", color: "original" };
    }

    // FASE 2: Carica Sottocategoria e Variazioni (Nuova Architettura)
    const storeObj = await (prisma as any).store.findUnique({ where: { id: storeId } });

    // Cerca la sottocategoria passata dal frontend
    const targetSubcategoryId = subcategory_id || confirmedCategory; // Fallback temporaneo se il front passa l'id nel campo sbagliato

    const subcategoryObj = await prisma.subcategory.findUnique({
         where: { id: targetSubcategoryId },
         include: { variations: { where: { is_active: true }, orderBy: { sort_order: 'asc' } } }
    });

    if (!subcategoryObj) {
         console.error(`[CRITICO] Sottocategoria non trovata nel DB: ${targetSubcategoryId}`);
         throw new Error(`Architettura Prompt mancante per la Sottocategoria: ${targetSubcategoryId}`);
    }

    const masterPromptText = subcategoryObj.base_prompt_prefix || 'Modella fotorealistica e professionale.';
    const isMagazine = subcategoryObj.name.includes("Cover") || subcategoryObj.name.includes("Magazine");
    const globalNegative = isMagazine ? "" : ", NO TEXT, NO LETTERS, NO WORDS, NO MAGAZINES, NO VOGUE, NO EDITORIAL COVERS";
    const negativeRulesText = (subcategoryObj.negative_prompt || 'No modifiche al capo, no tagli') + globalNegative;
    const integrityRules = subcategoryObj.product_integrity_rules || '';
    const categoryFocusName = subcategoryObj.name || 'Outfit';

    let targetScenes: string[] = [];
    let customVariationPrompts: string[] = [];
    let targetVariationCodes: string[] = [];

    if (subcategoryObj.variations && subcategoryObj.variations.length > 0) {
         // Uso le variazioni dal DB
         for (const variation of subcategoryObj.variations) {
             // Il targetScene qui è il variation_prompt
             targetScenes.push(variation.variation_name); // Lo usiamo solo come label di log/scene (potremmo usare un campo vuoto)
             customVariationPrompts.push(variation.variation_prompt);
             targetVariationCodes.push(variation.variation_code);
         }
    } else {
         // Fallback se la sottocategoria non ha variazioni, ne simuliamo una
         targetScenes.push("Default Variation");
         customVariationPrompts.push("Standard photorealistic composition.");
         targetVariationCodes.push("default_var");
    }
    
    // PERSONA LOCK GENERATOR (Coerenza facciale del Batch)
    const isMale = confirmedGender === 'uomo' || confirmedGender === 'Uomo' || confirmedGender?.toLowerCase().includes('uomo') || confirmedGender?.toLowerCase().includes('bambino');
    
    console.log(`[Persona Lock UGC] Campagna: ${confirmedCategory} | Bottom: ${confirmedBottom} | Genere: ${isMale ? 'UOMO' : 'DONNA'}`);

    let cameraAngles = [
        "Full body shot, head to toe completely visible", 
        "Mid shot, framed from the waist up", 
        "Slight close-up portrait, focusing on the upper chest and face"
    ];

    const poseModifiers = [
        "walking confidently towards the camera with dynamic movement",
        "standing straight with a high-fashion editorial pose",
        "looking slightly away gracefully, elegant side profile posture",
        "relaxed but confident posture, subtle and natural demeanor",
        "in mid-motion, dynamic atmospheric fashion model pose"
    ];

    const lightingModifiers = [
        "Golden hour sunset lighting, warm tones, beautiful edge rim light",
        "Moody overcast weather, soft diffused editorial light, cinematic feel",
        "High-contrast dramatic lighting, deep shadows, striking visual impact",
        "Bright crisp daylight, sharp distinct shadows, vibrant atmosphere",
        "Ethereal soft lighting, gentle shadows, highly aesthetic photography"
    ];

    const shuffledPoses = poseModifiers.sort(() => Math.random() - 0.5);
    const shuffledLighting = lightingModifiers.sort(() => Math.random() - 0.5);

    const isShoesCategory = categoryFocusName.toLowerCase().includes('scarpe') || categoryFocusName.toLowerCase().includes('calzature');

    let customCameraAngles: any[] | null = null;

    if (customCameraAngles) {
        cameraAngles = customCameraAngles;
    } else if (isShoesCategory) {
        cameraAngles = [
             "E-commerce macro still-life footwear, angled 3/4 front view, symmetrical placement, resting on a glossy white reflective surface. NO pedestals, NO props. Exclude people.",
             "E-commerce macro still-life footwear, straight top-down flat lay view, resting on a glossy white reflective surface. NO pedestals, NO props. Exclude people.",
             "E-commerce macro still-life footwear, back heel view, resting on a glossy white reflective surface. NO pedestals, NO props. Exclude people.",
             "E-commerce macro still-life footwear, side profile view, centered, resting on a glossy white reflective surface. NO pedestals, NO props. Exclude people."
        ];
    }

    let brandRule = "ABSOLUTE HARD RULE 3: NO STORE TAGS. If the original image contains plastic tags, cardboard price tags, or store labels attached to the garment, YOU MUST COMPLETELY REMOVE AND IGNORE THEM. DO NOT replicate store labels or price tags under any circumstances. DO NOT generate any fake text, brand logos, price tags, hanging tags, or watermarks.";
    let negativeBrandRule = "No brand logos, no text in the image, no price tags, no store tags, no cardboard tags, no plastic tags, no hanging labels attached to the garments. Remove original price tags.";

    if (isShoesCategory) {
        if (!customCameraAngles) {
            cameraAngles = [
                "Low angle full body shot, incredibly sharp focus on the shoes", 
                "Macro close-up shot focused specifically on the footwear and ankles, stylish pose with neutral clothing", 
                "Full body shot, head to toe completely visible, dynamic walking motion highlighting the shoes"
            ];
        }
        if (confirmedBrand) {
             brandRule = `ABSOLUTE HARD RULE 3: IL CLIENTE HA ESPLICITAMENTE CONFERMATO CHE IL TESTO/LOGO SULLA SCARPA È: "${confirmedBrand}". DEVI INTAGLIARE O STAMPARE ESATTAMENTE LA PAROLA "${confirmedBrand}" SULLA TARGHETTA O SCARPA E RISPETTARE STRICTLY LE CUCITURE ORIGINALI. È ASSOLUTAMENTE VIETATO GENERARE TESTI INVENTATI O LASCIARE IL LOGO ILLEGGIBILE. ASSOLUTAMENTE VIETATO generare cartellini del prezzo, etichette di cartone o store tags appesi.`;
             negativeBrandRule = `Do not invent fake text. You must write ONLY "${confirmedBrand}". Do not add extra seams. No price tags, no store tags, no cardboard labels hanging from the shoes.`;
        } else {
             brandRule = "ABSOLUTE HARD RULE 3: EXTREMELY STRICT PRESERVATION OF LOGOS, TEXTS AND ACCESSORIES. You MUST rigorously respect the correctness and coherence of ANY logos, texts, labels, or physical accessories present on the shoes in the original image. Clone them EXACTLY across all views. Do not blur them, do not scramble letters. STRICT RULE: NEVER generate hanging cardboard price tags or store labels.";
             negativeBrandRule = "Do not blur original logos. Do not invent fake text or scramble letters. Do not modify or alter original accessories. No price tags, no store tags, no cardboard labels hanging from the shoes.";
        }
    }

    let ageBracket = "20-35";
    let genderStr = "FEMALE";
    
    const lowerGender = confirmedGender?.toLowerCase() || '';
    if (lowerGender === 'bambino' || lowerGender.includes('bambino')) {
        genderStr = "BOY (CHILD)";
        ageBracket = "4-10";
    } else if (lowerGender === 'bambina' || lowerGender.includes('bambina')) {
        genderStr = "GIRL (CHILD)";
        ageBracket = "4-10";
    } else if (lowerGender === 'uomo' || lowerGender.includes('uomo')) {
        genderStr = "MALE";
        ageBracket = "20-30";
    } else {
        ageBracket = "20-30"; // Default for Donna or general female
    }

    const activeModelSetting = await (prisma as any).setting.findUnique({ where: { key: 'ACTIVE_GENERATION_MODEL' }});
    const generationModel = subcategoryObj.active_model || activeModelSetting?.value || 'gemini-3.1-flash-image-preview';

    let auditPrompts: string[] = [];
    let totalPromptsAttempted = 0;
    
    // LOG ESPLICITO LOOP GENERAZIONE
    console.log(`[GENERATION] Inizio loop richieste ${generationModel} per ${targetScenes.length} scene.`);

    const results = await Promise.allSettled(
        targetScenes.map(async (sceneText: string, idx: number) => {
            // Sfasa le chiamate di 4 secondi per spalmare il carico ed evitare 429 concurrent
            await new Promise(r => setTimeout(r, idx * 4000));
            
            totalPromptsAttempted++;
            const currentAngle = cameraAngles[idx % cameraAngles.length];
            const currentPose = shuffledPoses[idx % shuffledPoses.length];
            const currentLighting = shuffledLighting[idx % shuffledLighting.length];

            const modifiers = {
                gender: genderStr === "FEMALE" ? `stunningly beautiful high-end fashion female top model (${ageBracket} years old), flawless photorealistic skin, editorial high-fashion portrait, STRICTLY NO TEXT NO MAGAZINES` :
                        genderStr === "MALE" ? `handsome confident high-end fashion male model (${ageBracket} years old), flawless photorealistic skin, premium commercial portrait, STRICTLY NO TEXT NO MAGAZINES` :
                        genderStr === "BOY (CHILD)" ? `handsome young boy child model (${ageBracket} years old), photorealistic natural smile, gorgeous, STRICTLY NO TEXT` :
                        genderStr === "GIRL (CHILD)" ? `beautiful young girl child model (${ageBracket} years old), photorealistic natural smile, gorgeous, STRICTLY NO TEXT` : "stunningly attractive photorealistic high-end model, STRICTLY NO TEXT",
                bottomType: confirmedBottom || null,
                customBrand: confirmedBrand || null,
                cameraAngle: currentAngle,
                pose: isShoesCategory ? undefined : currentPose,
                lighting: isShoesCategory ? undefined : currentLighting
            };

            const variationSpecificPrompt = customVariationPrompts[idx];
            
            // Override with exact formula: base_prompt + variation_prompt + integrity_rules + negative_prompt
            // Using the builder but appending the explicit logic to the end or replacing entirely.
            // Since buildCreatorPrompt exists, we should probably append the explicit fields so we don't break JSON formatting for Gemini.
            
            let finalPrompt = buildCreatorPrompt(
                inspectorData,
                categoryFocusName,
                modifiers,
                masterPromptText,
                variationSpecificPrompt, // Usiamo la variazione al posto della sceneText
                negativeRulesText,
                brandRule,
                negativeBrandRule
            );
            
            // Forza l'integrazione di integrityRules
            finalPrompt += `\n\nPRODUCT INTEGRITY RULES:\n${integrityRules}`;
            
            auditPrompts.push(finalPrompt);
            const currentVarCode = targetVariationCodes[idx] || `var_${idx+1}`;

            console.log(`\n=============================================================`);
            console.log(`[GENERATION START] Variation Code: ${currentVarCode}`);
            console.log(`[PROMPT ASSEMBLY]:`);
            console.log(`BASE: ${masterPromptText}`);
            console.log(`VARIATION: ${variationSpecificPrompt}`);
            console.log(`INTEGRITY: ${integrityRules}`);
            console.log(`NEGATIVE: ${negativeRulesText}`);
            console.log(`=============================================================\n`);
            const timestampStart = Date.now();
            let generated;
            let success = false;
            let attempt = 0;

            while (!success && attempt < 3) {
                attempt++;
                try {
                    generated = await ai.models.generateContent({
                        model: generationModel,
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    {
                                        inlineData: {
                                           data: imageBuffer.toString("base64"),
                                           mimeType: "image/jpeg"
                                        }
                                    },
                                    { text: finalPrompt }
                                ]
                            }
                        ],
                        config: {
                            // @ts-ignore
                            imageConfig: {
                                aspectRatio: "3:4",
                                imageSize: "1K"
                            }
                        }
                    });

                    if (generated && generated.usageMetadata) {
                        totalJobCost += await logApiCost("frontend_generation", generationModel, generated.usageMetadata.promptTokenCount || 0, generated.usageMetadata.candidatesTokenCount || 0, null, 1);
                    }
                    success = true;
                } catch (err: any) {
                    console.error(`[GENERATION][Scene ${idx+1}] Tentativo ${attempt} fallito:`, err?.message || err);
                    if (attempt >= 3) {
                        throw new Error(`Modello API Fault dopo 3 tentativi: ${err?.message}`);
                    }
                    await new Promise(r => setTimeout(r, 6000)); // Attendi 6s al retry
                }
            }

            const timestampEnd = Date.now();
            console.log(`[GENERATION][Scene ${idx+1}] Risposta ricevuta in ${(timestampEnd - timestampStart) / 1000}s`);

            let base64Image = null;
            
            // VERIFICA PARSING GEMINI JSON
            if (generated && generated.candidates && generated.candidates.length > 0) {
                 const firstCandidate = generated.candidates[0];
                 const parts = firstCandidate.content?.parts;
                 if (parts && parts.length > 0) {
                     for (const part of parts) {
                         if (part.inlineData && part.inlineData.data) {
                             base64Image = part.inlineData.data;
                             console.log(`[GENERATION][Scene ${idx+1}] InlineData scovato! Dimensione base64: ${base64Image.length} bytes. MimeType: ${part.inlineData.mimeType}`);
                         }
                     }
                 } else {
                     console.error(`[GENERATION][Scene ${idx+1}] Niente 'parts' nell'oggetto content. Struttura candidate:`, JSON.stringify(firstCandidate).substring(0, 500));
                 }
            } else {
                 console.error(`[GENERATION][Scene ${idx+1}] Nessun 'candidate' ritornato da Gemini. Risposta intera:`, JSON.stringify(generated).substring(0, 500));
            }

            if (base64Image) {
                return base64Image;
            }
            throw new Error(`Generazione abortita. Nessun 'inlineData' utile nel payload di risposta per la Scena ${idx+1}.`);
        })
    );

    const generatedUrls = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);
        
    const failedPromises = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
    if (failedPromises.length > 0) {
        console.error(`[GENERATION] Ci sono stati ${failedPromises.length} fallimenti durante le risoluzioni parallele di Gemini.`);
        failedPromises.forEach((fp, i) => console.error(` - Error ${i+1}: ${fp.reason}`));
    }

    // UPDATE METADATA PRIMA DELLE CONDIZIONI HARD FAIL
    const existingJob = await (prisma as any).generationJob.findUnique({ select: { metadata: true }, where: { id: jobId }});
    let metaMerge = existingJob?.metadata ? (typeof existingJob.metadata === 'string' ? JSON.parse(existingJob.metadata) : existingJob.metadata) : {};

    metaMerge.finalPrompts = auditPrompts;
    metaMerge.generatedImages = generatedUrls;
    metaMerge.total_prompts_attempted = totalPromptsAttempted;
    metaMerge.total_images_generated = generatedUrls.length;
    metaMerge.total_images_saved = generatedUrls.length;

    // HARD FAIL CONTROL
    if (generatedUrls.length === 0) {
        console.error("[CRITICO][GENERATION] Tutte le immagini hanno fallito la generazione (0 URL ricevuti). Avvio Hard Fail.");
        metaMerge.creator_error_message = `Zero immagini generate. Errori estratti: ${failedPromises.map(f => f.reason).join(' | ')}`;
        
        await (prisma as any).generationJob.update({
            where: { id: jobId },
            data: { 
                 status: "errore",
                 metadata: metaMerge
            }
        });

        if (chatId) {
            const finalBotToken = process.env.TELEGRAM_BOT_TOKEN as string;
            const bot = new Telegraf(finalBotToken);
            await bot.telegram.sendMessage(chatId, "⚠️ Si è verificato un problema tecnico severo durante la pittura delle immagini sui server Google Gemini. I modelli potrebbero essere congestionati o aver applicato censure al prompt di stile.\n\n*Non ti sono stati temporaneamente scalati crediti.* Riprova tra 2 minuti.", { parse_mode: 'Markdown' }).catch(()=>null);
        }

        return NextResponse.json({ success: false, error: "Zero images generated", metadata: metaMerge }, { status: 400 });
    }

    // FASE 4: Segna completato e SCALA CREDITI
    let toDeduct = generatedUrls.length;
    let newSub = storeObj.subscription_credits;
    let newSupp = storeObj.supplementary_credits;

    if (toDeduct <= newSub) {
        newSub -= toDeduct;
    } else {
        const remainingToDeduct = toDeduct - newSub;
        newSub = 0;
        newSupp -= remainingToDeduct;
    }

    // Previeni db negativi in casi strani
    if (newSupp < 0) newSupp = 0;

    await (prisma as any).store.update({
        where: { id: storeId },
        data: {
             subscription_credits: newSub,
             supplementary_credits: newSupp
        }
    });

    metaMerge.telegram_delivered = false; // Sarà flaggato true solo quando Telegram restituirà OK
    
    await (prisma as any).generationJob.update({
        where: { id: jobId },
        data: { 
             status: "completato",
             total_cost_eur: totalJobCost,
             metadata: metaMerge
        }
    });

    // FASE 5: Pulizia
    const storeJobs = await (prisma.generationJob as any).findMany({
        where: { store_id: storeId },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
    });

    if (storeJobs.length > 50) {
        const jobsToDelete = storeJobs.slice(50).map((j: any) => j.id);
        await (prisma.generationJob as any).deleteMany({
            where: { id: { in: jobsToDelete } }
        });
    }

    // FASE 6: Inoltra le immagini su Telegram
    if (chatId) {
       const finalBotToken = process.env.TELEGRAM_BOT_TOKEN as string;
       const bot = new Telegraf(finalBotToken);
       
       const mediaGroup = generatedUrls.map((urlStr, i) => {
           if (urlStr.startsWith("http")) return { type: 'photo' as const, media: urlStr };
           const cleanB64 = urlStr.replace(/^data:image\/\w+;base64,/, "");
           const { Input } = require('telegraf');
           return { type: 'photo' as const, media: Input.fromBuffer(Buffer.from(cleanB64, 'base64'), `image_${i}.jpg`) };
       });
       
        const totalRimasti = newSub + newSupp;
        let warningStrHTML = ``;
        if (totalRimasti <= 15 && totalRimasti > 0) {
            warningStrHTML = `\n\n⚠️ <b>ATTENZIONE</b>: Ti restano solo ${totalRimasti} immagini. <a href="https://supernexus.ai/ricarica">Acquista Immagini Extra</a> per ricaricare subito.`;
        } else if (totalRimasti === 0) {
            warningStrHTML = `\n\n⚠️ <b>Immagini Esaurite</b>: Hai esaurito le immagini a tua disposizione. Affrettati a <a href="https://supernexus.ai/ricarica">ricaricare il piano</a> per continuare a vendere!`;
        }
 
        try {
            const safeCategory = subcategoryObj.name ? subcategoryObj.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Categoria Sconosciuta';
            const safeBottom = confirmedBottom ? confirmedBottom.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Dato non richiesto';
            
            await bot.telegram.sendMessage(chatId, `🎉 <b>PROCESSO COMPLETATO!</b>\n\n- Categoria: ${safeCategory}\n- Taglieria: ${safeBottom}\n- Immagini Rimanenti Mensili: <b>${totalRimasti}</b>${warningStrHTML}\n\nEcco le magiche scene esclusive create per te:`, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } } as any);
            if (mediaGroup.length > 0) {
                await bot.telegram.sendMediaGroup(chatId, mediaGroup);
                
                // VERIFICA SUPERATA: Il sistema certifica l'avvenuta consegna salvandola in audit
                metaMerge.telegram_delivered = true;
                await (prisma as any).generationJob.update({
                     where: { id: jobId },
                     data: { metadata: metaMerge }
                });
            }
        } catch (botErr) {
            console.error("Errore fatale invio Telegram:", botErr);
            await bot.telegram.sendMessage(chatId, "⚠️ Ops... L'intelligenza Artificiale ha creato le immagini ma i file erano troppo pesanti per essere processati su Telegram! Riprova con un numero minore.").catch(()=>null);
        }
    }

    return NextResponse.json({ success: true, count: generatedUrls.length });
  } catch (error: any) {
    console.error("Worker Background Errore:", error);
    try {
        let errorJobId = gJobId;
        let errorChatId = gChatId;
        let errorStoreId = gStoreId;
        
        try {
            const bodyText = await req.text().catch(() => "");
            if (bodyText && !errorJobId) {
                const b = JSON.parse(bodyText);
                errorJobId = b.jobId; errorChatId = b.chatId; errorStoreId = b.storeId;
            }
        } catch(e) {}
        
        if (errorJobId) {
             await (prisma as any).generationJob.update({
                  where: { id: errorJobId },
                  data: { status: "errore" }
             });
        }
        
        if (errorChatId) {
             let botToken = process.env.TELEGRAM_BOT_TOKEN;
             if (errorStoreId) {
                 const st = await (prisma as any).store.findUnique({ where: { id: errorStoreId } });
                 if (st?.telegram_bot_token) botToken = st.telegram_bot_token;
             }
             if (botToken) {
                 const { Telegraf } = require('telegraf');
                 const errorBot = new Telegraf(botToken);
                 await errorBot.telegram.sendMessage(errorChatId, `❌ Errore generazione IA:\n\n${error?.message || "Errore sconosciuto"}\n\nTornerò operativo a breve!`).catch(()=>{});
             }
        }
    } catch (e) {
        console.error("Fatal in error handler:", e);
    }
    
    return NextResponse.json({ error: error?.message || "Internal" }, { status: 500 });
  }
}
