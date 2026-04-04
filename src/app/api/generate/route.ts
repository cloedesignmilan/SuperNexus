import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { Telegraf } from "telegraf";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

  try {
    const { jobId, fileUrl, chatId } = await req.json();

    if (!jobId || !fileUrl) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    // Qui in un'app vera prenderemmo l'immagine e la caricheremmo su Supabase Storage, 
    // ma in questo MVP la scaricheremo in ArrayBuffer per passarla a Gemini.
    
    // FASE 1: Estrazione Dettagli (Vision)
    const imageResp = await fetch(fileUrl);
    const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
    
    const analysisPrompt = `Sei un esperto di alta moda. Analizza questo capo d'abbigliamento e restituisci SOLO ed esclusivamente una descrizione in inglese in formato JSON, con le seguenti chiavi: 
    - "type" (tipo capo), 
    - "color" (colore esatto e sfumature), 
    - "fabric" (tessuto apparente),
    - "fit" (es. slim, oversize),
    - "details" (bottoni, scollo, ecc.),
    - "description" (una singola frase estremamente ricca che possa essere usata come prompt di generazione per riprodurre fedelmente il capo senza alterarlo in Imagen 3),
    - "unclear" (booleano, true se non si capisce se il sotto è gonna o pantalone).`;

    const visionResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [
            { text: analysisPrompt }, 
            { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/jpeg" } }
        ]}
      ]
    });

    const visionText = visionResult.text || "{}";
    let garmentDetails;
    try {
        const cleaned = visionText.replace(/```json/g, "").replace(/```/g, "");
        garmentDetails = JSON.parse(cleaned);
    } catch {
        garmentDetails = { description: "elegant clothing item, photorealistic", unclear: false };
    }

    // Se non è chiaro e dobbiamo flaggarlo:
    if (garmentDetails.unclear) {
       await prisma.errorLog.create({
           data: { job_id: jobId, message: "Non è chiaro se il capo presenta pantalone o gonna" }
       });
    }

    // FASE 2: Carica un Template a caso dal DB se non passato 
    // (Nel bot reale l'utente potrebbe sceglierlo, qui simuliamo default "Abiti donna eleganti")
    const template = await prisma.promptTemplate.findFirst({
        where: { name: { contains: "Abiti donna" } }
    });

    const scenes = template ? JSON.parse(template.scenes) : [
        "Davanti allo specchio (prova abito)", "Commessa che sistema l’abito", "Evento elegante serale",
        "Invitata a matrimonio", "Cena elegante", "Teatro", "Meeting professionale",
        "Passeggiata in città elegante", "Camerino lussuoso", "Uscita dal negozio"
    ];

    // Creiamo lo status nel DB
    await prisma.generationJob.create({
        data: { 
            id: jobId, 
            original_image_url: fileUrl,
            status: "in lavorazione", 
            target_template_id: template?.id,
            results_count: 10
        }
    });

    // FASE 3: Generazione tramite Imagen 3 
    // Esecuzione PARALLELA per aggirare il limite dei 10 secondi di Vercel Hobby
    const targetScenes = scenes.slice(0, 2); // MVP limitato a 2 per ora per non far crashare Vercel Free o Gemini Rate Limit
    
    const results = await Promise.allSettled(
        targetScenes.map(async (scene: string) => {
            const finalPrompt = `Hyper-realistic fashion photography, 8k resolution. A real person wearing EXACTLY this garment: ${garmentDetails.description}. The person is in the following setting: ${scene}. Scene mood: ${template?.base_prompt || 'elegant'}. STRICT RULE: ${template?.rules || 'Do not alter the dress.'}. No text, no logos, no watermarks. Natural professional salon lighting.`;
            
            const generated = await ai.models.generateImages({
                model: 'imagen-3.0-generate-001',
                prompt: finalPrompt,
                config: { numberOfImages: 1, outputMimeType: "image/jpeg" }
            });

            const base64Image = generated.generatedImages?.[0]?.image?.imageBytes;
            if (base64Image) {
                await prisma.jobImage.create({
                    data: { job_id: jobId, image_url: "uploaded_storage_link", scene_type: scene }
                });
                return base64Image;
            }
            throw new Error("No image generated");
        })
    );

    const generatedUrls = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);

    if (generatedUrls.length === 0) {
        // Estrai il motivo del primo errore da allSettled
        const firstError = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')?.reason;
        throw new Error(`Google AI fallito: ${firstError?.message || 'Sconosciuto'}`);
    }

    // FASE 4: Segna completato
    await prisma.generationJob.update({
        where: { id: jobId },
        data: { status: "completato" }
    });

    // FASE 5: Inoltra le immagini su Telegram all'utente (al massimo pacchetti di 10 mediaGroup)
    if (chatId) {
       const mediaGroup = generatedUrls.map((imgStr) => ({
           type: 'photo' as const,
           media: { source: Buffer.from(imgStr, 'base64') }
       }));
       
       await bot.telegram.sendMessage(chatId, `🎉 **PROCESSO COMPLETATO!**\n\nHo estratto le seguenti info dal capo:\n- Modello: ${garmentDetails.type}\n- Colore: ${garmentDetails.color}\n\nEcco le scene generate per te:`, { parse_mode: 'Markdown' });
       // Send the 10 scenes
       if (mediaGroup.length > 0) {
           await bot.telegram.sendMediaGroup(chatId, mediaGroup);
       }
    }

    return NextResponse.json({ success: true, count: generatedUrls.length });
  } catch (error: any) {
    console.error("Worker Background Errore:", error);
    
    // Intercetta e registra il fallimento, salvando sul database!
    try {
        const { jobId } = await req.clone().json().catch(() => ({ jobId: null }));
        if (jobId) {
             await prisma.generationJob.update({
                  where: { id: jobId },
                  data: { status: "errore" }
             });
        }
    } catch (e) {
        // Ignora altri errori finali
    }
    
    const msg = error?.message || "Internal Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
