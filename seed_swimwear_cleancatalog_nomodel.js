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
      positivePrompt: 'A single {color} {product} perfectly flat laid on pristine white sand. Clean top-down view, bright sunny outdoor lighting casting soft natural shadows. Premium minimalist summer aesthetic.',
      negativePrompt: 'human, model, mannequin, hanger, water, messy, wrinkled, dark lighting',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE A FLAT LAY ON WHITE SAND. TOP-DOWN VIEW.',
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
      positivePrompt: 'A single {color} {product} neatly folded and resting on a clean, minimal beige stone block/pedestal. Soft natural studio lighting, elegant shadows, neutral plaster background. High-end luxury boutique presentation.',
      negativePrompt: 'human, model, mannequin, hanger, sand, water, messy folds, bright colors in background',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE NEATLY FOLDED ON A STONE PEDESTAL/BLOCK.',
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
      positivePrompt: 'A single {color} {product} hanging perfectly on a wooden hanger suspended from a wooden clothing rack. In the softly blurred background, a bright blue swimming pool and tropical palm trees in strong sunlight. Summer resort lifestyle photography.',
      negativePrompt: 'human, model, flat lay, indoor, dark, messy, unironed',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE HANGING ON A WOODEN HANGER OUTDOORS NEAR A POOL.',
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
      positivePrompt: 'A single {color} {product} perfectly flat laid on a pure white studio surface. Arranged aesthetically next to it are summer props: a green monstera leaf, a pair of sunglasses, and a neatly folded linen shirt. Bright, crisp top-down flat lay photography, e-commerce editorial style.',
      negativePrompt: 'human, model, mannequin, hanger, sand, dark background, messy composition',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE FLAT LAY ON WHITE BACKGROUND WITH TROPICAL/SUMMER PROPS (leaf, sunglasses).',
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
      positivePrompt: 'A single {color} {product} laid naturally but neatly on a slatted wooden sunbed/lounger. In the softly blurred background, the edge of a swimming pool and luxury resort terrace. Bright summer daylight, aspirational vacation photography.',
      negativePrompt: 'human, model, mannequin, hanger, sand, studio, flat lay from directly above',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE PLACED ON A WOODEN SUNBED/LOUNGER OUTDOORS.',
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
