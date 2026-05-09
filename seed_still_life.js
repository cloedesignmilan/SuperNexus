const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shots = [
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'still-life-pack',
      shotNumber: 1,
      shotName: 'Hanger Shot',
      positivePrompt: 'A single {color} {product} hanging on a minimal wooden hanger. Clean white studio background, premium fashion photography, highly detailed fabric texture.',
      negativePrompt: 'human, model, body, mannequin, messy background, text, watermark',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE HANGING ON A HANGER. Maintain perfectly the original {graphic_description}.',
      outputGoal: 'Hanger presentation'
    },
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'still-life-pack',
      shotNumber: 2,
      shotName: 'Perfect Flat Lay',
      positivePrompt: 'A single {color} {product}, perfect symmetrical front flat lay. Perfectly smooth, ironed, no wrinkles. Clean studio background, top-down view, highly detailed.',
      negativePrompt: 'human, model, hanger, mannequin, wrinkles, messy, text',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE A PERFECT FLAT LAY. Maintain perfectly the original {graphic_description}.',
      outputGoal: 'Clean Flat Lay'
    },
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'still-life-pack',
      shotNumber: 3,
      shotName: 'Folded Square',
      positivePrompt: 'A single {color} {product}, neatly folded into a perfect square. Top-down flat lay view, clean studio background, minimalist fashion photography. Focus on the fabric fold lines.',
      negativePrompt: 'human, model, hanger, mannequin, messy, unironed',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE FOLDED. If it is a back view, it MUST be a solid {color} with no graphics unless a back print is uploaded.',
      outputGoal: 'Folded Presentation'
    },
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'still-life-pack',
      shotNumber: 4,
      shotName: 'Dynamic Wrinkles',
      positivePrompt: 'A single {color} {product}, dynamic front flat lay. Natural, stylish wrinkles and scrunched fabric, messy aesthetic but premium. Clean studio background, highly detailed folds.',
      negativePrompt: 'human, model, hanger, mannequin, perfectly ironed, stiff, flat',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST SHOW DYNAMIC FOLDS/WRINKLES. Maintain perfectly the original {graphic_description}.',
      outputGoal: 'Dynamic Flat Lay'
    },
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'still-life-pack',
      shotNumber: 5,
      shotName: 'Folded Stack',
      positivePrompt: 'A neat stack of multiple folded {color} {product}s on a white table. Premium boutique display, side angle view, highly detailed, soft studio lighting.',
      negativePrompt: 'human, model, hanger, mannequin, messy stack, single item',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST SHOW A STACK OF MULTIPLE SHIRTS. Maintain perfectly the original {graphic_description}.',
      outputGoal: 'Stack of folded shirts'
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

main().catch(console.error).finally(() => prisma.$disconnect());
