import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instruction, category, mode, scene } = body;

    if (!instruction) {
      return NextResponse.json({ error: 'Instruction is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an expert commercial fashion photographer and AI prompt engineer for "SuperNexus".
Your job is to translate the user's natural language request (in Italian or English) into the exact technical prompt configuration required by our Image-to-Image pipeline.

Context of the shot:
- Category: ${category}
- Mode: ${mode}
- Scene: ${scene || 'all'}

You must return ONLY a perfectly valid JSON object with EXACTLY these 3 keys:
- "positivePrompt": A highly descriptive, comma-separated technical prompt in English. MUST include "{{color}}" and "{{material}}". Should be structured as: [Subject Description], [Photographic Setup & Lighting], [Environment/Background], [Lens & Quality]. Example: "A single {{color}} t-shirt, perfectly symmetrical front view. Ghost mannequin effect. Studio softbox lighting, pure white background. 8k resolution, macro photography, sharp focus on fabric texture."
- "negativePrompt": A list of comma-separated negative constraints in English to prevent hallucination. Example: "human, person, model, face, hands, messy background, hanger, wrinkles, text, watermark".
- "hardRules": Strict categorical rules in English, written in ALL CAPS if critical. Focus on preserving the garment's structure. Example: "STRICTLY NO HUMANS. NO ACCESSORIES. Maintain original {{graphic_description}}. Flat lighting."

IMPORTANT RULES:
- The user instruction is: "${instruction}"
- ALWAYS respond with valid JSON. NO markdown. NO backticks. NO extra text.
- If the user asks for a model/person, include it in the positive prompt and remove "human, person" from the negative prompt.
- If the user asks for "solo il capo" or "ghost mannequin", ensure "human, model, body parts" are strictly in the negative prompt and hard rules.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
        config: {
            temperature: 0.2,
            responseMimeType: "application/json",
        }
    });

    const rawText = response.text || "{}";
    
    try {
        const parsed = JSON.parse(rawText);
        return NextResponse.json(parsed);
    } catch(e) {
        // If Gemini returned markdown block despite instructions
        const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        return NextResponse.json(parsed);
    }

  } catch (error) {
    console.error('Error generating AI prompt:', error);
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}
