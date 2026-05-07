const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 'dress', mode: 'clean-catalog' },
    select: { id: true, presentation: true, shotNumber: true, imageUrl: true }
  });
  console.log(shots);
}
main().catch(console.error).finally(() => prisma.$disconnect());
