import { NextRequest, NextResponse, after } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { logApiCost } from "@/lib/gemini-cost";
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max timeout for Vercel

const seenUpdates = new Set<number>();

// Inizializza Supabase per caricamento immagini
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    let botToken = process.env.TELEGRAM_BOT_TOKEN as string;
    const bot = new Telegraf(botToken);
    const update = await req.json();
    
    // Idempotency: skip duplicates
    if (update.callback_query && update.update_id) {
        if (seenUpdates.has(update.update_id)) {
            return NextResponse.json({ ok: true });
        }
        seenUpdates.add(update.update_id);
    }

    const globalChatIdNum = update?.message?.chat?.id || update?.callback_query?.message?.chat?.id;
    const globalChatId = globalChatIdNum ? globalChatIdNum.toString() : null;

    if (!globalChatId) return NextResponse.json({ ok: true });

    // --- AUTENTICAZIONE CRM CLIENTE ---
    let existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { telegram_chat_id: globalChatId },
                { id: "tel_" + globalChatId } // Supporto legacy
            ]
        }
    });

    if (!existingUser) {
        const incomingText = update?.message?.text?.trim() || "";
        
        if (incomingText) {
            const userWithPin = await prisma.user.findUnique({
                where: { bot_pin: incomingText }
            });

            if (userWithPin) {
                existingUser = await prisma.user.update({
                    where: { id: userWithPin.id },
                    data: { telegram_chat_id: globalChatId }
                });

                const rem = existingUser.images_allowance - existingUser.images_generated;
                await bot.telegram.sendMessage(globalChatId, `✅ **Account Collegato!**\n\nBenvenuto nella piattaforma aziendale SuperNexus.\nPlafond Immagini: **${rem} rimanenti**.\n\nMandami pure la foto del capo d'abbigliamento che vuoi elaborare.`, { parse_mode: 'Markdown' });
                return NextResponse.json({ ok: true });
            }
        }
        
        await bot.telegram.sendMessage(globalChatId, `🔒 **Accesso Riservato**\n\nQuesto Bot è privato. Per favore, inserisci il tuo PIN personale fornito dall'agenzia per sbloccare la tua area cliente.`, { parse_mode: 'Markdown' });
        return NextResponse.json({ ok: true });
    }

    if (!existingUser.subscription_active) {
        await bot.telegram.sendMessage(globalChatId, `⛔ **Accesso Bloccato**\n\nIl tuo abbonamento risulta disattivato. Contatta l'amministrazione per rinnovarlo.`, { parse_mode: 'Markdown' });
        return NextResponse.json({ ok: true });
    }

    // --- GESTIONE FOTO IN INGRESSO ---
    if (update.message?.photo) {
        // L'utente ha mandato una foto!
        const photo = update.message.photo[update.message.photo.length - 1]; // Risoluzione più alta
        
        const loadingMsg = await bot.telegram.sendMessage(globalChatId, "⏳ *Scaricamento immagine in corso...*", { parse_mode: 'Markdown' });

        // Scarica e Carica su Supabase
        const fileUrl = await bot.telegram.getFileLink(photo.file_id);
        const response = await fetch(fileUrl.href);
        const arrayBuffer = await response.arrayBuffer();
        
        const timestamp = Date.now().toString();
        const fileName = `${globalChatId}_${timestamp}.jpg`;

        const { data, error } = await supabase.storage
            .from('telegram-uploads')
            .upload(fileName, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) {
            console.error("Supabase Upload Error:", error);
            await bot.telegram.editMessageText(globalChatId, loadingMsg.message_id, undefined, "❌ Errore durante il caricamento dell'immagine. Crea il bucket `telegram-uploads` su Supabase!");
            return NextResponse.json({ ok: true });
        }

        // Recupera le Categorie Attive dal DB per mostrare la pulsantiera
        const categories = await prisma.category.findMany({ where: { is_active: true }, orderBy: { sort_order: 'asc' } });
        
        if (categories.length === 0) {
             await bot.telegram.editMessageText(globalChatId, loadingMsg.message_id, undefined, "Nessuna macrocategoria configurata. Aggiungine una dal pannello Admin.");
             return NextResponse.json({ ok: true });
        }

        const buttons = categories.map(cat => [
            Markup.button.callback(cat.name, `C_${cat.id}_${timestamp}`)
        ]);

        await bot.telegram.editMessageText(globalChatId, loadingMsg.message_id, undefined, 
            "📸 **Immagine Archiviata.**\n\nGrazie! Scegli la Categoria di questo capo:", 
            { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
        );
        return NextResponse.json({ ok: true });
    }

    // --- GESTIONE BOTTONI (CALLBACK QUERIES) ---
    if (update.callback_query && update.callback_query.data) {
        const action = update.callback_query.data;
        const msgId = update.callback_query.message.message_id;

        // SCELTA MACRO-CATEGORIA -> MOSTRA SOTTO-CATEGORIE
        if (action.startsWith('C_')) {
            const parts = action.split('_');
            const catId = parts[1];
            const timestamp = parts[2];

            const subcats = await prisma.subcategory.findMany({ where: { category_id: catId, is_active: true }, orderBy: { sort_order: 'asc' } });
            
            if (subcats.length === 0) {
                await bot.telegram.editMessageText(globalChatId, msgId, undefined, "Nessun look configurato per questa categoria.");
                return NextResponse.json({ ok: true });
            }

            const buttons = subcats.map(sub => [
                Markup.button.callback(sub.name, `S_${sub.id}_${timestamp}`)
            ]);

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                "✨ Perfetto. Scegli lo Stile:", 
                { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
            );
            return NextResponse.json({ ok: true });
        }

        // SCELTA SOTTO-CATEGORIA -> CHIEDI QUANTITÀ
        if (action.startsWith('S_')) {
            const parts = action.split('_');
            const subId = parts[1];
            const timestamp = parts[2];

            const buttons = [
                [Markup.button.callback("1 Foto", `Q_1_${subId}_${timestamp}`), Markup.button.callback("3 Foto", `Q_3_${subId}_${timestamp}`)],
                [Markup.button.callback("5 Foto", `Q_5_${subId}_${timestamp}`), Markup.button.callback("8 Foto", `Q_8_${subId}_${timestamp}`)]
            ];

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                "✨ Ottimo. Quante foto vuoi generare?", 
                { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
            );
            return NextResponse.json({ ok: true });
        }

        // SCELTA QUANTITÀ -> AVVIA GENERAZIONE AI
        if (action.startsWith('Q_')) {
            const parts = action.split('_');
            const qtyStr = parts[1];
            const subId = parts[2];
            const timestamp = parts[3];
            const qty = parseInt(qtyStr, 10);

            // Controllo Crediti Clienti
            if (existingUser.role !== 'admin') {
                const remaining = existingUser.images_allowance - existingUser.images_generated;
                if (qty > remaining) {
                    const hostUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://supernexus.vercel.app";
                    await bot.telegram.editMessageText(
                        globalChatId, 
                        msgId, 
                        undefined, 
                        `💳 **Credito Esaurito**\n\nHai richiesto ${qty} immagini, ma ti rimangono solo **${remaining}** crediti disponibili nel tuo account aziendale.\n\n⚡️ **Puoi acquistare istantaneamente un pacchetto di Ricarica per sbloccare nuove generazioni:**\n👉 [Clicca qui per Ricaricare Online](${hostUrl}/ricarica)\n\n*(Il tuo PIN Segreto in caso ti venga richiesto è: \`${existingUser.bot_pin}\`)*`,
                        { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
                    );
                    return NextResponse.json({ ok: true });
                }
            }

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, `⚡ *Avvio Motore AI (Richieste ${qty} immagini)... Attendi fino a 40 secondi!*`, { parse_mode: 'Markdown' });

            // Recupera la Sottocategoria, le sue Impostazioni (Prompt)
            const subcat = await prisma.subcategory.findUnique({
                where: { id: subId },
                include: { prompt_settings: true, category: true }
            });

            if (!subcat || !subcat.prompt_settings?.base_prompt_prefix) {
                await bot.telegram.editMessageText(globalChatId, msgId, undefined, "❌ Array generativo non addestrato per questo look. Attiva prima il motore Vision dall'Admin.");
                return NextResponse.json({ ok: true });
            }

            // Ottieni l'URL Pubblico dell'immagine caricata
            const fileName = `${globalChatId}_${timestamp}.jpg`;
            const { data: { publicUrl } } = supabase.storage.from('telegram-uploads').getPublicUrl(fileName);

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, `🧠 *SuperNexus AI Sta generando ${qty} Immagini ... (attendi per cortesia ❤️)*`, { parse_mode: 'Markdown' });

            after(async () => {
                try {
                    // CHIAMATA A GEMINI ================================
                    const response = await fetch(publicUrl);
                    if (!response.ok) throw new Error("Impossibile recuperare l'immagine caricata dal bucket.");
                    const arrayBuffer = await response.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    const mimeType = response.headers.get('content-type') || 'image/jpeg';

                    // Prompt Master (Istruzione di Stile Pre-calcolata + Contesto)
                    const masterStyle = subcat.prompt_settings!.base_prompt_prefix;
                    // Richiesta Operativa con forzatura sulle pose
                    // Richiesta Operativa Estrema per "Virtual Try-On" Rigoroso
                    const userPrompt = `[CLINICAL VIRTUAL TRY-ON OPERATION] 
L'immagine allegata NON È UNA ISPIRAZIONE, è il SOGGETTO DEL RITRATTO (${subcat.category.name}). 
Devi vestire un modello o adattare l'ambiente a questa precisa veste nello STILE richiesto:

[STILE RICHIESTO]: ${masterStyle}

REGOLE ASSOLUTE E INVIOLABILI PER PRESERVARE L'ABITO:
1. PRESERVAZIONE STRUTTURALE AL 100%: E' SEVERAMENTE VIETATO modificare o immaginare diversamente la scollatura, le cuciture, i dettagli, la lunghezza dell'abito o delle maniche, cinture e bottoni. Il capo deve essere perfettamente identico.
2. PRESERVAZIONE MATERIALE AL 100%: Il colore ESATTO, il tipo di tessuto (seta, lana, cotone pesante, ecc) e la texturizzazione visiva devono essere identici all'originale. Non aggiungere pizzi, stampe, o increspature che non esistono nella foto.
3. ADATTAMENTO CORPOREO E VOLTI: Se lo stile richiede una modella/o, la persona DEVE avere un VISO e OCCHI A FUOCO, NITIDI. 
4. RIMOZIONE CARTELLINI: Se l'immagine originale contiene un cartellino del negozio, etichette o talloncini con il prezzo appesi al capo d'abbigliamento, essi DEVONO essere categoricamente ignorati ed eliminati nell'immagine generata.
5. FOCUS SUL CAPO ORIGINALE (NO EXTRA LAYERS): Se l'immagine in input ritrae un abito da donna, una t-shirt, top o altro indumento, E' ASSOLUTAMENTE VIETATO aggiungere o coprirlo parzialmente con cappotti, giacche, felpe, maglie o scialli non presenti nella foto originale. L'indumento inserito dal cliente deve essere esaltato e mostrato per intero senza coperture spurie.
6. VARIETA' (Batch): Genera pose naturali e diverse tra loro ispirate al dataset fotografico dello Stile.
${subcat.target_age ? `7. VINCOLO DI ETA' ASSOLUTO: La persona ritratta deve obbligatoriamente dimostrare l'età descritta qui: [${subcat.target_age}]. Questo vincolo è imperativo.` : ''}`;

                    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
                    let generatedBase64s: string[] = [];
                    const promises = [];

                    for (let i = 0; i < qty; i++) {
                        const variantPrompt = userPrompt + `\n\n[SEED/VARIANTE: Generazione nr. ${i+1}. Modifica la posizione delle braccia e l'atteggiamento, ma tieni il VISO PERFETTAMENTE A FUOCO.]`;
                        promises.push(
                            ai.models.generateContent({
                            model: 'gemini-3.1-flash-image-preview',
                            contents: [
                                {
                                    role: 'user',
                                    parts: [
                                        { inlineData: { data: base64, mimeType } },
                                        { text: variantPrompt }
                                    ]
                                }
                            ],
                            config: {
                                // @ts-ignore
                                imageConfig: { aspectRatio: "3:4" }
                            }
                        })
                    );
                }

                const responses = await Promise.allSettled(promises);
                let totalTokensIn = 0;
                let totalTokensOut = 0;

                for (const outcome of responses) {
                    if (outcome.status === 'fulfilled') {
                        const resp = outcome.value;
                        
                        // Accumula i token
                        if (resp.usageMetadata) {
                            totalTokensIn += resp.usageMetadata.promptTokenCount || 0;
                            totalTokensOut += resp.usageMetadata.candidatesTokenCount || 0;
                        }

                        if (resp.candidates && resp.candidates.length > 0) {
                            for (const candidate of resp.candidates) {
                                if (candidate.content && candidate.content.parts) {
                                    for (const part of candidate.content.parts) {
                                        if (part.inlineData && part.inlineData.data) {
                                            generatedBase64s.push(part.inlineData.data);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        console.error('Una delle generazioni multiple ha fallito:', outcome.reason);
                    }
                }

                if (totalTokensIn > 0 || totalTokensOut > 0) {
                    await logApiCost("telegram_generation", "gemini-3.1-flash-image-preview", totalTokensIn, totalTokensOut, existingUser.id);
                }

                if (generatedBase64s.length === 0) {
                     throw new Error("Tutte le chiamate API sono fallite. Riprova con una quantità minore.");
                }

                const { Input } = require('telegraf');
                const mediaGroup = generatedBase64s.map((b64, idx) => ({
                    type: 'photo' as const,
                    media: Input.fromBuffer(Buffer.from(b64, 'base64'), `generated_${timestamp}_${idx}.jpg`)
                }));

                // Se ci sono più di 1 foto inviamo un album
                if (mediaGroup.length > 1) {
                     // Taglio l'array al limite max di 10 di MediaGroup
                     await bot.telegram.sendMediaGroup(globalChatId, mediaGroup.slice(0, 10));
                     await bot.telegram.sendMessage(globalChatId, `✅ **Generazione Ultimata!**\n\nEcco le fotografie del capo d'abbigliamento nello stile richiesto:`, { parse_mode: 'Markdown' });
                } else {
                     await bot.telegram.sendPhoto(globalChatId, mediaGroup[0].media, {
                         caption: `✅ **Generazione Ultimata!**\n\nEcco le fotografie del capo d'abbigliamento nello stile richiesto:`,
                         parse_mode: 'Markdown'
                     });
                }

                // Gestione Consumo Plafond Clienti
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { images_generated: { increment: generatedBase64s.length } }
                });

                // Registro il Job
                await prisma.generationJob.create({
                    data: {
                        user_id: existingUser.id,
                        category_id: subcat.category_id,
                        subcategory_id: subId,
                        original_product_image_url: publicUrl,
                        status: "completed",
                        results_count: generatedBase64s.length,
                        provider_response: `Album di ${generatedBase64s.length} foto in Base64`
                    }
                });

            } catch (error: any) {
                console.error("AI Generation Error", error);
                await bot.telegram.sendMessage(globalChatId, `❌ **Errore generazione**: ${error.message}`);
            }
            });

            return NextResponse.json({ ok: true });
        }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("TELEGRAM WEBHOOK ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
