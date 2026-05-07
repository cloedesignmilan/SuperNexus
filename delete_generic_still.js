const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const deleted = await prisma.promptConfigShot.deleteMany({
    where: { presentation: 'still-life-pack' }
  });
  console.log(`Deleted ${deleted.count} generic still-life-pack shots.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
