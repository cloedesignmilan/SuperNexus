const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDressModelStudioShot2SingleModel() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'model-studio',
      presentation: { startsWith: 'model-photo' },
      shotNumber: 2
    }
  });

  if (shots.length === 0) {
    console.log("No shots found for Dress > Model Studio > Model Photo > Shot 2");
    return;
  }

  const newHardRule = `\n[CRITICAL COUNT RULE]: ONLY ONE SINGLE MODEL MUST APPEAR IN THE IMAGE. It is ABSOLUTELY FORBIDDEN to generate multiple people, twins, clones, or secondary figures. The composition must feature exactly ONE person.`;
  const newNegative = "multiple people, two people, twins, clones, group of people, double subject, extra models, background characters";

  for (const shot of shots) {
    let updatedHardRules = shot.hardRules || "";
    if (!updatedHardRules.includes('[CRITICAL COUNT RULE]')) {
      updatedHardRules += newHardRule;
    }

    let updatedNegative = shot.negativePrompt || "";
    if (!updatedNegative.includes('multiple people')) {
      updatedNegative = updatedNegative ? `${updatedNegative}, ${newNegative}` : newNegative;
    }

    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        hardRules: updatedHardRules,
        negativePrompt: updatedNegative
      }
    });

    console.log(`Updated Shot ${shot.shotNumber} (Single Model Rule) - ID: ${shot.id} - Presentation: ${shot.presentation}`);
  }
}

updateDressModelStudioShot2SingleModel().catch(console.error).finally(() => prisma.$disconnect());
