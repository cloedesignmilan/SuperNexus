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
      shotName: 'Structured Flat Lay on White Sand',
      priority: 100,
      positivePrompt: 'A single {color} {product} perfectly flat laid, entirely open, highly structured and symmetrically aligned on pristine, fine white sand. The garment must look high-end, perfectly shaped, ironed and crisp. Clean top-down view, bright sunny outdoor lighting casting distinct natural shadows.',
      negativePrompt: 'human, model, mannequin, hanger, water, messy, wrinkled, dark lighting, feet, hands, folded, crumpled',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE A PERFECT SYMMETRICAL OPEN FLAT LAY ON WHITE SAND. NO BODY PARTS.',
      outputGoal: 'Open sand flat lay'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 2,
      shotName: 'Perfectly Folded by Poolside',
      priority: 99,
      positivePrompt: 'A single {color} {product} perfectly and strictly folded into a neat, crisp square, resting on the wet, luxurious tiles of a poolside edge. Soft natural lighting with bright blue water and light reflections in the blurred background. High-end luxury fashion boutique presentation.',
      negativePrompt: 'human, model, mannequin, hanger, sand, messy folds, draped, casual, crumpled, feet, hands, flat lay open',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE STRICTLY AND PERFECTLY FOLDED INTO A SQUARE. NO DRAPING. NO BODY PARTS.',
      outputGoal: 'Perfectly folded poolside'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 3,
      shotName: 'Ghost Mannequin Studio',
      priority: 98,
      positivePrompt: 'A single {color} {product} presented as a perfect ghost mannequin shot (invisible model). The garment must be completely open, structured, and retaining its 3D worn shape, floating perfectly symmetrical against a pure optical white studio background. High-end e-commerce standard.',
      negativePrompt: 'human, real person, model, hanger, sand, flat lay, messy, unironed, feet, hands, real mannequin head, background props',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE A GHOST MANNEQUIN SHOT ON PURE WHITE BACKGROUND. THE GARMENT MUST LOOK WORN BY AN INVISIBLE PERSON.',
      outputGoal: 'Ghost mannequin'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 4,
      shotName: 'Hanging on Bamboo Ladder',
      priority: 97,
      positivePrompt: 'A single {color} {product} hanging perfectly straight and symmetrical vertically from a minimal, light-wood bamboo decorative ladder. The background is a clean, warm white plaster wall. Soft, sophisticated indoor natural lighting. E-commerce boutique style.',
      negativePrompt: 'human, model, mannequin, flat lay, sand, dark background, messy composition, feet, hands, casually draped, folded, crumpled',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE HANGING STRAIGHT ON A LADDER/RACK. NO BODY PARTS.',
      outputGoal: 'Hanging on bamboo'
    },
    {
      category: 'swimwear',
      mode: 'clean-catalog',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 5,
      shotName: 'Flat Lay on White Towel',
      priority: 96,
      positivePrompt: 'A single {color} {product} perfectly flat laid, entirely open, straight and symmetrically structured on a premium, fluffy white terry cloth beach towel. Crisp top-down view. Bright studio lighting highlighting the contrast between the garment and the towel texture.',
      negativePrompt: 'human, model, mannequin, hanger, sand, dark lighting, flat lay from an angle, feet, hands, messy, folded',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE PERFECTLY FLAT LAID AND OPEN ON A WHITE TOWEL. NO BODY PARTS.',
      outputGoal: 'Open flat lay on towel'
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
