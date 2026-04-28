const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const modes = await prisma.businessMode.findMany({
    where: { category: { slug: 'dress' } }
  });
  console.log(modes.map(m => ({ id: m.id, name: m.name, slug: m.slug })));
}
main().finally(() => prisma.$disconnect());
