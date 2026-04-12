import { prisma } from './prisma';

export const GEMINI_RATES = {
  // Prezzi in Euro per 1 milione di token
  "gemini-3.1-flash-image-preview": { input: 0.075, output: 0.30, per_image: 0.03 },
  "gemini-2.5-flash": { input: 0.075, output: 0.30, per_image: 0 },
  "gemini-3-pro-image-preview": { input: 1.25, output: 5.00, per_image: 0.03 },
  "gemini-1.5-pro": { input: 1.25, output: 5.00, per_image: 0 },
  "gemini-1.5-flash": { input: 0.075, output: 0.30, per_image: 0 },
  "gemini-2.0-flash": { input: 0.075, output: 0.30, per_image: 0 },
  "default": { input: 0.075, output: 0.30, per_image: 0 }
};

export async function logApiCost(
  actionType: string,
  modelName: string,
  tokensIn: number,
  tokensOut: number,
  userId?: string | null,
  imagesGenerated: number = 0
): Promise<number> {
  try {
    const rate = GEMINI_RATES[modelName as keyof typeof GEMINI_RATES] || GEMINI_RATES["default"];
    
    // (Token / 1,000,000) * Costo per milione + (Costo Fisso * Numeri Immagini Generate)
    let costEur = ((tokensIn / 1000000) * rate.input) + ((tokensOut / 1000000) * rate.output) + (imagesGenerated * rate.per_image);

    // Salva a database
    await prisma.apiCostLog.create({
      data: {
        action_type: actionType,
        model_used: modelName,
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        cost_eur: costEur,
        user_id: userId || null
      }
    });
    
    console.log(`[API Cost] Logged ${costEur.toFixed(5)}€ for ${actionType} using ${modelName}`);
    return costEur;
  } catch (error) {
    console.error("Error logging API cost:", error);
    return 0;
  }
}
