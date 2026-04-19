const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tshirts = await prisma.businessMode.findMany({
    where: { slug: 'tshirt-brand' }
  });
  console.log(tshirts);
  const subcategories = await prisma.subcategory.findMany({
    where: { business_mode_id: tshirts[0].id }
  });
  console.log(JSON.stringify(subcategories, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
