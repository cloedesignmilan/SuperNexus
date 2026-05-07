const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const sub = await prisma.subcategory.findUnique({
    where: { id: "87d91169-a9a3-42be-98ac-6bf05cd9e0f7" },
    include: { business_mode: { include: { category: true } } }
  });
  console.log(JSON.stringify(sub, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
