const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const subcats = await prisma.subcategory.findMany({
    where: { business_mode: { name: 'UGC', category: { slug: 'dress' } } }
  });
  console.log(subcats.map(s => ({ id: s.id, name: s.name, slug: s.slug })));
}
main().finally(() => prisma.$disconnect());
