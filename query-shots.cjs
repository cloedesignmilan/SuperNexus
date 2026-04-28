const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 'dress', mode: 'detail', presentation: 'model-photo' }
  });
  console.log(shots.length);
}
main().finally(() => prisma.$disconnect());
