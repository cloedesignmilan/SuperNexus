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
    let botToken = process.env.TELEGRAM_BOT_TOKEN as string;
    
    // Inizializza subito il bot globale
    const bot = new Telegraf(botToken);
    const update = await req.json();
    console.log("==> UPDATE RICEVUTO DA TELEGRAM: ", JSON.stringify(update));

    const globalChatIdNum = update?.message?.chat?.id || update?.callback_query?.message?.chat?.id;
    const globalChatId = globalChatIdNum ? globalChatIdNum.toString() : null;

    if (!globalChatId) {
         return NextResponse.json({ ok: true });
    }

    let currentStore = null;

    // --- AUTENTICAZIONE MULTI-TENANT E BLOCCO PASSWORD ---
    const existingUser = await (prisma as any).user.findUnique({
        where: { telegram_id: globalChatId }
    });

    if (existingUser && existingUser.store_id) {
        // Utente noto, carichiamo il suo negozio di appartenenza!
        currentStore = await (prisma as any).store.findUnique({ where: { id: existingUser.store_id } });
    } else {
        // Utente sconosciuto. Chiediamo o controlliamo la password aziendale globale.
        const incomingText = update?.message?.text?.trim() || "";
        
        // Verifica se ci ha inviato una password valida (esiste un negozio con quella password?)
        if (incomingText && incomingText.length > 2) {
            const matchedStore = await (prisma as any).store.findFirst({
                 where: { password: incomingText, is_active: true }
            });
            if (matchedStore) {
                 // Match Perfetto! Registra l'utente per il futuro legandolo al negozio.
                 await (prisma as any).user.create({
                     data: { telegram_id: globalChatId, store_id: matchedStore.id, role: "user" }
                 });
                 await bot.telegram.sendMessage(globalChatId, `✅ **Accesso Autorizzato!**\n\nBenvenuto nella tua postazione virtuale per **${matchedStore.name}**.\n\nIl tuo account è stato collegato con successo. Da adesso non ti chiederò più la password. Mandami pure una foto dell'abito e cominciamo!`, { parse_mode: 'Markdown' });
                 return NextResponse.json({ ok: true });
            }
        }
        
        // Nessun match o prima interazione: Blocca in rampa di lancio
        await bot.telegram.sendMessage(globalChatId, `🔒 **Accesso Riservato SuperNexus**\n\nNon risulti registrato. Per favore, scrivi qui in chat la **Password Privata Aziendale** che ti è stata fornita per collegare il tuo account Telegram al tuo Negozio.\n\n*Se vuoi abbonarti o se non ricordi la password, contatta l'assistenza.*`, { parse_mode: 'Markdown' });
        return NextResponse.json({ ok: true });
    }

    // Blocco finale se ci sono anomalie sul negozio caricato
    if (!currentStore || !currentStore.is_active) {
        await bot.telegram.sendMessage(globalChatId, `❌ **Errore di Servizio**: Il tuo negozio attualmente risulta disattivato o non più esistente. Contatta l'assistenza.`, { parse_mode: 'Markdown' });
        return NextResponse.json({ ok: true });
    }

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
    // --- FINE BILLING ---

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
                        
                        bot.telegram.sendMessage(chatId, `✨ **Modalità Still Life Calzature attivata!**\n*(Sto scattando 3 angolazioni professionali su sfondo bianco...)*`);

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
                                imgCount: 3
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

                const protocol = req.headers.get("x-forwarded-proto") || "https";
                const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
                const baseUrl = host ? `${protocol}://${host}` : `https://x-super-nexus.vercel.app`;
                
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

            // Verifica se è categoria scarpe
            let isShoesFeature = meta.isShoesCategory;
            if (isShoesFeature === undefined && meta.confirmedCategory) {
                const catCheck = await (prisma as any).category.findUnique({ where: { id: meta.confirmedCategory } });
                isShoesFeature = catCheck?.name.toLowerCase().includes('scarpe') || catCheck?.name.toLowerCase().includes('calzature');
                meta.isShoesCategory = isShoesFeature;
            }

            // Aggiorna il DB con il blocco confermato
            await (prisma.generationJob as any).update({
                where: { id: jobId },
                data: { metadata: meta }
            });

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
               const finalGEnd = meta.confirmedGender || (meta.isWoman ? 'Donna' : 'Uomo');
               
               if (meta.confirmedEnvironment === 'studio_calzature') {
                    await bot.telegram.sendMessage(
                        chatId,
                        `✅ **Tutto Confermato:**\nGenere: ${finalGEnd}\nStile: In Studio\n\nProcedo con la generazione del **Set E-Commerce Calzature Esecutivo** (4 inquadrature fisse:\n1. 3/4 Frontale\n2. Top-Down\n3. Tallone\n4. Profilo)`,
                        Markup.inlineKeyboard([
                            Markup.button.callback("🚀 Genera il Set (4 crediti)", `run|${jobId}|4`)
                        ])
                    );
               } else {
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
            
            let isShoesFeature = meta.isShoesCategory;
            if (isShoesFeature === undefined && meta.confirmedCategory) {
                const catCheck = await (prisma as any).category.findUnique({ where: { id: meta.confirmedCategory } });
                isShoesFeature = catCheck?.name.toLowerCase().includes('scarpe') || catCheck?.name.toLowerCase().includes('calzature');
                meta.isShoesCategory = isShoesFeature;
            }

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
            } else {
                await bot.telegram.sendMessage(chatId, `DEBUG FALLBACK test array:\nneedsBrand: ${meta.needsBrandClarification}\nconfirmedCat: ${meta.confirmedCategory}\nconfirmedBrand: ${meta.confirmedBrand}\nisShoes: ${meta.isShoesCategory}`);
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
      
      let filteredCategories = fallbacksFromDB;
      if (aiResult.needs_gender_clarification === false) {
          filteredCategories = fallbacksFromDB.filter((c: any) => {
              const catName = c.name.toLowerCase();
              if (aiResult.is_women_dress) {
                   // Rimuovi esplicitamente categorie puramente maschili
                   if (catName === 'sposo' || catName.includes('uomo')) return false;
              } else {
                   // Rimuovi esplicitamente categorie puramente femminili
                   if (catName === 'sposa' || catName.includes('donna') || catName.includes('damigelle')) return false;
              }
              return true;
          });
      }

      for (let i = 0; i < filteredCategories.length; i++) {
          // Preveniamo che il bottone di guess (già pushato sopra) crei un duplicato inutile se non vogliamo
          // Ma per tenere l'ordine originale, facciamo il push garantito
          fallbackButtons.push(Markup.button.callback(filteredCategories[i].name, `cat|${jobId}|${filteredCategories[i].id}`));
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
          "👋 Bentornato su SuperNexus! Sono l'assistente AI avanzato. Invia la foto di un abito e ti guiderò prima della generazione!"
        );
        console.log("==> Messaggio mandato con successo");
    } else if (incomingText) {
        // Se scrive ciao o parole a caso ed è già loggato
        const allJobs = await (prisma.generationJob as any).findMany({
             where: { telegram_chat_id: globalChatId },
             orderBy: { createdAt: 'desc' },
             take: 1
        });
        const lastJob = allJobs.length > 0 ? allJobs[0] : null;
        
        const debugStr = `DEBUG UNIVERSALE:\nChatID: ${globalChatId}\nTesto Rilevato: ${incomingText}\nUltimo Job ID: ${lastJob ? lastJob.id : 'Nessuno'}\nStatus Ultimo Job: ${lastJob ? lastJob.status : 'N/A'}\nHas Metadata: ${lastJob && lastJob.metadata ? 'Si' : 'No'}`;
        
        await bot.telegram.sendMessage(
          chatId,
          `👋 Ciao! Ricordati che sono un AI focalizzata sulle immagini.\n\n${debugStr}`
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
