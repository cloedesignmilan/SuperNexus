const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findFirst({
    where: { slug: 'dress' },
    include: { business_modes: true }
  });
  console.log("Dress modes:", category?.business_modes.map(bm => bm.name + ' (' + bm.slug + ')'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
