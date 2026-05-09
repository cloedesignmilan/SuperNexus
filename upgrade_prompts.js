const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allShots = await prisma.promptConfigShot.findMany();
  console.log(`Found ${allShots.length} shots to upgrade...`);

  let updatedCount = 0;

  for (const shot of allShots) {
    let updatedHardRules = shot.hardRules || '';
    let updatedPositivePrompt = shot.positivePrompt || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // 1. INJECT PURE_JSON_MODE
    if (!updatedHardRules.includes('[PURE_JSON_MODE]')) {
      updatedHardRules = `[PURE_JSON_MODE]\n${updatedHardRules}`;
    }

    // 2. INJECT PHOTOGRAPHY & LIGHTING
    const mode = shot.mode.toLowerCase();
    const presentation = shot.presentation.toLowerCase();

    // Determine Lighting Module
    let lightingModule = '';
    if (mode.includes('clean') || mode.includes('studio') || mode.includes('detail')) {
      lightingModule = 'Shot on Hasselblad X2D 100C, 85mm f/1.4 lens. High-end editorial studio lighting, Broncolor Para 133, soft diffused rim light, elegant chiaroscuro, hyper-realistic fabric texture.';
    } else if (mode.includes('lifestyle') || mode.includes('ads')) {
      lightingModule = 'Shot on Hasselblad X2D 100C, 85mm f/1.4 lens. Golden hour cinematic lighting, soft diffused natural sunlight, beautiful natural shadows adding depth to the fabric.';
    } else if (mode.includes('ugc')) {
      lightingModule = 'Shot on iPhone 15 Pro Max, realistic natural lighting, casual aesthetic, un-retouched photo.';
    }

    // Inject Lighting Module if not already present
    if (lightingModule && !updatedPositivePrompt.includes('Hasselblad') && !updatedPositivePrompt.includes('iPhone')) {
      updatedPositivePrompt += `\n\n[PHOTOGRAPHY/LIGHTING]: ${lightingModule}`;
    }

    // 3. INJECT AESTHETIC & MODEL RULES
    const hasModel = presentation.includes('model') && !presentation.includes('no-model');
    const isCandid = presentation.includes('candid') || mode.includes('ugc');

    let aestheticModule = '';
    if (hasModel || isCandid) {
      aestheticModule = 'Vogue magazine editorial aesthetic. Relaxed and natural hands, effortless elegance. Human imperfections, visible skin texture and pores.';
    }

    if (aestheticModule && !updatedPositivePrompt.includes('Vogue magazine editorial aesthetic')) {
       updatedPositivePrompt += `\n[AESTHETIC]: ${aestheticModule}`;
    }

    // 4. INJECT NEGATIVE PROMPT
    const globalNegative = 'plastic skin, CGI, 3D render, smooth airbrushed skin, overly retouched, deformed hands, unnatural anatomy, stiff pose, oversaturated colors, cartoon, illustration, blurred fabric';
    
    if (!updatedNegativePrompt.includes('plastic skin, CGI')) {
       updatedNegativePrompt = updatedNegativePrompt 
         ? `${updatedNegativePrompt}, ${globalNegative}` 
         : globalNegative;
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

  console.log(`Successfully upgraded ${updatedCount} shots with Premium Photography and PURE_JSON_MODE.`);
  
  // Show a sample to verify
  const sample = await prisma.promptConfigShot.findFirst({
    where: { presentation: 'no-model' }
  });
  
  console.log("\n--- SAMPLE UPGRADED SHOT ---");
  console.log("CATEGORY:", sample.category, "| MODE:", sample.mode, "| PRES:", sample.presentation);
  console.log("POSITIVE:\n" + sample.positivePrompt);
  console.log("----------------------");
  console.log("NEGATIVE:\n" + sample.negativePrompt);
  console.log("----------------------");
  console.log("HARD RULES:\n" + sample.hardRules);
  console.log("----------------------------");
}

main().catch(console.error).finally(() => prisma.$disconnect());
