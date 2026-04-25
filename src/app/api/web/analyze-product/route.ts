import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/genai';

// Inizializza il client Gemini
// Se usi @google/genai potresti dover usare un adapter, ma per sicurezza usiamo il fetch diretto REST se non c'è la libreria corretta.
// Per compatibilità massima faremo un fetch diretto.

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Manca imageUrl' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Manca GOOGLE_AI_STUDIO_API_KEY' }, { status: 500 });
    }

    // Costruiamo la richiesta al modello Gemini 1.5 Flash (veloce ed economico per visione)
    const prompt = `Analizza questa immagine di prodotto di moda/abbigliamento. 
    Identifica a quale di queste categorie appartiene principalmente:
    - Clothing
    - T-Shirts / Hoodies
    - Shoes
    - Swimwear
    - Accessories
    - Ceremony / Elegant
    
    Rispondi SOLO con il nome esatto della categoria in inglese, niente altro. Se non sei sicuro, rispondi "Clothing".`;

    // Proviamo prima a recuperare l'immagine come base64 se l'URL è pubblico
    let imageBase64 = '';
    let mimeType = 'image/jpeg';
    
    try {
      const imgRes = await fetch(imageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageBase64 = buffer.toString('base64');
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    } catch (e) {
      return NextResponse.json({ error: 'Impossibile scaricare l\'immagine per l\'analisi' }, { status: 400 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const resultText = data.candidates[0].content.parts[0].text.trim();
      
      // Sanitizzazione del risultato per farlo combaciare con le opzioni esatte
      const validCategories = ["Clothing", "T-Shirts / Hoodies", "Shoes", "Swimwear", "Accessories", "Ceremony / Elegant"];
      
      let matchedCategory = "Clothing"; // Default
      for (const cat of validCategories) {
        if (resultText.toLowerCase().includes(cat.toLowerCase().split('/')[0].trim())) {
          matchedCategory = cat;
          break;
        }
      }

      return NextResponse.json({ category: matchedCategory, rawText: resultText });
    }

    return NextResponse.json({ category: 'Clothing' }); // Default fallback
  } catch (error: any) {
    console.error('Error in analyze-product API:', error);
    return NextResponse.json({ error: error.message || 'Server error', category: 'Clothing' }, { status: 500 });
  }
}
