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
      positivePrompt: 'A single {color} {product} perfectly flat laid on pristine, fine white sand. Clean top-down view, bright sunny outdoor lighting casting distinct, elegant natural shadows. Premium minimalist summer aesthetic. The garment must look high-end and perfectly shaped.',
      negativePrompt: 'human, model, mannequin, hanger, water, messy, wrinkled, dark lighting, feet, hands',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE A FLAT LAY ON WHITE SAND. TOP-DOWN VIEW. NO BODY PARTS.',
      outputGoal: 'Clean sand flat lay'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 2,
      shotName: 'Folded on Stone Pedestal',
      priority: 99,
      positivePrompt: 'A single {color} {product} neatly folded or elegantly draped, resting on a clean, minimal beige limestone or marble cube/pedestal. Soft natural studio lighting, elegant shadows, neutral plaster background. High-end luxury fashion boutique presentation.',
      negativePrompt: 'human, model, mannequin, hanger, sand, water, messy folds, bright colors in background, feet, hands',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE NEATLY ARRANGED ON A STONE PEDESTAL/BLOCK. NO BODY PARTS.',
      outputGoal: 'Folded on pedestal'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 3,
      shotName: 'Wooden Hanger by Pool',
      priority: 98,
      positivePrompt: 'A single {color} {product} hanging perfectly on a premium wooden clothing hanger. In the softly blurred background, a bright turquoise swimming pool and lush tropical palm trees in strong sunlight. Beautiful summer resort lifestyle photography.',
      negativePrompt: 'human, model, flat lay, indoor, dark, messy, unironed, feet, hands, mannequin',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE HANGING ON A WOODEN HANGER OUTDOORS NEAR A POOL. NO BODY PARTS.',
      outputGoal: 'Hanger shot by pool'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 4,
      shotName: 'Tropical Props Flat Lay',
      priority: 97,
      positivePrompt: 'A single {color} {product} perfectly flat laid on a pure white, crisp studio surface. Arranged aesthetically next to it are luxury summer props: chic sunglasses, a vibrant green monstera leaf, and a neatly folded premium white linen beach towel. Bright, crisp top-down flat lay photography, e-commerce editorial style.',
      negativePrompt: 'human, model, mannequin, hanger, sand, dark background, messy composition, feet, hands',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE FLAT LAY ON WHITE BACKGROUND WITH TROPICAL/SUMMER PROPS (leaf, sunglasses, towel). NO BODY PARTS.',
      outputGoal: 'Flat lay with summer props'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 5,
      shotName: 'Resting on Wooden Sunbed',
      priority: 96,
      positivePrompt: 'A single {color} {product} laid naturally but neatly on a slatted wooden sun lounger/sunbed. In the softly blurred background, the edge of an infinity pool and a luxury resort terrace. Bright summer daylight, aspirational high-end vacation photography.',
      negativePrompt: 'human, model, mannequin, hanger, sand, studio, flat lay from directly above, feet, hands',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE PLACED ON A WOODEN SUNBED/LOUNGER OUTDOORS. NO BODY PARTS.',
      outputGoal: 'Placed on sun lounger'
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
