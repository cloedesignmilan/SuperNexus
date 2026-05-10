const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedShoesCleanCatalogNoModel() {
  const shots = [
    {
      category: 'shoes',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 1,
      shotName: '3/4 Front Hero',
      priority: 100,
      positivePrompt: "A single {color} {product}. Clean 3/4 front view showing the outer side, toe box, and laces. Shot perfectly at product level. Pure white studio background, soft even lighting, soft floor shadow. Professional e-commerce footwear photography.",
      negativePrompt: "human, model, foot, leg, pair, two shoes, messy background, dark lighting, top-down view, back view",
      hardRules: "STRICTLY NO HUMAN MODEL. MUST SHOW ONLY ONE SHOE. EXACT 3/4 FRONT ANGLE.",
      outputGoal: "3/4 Front view"
    },
    {
      category: 'shoes',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 2,
      shotName: 'True Profile Side',
      priority: 99,
      positivePrompt: "A single {color} {product}. Perfect true profile side view showing the entire outer side silhouette. Shot perfectly straight on at product level. Pure white studio background, soft even lighting, soft floor shadow. High-end e-commerce footwear photography.",
      negativePrompt: "human, model, foot, leg, pair, two shoes, angled, 3/4 view, top-down view, messy background",
      hardRules: "STRICTLY NO HUMAN MODEL. MUST SHOW ONLY ONE SHOE. EXACT FLAT SIDE PROFILE ANGLE.",
      outputGoal: "Perfect side profile"
    },
    {
      category: 'shoes',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 3,
      shotName: 'Top-Down View',
      priority: 98,
      positivePrompt: "A single {color} {product}. Perfect top-down bird's-eye view, looking directly down at the laces, tongue, and toe box. Pure white studio background, soft even lighting, subtle drop shadow. Professional e-commerce footwear photography.",
      negativePrompt: "human, model, foot, leg, pair, two shoes, side view, front level view, messy background",
      hardRules: "STRICTLY NO HUMAN MODEL. MUST SHOW ONLY ONE SHOE. EXACT TOP-DOWN BIRD'S EYE VIEW.",
      outputGoal: "Top-down view"
    },
    {
      category: 'shoes',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 4,
      shotName: 'True Back Heel',
      priority: 97,
      positivePrompt: "A single {color} {product}. Perfect true back view focusing on the heel and back collar. Shot straight on at product level. Pure white studio background, soft even lighting, soft floor shadow. Professional e-commerce footwear photography.",
      negativePrompt: "human, model, foot, leg, pair, two shoes, side view, front view, top-down view, messy background",
      hardRules: "STRICTLY NO HUMAN MODEL. MUST SHOW ONLY ONE SHOE. EXACT BACK HEEL VIEW.",
      outputGoal: "Back heel view"
    },
    {
      category: 'shoes',
      mode: 'clean-catalog',
      presentation: 'no-model',
      shotNumber: 5,
      shotName: 'Macro Texture Detail',
      priority: 96,
      positivePrompt: "A single {color} {product}. Extreme macro close-up detail shot focusing tightly on the side panel logo, material texture, and laces. Ultra sharp focus, soft lighting. Pure white studio background. High-end footwear editorial detail.",
      negativePrompt: "human, model, foot, leg, full shoe, whole shoe, distant, messy background, blurry",
      hardRules: "STRICTLY NO HUMAN MODEL. MUST BE AN EXTREME CLOSE-UP DETAIL SHOT.",
      outputGoal: "Macro detail shot"
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
    } else {
      await prisma.promptConfigShot.create({
        data: s
      });
      console.log(`Created shot ${s.shotNumber}`);
    }
  }
}

seedShoesCleanCatalogNoModel().catch(console.error).finally(() => prisma.$disconnect());
