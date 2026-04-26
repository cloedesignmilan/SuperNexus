import { prisma } from "@/lib/prisma";
import tshirtConfigData from "./tshirt.json";
import dressConfigData from "./dress.json";
import bagsConfigData from "./bags.json";
import jewelryConfigData from "./jewelry.json";
import swimwearConfigData from "./swimwear.json";
import shoesConfigData from "./shoes.json";
import { PromptConfigRow, PromptShot } from "./types";

// Extract the 'configs' array from the new JSON structure
const tshirtConfig = (tshirtConfigData[0] as any).configs as PromptConfigRow[];
const dressConfig = (dressConfigData[0] as any).configs as PromptConfigRow[];
const bagsConfig = (bagsConfigData[0] as any).configs as PromptConfigRow[];
const jewelryConfig = (jewelryConfigData[0] as any).configs as PromptConfigRow[];
const swimwearConfig = (swimwearConfigData[0] as any).configs as PromptConfigRow[];
const shoesConfig = (shoesConfigData[0] as any).configs as PromptConfigRow[];

const registry: Record<string, PromptConfigRow[]> = {
  "t-shirt": tshirtConfig,
  "tshirt": tshirtConfig, // Fallback
  "dress": dressConfig,
  "dress / elegant": dressConfig, // Fallback
  "bags": bagsConfig,
  "jewelry": jewelryConfig,
  "swimwear": swimwearConfig,
  "shoes": shoesConfig,
  // ... future categories
};

export interface SelectionParams {
  categorySlug: string;
  modeSlug: string;
  presentationSlug: string;
  scene?: string;
  quantity?: number;
  specificShotNumber?: number;
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
  quantity,
  specificShotNumber
}: SelectionParams): Promise<PromptShot[] | null> {
  const normCat = categorySlug.toLowerCase().trim();
  let normMode = modeSlug.toLowerCase().trim();
  let normPres = presentationSlug.toLowerCase().trim();

  // Mappa i nomi lunghi del frontend negli slug brevi del JSON/DB
  if (normMode.includes('ads') || normMode.includes('scroll-stopper')) normMode = 'ads';
  if (normMode.includes('detail') || normMode.includes('texture')) normMode = 'detail';
  
  if (normPres.includes('candid') && normPres.includes('woman')) {
    normPres = 'candid-woman';
  } else if (normPres.includes('candid') && normPres.includes('man')) {
    normPres = 'candid-man';
  }
  if (normPres.includes('curvy') || normPres.includes('plus-size')) normPres = 'curvy';
  if (normPres.includes('still life')) normPres = 'still-life-pack';
  if (normPres.includes('ugc creator pack')) normPres = 'ugc-creator-pack';
  if (normPres === 'no model') normPres = 'no-model';
  if (normPres === 'model photo') normPres = 'model-photo';

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
          
          if (specificShotNumber) {
              const target = shots.find(s => s.shot_number === specificShotNumber);
              if (target) return [target];
          }
          
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

  let shots = [...row.shots];
  
  if (specificShotNumber) {
      const target = shots.find(s => ((s as any).shotNumber || s.shot_number) === specificShotNumber);
      if (target) return [target];
  }

  return expandShots(shots, quantity);
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
