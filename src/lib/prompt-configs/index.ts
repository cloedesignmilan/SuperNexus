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

export function getPromptsForSelection({
  categorySlug,
  modeSlug,
  presentationSlug,
  scene,
  quantity
}: SelectionParams): PromptShot[] | null {
  const config = loadPromptConfig(categorySlug);
  if (!config) return null;

  const normMode = modeSlug.toLowerCase().trim();
  const normPres = presentationSlug.toLowerCase().trim();

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

  // We could slice or filter based on quantity, but usually the row contains exactly the shots needed
  let shots = [...row.shots];
  if (quantity && shots.length > quantity) {
      shots = shots.slice(0, quantity);
  } else if (quantity && shots.length < quantity) {
      // If we need more shots than available, cycle through them
      const extra = [];
      for (let i = shots.length; i < quantity; i++) {
          extra.push(shots[i % shots.length]);
      }
      shots = [...shots, ...extra];
  }

  return shots;
}
