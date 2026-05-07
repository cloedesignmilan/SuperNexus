const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 't-shirt', isActive: true },
    select: { presentation: true, mode: true }
  });
  const unique = new Set(shots.map(s => s.mode + ' / ' + s.presentation));
  console.log("T-Shirt shots:");
  unique.forEach(u => console.log(u));
}
main().catch(console.error).finally(() => prisma.$disconnect());
