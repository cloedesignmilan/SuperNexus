const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const subcat = await prisma.subcategory.findFirst({
    where: { slug: 'dynamic-engine' }
  });
  console.log("strict_reference_mode:", subcat.strict_reference_mode);
}
main().catch(console.error).finally(() => prisma.$disconnect());
