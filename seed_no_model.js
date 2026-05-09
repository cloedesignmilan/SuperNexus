const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shots = [
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 1,
      shotName: 'Ghost Mannequin Front',
      positivePrompt: 'A single {color} {product}, perfect ghost mannequin front view. Clean white studio background, premium fashion eCommerce photography, highly detailed, perfectly symmetrical.',
      negativePrompt: 'human, model, body, flat lay, hanger, messy background, text, watermark',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE GHOST MANNEQUIN EFFECT (worn by invisible model). Maintain perfectly the original {graphic_description}.',
      outputGoal: 'Ghost mannequin front presentation'
    },
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 2,
      shotName: 'Ghost Mannequin Back',
      positivePrompt: 'A single {color} {product}, perfect ghost mannequin back view. Clean white studio background, premium fashion eCommerce photography. If no back print is uploaded, the back must be perfectly solid {color} with no graphics.',
      negativePrompt: 'human, model, body, flat lay, hanger, front print, graphics on back',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE BACK VIEW. If it is a back view, it MUST be a solid {color} with no graphics unless a back print is uploaded.',
      outputGoal: 'Ghost mannequin back presentation'
    },
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 3,
      shotName: '3/4 Side Angle',
      positivePrompt: 'A single {color} {product}, ghost mannequin 3/4 side angle view. Clean white studio background, showing the side profile and depth of the garment. High end fashion lighting.',
      negativePrompt: 'human, model, body, flat lay, hanger, messy, unironed',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE 3/4 SIDE ANGLE VIEW. Maintain perfectly the original {graphic_description}.',
      outputGoal: 'Side angle presentation'
    },
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 4,
      shotName: 'Clothes Rack',
      positivePrompt: 'A single {color} {product} hanging on a hanger on a clothes rack. In the background, softly blurred out of focus, there are other clothes hanging. Premium boutique aesthetic, high end editorial photography.',
      negativePrompt: 'human, model, ghost mannequin, flat lay, mannequin, perfectly ironed, stiff, flat, completely empty background',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE HANGING ON A RACK WITH BLURRED CLOTHES IN BACKGROUND. Maintain perfectly the original {graphic_description}.',
      outputGoal: 'Hanger rack presentation'
    },
    {
      category: 't-shirt',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 5,
      shotName: 'Macro Detail',
      positivePrompt: 'Extreme close-up macro detail shot of the {color} {product} fabric and print. Focus on the material texture and the graphic. Cinematic studio lighting, ultra sharp focus on the garment details.',
      negativePrompt: 'human, model, hanger, mannequin, full body, whole shirt',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE A CLOSE-UP MACRO SHOT. Maintain perfectly the original {graphic_description}.',
      outputGoal: 'Close-up texture detail'
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
