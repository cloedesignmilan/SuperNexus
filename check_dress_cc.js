const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDressCleanCatalog() {
  const shots = await prisma.promptConfigShot.findMany({
    where: {
      category: 'dress',
      mode: 'clean-catalog'
    },
    select: { id: true, presentation: true, shotNumber: true }
  });
  console.log(shots);
}
checkDressCleanCatalog().catch(console.error).finally(() => prisma.$disconnect());
