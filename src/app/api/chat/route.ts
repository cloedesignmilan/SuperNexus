import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `Sei l'assistente virtuale del servizio SuperNexus AI. 
Il tuo obiettivo è rispondere alle domande dei visitatori sulla piattaforma, con un tono cortese, professionale e focalizzato alle vendite nel settore retail (B2B). I tuoi clienti sono titolari di boutique, e-commerce fashion, negozi di abbigliamento.

Ecco le informazioni chiave sul servizio:
- SuperNexus trasforma foto amatoriali in scatti editoriali e foto a modelli professionali in circa 30 secondi.
- Nessuna app da installare, tutto funziona tramite un bot di Telegram dedicato.
- Piani tariffari:
  1. STARTER: 29€/mese. 50 generazioni/mese.
  2. RETAIL: 79€/mese. 300 generazioni/mese.
  3. RETAIL ANNUALE: Addebito annuale di 588€ (49€ al mese). Tutto il piano Retail + risparmio 360€.
- Disdetta: Puoi disdire in qualsiasi momento. Il piano resta attivo fino alla scadenza mensile/annuale (nessun rimborso monetizzabile per i costi delle GPU, ma i crediti possono essere sfruttati interamente).
- Crediti extra: Se si esauriscono si può passare al piano superiore in qualsiasi momento.
- Sicurezza: le foto caricate non vengono usate per training pubblici.
- Acquisti: in questo esatto momento i pagamenti sono disattivati per migrazione a PayPal (fino a domani). Invita gli utenti allegramente a tornare domani per aprire il bot.

Regole di risposta:
Sii breve, offri risposte veloci (1-3 frasi) e simpatiche. Aggiungi emoji. Se una domanda è fuori tema moda/servizi, riportala a SuperNexus cortesemente. Non usare testo formattato (no markdown/bold) per favore.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messaggi mancanti o invalidi' }, { status: 400 });
    }

    const formattedMessages = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{text: m.content}]
    }));

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ reply: 'Attenzione: Chiave API AI mancante nel server. [Risposta Test AI Mockata]' });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: "SYSTEM INSTRUCTION:\n" + SYSTEM_PROMPT + "\n\nOkey, the instructions are understood. Waiting for user messages." }]},
            { role: 'model', parts: [{ text: "Capito. Sono pronto a rispondere ai visitatori della Landing Page." }]},
            ...formattedMessages
        ]
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
