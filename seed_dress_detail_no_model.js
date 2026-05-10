const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDressDetailNoModel() {
  const shots = [
    {
      category: 'dress',
      mode: 'detail',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 1,
      shotName: 'Artisan Touch Detail',
      priority: 100,
      positivePrompt: 'Extreme close-up macro photography of {color} {product} fabric. A tailor\'s hand holding precision tweezers adjusting the edge of the lapel/fabric. Strong natural sunlight, sharp shadows, conveying premium craftsmanship and sartorial detail. High-end fashion editorial texture shot.',
      negativePrompt: 'full body, hanger, floating, messy, dark lighting, flat lighting',
      hardRules: 'MUST FEATURE ARTISAN HAND/TWEEZERS ADJUSTING FABRIC. CLOSE-UP DETAIL ONLY. NO FULL BODY.',
      outputGoal: 'Sartorial craftsmanship detail'
    },
    {
      category: 'dress',
      mode: 'detail',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 2,
      shotName: 'Outdoor Ghost Mannequin Detail',
      priority: 99,
      positivePrompt: 'Close-up of the chest, lapel, and pocket of a {color} {product} on an invisible ghost mannequin. Shot outdoors in bright, warm natural sunlight with soft bokeh background of green foliage. Sharp focus on the fabric texture, seams, and pocket square. Luxury lifestyle photography.',
      negativePrompt: 'human, model, flat lay, indoor, studio, full body, head',
      hardRules: 'STRICTLY NO HUMAN MODEL. OUTDOOR SUNLIGHT LIGHTING. CLOSE-UP ON CHEST/LAPEL.',
      outputGoal: 'Outdoor chest detail'
    },
    {
      category: 'dress',
      mode: 'detail',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 3,
      shotName: 'Sunlight Flat Lay Detail',
      priority: 98,
      positivePrompt: 'Close-up flat lay photography of {color} {product} fabric resting on a surface. Focus on the button, lapel, and stitching. Strong direct sunlight casting sharp, elegant shadows that highlight the premium weave of the material. Minimalist outdoor luxury aesthetic.',
      negativePrompt: 'human, model, mannequin, full body, indoor, dark, low contrast',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE FLAT LAY CLOSE-UP IN STRONG SUNLIGHT. FOCUS ON BUTTON/FABRIC.',
      outputGoal: 'Flat lay texture detail'
    },
    {
      category: 'dress',
      mode: 'detail',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 4,
      shotName: 'Swirled Fabric Macro',
      priority: 97,
      positivePrompt: 'Extreme macro close-up of {color} {product} fabric. The fabric is elegantly swirled and twisted into a beautiful circular pattern, filling the entire frame. Strong directional sunlight highlighting the premium weave, fiber quality, and depth. No other objects visible.',
      negativePrompt: 'human, model, mannequin, hanger, buttons, collar, background, zoom out',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE ONLY FABRIC SWIRLED/TWISTED FILLING THE FRAME. EXTREME MACRO.',
      outputGoal: 'Swirled fabric texture'
    },
    {
      category: 'dress',
      mode: 'detail',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 5,
      shotName: 'Dramatic Angle Lapel Detail',
      priority: 96,
      positivePrompt: 'Extreme close-up shot from a dramatic low angle focusing on the lapel edge and button of a {color} {product}. Shot outdoors in bright, high-contrast sunlight with a blurred stone/outdoor background. Ultra-sharp focus on the fabric weave and structure, conveying absolute luxury.',
      negativePrompt: 'human, model, flat lay, indoor, studio, full body, soft lighting',
      hardRules: 'STRICTLY NO HUMAN MODEL. DRAMATIC ANGLE MACRO DETAIL. STRONG OUTDOOR SUNLIGHT.',
      outputGoal: 'Dramatic angle button detail'
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

seedDressDetailNoModel().catch(console.error).finally(() => prisma.$disconnect());
