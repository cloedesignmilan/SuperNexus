const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDressModelStudioShot4() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'model-studio',
      presentation: { startsWith: 'model-photo' }
    }
  });

  if (shots.length === 0) {
    console.log("No shots found for Dress > Model Studio > Model Photo");
    return;
  }

  const newHardRule = `\n[CRITICAL OUTERWEAR RULE]: If the model wears a jacket, blazer, coat, or outerwear, they MUST wear an appropriate inner layer (shirt, top, sweater) underneath. The model MUST NEVER wear a jacket directly on bare skin. Do NOT expose or highlight the inside lining or unfinished interior of the garment. The jacket must behave naturally with elegant styling.`;
  const newNegative = "bare skin under jacket, wearing jacket without shirt, exposed inside lining, visible inner construction, unnatural open pose, unfinished interior, partial nudity under outerwear, jacket on naked torso";

  for (const shot of shots) {
    let updatedHardRules = shot.hardRules || "";
    if (!updatedHardRules.includes('[CRITICAL OUTERWEAR RULE]')) {
      updatedHardRules += newHardRule;
    }

    let updatedNegative = shot.negativePrompt || "";
    if (!updatedNegative.includes('bare skin under jacket')) {
      updatedNegative = updatedNegative ? `${updatedNegative}, ${newNegative}` : newNegative;
    }

    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        hardRules: updatedHardRules,
        negativePrompt: updatedNegative
      }
    });

    console.log(`Updated Shot ${shot.shotNumber} (Dress Model Studio) - ID: ${shot.id} - Presentation: ${shot.presentation}`);
  }
}

updateDressModelStudioShot4().catch(console.error).finally(() => prisma.$disconnect());
