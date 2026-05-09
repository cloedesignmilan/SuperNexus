const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.promptConfigShot.findMany({
    where: { category: 'dress' }
  });
  console.log(`Found ${configs.length} total configs for dress`);
  if (configs.length > 0) {
    console.log("Modes:", [...new Set(configs.map(c => c.mode))]);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
