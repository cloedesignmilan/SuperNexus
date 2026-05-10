const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDressUgcShot5Gender() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: { contains: 'ugc' },
      shotNumber: 5
    }
  });

  if (shots.length === 0) {
    console.log("No shots found for Dress > UGC > Shot 5");
    return;
  }

  // Filter to those that have 'candid' or 'man'/'woman' in presentation
  const targetShots = shots.filter(s => s.presentation.includes('candid') || s.presentation.includes('man') || s.presentation.includes('woman'));

  const newHardRule = `\n[CRITICAL GENDER LOCK]: The system MUST strictly respect gender selection. If the prompt specifies a MALE model, ONLY male models may appear; no feminine features or female styling. If the prompt specifies a FEMALE model, ONLY female models may appear; no masculine traits. This gender consistency MUST cover body structure, face, proportions, styling, and anatomy perfectly.`;
  const newNegative = "wrong gender, opposite sex, feminine traits on male, masculine traits on female, mixed gender features, androgynous appearance";

  for (const shot of targetShots) {
    let updatedHardRules = shot.hardRules || "";
    if (!updatedHardRules.includes('[CRITICAL GENDER LOCK]')) {
      updatedHardRules += newHardRule;
    }

    let updatedNegative = shot.negativePrompt || "";
    if (!updatedNegative.includes('wrong gender')) {
      updatedNegative = updatedNegative ? `${updatedNegative}, ${newNegative}` : newNegative;
    }

    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        hardRules: updatedHardRules,
        negativePrompt: updatedNegative
      }
    });

    console.log(`Updated Shot ${shot.shotNumber} (UGC Gender Lock) - ID: ${shot.id} - Presentation: ${shot.presentation}`);
  }
}

updateDressUgcShot5Gender().catch(console.error).finally(() => prisma.$disconnect());
