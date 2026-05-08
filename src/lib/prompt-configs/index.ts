import { prisma } from "@/lib/prisma";
import { PromptConfigRow, PromptShot } from "./types";

console.log("Reloading Prompt Configs - " + Date.now());

export interface SelectionParams {
  categorySlug: string;
  modeSlug: string;
  presentationSlug: string;
  scene?: string;
  quantity?: number;
  specificShotNumber?: number;
  gender?: string;
}



export async function getPromptsForSelection({
  categorySlug,
  modeSlug,
  presentationSlug,
  scene,
  quantity,
  specificShotNumber,
  gender
}: SelectionParams): Promise<PromptShot[] | null> {
  const normCat = categorySlug.toLowerCase().trim();
  let normMode = modeSlug.toLowerCase().trim();
  let normPres = presentationSlug.toLowerCase().trim().replace(/-/g, ' ');

  // Mappa i nomi lunghi del frontend negli slug brevi del JSON/DB
  if (normMode.includes('ads') || normMode.includes('scroll-stopper')) normMode = 'ads';
  else if (normMode.includes('detail') || normMode.includes('texture')) normMode = 'detail';
  else normMode = normMode.replace(/\s+/g, '-');
  
  if (normPres === 'candid' && gender) {
    normPres = `candid-${gender.toLowerCase()}`;
  } else if (normPres === 'ugc in home' && gender) {
    normMode = 'ugc-home';
    normPres = `candid-${gender.toLowerCase()}`;
  } else if (normPres === 'ugc in store' && gender) {
    normMode = 'ugc-store';
    normPres = `candid-${gender.toLowerCase()}`;
  } else if (normPres === 'model photo' && gender) {
    normPres = `model-photo-${gender.toLowerCase()}`;
  } else if (normPres.includes('ugc in home') && normPres.includes('woman')) {
    normMode = 'ugc-home';
    normPres = 'candid-woman';
  } else if (normPres.includes('ugc in store') && normPres.includes('woman')) {
    normMode = 'ugc-store';
    normPres = 'candid-woman';
  } else if (normPres.includes('ugc in home') && normPres.includes('man')) {
    normMode = 'ugc-home';
    normPres = 'candid-man';
  } else if (normPres.includes('ugc in store') && normPres.includes('man')) {
    normMode = 'ugc-store';
    normPres = 'candid-man';
  } else if (normPres === 'ugc in home') {
    normMode = 'ugc-home';
    normPres = 'candid-woman'; // Fallback
  } else if (normPres === 'ugc in store') {
    normMode = 'ugc-store';
    normPres = 'candid-woman'; // Fallback
  } else if (normPres === 'woman') {
    normPres = 'candid-woman';
  } else if (normPres === 'man') {
    normPres = 'candid-man';
  }
  else if (normPres.includes('curvy') || normPres.includes('plus-size')) {
    if (gender && gender.toLowerCase() === 'man') {
        normPres = 'curvy-man';
    } else {
        normPres = 'curvy-woman';
    }
  }
  else if (normPres.includes('still life')) normPres = 'still-life-pack';
  else if (normPres.includes('ugc creator pack')) normPres = 'ugc-creator-pack';
  else if (normPres === 'no model') {
      if (gender && gender.toLowerCase() === 'man') normPres = 'no-model-man';
      else if (gender && gender.toLowerCase() === 'woman') normPres = 'no-model-woman';
      else normPres = 'no-model';
  }
  else if (normPres === 'model photo') normPres = 'model-photo';
  else normPres = normPres.replace(/\s+/g, '-');

  try {
      console.log("Querying DB with:", { cat: normCat, mod: normMode, pres: normPres });
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
          console.log("DB SHOTS FROM GET_PROMPTS:", dbShots.map(s => ({ name: s.shotName, url: (s as any).imageUrl })));
          let shots = dbShots.map(db => ({
              shot_number: db.shotNumber,
              shot_name: db.shotName,
              positive_prompt: db.positivePrompt,
              negative_prompt: db.negativePrompt,
              hard_rules: db.hardRules,
              output_goal: db.outputGoal || "",
              image_url: (db as any).imageUrl
          }));
          // Deduplicate shots before expanding
          const uniqueShotsMap = new Map();
          for (const s of shots) {
             uniqueShotsMap.set(s.shot_number, s);
          }
          const uniqueShots = Array.from(uniqueShotsMap.values());
          
          if (specificShotNumber) {
              const target = uniqueShots.find(s => s.shot_number === specificShotNumber);
              if (target) return [target];
          }
          
          return expandShots(uniqueShots, quantity);
      }
  } catch(e) {
      console.error("Database Prompt Lookup Failed", e);
  }

  return null;
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
