import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    let offset = 0;
    let oldToken = "";
    console.log("🟢 In ascolto dei messaggi Telegram via Polling Diretto (Auto-Updating)...");

    while (true) {
        try {
            const store = await prisma.store.findFirst({ where: { slug: 'magazzini-emilio' } });
            
            if (store && store.telegram_bot_token) {
                const token = store.telegram_bot_token;
                
                if (token !== oldToken) {
                    console.log("Nuovo token rilevato! Reset webhook...");
                    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
                    oldToken = token;
                }

                const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=5`);
                const data = await res.json();
                
                if (data.ok && data.result.length > 0) {
                    for (const update of data.result) {
                        offset = update.update_id + 1; // Aggiorna l'offset
                        
                        console.log(`Messaggio ricevuto! Inoltro a Next.js (Update ID: ${update.update_id})...`);
                        
                        await fetch("http://localhost:3000/api/telegram/webhook?storeSlug=magazzini-emilio", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(update)
                        });
                    }
                }
            } else {
                console.log("Token non trovato in DB. In attesa...");
            }
        } catch (e) {
            console.error("Errore di rete polling:", e.message);
        }
        await delay(1000);
    }
}
main();
