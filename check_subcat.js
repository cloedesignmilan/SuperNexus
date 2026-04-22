const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const subcat = await prisma.subcategory.findUnique({
    where: { id: "7f943650-9d11-4128-95ef-ce851e851bfb" }
  });
  console.log(JSON.stringify(subcat, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
