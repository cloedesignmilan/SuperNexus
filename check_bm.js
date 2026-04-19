const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const modes = await prisma.businessMode.findMany();
  console.log(JSON.stringify(modes.map(m => m.name), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
