const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allShots = await prisma.promptConfigShot.findMany();
  console.log(`Found ${allShots.length} total shots to upgrade for Editorial Lens...`);

  let updatedCount = 0;

  const lensRule = '[MAGAZINE EDITORIAL LENS]: Shot on Medium Format Camera, Hasselblad H6D-100c, 85mm f/1.4 lens. Ultra-detailed fabric textures, visible weave, hyper-realistic materials. Profoto studio lighting, cinematic color grading, dramatic yet natural shadows, flawless editorial finish. The final image MUST look exactly like a high-end fashion magazine cover (e.g., Vogue, GQ) or a premium luxury brand campaign. Absolute photorealism, insanely detailed, 8k resolution optical quality.';
  const lensNegative = 'CGI, 3D render, plastic skin, overly retouched, airbrushed, unnatural lighting, blurry textures, flat colors, washed out, low contrast, artificial look, fake materials, illustration, painting, drawing';

  for (const shot of allShots) {
    let updatedPositivePrompt = shot.positivePrompt || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // INJECT EDITORIAL LENS (Positive Prompt - ALL)
    if (!updatedPositivePrompt.includes('[MAGAZINE EDITORIAL LENS]')) {
      updatedPositivePrompt = `${updatedPositivePrompt}\n\n${lensRule}`;
    }

    // INJECT NEGATIVE PROMPT (Negative Prompt - ALL)
    if (!updatedNegativePrompt.includes('plastic skin')) {
       updatedNegativePrompt = updatedNegativePrompt ? `${updatedNegativePrompt}, ${lensNegative}` : lensNegative;
    }

    // Update the record
    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        positivePrompt: updatedPositivePrompt,
        negativePrompt: updatedNegativePrompt
      }
    });

    updatedCount++;
  }

  console.log(`Successfully upgraded ${updatedCount} shots with Editorial Lens rules.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
