const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const sub = await prisma.subcategory.findFirst({
    where: { name: 'Candid Real Woman', business_mode: { category: { slug: 'dress' } } }
  });
  console.log(sub);
}
main().finally(() => prisma.$disconnect());
