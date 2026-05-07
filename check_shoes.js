const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const modes = await prisma.businessMode.findMany({
    where: { category: { slug: 'shoes' } },
    include: { subcategories: true }
  });
  modes.forEach(m => {
    console.log(m.name);
    m.subcategories.forEach(s => console.log('  - ' + s.name));
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
