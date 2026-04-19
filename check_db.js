const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subcats = await prisma.subcategory.findMany({ include: { business_mode: true } });
  console.log(JSON.stringify(subcats.map(s => ({
    name: s.name,
    business_mode: s.business_mode.name
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
