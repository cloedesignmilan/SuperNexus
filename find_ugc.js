const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findShots() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 't-shirt',
      mode: 'ugc'
    },
    select: { id: true, category: true, mode: true, scene: true, shotNumber: true, shotName: true }
  });
  console.log(shots);
}

findShots().catch(console.error).finally(() => prisma.$disconnect());
