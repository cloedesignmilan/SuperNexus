const fs = require('fs');
const env = fs.readFileSync('/Users/cristiancalcagnile/gemini/APP ABITI/.env', 'utf-8');
const keyMatch = env.match(/GOOGLE_AI_STUDIO_API_KEY=(.+)/);
if (keyMatch) process.env.GOOGLE_AI_STUDIO_API_KEY = keyMatch[1];

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

const urls = [
  "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SWIMWEAR-CLEAN%20CATALOG-NO%20MODEL-1_1778401260703.jpg",
  "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SWIMWEAR-CLEAN%20CATALOG-NO%20MODEL-2_1778332275243.jpg",
  "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SWIMWEAR-CLEAN%20CATALOG-NO%20MODEL-3_1778337141559.jpg",
  "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SWIMWEAR-CLEAN%20CATALOG-NO%20MODEL-4_1778337141559.jpg",
  "https://dywxfndkqpzkmwqntiyq.supabase.co/storage/v1/object/public/telegram-outputs/SWIMWEAR-CLEAN%20CATALOG-NO%20MODEL-5_1778337141559.jpg"
];

async function main() {
  for (let i = 0; i < urls.length; i++) {
    console.log(`\n--- Analizzando scatto ${i + 1} ---`);
    const res = await fetch(urls[i]);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const prompt = `Analizza questa immagine commerciale di swimwear. 
Descrivi la scena esatta, lo sfondo (materiali come sabbia, pietra, legno) e la disposizione.
Poi scrivi 3 campi:
shotName: (breve nome inglese)
positivePrompt: (prompt dettagliato che inizi con "A single {color} {product}..." adatto a replicare questo esatto scatto)
hardRules: (regole rigide per mantenere questa specifica estetica e impedire modelli umani)`;

    const generated = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    { inlineData: { data: buffer.toString("base64"), mimeType: "image/jpeg" } }
                ]
            }
        ]
    });
    
    console.log("shotName: Shot " + (i+1)); console.log(generated.text.substring(0, 800));;
  }
}

main().catch(console.error);
