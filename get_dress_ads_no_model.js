const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getDressAdsNoModel() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'ads',
      presentation: 'no-model'
    },
    orderBy: { shotNumber: 'asc' }
  });

  console.log(JSON.stringify(shots.map(s => ({
    id: s.id,
    shotNumber: s.shotNumber,
    shotName: s.shotName,
    prompt: s.positivePrompt
  })), null, 2));
}

getDressAdsNoModel().catch(console.error).finally(() => prisma.$disconnect());
