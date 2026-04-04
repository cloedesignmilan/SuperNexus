import { exec } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const store = await prisma.store.findFirst({ where: { slug: 'magazzini-emilio' } });
    if (!store || !store.telegram_bot_token) {
        console.error("Token non trovato per Magazzini Emilio!");
        process.exit(1);
    }

    console.log("Localtunnel in avvio...");
    const lt = exec('npx localtunnel --port 3000');
    
    lt.stdout?.on('data', async (data) => {
        const output = data.toString();
        // console.log(output);
        if (output.includes('your url is:')) {
            const url = output.split('your url is:')[1].trim();
            console.log(`URL Localtunnel: ${url}`);
            
            const webhookUrl = `${url}/api/telegram/webhook?storeSlug=magazzini-emilio`;
            
            // global fetch is available in Node 18+
            const tgRes = await fetch(`https://api.telegram.org/bot${store.telegram_bot_token}/setWebhook?url=${webhookUrl}`);
            const tgJson = await tgRes.json();
            console.log("Risposta Telegram:", tgJson);
            console.log("--- TERMINATO. In attesa di chiamate Webhook ---");
        }
    });
}
main();
