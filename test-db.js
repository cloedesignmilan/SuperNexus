const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 'swimwear' },
    select: { shotNumber: true, shotName: true, imageUrl: true }
  });
  console.log(shots);
}
main().catch(console.error).finally(() => prisma.$disconnect());
