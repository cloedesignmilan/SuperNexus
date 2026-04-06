import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const getPrompt = (scene: string) => `A hyper-realistic professional wedding photograph of an attractive 28-40 year old European male model with well-groomed hair and natural skin texture. He is wearing EXACTLY the groom suit shown in the reference image (same color, fabric, fit, proportions, details). ${scene}. Cinematic lighting, shot on 50mm or 85mm lens, shallow depth of field, natural colors, high-end wedding editorial style. No text, no logos, no watermarks, no AI artifacts.`;

export async function POST(req: Request) {
  try {
    const { referenceImageBase64, referenceMimeType, sceneEn } = await req.json();

    if (!referenceImageBase64 || !sceneEn) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY non configurata");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Sicurezza: estrae solo il base64 in caso di prefisso Data URI
    const base64Data = referenceImageBase64.includes(',') ? referenceImageBase64.split(',')[1] : referenceImageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: referenceMimeType || 'image/jpeg',
            },
          },
          {
            text: getPrompt(sceneEn),
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
          imageSize: "1K"
        }
      }
    });

    let imageUrl = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error("Nessuna immagine restituita da Gemini");
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Errore generazione Sposo API:', error);
    return NextResponse.json({ error: error.message || 'Errore durante la generazione' }, { status: 500 });
  }
}
