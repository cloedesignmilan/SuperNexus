const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDressAdsNoModel() {
  const shots = [
    {
      category: 'dress',
      mode: 'ads',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 1,
      shotName: 'Sleek Dark Void Reflection',
      priority: 100,
      positivePrompt: 'A single {color} {product} floating elegantly in mid-air inside a sleek, premium dark void. Underneath the garment, there is a perfect mirror reflection on a glossy black floor. Cinematic studio lighting, ultra-high end luxury fashion advertisement, clean and minimal composition. The garment structure remains perfect.',
      negativePrompt: 'human, model, mannequin, body, hanger, messy background, bright sunlight, outdoors',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE FLOATING. MUST HAVE GLOSSY REFLECTION.',
      outputGoal: 'Floating luxury reflection'
    },
    {
      category: 'dress',
      mode: 'ads',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 2,
      shotName: 'Fiery Sparks Dissolve',
      priority: 99,
      positivePrompt: 'A single {color} {product} floating in mid-air against a dramatic sunset background. The lower part of the garment is magically dissolving into glowing golden fire sparks and magical embers flying into the air. Cinematic lighting, highly dynamic scroll-stopping advertisement, surreal magic effect.',
      negativePrompt: 'human, model, mannequin, body, hanger, boring background, studio',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE DISSOLVING INTO FIRE SPARKS.',
      outputGoal: 'Fire sparks disintegration'
    },
    {
      category: 'dress',
      mode: 'ads',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 3,
      shotName: 'Digital Wireframe Matrix',
      priority: 98,
      positivePrompt: 'A single {color} {product} floating in mid-air in a futuristic high-tech lab or dark digital space. Half of the garment is realistically rendered, while the other half is dissolving into a glowing neon wireframe and digital grid. Cyberpunk luxury aesthetic, ultra-modern fashion tech advertisement.',
      negativePrompt: 'human, model, mannequin, body, hanger, daytime, nature, fire',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST FEATURE DIGITAL WIREFRAME/HOLOGRAM EFFECT.',
      outputGoal: 'Digital wireframe dissolve'
    },
    {
      category: 'dress',
      mode: 'ads',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 4,
      shotName: 'Modern Glass Elevator',
      priority: 97,
      positivePrompt: 'A single {color} {product} floating magically in mid-air inside a sleek, futuristic glass elevator or luxury showroom box. Metallic walls, bright premium LED lighting. The garment floats gracefully without a hanger, maintaining its perfect shape. High-end luxury window display aesthetic.',
      negativePrompt: 'human, model, mannequin, body, hanger, dark void, messy, outdoor',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST BE FLOATING INSIDE A GLASS/METALLIC BOX OR ELEVATOR.',
      outputGoal: 'Floating in glass elevator'
    },
    {
      category: 'dress',
      mode: 'ads',
      presentation: 'no-model',
      scene: 'all',
      shotNumber: 5,
      shotName: 'Liquid Gold Splash',
      priority: 96,
      positivePrompt: 'A single {color} {product} floating in mid-air, dramatically exploding into a massive splash of liquid gold and silk fabric flying around it. Pure black studio background, high contrast cinematic lighting, hyper-realistic physics, premium fashion fragrance commercial style.',
      negativePrompt: 'human, model, mannequin, body, hanger, daytime, nature, wireframe',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST FEATURE LIQUID SPLASH/EXPLOSION EFFECT.',
      outputGoal: 'Liquid luxury splash'
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

seedDressAdsNoModel().catch(console.error).finally(() => prisma.$disconnect());
