const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subcat = await prisma.subcategory.findFirst({
    where: { name: 'Street Style' }
  });
  console.log(JSON.stringify(subcat, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
