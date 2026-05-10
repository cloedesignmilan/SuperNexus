const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findDressDetailShot() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'detail',
      shotNumber: 1
    }
  });

  console.log(JSON.stringify(shots.map(s => ({
    id: s.id,
    mode: s.mode,
    presentation: s.presentation,
    shotName: s.shotName
  })), null, 2));
}

findDressDetailShot().catch(console.error).finally(() => prisma.$disconnect());
