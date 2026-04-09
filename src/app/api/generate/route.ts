import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

  try {
    const { jobId, fileUrl, chatId, storeId, confirmedCategory, confirmedBottom, confirmedGender, confirmedScene, confirmedEnvironment, confirmedBrand, imgCount } = await req.json();

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
{
  "technical_validation": {
    "is_usable": true,
    "lighting": "good" | "acceptable" | "poor",
    "sharpness": "good" | "acceptable" | "poor",
    "framing": "full" | "partial" | "unclear",
    "issues": ["too_dark", "blurred", "cluttered_background"] // o array vuoto
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
    "critical_details": "MUST BE IN ENGLISH. Provide a HYPER-REALISTIC, MANIACAL, 1:1 CLONING BLUEPRINT. Describe exact shape, silhouette, proportions.",
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
    "recommended_categories": ["Donna", "Uomo", "T-Shirt", "Cerimonia", "Feste & 18°", "Calzature", "Vendita Online"], // Scegli solo tra questi esatti valori
    "disabled_categories": ["Donna", "Uomo", "T-Shirt", "Cerimonia", "Feste & 18°", "Calzature", "Vendita Online"], // Scegli solo tra questi esatti valori
    "should_ask_question": false,
    "suggested_question": "stringa in italiano o null"
  },
  "legacy_creator_data": {
    "color": "MUST BE IN ENGLISH. Describe color and pattern exactly.",
    "type": "exact type string in English",
    "short_description": "MUST BE IN ENGLISH. Short, stable and concise description max 1 line for legacy generative pipeline."
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

    let inspectorData;
    let garmentDetails;
    try {
        const cleaned = (visionResult.text || "{}").replace(/```json/g, "").replace(/```/g, "").trim();
        inspectorData = JSON.parse(cleaned);
        
        console.log("[DEBUG] Inspector JSON Strutturato:", JSON.stringify(inspectorData, null, 2));

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

    const categoryObj = await (prisma as any).category.findUnique({
         where: { id: confirmedCategory },
         include: { prompt_master: true }
    });
        
    if (!categoryObj || !categoryObj.prompt_master) {
         console.error(`[CRITICO] Categoria Master non trovata nel DB: ${confirmedCategory}`);
         throw new Error(`Architettura Prompt Master mancante per l'ID: ${confirmedCategory}`);
    }

    const masterPromptText = categoryObj.prompt_master.prompt_text || 'Modella fotorealistica e professionale.';
    const negativeRulesText = categoryObj.prompt_master.negative_rules || 'No modifiche al capo, no tagli';

    let targetScenes: any[] = [];
    const count = imgCount ? parseInt(imgCount) : 3;

    if (confirmedScene && confirmedScene !== 'random') {
        const specificScene = await (prisma as any).scene.findUnique({
             where: { id: confirmedScene }
        });
        if (specificScene) {
            // Se scelgo foto singola scena, magari clono l'array per le 3 angolature
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

    const isShoesCategory = categoryObj.name.toLowerCase().includes('scarpe') || categoryObj.name.toLowerCase().includes('calzature');

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

    const results = await Promise.allSettled(
        targetScenes.map(async (sceneText: string, index: number) => {
            const currentAngle = cameraAngles[index % cameraAngles.length];

            let finalPrompt = "";
            
            if (isShoesCategory) {
                if (confirmedEnvironment === 'studio' || confirmedEnvironment === 'studio_calzature') {
                    finalPrompt = `${masterPromptText}. ${sceneText}. The reference footwear color/pattern is ${garmentDetails.color} and can be described as: ${garmentDetails.description}. This is strictly still-life product photography. GENERATE ONLY the footwear item on a pure white studio background. You must IDENTICALLY CLONE the footwear from the attached reference image (preserving shape, seams, cut, proportions, details). ${brandRule} No humans, no legs, no feet. ${negativeBrandRule}`;
                } else {
                    finalPrompt = `${masterPromptText}. ${sceneText}. Camera angle: ${currentAngle}. The reference footwear color/pattern is ${garmentDetails.color} and can be described as: ${garmentDetails.description}. The subject is wearing EXACTLY the footwear item shown in the attached reference image. You must IDENTICALLY CLONE the footwear (preserving exact shape, seams, cut, proportions). ${brandRule} ${negativeRulesText} ${negativeBrandRule}`;
                }
            } else {
                finalPrompt = `${masterPromptText}. ${sceneText}. Camera angle: ${currentAngle}. The reference garment color/pattern is ${garmentDetails.color} and can be described as: ${garmentDetails.description}. The subject is an attractive ${ageBracket} year old ${genderStr} model. The subject is wearing EXACTLY the clothing item shown in the attached reference image. ${confirmedBottom ? 'For the bottom part, the subject is wearing a ' + confirmedBottom + '.' : ''} You must IDENTICALLY CLONE the garment (preserving exact shape, seams, lapels, buttons, cut, proportions). ${brandRule} ${negativeRulesText} ${negativeBrandRule}`;
            }

            // Remove double spaces and newlines
            finalPrompt = finalPrompt.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();

            const generated = await ai.models.generateContent({
                model: 'gemini-3.1-flash-image-preview',
                contents: [
                    {
                        inlineData: {
                           data: imageBuffer.toString("base64"),
                           mimeType: "image/jpeg"
                        }
                    },
                    finalPrompt
                ],
                config: {
                    // @ts-ignore
                    imageConfig: {
                        aspectRatio: "3:4",
                        imageSize: "1K"
                    }
                }
            });

            let base64Image = null;
            if (generated.candidates?.[0]?.content?.parts) {
                 for (const part of generated.candidates[0].content.parts) {
                     if (part.inlineData) {
                         base64Image = part.inlineData.data;
                     }
                 }
            }

            if (base64Image) {
                // Passaggio diretto dell'immagine in Base64 senza salvataggio persistente su Storage/Database!
                return base64Image; 
            }
            throw new Error("No image inlineData in candidates");
        })
    );

    const generatedUrls = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);

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

    await (prisma as any).generationJob.update({
        where: { id: jobId },
        data: { status: "completato" }
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
       
       const mediaGroup = generatedUrls.map((urlStr) => {
           if (urlStr.startsWith("http")) return { type: 'photo' as const, media: urlStr };
           return { type: 'photo' as const, media: { source: Buffer.from(urlStr, 'base64') } };
       });
       
        const totalRimasti = newSub + newSupp;
        let warningStrHTML = ``;
        if (totalRimasti <= 15 && totalRimasti > 0) {
            warningStrHTML = `\n\n⚠️ <b>ATTENZIONE</b>: Ti restano solo ${totalRimasti} generazioni. <a href="https://supernexus.ai/ricarica">Acquista Pacchetto</a> per ricaricare subito.`;
        } else if (totalRimasti === 0) {
            warningStrHTML = `\n\n⚠️ <b>Crediti Esauriti</b>: Hai raggiunto zero generazioni. Affrettati a <a href="https://supernexus.ai/ricarica">ricaricare il pacchetto</a> per continuare a vendere!`;
        }
 
        try {
            await bot.telegram.sendMessage(chatId, `🎉 <b>PROCESSO COMPLETATO!</b>\n\n- Categoria: ${(categoryObj as any).name}\n- Taglieria: ${confirmedBottom || 'Dato non richiesto'}\n- Crediti Rimanenti: <b>${totalRimasti}</b>${warningStrHTML}\n\nEcco le magiche scene esclusive create per te:`, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } } as any);
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
        const { jobId, chatId, storeId } = await req.clone().json().catch(() => ({ jobId: null, chatId: null, storeId: null }));
        if (jobId) {
             await (prisma as any).generationJob.update({
                  where: { id: jobId },
                  data: { status: "errore" }
             });
        }
        
        if (chatId) {
             let botToken = process.env.TELEGRAM_BOT_TOKEN;
             if (storeId) {
                 const st = await (prisma as any).store.findUnique({ where: { id: storeId } });
                 if (st?.telegram_bot_token) botToken = st.telegram_bot_token;
             }
             if (botToken) {
                 const { Telegraf } = require('telegraf');
                 const errorBot = new Telegraf(botToken);
                 await errorBot.telegram.sendMessage(chatId, `❌ **Errore generazione IA:**\n\n\`${error?.message || "Errore sconosciuto"}\`\n\nTornerò operativo a breve!`, { parse_mode: 'Markdown' }).catch(()=>{});
             }
        }
    } catch (e) {}
    
    return NextResponse.json({ error: error?.message || "Internal" }, { status: 500 });
  }
}
