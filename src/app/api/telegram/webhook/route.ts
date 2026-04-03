import { NextRequest, NextResponse } from "next/server";
import { Telegraf } from "telegraf";
// import { prisma } from "@/lib/prisma"; // Lo useremo non appena il DB sarà pronto

// Inizializza il bot con il token
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Gestione semplice del comando /start
    if (update.message?.text === "/start") {
      await bot.telegram.sendMessage(
        update.message.chat.id,
        "👋 Ciao! Sono l'assistente AI di MAGAZZINI EMILIO.\n\nInvia la foto di un abito e io genererò 10 immagini ambientate professionali (Davanti allo specchio, matrimonio, serata...).",
        { parse_mode: "HTML" }
      );
      return NextResponse.json({ ok: true });
    }

    // Gestione del caricamento immagine
    if (update.message?.photo) {
      const chatId = update.message.chat.id;
      
      // Manda risposta immediata per evitare timeout di Telegram
      await bot.telegram.sendMessage(
        chatId,
        "✅ Immagine ricevuta. Sto creando 10 versioni per MAGAZZINI EMILIO...\n\n<i>Questa operazione potrebbe richiedere 1 o 2 minuti.</i>",
        { parse_mode: "HTML" }
      );

      const fileId = update.message.photo[update.message.photo.length - 1].file_id;
      const fileUrlData = await bot.telegram.getFileLink(fileId);
      const fileUrl = fileUrlData.toString();

      // Creazione job in DB. Assumiamo che prisma sia instanziato nel webhook o fatto nel background.
      // Esemplificativo! Chiamiamo l'endpoint generativo interno e NON lo "awaitiamo", così Telegram riceve "{ok:true}" subito.
      const appUrl = process.env.APP_BASE_URL || "http://localhost:3000";
      
      const backgroundJobData = {
          fileUrl,
          chatId,
          jobId: "temp_" + Date.now() // Nel MVP farà affidamento al modulo generate per il DB, ma meglio crearlo qui
      };

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
