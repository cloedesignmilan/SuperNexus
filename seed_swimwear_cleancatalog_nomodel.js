const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSwimwearCleanCatalogNoModel() {
  const shots = [
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 1,
      shotName: 'Flat Lay on White Sand',
      priority: 100,
      positivePrompt: 'A single {color} {product} perfectly flat laid, entirely open, highly structured and symmetrically aligned on pristine, fine light beige sand. The garment must look high-end, perfectly shaped, and crisp. Clean top-down view, soft natural lighting. No other props.',
      negativePrompt: 'human, model, mannequin, hanger, water, messy, wrinkled, dark lighting, feet, hands, folded, crumpled, props, accessories',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE A PERFECT SYMMETRICAL OPEN FLAT LAY ON SAND. NO BODY PARTS. NO PROPS.',
      outputGoal: 'Open sand flat lay'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 2,
      shotName: 'Structured on Stone Pedestal',
      priority: 99,
      positivePrompt: 'A single {color} {product} meticulously and symmetrically arranged flat on top of a clean, square beige stone or marble pedestal block. The background is a smooth, minimal beige wall. Soft studio lighting casting delicate shadows, creating a premium luxury e-commerce aesthetic.',
      negativePrompt: 'human, model, mannequin, hanger, sand, water, messy folds, draped, casual, crumpled, feet, hands, wood, messy background',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE STRICTLY AND PERFECTLY ARRANGED ON A SQUARE STONE PEDESTAL BLOCK. NO BODY PARTS.',
      outputGoal: 'Arranged on stone block'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 3,
      shotName: 'Hanging on Bamboo Ladder',
      priority: 98,
      positivePrompt: 'A single {color} {product} hanging perfectly straight and symmetrical from a rustic, light-wood bamboo ladder. The ladder is standing outdoors with a softly blurred, luxurious poolside and tropical garden in the background. Warm natural daylight, premium aesthetic.',
      negativePrompt: 'human, real person, model, flat lay, sand, dark background, messy composition, feet, hands, casually draped, folded, crumpled, indoor studio',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE HANGING STRAIGHT ON A WOODEN BAMBOO LADDER. BACKGROUND MUST BE POOLSIDE. NO BODY PARTS.',
      outputGoal: 'Hanging on bamboo ladder'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 4,
      shotName: 'Laid on Wooden Sunbed',
      priority: 97,
      positivePrompt: 'A single {color} {product} symmetrically laid out flat and fully open on a wooden slatted sunbed lounger. In the blurred background, there is a luxurious blue swimming pool and tropical resort setting. Bright, natural sunshine, high-end lifestyle e-commerce photography.',
      negativePrompt: 'human, model, mannequin, hanger, sand, dark background, messy composition, feet, hands, casually draped, folded, crumpled, indoor studio, stone pedestal',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE LAID FLAT ON A WOODEN SLATTED SUNBED. BACKGROUND MUST BE BLURRED POOL. NO BODY PARTS.',
      outputGoal: 'Laid on wooden sunbed'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 5,
      shotName: 'Diagonal Flat Lay on Sand',
      priority: 96,
      positivePrompt: 'A single {color} {product} perfectly flat laid and fully open on soft, pristine light beige sand, photographed from a dynamic top-down diagonal angle. The arrangement is clean, sharp, and luxurious. Soft sunlight, extreme focus on the fabric and structure. No other objects.',
      negativePrompt: 'human, model, mannequin, hanger, water, dark lighting, feet, hands, messy, folded, crumpled, indoor studio, props, wood, stone',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE PERFECTLY FLAT LAID ON SAND. NO BODY PARTS. NO PROPS.',
      outputGoal: 'Diagonal sand flat lay'
    }
  ];

  for (const s of shots) {
    const existing = await prisma.promptConfigShot.findFirst({
      where: {
        category: s.category,
        mode: s.mode,
        presentation: s.presentation,
        shotNumber: s.shotNumber
      }
    });

    if (existing) {
      await prisma.promptConfigShot.update({
        where: { id: existing.id },
        data: s
      });
      console.log(`Updated shot ${s.shotNumber}`);
    } else {
      await prisma.promptConfigShot.create({
        data: s
      });
      console.log(`Created shot ${s.shotNumber}`);
    }
  }
}

seedSwimwearCleanCatalogNoModel().catch(console.error).finally(() => prisma.$disconnect());
