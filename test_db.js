const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const modes = await prisma.businessMode.findMany({
    where: { name: 'Clean Catalog' },
    include: { subcategories: true }
  });
  console.log(JSON.stringify(modes, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
