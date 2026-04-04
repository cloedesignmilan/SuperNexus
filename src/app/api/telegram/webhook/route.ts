import { NextRequest, NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

const schema: Schema = {
    type: Type.OBJECT,
    properties: {
        predicted_category: {
            type: Type.STRING,
            description: "DEVI USARE SEMPRE E SOLO UNO DI QUESTI VALORI ESATTI: 'Cerimonia e festa', 'Sposi', 'Festa 18°', 'Sport', 'Bambini', 'Streetwear', 'Business & tempo libero', 'Rivista'."
        },
        is_women_dress: {
            type: Type.BOOLEAN,
            description: "True se è abbigliamento femminile"
        },
        needs_bottom_clarification: {
            type: Type.BOOLEAN,
            description: "True se è sfuocato/improbabile capire se è una gonna o pantalone, False se si capisce benissimo o se è solo un capo superiore o un abito intero."
        },
        predicted_bottom: {
            type: Type.STRING,
            description: "Se charo, 'gonna', 'pantalone', o 'intero/non-applicabile'"
        }
    },
    required: ["predicted_category", "is_women_dress", "needs_bottom_clarification", "predicted_bottom"]
};

export async function POST(req: NextRequest) {
  try {
    const storeSlug = req.nextUrl.searchParams.get('storeSlug');
    let botToken = process.env.TELEGRAM_BOT_TOKEN as string;
    let currentStore = null;

    if (storeSlug) {
        currentStore = await (prisma as any).store.findUnique({ where: { slug: storeSlug } });
      if (currentStore?.telegram_bot_token) botToken = currentStore.telegram_bot_token;
    } else {
       currentStore = await (prisma as any).store.findUnique({ where: { slug: 'magazzini-emilio' } });
    }

    if (!currentStore || !currentStore.is_active) return NextResponse.json({ ok: true });

    const bot = new Telegraf(botToken);
    const update = await req.json();

    // 1) GESTIONE PULSANTI CLICKATI (CALLBACK QUERY)
    if (update.callback_query) {
        const cbq = update.callback_query;
        const dataStr = cbq.data; // formato "cat|jobId|Valore" o "bot|jobId|Valore" o "run|jobId"
        const chatId = cbq.message?.chat?.id;

        if (dataStr) {
            const parts = dataStr.split('|');
            const action = parts[0];
            const jobId = parts[1];
            const value = parts[2];

            const job: any = await prisma.generationJob.findUnique({ where: { id: jobId } });
            if (!job || !job.metadata) {
                await bot.telegram.sendMessage(chatId, "⚠️ Sessione scaduta o non trovata.");
                return NextResponse.json({ ok: true });
            }

            let meta: any = typeof job.metadata === 'string' ? JSON.parse(job.metadata) : job.metadata;

            if (action === 'cat') {
                meta.confirmedCategory = value;
            } else if (action === 'bot') {
                meta.confirmedBottom = value;
            } else if (action === 'gen') {
                meta.confirmedGender = value;
            } else if (action === 'run') {
                // Avvia generazione!
                const generationCount = parseInt(value || "3");
                
                const safeGender = meta.confirmedGender || (meta.isWoman ? 'Donna' : 'Uomo');
                meta.confirmedGender = safeGender; // salva in DB per sicurezza!
                await (prisma.generationJob as any).update({
                    where: { id: jobId },
                    data: { status: "processing", metadata: meta }
                });

                bot.telegram.sendMessage(chatId, `✨ **Inizio Servizio Fotografico (${generationCount} foto)!**\nL'IA sta dipingendo il tuo abito nelle scene selezionate...`);

                fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId: jobId,
                        fileUrl: meta.fileUrl,
                        chatId: chatId,
                        storeId: currentStore.id,
                        confirmedCategory: meta.confirmedCategory,
                        confirmedBottom: meta.confirmedBottom,
                        confirmedGender: safeGender,
                        imgCount: generationCount
                    })
                }).catch(e => console.error(e));

                return NextResponse.json({ ok: true });
            }

            // Aggiorna il DB con il blocco confermato
            await (prisma.generationJob as any).update({
                where: { id: jobId },
                data: { metadata: meta }
            });

            // Determina la prossima domanda
            if (!meta.confirmedCategory) {
                const catButtons = [];
                if (meta.isWoman === false) {
                    catButtons.push(Markup.button.callback("Eleganza (Uomo)", `cat|${jobId}|Business & tempo libero`));
                } else {
                    catButtons.push(Markup.button.callback("Cerimonia (Donna)", `cat|${jobId}|Cerimonia e festa`));
                }
                catButtons.push(
                    Markup.button.callback("Sposi", `cat|${jobId}|Sposi`),
                    Markup.button.callback("Rivista", `cat|${jobId}|Rivista`),
                    Markup.button.callback("Festa 18 Anni", `cat|${jobId}|Festa 18°`),
                    Markup.button.callback("Casual / Streetwear", `cat|${jobId}|Streetwear`),
                    Markup.button.callback("Sportivo", `cat|${jobId}|Sport`),
                    Markup.button.callback("Bambini", `cat|${jobId}|Bambini`)
                );

                await bot.telegram.sendMessage(
                    chatId,
                    "🎯 **Scegli la Categoria di questo capo:**",
                    Markup.inlineKeyboard(catButtons, { columns: 2 })
                );
            } else if (meta.isWoman && meta.needsBottomClarification && !meta.confirmedBottom) {
               // Chiedi parte inferiore
               await bot.telegram.sendMessage(
                    chatId,
                    `👗 Hai scelto **${meta.confirmedCategory}**.\n\nUna precisazione importante per le generazioni femminili: è una Gonna o un Pantalone?`,
                    Markup.inlineKeyboard([
                        Markup.button.callback("Gonna", `bot|${jobId}|gonna`), 
                        Markup.button.callback("Pantalone", `bot|${jobId}|pantalone`)
                    ], { columns: 2 })
                );
            } else if (meta.needsGenderClarification && !meta.confirmedGender) {
                // Chiedi Genere Uomo/Donna
                await bot.telegram.sendMessage(
                    chatId,
                    `🎯 Hai scelto **${meta.confirmedCategory}**.\n\nTuttavia, vorrei esserne certo per applicare il giusto modello: **Il capo in foto è per Uomo o per Donna?**`,
                    Markup.inlineKeyboard([
                        Markup.button.callback("Uomo", `gen|${jobId}|uomo`), 
                        Markup.button.callback("Donna", `gen|${jobId}|donna`)
                    ], { columns: 2 })
                );
            } else {
               // Tutto pronto! Tasto per lanciare.
               const finalGEnd = meta.confirmedGender || (meta.isWoman ? 'Donna' : 'Uomo');
               await bot.telegram.sendMessage(
                    chatId,
                    `✅ **Tutto Confermato:**\n- Categoria: ${meta.confirmedCategory}\n- Genere: ${finalGEnd}\n- Taglio Inferiore: ${meta.confirmedBottom || 'Non richiesto'}\n\nScegli quante immagini desideri generare:`,
                    Markup.inlineKeyboard([
                        Markup.button.callback("📸 GENERA 3 IMMAGINI", `run|${jobId}|3`),
                        Markup.button.callback("📸 GENERA 5 IMMAGINI", `run|${jobId}|5`),
                        Markup.button.callback("📸 GENERA 10 IMMAGINI", `run|${jobId}|10`)
                    ], { columns: 1 })
                );
            }
        }
        await bot.telegram.answerCbQuery(cbq.id);
        return NextResponse.json({ ok: true });
    }

    // 2) GESTIONE IMMAGINE (Primo caricamento)
    const incomingPhoto = update.message?.photo;
    const incomingDoc = update.message?.document;
    const chatId = update.message?.chat?.id;

    if (incomingPhoto || incomingDoc) {
      let fileId = incomingPhoto ? incomingPhoto[incomingPhoto.length - 1].file_id : incomingDoc.file_id;
      const fileUrlData = await bot.telegram.getFileLink(fileId);
      const fileUrl = fileUrlData.toString();

      await bot.telegram.sendMessage(chatId, "⏳ *Occhio dell'IA in corso...* Sto guardando l'immagine...", { parse_mode: 'Markdown' });

      // Scarichiamo per Gemini Rapido
      let imgBuffer;
      try {
          const res = await fetch(fileUrl);
          imgBuffer = await res.arrayBuffer();
      } catch(e) {
          await bot.telegram.sendMessage(chatId, "Errore di download temporaneo.");
          return NextResponse.json({ ok: true });
      }

      // Analisi Rapida via Gemini (NATIVA)
      const analysisPrompt = `Sei un esperto di moda. Analizza la foto del vestito in allegato e restituisci SOLO UN JSON CON QUESTE ESATTE CHIAVI: "predicted_category" (Scegli una tra 'Cerimonia e festa', 'Sposi', 'Festa 18°', 'Sport', 'Bambini', 'Streetwear', 'Business & tempo libero'), "is_women_dress" (booleano true/false. Se vedi una classica giacca, abito intero da uomo, camicia da uomo o pantaloni sartoriali maschili DEVI mettere FALSE e MAI true), "needs_gender_clarification" (booleano. DEVI mettere false se è una giacca da completo o un tipico taglio da uomo. Metti true SOLO in rari casi come felpe totalmente anonime o t-shirt unisex), "needs_bottom_clarification" (booleano true/false), "predicted_bottom" (stringa). Solo parentesi graffe, no markdown.`;
      
      let aiResult = { predicted_category: null, is_women_dress: false, needs_gender_clarification: false, needs_bottom_clarification: false };
      
      try {
          const apiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  contents: [{
                      role: "user",
                      parts: [
                          { text: analysisPrompt },
                          { inlineData: { data: Buffer.from(imgBuffer).toString("base64"), mimeType: "image/jpeg" } }
                      ]
                  }],
                  generationConfig: { responseMimeType: "application/json" }
              })
          });

          const gData = await apiResp.json();
          const rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          aiResult = JSON.parse(cleanedText);
      } catch(e) {
          console.error("Fetch/Parse API fallito", e);
      }

      // Creazione JOB in attesa
      const jobId = "job_" + Date.now() + "_" + Math.floor(Math.random()*1000);
      const metadataObj = {
          fileUrl,
          isWoman: aiResult.is_women_dress,
          needsGenderClarification: aiResult.needs_gender_clarification,
          needsBottomClarification: aiResult.needs_bottom_clarification,
          confirmedCategory: null,
          confirmedBottom: null,
          confirmedGender: null
      };

      await (prisma.generationJob as any).create({
          data: {
              id: jobId,
              original_image_url: fileUrl,
              status: "awaiting_input",
              store_id: currentStore.id,
              telegram_chat_id: chatId.toString(),
              metadata: metadataObj
          }
      });

      // Partiamo chiedendo la categoria se l'IA ha un "guess" o partiamo da zero
      const fallbackButtons = [];
      if (aiResult.predicted_category) {
          fallbackButtons.push(Markup.button.callback(`Conferma (${aiResult.predicted_category})`, `cat|${jobId}|${aiResult.predicted_category}`));
      }
      
      if (aiResult.is_women_dress === false) {
          fallbackButtons.push(Markup.button.callback("Eleganza (Uomo)", `cat|${jobId}|Business & tempo libero`));
      } else {
          fallbackButtons.push(Markup.button.callback("Cerimonia (Donna)", `cat|${jobId}|Cerimonia e festa`));
      }
      
      fallbackButtons.push(
          Markup.button.callback("Sposi", `cat|${jobId}|Sposi`),
          Markup.button.callback("Rivista", `cat|${jobId}|Rivista`),
          Markup.button.callback("Festa 18 Anni", `cat|${jobId}|Festa 18°`),
          Markup.button.callback("Streetwear / Casual", `cat|${jobId}|Streetwear`),
          Markup.button.callback("Sportivo", `cat|${jobId}|Sport`),
          Markup.button.callback("Bambini / Ragazzi", `cat|${jobId}|Bambini`)
      );

      await bot.telegram.sendMessage(
          chatId,
          `🤖 **Analisi Rapida Completata!**\n\nPenso si tratti di: **${aiResult.predicted_category || 'Sconosciuto'}**.\nConfermi questa categoria o preferisci forzarne un'altra manualmente?`,
          Markup.inlineKeyboard(fallbackButtons, { columns: 1 })
      );

    } else if (update.message?.text === "/start") {
        await bot.telegram.sendMessage(
          chatId,
          "👋 Ciao! Sono l'assistente AI avanzato. Invia la foto di un abito e ti guiderò prima della generazione!"
        );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Errore Webhook Telegram:", error);
    try {
       const bodyText = await req.clone().text();
       const update = JSON.parse(bodyText);
       const chatId = update?.message?.chat?.id || update?.callback_query?.message?.chat?.id;
       if (chatId) {
          const telegrafInfo = require("telegraf");
          const bot = new telegrafInfo.Telegraf(process.env.TELEGRAM_BOT_TOKEN);
          await bot.telegram.sendMessage(chatId, `❌ **CRASH INTERNO DEL SERVER:**\n${error?.message}`);
       }
    } catch(e){}
    return NextResponse.json({ error: "Internal Server Error", msg: error?.message }, { status: 500 });
  }
}
