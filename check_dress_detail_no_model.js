const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDressDetailNoModel() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'detail',
      presentation: 'no-model'
    },
    orderBy: { shotNumber: 'asc' }
  });

  console.log(JSON.stringify(shots, null, 2));
}

checkDressDetailNoModel().catch(console.error).finally(() => prisma.$disconnect());
