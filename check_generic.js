const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shots = await prisma.promptConfigShot.findMany({
    where: { presentation: 'model-photo' },
    select: { id: true, category: true, mode: true }
  });
  const categories = [...new Set(shots.map(s => s.category + " > " + s.mode))];
  console.log("Categories with generic 'model-photo':", categories);
}
main().catch(console.error).finally(() => prisma.$disconnect());
