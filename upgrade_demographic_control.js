const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allShots = await prisma.promptConfigShot.findMany();
  console.log(`Found ${allShots.length} total shots to upgrade for Demographic Control...`);

  let updatedCount = 0;

  for (const shot of allShots) {
    let updatedHardRules = shot.hardRules || '';
    let updatedPositivePrompt = shot.positivePrompt || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // 1. INJECT WORLD-CLASS QUALITY (Positive Prompt - ALL)
    const qualityRule = '[WORLD-CLASS QUALITY STANDARD]: Highly professional, visually refined, and authentic photography. Premium fashion magazine quality, luxury ecommerce campaign, or high-end commercial advertising. Composition, lighting, styling, framing, realism, and textures MUST reflect top-tier professional photography standards. Carefully art-directed and commercially polished.';
    if (!updatedPositivePrompt.includes('[WORLD-CLASS QUALITY STANDARD]')) {
      updatedPositivePrompt += `\n\n${qualityRule}`;
    }

    const pres = shot.presentation.toLowerCase();
    const isNoModel = pres.includes('no-model') || pres.includes('ghost-mannequin') || pres.includes('still-life-pack') || pres.includes('flat-lay');
    
    if (!isNoModel) {
      // 2. INJECT ABSOLUTE DEMOGRAPHIC CONTROL (Positive Prompt - MODELS ONLY)
      const demoRule = '[ABSOLUTE DEMOGRAPHIC CONTROL]: The human subject MUST clearly remain within the age range of 18 to 50 years old. Accurately reflect the selected gender with consistent realism, natural beauty, and authentic human appearance. Realistic and believable age representation.';
      if (!updatedPositivePrompt.includes('[ABSOLUTE DEMOGRAPHIC CONTROL]')) {
        updatedPositivePrompt += `\n\n${demoRule}`;
      }

      // 3. INJECT DEMOGRAPHIC NEGATIVE PROMPT (MODELS ONLY)
      const demoNegative = 'child, teenager, underaged, elderly, senior citizen, unrealistic age, low-quality AI imagery, synthetic render, amateur visual output';
      if (!updatedNegativePrompt.includes('underaged')) {
         updatedNegativePrompt = updatedNegativePrompt ? `${updatedNegativePrompt}, ${demoNegative}` : demoNegative;
      }
    } else {
      // 4. INJECT STRICT NO-MODEL RULE (Hard Rules - NO MODELS ONLY)
      const strictNoModelRule = '[STRICT NO-MODEL RULE]: This image MUST contain ABSOLUTELY NO HUMAN PRESENCE of any kind. No hands, no reflections of people, no silhouettes, no mannequins, no shadows of people, no partial body elements.';
      if (!updatedHardRules.includes('[STRICT NO-MODEL RULE]')) {
        updatedHardRules += `\n\n${strictNoModelRule}`;
      }

      // 5. INJECT NO-MODEL NEGATIVE PROMPT (NO MODELS ONLY)
      const noModelNegative = 'human, person, face, hand, arm, leg, fingers, silhouette, mannequin, reflection of person, shadow of person, ghost mannequin';
      if (!updatedNegativePrompt.includes('reflection of person')) {
         updatedNegativePrompt = updatedNegativePrompt ? `${updatedNegativePrompt}, ${noModelNegative}` : noModelNegative;
      }
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

  console.log(`Successfully upgraded ${updatedCount} shots with Demographic and No-Model rules.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
