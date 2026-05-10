const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getDressAds() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'ads',
    },
    select: { id: true, presentation: true, shotNumber: true, shotName: true }
  });

  console.log(shots);
}

getDressAds().catch(console.error).finally(() => prisma.$disconnect());
