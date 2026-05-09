const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allShots = await prisma.promptConfigShot.findMany();
  
  // Filter locally
  const targetShots = allShots.filter(shot => {
      const mode = shot.mode.toLowerCase();
      const pres = shot.presentation.toLowerCase();
      // Ads mode, and has a model (not no-model)
      return mode.includes('ads') && !pres.includes('no-model') && !pres.includes('ghost') && !pres.includes('still-life-pack') && !pres.includes('flat-lay');
  });

  console.log(`Found ${targetShots.length} Ads + Model shots to upgrade...`);

  let updatedCount = 0;

  for (const shot of targetShots) {
    let updatedHardRules = shot.hardRules || '';
    let updatedPositivePrompt = shot.positivePrompt || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // 1. INJECT TONE ON TONE (Hard Rules)
    const cohesionRule = '[CRITICAL ADS COHESION]: The entire set MUST look like a cohesive luxury advertising campaign. The background, environment, lighting accents, gradients, and reflections MUST use a tone-on-tone color harmony strictly matching the EXACT colors of the central product. Background tones may vary slightly in depth or intensity, but they must always remain visually connected to the product colors.';
    
    if (!updatedHardRules.includes('[CRITICAL ADS COHESION]')) {
      updatedHardRules += `\n\n${cohesionRule}`;
    }

    // 2. INJECT SCROLL STOPPER DIRECTIVE (Positive Prompt)
    const adsRule = '[SCROLL STOPPER DIRECTIVE]: Visually striking, highly creative, bold aesthetic optimized for premium high-conversion social media campaigns. World-class fashion advertising campaign style. Creativity is strongly encouraged through bold composition, camera angles, movement, cinematic lighting, reflections, and atmosphere. HOWEVER, the product MUST always remain the absolute central focus, immediately visible, readable, and dominant within the scene. Hyper-realistic, naturally beautiful, and professionally photographed human models.';
    
    if (!updatedPositivePrompt.includes('[SCROLL STOPPER DIRECTIVE]')) {
      updatedPositivePrompt += `\n\n${adsRule}`;
    }

    // 3. INJECT ANTI-CHAOS NEGATIVE PROMPT
    const antiChaos = 'chaotic composition, distracting background elements, messy environment, product out of focus, hidden product, fake AI aesthetics, plastic skin, unrealistic facial rendering, low quality, non-commercial look';
    
    if (!updatedNegativePrompt.includes('chaotic composition')) {
       updatedNegativePrompt = updatedNegativePrompt 
         ? `${updatedNegativePrompt}, ${antiChaos}` 
         : antiChaos;
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

  console.log(`Successfully upgraded ${updatedCount} Ads shots with Tone-on-Tone & Scroll Stopper rules.`);
  
  if (targetShots.length > 0) {
    // Show a sample to verify
    const sample = await prisma.promptConfigShot.findFirst({
      where: { id: targetShots[0].id }
    });
    
    console.log("\n--- SAMPLE UPGRADED ADS SHOT ---");
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
