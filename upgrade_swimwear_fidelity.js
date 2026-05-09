const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const swimwearShots = await prisma.promptConfigShot.findMany({
    where: { category: 'swimwear' }
  });
  console.log(`Found ${swimwearShots.length} swimwear shots to upgrade...`);

  let updatedCount = 0;

  const fidelityRule = '[SWIMWEAR STRUCTURAL FIDELITY]: Strictly respect the original structural function and positioning of bikini strings, straps, ties, and fastening elements EXACTLY as shown in the reference image. If strings/laces are designed to tie behind the neck/back, they MUST NEVER be incorrectly repositioned or visibly hanging on the front of the body. Do NOT invent new front ties, extra knots, incorrect hanging strings, or altered bikini structures that do not exist in the original image. Decorative strings, fastening straps, halter ties, shoulder ties, and support laces MUST remain anatomically and structurally correct. The generated result MUST resemble a real professionally worn swimsuit, respecting original garment engineering and correct strap positioning.';
  const fidelityNegative = 'invented front ties, extra knots, incorrect hanging strings, altered bikini structures, misplaced straps, strings on chest, strings hanging from top, changed swimsuit design, dangling laces';

  for (const shot of swimwearShots) {
    let updatedHardRules = shot.hardRules || '';
    let updatedNegativePrompt = shot.negativePrompt || '';

    // INJECT SWIMWEAR STRUCTURAL FIDELITY
    if (!updatedHardRules.includes('[SWIMWEAR STRUCTURAL FIDELITY]')) {
      updatedHardRules = `${updatedHardRules}\n\n${fidelityRule}`;
    }

    // INJECT NEGATIVE PROMPT
    if (!updatedNegativePrompt.includes('dangling laces')) {
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

  console.log(`Successfully upgraded ${updatedCount} swimwear shots with Structural Fidelity rules.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
