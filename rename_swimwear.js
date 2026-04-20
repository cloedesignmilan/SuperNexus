const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.businessMode.updateMany({
    where: { slug: { in: ['bm-swimwear-women', 'bm-swimwear-men'] } },
    data: { name: 'Swimwear (Costumi)' }
  });
  console.log("Renamed Swimwear business modes to 'Swimwear (Costumi)'");
}

main().catch(console.error).finally(() => prisma.$disconnect());
