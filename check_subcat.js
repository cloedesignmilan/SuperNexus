const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const sub = await prisma.subcategory.findUnique({
    where: { id: '2ab39b69-5c8f-4e83-bb1c-1c6caaed8197' },
    include: { business_mode: { include: { category: true } } }
  });
  console.log(sub.business_mode.category.name, ">", sub.business_mode.name, ">", sub.name);
}
main().catch(console.error).finally(() => prisma.$disconnect());
