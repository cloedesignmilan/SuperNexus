import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";
import { buildCreatorPrompt } from "@/lib/promptBuilder";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

  let gJobId = null, gChatId = null, gStoreId = null;

  try {
    const jsonBody = await req.json();
    gJobId = jsonBody.jobId;
    gChatId = jsonBody.chatId;
    gStoreId = jsonBody.storeId;
    
    const { jobId, fileUrl, chatId, storeId, confirmedCategory, confirmedBottom, confirmedGender, confirmedScene, confirmedEnvironment, confirmedBrand, imgCount } = jsonBody;

    if (!jobId || !fileUrl) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
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
- IN 'preservation_constraints.critical_details': Scrivi IN INGLESE. Usa MASSIMO 80-120 parole. Nessuna introduzione inutile, includi SOLO dettagli concreti, clonabili e visivi del capo, niente "This is an image of...".

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
    "closure_type": "zip, button, lace-up, slip-on, etc or null"
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

    // FASE 2: Carica Prompt Master e Scene (Nuova Architettura Modulare)
    const storeObj = await (prisma as any).store.findUnique({ where: { id: storeId } });

    // --- CARICAMENTO ADMIN MODULAR PROMPT ---
    let adminConfig: any = null;
    try {
        const settingsBlob = await (prisma as any).setting.findMany({
            where: { key: { in: ['PROMPT_CONFIG_SETTINGS', 'PROMPT_CONFIG_MASTER', 'PROMPT_CONFIG_NEGATIVES', 'PROMPT_CONFIG_SCENARIOS', 'PROMPT_CONFIG_CATEGORIES'] } }
        });
        adminConfig = {};
        for (const s of settingsBlob) {
            adminConfig[s.key] = JSON.parse(s.value);
        }
    } catch (e) {
        console.error("Failed to load Modular Prompt UI config, switching to DB legacy.", e);
    }

    const useModularBuilder = adminConfig?.PROMPT_CONFIG_SETTINGS?.use_modular_builder === true;

    let categoryObj = null;
    try {
        categoryObj = await (prisma as any).category.findUnique({
             where: { id: confirmedCategory },
             include: { prompt_master: true }
        });
    } catch(e) {
        // Ignorato. Se l'ID non è un UUID (caso MODULAR BUILDER in cui passa un nome testo es: 'Donna'), Prisma fallisce giustamente. Il fallback modulare bypasserà il DB interamente.
    }
        
    if (!useModularBuilder && (!categoryObj || !categoryObj.prompt_master)) {
         console.error(`[CRITICO] Categoria Master non trovata nel DB: ${confirmedCategory}`);
         throw new Error(`Architettura Prompt Master mancante per l'ID: ${confirmedCategory}`);
    }

    const masterPromptText = (useModularBuilder && adminConfig?.PROMPT_CONFIG_MASTER?.is_active) 
        ? adminConfig.PROMPT_CONFIG_MASTER.prompt_text 
        : (categoryObj?.prompt_master?.prompt_text || 'Modella fotorealistica e professionale.');

    const negativeRulesText = (useModularBuilder && adminConfig?.PROMPT_CONFIG_NEGATIVES?.is_active)
        ? adminConfig.PROMPT_CONFIG_NEGATIVES.global_rules
        : (categoryObj?.prompt_master?.negative_rules || 'No modifiche al capo, no tagli');

    let categoryFocusName = categoryObj?.name || confirmedCategory || 'Outfit';
    if (useModularBuilder && adminConfig?.PROMPT_CONFIG_CATEGORIES) {
        const catOverride = adminConfig.PROMPT_CONFIG_CATEGORIES.find((c: any) => c.category_name === categoryFocusName && c.is_active);
        if (catOverride) {
            categoryFocusName = catOverride.prompt_text; // Iniettiamo tutto l'override testuale al posto del nome
        }
    }

    let targetScenes: any[] = [];
    const count = imgCount ? parseInt(imgCount) : 3;

    if (useModularBuilder && adminConfig?.PROMPT_CONFIG_SCENARIOS) {
         // Cerca lo scenario nei moduli Admin (es 'ambientata', 'studio')
         const sc = adminConfig.PROMPT_CONFIG_SCENARIOS.find((s: any) => s.id === confirmedEnvironment && s.is_active);
         if (sc) {
              targetScenes = [];
              for(let i=0; i<count; i++) {
                  targetScenes.push(sc.scene_text); // For now repeat same scene text, camera angles handle variety
              }
         }
    }

    if (targetScenes.length === 0 && confirmedScene && confirmedScene !== 'random') {
        const specificScene = await (prisma as any).scene.findUnique({
             where: { id: confirmedScene }
        });
        if (specificScene) {
            targetScenes = Array(count).fill(specificScene.scene_text);
        }
    }

    if (targetScenes.length === 0) {
        if (confirmedEnvironment === 'studio_calzature') {
             // 4 Specific angles for strictly product shoes
             const adminCustomPrompts = categoryObj.prompt_master.studio_prompts;
             if (adminCustomPrompts && adminCustomPrompts.trim() !== '') {
                 const lines = adminCustomPrompts.split('\n').map((l: string) => l.trim()).filter((l: string) => l !== '');
                 if (lines.length > 0) {
                     targetScenes = lines.slice(0, count);
                     // Riempie in caso l'admin ne abbia scritte di meno
                     while (targetScenes.length < count) {
                         targetScenes.push(targetScenes[targetScenes.length - 1]);
                     }
                 }
             }

             if (targetScenes.length === 0) {
                 targetScenes = [
                     "Still life product photography, pair of shoes, angled 3/4 front view, symmetrical placement, pure white studio background (#FFFFFF)",
                     "Still life product photography, pair of shoes, straight top-down flat lay, perfectly aligned, pure white background (#FFFFFF)",
                     "Still life product photography, pair of shoes, back heel view, centered composition, pure white background (#FFFFFF)",
                     "Still life product photography, single shoe, side profile view, centered, pure white background (#FFFFFF)"
                 ];
             }
        } else if (confirmedEnvironment === 'studio') {
            // Hardcode di scene neutre professionali per lo studio
             const studioScenes = [
                 "Pure bright white cyclorama studio background, professional high-end fashion lighting.",
                 "Soft minimalist light-grey seamless paper background, editorial studio flash.",
                 "Elegant charcoal dark-grey studio background with dramatic chiaroscuro cinematic lighting."
             ];
             targetScenes = [];
             for(let i=0; i<count; i++) {
                 targetScenes.push(studioScenes[i % studioScenes.length]);
             }
        } else {
            // Fallback Random Scena da DB (Ambientata)
            const allScenes = await (prisma as any).scene.findMany({
                 where: { category_id: confirmedCategory, is_active: true }
            });
            if (allScenes.length === 0) {
                allScenes.push({ scene_text: "Walking in the city", title: "Default" } as any);
            }
            
            const shuffledScenes = allScenes.sort(() => Math.random() - 0.5);
            targetScenes = shuffledScenes.slice(0, count).map((s: any) => s.scene_text);
            // Se chiedono 3 generate ma ci sono solo 2 scene, ripetiamo
            while (targetScenes.length < count) {
                 targetScenes.push(targetScenes[targetScenes.length - 1]);
            }
        }
    }
    
    // PERSONA LOCK GENERATOR (Coerenza facciale del Batch)
    const isMale = confirmedGender === 'uomo' || confirmedGender === 'Uomo';
    
    console.log(`[Persona Lock UGC] Campagna: ${confirmedCategory} | Bottom: ${confirmedBottom} | Genere: ${isMale ? 'UOMO' : 'DONNA'}`);

    let cameraAngles = [
        "Full body shot, head to toe completely visible", 
        "Mid shot, framed from the waist up", 
        "Slight close-up portrait, focusing on the upper chest and face"
    ];

    const isShoesCategory = categoryFocusName.toLowerCase().includes('scarpe') || categoryFocusName.toLowerCase().includes('calzature');

    let brandRule = "ABSOLUTE HARD RULE 3: DO NOT generate any text, brand logos, price tags, store tags, cardboard labels, hanging tags, or watermarks.";
    let negativeBrandRule = "No brand logos, no text in the image, no price tags, no store tags, no cardboard tags, no hanging labels attached to the garments.";

    if (isShoesCategory) {
        cameraAngles = [
            "Low angle full body shot, incredibly sharp focus on the shoes", 
            "Macro close-up shot focused specifically on the footwear and ankles, stylish pose with neutral clothing", 
            "Full body shot, head to toe completely visible, dynamic walking motion highlighting the shoes"
        ];
        if (confirmedBrand) {
             brandRule = `ABSOLUTE HARD RULE 3: IL CLIENTE HA ESPLICITAMENTE CONFERMATO CHE IL TESTO/LOGO SULLA SCARPA È: "${confirmedBrand}". DEVI INTAGLIARE O STAMPARE ESATTAMENTE LA PAROLA "${confirmedBrand}" SULLA TARGHETTA O SCARPA E RISPETTARE STRICTLY LE CUCITURE ORIGINALI. È ASSOLUTAMENTE VIETATO GENERARE TESTI INVENTATI O LASCIARE IL LOGO ILLEGGIBILE. ASSOLUTAMENTE VIETATO generare cartellini del prezzo, etichette di cartone o store tags appesi.`;
             negativeBrandRule = `Do not invent fake text. You must write ONLY "${confirmedBrand}". Do not add extra seams. No price tags, no store tags, no cardboard labels hanging from the shoes.`;
        } else {
             brandRule = "ABSOLUTE HARD RULE 3: CLONE ALL ORIGINAL DETAILS EXACTLY as they appear in the reference image, INCLUDING ANY BRAND LOGOS, TEXT, GLITTER, ACCESSORIES, AND FABRIC TAGS on the shoes. Do not invent new logos, do not blur them. STRICT RULE: NEVER generate hanging cardboard price tags or store labels attached to the product.";
             negativeBrandRule = "Do not blur original logos. Do not invent fake text. No price tags, no store tags, no cardboard labels hanging from the shoes.";
        }
    }

    let ageBracket = categoryObj.age_range || "20-35";
    let genderStr = "FEMALE";
    
    const lowerGender = confirmedGender?.toLowerCase() || '';
    if (lowerGender === 'bambino') {
        genderStr = "BOY (CHILD)";
        ageBracket = categoryObj.child_age_range || "4-12";
    } else if (lowerGender === 'bambina') {
        genderStr = "GIRL (CHILD)";
        ageBracket = categoryObj.child_age_range || "4-12";
    } else if (lowerGender === 'uomo') {
        genderStr = "MALE";
    }

    let auditPrompts: string[] = [];
    let totalPromptsAttempted = 0;
    
    // LOG ESPLICITO LOOP GENERAZIONE
    console.log(`[GENERATION] Inizio loop richieste Gemini 3.1 Flash per ${targetScenes.length} scene.`);

    const results = await Promise.allSettled(
        targetScenes.map(async (sceneText: string, idx: number) => {
            totalPromptsAttempted++;
            const currentAngle = cameraAngles[idx % cameraAngles.length];

            const modifiers = {
                gender: genderStr === "FEMALE" ? "female (20-35 years old)" :
                        genderStr === "MALE" ? "male (20-35 years old)" :
                        genderStr === "BOY (CHILD)" ? "young boy (4-12 years old)" :
                        genderStr === "GIRL (CHILD)" ? "young girl (4-12 years old)" : "attractive model",
                bottomType: confirmedBottom || null,
                customBrand: confirmedBrand || null,
                cameraAngle: currentAngle
            };

            const finalPrompt = buildCreatorPrompt(
                inspectorData,
                categoryFocusName,
                modifiers,
                masterPromptText,
                sceneText,
                negativeRulesText,
                brandRule,
                negativeBrandRule
            );
            
            auditPrompts.push(finalPrompt);

            console.log(`[GENERATION][Scene ${idx+1}] Invio prompt a Gemini... Prompt preview: ${finalPrompt.slice(0, 100)}...`);
            const timestampStart = Date.now();
            let generated;

            try {
                generated = await ai.models.generateContent({
                    model: 'gemini-3.1-flash-image-preview',
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
            } catch (err: any) {
                console.error(`[GENERATION][Scene ${idx+1}] Eccezione diretta durante la chiamata al modello:`, err?.message || err);
                throw new Error(`Modello API Fault: ${err?.message}`);
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

    if (useModularBuilder) {
        metaMerge.adminConfigSnapshot = adminConfig;
    }

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

    metaMerge.creator_error_message = null; // Nessun errore fatale (Hard Fail scongiurato)

    await (prisma as any).generationJob.update({
        where: { id: jobId },
        data: { 
             status: "completato",
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
           return { type: 'photo' as const, media: { source: Buffer.from(cleanB64, 'base64'), filename: `image_${i}.jpg` } };
       });
       
        const totalRimasti = newSub + newSupp;
        let warningStrHTML = ``;
        if (totalRimasti <= 15 && totalRimasti > 0) {
            warningStrHTML = `\n\n⚠️ <b>ATTENZIONE</b>: Ti restano solo ${totalRimasti} generazioni. <a href="https://supernexus.ai/ricarica">Acquista Pacchetto</a> per ricaricare subito.`;
        } else if (totalRimasti === 0) {
            warningStrHTML = `\n\n⚠️ <b>Crediti Esauriti</b>: Hai raggiunto zero generazioni. Affrettati a <a href="https://supernexus.ai/ricarica">ricaricare il pacchetto</a> per continuare a vendere!`;
        }
 
        try {
            const safeCategory = (categoryObj as any).name ? (categoryObj as any).name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Categoria Sconosciuta';
            const safeBottom = confirmedBottom ? confirmedBottom.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Dato non richiesto';
            
            await bot.telegram.sendMessage(chatId, `🎉 <b>PROCESSO COMPLETATO!</b>\n\n- Categoria: ${safeCategory}\n- Taglieria: ${safeBottom}\n- Crediti Rimanenti: <b>${totalRimasti}</b>${warningStrHTML}\n\nEcco le magiche scene esclusive create per te:`, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } } as any);
            if (mediaGroup.length > 0) {
                await bot.telegram.sendMediaGroup(chatId, mediaGroup);
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
