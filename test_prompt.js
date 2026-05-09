const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const configs = await prisma.promptConfigShot.findMany({
    where: { category: 't-shirt', mode: 'clean-catalog', presentation: 'no-model' }
  });
  console.log(configs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
