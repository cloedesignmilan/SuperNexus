import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";
import { uploadImageToSupabase } from "@/lib/supabaseStorage";

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
    const analysisPrompt = `Sei un sarto e stilista. Il capo in foto appartiene a una specifica categoria selezionata dall'utente. ${contextStr}
Restituisci SOLO un JSON con queste chiavi: "type" (tipo esatto), "color" (colore principale e pattern), "description" (UNA DESCRIZIONE MANIACALE, PRECISA E ASSOLUTA. Devi descrivere forma, taglio esatto, proporzioni, materiali, cuciture, lacci, suole, colletti, bottoni, tasche e ogni singolo micro-dettaglio. Questa descrizione sarà usata come UNICA SORGENTE DI VERITÀ per clonare l'oggetto identico al 100%. Se alteri o ometti qualcosa, il risultato fallirà. Sii letalmente preciso nel preservare la fedeltà all'originale). Niente altro che il JSON.`;

    const visionResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [
            { text: analysisPrompt }, 
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/jpeg" } }
        ]}
      ]
    });

    let garmentDetails;
    try {
        const cleaned = (visionResult.text || "{}").replace(/```json/g, "").replace(/```/g, "");
        garmentDetails = JSON.parse(cleaned);
    } catch {
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
             targetScenes = [
                 "Still life product photography, pair of shoes, angled 3/4 front view, pure white floor and background",
                 "Still life product photography, pair of shoes, straight top-down flat lay view, pure white background",
                 "Still life product photography, pair of shoes, back heel view showing the rear details, pure white background",
                 "Still life product photography, single shoe, side profile view, pure white background"
             ];
             // imgCount è forzato a 4 dal webhook
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

    let brandRule = "ABSOLUTE HARD RULE 3: DO NOT generate any text, brand logos, tags, or watermarks.";
    let negativeBrandRule = "No brand logos, no text in the image.";

    if (isShoesCategory) {
        cameraAngles = [
            "Low angle full body shot, incredibly sharp focus on the shoes", 
            "Macro close-up shot focused specifically on the footwear and ankles, stylish pose with neutral clothing", 
            "Full body shot, head to toe completely visible, dynamic walking motion highlighting the shoes"
        ];
        if (confirmedBrand) {
             brandRule = `ABSOLUTE HARD RULE 3: IL CLIENTE HA ESPLICITAMENTE CONFERMATO CHE IL TESTO/LOGO SULLA SCARPA È: "${confirmedBrand}". DEVI INTAGLIARE O STAMPARE ESATTAMENTE LA PAROLA "${confirmedBrand}" SULLA TARGHETTA O SCARPA E RISPETTARE STRICTLY LE CUCITURE ORIGINALI. È ASSOLUTAMENTE VIETATO GENERARE TESTI INVENTATI O LASCIARE IL LOGO ILLEGGIBILE.`;
             negativeBrandRule = `Do not invent fake text. You must write ONLY "${confirmedBrand}". Do not add extra seams.`;
        } else {
             brandRule = "ABSOLUTE HARD RULE 3: CLONE ALL ORIGINAL DETAILS EXACTLY as they appear in the reference image, INCLUDING ANY BRAND LOGOS, TEXT, GLITTER, ACCESSORIES, AND TAGS on the shoes. Do not invent new logos, do not blur them.";
             negativeBrandRule = "Do not blur original logos. Do not invent fake text.";
        }
    }

    let ageBracket = "20-35";
    if (confirmedCategory === 'Sposi') ageBracket = "25-35";
    else if (confirmedCategory === 'Festa 18°') ageBracket = "17-19";
    else if (confirmedCategory === 'Business & tempo libero') ageBracket = "28-45";
    else if (confirmedCategory === 'Cerimonia e festa') ageBracket = "25-45";
    else if (confirmedCategory === 'Streetwear') ageBracket = "18-30";
    else if (confirmedCategory === 'Sport') ageBracket = "20-40";
    else if (confirmedCategory === 'Bambini') ageBracket = "4-12";
    else if (confirmedCategory === 'Rivista') ageBracket = "20-35";

    const results = await Promise.allSettled(
        targetScenes.map(async (sceneText: string, index: number) => {
            const currentAngle = cameraAngles[index % cameraAngles.length];

            let finalPrompt = "";
            
            if (confirmedEnvironment === 'studio_calzature') {
                finalPrompt = `[MASTER DIRECTIVES]
${masterPromptText}

[SUBJECT AND SCENE]
${sceneText}

[CRITICAL - VIRTUAL TRY ON INSTRUCTIONS - MUST OBEY]
YOU ARE RUNNING A VIRTUAL TRY-ON ALGORITHM FOR STILL LIFE PRODUCT PHOTOGRAPHY. You must IDENTICALLY CLONE the footwear item from the attached reference image.
CRITICAL RULE: THIS IS STRICTLY STILL-LIFE PRODUCT PHOTOGRAPHY. DO NOT GENERATE ANY HUMANS, ANY LEGS, ANY FEET, OR ANY MANNEQUINS. GENERATE ONLY THE SHOES THEMSELVES ON A PURE WHITE STUDIO BACKGROUND.
CLOTHING COLOR & PATTERN: ${garmentDetails.color}
CLOTHING DESCRIPTION: ${garmentDetails.description}

ABSOLUTE HARD RULE 1 (PRODUCT SHAPE & CUT LOCK): The structure, shape, cut, proportions, color, seams, laces, soles, heels, and materials of the shoe MUST BE PRESERVED AT 100%. DO NOT CHANGE, DO NOT INVENT, DO NOT ALTER ANY DETAIL. The original image is the ONLY absolute ground truth for the product.
${brandRule}

[NEGATIVE RULES]
No humans, no feet, no legs. No distortions of the shoe shape. ${negativeBrandRule}`;
            } else {
                finalPrompt = `[MASTER DIRECTIVES]
${masterPromptText}

[SUBJECT AND SCENE]
${sceneText}
The subject MUST clearly look to be between ${ageBracket} years old.
CAMERA ANGLE: ${currentAngle}.

[CRITICAL - VIRTUAL TRY ON INSTRUCTIONS - MUST OBEY]
${isMale 
   ? 'The subject is MALE. CRITICAL RULE: He MUST be wearing a suitable base layer (like a dress shirt) underneath his outerwear. NO BARE-CHESTED.' 
   : 'The subject is FEMALE.'}
YOU ARE RUNNING A VIRTUAL TRY-ON ALGORITHM. You must IDENTICALLY CLONE the clothing item from the attached reference image onto the human model.
CLOTHING COLOR & PATTERN: ${garmentDetails.color}
CLOTHING DESCRIPTION: ${garmentDetails.description}
${confirmedBottom ? 'BOTTOM CLOTHING TYPE: ' + confirmedBottom.toUpperCase() : ''}

ABSOLUTE HARD RULE 1 (ACCESSORY LOCK): IF the reference image contains a specific tie (cravatta) or bow tie (papillon), you MUST render it with the EXACT same pattern, color, and knot. If the reference is a long tie, DO NOT generate a bow tie. If it's a bow tie, DO NOT generate a long tie!
ABSOLUTE HARD RULE 2 (GARMENT SHAPE & CUT LOCK): The structure, cut, shape, proportions, color, seams, lapels, buttons, and fit of the original garment MUST BE PRESERVED AT 100%. DO NOT CHANGE, DO NOT INVENT, DO NOT ALTER ANY DETAIL. The original image is the ONLY absolute ground truth for the product.
${brandRule}

[NEGATIVE RULES]
${negativeRulesText}
${negativeBrandRule}`;
            }
            
            const generated = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
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
                const uniqueFilename = `garment_gen_${jobId}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const publicUrl = await uploadImageToSupabase(base64Image, uniqueFilename);
                const finalUrl = publicUrl || "uploaded_storage_link";

                await prisma.jobImage.create({
                    data: { job_id: jobId, image_url: finalUrl, scene_type: sceneText.substring(0, 50) }
                });
                return finalUrl; 
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
       const finalBotToken = storeObj?.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN as string;
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
