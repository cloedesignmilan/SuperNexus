const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const modes = await prisma.businessMode.findMany({ include: { category: true } });
  console.log(JSON.stringify(modes.map(m => ({ id: m.id, name: m.name, category: m.category.name })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
