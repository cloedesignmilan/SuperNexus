const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDressAdsNoModelShot5() {
  const shot = await prisma.promptConfigShot.findFirst({
    where: {
      category: 'dress',
      mode: 'ads',
      presentation: 'no-model',
      shotNumber: 5
    }
  });

  if (!shot) {
    console.log("No shot found for Dress > Ads > No Model > Shot 5");
    return;
  }

  await prisma.promptConfigShot.update({
    where: { id: shot.id },
    data: {
      shotName: 'Crystal Shatter Explosion',
      positivePrompt: 'A single {color} {product} frozen inside a massive, pristine geometric crystal block. The crystal is dramatically shattering and exploding outwards into thousands of glowing, sharp glass shards. The garment remains perfect and undamaged in the center. Hyper-realistic surreal luxury fashion advertisement, high-contrast cinematic lighting.',
      negativePrompt: 'human, model, mannequin, body, hanger, liquid, water, fire, plain background, low quality',
      hardRules: 'STRICTLY NO HUMAN MODEL. MUST FEATURE EXPLODING CRYSTAL/GLASS SHATTERING EFFECT AROUND THE GARMENT.',
      outputGoal: 'Crystal shatter surreal ad'
    }
  });

  console.log(`Updated Shot 5 (Ads No Model) - ID: ${shot.id} with Crystal Shatter effect`);
}

updateDressAdsNoModelShot5().catch(console.error).finally(() => prisma.$disconnect());
