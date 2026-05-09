const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Trova tutti gli scatti con mode = 'model-studio'
  const studioShots = await prisma.promptConfigShot.findMany({
    where: {
      mode: 'model-studio'
    }
  });

  console.log(`Found ${studioShots.length} 'Model Studio' shots to upgrade...`);

  let updatedCount = 0;

  for (const shot of studioShots) {
    let updatedHardRules = shot.hardRules || '';
    let updatedPositivePrompt = shot.positivePrompt || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // 1. INJECT CRITICAL STUDIO COHESION (Hard Rules)
    const cohesionRule = '[CRITICAL STUDIO COHESION]: All generated images MUST look like they were created during the same professional studio photoshoot. The background color, lighting setup, atmosphere, and studio mood must remain PERFECTLY CONSISTENT across all generations. Simulate a single coherent shooting session. The ONLY elements allowed to vary are model pose, camera framing, natural body movement, and subtle facial expressions. The background must NEVER shift in hue, brightness, or style.';
    
    if (!updatedHardRules.includes('[CRITICAL STUDIO COHESION]')) {
      updatedHardRules += `\n\n${cohesionRule}`;
    }

    // 2. INJECT PREMIUM ENVIRONMENT (Positive Prompt)
    const studioEnvRule = '[STUDIO ENVIRONMENT & LIGHTING]: Realistic premium photography studio setting. Soft, elegant, high-end editorial aesthetic. Background MUST be a light, neutral, refined tone (soft warm grey, luxury light grey, beige-grey, or taupe). Soft, diffused professional studio lighting with a natural commercial look. Clean, premium, realistic luxury ecommerce fashion photography.';
    
    if (!updatedPositivePrompt.includes('[STUDIO ENVIRONMENT & LIGHTING]')) {
      updatedPositivePrompt += `\n\n${studioEnvRule}`;
    }

    // 3. INJECT STRICT NEGATIVE PROMPT
    const studioNegative = 'pure white background, #FFFFFF, overexposed white backdrop, transparent background, random background colors, harsh shadows, dramatic colored lighting, extreme contrast, outdoor environment';
    
    if (!updatedNegativePrompt.includes('overexposed white backdrop')) {
       updatedNegativePrompt = updatedNegativePrompt 
         ? `${updatedNegativePrompt}, ${studioNegative}` 
         : studioNegative;
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

  console.log(`Successfully upgraded ${updatedCount} Model Studio shots with Consistency & Cohesion rules.`);
  
  if (studioShots.length > 0) {
    // Show a sample to verify
    const sample = await prisma.promptConfigShot.findFirst({
      where: { mode: 'model-studio' }
    });
    
    console.log("\n--- SAMPLE UPGRADED MODEL STUDIO SHOT ---");
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
