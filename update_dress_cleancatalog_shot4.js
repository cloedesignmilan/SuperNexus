const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDressCleanCatalogShot4() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 4
    }
  });

  if (shots.length === 0) {
    console.log("No shots found for Dress > Clean Catalog > No Model > Shot 4");
    return;
  }

  for (const shot of shots) {
    // Replace the blurred background prompt with pure white background
    let updatedPositive = shot.positivePrompt.replace(
      'In the background, softly blurred out of focus, there are other clothes hanging. Premium boutique aesthetic',
      'Pure clean white studio background. Minimalist and professional eCommerce aesthetic'
    );
    
    // If replace failed, forcefully append
    if (!updatedPositive.includes('Pure clean white studio background')) {
        updatedPositive += ', Pure clean white studio background.';
    }

    let updatedNegative = shot.negativePrompt || "";
    if (!updatedNegative.includes('other clothes')) {
      updatedNegative = updatedNegative ? `${updatedNegative}, other clothes, blurred background, messy background, boutique background, gray background` : 'other clothes, blurred background, messy background, boutique background, gray background';
    }

    let updatedHardRules = shot.hardRules || "";
    if (!updatedHardRules.includes('[WHITE BACKGROUND RULE]')) {
        updatedHardRules += '\n[WHITE BACKGROUND RULE]: STRICTLY USE A PURE WHITE BACKGROUND. DO NOT ADD OTHER CLOTHES OR A BOUTIQUE SCENE IN THE BACKGROUND.';
    }

    await prisma.promptConfigShot.update({
      where: { id: shot.id },
      data: {
        positivePrompt: updatedPositive,
        negativePrompt: updatedNegative,
        hardRules: updatedHardRules
      }
    });

    console.log(`Updated Shot 4 (Dress Clean Catalog) - ID: ${shot.id}`);
  }
}

fixDressCleanCatalogShot4().catch(console.error).finally(() => prisma.$disconnect());
