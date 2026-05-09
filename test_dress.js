const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.promptConfigShot.findMany({
    where: { category: 'dress', mode: 'elegant' },
    orderBy: [ { presentation: 'asc' }, { shotNumber: 'asc' } ]
  });
  
  const grouped = {};
  for (const c of configs) {
    if (!grouped[c.presentation]) grouped[c.presentation] = 0;
    grouped[c.presentation]++;
  }

  console.log(`Found ${configs.length} total configs for dress/elegant`);
  console.log("Breakdown by presentation:", grouped);
}

main().catch(console.error).finally(() => prisma.$disconnect());
