const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.promptConfigShot.findMany({
    where: { category: 't-shirt', mode: 'clean-catalog', presentation: 'still-life-pack' },
    orderBy: { shotNumber: 'asc' }
  });
  console.log(`Found ${configs.length} configs for still-life-pack`);
  configs.forEach(c => console.log(c.shotNumber, c.shotName));
}

main().catch(console.error).finally(() => prisma.$disconnect());
