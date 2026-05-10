const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findShot() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 't-shirt',
      mode: { contains: 'ugc' },
      shotNumber: 2
    }
  });
  console.log(JSON.stringify(shots.map(s => ({ id: s.id, mode: s.mode, presentation: s.presentation, shotName: s.shotName })), null, 2));
}

findShot().catch(console.error).finally(() => prisma.$disconnect());
