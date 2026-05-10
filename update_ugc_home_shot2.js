const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUgcHomeShot2() {
  const targetIds = [
    "252cc2cb-4587-4b4f-a9b6-3c76504b0102", // man
    "62b1eeaa-58b0-4080-840d-a0e39ed8adde"  // woman
  ];

  const shots = await prisma.promptConfigShot.findMany({
    where: { id: { in: targetIds } }
  });

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

    console.log(`Updated Shot 2 (UGC in Home) - ID: ${shot.id}`);
  }
}

updateUgcHomeShot2().catch(console.error).finally(() => prisma.$disconnect());
