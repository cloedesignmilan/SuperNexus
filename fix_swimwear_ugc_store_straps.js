const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSwimwearUgcStoreStraps() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'swimwear',
      mode: 'ugc-store'
    }
  });

  if (shots.length === 0) {
    console.log("No shots found for Swimwear > UGC > UGC in Store");
    return;
  }

  const newHardRule = `\n[CRITICAL STRAP RULE]: For swimwear designed to tie behind the back or neck, the fastening strings/straps MUST NEVER be shown hanging loose or tied on the FRONT of the model's body. The front must remain clean and faithful to the real construction. Do not invent front knots or front-facing ties.`;
  const newNegative = "front knots, loose hanging strings on the chest, front-facing ties, incorrect strap positioning, dangling strings on front";

  for (const shot of shots) {
    let updatedHardRules = shot.hardRules || "";
    if (!updatedHardRules.includes('[CRITICAL STRAP RULE]')) {
      updatedHardRules += newHardRule;
    }

    let updatedNegative = shot.negativePrompt || "";
    if (!updatedNegative.includes('front knots')) {
      updatedNegative = updatedNegative ? `${updatedNegative}, ${newNegative}` : newNegative;
    }

    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        hardRules: updatedHardRules,
        negativePrompt: updatedNegative
      }
    });

    console.log(`Updated Shot ${shot.shotNumber} - ID: ${shot.id} - Presentation: ${shot.presentation}`);
  }
}

fixSwimwearUgcStoreStraps().catch(console.error).finally(() => prisma.$disconnect());
