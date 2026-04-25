import prisma from "@/lib/prisma";
import tshirtConfigData from "./tshirt.json";
import { PromptConfigRow, PromptShot } from "./types";

const tshirtConfig = tshirtConfigData as PromptConfigRow[];

const registry: Record<string, PromptConfigRow[]> = {
  "t-shirt": tshirtConfig,
  "tshirt": tshirtConfig, // Fallback
  // "shoes": shoesConfig,
  // ... future categories
};

export interface SelectionParams {
  categorySlug: string;
  modeSlug: string;
  presentationSlug: string;
  scene?: string;
  quantity?: number;
}

export function loadPromptConfig(category: string): PromptConfigRow[] | null {
  const normCat = category.toLowerCase().trim();
  return registry[normCat] || null;
}

export async function getPromptsForSelection({
  categorySlug,
  modeSlug,
  presentationSlug,
  scene,
  quantity
}: SelectionParams): Promise<PromptShot[] | null> {
  const normCat = categorySlug.toLowerCase().trim();
  const normMode = modeSlug.toLowerCase().trim();
  const normPres = presentationSlug.toLowerCase().trim();

  try {
      // Priority 1: Fetch from Database
      const dbShots = await prisma.promptConfigShot.findMany({
          where: {
              category: normCat,
              mode: normMode,
              presentation: normPres,
              OR: [
                  { scene: scene || "all" },
                  { scene: "all" }
              ],
              isActive: true,
          },
          orderBy: [
              { priority: 'desc' },
              { shotNumber: 'asc' }
          ]
      });

      if (dbShots.length > 0) {
          let shots = dbShots.map(db => ({
              shot_number: db.shotNumber,
              shot_name: db.shotName,
              positive_prompt: db.positivePrompt,
              negative_prompt: db.negativePrompt,
              hard_rules: db.hardRules,
              output_goal: db.outputGoal || ""
          }));
          return expandShots(shots, quantity);
      }
  } catch(e) {
      console.error("Database Prompt Lookup Failed", e);
  }

  // Priority 2: Fallback to JSON Configs
  const config = loadPromptConfig(categorySlug);
  if (!config) return null;

  // Find exact match
  let row = config.find(c => 
    c.mode === normMode && 
    c.presentation === normPres
  );

  // If no exact match, fallback to finding just mode
  if (!row) {
    row = config.find(c => c.mode === normMode);
  }

  // If still no match, fallback to the first row of that category
  if (!row) {
      row = config[0];
  }
  
  if (!row) return null;

  return expandShots([...row.shots], quantity);
}

function expandShots(shots: PromptShot[], quantity?: number): PromptShot[] {
  if (quantity && shots.length > quantity) {
      return shots.slice(0, quantity);
  } else if (quantity && shots.length < quantity) {
      const extra = [];
      for (let i = shots.length; i < quantity; i++) {
          extra.push(shots[i % shots.length]);
      }
      return [...shots, ...extra];
  }
  return shots;
}
