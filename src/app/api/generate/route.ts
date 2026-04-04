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
    const { jobId, fileUrl, chatId, storeId, confirmedCategory, confirmedBottom, confirmedGender, imgCount } = await req.json();

    if (!jobId || !fileUrl) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    // FASE 1: Estrazione Dettagli (Vision)
    const imageResp = await fetch(fileUrl);
    const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
    
    // Passiamo il contesto già deciso all'IA affinché faccia focus sui dettagli
    const contextStr = confirmedBottom ? `(Nota: il cliente ha confermato che la parte inferiore è un/una ${confirmedBottom}).` : "";
    const analysisPrompt = `Sei un sarto e stilista. Il capo in foto appartiene alla categoria "${confirmedCategory}". ${contextStr}
Restituisci SOLO un JSON con queste chiavi: "type" (tipo esatto), "color" (colore principale e pattern), "description" (una lunghissima descrizione maniacale e minuziosa che possa spiegare a un'altra intelligenza artificiale come ridisegnare questo capo identico al 100%, cucitura per cucitura, inclusi colletti, fit, lunghezza, tessuto, maniche). Niente altro che il JSON.`;

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

    // FASE 2: Carica il Template Selezionato
    const storeObj = await (prisma as any).store.findUnique({ where: { id: storeId } });

    let template = await prisma.promptTemplate.findFirst({
         where: { name: confirmedCategory }
    });
        
    if (!template) {
         console.error(`[CRITICO] Categoria non trovata nel DB: ${confirmedCategory}`);
         throw new Error(`Categoria '${confirmedCategory}' non trovata nel Database. Assicurati di non usare vecchi menu a tendina su Telegram.`);
    }

    const scenes = template?.scenes ? JSON.parse(template.scenes) : ["Walking in the city"];

    // FASE 3: Generazione tramite Imagen 3 
    // Meschio e limito in base alla scelta (default 3)
    const count = imgCount ? parseInt(imgCount) : 3;
    const shuffledScenes = scenes.sort(() => Math.random() - 0.5);
    const targetScenes = shuffledScenes.slice(0, count);
    
    // PERSONA LOCK GENERATOR (Coerenza facciale del Batch)
    const isMale = confirmedGender === 'uomo' || confirmedGender === 'Uomo';
    
    console.log(`[Persona Lock UGC] Campagna: ${confirmedCategory} | Bottom: ${confirmedBottom} | Genere: ${isMale ? 'UOMO' : 'DONNA'}`);

    const cameraAngles = [
        "Full body shot, head to toe completely visible", 
        "Mid shot, framed from the waist up", 
        "Slight close-up portrait, focusing on the upper chest and face"
    ];

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
        targetScenes.map(async (scene: string, index: number) => {
            const currentAngle = cameraAngles[index % cameraAngles.length];

            const finalPrompt = `${scene}

SUBJECT AGE REQUIREMENT:
The subject MUST clearly look to be between ${ageBracket} years old.

CAMERA ANGLE AND PERSPECTIVE:
${currentAngle}. Vary the camera perspective naturally, feeling authentic and not staged.

GARMENT CAPTURE INSTRUCTIONS:
${isMale 
   ? 'The subject in the image is MALE. HE is wearing EXACTLY the outfit shown in the attached image context. CRITICAL RULE: The male model MUST be wearing a suitable base layer (like a fitted t-shirt or dress shirt) underneath his outerwear. ABSOLUTELY NO BARE-CHESTED LOOKS.' 
   : 'The subject in the image is FEMALE. SHE is wearing EXACTLY the outfit shown in the attached image context.'} 
GARMENT DESCRIPTION: ${garmentDetails.description}. 
${confirmedBottom ? 'BOTTOM CLOTHING TYPE: ' + confirmedBottom.toUpperCase() : ''}.

ABSOLUTE RULE 1: The clothing item MUST be reproduced 100% authentically in true original cut, original fabric pattern, original colors, and exact button/collar shapes. 
ABSOLUTE RULE 2: ALWAYS REMOVE ANY STORE TAGS, PRICE LABELS OR PLASTIC STRINGS from the clothes. 
ABSOLUTE RULE 3: Do not add any text, watermarks, or logos to the image.
ABSOLUTE RULE 4: No unrealistic anatomy. No exaggerated fashion poses. No fake or overly perfect model look.`;
            
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
                    data: { job_id: jobId, image_url: finalUrl, scene_type: scene }
                });
                return finalUrl; 
            }
            throw new Error("No image inlineData in candidates");
        })
    );

    const generatedUrls = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);

    // FASE 4: Segna completato
    await prisma.generationJob.update({
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
       
       await bot.telegram.sendMessage(chatId, `🎉 **PROCESSO COMPLETATO!**\n\n- Categoria: ${confirmedCategory}\n- Taglio: ${confirmedBottom || 'Dato non richiesto'}\n- Regole Antitag Applicate!\n\nLe trovi anche sul Portale WEB come al solito. Ecco le scene esclusive generate per te:`, { parse_mode: 'Markdown' });
       if (mediaGroup.length > 0) {
           await bot.telegram.sendMediaGroup(chatId, mediaGroup);
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
