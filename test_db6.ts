import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bms = await prisma.businessMode.findMany({
    where: { name: 'Candid' }
  });
  console.log("Business modes named Candid:");
  bms.forEach(b => console.log(`- ${b.name}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
