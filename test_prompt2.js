const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const configs = await prisma.promptConfigShot.findMany({
    where: { category: 't-shirt', mode: 'clean-catalog', presentation: 'still-life-pack' }
  });
  console.log(configs[0]);
}
main().catch(console.error).finally(() => prisma.$disconnect());
