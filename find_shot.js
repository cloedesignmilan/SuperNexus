const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findShot() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 't-shirt',
      mode: 'ugc',
      shotNumber: 2
    }
  });
  console.log(JSON.stringify(shots, null, 2));
}

findShot().catch(console.error).finally(() => prisma.$disconnect());
