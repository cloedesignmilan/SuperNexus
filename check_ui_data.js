const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { category: 't-shirt', mode: 'model-studio', isActive: true },
    orderBy: { shotNumber: 'asc' }
  });
  console.log("All model-studio shots for T-Shirt:");
  shots.forEach(s => console.log(`${s.id} | ${s.presentation} | Shot ${s.shotNumber} | URL: ${s.imageUrl ? 'YES' : 'NO'}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
