import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, website, garmentType, aesthetic, modelCount } = body;

    if (!name || !company || !email || !garmentType || !aesthetic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '142646452'; // default or fallback, the user must configure it

    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN missing");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const bot = new Telegraf(botToken);

    const message = `
🌟 <b>NUOVA RICHIESTA PREVENTIVO (Modelli Custom)</b> 🌟

<b>Cliente:</b> ${name}
<b>Azienda/Brand:</b> ${company}
<b>Email:</b> ${email}
<b>Website/IG:</b> ${website || 'Non specificato'}

👕 <b>Cosa Vende:</b>
${garmentType}

🎨 <b>Estetica Desiderata:</b>
${aesthetic}

📦 <b>Numero Modelli (Categorie) richiesti:</b> ${modelCount}

<i>Contatta il cliente via email il prima possibile per fissare una call o inviare il preventivo.</i>
`;

    if (process.env.TELEGRAM_ADMIN_CHAT_ID) {
      await bot.telegram.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, message, { parse_mode: 'HTML' });
    } else {
       console.log("Mock sending telegram message because TELEGRAM_ADMIN_CHAT_ID is missing: ", message);
       // We still return success to the frontend if they haven't configured the admin chat ID yet, 
       // but we log it to the console so it's not lost.
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending quote request:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
