import { getPromptsForSelection } from './src/lib/prompt-configs/index';

async function run() {
  try {
    const res = await getPromptsForSelection({
      categorySlug: 'dress',
      modeSlug: 'Detail / Texture',
      presentationSlug: 'Model Photo',
      quantity: 1
    });
    console.log("RESULT:", res);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
run();
