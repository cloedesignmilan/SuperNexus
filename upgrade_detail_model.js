const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allShots = await prisma.promptConfigShot.findMany();
  
  // Filter locally
  const targetShots = allShots.filter(shot => {
      const mode = shot.mode.toLowerCase();
      const pres = shot.presentation.toLowerCase();
      // Detail/Texture mode, and has a model (not no-model)
      return mode.includes('detail') && !pres.includes('no-model') && !pres.includes('ghost');
  });

  console.log(`Found ${targetShots.length} Detail/Texture + Model shots to upgrade...`);

  let updatedCount = 0;

  for (const shot of targetShots) {
    let updatedHardRules = shot.hardRules || '';
    let updatedPositivePrompt = shot.positivePrompt || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // 1. INJECT MACRO TEXTURE FOCUS (Positive Prompt)
    const macroRule = '[MACRO DETAIL DIRECTIVE]: Ultra-premium editorial quality. Cinematic macro shots and close-up detail photography. Focus entirely on the product details, fabrics, textures, materials, folds, seams, buttons, stitching, and exact original colors. High-end magazine editorial and luxury commercial campaign aesthetic. The product MUST remain the absolute visual focus. The model only supports the presentation and must NEVER dominate the scene. Soft, realistic, premium macro lighting capable of enhancing fabric textures without feeling overprocessed.';
    
    if (!updatedPositivePrompt.includes('[MACRO DETAIL DIRECTIVE]')) {
      updatedPositivePrompt += `\n\n${macroRule}`;
    }

    // 2. INJECT MACRO HARD RULES
    const strictCropRule = '[CRITICAL MACRO RULE]: This is a close-up detail shot. DO NOT generate full body shots. The framing must tightly crop on the garment\'s texture and material. The model\'s face or identity is completely irrelevant; the fabric is the only protagonist.';
    
    if (!updatedHardRules.includes('[CRITICAL MACRO RULE]')) {
      updatedHardRules += `\n\n${strictCropRule}`;
    }

    // 3. INJECT ANTI-DISTRACTION NEGATIVE PROMPT
    const antiDistraction = 'store labels, brand logos, tags, watermark, typography, fake branding, distracting accessories, unnecessary objects, model dominating the scene, full body shot, wide angle, overprocessed lighting, artificial lighting';
    
    if (!updatedNegativePrompt.includes('store labels, brand logos')) {
       updatedNegativePrompt = updatedNegativePrompt 
         ? `${updatedNegativePrompt}, ${antiDistraction}` 
         : antiDistraction;
    }

    // Update the record
    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        hardRules: updatedHardRules,
        positivePrompt: updatedPositivePrompt,
        negativePrompt: updatedNegativePrompt
      }
    });

    updatedCount++;
  }

  console.log(`Successfully upgraded ${updatedCount} Detail/Texture shots with Macro & Anti-Distraction rules.`);
  
  if (targetShots.length > 0) {
    // Show a sample to verify
    const sample = await prisma.promptConfigShot.findFirst({
      where: { id: targetShots[0].id }
    });
    
    console.log("\n--- SAMPLE UPGRADED DETAIL SHOT ---");
    console.log("CATEGORY:", sample.category, "| MODE:", sample.mode, "| PRES:", sample.presentation);
    console.log("POSITIVE:\n" + sample.positivePrompt);
    console.log("----------------------");
    console.log("NEGATIVE:\n" + sample.negativePrompt);
    console.log("----------------------");
    console.log("HARD RULES:\n" + sample.hardRules);
    console.log("----------------------------");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
