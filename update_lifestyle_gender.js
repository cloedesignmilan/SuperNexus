const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateGenderShot2() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 't-shirt',
      mode: 'lifestyle',
      shotNumber: 1
    }
  });

  if (shots.length === 0) {
    console.log("No shots found for T-Shirt > Lifestyle > Model Photo > Shot 1");
    return;
  }

  const newHardRule = `\n[CRITICAL LOWER-BODY CLOTHING RULE]: The model MUST ALWAYS wear appropriate lower-body clothing (pants, jeans, trousers, shorts, skirts). Models must NEVER appear wearing only the upper garment without bottoms. The styling must be realistic, tasteful, and professional for an ecommerce presentation.`;
  const newNegative = "pantless, missing pants, no pants, bare legs without bottoms, naked lower body, partial nudity, wearing only t-shirt, underwear only";

  for (const shot of shots) {
    let updatedHardRules = shot.hardRules || "";
    if (!updatedHardRules.includes('[CRITICAL LOWER-BODY CLOTHING RULE]')) {
      updatedHardRules += newHardRule;
    }

    let updatedNegative = shot.negativePrompt || "";
    if (!updatedNegative.includes('pantless')) {
      updatedNegative = updatedNegative ? `${updatedNegative}, ${newNegative}` : newNegative;
    }

    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        hardRules: updatedHardRules,
        negativePrompt: updatedNegative
      }
    });

    console.log(`Updated Shot 1 (Lifestyle) - ID: ${shot.id} - Presentation: ${shot.presentation}`);
  }
}

updateGenderShot2().catch(console.error).finally(() => prisma.$disconnect());
