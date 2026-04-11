import { NextRequest, NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

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

    // --- AUTENTICAZIONE PASSWORD ---
    const existingUser = await prisma.user.findFirst({
        where: { id: "tel_" + globalChatId }
    });

    if (!existingUser) {
        const incomingText = update?.message?.text?.trim() || "";
        const adminPass = process.env.ADMIN_PASSWORD;
        if (incomingText && incomingText === adminPass) {
             await prisma.user.create({
                 data: { id: "tel_" + globalChatId, email: globalChatId + "@telegram.bot", role: "user" }
             });
             await bot.telegram.sendMessage(globalChatId, `✅ **Accesso Autorizzato!**\n\nBenvenuto nella piattaforma SuperNexus.\nMandami pure la foto del capo d'abbigliamento che vuoi trasformare.`, { parse_mode: 'Markdown' });
             return NextResponse.json({ ok: true });
        }
        await bot.telegram.sendMessage(globalChatId, `🔒 **Accesso Riservato**\n\nScrivi la Master Password aziendale per sbloccare il bot.`, { parse_mode: 'Markdown' });
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
            "📸 **Immagine Archiviata.**\n\nA quale *Macrocategoria* appartiene questo capo?", 
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
                "✨ Perfetto. Ora scegli il **Look Visivo** che vuoi applicare:", 
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
                "✨ Perfetto. Quante foto vuoi generare per questo Book?", 
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

            try {
                // CHIAMATA A GEMINI ================================
                const response = await fetch(publicUrl);
                if (!response.ok) throw new Error("Impossibile recuperare l'immagine caricata dal bucket.");
                const arrayBuffer = await response.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const mimeType = response.headers.get('content-type') || 'image/jpeg';

                // Prompt Master (Istruzione di Stile Pre-calcolata + Contesto)
                const masterStyle = subcat.prompt_settings.base_prompt_prefix;
                // Richiesta Operativa con forzatura sulle pose
                const userPrompt = `Questa immagine in input è il capo da analizzare (${subcat.category.name}).
OBIETTIVO: Devi CREARE UNA FOTOGRAFIA NUOVA in cui questo capo è immerso o INDOSSATO nel seguente stile visivo:

[STILE RICHIESTO]: ${masterStyle}

REGOLE ASSOLUTE:
1. SE lo "STILE RICHIESTO" descrive una modella, un manichino o una persona, TU DEVI GENERARE LA PERSONA CHE INDOSSA L'ABITO COPIANDO RIGOROSAMENTE LE LORO POSE E ATTEGGIAMENTI. VIETATO ricreare semplicemente una foto piana/stesa se lo stile dice altrimenti!
2. Mantieni intatto il design del capo (taglio, colori). Fai una fusione magica.
3. Se sto generando un batch, varia le pose umane in modo del tutto realistico riprendendo quegli atteggiamenti specifici dalle foto di addestramento.`;

                const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
                
                await bot.telegram.editMessageText(globalChatId, msgId, undefined, `🧠 *Gemini Sta Renderizzando le Immagini... (Sii paziente)*`, { parse_mode: 'Markdown' });

                const numApiCalls = Math.ceil(qty / 4);
                const remainder = qty % 4;
                let generatedBase64s: string[] = [];

                const promises = [];
                for (let i = 0; i < numApiCalls; i++) {
                    let currentBatchSize = (i === numApiCalls - 1 && remainder !== 0) ? remainder : 4;
                    // Prevenire currentBatchSize = 0 o bug
                    if (currentBatchSize <= 0) currentBatchSize = 4;
                    
                    promises.push(ai.models.generateContent({
                        model: 'gemini-3.1-flash-image-preview',
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    { inlineData: { data: base64, mimeType } },
                                    { text: userPrompt }
                                ]
                            }
                        ],
                        config: {
                            // @ts-ignore
                            imageConfig: { aspectRatio: "3:4", numberOfImages: currentBatchSize }
                        }
                    }));
                }

                const responses = await Promise.all(promises);

                for (const resp of responses) {
                    if (resp.candidates && resp.candidates.length > 0) {
                        const candidate = resp.candidates[0];
                        if (candidate.content && candidate.content.parts) {
                            for (const part of candidate.content.parts) {
                                if (part.inlineData && part.inlineData.data) {
                                    generatedBase64s.push(part.inlineData.data);
                                }
                            }
                        }
                    }
                }

                if (generatedBase64s.length === 0) {
                     throw new Error("Il modello non ha restituito i byte visivi dell'immagine.");
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
                     await bot.telegram.sendMessage(globalChatId, `✅ **BOOK GENERATO CON SUCCESSO! (${generatedBase64s.length} Foto)**\n\nStile Applicato: *${subcat.name}*\nCategoria: *${subcat.category.name}*\n\nEccoti l'album finale!`, { parse_mode: 'Markdown' });
                } else {
                     await bot.telegram.sendPhoto(globalChatId, mediaGroup[0].media, {
                         caption: `✅ **LOOK GENERATO CON SUCCESSO!**\n\nStile Applicato: *${subcat.name}*\nCategoria: *${subcat.category.name}*\n\nEccoti l'immagine finale!`,
                         parse_mode: 'Markdown'
                     });
                }

                // Registro il Job
                await prisma.generationJob.create({
                    data: {
                        user_id: existingUser.id,
                        category_id: subcat.category_id,
                        subcategory_id: subId,
                        original_product_image_url: publicUrl,
                        status: "completed",
                        provider_response: `Album di ${generatedBase64s.length} foto in Base64`
                    }
                });

            } catch (error: any) {
                console.error("AI Generation Error", error);
                await bot.telegram.sendMessage(globalChatId, `❌ **Errore generazione**: ${error.message}`);
            }
            return NextResponse.json({ ok: true });
        }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("TELEGRAM WEBHOOK ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
