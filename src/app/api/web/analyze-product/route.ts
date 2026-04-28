import { NextResponse } from 'next/server';


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

    const prompt = `Analizza questa immagine di prodotto. Devi restituire ESCLUSIVAMENTE un JSON valido seguendo questa struttura esatta, senza markdown o testo extra:
    {
      "detectedProductType": "enum(swimwear | women_clothing | men_clothing | tshirt_hoodie | shoes | bags | jewelry | accessories | ceremony_elegant | unknown)",
      "confidence": "number between 0 and 1",
      "detectedAttributes": {
        "genderTarget": "enum(woman | man | unisex | child | unknown)",
        "productCategory": "string",
        "subCategory": "string",
        "colors": ["array of main colors"],
        "style": "enum(casual | elegant | sporty | beach | premium | streetwear | unknown)",
        "hasLogoOrPrint": boolean,
        "printLocation": "enum(front | back | none | unknown)",
        "recommendedModelOptions": ["array of recommended model types, e.g., 'Candid Real Woman', 'No Model'"],
        "recommendedScenes": ["array of highly recommended background scenes"],
        "blockedOrLowPriorityOptions": ["array of scenes or models that DO NOT match this product"]
      }
    }
    
    Regole fondamentali:
    - Se è un costume (bikini, intero), detectedProductType deve essere "swimwear", style "beach", recommendedScenes ["Tropical Beach", "Pool", "Summer Lifestyle"].
    - Se è un abito da donna, detectedProductType "women_clothing" o "ceremony_elegant" (se elegante).
    - Se sono scarpe, detectedProductType "shoes", recommendedScenes ["Street Lifestyle", "On-Foot", "Studio Softbox"].
    - Se il prodotto è una T-shirt o felpa con grafica, analizza se l'immagine ritrae la parte ANTERIORE (scollo scavato) o POSTERIORE (collo alto, schiena) e imposta "printLocation" su "front" o "back". Se non ha stampe, "none".
    - Sii molto preciso. Non omettere campi. Restituisci SOLO IL JSON.`;

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
      return NextResponse.json({ error: "Impossibile scaricare l'immagine per l'analisi" }, { status: 400 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    console.log("GEMINI RESPONSE:", JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const resultText = data.candidates[0].content.parts[0].text.trim();
      
      try {
        const parsedJson = JSON.parse(resultText);
        return NextResponse.json({ success: true, analysis: parsedJson });
      } catch (e) {
         console.error("Failed to parse JSON from Gemini:", resultText);
         return NextResponse.json({ success: false, error: "Invalid JSON from AI", raw: resultText }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: "No candidates returned from AI", rawResponse: data }, { status: 500 });
  } catch (error: any) {
    console.error('Error in analyze-product API:', error);
    return NextResponse.json({ error: error.message || 'Server error', category: 'Clothing' }, { status: 500 });
  }
}
