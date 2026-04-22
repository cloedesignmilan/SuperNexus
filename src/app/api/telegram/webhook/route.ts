import { NextRequest, NextResponse, after } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { logApiCost } from "@/lib/gemini-cost";
import { getRandomSceneForSubcategory } from "./sceneDictionary";
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Aligned to PRO to allow max execution

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

    // --- AUTENTICAZIONE CRM CLIENTE E CAMBIO ACCOUNT DINAMICO ---
    const incomingText = update?.message?.text?.trim() || "";
    
    // --- RECUPERO PIN VIA EMAIL ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (incomingText && emailRegex.test(incomingText)) {
        const userByEmail = await prisma.user.findUnique({
            where: { email: incomingText.toLowerCase() }
        });
        
        if (userByEmail && userByEmail.bot_pin) {
            await bot.telegram.sendMessage(globalChatId, `✅ **PIN Recovered**\n\nYour Secret PIN is: \`${userByEmail.bot_pin}\`\n\nType this PIN now to log in.`, { parse_mode: 'Markdown' });
        } else {
            await bot.telegram.sendMessage(globalChatId, `❌ **Email non trovata**\n\nNon abbiamo trovato nessun account associato a questa email. Assicurati di averla digitata correttamente o registrati sul nostro sito.`, { parse_mode: 'Markdown' });
        }
        return NextResponse.json({ ok: true });
    }

    // Controlla se il messaggio in ingresso è un PIN valido per il cambio account (o il primo bind)
    let possiblePin = incomingText;
    if (incomingText.startsWith('/start ')) {
        possiblePin = incomingText.split(' ')[1].trim();
    }

    if (possiblePin && possiblePin.length === 6 && possiblePin.toUpperCase() === possiblePin) {
        const userToBind = await prisma.user.findUnique({
            where: { bot_pin: possiblePin }
        });
        
        if (userToBind) {
            const isTargetFreeTrial = userToBind.paypal_subscription_id?.startsWith('free_trial');
            const existingBound = await prisma.user.findFirst({
                where: { telegram_chat_id: globalChatId }
            });

            if (existingBound && existingBound.id !== userToBind.id && isTargetFreeTrial) {
                const hostUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.supernexusai.com";
                const upgradeLink = `${hostUrl}/registrazione?upgrade=true`;
                await bot.telegram.sendMessage(globalChatId, `🛑 **Security Alert**\n\nYour Telegram account is already associated with SuperNexus.\n\nOur system prevents activating multiple Free Trials from the same device. To continue generating, please upgrade to a Pro Plan:\n👉 [Subscribe to a Pro Plan](${upgradeLink})`, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
                return NextResponse.json({ ok: true });
            }

            // Sgancia da eventuali account precedenti
            await prisma.user.updateMany({
                where: { telegram_chat_id: globalChatId },
                data: { telegram_chat_id: null }
            });
            
            // Aggancia al nuovo utente
            const newlyBindedUser = await prisma.user.update({
                where: { id: userToBind.id },
                data: { telegram_chat_id: globalChatId }
            });
            
            const created = newlyBindedUser.images_generated;
            const remaining = newlyBindedUser.images_allowance - newlyBindedUser.images_generated;
            let roleContext = newlyBindedUser.paypal_subscription_id?.startsWith("free_trial") ? "Free Trial" : "Pro";
            await bot.telegram.sendMessage(globalChatId, `✅ **Account Linked!**\n\nWelcome to the SuperNexus ${roleContext} platform.\n\n📊 **Your Quota:**\n• Images Created: **${created}**\n• Images Remaining: **${remaining}**\n\nPlease send me a photo of the clothing item you want to process.`, { parse_mode: 'Markdown' });
            return NextResponse.json({ ok: true });
        }
    }

    let existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { telegram_chat_id: globalChatId },
                { id: "tel_" + globalChatId } // Supporto legacy
            ]
        }
    });

    if (!existingUser) {
        await bot.telegram.sendMessage(globalChatId, `🔒 **Restricted Access**\n\nThis Bot is private. Please enter your personal 6-character PIN provided by the agency to unlock your client area.\n\n_Forgot your PIN? Simply type the email you used to register right here in the chat._`, { parse_mode: 'Markdown' });
        return NextResponse.json({ ok: true });
    }

    if (!existingUser.subscription_active) {
        await bot.telegram.sendMessage(globalChatId, `⛔ **Access Blocked**\n\nYour subscription is deactivated. Please contact administration to renew it.`, { parse_mode: 'Markdown' });
        return NextResponse.json({ ok: true });
    }

    // --- GESTIONE FOTO IN INGRESSO ---
    if (update.message?.photo) {
        // L'utente ha mandato una foto!
        const photo = update.message.photo[update.message.photo.length - 1]; // Risoluzione più alta
        
        const mediaGroupId = update.message.media_group_id || null;
        const timestamp = Date.now().toString();
        // Short key per restare sotto i 64 byte di Telegram callback_data
        const callbackKey = mediaGroupId ? `M_${mediaGroupId}` : `S_${timestamp}`;
        const basePrefix = mediaGroupId ? `${globalChatId}_mg_${mediaGroupId}` : `${globalChatId}_single_${timestamp}`;
        const fileName = mediaGroupId ? `${basePrefix}_${timestamp}.jpg` : `${basePrefix}.jpg`;

        let shouldSendMenu = true;
        let loadingMsgId: number | null = null;

        if (mediaGroupId) {
            try {
                await (prisma as any).setting.create({ data: { key: `lock_mg_${mediaGroupId}`, value: 'locked' } });
                const m = await bot.telegram.sendMessage(globalChatId, "⏳ *Downloading Outfit Coordination Images...*", { parse_mode: 'Markdown' });
                loadingMsgId = m.message_id;
                // Aspetta 3 secondi per dare il tempo alle altre Lambda di caricare i restanti file del gruppo
                await new Promise(r => setTimeout(r, 3000));
            } catch(e) {
                // Lock occupato, io sono l'immagine 2 o 3. Carico ed esco.
                shouldSendMenu = false;
            }
        } else {
            const m = await bot.telegram.sendMessage(globalChatId, "⏳ *Downloading image...*", { parse_mode: 'Markdown' });
            loadingMsgId = m.message_id;
        }

        const fileUrl = await bot.telegram.getFileLink(photo.file_id);
        const response = await fetch(fileUrl.href);
        const arrayBuffer = await response.arrayBuffer();

        const { data, error } = await supabase.storage
            .from('telegram-uploads')
            .upload(fileName, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) {
            console.error("Supabase Upload Error:", error);
            if (loadingMsgId) await bot.telegram.editMessageText(globalChatId, loadingMsgId, undefined, "❌ Error uploading image.");
            return NextResponse.json({ ok: true });
        }

        if (!shouldSendMenu) {
            // Sono un processo worker per la seconda immagine dell'outfit. Muoio qui.
            return NextResponse.json({ ok: true });
        }

        // Recupera le Categorie Attive dal DB per mostrare la pulsantiera
        const categories = await prisma.category.findMany({ where: { is_active: true }, orderBy: { sort_order: 'asc' } });
        
        const textStr = mediaGroupId 
            ? "📸 **Outfit Coordination Registered.**\n\nI received multiple items! Who is this outfit for?" 
            : "📸 **Image Archived.**\n\nThank you! Choose the Category for this item:";

        let buttons;
        if (mediaGroupId) {
            // Fast-track per Outfit Coordination
            buttons = [
                [Markup.button.callback("Man 👨", `OUTFIT|MAN|${callbackKey}`)],
                [Markup.button.callback("Woman 👩", `OUTFIT|WOMAN|${callbackKey}`)]
            ];
        } else {
            // Normale flusso per immagine singola
            if (categories.length === 0) {
                if (loadingMsgId) await bot.telegram.editMessageText(globalChatId, loadingMsgId, undefined, "No macro-category configured. Add one from the Admin panel.");
                return NextResponse.json({ ok: true });
            }
            buttons = categories.map(cat => [
                Markup.button.callback(cat.name, `C|${cat.id}|${callbackKey}`)
            ]);
        }

        if (loadingMsgId) {
            await bot.telegram.editMessageText(globalChatId, loadingMsgId, undefined, textStr, { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) });
        }
        return NextResponse.json({ ok: true });
    }

    // --- GESTIONE BOTTONI (CALLBACK QUERIES) ---
    if (update.callback_query && update.callback_query.data) {
        let action = update.callback_query.data;
        const msgId = update.callback_query.message.message_id;

        // GESTIONE BOTTONI BLOCCATI
        if (action === 'UPSELL') {
            await bot.telegram.answerCbQuery(update.callback_query.id, "💎 Premium Feature!\n\nGenerating multiple photos at once is reserved for PRO Plans. Please subscribe on the main site to unlock this feature.", { show_alert: true });
            return NextResponse.json({ ok: true });
        }

        // HELPER per ricostruire basePrefix da callbackKey
        const getBasePrefix = (cbKey: string) => {
            if (cbKey.startsWith('M_')) return `${globalChatId}_mg_${cbKey.replace('M_', '')}`;
            if (cbKey.startsWith('S_')) return `${globalChatId}_single_${cbKey.replace('S_', '')}`;
            return cbKey; // Fallback
        };

        // SCELTA OUTFIT GENDER -> CHIEDI QUANTITA'
        if (action.startsWith('OUTFIT|')) {
            const parts = action.split('|');
            const gender = parts[1]; // MAN or WOMAN
            const cbKey = parts[2];
            
            let buttons = [
                [Markup.button.callback("1 Photo ⚡", `Q|1|OUTFIT_${gender}|${cbKey}|X`), Markup.button.callback("3 Photos 🔥", `Q|3|OUTFIT_${gender}|${cbKey}|X`)],
                [Markup.button.callback("5 Photos 🚀", `Q|5|OUTFIT_${gender}|${cbKey}|X`)]
            ];

            if (existingUser.paypal_subscription_id?.startsWith("free_trial")) {
                buttons = [
                    [Markup.button.callback("1 Photo ⚡", `Q|1|OUTFIT_${gender}|${cbKey}|X`)],
                    [Markup.button.callback("🔒 3 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 5 Photos (Pro)", `UPSELL`)]
                ];
            }

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                `✨ Perfect. A **${gender.toLowerCase()}**'s outfit.\nHow many photos do you want to generate?`, 
                { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
            );
            return NextResponse.json({ ok: true });
        }

        // SCELTA MACRO-CATEGORIA -> MOSTRA BUSINESS MODES
        if (action.startsWith('C|')) {
            const parts = action.split('|');
            const catId = parts[1];
            const cbKey = parts[2];

            const modes = await prisma.businessMode.findMany({ where: { category_id: catId, is_active: true }, orderBy: { sort_order: 'asc' } });
            
            if (modes.length === 0) {
                await bot.telegram.editMessageText(globalChatId, msgId, undefined, "No business modes configured for this category.");
                return NextResponse.json({ ok: true });
            }

            const buttons = modes.map(mode => [
                Markup.button.callback(mode.name, `M|${mode.id}|${cbKey}`)
            ]);

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                "✨ Perfect. Choose the Business Mode:", 
                { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
            );
            return NextResponse.json({ ok: true });
        }

        // SCELTA BUSINESS MODE -> MOSTRA SOTTO-CATEGORIE
        if (action.startsWith('M|')) {
            const parts = action.split('|');
            const modeId = parts[1];
            const cbKey = parts[2];

            const subcats = await prisma.subcategory.findMany({ where: { business_mode_id: modeId, is_active: true }, orderBy: { sort_order: 'asc' } });
            
            if (subcats.length === 0) {
                await bot.telegram.editMessageText(globalChatId, msgId, undefined, "No looks configured for this mode.");
                return NextResponse.json({ ok: true });
            }

            const buttons = subcats.map(sub => [
                Markup.button.callback(sub.name, `S|${sub.id}|${cbKey}`)
            ]);

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                "✨ Excellent. Choose the Output Style:", 
                { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
            );
            return NextResponse.json({ ok: true });
        }

        if (action.startsWith('S|')) {
            const parts = action.split('|');
            const subId = parts[1];
            const cbKey = parts[2];
            const actualBasePrefix = getBasePrefix(cbKey);

            const subcat = await prisma.subcategory.findUnique({ 
                where: { id: subId },
                include: { business_mode: { include: { category: true } } }
            });
            const isMagazine = subcat && (subcat.name.includes("Cover") || subcat.name.includes("Magazine"));
            const isTshirtUgc = subcat && subcat.name.toLowerCase().includes("ugc") && 
                (subcat.business_mode?.name.toLowerCase().includes("t-shirt") || 
                 subcat.business_mode?.category?.name.toLowerCase().includes("t-shirt") ||
                 subcat.business_mode?.name.toLowerCase().includes("tshirt") || 
                 subcat.business_mode?.category?.name.toLowerCase().includes("tshirt") ||
                 subcat.business_mode_id.toLowerCase().includes("t-shirt") || 
                 subcat.id.toLowerCase().includes("t-shirt"));

            if (isMagazine) {
                // Bypass disambiguation and quantity selection, force 1 photo generation
                action = `Q|1|${subId}|${cbKey}|X`;
            } else if (isTshirtUgc) {
                 const buttons = [
                    [Markup.button.callback("Man 👨", `G|M|${subId}|${cbKey}`)],
                    [Markup.button.callback("Woman 👩", `G|W|${subId}|${cbKey}`)]
                 ];
                 await bot.telegram.editMessageText(globalChatId, msgId, undefined, "✨ Perfect. Who is the model for this UGC shot?", { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) });
                 return NextResponse.json({ ok: true });
            } else {
                // Feedback immediato loading e pre-analisi IA
            await bot.telegram.editMessageText(globalChatId, msgId, undefined, "👀 *Analyzing garment geometry...*", { parse_mode: "Markdown" });

            // Recupera TUTTE le immagini se è un Media Group
            const { data: files } = await supabase.storage.from('telegram-uploads').list('', { search: actualBasePrefix });
            if (!files || files.length === 0) {
                 await bot.telegram.editMessageText(globalChatId, msgId, undefined, "❌ Impossibile ritrovare l'immagine nel cloud.");
                 return NextResponse.json({ ok: true });
            }
            
            const isOutfit = files.length > 1;
            const publicUrls = files.map(f => supabase.storage.from('telegram-uploads').getPublicUrl(f.name).data.publicUrl);
            const firstPublicUrl = publicUrls[0]; // Usata come fallback/original

            let aiInputParts: any[] = [];
            for (const pUrl of publicUrls) {
                try {
                    const r = await fetch(pUrl);
                    if (r.ok) {
                        const aBuf = await r.arrayBuffer();
                        aiInputParts.push({ inlineData: { data: Buffer.from(aBuf).toString('base64'), mimeType: r.headers.get('content-type') || 'image/jpeg' } });
                    }
                } catch(e) {}
            }

            try {
                if (aiInputParts.length > 0) {
                    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
                    const prompt = `Sei un ispettore IA pre-generazione. Analizza il/i capo/i d'abbigliamento forniti.
L'obiettivo primario è capire la struttura: se ci sono più capi forniti insieme (Outfit), controlla che formino un look sensato. Se invece è fornito un singolo top/maglia tagliato a metà, DEVI OBBLIGATORIAMENTE CHIEDERTI: "sotto c'è una gonna o un pantalone?". 

Se l'immagine è perfettamente chiara (es. vedi tutto il capo intero, oppure sono 2 capi che formano chiaramente un outfit, o se sai con certezza come comportarti), rispondi ESATTAMENTE con questo JSON: {"ask": false}

Se invece c'è un'ambiguità CRITICA, sei OBBLIGATO a fare una domanda.
In questo caso, rispondi con un JSON di questo tipo:
{"ask": true, "question": "La parte inferiore tagliata dalla foto è una gonna o un pantalone?", "options": ["È una gonna", "È un pantalone"]}

REGOLE TASSATIVE:
1. Restituisci SOLO un JSON valido, senza testo fuori.
2. Le "options" devono essere MASSIMO 3.
3. Ogni opzione deve essere BREVISSIMA (massimo 15-20 caratteri), altrimenti i bottoni di Telegram si rompono.`;
                    
                    const result = await ai.models.generateContent({
                       model: "gemini-3.1-flash",
                       contents: [
                          {
                              role: 'user',
                              parts: [ { text: prompt }, ...aiInputParts ]
                          }
                       ]
                    });
                    
                    const answerText = result.text?.trim().replace(/```json/g, "").replace(/```/g, "") || "{}";
                    let parsedAnswer: any = { ask: false };
                    try {
                        parsedAnswer = JSON.parse(answerText);
                    } catch(e) {
                        console.error("Failed to parse dynamic question JSON:", answerText);
                    }

                    if (parsedAnswer.ask && parsedAnswer.options && parsedAnswer.options.length > 0) {
                        const buttons = parsedAnswer.options.map((opt: string) => [
                            // Tronco a 15 caratteri per sicurezza nei callback data
                            Markup.button.callback(opt, `B|${opt.substring(0, 15)}|${subId}|${cbKey}`)
                        ]);
                        
                        await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                            `💡 *L'Intelligenza Artificiale ha bisogno di un chiarimento!*\n\n_${parsedAnswer.question}_`, 
                            { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
                        );
                        return NextResponse.json({ ok: true });
                    }
                }
            } catch(e) {
                console.error("Errore analisi ambiguità flash:", e);
            }

            // Fallback in caso di "SICURO" o errore: passiamo direttamente ai bottoni Quantità
            const isStoryMode = subcat && subcat.name.includes("Story");
            let buttons = [
                [Markup.button.callback("1 Photo ⚡", `Q|1|${subId}|${cbKey}|X`), Markup.button.callback("3 Photos 🔥", `Q|3|${subId}|${cbKey}|X`)],
                isStoryMode 
                    ? [Markup.button.callback("5 Photos 🚀", `Q|5|${subId}|${cbKey}|X`), Markup.button.callback("7 Photos 🎬", `Q|7|${subId}|${cbKey}|X`)]
                    : [Markup.button.callback("5 Photos 🚀", `Q|5|${subId}|${cbKey}|X`)]
            ];

            if (existingUser.paypal_subscription_id?.startsWith("free_trial")) {
                buttons = [
                    [Markup.button.callback("1 Photo ⚡", `Q|1|${subId}|${cbKey}|X`)],
                    isStoryMode 
                        ? [Markup.button.callback("🔒 3 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 5 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 7 Photos (Pro)", `UPSELL`)]
                        : [Markup.button.callback("🔒 3 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 5 Photos (Pro)", `UPSELL`)]
                ];
            }

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                "✨ Perfect. How many photos do you want to generate?", 
                { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
            );
            return NextResponse.json({ ok: true });
            } // Chiude l'else di isMagazine
        }

        // SCELTA GENDER UGC -> CHIEDI QUANTITÀ
        if (action.startsWith('G|')) {
            const parts = action.split('|');
            const gender = parts[1]; // M or W
            const subId = parts[2];
            const cbKey = parts[3];

            const clarification = gender === 'M' ? 'UGC_MAN' : 'X';
            const genderName = gender === 'M' ? 'Man' : 'Woman';
            
            const subcat = await prisma.subcategory.findUnique({ where: { id: subId }});
            const isStoryMode = subcat && subcat.name.includes("Story");
            
            let buttons = [
                [Markup.button.callback("1 Photo ⚡", `Q|1|${subId}|${cbKey}|${clarification}`), Markup.button.callback("3 Photos 🔥", `Q|3|${subId}|${cbKey}|${clarification}`)],
                isStoryMode
                    ? [Markup.button.callback("5 Photos 🚀", `Q|5|${subId}|${cbKey}|${clarification}`), Markup.button.callback("7 Photos 🎬", `Q|7|${subId}|${cbKey}|${clarification}`)]
                    : [Markup.button.callback("5 Photos 🚀", `Q|5|${subId}|${cbKey}|${clarification}`)]
            ];

            if (existingUser.paypal_subscription_id?.startsWith("free_trial")) {
                buttons = [
                    [Markup.button.callback("1 Photo ⚡", `Q|1|${subId}|${cbKey}|${clarification}`)],
                    isStoryMode
                        ? [Markup.button.callback("🔒 3 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 5 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 7 Photos (Pro)", `UPSELL`)]
                        : [Markup.button.callback("🔒 3 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 5 Photos (Pro)", `UPSELL`)]
                ];
            }

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                `✨ Great! A **${genderName.toLowerCase()}**'s UGC shot.\nHow many photos do you want to generate?`, 
                { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
            );
            return NextResponse.json({ ok: true });
        }

        // SCELTA DISAMBIGUAZIONE -> CHIEDI QUANTITÀ
        if (action.startsWith('B|')) {
            const parts = action.split('|');
            const userClarification = parts[1]; // Opzione dinamica scelta
            const subId = parts[2];
            const cbKey = parts[3];

            const subcat = await prisma.subcategory.findUnique({ where: { id: subId }});
            const isStoryMode = subcat && subcat.name.includes("Story");
            
            let buttons = [
                [Markup.button.callback("1 Photo ⚡", `Q|1|${subId}|${cbKey}|${userClarification}`), Markup.button.callback("3 Photos 🔥", `Q|3|${subId}|${cbKey}|${userClarification}`)],
                isStoryMode
                    ? [Markup.button.callback("5 Photos 🚀", `Q|5|${subId}|${cbKey}|${userClarification}`), Markup.button.callback("7 Photos 🎬", `Q|7|${subId}|${cbKey}|${userClarification}`)]
                    : [Markup.button.callback("5 Photos 🚀", `Q|5|${subId}|${cbKey}|${userClarification}`)]
            ];

            if (existingUser.paypal_subscription_id?.startsWith("free_trial")) {
                buttons = [
                    [Markup.button.callback("1 Photo ⚡", `Q|1|${subId}|${cbKey}|${userClarification}`)],
                    isStoryMode
                        ? [Markup.button.callback("🔒 3 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 5 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 7 Photos (Pro)", `UPSELL`)]
                        : [Markup.button.callback("🔒 3 Photos (Pro)", `UPSELL`), Markup.button.callback("🔒 5 Photos (Pro)", `UPSELL`)]
                ];
            }

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, 
                "✨ Great specification. How many photos do you want to generate?", 
                { parse_mode: "Markdown", ...Markup.inlineKeyboard(buttons) }
            );
            return NextResponse.json({ ok: true });
        }

        // SCELTA QUANTITÀ -> AVVIA GENERAZIONE AI
        if (action.startsWith('Q|')) {
            const parts = action.split('|');
            const qty = parseInt(parts[1], 10);
            const subId = parts[2];
            const cbKey = parts[3];
            const userClarification = parts[4] || 'X';
            const actualBasePrefix = getBasePrefix(cbKey);
            const timestamp = Date.now().toString(); // Usato per le foto generate in output

            // Controllo Crediti Clienti
            if (existingUser.role !== 'admin') {
                const remaining = existingUser.images_allowance - existingUser.images_generated;
                if (qty > remaining) {
                    const hostUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.supernexusai.com";
                    if (existingUser.paypal_subscription_id?.startsWith("free_trial")) {
                        const encodedEmail = encodeURIComponent(existingUser.email || "");
                        const upgradeLink = `${hostUrl}/registrazione?email=${encodedEmail}&upgrade=true`;
                        await bot.telegram.editMessageText(
                            globalChatId, 
                            msgId, 
                            undefined, 
                            `💳 **Free Trial Exhausted**\n\nYour 10 free trial images have been used up.\n\n⚡️ **To unlock unlimited possibilities and priority GPU, please subscribe to a Pro Plan:**\n👉 [Click here to Subscribe / Log in](${upgradeLink})\n\n*(Your Secret PIN to bind is: \`${existingUser.bot_pin}\`)*`,
                            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
                        );
                    } else {
                        const encodedEmail = encodeURIComponent(existingUser.email || "");
                        const upgradeLink = `${hostUrl}/registrazione?email=${encodedEmail}&upgrade=true`;
                        await bot.telegram.editMessageText(
                            globalChatId, 
                            msgId, 
                            undefined, 
                            `💳 **Credit Exhausted**\n\nYou requested ${qty} images, but you only have **${remaining}** credits available.\n\n⚡️ **To unlock new generations, purchase a new Pack or subscribe to a Monthly Plan:**\n👉 [Click here to Buy a new Pack](${upgradeLink})\n\n*(Your Secret PIN in case it is requested is: \`${existingUser.bot_pin}\`)*`,
                            { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
                        );
                    }
                    return NextResponse.json({ ok: true });
                }
            }

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, `⚡ *Starting AI Engine (Requested ${qty} images)... Please wait up to 40 seconds!*`, { parse_mode: 'Markdown' });

            // Recupera la Sottocategoria, le sue Impostazioni (Prompt)
            let subcat: any = null;
            let dbCatId = "fake";
            let dbModeId = "fake";
            
            if (subId.startsWith('OUTFIT_')) {
                // Generazione Multi-Immagine Diretta
                const gender = subId.split('_')[1]; // MAN o WOMAN
                const modelStr = gender === 'MAN' ? 'handsome, natural, extremely realistic man' : 'beautiful, natural, extremely realistic woman';
                
                // Recuperiamo una categoria a caso per soddisfare le foreign key del Job
                const randomSub = await prisma.subcategory.findFirst({ include: { business_mode: { include: { category: true } } } });
                dbCatId = randomSub?.business_mode.category_id || "fake";
                dbModeId = randomSub?.business_mode_id || "fake";
                
                subcat = {
                    id: subId,
                    base_prompt_prefix: `Create a breathtaking, ultra-realistic fashion editorial or lifestyle shot featuring a complete OUTFIT COORDINATION. The model is a ${modelStr}. The setting, lighting, and pose must be perfectly adapted to the style of the provided clothes (e.g., streetwear in an urban setting, elegant wear in a luxury or classic setting, sportswear in an athletic setting). MAKE IT LOOK INCREDIBLY REALISTIC AND COHESIVE.`,
                    strict_reference_mode: false,
                    business_context: "Outfit Coordination Fashion Shoot",
                    business_mode: { category_id: dbCatId, category: { name: 'Outfit', slug: 'outfit' }, slug: 'outfit' },
                    business_mode_id: dbModeId,
                    slug: 'outfit',
                    reference_images: []
                };
            } else {
                subcat = await prisma.subcategory.findUnique({
                    where: { id: subId },
                    include: { variations: { orderBy: { sort_order: 'asc' } }, business_mode: { include: { category: true } }, reference_images: { orderBy: { image_order: 'asc' } } }
                });
                dbCatId = subcat?.business_mode.category_id || "fake";
                dbModeId = subcat?.business_mode_id || "fake";
            }

            if (!subcat || !subcat.base_prompt_prefix) {
                await bot.telegram.editMessageText(globalChatId, msgId, undefined, "❌ Generative array not trained for this look. Activate the Vision engine from Admin first.");
                return NextResponse.json({ ok: true });
            }

            // Recupera le immagini per l'Outfit o l'immagine singola
            const { data: files } = await supabase.storage.from('telegram-uploads').list('', { search: actualBasePrefix });
            const publicUrls = files?.map(f => supabase.storage.from('telegram-uploads').getPublicUrl(f.name).data.publicUrl) || [];
            if (publicUrls.length === 0) {
                await bot.telegram.editMessageText(globalChatId, msgId, undefined, "❌ Immagine originale scaduta dal cloud.");
                return NextResponse.json({ ok: true });
            }
            
            const firstPublicUrl = publicUrls[0];
            const isOutfit = publicUrls.length > 1;

            const referenceImages = subcat.reference_images || [];
            let referenceBuffers: { data: string, mimeType: string }[] = [];
            
            if (referenceImages.length > 0) {
                await bot.telegram.editMessageText(globalChatId, msgId, undefined, `🧠 *SuperNexus AI is pre-loading ${referenceImages.length} Visual Inspirations... (please wait)*`, { parse_mode: 'Markdown' });
                for (const ref of referenceImages.slice(0, 10)) {
                     try {
                         const rRes = await fetch(ref.image_url);
                         if(rRes.ok) {
                             const rBuf = await rRes.arrayBuffer();
                             const rB64 = Buffer.from(rBuf).toString('base64');
                             const rMime = rRes.headers.get('content-type') || 'image/jpeg';
                             referenceBuffers.push({ data: rB64, mimeType: rMime });
                         }
                     } catch(e) {}
                }
            }

            await bot.telegram.editMessageText(globalChatId, msgId, undefined, `🧠 *SuperNexus AI is generating ${qty} highly differentiated images... (please hold on ❤️)*`, { parse_mode: 'Markdown' });

            after(async () => {
                
                // Creiamo subitissimo il Job nello storico mettendo lo stato in "pending"
                let pendingJobId: string | null = null;
                try {
                    const newJob = await (prisma as any).generationJob.create({
                        data: {
                            user_id: existingUser.id,
                            category_id: dbCatId,
                            business_mode_id: dbModeId,
                            subcategory_id: subId.startsWith('OUTFIT_') ? (await prisma.subcategory.findFirst())?.id || "fake" : subId,
                            original_product_image_url: firstPublicUrl,
                            status: "pending",
                            total_cost_eur: 0,
                            results_count: 0
                        }
                    });
                    pendingJobId = newJob.id;
                } catch(e) { console.error("Impossibile creare pending job", e); }

                try {
                    // CHIAMATA A GEMINI ================================
                    let base64OutfitParts: any[] = [];
                    for (const url of publicUrls) {
                        try {
                            const res = await fetch(url);
                            if (res.ok) {
                                const ab = await res.arrayBuffer();
                                base64OutfitParts.push({
                                    inlineData: { data: Buffer.from(ab).toString('base64'), mimeType: res.headers.get('content-type') || 'image/jpeg' }
                                });
                            }
                        } catch(e) {}
                    }
                    if (base64OutfitParts.length === 0) throw new Error("Impossibile scaricare le immagini input.");

                    // Prompt Master (Istruzione di Stile Pre-calcolata + Contesto)
                    const basePrompt = subcat.base_prompt_prefix;
                    const bContext = subcat.business_context ? `\n[BUSINESS CONTEXT: ${subcat.business_context}]` : "";
                    const mStyle = subcat.style_type ? `\n[STYLE TYPE: ${subcat.style_type}]` : "";
                    const oGoal = subcat.output_goal ? `\n[OUTPUT GOAL: ${subcat.output_goal}]` : "";
                    const masterStyle = `${bContext}${mStyle}${oGoal}\n${basePrompt}`.trim();

                    // Richiesta Operativa Estrema per "Virtual Try-On" Rigoroso
                    const userPrompt = `[CLINICAL VIRTUAL TRY-ON OPERATION] 
L'immagine allegata NON È UNA ISPIRAZIONE, è il SOGGETTO DEL RITRATTO (${subcat.business_mode.category.name}). 
Devi vestire un modello o adattare l'ambiente a questa precisa veste nello STILE richiesto:

[STILE RICHIESTO]: ${masterStyle}

REGOLE ASSOLUTE E INVIOLABILI PER PRESERVARE L'ABITO:
1. PRESERVAZIONE STRUTTURALE AL 100%: E' SEVERAMENTE VIETATO modificare o immaginare diversamente la scollatura, le cuciture, i dettagli, la lunghezza dell'abito o delle maniche, cinture e bottoni. Il capo deve essere perfettamente identico.
2. PRESERVAZIONE MATERIALE AL 100%: Il colore ESATTO, il tipo di tessuto (seta, lana, cotone pesante, ecc) e la texturizzazione visiva devono essere identici all'originale. Non aggiungere pizzi, stampe, o increspature che non esistono nella foto.
3. ADATTAMENTO CORPOREO E VOLTI: Se lo stile richiede una modella/o, la persona DEVE avere un VISO e OCCHI A FUOCO, NITIDI. 
4. RIMOZIONE CARTELLINI: Se l'immagine originale contiene un cartellino del negozio, etichette o talloncini con il prezzo appesi al capo d'abbigliamento, essi DEVONO essere categoricamente ignorati ed eliminati nell'immagine generata.
5. FOCUS SUL CAPO ORIGINALE (NO EXTRA LAYERS): Se l'immagine in input ritrae un abito da donna, una t-shirt, top o altro indumento, E' ASSOLUTAMENTE VIETATO aggiungere o coprirlo parzialmente con cappotti, giacche, felpe, maglie o scialli non presenti nella foto originale. L'indumento inserito dal cliente deve essere esaltato e mostrato per intero senza coperture spurie.
6. VARIETA' (Batch): Genera pose naturali e diverse tra loro ispirate al dataset fotografico dello Stile.
7. NO ATTREZZATURA: È ASSOLUTAMENTE VIETATO includere luci da set, softbox, cavalletti, macchine fotografiche o ring light nell'immagine. L'ambiente deve essere puro e senza backstage visibile.
${userClarification === 'UGC_MAN' ? `8. CLARIFICATION FROM THE USER: The user has explicitly requested a MALE model for this shot. YOU MUST STRICTLY USE A HANDSOME 20-25 YEAR OLD BOY. ABSOLUTELY NO FEMALE MODELS. You MUST adapt the fit of the t-shirt to a male body.` : (userClarification !== 'X' ? `8. CLARIFICATION FROM THE USER: The user was asked a question about the garment and explicitly responded with: "${userClarification}". YOU MUST STRICTLY RESPECT THIS INFORMATION AND BUILD THE IMAGE ACCORDINGLY.` : '')}
${isOutfit ? `9. CRITICAL OUTFIT COORDINATION: The user has provided MULTIPLE reference images for this job. YOU MUST COMBINE THEM! Do not generate them separately. Dress the model or arrange the scene with ALL the provided items simultaneously, creating a perfectly coordinated outfit.` : ''}`;

                    const activeModelSetting = await (prisma as any).setting.findUnique({ where: { key: 'ACTIVE_GENERATION_MODEL' }});
                    const generationModel = subcat.active_model || activeModelSetting?.value || 'gemini-3.1-flash-image-preview';
                    
                    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
                    let generatedBase64s: string[] = [];
                    const promises = [];

                    const poseModifiers = [
                        "walking confidently towards the camera with dynamic movement",
                        "standing straight with a high-fashion editorial pose",
                        "looking slightly away gracefully, elegant side profile posture",
                        "relaxed but confident posture, subtle and natural demeanor",
                        "in mid-motion, dynamic atmospheric fashion model pose"
                    ];

                    const lightingModifiers = [
                        "Golden hour sunset lighting, warm tones, beautiful edge rim light",
                        "Moody overcast weather, soft diffused editorial light, cinematic feel",
                        "High-contrast dramatic lighting, deep shadows, striking visual impact",
                        "Bright crisp daylight, sharp distinct shadows, vibrant atmosphere",
                        "Ethereal soft lighting, gentle shadows, highly aesthetic photography"
                    ];

                    const shuffledPoses = poseModifiers.sort(() => Math.random() - 0.5);
                    const shuffledLighting = lightingModifiers.sort(() => Math.random() - 0.5);

                    // --- INJECTION MAGIC SCENE E BACKUP SETTINGS ---
                    let varianceEnabled = false;
                    let backupOutputsEnabled = false;
                    try {
                        const varianceSetting = await (prisma as any).setting.findUnique({ where: { key: 'AI_SCENE_VARIANCE_ENABLED' }});
                        varianceEnabled = varianceSetting?.value === 'true';
                        
                        const backupSetting = await (prisma as any).setting.findUnique({ where: { key: 'SAVE_GENERATION_OUTPUTS_ENABLED' }});
                        backupOutputsEnabled = backupSetting?.value !== 'false'; // default true
                    } catch(e) {}

                    for (let i = 0; i < qty; i++) {
                        const currentPose = shuffledPoses[i % shuffledPoses.length];
                        let currentLighting = shuffledLighting[i % shuffledLighting.length];

                        let variantPrompt = "";
                        let aiParts = [];
                        
                        let currentRefInline = null;
                        if (referenceBuffers.length > 0) {
                            currentRefInline = referenceBuffers[i % referenceBuffers.length];
                        }
                        
                        // Strict vs Dynamic Branching
                        if (subcat.strict_reference_mode) {
                            variantPrompt = userPrompt + `\n\n[STRICT REFERENCE CLONE MODE ACTIVATED: Generazione nr. ${i+1}.\nATTENTION: Because Strict Mode is ON, you MUST absolutely CLONE the exact POSTURE, CAMERA ANGLE, LIGHTING, and SCENE from the INSPIRATION image provided. Do NOT invent random poses. Do NOT change the background structure from the reference. The output MUST visually map 1:1 to the Inspiration image, except for the Garment which is swapped.]`;
                            
                            if (isOutfit) {
                                aiParts.push({ text: "SUBJECT GARMENTS TO OUTFIT COORDINATE (Use ALL items together in the same image):" });
                                aiParts.push(...base64OutfitParts);
                            } else {
                                aiParts.push({ text: "SUBJECT GARMENT TO STRICTLY CLONE (Do NOT change details on this specific item):" });
                                aiParts.push(...base64OutfitParts);
                            }
                            
                            if (currentRefInline) {
                                aiParts.push({ text: "[MANDATORY CLONE DIRECTIVE]: CRITICAL INSPIRATION. YOU MUST EMULATE THE SHOT ANGLE, LIGHTING, AND BODY POSITION OF THIS EXACT IMAGE:" });
                                aiParts.push({ inlineData: currentRefInline });
                            }
                            aiParts.push({ text: variantPrompt });
                        } else {
                            if (varianceEnabled) {
                                const magicalScene = getRandomSceneForSubcategory(subcat.business_mode.category.slug + " " + subcat.business_mode.slug + " " + subcat.slug);
                                currentLighting += magicalScene;
                            }
                            
                            variantPrompt = userPrompt + `\n\n[SEED/VARIANTE: Generazione nr. ${i+1}.\nPOSE SUGGESTION: ${currentPose}\nLIGHTING/SCENE SUGGESTION: ${currentLighting}\nForza questi disturbi. Mantieni il VISO PERFETTAMENTE A FUOCO e USA un NEGATIVE PROMPT SERVER SIDE per sfavorire: "(plastic skin:1.5), perfect symmetry, heavily airbrushed, fake AI look".]`;
                            
                            if (isOutfit) {
                                aiParts.push({ text: "SUBJECT GARMENTS TO OUTFIT COORDINATE (Use ALL items together in the same image):" });
                                aiParts.push(...base64OutfitParts);
                            } else {
                                aiParts.push({ text: "SUBJECT GARMENT TO STRICTLY CLONE (Do NOT change details on this specific item):" });
                                aiParts.push(...base64OutfitParts);
                            }

                            if (currentRefInline) {
                                aiParts.push({ text: "INSPIRATION / MOODBOARD PHOTOGRAPHY (Use ONLY for lighting, pose, and background aesthetic. DO NOT copy the clothes from this image):" });
                                aiParts.push({ inlineData: currentRefInline });
                            }
                            aiParts.push({ text: variantPrompt });
                        }

                        promises.push(
                            (async () => {
                                // Sfasa le chiamate di 12 secondi per evitare i 429 di Google
                                await new Promise(r => setTimeout(r, i * 12000));
                                
                                let attempt = 0;
                                let success = false;
                                let retryResult: any = null;

                                while (!success && attempt < 3) {
                                    attempt++;
                                    try {
                                        retryResult = await ai.models.generateContent({
                                            model: generationModel,
                                            contents: [
                                                {
                                                    role: 'user',
                                                    parts: aiParts
                                                }
                                            ],
                                            config: {
                                                // @ts-ignore
                                                imageConfig: { aspectRatio: "3:4" }
                                            }
                                        });
                                        success = true;
                                    } catch (err: any) {
                                        console.error(`Tentativo ${attempt} Telegram fallito (Scena ${i+1}):`, err?.message);
                                        if (attempt >= 3) throw err;
                                        await new Promise(r => setTimeout(r, 6000)); // Retry backoff
                                    }
                                }
                                return retryResult;
                            })()
                        );
                }

                const responses = await Promise.allSettled(promises);
                let totalTokensIn = 0;
                let totalTokensOut = 0;

                for (const outcome of responses) {
                    if (outcome.status === 'fulfilled') {
                        const result = outcome.value;
                        if (result?.usageMetadata) {
                            totalTokensIn += result.usageMetadata.promptTokenCount || 0;
                            totalTokensOut += result.usageMetadata.candidatesTokenCount || 0;
                        }
                        if (result?.candidates && result.candidates.length > 0) {
                            for (const candidate of result.candidates) {
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
                        console.error('Una delle generazioni multiple ha fallito definitivamente:', outcome.reason);
                    }
                }

                let jobCost = 0;
                if (totalTokensIn > 0 || totalTokensOut > 0) {
                    jobCost = await logApiCost("telegram_generation", generationModel, totalTokensIn, totalTokensOut, existingUser.id, generatedBase64s.length);
                }

                if (generatedBase64s.length === 0) {
                     throw new Error("All API calls failed. Please try again with a smaller amount.");
                }

                const { Input } = require('telegraf');
                
                // BACKUP CLOUD DEGLI OUTPUT O OPZIONE DISABILITATA
                let outputUrls: {url: string, path: string}[] = [];
                
                if (backupOutputsEnabled) {
                    const uploadPromises = generatedBase64s.map(async (b64, idx) => {
                        const buffer = Buffer.from(b64, 'base64');
                        const oFileName = `${globalChatId}_out_${timestamp}_${idx}.jpg`;
                        const { error: upErr } = await supabase.storage.from('telegram-outputs').upload(oFileName, buffer, {
                            contentType: 'image/jpeg',
                            upsert: true
                        });
                        
                        if (!upErr) {
                            const { data: { publicUrl } } = supabase.storage.from('telegram-outputs').getPublicUrl(oFileName);
                            return { url: publicUrl, path: oFileName };
                        } else {
                            console.error("[CLOUD] Errore upload output su Supabase:", upErr);
                            return null;
                        }
                    });

                    const uploadResults = await Promise.all(uploadPromises);
                    outputUrls = uploadResults.filter((res): res is {url: string, path: string} => res !== null);
                }

                // INOLTRO A TELEGRAM
                const mediaGroup = generatedBase64s.map((b64, idx) => ({
                    type: 'photo' as const,
                    media: Input.fromBuffer(Buffer.from(b64, 'base64'), `generated_${timestamp}_${idx}.jpg`)
                }));

                const totalGenAfterThis = existingUser.images_generated + generatedBase64s.length;
                const baseAllowance = existingUser.base_allowance;
                const extraCreditsOwned = Math.max(0, existingUser.images_allowance - baseAllowance);

                const remainingMonthly = Math.max(0, baseAllowance - totalGenAfterThis);
                const extraCreditsConsumed = Math.max(0, totalGenAfterThis - baseAllowance);
                const remainingExtra = Math.max(0, extraCreditsOwned - extraCreditsConsumed);

                const publicGalleryUrl = pendingJobId ? `https://www.supernexusai.com/gallery/${pendingJobId}` : "";
                const marketingText = publicGalleryUrl ? `\n\n---\n**SHARE WITH CLIENTS:**\n\nHey 👋\nQuick one — I created some ready-to-use product images for your store using our AI.\n\nThey’re designed to:\n✔ look more premium\n✔ increase engagement\n✔ boost conversions\n\nYou can use them for free.\n\nSee how it works:\n👉 ${publicGalleryUrl}\n\nHappy to generate more for your products.\n---` : "";
                
                const completeMsg = `✅ **Generation Complete!**\n\nHere are the photographs of the clothing item in the requested style:\n_You have **${remainingMonthly}** images left from your monthly plan and **${remainingExtra}** images from extra credits._${marketingText}`;

                // Se ci sono più di 1 foto inviamo un album
                if (mediaGroup.length > 1) {
                     // Taglio l'array al limite max di 10 di MediaGroup
                     await bot.telegram.sendMediaGroup(globalChatId, mediaGroup.slice(0, 10));
                     await bot.telegram.sendMessage(globalChatId, completeMsg, { parse_mode: 'Markdown' });
                } else {
                     await bot.telegram.sendPhoto(globalChatId, mediaGroup[0].media, {
                         caption: completeMsg,
                         parse_mode: 'Markdown'
                     });
                }

                // Gestione Consumo Plafond Clienti
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { images_generated: { increment: generatedBase64s.length } }
                });

                const imagesToCreate = outputUrls.map((out, idx) => ({
                    image_url: out.url,
                    storage_path: out.path,
                    image_order: idx
                }));

                if (pendingJobId) {
                    await (prisma as any).generationJob.update({
                        where: { id: pendingJobId },
                        data: {
                            status: "completed",
                            total_cost_eur: jobCost,
                            results_count: generatedBase64s.length,
                            provider_response: `Album of ${generatedBase64s.length} Base64 photos`,
                            images: {
                                create: imagesToCreate
                            }
                        }
                    });
                } else {
                    await (prisma as any).generationJob.create({
                        data: {
                            user_id: existingUser.id,
                            category_id: dbCatId,
                            business_mode_id: dbModeId,
                            subcategory_id: subId.startsWith('OUTFIT_') ? (await prisma.subcategory.findFirst())?.id || "fake" : subId,
                            original_product_image_url: firstPublicUrl,
                            status: "completed",
                            total_cost_eur: jobCost,
                            results_count: generatedBase64s.length,
                            provider_response: `Album of ${generatedBase64s.length} Base64 photos`,
                            images: {
                                create: imagesToCreate
                            }
                        }
                    });
                }

            } catch (error: any) {
                console.error("AI Generation Error", error);
                
                if (pendingJobId) {
                    try {
                        await (prisma as any).generationJob.update({
                            where: { id: pendingJobId },
                            data: {
                                status: "failed",
                                error_message: error.message,
                                provider_response: `Generation failed: ${error.message}`
                            }
                        });
                    } catch(e) {}
                }

                await bot.telegram.sendMessage(globalChatId, `❌ **Generation Error**: ${error.message}`);
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
