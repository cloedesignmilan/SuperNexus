const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDressModelStudioShot5Gender() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'model-studio',
      presentation: { startsWith: 'model-photo' },
      shotNumber: 5
    }
  });

  if (shots.length === 0) {
    console.log("No shots found for Dress > Model Studio > Model Photo > Shot 5");
    return;
  }

  const newHardRule = `\n[CRITICAL GENDER LOCK]: The system MUST strictly respect gender selection. If the prompt specifies a MALE model, ONLY male models may appear; no feminine features or female styling. If the prompt specifies a FEMALE model, ONLY female models may appear; no masculine traits. This gender consistency MUST cover body structure, face, proportions, styling, and anatomy perfectly.`;
  const newNegative = "wrong gender, opposite sex, feminine traits on male, masculine traits on female, mixed gender features, androgynous appearance";

  for (const shot of shots) {
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

    console.log(`Updated Shot ${shot.shotNumber} (Gender Lock) - ID: ${shot.id} - Presentation: ${shot.presentation}`);
  }
}

updateDressModelStudioShot5Gender().catch(console.error).finally(() => prisma.$disconnect());
