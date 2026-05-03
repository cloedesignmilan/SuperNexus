import { GoogleGenAI } from "@google/genai";

export interface AIExecutionBatch {
    aiParts: any[];
    shotName: string | null;
    shotNumber: number | null;
}

export interface AIExecutionResult {
    generatedBase64s: string[];
    generatedMetadata: { shotNumber: number | null, shotName: string | null }[];
    errorMessages: string[];
    totalTokensIn: number;
    totalTokensOut: number;
}

export async function downloadImageAsBase64(url: string): Promise<any | null> {
    if (!url) return null;
    try {
        const res = await fetch(url);
        if (res.ok) {
            const ab = await res.arrayBuffer();
            return {
                inlineData: { 
                    data: Buffer.from(ab).toString('base64'), 
                    mimeType: res.headers.get('content-type') || 'image/jpeg' 
                }
            };
        }
    } catch(e) {
        console.error("Error fetching publicUrl:", url, e);
    }
    return null;
}

export const GLOBAL_INVIOLABLE_RULES = `\n\n[GLOBAL INVIOLABLE RULES]
- The product must remain an exact 1:1 replica of the reference image.
- Do not change color, shape, print, logo, pattern, fabric, stitching, proportions or design.
- Preserve the product identity perfectly. Do not invent details.
- Do not add unwanted objects. Do not add text unless explicitly requested.
- No watermark. No logo changes.
- CRITICAL AESTHETIC LOCK: If generating a human model, they MUST be hyper-realistic and stunningly beautiful, resembling a high-end fashion magazine cover model. ABSOLUTELY NO plastic, airbrushed, or fake AI-generated skin. The skin texture, pores, and lighting must be 100% photorealistic and cinematic.
- CRITICAL ANATOMY LOCK: The human model MUST have perfectly normal anatomy. ABSOLUTELY NO extra arms, no extra limbs, no missing limbs, no extra fingers, no deformed hands, and no distorted body proportions. Check the limb count before finalizing the image!
- CRITICAL: If the reference image has store tags, cardboard labels, price tags, or hangtags attached, REMOVE THEM COMPLETELY. The garment must be cleanly worn without store tags.
- CRITICAL NO HALLUCINATIONS: DO NOT add, generate, or hallucinate ANY internal wash tags, care labels, size labels, or extra fabric tags anywhere on the product. The garment must be completely free of any internal labels.
- CRITICAL: If the product is an open jacket, blazer, or coat, YOU MUST generate an elegant shirt (e.g., dress shirt or t-shirt) underneath it. Do not leave the chest hollow or map the lining to the skin.`;

export async function executeGeminiBatch(
    generationModel: string,
    aspectRatio: string | undefined,
    batches: AIExecutionBatch[],
    maxRetries: number = 3
): Promise<AIExecutionResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });
    
    let generatedBase64s: string[] = [];
    let generatedMetadata: { shotNumber: number | null, shotName: string | null }[] = [];
    let errorMessages: string[] = [];
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    
    // Mappa l'aspect ratio richiesto a uno supportato nativamente da Imagen 3
    let finalAspectRatio = "3:4"; // Default per portrait
    if (aspectRatio === "1:1") finalAspectRatio = "1:1";
    else if (aspectRatio === "9:16") finalAspectRatio = "9:16";
    else if (aspectRatio === "16:9") finalAspectRatio = "16:9";
    else if (aspectRatio === "4:3") finalAspectRatio = "4:3";
    else if (aspectRatio === "4:5") finalAspectRatio = "3:4"; // Imagen 3 non supporta 4:5, il 3:4 è il fallback corretto.

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        let attempt = 0;
        let success = false;
        let result: any = null;

        while (!success && attempt < maxRetries) {
            attempt++;
            try {
                result = await ai.models.generateContent({
                    model: generationModel,
                    contents: [
                        {
                            role: 'user',
                            parts: batch.aiParts
                        }
                    ],
                    config: {
                        // @ts-ignore
                        imageConfig: { aspectRatio: finalAspectRatio }
                    }
                });
                success = true;
            } catch (err: any) {
                console.error(`Tentativo ${attempt} AI Engine fallito (Scena ${i+1}):`, err?.message);
                if (attempt >= maxRetries) {
                    errorMessages.push(err?.message || err?.toString() || "Unknown error");
                }
                await new Promise(r => setTimeout(r, 6000)); // Retry backoff
            }
        }

        if (success && result) {
            if (result.usageMetadata) {
                totalTokensIn += result.usageMetadata.promptTokenCount || 0;
                totalTokensOut += result.usageMetadata.candidatesTokenCount || 0;
            }
            if (result.candidates && result.candidates.length > 0) {
                let foundImageInThisBatch = false;
                for (const candidate of result.candidates) {
                    if (candidate.content && candidate.content.parts) {
                        for (const part of candidate.content.parts) {
                            if (part.inlineData && part.inlineData.data) {
                                generatedBase64s.push(part.inlineData.data);
                                generatedMetadata.push({ shotNumber: batch.shotNumber, shotName: batch.shotName });
                                foundImageInThisBatch = true;
                                break;
                            }
                        }
                    }
                    if (foundImageInThisBatch) break;
                }
                if (!foundImageInThisBatch) {
                    errorMessages.push(`Nessuna immagine base64 trovata nella risposta per la scena ${i+1}`);
                }
            } else {
                errorMessages.push(`Nessun candidato ritornato dall'API per la scena ${i+1}`);
            }
        }
    }

    // Ensure we don't return more images than batches requested, though the loop is tight to batches.length
    return {
        generatedBase64s,
        generatedMetadata,
        errorMessages,
        totalTokensIn,
        totalTokensOut
    };
}
