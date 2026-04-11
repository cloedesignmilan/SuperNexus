import { NextRequest, NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

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

        // SCELTA SOTTO-CATEGORIA -> AVVIA GENERAZIONE AI
        if (action.startsWith('S_')) {
            const parts = action.split('_');
            const subId = parts[1];
            const timestamp = parts[2];

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, "⚡ *Avvio Motore AI...*", { parse_mode: 'Markdown' });

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
                // Passiamo l'immagine tramite URL, scaricandola al volo per Gemini
                const response = await fetch(publicUrl);
                if (!response.ok) throw new Error("Impossibile recuperare l'immagine caricata dal bucket.");
                const arrayBuffer = await response.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const mimeType = response.headers.get('content-type') || 'image/jpeg';

                // Prompt Master (Istruzione di Stile Pre-calcolata + Contesto)
                const masterStyle = subcat.prompt_settings.base_prompt_prefix;
                // Richiesta Operativa per fondere l'immagine con lo stile
                const userPrompt = `Quella che vedi è un'immagine di abbigliamento fornita da un utente (${subcat.category.name}). Voglio che tu RENDERIZZI QUESTA IMMAGINE usando ESATTAMENTE lo stile fotografico e visivo descritto qui di seguito:\n\n[STILE RICHIESTO]: ${masterStyle}\n\nREGOLE: mantieni l'integrità del capo d'abbigliamento principale (forma, taglio, colore), ma genera la nuova fotografia con il mood richiesto.`;

                const payload = {
                    contents: [{
                      role: "user",
                      parts: [
                        { text: userPrompt },
                        { inlineData: { data: base64, mimeType } }
                      ]
                    }],
                    generationConfig: {
                      temperature: 0.6,
                      maxOutputTokens: 800
                    }
                };

                await bot.telegram.editMessageText(globalChatId, msgId, undefined, "🧠 *Gemini Sta Elaborando il Capo...*", { parse_mode: 'Markdown' });

                const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const aiData = await aiResp.json();
                
                if (!aiResp.ok) throw new Error(aiData.error?.message || "Unknown error");

                const resultText = aiData.candidates[0].content.parts[0].text;

                // IN UN MONDO REALE: Qui manderesti questi dati a Midjourney/Runway.
                // Poiché stiamo usando Gemini Flash (MMLM testuale), lui restituirà testo/descrizione.
                // Se hai accesso a Imagen 3, useremmo Imagen.
                // Ti rispondo con l'analisi di Gemini per dimostrare l'efficacia del prompt.

                // Registro il Job
                await prisma.generationJob.create({
                    data: {
                        user_id: existingUser.id,
                        category_id: subcat.category_id,
                        subcategory_id: subId,
                        original_product_image_url: publicUrl,
                        status: "completed",
                        provider_response: resultText
                    }
                });

                await bot.telegram.sendMessage(globalChatId, `✅ **Generazione Simulata**\n\n*Il motore AI ha fuso il tuo stile di Addestramento con la tua foto, ecco il risultato testuale del suo output (Midjourney / Imagen genererebbe l'immagine 1:1 basandosi su questo output!)*\n\n${resultText}`, { parse_mode: 'Markdown' });

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
