import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { githubUrl } = body;

        if (!githubUrl || !githubUrl.includes('http')) {
            return NextResponse.json({ error: 'URL mancante o non valido.' }, { status: 400 });
        }

        // 1. Fetch raw code from GitHub
        const codeRes = await fetch(githubUrl);
        if (!codeRes.ok) {
            throw new Error(`Impossibile scaricare dall'URL GitHub fornito (Status: ${codeRes.status}). Assicurati di usare il link Raw.`);
        }
        const rawCode = await codeRes.text();

        // 2. Inizializza Gemini per estrazione JSON
        const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_AI_STUDIO_API_KEY mancante nel file .env");
        }
        const ai = new GoogleGenAI({ apiKey });

        const extractionPrompt = `Sei un estrattore Dati specializzato in codice TypeScript/React. 
Analizza il seguente codice sorgente di un generatore AI. 
Devi trovare le logiche di generazione immagini (spesso salvate in costanti o variabili come prompt, scenes, ecc).

REGOLE DI ESTRAZIONE E TRADUZIONE:
1. Trova il nome del progetto/categoria (es. dalle costanti o dal nome dell'app) e salvalo come "categoryName" (es: "Sposo", "Orologi di Lusso").
2. Trova il PROMPT BASE/MASTER (solitamente la prima parte lunga del prompt che descrive le istruzioni rigide) e salvalo integro in inglese sotto "masterPrompt".
3. Trova le REGOLE NEGATIVE (es. "No text, no watermarks...") e salvalo integro in inglese sotto "negativeRules". Se non c'è, stringa vuota.
4. Trova l'array di Scene (spesso sono array di stringhe in inglese). Per OGNUNA, traduci il nome concettuale in Italiano ("titleIt") e mantieni il prompt originale in Inglese ("promptEn").
5. Rispondi UNICAMENTE con un oggetto JSON valido in questo esatto schema:
{
  "categoryName": "String",
  "masterPrompt": "String",
  "negativeRules": "String",
  "scenes": [
    { "titleIt": "String", "promptEn": "String" }
  ]
}

CODICE SORGENTE DA ANALIZZARE:
\`\`\`typescript
${rawCode}
\`\`\`
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: extractionPrompt }],
            config: {
                responseMimeType: "application/json"
            }
        });

        const rawJsonText = response.text || "{}";
        let parsedData;
        try {
            parsedData = JSON.parse(rawJsonText);
        } catch (e) {
             throw new Error("L'intelligenza artificiale non ha restituito un JSON valido. " + rawJsonText);
        }

        if (!parsedData.categoryName || !parsedData.masterPrompt || !parsedData.scenes) {
             throw new Error("Dati estratti incompleti: " + JSON.stringify(parsedData));
        }

        // 3. Salvataggio nel Database Prisma della Nuova Architettura
        const catName = `${parsedData.categoryName} (GitHub Import)`;
        
        let category = await (prisma as any).category.create({
            data: {
                name: catName,
                description: "Importato automaticamente via AI",
                is_active: true,
                sort_order: 99
            }
        });

        await (prisma as any).promptMaster.create({
            data: {
                category_id: category.id,
                title: "Prompt Ufficiale Esternalizzato",
                prompt_text: parsedData.masterPrompt,
                negative_rules: parsedData.negativeRules || ""
            }
        });

        for (let i = 0; i < parsedData.scenes.length; i++) {
            const scn = parsedData.scenes[i];
            await (prisma as any).scene.create({
                data: {
                    category_id: category.id,
                    title: scn.titleIt,
                    scene_text: scn.promptEn,
                    sort_order: i,
                    is_active: true
                }
            });
        }

        return NextResponse.json({ 
            success: true, 
            categoryName: catName,
            scenesCount: parsedData.scenes.length
        });

    } catch (error: any) {
        console.error("Errore Importazione GitHub API:", error);
        return NextResponse.json({ error: error.message || 'Errore tecnico server' }, { status: 500 });
    }
}
