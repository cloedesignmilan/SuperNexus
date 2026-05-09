const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allShots = await prisma.promptConfigShot.findMany();
  console.log(`Found ${allShots.length} total shots to upgrade for Global Consistency...`);

  let updatedCount = 0;

  for (const shot of allShots) {
    let updatedHardRules = shot.hardRules || '';
    let updatedPositivePrompt = shot.positivePrompt || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // 1. INJECT GLOBAL SET COHESION & TRUE IDENTITY LOCK (Hard Rules)
    const cohesionRule = '[GLOBAL SET COHESION & TRUE IDENTITY LOCK]: All generated images within this sequence MUST maintain strong visual consistency and coherence. The overall scene, atmosphere, lighting, and background style must feel like part of the exact same professional photoshoot. IF a person/model is present, the character MUST remain PERFECTLY CONSISTENT across all generated images. You MUST maintain the EXACT same identity, facial features, body proportions, skin tone, hairstyle, and overall appearance. It must be the EXACT SAME REAL PERSON wearing the product throughout the entire set.';
    
    if (!updatedHardRules.includes('[GLOBAL SET COHESION & TRUE IDENTITY LOCK]')) {
      updatedHardRules += `\n\n${cohesionRule}`;
    }

    // Only inject Movement into shots that MIGHT have models
    const pres = shot.presentation.toLowerCase();
    const isNoModel = pres.includes('no-model') || pres.includes('ghost-mannequin') || pres.includes('still-life-pack') || pres.includes('flat-lay');
    
    if (!isNoModel) {
      // 2. INJECT AUTHENTIC MOVEMENT (Positive Prompt)
      const movementRule = '[AUTHENTIC MOVEMENT DIRECTIVE]: The subject must appear extremely hyper-realistic, completely natural, and believable. Poses, facial expressions, body posture, hand positioning, arms, legs, gaze direction, movement, and anatomy MUST look authentic and physically correct at all times. Natural movement, authentic body language, and believable human presence.';
      
      if (!updatedPositivePrompt.includes('[AUTHENTIC MOVEMENT DIRECTIVE]')) {
        updatedPositivePrompt += `\n\n${movementRule}`;
      }

      // 3. INJECT ANTI-ROBOT (Negative Prompt)
      const antiRobot = 'stiff pose, robotic gestures, unnatural symmetry, distorted anatomy, fake smile, mannequin-like behavior, artificial intelligence generated imagery, unnatural movement, deformed limbs, anatomically incorrect, extra fingers';
      
      if (!updatedNegativePrompt.includes('stiff pose')) {
         updatedNegativePrompt = updatedNegativePrompt 
           ? `${updatedNegativePrompt}, ${antiRobot}` 
           : antiRobot;
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

  console.log(`Successfully upgraded ${updatedCount} shots with Global Consistency rules.`);
  
  if (allShots.length > 0) {
    // Show a sample to verify
    const sample = await prisma.promptConfigShot.findFirst({
      where: { presentation: 'model-photo' }
    });
    
    if (sample) {
      console.log("\n--- SAMPLE UPGRADED SHOT ---");
      console.log("CATEGORY:", sample.category, "| MODE:", sample.mode, "| PRES:", sample.presentation);
      console.log("POSITIVE:\n" + sample.positivePrompt);
      console.log("----------------------");
      console.log("NEGATIVE:\n" + sample.negativePrompt);
      console.log("----------------------");
      console.log("HARD RULES:\n" + sample.hardRules);
      console.log("----------------------------");
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
