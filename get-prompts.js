const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const configs = await prisma.promptConfigShot.findMany({
    select: { category: true, mode: true, presentation: true }
  });
  console.log(JSON.stringify(configs, null, 2));
}
run().finally(() => prisma.$disconnect());
