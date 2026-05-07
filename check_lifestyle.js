const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 'shoes', mode: 'lifestyle', presentation: 'model-photo-woman' },
    select: { id: true, shotNumber: true, isActive: true, scene: true }
  });
  console.log(shots);
}
main().catch(console.error).finally(() => prisma.$disconnect());
