import { NextRequest, NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

// Spostato Schema internamente per renderlo dinamico al runtime

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

    // --- BILLING / ON-THE-FLY RESET ---
    const now = new Date();
    const nextCycle = new Date(currentStore.billing_cycle_start);
    nextCycle.setMonth(nextCycle.getMonth() + 1);

    if (now >= nextCycle) {
        // Reset mensile e sposta la data ad oggi
        currentStore = await (prisma as any).store.update({
             where: { id: currentStore.id },
             data: {
                 subscription_credits: currentStore.generation_limit,
                 billing_cycle_start: now
             }
        });
    }
    const totalAvail = currentStore.subscription_credits + currentStore.supplementary_credits;


    const bot = new Telegraf(botToken);
    const update = await req.json();
    console.log("==> UPDATE RICEVUTO DA TELEGRAM: ", JSON.stringify(update));

    const globalChatIdNum = update?.message?.chat?.id || update?.callback_query?.message?.chat?.id;
    const globalChatId = globalChatIdNum ? globalChatIdNum.toString() : null;

    // --- AUTENTICAZIONE E BLOCCO PASSWORD ---
    if (globalChatId && currentStore.password) {
        let isAuthorized = false;
        
        // 1. Controlliamo se è registrato tra gli User
        const existingUser = await (prisma as any).user.findUnique({
            where: { telegram_id: globalChatId }
        });

        if (existingUser) {
            isAuthorized = true;
        } else {
            // 2. Controllo Amnistia (ha lavori nel database?)
            const legacyJob = await (prisma as any).generationJob.findFirst({
                where: { telegram_chat_id: globalChatId, store_id: currentStore.id }
            });

            if (legacyJob) {
                // Amnistia: convertilo subito in User autorizzato
                await (prisma as any).user.create({
                    data: { telegram_id: globalChatId, store_id: currentStore.id, role: "user", credits: 10 }
                });
                isAuthorized = true;
            }
        }

        // Se non è autorizzato, forziamo il check della password
        if (!isAuthorized) {
            const incomingText = update?.message?.text?.trim() || "";
            if (incomingText === currentStore.password) {
                // Sblocco concesso
                await (prisma as any).user.create({
                    data: { telegram_id: globalChatId, store_id: currentStore.id, role: "user", credits: 10 }
                });
                await bot.telegram.sendMessage(globalChatId, `✅ **Accesso Sbloccato!**\n\nBenvenuto nei servizi di ${currentStore.name}. Sentiti libero di inviare la foto di un abito.`);
                return NextResponse.json({ ok: true });
            } else {
                // Rifiuto
                await bot.telegram.sendMessage(globalChatId, `🔒 **Accesso Riservato**\n\nInserisci la password segreta per accedere ai servizi di ${currentStore.name}.`);
                return NextResponse.json({ ok: true });
            }
        }
    }
    // --- FINE AUTENTICAZIONE ---

    // 1) GESTIONE PULSANTI CLICKATI (CALLBACK QUERY)
    if (update.callback_query) {
        const cbq = update.callback_query;
        const dataStr = cbq.data; // formato "cat|jobId|Valore" o "bot|jobId|Valore" o "run|jobId"
        const chatId = cbq.message?.chat?.id;

        if (dataStr) {
            await bot.telegram.answerCbQuery(cbq.id).catch(() => {});
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
            } else if (action === 'targ') {
                meta.confirmedShoeTarget = value;
                meta.confirmedGender = value;
            } else if (action === 'env') {
                if (value === 'studio' && meta.confirmedCategory) {
                    const catForEnv = await (prisma as any).category.findUnique({ where: { id: meta.confirmedCategory } });
                    const isShoes = catForEnv?.name.toLowerCase().includes('scarpe') || catForEnv?.name.toLowerCase().includes('calzature');
                    
                    if (isShoes) {
                        meta.confirmedEnvironment = 'studio_calzature';
                        
                        // Previeni doppi click
                        if (job.status === "processing") return NextResponse.json({ ok: true });
                        await (prisma.generationJob as any).update({
                            where: { id: jobId },
                            data: { status: "processing", metadata: meta }
                        });
                        
                        bot.telegram.sendMessage(chatId, `✨ **Modalità Still Life Calzature attivata!**\n*(Sto scattando 4 angolazioni professionali su sfondo bianco...)*`);

                        const baseUrl = `https://x-super-nexus.vercel.app`;
                        fetch(`${baseUrl}/api/generate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                jobId: jobId,
                                fileUrl: meta.fileUrl,
                                chatId: chatId,
                                storeId: currentStore.id,
                                confirmedCategory: meta.confirmedCategory,
                                confirmedBottom: null,
                                confirmedGender: 'Uomo', // ignora genere
                                confirmedScene: null,
                                confirmedEnvironment: 'studio_calzature',
                                confirmedBrand: meta.confirmedBrand,
                                imgCount: 4
                            })
                        }).catch(e => console.error(e));

                        await new Promise(r => setTimeout(r, 800));
                        return NextResponse.json({ ok: true });
                    }
                }
                meta.confirmedEnvironment = value;
            } else if (action === 'run') {
                // Previene doppi click
                if (job.status === "processing") {
                    return NextResponse.json({ ok: true });
                }
                // Avvia generazione!
                const generationCount = parseInt(value || "3");
                
                // --- QUOTA CHECK PRE-GENERAZIONE ---
                if (totalAvail < generationCount) {
                     await bot.telegram.sendMessage(chatId, `⚠️ **Crediti Insufficienti**\n\nHai richiesto ${generationCount} immagini, ma il tuo piano ha solo ${totalAvail} crediti residui.\n\n👉 [Acquista Pacchetto Extra](https://supernexus.ai/ricarica) per ricaricare subito o attendi il rinnovo.`, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
                     return NextResponse.json({ ok: true });
                }

                const safeGender = meta.confirmedGender || (meta.isWoman ? 'Donna' : 'Uomo');
                meta.confirmedGender = safeGender; // salva in DB per sicurezza!
                await (prisma.generationJob as any).update({
                    where: { id: jobId },
                    data: { status: "processing", metadata: meta }
                });

                bot.telegram.sendMessage(chatId, `✨ **La magia dell'IA è in corso!**\n*(Sto preparando l'allestimento fotografico...)*`);

                const baseUrl = `https://x-super-nexus.vercel.app`;
                fetch(`${baseUrl}/api/generate`, {
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
                        confirmedScene: meta.confirmedScene,
                        confirmedEnvironment: meta.confirmedEnvironment || 'ambientata',
                        confirmedBrand: meta.confirmedBrand,
                        imgCount: generationCount
                    })
                }).catch(e => console.error(e));

                await new Promise(r => setTimeout(r, 800)); // Safety buffer per Edge Vercel
                return NextResponse.json({ ok: true });
            }

            // Aggiorna il DB con il blocco confermato
            await (prisma.generationJob as any).update({
                where: { id: jobId },
                data: { metadata: meta }
            });

            // Verifica se è categoria scarpe
            let isShoesFeature = meta.isShoesCategory;
            if (isShoesFeature === undefined && meta.confirmedCategory) {
                const catCheck = await (prisma as any).category.findUnique({ where: { id: meta.confirmedCategory } });
                isShoesFeature = catCheck?.name.toLowerCase().includes('scarpe') || catCheck?.name.toLowerCase().includes('calzature');
                meta.isShoesCategory = isShoesFeature;
            }

            // Determina la prossima domanda
            if (!meta.confirmedCategory) {
                // Recupera Categorie Dinamiche da DB (la nuova Tabella)
                const categories = await (prisma as any).category.findMany({
                   where: { is_active: true },
                   orderBy: { sort_order: 'asc' }
                });
                
                const catButtons = [];
                for (let i = 0; i < categories.length; i++) {
                    catButtons.push(Markup.button.callback(categories[i].name, `cat|${jobId}|${categories[i].id}`));
                }

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
            } else if (meta.needsGenderClarification && !meta.confirmedGender && !meta.isShoesCategory) {
                // Chiedi Genere Uomo/Donna (Salto automatico per scarpe)
                await bot.telegram.sendMessage(
                    chatId,
                    `🎯 Hai scelto **${meta.confirmedCategory}**.\n\nTuttavia, vorrei esserne certo per applicare il giusto modello: **Il capo in foto è per Uomo o per Donna?**`,
                    Markup.inlineKeyboard([
                        Markup.button.callback("Uomo", `gen|${jobId}|uomo`), 
                        Markup.button.callback("Donna", `gen|${jobId}|donna`)
                    ], { columns: 2 })
                );
            } else if (meta.needsBrandClarification && !meta.confirmedBrand && meta.isShoesCategory) {
                await bot.telegram.sendMessage(
                    chatId,
                    "👟 **Dettaglio Custom Rilevato!**\n\nHo notato una scritta, un logo o una targhetta su questo capo e non voglio allucinare parole a caso!\n\n👉 **Per favore, scrivimi qui in chat il testo testuale esatto da stamparci sopra.** (Es. GAËLLE, Guess, ecc.)\n\n*Scrivi il testo nel box qui sotto ed invia.*"
                );
            } else if (!meta.confirmedEnvironment) {
                // Chiedi Ambientata o Studio
                await bot.telegram.sendMessage(
                    chatId,
                    `📸 **Stile Fotografico:**\n\nDesideri che la foto venga inserita in una **Location Reale** o in uno **Studio Fotografico** con sfondo neutro?`,
                    Markup.inlineKeyboard([
                        Markup.button.callback("🌍 Ambientata", `env|${jobId}|ambientata`),
                        Markup.button.callback("📸 In Studio", `env|${jobId}|studio`)
                    ], { columns: 2 })
                );
            } else if (meta.isShoesCategory && meta.confirmedEnvironment === 'ambientata' && !meta.confirmedShoeTarget) {
                await bot.telegram.sendMessage(
                    chatId,
                    `👟 **Target Demografico:**\n\nPer creare un set coerente e utilizzare il giusto modello del piede, specifica a chi sono destinate queste scarpe:`,
                    Markup.inlineKeyboard([
                        [Markup.button.callback("👨 Uomo", `targ|${jobId}|uomo`), Markup.button.callback("👩 Donna", `targ|${jobId}|donna`)],
                        [Markup.button.callback("👦 Bambino", `targ|${jobId}|bambino`), Markup.button.callback("👧 Bambina", `targ|${jobId}|bambina`)]
                    ])
                );
            } else {
               // Tutto pronto! Tasto per lanciare.
               const finalGEnd = meta.confirmedGender || (meta.isWoman ? 'Donna' : 'Uomo');
               await bot.telegram.sendMessage(
                    chatId,
                    `✅ **Tutto Confermato:**\nGenere: ${finalGEnd}\nStile: ${meta.confirmedEnvironment}\n\nScegli quante proposte desideri generare:`,
                    Markup.inlineKeyboard([
                        Markup.button.callback("📸 3", `run|${jobId}|3`),
                        Markup.button.callback("📸 5", `run|${jobId}|5`),
                        Markup.button.callback("📸 10", `run|${jobId}|10`)
                    ], { columns: 3 })
                );
            }
        }
        await bot.telegram.answerCbQuery(cbq.id);
        return NextResponse.json({ ok: true });
    }

    // 2) GESTIONE IMMAGINE E TESTO LIBERO
    const incomingText = update.message?.text?.trim() || "";
    const incomingPhoto = update.message?.photo;
    const incomingDoc = update.message?.document;
    const chatId = update.message?.chat?.id;

    if (incomingText && !incomingText.startsWith("/") && !incomingPhoto && !incomingDoc) {
        // Controlla se c'è un job in sospeso che aspetta il brand
        const pendingJob = await (prisma.generationJob as any).findFirst({
            where: { telegram_chat_id: globalChatId, status: "awaiting_input" },
            orderBy: { createdAt: 'desc' }
        });

        if (pendingJob && pendingJob.metadata) {
            let meta: any = typeof pendingJob.metadata === 'string' ? JSON.parse(pendingJob.metadata) : pendingJob.metadata;
            if (meta.needsBrandClarification && meta.confirmedCategory && !meta.confirmedBrand && meta.isShoesCategory) {
                meta.confirmedBrand = incomingText;
                await (prisma.generationJob as any).update({
                    where: { id: pendingJob.id },
                    data: { metadata: meta }
                });
                
                await bot.telegram.sendMessage(chatId, `✅ Salvato! Il brand/testo sarà scolpito come: **${incomingText}**`);
                
                // Passa alla prossima domanda
                if (!meta.confirmedEnvironment) {
                    await bot.telegram.sendMessage(
                        chatId,
                        `📸 **Stile Fotografico:**\n\nDesideri che la foto venga inserita in una **Location Reale** o in uno **Studio Fotografico** con sfondo neutro?`,
                        Markup.inlineKeyboard([
                            Markup.button.callback("🌍 Ambientata", `env|${pendingJob.id}|ambientata`),
                            Markup.button.callback("📸 In Studio", `env|${pendingJob.id}|studio`)
                        ], { columns: 2 })
                    );
                } else if (meta.isShoesCategory && meta.confirmedEnvironment === 'ambientata' && !meta.confirmedShoeTarget) {
                    await bot.telegram.sendMessage(
                        chatId,
                        `👟 **Target Demografico:**\n\nPer creare un set coerente, specifica a chi sono destinate queste scarpe:`,
                        Markup.inlineKeyboard([
                            [Markup.button.callback("👨 Uomo", `targ|${pendingJob.id}|uomo`), Markup.button.callback("👩 Donna", `targ|${pendingJob.id}|donna`)],
                            [Markup.button.callback("👦 Bambino", `targ|${pendingJob.id}|bambino`), Markup.button.callback("👧 Bambina", `targ|${pendingJob.id}|bambina`)]
                        ])
                    );
                } else {
                   const finalGEnd = meta.confirmedGender || (meta.isWoman ? 'Donna' : 'Uomo');
                   await bot.telegram.sendMessage(
                        chatId,
                        `✅ **Tutto Confermato:**\nGenere: ${finalGEnd}\nStile: ${meta.confirmedEnvironment}\n\nScegli quante proposte desideri generare:`,
                        Markup.inlineKeyboard([
                            Markup.button.callback("📸 3", `run|${pendingJob.id}|3`),
                            Markup.button.callback("📸 5", `run|${pendingJob.id}|5`),
                            Markup.button.callback("📸 10", `run|${pendingJob.id}|10`)
                        ], { columns: 3 })
                    );
                }
                return NextResponse.json({ ok: true });
            }
        }
    }

    if (incomingPhoto || incomingDoc) {
      // --- QUOTA CHECK ANTI INVASIONE STRUTTURALE ---
      if (totalAvail <= 0) {
           await bot.telegram.sendMessage(chatId, `⚠️ **Crediti Mensili Esauriti**\n\nHai esaurito tutto il tuo credito per questo mese. Nessun abito verrà processato.\n\n👉 [Acquista Pacchetto Extra](https://supernexus.ai/ricarica) per continuare a vendere senza limiti.`, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
           return NextResponse.json({ ok: true });
      }

      let fileId = incomingPhoto ? incomingPhoto[incomingPhoto.length - 1].file_id : incomingDoc.file_id;
      const fileUrlData = await bot.telegram.getFileLink(fileId);
      const fileUrl = fileUrlData.toString();

      await bot.telegram.sendMessage(chatId, "⏳ *AI sta analizzando la tua immagine...*", { parse_mode: 'Markdown' });

      // Scarichiamo per Gemini Rapido
      let imgBuffer;
      try {
          const res = await fetch(fileUrl);
          imgBuffer = await res.arrayBuffer();
      } catch(e) {
          await bot.telegram.sendMessage(chatId, "Errore di download temporaneo.");
          return NextResponse.json({ ok: true });
      }

      // Costruiamo le Categorie Dinamiche per Gemini
      const templatesSchemaList = await (prisma as any).category.findMany({
          where: { is_active: true }
      });
      const validCategoriesStr = templatesSchemaList.map((t: any) => `ID: "${t.id}" (Nome: ${t.name})`).join(" | ");

      const analysisPrompt = `Sei un esperto. Analizza la foto in allegato (potrebbe esserci un abito o delle scarpe) e restituisci SOLO UN JSON. Questo JSON deve contenere l'esatta chiave: "predicted_category". 
Il valore di "predicted_category" DEVE ESSERE RIGOROSAMENTE UNO E SOLO UNO degli ID menzionati in questa lista, scelto in base al contenuto della foto: [ ${validCategoriesStr} ]. Restituisci ESATTAMENTE solo la stringa alfanumerica dell'ID, senza aggiungere "ID:" o il nome.
Altre chiavi obbligatorie: 
- "is_women_dress" (booleano. DEVI mettere TRUE se vedi un capo palesemente femminile come abiti da sposa, gonne, scolli, corpetti tulle o tacchi. Metti FALSE se vedi abbigliamento palesemente maschile come giacche, smoking, cravatte e scarpe da uomo classiche).
- "needs_gender_clarification" (booleano. Metti TRUE se e solo se l'abbigliamento è totalmente unisex, come t-shirt o felpe neutre. Per abiti da sposa, tailleur femminili, o abiti da uomo eleganti devi SEMPRE mettere FALSE).
- "needs_bottom_clarification" (booleano true/false), 
- "needs_brand_clarification" (booleano. DEVI mettere true SE E SOLO SE vedi un logo evidente, targa metallica o un testo sui lacci/tomaia/capo di cui non sei perfettamente certo), 
- "predicted_bottom" (stringa). 
Solo parentesi graffe, nessuna formattazione markdown.`;
      
      let aiResult: any = { predicted_category: null, is_women_dress: false, needs_gender_clarification: false, needs_bottom_clarification: false, needs_brand_clarification: false };
      
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
          needsBrandClarification: aiResult.needs_brand_clarification,
          confirmedCategory: null,
          confirmedBottom: null,
          confirmedGender: null,
          confirmedBrand: null
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
      const fallbacksFromDB = await (prisma as any).category.findMany({
          where: { is_active: true },
          orderBy: { sort_order: 'asc' }
      });

      const fallbackButtons = [];
      if (aiResult.predicted_category) {
          const predictedStr = aiResult.predicted_category;
          const guess = fallbacksFromDB.find((c: any) => 
             c.id === predictedStr || 
             c.name.toLowerCase().includes(predictedStr.toLowerCase())
          );
          if(guess) {
              fallbackButtons.push(Markup.button.callback(`✅ Conferma (${guess.name})`, `cat|${jobId}|${guess.id}`));
          }
      }
      
      for (let i = 0; i < fallbacksFromDB.length; i++) {
          fallbackButtons.push(Markup.button.callback(fallbacksFromDB[i].name, `cat|${jobId}|${fallbacksFromDB[i].id}`));
      }

      const predictedName = aiResult.predicted_category ? fallbacksFromDB.find((c: any) => c.id === aiResult.predicted_category)?.name : 'Sconosciuto';

      await bot.telegram.sendMessage(
          chatId,
          `🤖 **Analisi Rapida Completata!**\n\nPenso si tratti di: **${predictedName || 'Sconosciuto'}**.\nConfermi o modifichi? 👇`,
          Markup.inlineKeyboard(fallbackButtons, { columns: 2 })
      );

    } else if (update.message?.text?.startsWith("/start")) {
        console.log("==> Rilevato comando START per la chat: ", chatId);
        await bot.telegram.sendMessage(
          chatId,
          "👋 Ciao! Sono l'assistente AI avanzato. Invia la foto di un abito e ti guiderò prima della generazione!"
        );
        console.log("==> Messaggio mandato con successo");
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
