const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.promptConfigShot.findMany({
    where: { category: 't-shirt', mode: 'clean-catalog', presentation: 'no-model' },
    orderBy: { shotNumber: 'asc' }
  });
  console.log(`Found ${configs.length} configs for no-model`);
  configs.forEach(c => console.log(c.shotNumber, c.shotName));
}

main().catch(console.error).finally(() => prisma.$disconnect());
