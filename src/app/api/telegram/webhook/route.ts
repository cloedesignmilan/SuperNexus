import { NextRequest, NextResponse } from "next/server";
import { Telegraf } from "telegraf";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Inizializza il bot con il token (spostato qui per Vercel build)
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

  try {
    const update = await req.json();

    // Controllo ID Chat (Whitelist di Sicurezza)
    const chatId = update.message?.chat?.id;
    
    if (chatId) {
      const authorizedUsers = process.env.AUTHORIZED_TELEGRAM_USERS;
      if (authorizedUsers && !authorizedUsers.includes(chatId.toString())) {
        await bot.telegram.sendMessage(
          chatId,
          `⛔️ <b>Accesso Negato</b>\nNon sei autorizzato a generare immagini per i Magazzini Emilio.\n\n<i>(Se sei l'Amministratore, aggiungi il numero <code>${chatId}</code> alle chiavi Vercel sotto il nome <b>AUTHORIZED_TELEGRAM_USERS</b>)</i>.`,
          { parse_mode: "HTML" }
        );
        return NextResponse.json({ ok: true });
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
    if (update.message?.photo) {
      // Manda risposta immediata per evitare timeout di Telegram
      // Manda risposta immediata per evitare timeout di Telegram
      await bot.telegram.sendMessage(
        chatId,
        "✅ Immagine ricevuta. Sto creando 10 versioni per MAGAZZINI EMILIO...\n\n<i>Questa operazione potrebbe richiedere 1 o 2 minuti.</i>",
        { parse_mode: "HTML" }
      );

      const fileId = update.message.photo[update.message.photo.length - 1].file_id;
      const fileUrlData = await bot.telegram.getFileLink(fileId);
      const fileUrl = fileUrlData.toString();

      // Chiamiamo l'endpoint generativo interno usando l'host dinamico
      const appUrl = req.nextUrl.origin;
      
      const backgroundJobData = {
          fileUrl,
          chatId,
          jobId: "temp_" + Date.now() // Nel MVP farà affidamento al modulo generate per il DB, ma meglio crearlo qui
      };

      await fetch(`${appUrl}/api/generate`, {
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
