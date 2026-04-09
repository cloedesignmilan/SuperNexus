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
            let catCheckName = meta.confirmedCategory;

            if (meta.confirmedCategory) {
                const catCheck = await (prisma as any).category.findUnique({ where: { id: meta.confirmedCategory } });
                if (catCheck) {
                    catCheckName = catCheck.name;
                    if (isShoesFeature === undefined) {
                        isShoesFeature = catCheck.name.toLowerCase().includes('scarpe') || catCheck.name.toLowerCase().includes('calzature');
                        meta.isShoesCategory = isShoesFeature;
                    }
                }
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
            } else if (meta.isWoman && meta.needsBottomClarification && !meta.confirmedBottom && !meta.isShoesCategory) {
               // Chiedi parte inferiore
               await bot.telegram.sendMessage(
                    chatId,
                    `👗 Hai scelto **${catCheckName}**.\n\nUna precisazione importante per le generazioni femminili: è una Gonna o un Pantalone?`,
                    Markup.inlineKeyboard([
                        Markup.button.callback("Gonna", `bot|${jobId}|gonna`), 
                        Markup.button.callback("Pantalone", `bot|${jobId}|pantalone`)
                    ], { columns: 2 })
                );
            } else if (meta.needsGenderClarification && !meta.confirmedGender && !meta.isShoesCategory) {
                // Chiedi Genere Uomo/Donna (Salto automatico per scarpe)
                await bot.telegram.sendMessage(
                    chatId,
                    `🎯 Hai scelto **${catCheckName}**.\n\nTuttavia, vorrei esserne certo per applicare il giusto modello: **Il capo in foto è per Uomo o per Donna?**`,
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
        // Controlla se c'è un job in sospeso che aspetta il brand o clarification
        const pendingJob = await (prisma.generationJob as any).findFirst({
            where: { telegram_chat_id: globalChatId, status: "awaiting_input" },
            orderBy: { createdAt: 'desc' }
        });

        if (pendingJob && pendingJob.metadata) {
            let meta: any = typeof pendingJob.metadata === 'string' ? JSON.parse(pendingJob.metadata) : pendingJob.metadata;
            
            // Nuova logica: Risoluzione Ambiguità Generale (Step 2.0)
            if (meta.isCustomClarification) {
                // SALVO RISPOSTA IN confirmedBottom, in modo che passi automaticamente
                // nell'API generator in "contextStr" senza dover toccare il flusso a valle.
                meta.confirmedBottom = incomingText;
                meta.isCustomClarification = false;
                
                await (prisma.generationJob as any).update({
                    where: { id: pendingJob.id },
                    data: { metadata: meta }
                });
                
                await bot.telegram.sendMessage(chatId, `✅ Perfetto, ho registrato il dettaglio: "${incomingText}".`);
                
                // Ora procediamo con i bottoni delle categorie (precalcolati nell'Inspector)
                const fallbacksFromDB = await (prisma as any).category.findMany({
                    where: { is_active: true },
                    orderBy: { sort_order: 'asc' }
                });
                const recommendedCats = meta.precalculatedCategories || [];
                const filteredCategories = fallbacksFromDB.filter((c: any) => recommendedCats.includes(c.name));
                const listToRender = filteredCategories.length > 0 ? filteredCategories : fallbacksFromDB;

                const fallbackButtons = [];
                for (let i = 0; i < listToRender.length; i++) {
                    fallbackButtons.push(Markup.button.callback(listToRender[i].name, `cat|${pendingJob.id}|${listToRender[i].id}`));
                }

                await bot.telegram.sendMessage(
                    chatId,
                    `🤖 **Continuo il percorso...**\nSeleziona la Categoria corretta: 👇`,
                    Markup.inlineKeyboard(fallbackButtons, { columns: 2 })
                );
                return NextResponse.json({ ok: true });
            }
            
            // Logica legacy Brand: solo se usata in futuro o lasciata compatibile
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

      const analysisPrompt = `Sei un esperto ispettore di qualità e analista prodotto. Il capo in foto appartiene a una categoria selezionata.

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
      
      let inspectorData: any = {};
      
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
          inspectorData = JSON.parse(cleanedText);
          console.log(`[DECISION ENGINE SINTETICO] Usable: ${inspectorData.technical_validation?.is_usable} | Chiarimenti: ${inspectorData.ambiguity_flags?.requires_user_clarification} | Consigliati: ${inspectorData.suggested_ui_options?.recommended_categories?.join(',')}`);
      } catch(e) {
          console.error("Fetch/Parse API fallito", e);
      }

      // 1) BLOCCO QUALITÀ FOTO
      if (inspectorData.technical_validation?.is_usable === false) {
          await bot.telegram.sendMessage(chatId, "❌ **Foto Non Idonea**\n\nLa foto non è abbastanza chiara per lavorare bene. Prova con una foto più luminosa e nitida.");
          return NextResponse.json({ ok: true });
      }

      // 2) GESTIONE AMBIGUITÀ (Soft Block)
      if (inspectorData.ambiguity_flags?.requires_user_clarification && inspectorData.suggested_ui_options?.suggested_question) {
          const jobId = "job_" + Date.now() + "_" + Math.floor(Math.random()*1000);
          const metadataObj = {
              fileUrl,
              isCustomClarification: true,
              clarificationType: inspectorData.ambiguity_flags.clarification_type,
              clarificationContext: null, // Utente dovrà rispondere con un testo
              confirmedCategory: null,
              confirmedBottom: null,
              confirmedGender: null,
              confirmedBrand: null,
              precalculatedCategories: inspectorData.suggested_ui_options?.recommended_categories || []
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
          await bot.telegram.sendMessage(chatId, `🤔 **Chiarimento Richiesto dall'AI**\n\n${inspectorData.suggested_ui_options.suggested_question}`);
          return NextResponse.json({ ok: true });
      }

      // 3) FILTRO CATEGORIE (Tutto Ok, mostra opzioni raccomandate)
      const recommendedCats = inspectorData.suggested_ui_options?.recommended_categories || [];
      const genderPres = inspectorData.product_classification?.gender_presentation;

      const jobId = "job_" + Date.now() + "_" + Math.floor(Math.random()*1000);
      const metadataObj = {
          fileUrl,
          isWoman: genderPres === "female",
          needsGenderClarification: genderPres === "unisex" || genderPres === "unknown",
          needsBottomClarification: false,
          needsBrandClarification: false, // Disabilitato, se ne occuperà lo schema avanzato in futuro
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

      const fallbacksFromDB = await (prisma as any).category.findMany({
          where: { is_active: true },
          orderBy: { sort_order: 'asc' }
      });

      const fallbackButtons = [];
      const filteredCategories = fallbacksFromDB.filter((c: any) => recommendedCats.includes(c.name));
      const listToRender = filteredCategories.length > 0 ? filteredCategories : fallbacksFromDB;

      for (let i = 0; i < listToRender.length; i++) {
          fallbackButtons.push(Markup.button.callback(listToRender[i].name, `cat|${jobId}|${listToRender[i].id}`));
      }

      await bot.telegram.sendMessage(
          chatId,
          `🤖 **Analisi Completata!**\n\nSeleziona la categoria corretta: 👇`,
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
