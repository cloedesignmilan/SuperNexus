import { loadPromptConfig, getPromptsForSelection } from './src/lib/prompt-configs/index.ts';

async function run() {
  const c = 'dress';
  const m = 'model-studio';
  const p = 'model-photo';
  
  const res = await getPromptsForSelection({
    categorySlug: c,
    modeSlug: m,
    presentationSlug: p,
    quantity: 3
  });
  console.log("DRESS MODEL-STUDIO MODEL-PHOTO:", res ? res.length + " shots found" : "NULL");
  if (res) console.log(res.map((s: any) => s.shot_name));
}
run();
