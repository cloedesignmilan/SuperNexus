const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reviseSwimwearCleanCatalogNoModel() {
  const shots = [
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 1,
      shotName: 'Flat Lay on Sand',
      priority: 100,
      positivePrompt: 'A single {color} {product} perfectly flat laid on fine, pristine beach sand. Clean top-down view, perfect symmetry. Soft, natural sunlight casting gentle shadows. High-end e-commerce presentation.',
      negativePrompt: 'human, model, mannequin, hanger, water, messy, wrinkled, dark lighting, props',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE A PERFECT FLAT LAY ON SAND. TOP-DOWN VIEW.',
      outputGoal: 'Clean sand flat lay'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 2,
      shotName: 'On Stone Pedestal',
      priority: 99,
      positivePrompt: 'A single {color} {product} beautifully arranged and resting flat on a clean, minimal beige square stone pedestal/block. Soft natural studio lighting, elegant shadows, neutral beige plaster background. High-end luxury boutique presentation.',
      negativePrompt: 'human, model, mannequin, hanger, sand, water, messy, bright colors in background',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE NEATLY ARRANGED ON A SQUARE STONE PEDESTAL/BLOCK.',
      outputGoal: 'Arranged on stone pedestal'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 3,
      shotName: 'Hanging on Rustic Wooden Ladder',
      priority: 98,
      positivePrompt: 'A single {color} {product} hanging elegantly on the rungs of a rustic, weathered wooden ladder. The ladder is leaning against a textured neutral wall outdoors in a luxury resort. Softly blurred background with hints of palm trees and a pool. Natural daylight.',
      negativePrompt: 'human, model, mannequin, flat lay, indoor, dark, messy, hanger',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE HANGING ON A RUSTIC WOODEN LADDER OUTDOORS.',
      outputGoal: 'Hanging on wooden ladder'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 4,
      shotName: 'Resting on Wooden Sunbed',
      priority: 97,
      positivePrompt: 'A single {color} {product} laid naturally but neatly flat on a slatted wooden sunbed/lounger. In the background, the edge of a bright blue swimming pool and luxury resort terrace are softly out of focus. Bright summer daylight, aspirational vacation photography.',
      negativePrompt: 'human, model, mannequin, hanger, sand, studio, flat lay from directly above',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE PLACED ON A SLATTED WOODEN SUNBED/LOUNGER OUTDOORS NEAR A POOL.',
      outputGoal: 'Laid on wooden sunbed'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 5,
      shotName: 'Angled Close-Up on Sand',
      priority: 96,
      positivePrompt: 'A single {color} {product} laid on fine beach sand. Dynamic, slightly angled close-up shot focusing on the texture and details of the fabric. Soft natural sunlight. Cinematic, high-end editorial detail shot.',
      negativePrompt: 'human, model, mannequin, hanger, water, studio, pedestal, perfectly straight top-down',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE AN ANGLED CLOSE-UP SHOT ON SAND SHOWING FABRIC DETAILS.',
      outputGoal: 'Angled close-up on sand'
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
        data: {
          shotName: s.shotName,
          priority: s.priority,
          positivePrompt: s.positivePrompt,
          negativePrompt: s.negativePrompt,
          hardRules: s.hardRules,
          outputGoal: s.outputGoal
        }
      });
      console.log(`Updated shot ${s.shotNumber}`);
    }
  }
}

reviseSwimwearCleanCatalogNoModel().catch(console.error).finally(() => prisma.$disconnect());
