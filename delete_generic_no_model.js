const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const deleted = await prisma.promptConfigShot.deleteMany({
    where: { presentation: 'no-model' }
  });
  console.log(`Deleted ${deleted.count} generic no-model shots.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
