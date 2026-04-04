import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const store = await prisma.store.findFirst({ where: { slug: 'magazzini-emilio' } });
    if (!store || !store.telegram_bot_token) {
        console.error("Token non trovato per Magazzini Emilio!");
        process.exit(1);
    }

    console.log("Pinggy in avvio...");
    const p = spawn('ssh', ['-p', '443', '-R0:localhost:3000', 'a.pinggy.io', '-o', 'StrictHostKeyChecking=no']);
    
    let urlFound = false;

    const findUrl = async (data: any) => {
        const output = data.toString();
        // Look for something like https://rnfve-93-41-155-253.a.free.pinggy.link
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.a\.free\.pinggy\.link/);
        if (match && !urlFound) {
            urlFound = true;
            const url = match[0];
            console.log(`URL Pinggy: ${url}`);
            
            const webhookUrl = `${url}/api/telegram/webhook?storeSlug=magazzini-emilio`;
            
            const tgRes = await fetch(`https://api.telegram.org/bot${store.telegram_bot_token}/setWebhook?url=${webhookUrl}`);
            const tgJson = await tgRes.json();
            console.log("Risposta Telegram:", tgJson);
            console.log("--- PINGGY READY --- PROVA IL BOT ORA!");
        }
    };

    p.stdout.on('data', findUrl);
    p.stderr.on('data', findUrl);
}
main();
