import { NextRequest, NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const storeSlug = req.nextUrl.searchParams.get('storeSlug');
    let botToken = process.env.TELEGRAM_BOT_TOKEN as string;
    let currentStore = null;

    if (storeSlug) {
      currentStore = await prisma.store.findUnique({ where: { slug: storeSlug } });
      if (currentStore && currentStore.telegram_bot_token) {
        botToken = currentStore.telegram_bot_token;
      }
    } else {
       // Retrocompatibilità
       currentStore = await prisma.store.findUnique({ where: { slug: 'magazzini-emilio' } });
    }

    if (!currentStore) {
      return NextResponse.json({ error: "Negozio non riconosciuto" }, { status: 404 });
    }

    if (!currentStore.is_active) {
       console.log(`[SaaS Blocker] Tentativo accesso a store sospeso: ${currentStore.name}`);
       const bot = new Telegraf(botToken);
       const update = await req.json();
       const chatId = update.message?.chat?.id;
       if (chatId) {
           await bot.telegram.sendMessage(
              chatId,
              `🛑 <b>Abbonamento Sospeso</b>\n\nAttenzione: La licenza per l'Intelligenza Artificiale della Boutique <b>${currentStore.name}</b> risulta attualmente sospesa o scaduta.\nContattare l'amministratore del sistema.`,
              { parse_mode: "HTML" }
           );
       }
       return NextResponse.json({ ok: true });
    }

    const bot = new Telegraf(botToken);
    const update = await req.json();

    // Controllo ID Chat (Whitelist Dinamica via Database)
    const chatId = update.message?.chat?.id;
    
    if (chatId) {
      const userStr = chatId.toString();
      
      // Controllo sul db se l'utente è autorizzato
      const user = await prisma.user.findUnique({
          where: { telegram_id: userStr }
      });

      if (!user) {
         // L'utente non si è mai fatto riconoscere. Ha inserito la password corretta in questo messaggio?
         const secretWord = currentStore.password;
         
         if (secretWord && update.message?.text === secretWord) {
             // Inserisce nel DB e sblocca per sempre, associandolo al negozio corrispondente a questo BOT!
             await prisma.user.create({
                 data: { telegram_id: userStr, role: "user", store_id: currentStore.id }
             });
             
             await bot.telegram.sendMessage(
                chatId,
                `✅ <b>Accesso Sbloccato con Successo!</b>\n\nBenvenuto nell'assistente AI dedicato a <b>${currentStore.name}</b>.\nInvia la prima foto del capo che desideri scattare!`,
                { parse_mode: "HTML" }
             );
             return NextResponse.json({ ok: true });
         } else {
             // Sbagliato o nessuna password inserita
             await bot.telegram.sendMessage(
                chatId,
                `⛔️ <b>Sicurezza SuperNexus</b>\nNon sei ancora stato autorizzato a generare immagini per la boutique <b>${currentStore.name}</b>.\n\nPer abilitare questo dispositivo in modo permanente, <b>invia la Password del Portale</b> di questo negozio rispondendo a questo messaggio.`,
                { parse_mode: "HTML" }
             );
             return NextResponse.json({ ok: true });
         }
      } else {
         // Controllo Extra SaaS: Verifica che l'utente stia messaggiando col BOT del SUO negozio e non di un altro in licenza
         if (user.store_id !== currentStore.id) {
             await bot.telegram.sendMessage(
                chatId,
                `⚠️ <b>Errore di Licenza</b>\nIl tuo utente appartiene a un altro Negozio. Non puoi usare il Bot privato di ${currentStore.name}.`,
                { parse_mode: "HTML" }
             );
             return NextResponse.json({ ok: true });
         }
      }
    }

    // Gestione semplice del comando /start
    if (update.message?.text === "/start") {
      await bot.telegram.sendMessage(
        update.message.chat.id,
        "👋 Ciao! Sono l'assistente AI di MAGAZZINI EMILIO.\n\nInvia la foto di un abito e io genererò immagini ambientate e professionali per il catalogo.",
        { parse_mode: "HTML" }
      );
      return NextResponse.json({ ok: true });
    }

    // Gestione del caricamento immagine
    const incomingPhoto = update.message?.photo;
    const incomingDoc = update.message?.document;
    
    if (incomingPhoto || incomingDoc) {
      // Manda risposta immediata per evitare timeout di Telegram
      await bot.telegram.sendMessage(
        chatId,
        "✅ Immagine ricevuta. Sto creando 10 versioni...\n\n<i>Questa operazione richiede fino a 60 secondi, attendi...</i>",
        { parse_mode: "HTML" }
      );

      let fileId;
      if (incomingPhoto) {
          fileId = incomingPhoto[incomingPhoto.length - 1].file_id;
      } else {
          fileId = incomingDoc.file_id;
      }
      
      const fileUrlData = await bot.telegram.getFileLink(fileId);
      const fileUrl = fileUrlData.toString();

      // Chiamiamo l'endpoint generativo interno usando l'host dinamico
      const appUrl = req.nextUrl.origin;
      
      const backgroundJobData = {
          fileUrl,
          chatId,
          storeId: currentStore.id, // SAAS: Passiamo al job il proprietario del file!
          jobId: "temp_" + Date.now() 
      };

      // Non mettiamo awati altrimenti blocchiamo il polling per tutto il tempo della generazione
      fetch(`${appUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backgroundJobData),
      }).catch(err => console.error("Errore fetch generate in background:", err));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Errore Webhook Telegram:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
