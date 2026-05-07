const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const check = await prisma.outputValidationCheck.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { subcategory: { include: { business_mode: { include: { category: true } } } } }
  });
  console.log(JSON.stringify(check, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
