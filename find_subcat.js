const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findSubcat() {
  const subcats = await prisma.subcategory.findMany({
    where: {
      name: { contains: 'UGC' }
    },
    include: { business_mode: { include: { category: true } } }
  });
  console.log(JSON.stringify(subcats.map(s => `${s.business_mode?.category?.name} > ${s.business_mode?.name} > ${s.name}`), null, 2));
}

findSubcat().catch(console.error).finally(() => prisma.$disconnect());
