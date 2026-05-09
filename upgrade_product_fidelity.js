const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allShots = await prisma.promptConfigShot.findMany();
  console.log(`Found ${allShots.length} total shots to upgrade for Product Fidelity...`);

  let updatedCount = 0;

  const fidelityRule = '[ABSOLUTE PRODUCT FIDELITY & DEEP VISUAL ANALYSIS]: The uploaded reference image MUST be studied with extreme precision. Product fidelity has absolute priority. Preserve the exact original product: shape, silhouette, proportions, structure, color tones, fabric texture, seams, stitching, cuts, accessories, finishes, closures, and patterns. DO NOT add, remove, change, simplify, redesign, improve, or invent anything. The product MUST remain strictly identical. Do NOT introduce new logos, labels, patterns, buttons, zippers, pockets, or textures not clearly visible in the reference.';
  const fidelityNegative = 'added details, changed design, altered shape, modified proportions, invented accessories, extra buttons, extra zippers, added pockets, fake logos, text, typography, different color tone, simplified product, redesigned garment, changed fabric, different texture, distorted seams';

  for (const shot of allShots) {
    let updatedHardRules = shot.hardRules || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // INJECT PRODUCT FIDELITY (Hard Rules - ALL)
    if (!updatedHardRules.includes('[ABSOLUTE PRODUCT FIDELITY & DEEP VISUAL ANALYSIS]')) {
      updatedHardRules = `${fidelityRule}\n\n${updatedHardRules}`;
    }

    // INJECT NEGATIVE PROMPT (Negative Prompt - ALL)
    if (!updatedNegativePrompt.includes('invented accessories')) {
       updatedNegativePrompt = updatedNegativePrompt ? `${updatedNegativePrompt}, ${fidelityNegative}` : fidelityNegative;
    }

    // Update the record
    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        hardRules: updatedHardRules,
        negativePrompt: updatedNegativePrompt
      }
    });

    updatedCount++;
  }

  console.log(`Successfully upgraded ${updatedCount} shots with Absolute Product Fidelity rules.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
